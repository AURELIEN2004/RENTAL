# ============================================
# 📁 apps/recherche/views.py
# ============================================
"""
Vues pour le module de recherche intelligente
Compatible avec la structure ViewSet existante
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.db.models import Q, Avg, Min, Max, Count

from apps.housing.models import Housing
from apps.housing.serializers import HousingListSerializer
from .serializers import (
    SearchResultSerializer,
    SearchStatsSerializer,
    NearbySearchSerializer,
    SmartSearchSerializer
)
from .utils import haversine, validate_coordinates, get_distance_category
from .scoring import compute_score, score_distance, compute_smart_score


class HousingSearchAPIView(APIView):
    """
    🔍 Recherche textuelle libre + Filtres structurés
    
    Query params:
        - query: Recherche textuelle libre
        - category: ID de catégorie
        - region: Nom de région
        - city: Nom de ville
        - district: Nom de quartier
        - min_price: Prix minimum
        - max_price: Prix maximum
        - min_rooms: Nombre de chambres minimum
        - min_area: Superficie minimum
        - status: disponible/reserve/occupe
    """
    permission_classes = [AllowAny]
    
    def get(self, request):
        # Base queryset
        queryset = Housing.objects.filter(
            is_visible=True,
            status='disponible'
        ).select_related(
            'owner', 'category', 'housing_type', 'region', 'city', 'district'
        ).prefetch_related('images')
        
        # 🔍 RECHERCHE TEXTUELLE LIBRE
        query = request.query_params.get('query', '').strip()
        if query:
            queryset = queryset.filter(
                Q(title__icontains=query) |
                Q(description__icontains=query) |
                Q(city__name__icontains=query) |
                Q(district__name__icontains=query) |
                Q(category__name__icontains=query) |
                Q(additional_features__icontains=query)
            )
        
        # 🔧 FILTRES STRUCTURÉS
        category = request.query_params.get('category')
        city = request.query_params.get('city')
        district = request.query_params.get('district')
        min_price = request.query_params.get('min_price')
        max_price = request.query_params.get('max_price')
        min_rooms = request.query_params.get('min_rooms')
        min_area = request.query_params.get('min_area')
        status_filter = request.query_params.get('status')
        
        if category:
            queryset = queryset.filter(category_id=category)
        if city:
            queryset = queryset.filter(city__name__icontains=city)
        if district:
            queryset = queryset.filter(district__name__icontains=district)
        if min_price:
            queryset = queryset.filter(price__gte=min_price)
        if max_price:
            queryset = queryset.filter(price__lte=max_price)
        if min_rooms:
            queryset = queryset.filter(rooms__gte=min_rooms)
        if min_area:
            queryset = queryset.filter(area__gte=min_area)
        if status_filter in ['disponible', 'reserve', 'occupe']:
            queryset = queryset.filter(status=status_filter)
        
        # 📊 STATISTIQUES
        stats = {
            'total_results': queryset.count(),
            'avg_price': queryset.aggregate(Avg('price'))['price__avg'] or 0,
            'min_price': queryset.aggregate(Min('price'))['price__min'] or 0,
            'max_price': queryset.aggregate(Max('price'))['price__max'] or 0,
            'avg_area': queryset.aggregate(Avg('area'))['area__avg'] or 0,
        }
        
        # Tri
        sort_by = request.query_params.get('sortBy', 'recent')
        sorting_map = {
            'recent': '-created_at',
            'price_asc': 'price',
            'price_desc': '-price',
            'area_asc': 'area',
            'area_desc': '-area',
            'popular': '-views_count',
        }
        queryset = queryset.order_by(sorting_map.get(sort_by, '-created_at'))
        
        # Pagination
        page_size = 20
        page = int(request.query_params.get('page', 1))
        start = (page - 1) * page_size
        end = start + page_size
        
        paginated = queryset[start:end]
        
        serializer = HousingListSerializer(
            paginated,
            many=True,
            context={'request': request}
        )
        
        return Response({
            'count': queryset.count(),
            'stats': stats,
            'results': serializer.data
        })


class NearbyHousingAPIView(APIView):
    """
    📍 Recherche "Près de moi"
    Trouve les logements dans un rayon donné
    
    Query params:
        - lat: Latitude (requis)
        - lng: Longitude (requis)
        - radius: Rayon en km (défaut: 5)
        - max_results: Nombre max de résultats (défaut: 20)
    """
    permission_classes = [AllowAny]
    
    def get(self, request):
        # Validation
        serializer = NearbySearchSerializer(data=request.query_params)
        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )
        
        data = serializer.validated_data
        lat = data['lat']
        lng = data['lng']
        radius = data.get('radius', 5.0)
        max_results = data.get('max_results', 20)
        
        # Récupérer tous les logements avec coordonnées
        housings = Housing.objects.filter(
            is_visible=True,
            status='disponible',
            latitude__isnull=False,
            longitude__isnull=False
        ).select_related(
            'owner', 'category', 'housing_type', 'city', 'district'
        ).prefetch_related('images')
        
        # Calculer distances
        results = []
        for housing in housings:
            distance = haversine(lat, lng, housing.latitude, housing.longitude)
            if distance <= radius:
                housing.distance = round(distance, 2)
                housing.distance_category = get_distance_category(distance)
                results.append(housing)
        
        # Trier par distance
        results.sort(key=lambda x: x.distance)
        results = results[:max_results]
        
        # Sérialiser
        serializer = SearchResultSerializer(
            results,
            many=True,
            context={'request': request}
        )
        
        # Enrichir avec distance
        data = serializer.data
        for i, housing in enumerate(results):
            data[i]['distance'] = housing.distance
            data[i]['distance_category'] = housing.distance_category
        
        return Response({
            'count': len(results),
            'search_center': {'lat': lat, 'lng': lng},
            'radius_km': radius,
            'results': data
        })


class SmartSearchAPIView(APIView):
    """
    🧠 Recherche intelligente avec scoring
    Combine critères + distance + préférences
    
    Query params:
        - query: Texte libre
        - city: Ville
        - category: ID catégorie
        - min_price, max_price: Budget
        - min_rooms: Chambres minimum
        - min_area: Superficie minimum
        - lat, lng: Coordonnées (optionnel)
        - furnished: Meublé (optionnel)
    """
    permission_classes = [AllowAny]
    
    def get(self, request):
        # Validation
        serializer = SmartSearchSerializer(data=request.query_params)
        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )
        
        criteria = serializer.validated_data
        
        # Base queryset
        queryset = Housing.objects.filter(
            is_visible=True,
            status='disponible'
        ).select_related(
            'owner', 'category', 'housing_type', 'city', 'district'
        ).prefetch_related('images')
        
        # Appliquer filtres de base
        if criteria.get('query'):
            queryset = queryset.filter(
                Q(title__icontains=criteria['query']) |
                Q(description__icontains=criteria['query'])
            )
        
        if criteria.get('city'):
            queryset = queryset.filter(city__name__icontains=criteria['city'])
        
        if criteria.get('category'):
            queryset = queryset.filter(category_id=criteria['category'])
        
        # Calculer scores
        results = []
        user_lat = criteria.get('lat')
        user_lng = criteria.get('lng')
        
        for housing in queryset:
            # Distance si coordonnées fournies
            distance = None
            if user_lat and user_lng and housing.latitude and housing.longitude:
                distance = haversine(
                    user_lat, user_lng,
                    housing.latitude, housing.longitude
                )
                housing.distance = round(distance, 2)
                housing.distance_category = get_distance_category(distance)
            
            # Calcul du score
            score = compute_smart_score(housing, criteria, distance)
            housing.score = score
            
            results.append(housing)
        
        # Trier par score décroissant
        results.sort(key=lambda x: x.score, reverse=True)
        
        # Limiter résultats
        max_results = criteria.get('max_results', 20)
        results = results[:max_results]
        
        # Sérialiser
        serializer = SearchResultSerializer(
            results,
            many=True,
            context={'request': request}
        )
        
        # Enrichir données
        data = serializer.data
        for i, housing in enumerate(results):
            data[i]['score'] = housing.score
            if hasattr(housing, 'distance'):
                data[i]['distance'] = housing.distance
                data[i]['distance_category'] = housing.distance_category
        
        return Response({
            'count': len(results),
            'criteria': criteria,
            'results': data
        })


class MapHousingAPIView(APIView):
    """
    🗺️ Tous les logements pour affichage carte
    Retourne uniquement les logements avec coordonnées GPS
    """
    permission_classes = [AllowAny]
    
    def get(self, request):
        housings = Housing.objects.filter(
            latitude__isnull=False,
            longitude__isnull=False,
            is_visible=True,
            status='disponible'
        ).select_related(
            'owner', 'category', 'housing_type', 'city', 'district'
        ).prefetch_related('images')
        
        serializer = HousingListSerializer(
            housings,
            many=True,
            context={'request': request}
        )
        
        return Response({
            'count': housings.count(),
            'results': serializer.data
        })




        # partie chatbot

        # ============================================
# 📁 apps/recherche/chatbot_views.py
# ============================================
"""
Vues pour l'assistant chatbot IA
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.db.models import Q

from apps.housing.models import Housing, Category, City, District
from apps.housing.serializers import HousingListSerializer
from .ai import extract_search_criteria, generate_response, suggest_alternatives
from .scoring import compute_smart_score
from .utils import haversine


class ChatbotQueryAPIView(APIView):
    """
    🤖 API Chatbot : Recherche en langage naturel
    
    POST /api/recherche/chatbot/
    Body: {
        "message": "Je cherche un studio à Yaoundé pour 50000 FCFA",
        "method": "simple|openai|ollama",  # optionnel
        "user_lat": 3.848,  # optionnel
        "user_lng": 11.502  # optionnel
    }
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        user_message = request.data.get('message', '').strip()
        method = request.data.get('method', 'simple')
        user_lat = request.data.get('user_lat')
        user_lng = request.data.get('user_lng')
        
        if not user_message:
            return Response(
                {'error': 'Message vide'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # 1. Extraire les critères de la requête
            criteria = extract_search_criteria(user_message, method=method)
            
            # 2. Ajouter coordonnées si fournies
            if user_lat and user_lng:
                criteria['lat'] = float(user_lat)
                criteria['lng'] = float(user_lng)
            
            # 3. Construire la requête
            queryset = Housing.objects.filter(
                is_visible=True,
                status='disponible'
            ).select_related(
                'owner', 'category', 'housing_type', 'city', 'district'
            ).prefetch_related('images')
            
            # Appliquer les filtres
            queryset = self._apply_criteria_filters(queryset, criteria)
            
            # 4. Calculer scores si géolocalisation
            results = []
            if user_lat and user_lng:
                for housing in queryset:
                    if housing.latitude and housing.longitude:
                        distance = haversine(
                            float(user_lat), float(user_lng),
                            housing.latitude, housing.longitude
                        )
                        housing.distance = round(distance, 2)
                        housing.score = compute_smart_score(housing, criteria, distance)
                    else:
                        housing.score = compute_smart_score(housing, criteria)
                    results.append(housing)
                
                # Trier par score
                results.sort(key=lambda x: x.score, reverse=True)
                results = results[:10]  # Top 10
            else:
                results = list(queryset[:10])
            
            # 5. Sérialiser
            serializer = HousingListSerializer(
                results,
                many=True,
                context={'request': request}
            )
            
            # 6. Générer réponse naturelle
            bot_response = generate_response(criteria, len(results))
            
            # 7. Suggestions si peu de résultats
            suggestions = []
            if len(results) < 3:
                suggestions = suggest_alternatives(criteria)
            
            return Response({
                'message': user_message,
                'bot_response': bot_response,
                'criteria': criteria,
                'count': len(results),
                'results': serializer.data,
                'suggestions': suggestions
            })
            
        except Exception as e:
            print(f"❌ Erreur chatbot: {e}")
            import traceback
            traceback.print_exc()
            
            return Response({
                'message': user_message,
                'bot_response': "Désolé, je n'ai pas compris votre demande. Pouvez-vous reformuler ?",
                'error': str(e),
                'results': []
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _apply_criteria_filters(self, queryset, criteria):
        """Applique les critères extraits au queryset"""
        
        # Recherche textuelle
        if criteria.get('query'):
            queryset = queryset.filter(
                Q(title__icontains=criteria['query']) |
                Q(description__icontains=criteria['query']) |
                Q(additional_features__icontains=criteria['query'])
            )
        
        # Ville
        if criteria.get('city'):
            queryset = queryset.filter(city__name__icontains=criteria['city'])
        
        # Quartier
        if criteria.get('district_name'):
            queryset = queryset.filter(district__name__icontains=criteria['district_name'])
        
        # Catégorie
        if criteria.get('category_name'):
            queryset = queryset.filter(category__name__icontains=criteria['category_name'])
        
        # Prix
        if criteria.get('min_price'):
            queryset = queryset.filter(price__gte=criteria['min_price'])
        if criteria.get('max_price'):
            queryset = queryset.filter(price__lte=criteria['max_price'])
        
        # Chambres
        if criteria.get('min_rooms'):
            queryset = queryset.filter(rooms__gte=criteria['min_rooms'])
        
        # Surface
        if criteria.get('min_area'):
            queryset = queryset.filter(area__gte=criteria['min_area'])
        
        # Type meublé
        if criteria.get('furnished') is not None:
            if criteria['furnished']:
                queryset = queryset.filter(housing_type__name__icontains='meublé')
            else:
                queryset = queryset.filter(housing_type__name__icontains='simple')
        
        return queryset


class ChatbotSuggestionsAPIView(APIView):
    """
    💡 Suggestions de recherche
    
    GET /api/recherche/chatbot/suggestions/
    """
    permission_classes = [AllowAny]
    
    def get(self, request):
        suggestions = [
            "Studio meublé à Yaoundé pour 50 000 FCFA",
            "Appartement 2 chambres à Douala",
            "Chambre proche université Yaoundé 1",
            "Maison 3 chambres à Bastos",
            "Logement pas cher à Essos",
            "Studio moderne à moins de 60 000 FCFA",
            "Appartement meublé près de Total Bastos",
            "Cherche logement urgent à Yaoundé"
        ]
        
        return Response({
            'suggestions': suggestions
        })


class ChatbotCitiesAPIView(APIView):
    """
    🏙️ Liste des villes disponibles
    
    GET /api/recherche/chatbot/cities/
    """
    permission_classes = [AllowAny]
    
    def get(self, request):
        cities = City.objects.values_list('name', flat=True).distinct()
        return Response({
            'cities': list(cities)
        })


class ChatbotCategoriesAPIView(APIView):
    """
    🏠 Liste des catégories disponibles
    
    GET /api/recherche/chatbot/categories/
    """
    permission_classes = [AllowAny]
    
    def get(self, request):
        categories = Category.objects.values('id', 'name', 'description')
        return Response({
            'categories': list(categories)
        })
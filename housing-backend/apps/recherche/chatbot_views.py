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
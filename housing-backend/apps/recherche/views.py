# # # ============================================
# # # 📁 apps/recherche/views.py
# # # ============================================
# # """
# # Vues pour le module de recherche intelligente
# # Compatible avec la structure ViewSet existante
# # """

# # from rest_framework.views import APIView
# # from rest_framework.response import Response
# # from rest_framework import status
# # from rest_framework.permissions import AllowAny
# # from django.db.models import Q, Avg, Min, Max, Count

# # from apps.housing.models import Housing
# # from apps.housing.serializers import HousingListSerializer
# # from .serializers import (
# #     SearchResultSerializer,
# #     SearchStatsSerializer,
# #     NearbySearchSerializer,
# #     SmartSearchSerializer
# # )
# # from .utils import haversine, validate_coordinates, get_distance_category
# # from .scoring import compute_score, score_distance, compute_smart_score


# # class HousingSearchAPIView(APIView):
# #     """
# #     🔍 Recherche textuelle libre + Filtres structurés
    
# #     Query params:
# #         - query: Recherche textuelle libre
# #         - category: ID de catégorie
# #         - region: Nom de région
# #         - city: Nom de ville
# #         - district: Nom de quartier
# #         - min_price: Prix minimum
# #         - max_price: Prix maximum
# #         - min_rooms: Nombre de chambres minimum
# #         - min_area: Superficie minimum
# #         - status: disponible/reserve/occupe
# #     """
# #     permission_classes = [AllowAny]
    
# #     def get(self, request):
# #         # Base queryset
# #         queryset = Housing.objects.filter(
# #             is_visible=True,
# #             status='disponible'
# #         ).select_related(
# #             'owner', 'category', 'housing_type', 'region', 'city', 'district'
# #         ).prefetch_related('images')
        
# #         # 🔍 RECHERCHE TEXTUELLE LIBRE
# #         query = request.query_params.get('query', '').strip()
# #         if query:
# #             queryset = queryset.filter(
# #                 Q(title__icontains=query) |
# #                 Q(description__icontains=query) |
# #                 Q(city__name__icontains=query) |
# #                 Q(district__name__icontains=query) |
# #                 Q(category__name__icontains=query) |
# #                 Q(additional_features__icontains=query)
# #             )
        
# #         # 🔧 FILTRES STRUCTURÉS
# #         category = request.query_params.get('category')
# #         city = request.query_params.get('city')
# #         district = request.query_params.get('district')
# #         min_price = request.query_params.get('min_price')
# #         max_price = request.query_params.get('max_price')
# #         min_rooms = request.query_params.get('min_rooms')
# #         min_area = request.query_params.get('min_area')
# #         status_filter = request.query_params.get('status')
        
# #         if category:
# #             queryset = queryset.filter(category_id=category)
# #         if city:
# #             queryset = queryset.filter(city__name__icontains=city)
# #         if district:
# #             queryset = queryset.filter(district__name__icontains=district)
# #         if min_price:
# #             queryset = queryset.filter(price__gte=min_price)
# #         if max_price:
# #             queryset = queryset.filter(price__lte=max_price)
# #         if min_rooms:
# #             queryset = queryset.filter(rooms__gte=min_rooms)
# #         if min_area:
# #             queryset = queryset.filter(area__gte=min_area)
# #         if status_filter in ['disponible', 'reserve', 'occupe']:
# #             queryset = queryset.filter(status=status_filter)
        
# #         # 📊 STATISTIQUES
# #         stats = {
# #             'total_results': queryset.count(),
# #             'avg_price': queryset.aggregate(Avg('price'))['price__avg'] or 0,
# #             'min_price': queryset.aggregate(Min('price'))['price__min'] or 0,
# #             'max_price': queryset.aggregate(Max('price'))['price__max'] or 0,
# #             'avg_area': queryset.aggregate(Avg('area'))['area__avg'] or 0,
# #         }
        
# #         # Tri
# #         sort_by = request.query_params.get('sortBy', 'recent')
# #         sorting_map = {
# #             'recent': '-created_at',
# #             'price_asc': 'price',
# #             'price_desc': '-price',
# #             'area_asc': 'area',
# #             'area_desc': '-area',
# #             'popular': '-views_count',
# #         }
# #         queryset = queryset.order_by(sorting_map.get(sort_by, '-created_at'))
        
# #         # Pagination
# #         page_size = 20
# #         page = int(request.query_params.get('page', 1))
# #         start = (page - 1) * page_size
# #         end = start + page_size
        
# #         paginated = queryset[start:end]
        
# #         serializer = HousingListSerializer(
# #             paginated,
# #             many=True,
# #             context={'request': request}
# #         )
        
# #         return Response({
# #             'count': queryset.count(),
# #             'stats': stats,
# #             'results': serializer.data
# #         })


# # class NearbyHousingAPIView(APIView):
# #     """
# #     📍 Recherche "Près de moi"
# #     Trouve les logements dans un rayon donné
    
# #     Query params:
# #         - lat: Latitude (requis)
# #         - lng: Longitude (requis)
# #         - radius: Rayon en km (défaut: 5)
# #         - max_results: Nombre max de résultats (défaut: 20)
# #     """
# #     permission_classes = [AllowAny]
    
# #     def get(self, request):
# #         # Validation
# #         serializer = NearbySearchSerializer(data=request.query_params)
# #         if not serializer.is_valid():
# #             return Response(
# #                 serializer.errors,
# #                 status=status.HTTP_400_BAD_REQUEST
# #             )
        
# #         data = serializer.validated_data
# #         lat = data['lat']
# #         lng = data['lng']
# #         radius = data.get('radius', 5.0)
# #         max_results = data.get('max_results', 20)
        
# #         # Récupérer tous les logements avec coordonnées
# #         housings = Housing.objects.filter(
# #             is_visible=True,
# #             status='disponible',
# #             latitude__isnull=False,
# #             longitude__isnull=False
# #         ).select_related(
# #             'owner', 'category', 'housing_type', 'city', 'district'
# #         ).prefetch_related('images')
        
# #         # Calculer distances
# #         results = []
# #         for housing in housings:
# #             distance = haversine(lat, lng, housing.latitude, housing.longitude)
# #             if distance <= radius:
# #                 housing.distance = round(distance, 2)
# #                 housing.distance_category = get_distance_category(distance)
# #                 results.append(housing)
        
# #         # Trier par distance
# #         results.sort(key=lambda x: x.distance)
# #         results = results[:max_results]
        
# #         # Sérialiser
# #         serializer = SearchResultSerializer(
# #             results,
# #             many=True,
# #             context={'request': request}
# #         )
        
# #         # Enrichir avec distance
# #         data = serializer.data
# #         for i, housing in enumerate(results):
# #             data[i]['distance'] = housing.distance
# #             data[i]['distance_category'] = housing.distance_category
        
# #         return Response({
# #             'count': len(results),
# #             'search_center': {'lat': lat, 'lng': lng},
# #             'radius_km': radius,
# #             'results': data
# #         })


# # class SmartSearchAPIView(APIView):
# #     """
# #     🧠 Recherche intelligente avec scoring
# #     Combine critères + distance + préférences
    
# #     Query params:
# #         - query: Texte libre
# #         - city: Ville
# #         - category: ID catégorie
# #         - min_price, max_price: Budget
# #         - min_rooms: Chambres minimum
# #         - min_area: Superficie minimum
# #         - lat, lng: Coordonnées (optionnel)
# #         - furnished: Meublé (optionnel)
# #     """
# #     permission_classes = [AllowAny]
    
# #     def get(self, request):
# #         # Validation
# #         serializer = SmartSearchSerializer(data=request.query_params)
# #         if not serializer.is_valid():
# #             return Response(
# #                 serializer.errors,
# #                 status=status.HTTP_400_BAD_REQUEST
# #             )
        
# #         criteria = serializer.validated_data
        
# #         # Base queryset
# #         queryset = Housing.objects.filter(
# #             is_visible=True,
# #             status='disponible'
# #         ).select_related(
# #             'owner', 'category', 'housing_type', 'city', 'district'
# #         ).prefetch_related('images')
        
# #         # Appliquer filtres de base
# #         if criteria.get('query'):
# #             queryset = queryset.filter(
# #                 Q(title__icontains=criteria['query']) |
# #                 Q(description__icontains=criteria['query'])
# #             )
        
# #         if criteria.get('city'):
# #             queryset = queryset.filter(city__name__icontains=criteria['city'])
        
# #         if criteria.get('category'):
# #             queryset = queryset.filter(category_id=criteria['category'])
        
# #         # Calculer scores
# #         results = []
# #         user_lat = criteria.get('lat')
# #         user_lng = criteria.get('lng')
        
# #         for housing in queryset:
# #             # Distance si coordonnées fournies
# #             distance = None
# #             if user_lat and user_lng and housing.latitude and housing.longitude:
# #                 distance = haversine(
# #                     user_lat, user_lng,
# #                     housing.latitude, housing.longitude
# #                 )
# #                 housing.distance = round(distance, 2)
# #                 housing.distance_category = get_distance_category(distance)
            
# #             # Calcul du score
# #             score = compute_smart_score(housing, criteria, distance)
# #             housing.score = score
            
# #             results.append(housing)
        
# #         # Trier par score décroissant
# #         results.sort(key=lambda x: x.score, reverse=True)
        
# #         # Limiter résultats
# #         max_results = criteria.get('max_results', 20)
# #         results = results[:max_results]
        
# #         # Sérialiser
# #         serializer = SearchResultSerializer(
# #             results,
# #             many=True,
# #             context={'request': request}
# #         )
        
# #         # Enrichir données
# #         data = serializer.data
# #         for i, housing in enumerate(results):
# #             data[i]['score'] = housing.score
# #             if hasattr(housing, 'distance'):
# #                 data[i]['distance'] = housing.distance
# #                 data[i]['distance_category'] = housing.distance_category
        
# #         return Response({
# #             'count': len(results),
# #             'criteria': criteria,
# #             'results': data
# #         })


# # class MapHousingAPIView(APIView):
# #     """
# #     🗺️ Tous les logements pour affichage carte
# #     Retourne uniquement les logements avec coordonnées GPS
# #     """
# #     permission_classes = [AllowAny]
    
# #     def get(self, request):
# #         housings = Housing.objects.filter(
# #             latitude__isnull=False,
# #             longitude__isnull=False,
# #             is_visible=True,
# #             status='disponible'
# #         ).select_related(
# #             'owner', 'category', 'housing_type', 'city', 'district'
# #         ).prefetch_related('images')
        
# #         serializer = HousingListSerializer(
# #             housings,
# #             many=True,
# #             context={'request': request}
# #         )
        
# #         return Response({
# #             'count': housings.count(),
# #             'results': serializer.data
# #         })




# #         # partie chatbot

# #         # ============================================
# # # 📁 apps/recherche/chatbot_views.py
# # # ============================================
# # """
# # Vues pour l'assistant chatbot IA
# # """

# # from rest_framework.views import APIView
# # from rest_framework.response import Response
# # from rest_framework import status
# # from rest_framework.permissions import AllowAny
# # from django.db.models import Q

# # from apps.housing.models import Housing, Category, City, District
# # from apps.housing.serializers import HousingListSerializer
# # from .ai import extract_search_criteria, generate_response, suggest_alternatives
# # from .scoring import compute_smart_score
# # from .utils import haversine


# # class ChatbotQueryAPIView(APIView):
# #     """
# #     🤖 API Chatbot : Recherche en langage naturel
    
# #     POST /api/recherche/chatbot/
# #     Body: {
# #         "message": "Je cherche un studio à Yaoundé pour 50000 FCFA",
# #         "method": "simple|openai|ollama",  # optionnel
# #         "user_lat": 3.848,  # optionnel
# #         "user_lng": 11.502  # optionnel
# #     }
# #     """
# #     permission_classes = [AllowAny]
    
# #     def post(self, request):
# #         user_message = request.data.get('message', '').strip()
# #         method = request.data.get('method', 'simple')
# #         user_lat = request.data.get('user_lat')
# #         user_lng = request.data.get('user_lng')
        
# #         if not user_message:
# #             return Response(
# #                 {'error': 'Message vide'},
# #                 status=status.HTTP_400_BAD_REQUEST
# #             )
        
# #         try:
# #             # 1. Extraire les critères de la requête
# #             criteria = extract_search_criteria(user_message, method=method)
            
# #             # 2. Ajouter coordonnées si fournies
# #             if user_lat and user_lng:
# #                 criteria['lat'] = float(user_lat)
# #                 criteria['lng'] = float(user_lng)
            
# #             # 3. Construire la requête
# #             queryset = Housing.objects.filter(
# #                 is_visible=True,
# #                 status='disponible'
# #             ).select_related(
# #                 'owner', 'category', 'housing_type', 'city', 'district'
# #             ).prefetch_related('images')
            
# #             # Appliquer les filtres
# #             queryset = self._apply_criteria_filters(queryset, criteria)
            
# #             # 4. Calculer scores si géolocalisation
# #             results = []
# #             if user_lat and user_lng:
# #                 for housing in queryset:
# #                     if housing.latitude and housing.longitude:
# #                         distance = haversine(
# #                             float(user_lat), float(user_lng),
# #                             housing.latitude, housing.longitude
# #                         )
# #                         housing.distance = round(distance, 2)
# #                         housing.score = compute_smart_score(housing, criteria, distance)
# #                     else:
# #                         housing.score = compute_smart_score(housing, criteria)
# #                     results.append(housing)
                
# #                 # Trier par score
# #                 results.sort(key=lambda x: x.score, reverse=True)
# #                 results = results[:10]  # Top 10
# #             else:
# #                 results = list(queryset[:10])
            
# #             # 5. Sérialiser
# #             serializer = HousingListSerializer(
# #                 results,
# #                 many=True,
# #                 context={'request': request}
# #             )
            
# #             # 6. Générer réponse naturelle
# #             bot_response = generate_response(criteria, len(results))
            
# #             # 7. Suggestions si peu de résultats
# #             suggestions = []
# #             if len(results) < 3:
# #                 suggestions = suggest_alternatives(criteria)
            
# #             return Response({
# #                 'message': user_message,
# #                 'bot_response': bot_response,
# #                 'criteria': criteria,
# #                 'count': len(results),
# #                 'results': serializer.data,
# #                 'suggestions': suggestions
# #             })
            
# #         except Exception as e:
# #             print(f"❌ Erreur chatbot: {e}")
# #             import traceback
# #             traceback.print_exc()
            
# #             return Response({
# #                 'message': user_message,
# #                 'bot_response': "Désolé, je n'ai pas compris votre demande. Pouvez-vous reformuler ?",
# #                 'error': str(e),
# #                 'results': []
# #             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
# #     def _apply_criteria_filters(self, queryset, criteria):
# #         """Applique les critères extraits au queryset"""
        
# #         # Recherche textuelle
# #         if criteria.get('query'):
# #             queryset = queryset.filter(
# #                 Q(title__icontains=criteria['query']) |
# #                 Q(description__icontains=criteria['query']) |
# #                 Q(additional_features__icontains=criteria['query'])
# #             )
        
# #         # Ville
# #         if criteria.get('city'):
# #             queryset = queryset.filter(city__name__icontains=criteria['city'])
        
# #         # Quartier
# #         if criteria.get('district_name'):
# #             queryset = queryset.filter(district__name__icontains=criteria['district_name'])
        
# #         # Catégorie
# #         if criteria.get('category_name'):
# #             queryset = queryset.filter(category__name__icontains=criteria['category_name'])
        
# #         # Prix
# #         if criteria.get('min_price'):
# #             queryset = queryset.filter(price__gte=criteria['min_price'])
# #         if criteria.get('max_price'):
# #             queryset = queryset.filter(price__lte=criteria['max_price'])
        
# #         # Chambres
# #         if criteria.get('min_rooms'):
# #             queryset = queryset.filter(rooms__gte=criteria['min_rooms'])
        
# #         # Surface
# #         if criteria.get('min_area'):
# #             queryset = queryset.filter(area__gte=criteria['min_area'])
        
# #         # Type meublé
# #         if criteria.get('furnished') is not None:
# #             if criteria['furnished']:
# #                 queryset = queryset.filter(housing_type__name__icontains='meublé')
# #             else:
# #                 queryset = queryset.filter(housing_type__name__icontains='simple')
        
# #         return queryset


# # class ChatbotSuggestionsAPIView(APIView):
# #     """
# #     💡 Suggestions de recherche
    
# #     GET /api/recherche/chatbot/suggestions/
# #     """
# #     permission_classes = [AllowAny]
    
# #     def get(self, request):
# #         suggestions = [
# #             "Studio meublé à Yaoundé pour 50 000 FCFA",
# #             "Appartement 2 chambres à Douala",
# #             "Chambre proche université Yaoundé 1",
# #             "Maison 3 chambres à Bastos",
# #             "Logement pas cher à Essos",
# #             "Studio moderne à moins de 60 000 FCFA",
# #             "Appartement meublé près de Total Bastos",
# #             "Cherche logement urgent à Yaoundé"
# #         ]
        
# #         return Response({
# #             'suggestions': suggestions
# #         })


# # class ChatbotCitiesAPIView(APIView):
# #     """
# #     🏙️ Liste des villes disponibles
    
# #     GET /api/recherche/chatbot/cities/
# #     """
# #     permission_classes = [AllowAny]
    
# #     def get(self, request):
# #         cities = City.objects.values_list('name', flat=True).distinct()
# #         return Response({
# #             'cities': list(cities)
# #         })


# # class ChatbotCategoriesAPIView(APIView):
# #     """
# #     🏠 Liste des catégories disponibles
    
# #     GET /api/recherche/chatbot/categories/
# #     """
# #     permission_classes = [AllowAny]
    
# #     def get(self, request):
# #         categories = Category.objects.values('id', 'name', 'description')
# #         return Response({
# #             'categories': list(categories)
# #         })

# # ============================================
# # 📁 apps/recherche/views.py - VERSION CORRIGÉE
# # ============================================
# """
# Vues pour le module de recherche intelligente
# Compatible avec la structure ViewSet existante
# ✅ CORRECTION : Support ID et nom pour tous les filtres
# """

# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework import status
# from rest_framework.permissions import AllowAny
# from django.db.models import Q, Avg, Min, Max, Count

# from apps.housing.models import Housing, Category, City, District
# from apps.housing.serializers import HousingListSerializer
# from .serializers import (
#     SearchResultSerializer,
#     SearchStatsSerializer,
#     NearbySearchSerializer,
#     SmartSearchSerializer
# )
# from .utils import haversine, validate_coordinates, get_distance_category
# from .scoring import compute_score, score_distance, compute_smart_score
# from .ai import extract_search_criteria, generate_response, suggest_alternatives


# class HousingSearchAPIView(APIView):
#     """
#     🔍 Recherche textuelle libre + Filtres structurés
    
#     Query params:
#         - query: Recherche textuelle libre
#         - category: ID ou nom de catégorie
#         - region: ID ou nom de région
#         - city: ID ou nom de ville
#         - district: ID ou nom de quartier
#         - housingType: ID ou nom de type
#         - min_price: Prix minimum
#         - max_price: Prix maximum
#         - min_rooms: Nombre de chambres minimum
#         - min_area: Superficie minimum
#         - status: disponible/reserve/occupe
#     """
#     permission_classes = [AllowAny]
    
#     def get(self, request):
#         # Base queryset
#         queryset = Housing.objects.filter(
#             is_visible=True,
#             status='disponible'
#         ).select_related(
#             'owner', 'category', 'housing_type', 'region', 'city', 'district'
#         ).prefetch_related('images')
        
#         # 🔍 RECHERCHE TEXTUELLE LIBRE
#         query = request.query_params.get('query', '').strip()
#         if query:
#             queryset = queryset.filter(
#                 Q(title__icontains=query) |
#                 Q(description__icontains=query) |
#                 Q(city__name__icontains=query) |
#                 Q(district__name__icontains=query) |
#                 Q(category__name__icontains=query) |
#                 Q(region__name__icontains=query) |
#                 Q(additional_features__icontains=query)
#             )
        
#         # 🔧 FILTRES STRUCTURÉS
#         category = request.query_params.get('category')
#         region = request.query_params.get('region')
#         city = request.query_params.get('city')
#         district = request.query_params.get('district')
#         housing_type = request.query_params.get('housingType')
#         min_price = request.query_params.get('min_price')
#         max_price = request.query_params.get('max_price')
#         min_rooms = request.query_params.get('min_rooms')
#         min_area = request.query_params.get('min_area')
#         status_filter = request.query_params.get('status')
        
#         # ✅ CATÉGORIE (ID ou nom)
#         if category:
#             try:
#                 queryset = queryset.filter(category_id=int(category))
#             except (ValueError, TypeError):
#                 queryset = queryset.filter(category__name__icontains=category)
        
#         # ✅ RÉGION (ID ou nom)
#         if region:
#             try:
#                 queryset = queryset.filter(region_id=int(region))
#             except (ValueError, TypeError):
#                 queryset = queryset.filter(region__name__icontains=region)
        
#         # ✅ VILLE (ID ou nom)
#         if city:
#             try:
#                 queryset = queryset.filter(city_id=int(city))
#             except (ValueError, TypeError):
#                 queryset = queryset.filter(city__name__icontains=city)
        
#         # ✅ QUARTIER (ID ou nom)
#         if district:
#             try:
#                 queryset = queryset.filter(district_id=int(district))
#             except (ValueError, TypeError):
#                 queryset = queryset.filter(district__name__icontains=district)
        
#         # ✅ TYPE LOGEMENT (ID ou nom)
#         if housing_type:
#             try:
#                 queryset = queryset.filter(housing_type_id=int(housing_type))
#             except (ValueError, TypeError):
#                 queryset = queryset.filter(housing_type__name__icontains=housing_type)
        
#         # Prix
#         if min_price:
#             queryset = queryset.filter(price__gte=min_price)
#         if max_price:
#             queryset = queryset.filter(price__lte=max_price)
        
#         # Chambres
#         if min_rooms:
#             queryset = queryset.filter(rooms__gte=min_rooms)
        
#         # Surface
#         if min_area:
#             queryset = queryset.filter(area__gte=min_area)
        
#         # Statut
#         if status_filter in ['disponible', 'reserve', 'occupe']:
#             queryset = queryset.filter(status=status_filter)
        
#         # 📊 STATISTIQUES
#         stats = {
#             'total_results': queryset.count(),
#             'avg_price': queryset.aggregate(Avg('price'))['price__avg'] or 0,
#             'min_price': queryset.aggregate(Min('price'))['price__min'] or 0,
#             'max_price': queryset.aggregate(Max('price'))['price__max'] or 0,
#             'avg_area': queryset.aggregate(Avg('area'))['area__avg'] or 0,
#         }
        
#         # Tri
#         sort_by = request.query_params.get('sortBy', 'recent')
#         sorting_map = {
#             'recent': '-created_at',
#             'price_asc': 'price',
#             'price_desc': '-price',
#             'area_asc': 'area',
#             'area_desc': '-area',
#             'popular': '-views_count',
#         }
#         queryset = queryset.order_by(sorting_map.get(sort_by, '-created_at'))
        
#         # Pagination
#         page_size = 20
#         page = int(request.query_params.get('page', 1))
#         start = (page - 1) * page_size
#         end = start + page_size
        
#         paginated = queryset[start:end]
        
#         serializer = HousingListSerializer(
#             paginated,
#             many=True,
#             context={'request': request}
#         )
        
#         return Response({
#             'count': queryset.count(),
#             'stats': stats,
#             'results': serializer.data
#         })


# class NearbyHousingAPIView(APIView):
#     """
#     📍 Recherche "Près de moi"
#     Trouve les logements dans un rayon donné
    
#     Query params:
#         - lat: Latitude (requis)
#         - lng: Longitude (requis)
#         - radius: Rayon en km (défaut: 5)
#         - max_results: Nombre max de résultats (défaut: 20)
#     """
#     permission_classes = [AllowAny]
    
#     def get(self, request):
#         # Validation
#         serializer = NearbySearchSerializer(data=request.query_params)
#         if not serializer.is_valid():
#             return Response(
#                 serializer.errors,
#                 status=status.HTTP_400_BAD_REQUEST
#             )
        
#         data = serializer.validated_data
#         lat = data['lat']
#         lng = data['lng']
#         radius = data.get('radius', 5.0)
#         max_results = data.get('max_results', 20)
        
#         # Récupérer tous les logements avec coordonnées
#         housings = Housing.objects.filter(
#             is_visible=True,
#             status='disponible',
#             latitude__isnull=False,
#             longitude__isnull=False
#         ).select_related(
#             'owner', 'category', 'housing_type', 'city', 'district'
#         ).prefetch_related('images')
        
#         # Calculer distances
#         results = []
#         for housing in housings:
#             distance = haversine(lat, lng, housing.latitude, housing.longitude)
#             if distance <= radius:
#                 housing.distance = round(distance, 2)
#                 housing.distance_category = get_distance_category(distance)
#                 results.append(housing)
        
#         # Trier par distance
#         results.sort(key=lambda x: x.distance)
#         results = results[:max_results]
        
#         # Sérialiser
#         serializer = SearchResultSerializer(
#             results,
#             many=True,
#             context={'request': request}
#         )
        
#         # Enrichir avec distance
#         data = serializer.data
#         for i, housing in enumerate(results):
#             data[i]['distance'] = housing.distance
#             data[i]['distance_category'] = housing.distance_category
        
#         return Response({
#             'count': len(results),
#             'search_center': {'lat': lat, 'lng': lng},
#             'radius_km': radius,
#             'results': data
#         })


# class SmartSearchAPIView(APIView):
#     """
#     🧠 Recherche intelligente avec scoring
#     Combine critères + distance + préférences
    
#     Query params:
#         - query: Texte libre
#         - city: Ville (ID ou nom)
#         - category: ID catégorie
#         - min_price, max_price: Budget
#         - min_rooms: Chambres minimum
#         - min_area: Superficie minimum
#         - lat, lng: Coordonnées (optionnel)
#         - furnished: Meublé (optionnel)
#     """
#     permission_classes = [AllowAny]
    
#     def get(self, request):
#         # Validation
#         serializer = SmartSearchSerializer(data=request.query_params)
#         if not serializer.is_valid():
#             return Response(
#                 serializer.errors,
#                 status=status.HTTP_400_BAD_REQUEST
#             )
        
#         criteria = serializer.validated_data
        
#         # Base queryset
#         queryset = Housing.objects.filter(
#             is_visible=True,
#             status='disponible'
#         ).select_related(
#             'owner', 'category', 'housing_type', 'city', 'district'
#         ).prefetch_related('images')
        
#         # Appliquer filtres de base
#         if criteria.get('query'):
#             queryset = queryset.filter(
#                 Q(title__icontains=criteria['query']) |
#                 Q(description__icontains=criteria['query'])
#             )
        
#         # Ville (ID ou nom)
#         if criteria.get('city'):
#             city_value = criteria['city']
#             try:
#                 queryset = queryset.filter(city_id=int(city_value))
#             except (ValueError, TypeError):
#                 queryset = queryset.filter(city__name__icontains=city_value)
        
#         if criteria.get('category'):
#             queryset = queryset.filter(category_id=criteria['category'])
        
#         # Calculer scores
#         results = []
#         user_lat = criteria.get('lat')
#         user_lng = criteria.get('lng')
        
#         for housing in queryset:
#             # Distance si coordonnées fournies
#             distance = None
#             if user_lat and user_lng and housing.latitude and housing.longitude:
#                 distance = haversine(
#                     user_lat, user_lng,
#                     housing.latitude, housing.longitude
#                 )
#                 housing.distance = round(distance, 2)
#                 housing.distance_category = get_distance_category(distance)
            
#             # Calcul du score
#             score = compute_smart_score(housing, criteria, distance)
#             housing.score = score
            
#             results.append(housing)
        
#         # Trier par score décroissant
#         results.sort(key=lambda x: x.score, reverse=True)
        
#         # Limiter résultats
#         max_results = criteria.get('max_results', 20)
#         results = results[:max_results]
        
#         # Sérialiser
#         serializer = SearchResultSerializer(
#             results,
#             many=True,
#             context={'request': request}
#         )
        
#         # Enrichir données
#         data = serializer.data
#         for i, housing in enumerate(results):
#             data[i]['score'] = housing.score
#             if hasattr(housing, 'distance'):
#                 data[i]['distance'] = housing.distance
#                 data[i]['distance_category'] = housing.distance_category
        
#         return Response({
#             'count': len(results),
#             'criteria': criteria,
#             'results': data
#         })


# class MapHousingAPIView(APIView):
#     """
#     🗺️ Tous les logements pour affichage carte
#     Retourne uniquement les logements avec coordonnées GPS
#     """
#     permission_classes = [AllowAny]
    
#     def get(self, request):
#         housings = Housing.objects.filter(
#             latitude__isnull=False,
#             longitude__isnull=False,
#             is_visible=True,
#             status='disponible'
#         ).select_related(
#             'owner', 'category', 'housing_type', 'city', 'district'
#         ).prefetch_related('images')
        
#         serializer = HousingListSerializer(
#             housings,
#             many=True,
#             context={'request': request}
#         )
        
#         return Response({
#             'count': housings.count(),
#             'results': serializer.data
#         })


# # ============================================
# # CHATBOT VIEWS
# # ============================================

# class ChatbotQueryAPIView(APIView):
#     """
#     🤖 API Chatbot : Recherche en langage naturel
    
#     POST /api/recherche/chatbot/
#     Body: {
#         "message": "Je cherche un studio à Yaoundé pour 50000 FCFA",
#         "method": "simple|openai|ollama",  # optionnel
#         "user_lat": 3.848,  # optionnel
#         "user_lng": 11.502  # optionnel
#     }
#     """
#     permission_classes = [AllowAny]
    
#     def post(self, request):
#         user_message = request.data.get('message', '').strip()
#         method = request.data.get('method', 'simple')
#         user_lat = request.data.get('user_lat')
#         user_lng = request.data.get('user_lng')
        
#         if not user_message:
#             return Response(
#                 {'error': 'Message vide'},
#                 status=status.HTTP_400_BAD_REQUEST
#             )
        
#         try:
#             # 1. Extraire les critères de la requête
#             criteria = extract_search_criteria(user_message, method=method)
            
#             # 2. Ajouter coordonnées si fournies
#             if user_lat and user_lng:
#                 criteria['lat'] = float(user_lat)
#                 criteria['lng'] = float(user_lng)
            
#             # 3. Construire la requête
#             queryset = Housing.objects.filter(
#                 is_visible=True,
#                 status='disponible'
#             ).select_related(
#                 'owner', 'category', 'housing_type', 'city', 'district'
#             ).prefetch_related('images')
            
#             # Appliquer les filtres
#             queryset = self._apply_criteria_filters(queryset, criteria)
            
#             # 4. Calculer scores si géolocalisation
#             results = []
#             if user_lat and user_lng:
#                 for housing in queryset:
#                     if housing.latitude and housing.longitude:
#                         distance = haversine(
#                             float(user_lat), float(user_lng),
#                             housing.latitude, housing.longitude
#                         )
#                         housing.distance = round(distance, 2)
#                         housing.score = compute_smart_score(housing, criteria, distance)
#                     else:
#                         housing.score = compute_smart_score(housing, criteria)
#                     results.append(housing)
                
#                 # Trier par score
#                 results.sort(key=lambda x: x.score, reverse=True)
#                 results = results[:10]  # Top 10
#             else:
#                 results = list(queryset[:10])
            
#             # 5. Sérialiser
#             serializer = HousingListSerializer(
#                 results,
#                 many=True,
#                 context={'request': request}
#             )
            
#             # 6. Générer réponse naturelle
#             bot_response = generate_response(criteria, len(results))
            
#             # 7. Suggestions si peu de résultats
#             suggestions = []
#             if len(results) < 3:
#                 suggestions = suggest_alternatives(criteria)
            
#             return Response({
#                 'message': user_message,
#                 'bot_response': bot_response,
#                 'criteria': criteria,
#                 'count': len(results),
#                 'results': serializer.data,
#                 'suggestions': suggestions
#             })
            
#         except Exception as e:
#             print(f"❌ Erreur chatbot: {e}")
#             import traceback
#             traceback.print_exc()
            
#             return Response({
#                 'message': user_message,
#                 'bot_response': "Désolé, je n'ai pas compris votre demande. Pouvez-vous reformuler ?",
#                 'error': str(e),
#                 'results': []
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
#     def _apply_criteria_filters(self, queryset, criteria):
#         """Applique les critères extraits au queryset"""
        
#         # Recherche textuelle
#         if criteria.get('query'):
#             queryset = queryset.filter(
#                 Q(title__icontains=criteria['query']) |
#                 Q(description__icontains=criteria['query']) |
#                 Q(additional_features__icontains=criteria['query'])
#             )
        
#         # Ville
#         if criteria.get('city'):
#             queryset = queryset.filter(city__name__icontains=criteria['city'])
        
#         # Quartier
#         if criteria.get('district_name'):
#             queryset = queryset.filter(district__name__icontains=criteria['district_name'])
        
#         # Catégorie
#         if criteria.get('category_name'):
#             queryset = queryset.filter(category__name__icontains=criteria['category_name'])
        
#         # Prix
#         if criteria.get('min_price'):
#             queryset = queryset.filter(price__gte=criteria['min_price'])
#         if criteria.get('max_price'):
#             queryset = queryset.filter(price__lte=criteria['max_price'])
        
#         # Chambres
#         if criteria.get('min_rooms'):
#             queryset = queryset.filter(rooms__gte=criteria['min_rooms'])
        
#         # Surface
#         if criteria.get('min_area'):
#             queryset = queryset.filter(area__gte=criteria['min_area'])
        
#         # Type meublé
#         if criteria.get('furnished') is not None:
#             if criteria['furnished']:
#                 queryset = queryset.filter(housing_type__name__icontains='meublé')
#             else:
#                 queryset = queryset.filter(housing_type__name__icontains='simple')
        
#         return queryset


# class ChatbotSuggestionsAPIView(APIView):
#     """
#     💡 Suggestions de recherche
    
#     GET /api/recherche/chatbot/suggestions/
#     """
#     permission_classes = [AllowAny]
    
#     def get(self, request):
#         suggestions = [
#             "Studio meublé à Yaoundé pour 50 000 FCFA",
#             "Appartement 2 chambres à Douala",
#             "Chambre proche université Yaoundé 1",
#             "Maison 3 chambres à Bastos",
#             "Logement pas cher à Essos",
#             "Studio moderne à moins de 60 000 FCFA",
#             "Appartement meublé près de Total Bastos",
#             "Cherche logement urgent à Yaoundé"
#         ]
        
#         return Response({
#             'suggestions': suggestions
#         })


# class ChatbotCitiesAPIView(APIView):
#     """
#     🏙️ Liste des villes disponibles
    
#     GET /api/recherche/chatbot/cities/
#     """
#     permission_classes = [AllowAny]
    
#     def get(self, request):
#         cities = City.objects.values_list('name', flat=True).distinct()
#         return Response({
#             'cities': list(cities)
#         })


# class ChatbotCategoriesAPIView(APIView):
#     """
#     🏠 Liste des catégories disponibles
    
#     GET /api/recherche/chatbot/categories/
#     """
#     permission_classes = [AllowAny]
    
#     def get(self, request):
#         categories = Category.objects.values('id', 'name', 'description')
#         return Response({
#             'categories': list(categories)
#         })

# ============================================
# 📁 apps/recherche/views.py  — CORRECTIF NLPSearchAPIView
#
# BUG CORRIGÉ :
#   Avant : criteria.get('query') → filtre brut "Studio meublé à Yaoundé pour 50 000 FCFA"
#           → aucun logement n'a ce texte exact → 0 résultats
#
#   Après : on utilise criteria.get('text_query') qui contient seulement
#           les termes résiduels pertinents (ex : "bastos essos")
#           Si vide → pas de filtre texte → tous les logements éligibles
#
# Les autres vues (HousingSearch, Nearby, Smart, Map) sont INCHANGÉES.
# Copiez uniquement la classe NLPSearchAPIView dans views.py.
# ============================================

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.db.models import Q

from apps.housing.models import Housing
from apps.housing.serializers import HousingListSerializer
from .utils import haversine, get_distance_category
from .scoring import compute_smart_score
from .ai import (
    extract_search_criteria,
    describe_criteria,
    generate_response,
    suggest_alternatives,
)
from .models import NearbyPlace, SearchHistory


class NLPSearchAPIView(APIView):
    """
    🔤 Recherche en langage naturel.

    POST /api/recherche/nlp/
    {
        "query"    : "Studio meublé à Yaoundé pour 50 000 FCFA",
        "language" : "fr",          // 'fr' | 'en'
        "method"   : "simple",      // 'simple' | 'ollama'
        "user_lat" : 3.848,         // optionnel
        "user_lng" : 11.502         // optionnel
    }

    Réponse :
    {
        "query"              : "...",
        "criteria_extracted" : { city, category_name, max_price, ... },
        "criteria_summary"   : "Recherche : Studio meublé à Yaoundé • max 50 000 FCFA",
        "count"              : 5,
        "results"            : [...],
        "suggestions"        : [...]
    }
    """
    permission_classes = [AllowAny]

    def post(self, request):
        user_query = request.data.get('query', '').strip()
        language   = request.data.get('language', 'fr')
        method     = request.data.get('method', 'simple')
        user_lat   = request.data.get('user_lat')
        user_lng   = request.data.get('user_lng')

        if not user_query:
            return Response({'error': 'query requis'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # 1. Extraction des critères
            criteria = extract_search_criteria(user_query, method=method, language=language)
            criteria['language'] = language

            # 2. Coordonnées GPS (optionnel)
            if user_lat and user_lng:
                try:
                    criteria['lat'] = float(user_lat)
                    criteria['lng'] = float(user_lng)
                except (ValueError, TypeError):
                    pass

            # 3. Résumé lisible pour l'interface
            summary = describe_criteria(criteria, language=language)

            # 4. Queryset de base
            queryset = Housing.objects.filter(
                is_visible=True, status='disponible'
            ).select_related(
                'owner', 'category', 'housing_type', 'region', 'city', 'district'
            ).prefetch_related('images')

            # 5. Application des filtres (CORRIGÉ)
            queryset = self._apply_filters(queryset, criteria)

            # 6. Scoring + géolocalisation
            results = []
            for h in queryset:
                distance = None
                if criteria.get('lat') and criteria.get('lng') and h.latitude and h.longitude:
                    distance   = haversine(criteria['lat'], criteria['lng'],
                                           h.latitude, h.longitude)
                    h.distance = round(distance, 2)
                    h.distance_category = get_distance_category(distance)
                h.score = compute_smart_score(h, criteria, distance)
                results.append(h)

            # 7. Tri
            sort_intent = criteria.get('sort')
            if sort_intent == 'price_asc':
                results.sort(key=lambda x: x.price)
            elif sort_intent == 'price_desc':
                results.sort(key=lambda x: -x.price)
            elif sort_intent == 'recent':
                results.sort(key=lambda x: -x.created_at.timestamp())
            else:
                results.sort(key=lambda x: -x.score)

            results = results[:20]

            # 8. Sérialisation
            serialized = HousingListSerializer(
                results, many=True, context={'request': request}
            ).data

            # 9. Suggestions si peu de résultats
            suggestions = []
            if len(results) < 3:
                suggestions = suggest_alternatives(criteria, language=language)

            # 10. Historique
            if request.user and request.user.is_authenticated:
                self._save_history(request.user, user_query, criteria, len(results))

            return Response({
                'query':              user_query,
                'criteria_extracted': {
                    k: v for k, v in criteria.items()
                    if k not in ('language', 'text_query')
                },
                'criteria_summary': summary,
                'count':            len(results),
                'results':          serialized,
                'suggestions':      suggestions,
            })

        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({
                'query':   user_query,
                'error':   str(e),
                'results': [],
                'count':   0,
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # -----------------------------------------------------------------------

    def _apply_filters(self, queryset, criteria: dict):
        """
        Applique les critères extraits au queryset.

        RÈGLE CLEF :
          - On n'utilise JAMAIS la requête brute originale comme filtre texte.
          - On utilise criteria['text_query'] (termes résiduels) seulement
            s'il n'est pas vide ET qu'il y a peu d'autres critères.
          - Les critères structurés (ville, catégorie, prix…) sont prioritaires.
        """

        # ── Ville ──────────────────────────────────────────────────────────
        if criteria.get('city'):
            queryset = queryset.filter(city__name__icontains=criteria['city'])

        # ── Quartier ───────────────────────────────────────────────────────
        if criteria.get('district_name'):
            queryset = queryset.filter(district__name__icontains=criteria['district_name'])

        # ── Catégorie ──────────────────────────────────────────────────────
        if criteria.get('category_name'):
            queryset = queryset.filter(category__name__icontains=criteria['category_name'])

        # ── Prix ───────────────────────────────────────────────────────────
        if criteria.get('min_price'):
            queryset = queryset.filter(price__gte=criteria['min_price'])
        if criteria.get('max_price'):
            queryset = queryset.filter(price__lte=criteria['max_price'])

        # ── Chambres ───────────────────────────────────────────────────────
        if criteria.get('min_rooms'):
            queryset = queryset.filter(rooms__gte=criteria['min_rooms'])

        # ── Surface ────────────────────────────────────────────────────────
        if criteria.get('min_area'):
            queryset = queryset.filter(area__gte=criteria['min_area'])

        # ── Meublé / Vide ──────────────────────────────────────────────────
        if criteria.get('furnished') is True:
            queryset = queryset.filter(
                Q(housing_type__name__icontains='meublé') |
                Q(housing_type__name__icontains='moderne')
            )
        elif criteria.get('furnished') is False:
            queryset = queryset.filter(housing_type__name__icontains='simple')

        # ── Équipements → additional_features + description + title ────────
        if criteria.get('features'):
            q_features = Q()
            for feat in criteria['features']:
                q_features |= Q(additional_features__icontains=feat)
                q_features |= Q(description__icontains=feat)
                q_features |= Q(title__icontains=feat)
            queryset = queryset.filter(q_features)

        # ── Lieux à proximité → NearbyPlace ────────────────────────────────
        if criteria.get('nearby_places'):
            housing_ids = []
            for h in queryset:
                nearby_qs = NearbyPlace.objects.filter(
                    city=h.city,
                    place_type__in=criteria['nearby_places']
                )
                if h.district:
                    # Quartier exact ou ville entière (OR)
                    nearby_qs = NearbyPlace.objects.filter(
                        Q(district=h.district) | Q(city=h.city, district__isnull=True),
                        place_type__in=criteria['nearby_places']
                    )
                if nearby_qs.exists():
                    housing_ids.append(h.id)
            # Fallback : si NearbyPlace vide → on ne filtre pas
            if housing_ids:
                queryset = queryset.filter(id__in=housing_ids)

        # ── Termes résiduels (text_query) ──────────────────────────────────
        # Utilisé SEULEMENT si aucun critère structuré n'a été trouvé
        # (= recherche vraiment libre par mots-clés)
        text_q = criteria.get('text_query', '').strip()
        has_structured = any(criteria.get(k) for k in [
            'city', 'district_name', 'category_name',
            'max_price', 'min_price', 'min_rooms', 'features', 'nearby_places'
        ])

        if text_q and not has_structured:
            # Recherche fulltext sur les termes résiduels
            q_text = Q()
            for term in text_q.split():
                q_text |= Q(title__icontains=term)
                q_text |= Q(description__icontains=term)
                q_text |= Q(city__name__icontains=term)
                q_text |= Q(district__name__icontains=term)
                q_text |= Q(additional_features__icontains=term)
            queryset = queryset.filter(q_text)

        return queryset

    def _save_history(self, user, query_text, criteria, results_count):
        try:
            SearchHistory.objects.create(
                user=user,
                query_text=query_text,
                min_price=criteria.get('min_price'),
                max_price=criteria.get('max_price'),
                min_rooms=criteria.get('min_rooms'),
                advanced_filters={
                    k: v for k, v in criteria.items()
                    if k not in ('language', 'lat', 'lng')
                },
                results_count=results_count,
                search_type='nlp',
                language=criteria.get('language', 'fr'),
            )
        except Exception as e:
            print(f"⚠️ Historique non sauvegardé : {e}")


class HousingSearchAPIView(APIView):
    def get(self, request):
        return Response({"message": "Search API works"})
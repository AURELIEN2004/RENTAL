
# ============================================
# 📁 apps/recherche/views.py - VERSION CORRIGÉE
# ============================================

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db.models import Q, Count, Avg, Min, Max

# ✅ IMPORTS CORRIGÉS
from apps.housing.models import Housing, Category, HousingType
from apps.housing.serializers import HousingListSerializer
from apps.location.models import Region, City, District

from .models import (
    SearchHistory, NearbyPlace, ChatbotConversation,
    ChatbotMessage, SearchPreference
)
from .serializers import (
    SearchHistorySerializer,
    NearbyPlaceSerializer,
    ChatbotConversationSerializer,
    SearchPreferenceSerializer
)
from .search_engine import NaturalLanguageSearchEngine
from .chatbot import LocalChatbot

# ✅ Imports conditionnels pour les dépendances optionnelles
try:
    from .voice_recognition import VoiceRecognition
    VOICE_AVAILABLE = True
except ImportError:
    VOICE_AVAILABLE = False
    print("⚠️ Module de reconnaissance vocale non disponible")


class SearchViewSet(viewsets.ViewSet):
    """
    API de recherche unifiée avec support:
    - Recherche par formulaire
    - Recherche en langage naturel
    - Recherche vocale
    - Filtres avancés
    """
    permission_classes = [AllowAny]
    
    @action(detail=False, methods=['post','get'])
    def search(self, request):
        """
        Recherche principale
        
        Body:
        {
            "query": "Appartement 2 chambres à Yaoundé",
            "filters": {
                "category": 1,
                "city": 2,
                "min_price": 50000,
                "max_price": 150000,
                "min_rooms": 2,
                "max_rooms": 3,
                "housing_type": 1,
                "district": 5
            },
            "search_type": "form" | "natural" | "voice",
            "language": "fr" | "en"
        }
        """
        query = request.data.get('query', '')
        filters = request.data.get('filters', {})
        search_type = request.data.get('search_type', 'form')
        language = request.data.get('language', 'fr')
        
        # Construire le queryset de base
        queryset = Housing.objects.filter(
            is_visible=True,
            status='disponible'
        ).select_related(
            'owner', 'category', 'housing_type', 
            'region', 'city', 'district'
        ).prefetch_related('images')
        
        # Appliquer les filtres
        if filters:
            queryset = self._apply_filters(queryset, filters)
        
        # Recherche en langage naturel si query fournie
        if query and search_type in ['natural', 'voice']:
            try:
                search_engine = NaturalLanguageSearchEngine(language=language)
                results = search_engine.search(
                    query=query,
                    user=request.user if request.user.is_authenticated else None,
                    base_queryset=queryset
                )
                queryset = results['housings']
            except Exception as e:
                print(f"⚠️ Erreur recherche NL: {e}")
                # Continuer avec la recherche normale
                if query:
                    queryset = queryset.filter(
                        Q(title__icontains=query) |
                        Q(description__icontains=query) |
                        Q(district__name__icontains=query)
                    )
        elif query:
            # Recherche textuelle simple
            queryset = queryset.filter(
                Q(title__icontains=query) |
                Q(description__icontains=query) |
                Q(district__name__icontains=query)
            )
        
        # Tri
        sort_by = request.data.get('sort_by', 'recent')
        queryset = self._apply_sorting(queryset, sort_by)
        
        # Sauvegarder l'historique si utilisateur connecté
        if request.user.is_authenticated:
            self._save_search_history(
                user=request.user,
                query=query,
                filters=filters,
                results_count=queryset.count(),
                search_type=search_type,
                language=language
            )
        
        # Serializer et retourner
        serializer = HousingListSerializer(
            queryset[:50],  # Limiter à 50 résultats
            many=True,
            context={'request': request}
        )
        
        return Response({
            'count': queryset.count(),
            'results': serializer.data
        })
    
    def _apply_filters(self, queryset, filters):
        """Appliquer tous les filtres"""
        
        # Catégorie
        if filters.get('category'):
            queryset = queryset.filter(category_id=filters['category'])
        
        # Type de logement
        if filters.get('housing_type'):
            queryset = queryset.filter(housing_type_id=filters['housing_type'])
        
        # Région
        if filters.get('region'):
            queryset = queryset.filter(region_id=filters['region'])
        
        # Ville
        if filters.get('city'):
            queryset = queryset.filter(city_id=filters['city'])
        
        # Quartier
        if filters.get('district'):
            queryset = queryset.filter(district_id=filters['district'])
        
        # Prix
        if filters.get('min_price'):
            queryset = queryset.filter(price__gte=filters['min_price'])
        if filters.get('max_price'):
            queryset = queryset.filter(price__lte=filters['max_price'])
        
        # Chambres
        if filters.get('min_rooms'):
            queryset = queryset.filter(rooms__gte=filters['min_rooms'])
        if filters.get('max_rooms'):
            queryset = queryset.filter(rooms__lte=filters['max_rooms'])
        
        # Superficie
        if filters.get('min_area'):
            queryset = queryset.filter(area__gte=filters['min_area'])
        if filters.get('max_area'):
            queryset = queryset.filter(area__lte=filters['max_area'])
        
        # Salles de bain
        if filters.get('min_bathrooms'):
            queryset = queryset.filter(bathrooms__gte=filters['min_bathrooms'])
        
        return queryset
    
    def _apply_sorting(self, queryset, sort_by):
        """Appliquer le tri"""
        sorting_map = {
            'recent': '-created_at',
            'price_asc': 'price',
            'price_desc': '-price',
            'area_asc': 'area',
            'area_desc': '-area',
            'popular': '-views_count',
            'liked': '-likes_count',
        }
        return queryset.order_by(sorting_map.get(sort_by, '-created_at'))
    
    def _save_search_history(self, user, query, filters, results_count, search_type, language):
        """Sauvegarder l'historique de recherche"""
        try:
            SearchHistory.objects.create(
                user=user,
                query_text=query,
                category_id=filters.get('category'),
                housing_type_id=filters.get('housing_type'),
                region_id=filters.get('region'),
                city_id=filters.get('city'),
                district_id=filters.get('district'),
                min_price=filters.get('min_price'),
                max_price=filters.get('max_price'),
                min_rooms=filters.get('min_rooms'),
                max_rooms=filters.get('max_rooms'),
                min_area=filters.get('min_area'),
                max_area=filters.get('max_area'),
                results_count=results_count,
                search_type=search_type,
                language=language,
                advanced_filters=filters
            )
        except Exception as e:
            print(f"⚠️ Erreur sauvegarde historique: {e}")
    
    @action(detail=False, methods=['get'])
    def filters(self, request):
        """
        ✅ CORRIGÉ: Retourne les options de filtrage avec données réelles
        """
        # Récupérer uniquement les catégories avec des logements visibles
        categories = Category.objects.filter(
            housing__is_visible=True,
            housing__status='disponible'
        ).distinct().values('id', 'name')
        
        # Récupérer uniquement les types avec des logements visibles
        housing_types = HousingType.objects.filter(
            housing__is_visible=True,
            housing__status='disponible'
        ).distinct().values('id', 'name')
        
        # Récupérer les régions avec des logements
        regions = Region.objects.filter(
            housing__is_visible=True,
            housing__status='disponible'
        ).distinct().values('id', 'name')
        
        # Récupérer les villes avec des logements
        cities = City.objects.filter(
            housing__is_visible=True,
            housing__status='disponible'
        ).distinct().values('id', 'name', 'region_id').annotate(
            region_name=Q('region__name')
        )
        
        # Récupérer les quartiers avec des logements
        districts = District.objects.filter(
            housing__is_visible=True,
            housing__status='disponible'
        ).distinct().values('id', 'name', 'city_id')
        
        # Statistiques de prix
        price_stats = Housing.objects.filter(
            is_visible=True,
            status='disponible'
        ).aggregate(
            min_price=Min('price'),
            max_price=Max('price'),
            avg_price=Avg('price')
        )
        
        return Response({
            'categories': list(categories),
            'housing_types': list(housing_types),
            'regions': list(regions),
            'cities': list(cities),
            'districts': list(districts),
            'price_range': {
                'min': price_stats['min_price'] or 0,
                'max': price_stats['max_price'] or 1000000,
                'avg': round(price_stats['avg_price'] or 0, 2)
            },
            'rooms_range': {
                'min': 1,
                'max': 10
            },
            'area_range': {
                'min': 10,
                'max': 500
            }
        })
    
    @action(detail=False, methods=['get'])
    def suggestions(self, request):
        """
        Suggestions de recherche basées sur l'historique
        """
        if not request.user.is_authenticated:
            return Response({'suggestions': []})
        
        # Récupérer les recherches récentes de l'utilisateur
        recent_searches = SearchHistory.objects.filter(
            user=request.user
        ).order_by('-created_at')[:10]
        
        suggestions = []
        for search in recent_searches:
            if search.query_text:
                suggestions.append({
                    'text': search.query_text,
                    'type': 'recent',
                    'filters': {
                        'city': search.city.name if search.city else None,
                        'category': search.category.name if search.category else None,
                    }
                })
        
        # Ajouter des suggestions populaires
        popular = [
            {'text': 'Appartement meublé Yaoundé', 'type': 'popular'},
            {'text': 'Studio centre-ville Douala', 'type': 'popular'},
            {'text': 'Maison 3 chambres', 'type': 'popular'},
        ]
        
        return Response({
            'suggestions': suggestions[:5] + popular[:3]
        })


class SearchHistoryViewSet(viewsets.ReadOnlyModelViewSet):
    """Historique des recherches"""
    serializer_class = SearchHistorySerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return SearchHistory.objects.filter(user=self.request.user)
    
    @action(detail=False, methods=['delete'])
    def clear(self, request):
        """Effacer l'historique"""
        deleted_count = SearchHistory.objects.filter(user=request.user).delete()[0]
        return Response({
            'message': f'{deleted_count} recherche(s) supprimée(s)'
        })


class NearbyPlaceViewSet(viewsets.ModelViewSet):
    """Lieux à proximité"""
    queryset = NearbyPlace.objects.all()
    serializer_class = NearbyPlaceSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        queryset = NearbyPlace.objects.all()
        
        # Filtrer par type
        place_type = self.request.query_params.get('type')
        if place_type:
            queryset = queryset.filter(place_type=place_type)
        
        # Filtrer par ville
        city = self.request.query_params.get('city')
        if city:
            queryset = queryset.filter(city_id=city)
        
        # Filtrer par quartier
        district = self.request.query_params.get('district')
        if district:
            queryset = queryset.filter(district_id=district)
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def types(self, request):
        """Liste des types de lieux disponibles"""
        return Response({
            'types': [
                {'value': choice[0], 'label': choice[1]}
                for choice in NearbyPlace.PLACE_TYPE_CHOICES
            ]
        })


class ChatbotViewSet(viewsets.ViewSet):
    """
    ✅ CORRIGÉ: API Chatbot avec gestion d'erreurs
    """
    permission_classes = [AllowAny]
    
    @action(detail=False, methods=['post'])
    def chat(self, request):
        """
        Envoyer un message au chatbot
        
        Body:
        {
            "message": "Je cherche un appartement...",
            "session_id": "optional-uuid",
            "language": "fr" | "en"
        }
        """
        message = request.data.get('message')
        session_id = request.data.get('session_id')
        language = request.data.get('language', 'fr')
        
        if not message:
            return Response(
                {'error': 'Message requis'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Initialiser le chatbot
            chatbot = LocalChatbot(language=language)
            
            # Traiter le message
            response = chatbot.chat(
                user_message=message,
                session_id=session_id,
                user=request.user if request.user.is_authenticated else None
            )
            
            # Formater les résultats de recherche si présents
            if response.get('results'):
                housing_ids = [r['id'] for r in response['results']]
                housings = Housing.objects.filter(id__in=housing_ids)
                
                results_serializer = HousingListSerializer(
                    housings,
                    many=True,
                    context={'request': request}
                )
                response['results'] = results_serializer.data
            
            return Response(response)
            
        except Exception as e:
            print(f"❌ Erreur chatbot: {e}")
            return Response({
                'response': "Désolé, je rencontre un problème technique. Pouvez-vous reformuler votre question ?",
                'error': str(e),
                'session_id': session_id
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['post'])
    def voice_chat(self, request):
        """
        ✅ CORRIGÉ: Chat vocal avec vérification de disponibilité
        """
        if not VOICE_AVAILABLE:
            return Response({
                'error': 'La reconnaissance vocale n\'est pas disponible. Installez les dépendances: pip install SpeechRecognition pydub'
            }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        
        audio_file = request.FILES.get('audio')
        session_id = request.data.get('session_id')
        language = request.data.get('language', 'fr')
        
        if not audio_file:
            return Response(
                {'error': 'Fichier audio requis'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Transcrire
            voice_recognition = VoiceRecognition(language=language)
            
            import tempfile
            import os
            
            with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_file:
                for chunk in audio_file.chunks():
                    temp_file.write(chunk)
                temp_path = temp_file.name
            
            try:
                transcription = voice_recognition.transcribe(temp_path)
                
                if not transcription:
                    return Response(
                        {'error': 'Impossible de transcrire l\'audio'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                # Envoyer au chatbot
                chatbot = LocalChatbot(language=language)
                response = chatbot.chat(
                    user_message=transcription,
                    session_id=session_id,
                    user=request.user if request.user.is_authenticated else None,
                    is_voice=True
                )
                
                response['transcription'] = transcription
                
                return Response(response)
            
            finally:
                os.unlink(temp_path)
                
        except Exception as e:
            print(f"❌ Erreur voice chat: {e}")
            return Response({
                'error': f'Erreur lors du traitement vocal: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['get'])
    def history(self, request):
        """Historique des conversations"""
        if not request.user.is_authenticated:
            return Response({'conversations': []})
        
        conversations = ChatbotConversation.objects.filter(
            user=request.user
        ).order_by('-updated_at')[:10]
        
        serializer = ChatbotConversationSerializer(conversations, many=True)
        
        return Response({'conversations': serializer.data})


class SearchPreferenceViewSet(viewsets.ModelViewSet):
    """Préférences de recherche"""
    serializer_class = SearchPreferenceSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return SearchPreference.objects.filter(user=self.request.user)
    
    def get_object(self):
        """Récupérer ou créer les préférences"""
        obj, created = SearchPreference.objects.get_or_create(
            user=self.request.user
        )
        return obj
    
    @action(detail=False, methods=['get', 'put'])
    def my_preferences(self, request):
        """Gérer les préférences de l'utilisateur"""
        if request.method == 'GET':
            preferences = self.get_object()
            serializer = self.get_serializer(preferences)
            return Response(serializer.data)
        
        else:  # PUT
            preferences = self.get_object()
            serializer = self.get_serializer(preferences, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)
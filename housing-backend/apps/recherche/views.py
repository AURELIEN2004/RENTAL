
from django.shortcuts import render

# Create your views here.
# ============================================
# 📁 apps/recherche/views.py
# ============================================

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.core.files.base import ContentFile
import base64

from .models import (
    SearchHistory, NearbyPlace, ChatbotConversation,
    ChatbotMessage, SearchPreference
)
from .serializers import (
    SearchHistorySerializer, NearbyPlaceSerializer,
    ChatbotConversationSerializer, ChatbotMessageSerializer,
    SearchPreferenceSerializer, SearchRequestSerializer,
    VoiceSearchSerializer
)
from .search_engine import SearchEngine
from .chatbot import LocalChatbot, VoiceRecognition
from apps.housing.serializers import HousingListSerializer


class SearchViewSet(viewsets.ViewSet):
    """
    ViewSet pour la recherche de logements
    """
    permission_classes = [AllowAny]
    
    @action(detail=False, methods=['post', 'get'])
    def search(self, request):
        """
        Endpoint principal de recherche
        
        POST: Recherche avec filtres détaillés
        GET: Recherche simple avec query params
        """
        if request.method == 'POST':
            serializer = SearchRequestSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            params = serializer.validated_data
        else:
            # GET - construire params depuis query params
            params = {
                'query': request.query_params.get('query'),
                'category': request.query_params.get('category'),
                'city': request.query_params.get('city'),
                'min_price': request.query_params.get('min_price'),
                'max_price': request.query_params.get('max_price'),
                'use_genetic_algorithm': request.query_params.get('use_ga', 'false').lower() == 'true'
            }
            # Nettoyer les None
            params = {k: v for k, v in params.items() if v is not None}
        
        # Extraire les paramètres
        query = params.pop('query', None)
        use_ga = params.pop('use_genetic_algorithm', False)
        language = params.pop('language', 'fr')
        
        # Rechercher
        search_engine = SearchEngine(
            user=request.user if request.user.is_authenticated else None,
            language=language
        )
        
        results = search_engine.search(
            query=query,
            filters=params,
            use_genetic_algorithm=use_ga
        )
        
        # Paginer les résultats
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 20))
        start = (page - 1) * page_size
        end = start + page_size
        
        paginated_results = results[start:end]
        
        # Sérialiser
        serializer = HousingListSerializer(
            paginated_results,
            many=True,
            context={'request': request}
        )
        
        return Response({
            'count': len(results),
            'page': page,
            'page_size': page_size,
            'results': serializer.data,
            'filters_applied': params
        })
    
    @action(detail=False, methods=['post'])
    def voice_search(self, request):
        """
        Recherche vocale
        
        Accepte un fichier audio, le transcrit, puis effectue une recherche
        """
        serializer = VoiceSearchSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        audio_file = serializer.validated_data['audio_file']
        language = serializer.validated_data['language']
        
        # Transcrire
        voice_recognition = VoiceRecognition(language=language)
        
        # Sauvegarder temporairement le fichier
        import tempfile
        import os
        
        with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_file:
            for chunk in audio_file.chunks():
                temp_file.write(chunk)
            temp_path = temp_file.name
        
        try:
            # Transcrire
            transcription = voice_recognition.transcribe(temp_path)
            
            if not transcription:
                return Response(
                    {'error': 'Impossible de transcrire l\'audio'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Effectuer la recherche avec le texte transcrit
            search_engine = SearchEngine(
                user=request.user if request.user.is_authenticated else None,
                language=language
            )
            
            results = search_engine.search(query=transcription)
            
            # Sérialiser
            serializer = HousingListSerializer(
                results[:20],  # Top 20
                many=True,
                context={'request': request}
            )
            
            return Response({
                'transcription': transcription,
                'count': len(results),
                'results': serializer.data
            })
        
        finally:
            # Nettoyer le fichier temporaire
            os.unlink(temp_path)
    
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
    """API Chatbot"""
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
            from apps.housing.models import Housing
            housings = Housing.objects.filter(id__in=housing_ids)
            
            results_serializer = HousingListSerializer(
                housings,
                many=True,
                context={'request': request}
            )
            response['results'] = results_serializer.data
        
        return Response(response)
    
    @action(detail=False, methods=['post'])
    def voice_chat(self, request):
        """
        Chat vocal avec le chatbot
        
        Accepte un fichier audio, le transcrit, envoie au chatbot
        """
        audio_file = request.FILES.get('audio')
        session_id = request.data.get('session_id')
        language = request.data.get('language', 'fr')
        
        if not audio_file:
            return Response(
                {'error': 'Fichier audio requis'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
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


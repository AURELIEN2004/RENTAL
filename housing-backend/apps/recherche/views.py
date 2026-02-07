
# ============================================
# 📁 apps/recherche/views.py
# ============================================

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q
import uuid

from apps.housing.models import Housing
from apps.housing.serializers import HousingListSerializer
from .models import ConversationHistory, UserPreference
from .ai_advanced import (
    extract_filters_advanced,
    search_with_advanced_filters,
    generate_chatbot_response
)
from .utils import haversine
from .scoring import compute_score, score_distance


class ChatbotAPIView(APIView):
    """
    API principale du chatbot conversationnel
    
    POST /api/recherche/chatbot/
    Body: {
        "message": "Je cherche un studio à Yaoundé",
        "conversation_id": "uuid-optional",
        "user_id": 1  # optionnel
    }
    """
    
    permission_classes = []  # Accessible sans authentification
    
    def post(self, request):
        message = request.data.get('message', '').strip()
        conversation_id = request.data.get('conversation_id')
        user_id = request.data.get('user_id')
        
        if not message:
            return Response(
                {'error': 'Message requis'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # ============================================
        # 1. GÉNÉRER/RÉCUPÉRER L'ID DE CONVERSATION
        # ============================================
        
        if not conversation_id:
            conversation_id = str(uuid.uuid4())
        
        # ============================================
        # 2. RÉCUPÉRER L'HISTORIQUE
        # ============================================
        
        conversation_history = self._get_conversation_history(conversation_id)
        
        # ============================================
        # 3. EXTRAIRE LES FILTRES
        # ============================================
        
        filters_data = extract_filters_advanced(message, conversation_history)
        
        # ============================================
        # 4. RECHERCHE DANS LA BASE
        # ============================================
        
        results = search_with_advanced_filters(filters_data)
        
        # ============================================
        # 5. GÉNÉRATION DE LA RÉPONSE
        # ============================================
        
        bot_response = generate_chatbot_response(filters_data, results.count())
        
        # ============================================
        # 6. SAUVEGARDER L'HISTORIQUE
        # ============================================
        
        self._save_conversation(
            conversation_id=conversation_id,
            user_message=message,
            bot_response=bot_response,
            filters_data=filters_data,
            results_count=results.count(),
            user_id=user_id
        )
        
        # ============================================
        # 7. GÉNÉRER DES SUGGESTIONS
        # ============================================
        
        suggestions = self._generate_suggestions(filters_data, results.count())
        
        # ============================================
        # 8. SÉRIALISER ET RETOURNER
        # ============================================
        
        serializer = HousingListSerializer(results[:20], many=True, context={'request': request})
        
        return Response({
            "conversation_id": conversation_id,
            "bot_response": bot_response,
            "filters_detected": filters_data.get("filters", {}),
            "search_type": filters_data.get("search_type", "standard"),
            "proximity_search": filters_data.get("proximity_search"),
            "features_keywords": filters_data.get("features_keywords", []),
            "count": results.count(),
            "results": serializer.data,
            "suggestions": suggestions
        })
    
    def _get_conversation_history(self, conversation_id):
        """Récupère l'historique d'une conversation."""
        try:
            history_items = ConversationHistory.objects.filter(
                conversation_id=conversation_id
            ).order_by('-created_at')[:5]  # 5 derniers messages
            
            return [
                {
                    "user": item.user_message,
                    "assistant": item.bot_response
                }
                for item in reversed(history_items)
            ]
        except:
            return None
    
    def _save_conversation(self, conversation_id, user_message, bot_response, 
                          filters_data, results_count, user_id=None):
        """Sauvegarde l'échange dans l'historique."""
        try:
            from django.contrib.auth import get_user_model
            User = get_user_model()
            
            user = None
            if user_id:
                try:
                    user = User.objects.get(id=user_id)
                except:
                    pass
            elif hasattr(self.request, 'user') and self.request.user.is_authenticated:
                user = self.request.user
            
            ConversationHistory.objects.create(
                conversation_id=conversation_id,
                user=user,
                user_message=user_message,
                bot_response=bot_response,
                filters_extracted=filters_data.get("filters", {}),
                search_type=filters_data.get("search_type", "standard"),
                results_count=results_count
            )
        except Exception as e:
            print(f"⚠️ Erreur sauvegarde conversation : {e}")
    
    def _generate_suggestions(self, filters_data, results_count):
        """Génère des suggestions de questions ou actions."""
        suggestions = []
        
        search_type = filters_data.get("search_type")
        
        if results_count == 0:
            # Pas de résultats : suggérer d'élargir
            suggestions.append("Élargir la zone de recherche")
            suggestions.append("Augmenter le budget")
            suggestions.append("Chercher sans certains critères")
        
        elif results_count < 3:
            # Peu de résultats : suggérer des alternatives
            suggestions.append("Voir des logements similaires")
            suggestions.append("Élargir les critères")
        
        else:
            # Beaucoup de résultats : suggérer d'affiner
            if search_type == "proximity":
                suggestions.append("Affiner par prix")
                suggestions.append("Ajouter des caractéristiques")
            elif search_type == "features":
                suggestions.append("Préciser la localisation")
                suggestions.append("Affiner par type de logement")
            else:
                suggestions.append("Chercher près d'un lieu précis")
                suggestions.append("Ajouter des caractéristiques souhaitées")
        
        return suggestions[:3]  # Max 3 suggestions


class SmartSearchAPIView(APIView):
    """
    Recherche intelligente avec scoring
    
    GET /api/recherche/smart/?city=Yaoundé&type=studio&max_price=80000
    """
    
    permission_classes = []
    
    def get(self, request):
        criteria = {
            "city": request.query_params.get("city"),
            "category": request.query_params.get("type"),
            "max_price": request.query_params.get("max_price"),
        }
        
        # Convertir max_price en int si présent
        if criteria["max_price"]:
            try:
                criteria["max_price"] = int(criteria["max_price"])
            except:
                criteria["max_price"] = None
        
        lat = request.query_params.get("lat")
        lng = request.query_params.get("lng")
        
        results = []
        
        # Récupérer les logements disponibles
        housings = Housing.objects.filter(
            is_visible=True,
            status='disponible'
        ).select_related(
            'owner', 'category', 'housing_type', 'region', 'city', 'district'
        ).prefetch_related('images')
        
        # Calculer le score pour chaque logement
        for h in housings:
            score = compute_score(h, criteria)
            
            # Ajouter le score de distance si coordonnées fournies
            if lat and lng and h.latitude and h.longitude:
                try:
                    distance = haversine(
                        float(lat), float(lng),
                        h.latitude, h.longitude
                    )
                    score += score_distance(distance)
                    h.distance = round(distance, 2)
                except:
                    pass
            
            h.score = score
            results.append(h)
        
        # Trier par score décroissant
        results.sort(key=lambda x: x.score, reverse=True)
        
        # Sérialiser
        serialized = HousingListSerializer(
            results[:50],  # Max 50 résultats
            many=True,
            context={'request': request}
        ).data
        
        # Ajouter score et distance aux résultats
        for i, h in enumerate(results[:50]):
            serialized[i]['score'] = h.score
            if hasattr(h, 'distance'):
                serialized[i]['distance'] = h.distance
        
        return Response({
            'count': len(results),
            'results': serialized
        })


class NearbyHousingAPIView(APIView):
    """
    Recherche de logements à proximité
    
    GET /api/recherche/nearby/?lat=3.8480&lng=11.5021&radius=5
    """
    
    permission_classes = []
    
    def get(self, request):
        try:
            lat = float(request.query_params.get("lat"))
            lng = float(request.query_params.get("lng"))
            radius = float(request.query_params.get("radius", 5))  # km
        except (TypeError, ValueError):
            return Response(
                {"error": "Coordonnées invalides"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Récupérer les logements avec coordonnées
        housings_list = []
        housings = Housing.objects.filter(
            is_visible=True,
            status='disponible',
            latitude__isnull=False,
            longitude__isnull=False
        ).select_related(
            'owner', 'category', 'housing_type', 'region', 'city', 'district'
        ).prefetch_related('images')
        
        # Calculer les distances
        for h in housings:
            try:
                distance = haversine(lat, lng, h.latitude, h.longitude)
                if distance <= radius:
                    h.distance = round(distance, 2)
                    housings_list.append(h)
            except:
                continue
        
        # Trier par distance
        housings_list.sort(key=lambda x: x.distance)
        
        # Sérialiser
        data = HousingListSerializer(
            housings_list,
            many=True,
            context={'request': request}
        ).data
        
        # Ajouter la distance
        for i, h in enumerate(housings_list):
            data[i]['distance'] = h.distance
        
        return Response({
            'count': len(housings_list),
            'results': data
        })


class ConversationHistoryAPIView(APIView):
    """
    Récupère l'historique d'une conversation
    
    GET /api/recherche/conversation/<conversation_id>/
    """
    
    def get(self, request, conversation_id):
        try:
            history = ConversationHistory.objects.filter(
                conversation_id=conversation_id
            ).order_by('created_at')
            
            data = [
                {
                    "id": item.id,
                    "user_message": item.user_message,
                    "bot_response": item.bot_response,
                    "filters_extracted": item.filters_extracted,
                    "search_type": item.search_type,
                    "results_count": item.results_count,
                    "created_at": item.created_at
                }
                for item in history
            ]
            
            return Response({
                "conversation_id": conversation_id,
                "messages": data
            })
        
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_404_NOT_FOUND
            )


class UserConversationsAPIView(APIView):
    """
    Liste toutes les conversations d'un utilisateur
    
    GET /api/recherche/conversations/
    """
    
    def get(self, request):
        user = request.user
        
        if not user.is_authenticated:
            return Response(
                {"error": "Authentification requise"},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Récupérer toutes les conversations de l'utilisateur
        conversations = ConversationHistory.objects.filter(
            user=user
        ).values('conversation_id').distinct()
        
        data = []
        for conv in conversations:
            conv_id = conv['conversation_id']
            
            # Premier et dernier message
            messages = ConversationHistory.objects.filter(
                conversation_id=conv_id
            ).order_by('created_at')
            
            if messages.exists():
                first_msg = messages.first()
                last_msg = messages.last()
                
                data.append({
                    "conversation_id": conv_id,
                    "first_message": first_msg.user_message[:100],
                    "last_message": last_msg.user_message[:100],
                    "message_count": messages.count(),
                    "created_at": first_msg.created_at,
                    "updated_at": last_msg.created_at
                })
        
        return Response({
            "conversations": data
        })
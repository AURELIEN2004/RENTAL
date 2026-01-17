# ============================================
# 📁 apps/messaging/views.py - VERSION CORRIGÉE
# ============================================

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q, Max
from .models import Conversation, Message
from .serializers import ConversationSerializer, MessageSerializer
from apps.housing.models import Housing
from apps.notifications.models import Notification


class ConversationViewSet(viewsets.ModelViewSet):
    serializer_class = ConversationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Retourne les conversations de l'utilisateur, triées par dernière activité"""
        return Conversation.objects.filter(
            participants=self.request.user
        ).annotate(
            last_message_time=Max('messages__created_at')
        ).order_by('-last_message_time')
    
    def list(self, request, *args, **kwargs):
        """Liste des conversations avec contexte complet"""
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def start(self, request):
        """Démarrer une conversation sur un logement"""
        housing_id = request.data.get('housing_id')
        
        if not housing_id:
            return Response(
                {'error': 'housing_id requis'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            housing = Housing.objects.get(id=housing_id)
        except Housing.DoesNotExist:
            return Response(
                {'error': 'Logement introuvable'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Vérifier que l'utilisateur n'est pas le propriétaire
        if housing.owner == request.user:
            return Response(
                {'error': 'Vous ne pouvez pas créer une conversation avec vous-même'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Vérifier si conversation existe déjà
        existing = Conversation.objects.filter(
            housing=housing
        ).filter(
            participants=request.user
        ).filter(
            participants=housing.owner
        ).first()
        
        if existing:
            serializer = self.get_serializer(existing)
            return Response({
                'message': 'Conversation existante',
                'conversation': serializer.data
            })
        
        # Créer nouvelle conversation
        conversation = Conversation.objects.create(housing=housing)
        conversation.participants.add(request.user, housing.owner)
        
        # Créer notification pour le propriétaire
        Notification.objects.create(
            user=housing.owner,
            type='message',
            title='Nouvelle conversation',
            message=f'{request.user.username} souhaite discuter de {housing.title}',
            link=f'/dashboard/messages/{conversation.id}'
        )
        
        serializer = self.get_serializer(conversation)
        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED
        )


class MessageViewSet(viewsets.ModelViewSet):
    queryset = Message.objects.all()  # ✅ AJOUTÉ - queryset de base requis
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filtrer les messages par conversation"""
        conversation_id = self.request.query_params.get('conversation')
        
        if conversation_id:
            # Vérifier que l'utilisateur est participant
            try:
                conversation = Conversation.objects.get(
                    id=conversation_id,
                    participants=self.request.user
                )
                return Message.objects.filter(
                    conversation=conversation
                ).order_by('created_at')  # Plus ancien en premier
            except Conversation.DoesNotExist:
                return Message.objects.none()
        
        return Message.objects.none()
    
    def create(self, request, *args, **kwargs):
        """Créer un message avec gestion d'erreur améliorée"""
        conversation_id = request.data.get('conversation')
        
        if not conversation_id:
            return Response(
                {'error': 'conversation_id requis'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Vérifier que l'utilisateur est participant
        try:
            conversation = Conversation.objects.get(
                id=conversation_id,
                participants=request.user
            )
        except Conversation.DoesNotExist:
            return Response(
                {'error': 'Conversation introuvable ou accès refusé'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Créer le message
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        message = serializer.save(sender=request.user)
        
        # Mettre à jour le timestamp de la conversation
        conversation.save()  # Déclenche updated_at
        
        # Notifier les autres participants
        other_participants = conversation.participants.exclude(id=request.user.id)
        for participant in other_participants:
            Notification.objects.create(
                user=participant,
                type='message',
                title='Nouveau message',
                message=f'{request.user.username}: {message.content[:50]}...',
                link=f'/dashboard/messages/{conversation.id}'
            )
        
        # Retourner le message créé avec toutes les infos
        return Response(
            self.get_serializer(message).data,
            status=status.HTTP_201_CREATED
        )
    
    @action(detail=False, methods=['post'])
    def mark_as_read(self, request):
        """Marquer les messages d'une conversation comme lus"""
        conversation_id = request.data.get('conversation_id')
        
        if not conversation_id:
            return Response(
                {'error': 'conversation_id requis'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Marquer tous les messages non lus de cette conversation
        updated = Message.objects.filter(
            conversation_id=conversation_id,
            is_read=False
        ).exclude(
            sender=request.user
        ).update(is_read=True)
        
        return Response({
            'message': f'{updated} message(s) marqué(s) comme lu(s)'
        })
from django.shortcuts import render

# Create your views here.

# ============================================
# 📁 apps/messaging/views.py
# ============================================

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Conversation, Message
from .serializers import ConversationSerializer, MessageSerializer
from apps.housing.models import Housing


class ConversationViewSet(viewsets.ModelViewSet):
    queryset = Conversation.objects.all()
    serializer_class = ConversationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Conversation.objects.filter(
            participants=self.request.user
        ).order_by('-updated_at')
    
    @action(detail=False, methods=['post'])
    def start(self, request):
        """Démarrer une conversation sur un logement"""
        housing_id = request.data.get('housing_id')
        housing = Housing.objects.get(id=housing_id)
        
        # Vérifier si conversation existe déjà
        existing = Conversation.objects.filter(
            housing=housing,
            participants=request.user
        ).filter(participants=housing.owner).first()
        
        if existing:
            serializer = self.get_serializer(existing)
            return Response(serializer.data)
        
        # Créer nouvelle conversation
        conversation = Conversation.objects.create(housing=housing)
        conversation.participants.add(request.user, housing.owner)
        
        serializer = self.get_serializer(conversation)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class MessageViewSet(viewsets.ModelViewSet):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        conversation_id = self.request.query_params.get('conversation')
        if conversation_id:
            return Message.objects.filter(conversation_id=conversation_id)
        return Message.objects.none()
    
    def perform_create(self, serializer):
        message = serializer.save(sender=self.request.user)
        
        # Créer notification pour le destinataire
        conversation = message.conversation
        recipient = conversation.participants.exclude(
            id=self.request.user.id
        ).first()
        
        if recipient:
            Notification.objects.create(
                user=recipient,
                type='message',
                title='Nouveau message',
                message=f'{self.request.user.username} vous a envoyé un message',
                link=f'/dashboard/messages?conversation={conversation.id}'
            )
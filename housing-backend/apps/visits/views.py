from django.shortcuts import render

# 📁 apps/visits/views.py
# ============================================

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Visit
from .serializers import VisitSerializer
from apps.notifications.models import Notification


class VisitViewSet(viewsets.ModelViewSet):
    queryset = Visit.objects.all()
    serializer_class = VisitSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_proprietaire:
            return Visit.objects.filter(housing__owner=user)
        return Visit.objects.filter(locataire=user)
    
    def perform_create(self, serializer):
        visit = serializer.save(locataire=self.request.user)
        
        # Créer notification pour le propriétaire
        Notification.objects.create(
            user=visit.housing.owner,
            type='visit',
            title='Nouvelle demande de visite',
            message=f'{visit.locataire.username} souhaite visiter {visit.housing.title}',
            link=f'/visits/{visit.id}'
        )
    
    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        """Confirmer une visite"""
        visit = self.get_object()
        visit.status = 'confirme'
        visit.save()
        
        # Notifier le locataire
        Notification.objects.create(
            user=visit.locataire,
            type='visit_confirmed',
            title='Visite confirmée',
            message=f'Votre visite pour {visit.housing.title} a été confirmée',
            link=f'/visits/{visit.id}'
        )
        
        return Response({'status': 'confirmed'})
    
    @action(detail=True, methods=['post'])
    def refuse(self, request, pk=None):
        """Refuser une visite"""
        visit = self.get_object()
        visit.status = 'refuse'
        visit.response_message = request.data.get('message', '')
        visit.save()
        
        # Notifier le locataire
        Notification.objects.create(
            user=visit.locataire,
            type='visit_refused',
            title='Visite refusée',
            message=f'Votre demande de visite pour {visit.housing.title} a été refusée',
            link=f'/visits/{visit.id}'
        )
        
        return Response({'status': 'refused'})


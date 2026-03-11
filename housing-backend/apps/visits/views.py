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

from rest_framework.decorators import action

class VisitViewSet(viewsets.ModelViewSet):
    queryset = Visit.objects.all()
    serializer_class = VisitSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filtrer selon le rôle"""
        user = self.request.user
        if user.is_proprietaire:
            # Propriétaire voit les visites de ses logements
            return Visit.objects.filter(housing__owner=user)
        # Locataire voit ses propres visites
        return Visit.objects.filter(locataire=user)
    
    def perform_create(self, serializer):
        """Créer une visite avec notification"""
        visit = serializer.save(locataire=self.request.user)
        
        # Créer notification pour le propriétaire
        from apps.notifications.models import Notification
        # Notification.objects.create(
        #     user=visit.housing.owner,
        #     type='visit',
        #     title='Nouvelle demande de visite',
        #     message=f'{visit.locataire.username} souhaite visiter {visit.housing.title}',
        #     link=f'/dashboard/reservations'
        # )
        Notification.objects.create(
            user=visit.housing.owner,
            type='visit',
            title_fr='Nouvelle demande de visite',
            title_en='New visit request',
            message_fr=f'{visit.locataire.username} souhaite visiter {visit.housing.title_fr or visit.housing.title}',
            message_en=f'{visit.locataire.username} wants to visit {visit.housing.title_en or visit.housing.title}',
            link='/dashboard?tab=reservations'
        )
    
    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        """Confirmer une visite"""
        visit = self.get_object()
        visit.status = 'confirme'
        visit.save()
        
        # Notifier le locataire
        from apps.notifications.models import Notification
        # Notification.objects.create(
        #     user=visit.locataire,
        #     type='visit_confirmed',
        #     title='Visite confirmée',
        #     message=f'Votre visite pour {visit.housing.title} a été confirmée',
        #     link=f'/dashboard/visites'
        # )
        Notification.objects.create(
            user=visit.locataire,
            type='visit_confirmed',
            title_fr='Visite confirmée',
            title_en='Visit confirmed',
            message_fr=f'Votre visite pour {visit.housing.title_fr or visit.housing.title} a été confirmée',
            message_en=f'Your visit for {visit.housing.title_en or visit.housing.title} has been confirmed',
            link='/dashboard?tab=visits'
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
        from apps.notifications.models import Notification
        # Notification.objects.create(
        #     user=visit.locataire,
        #     type='visit_refused',
        #     title='Visite refusée',
        #     message=f'Votre demande de visite pour {visit.housing.title} a été refusée',
        #     link=f'/dashboard/visites'
        # )
        Notification.objects.create(
            user=visit.locataire,
            type='visit_refused',
            title_fr='Visite refusée',
            title_en='Visit refused',
            message_fr=f'Votre demande de visite pour {visit.housing.title_fr or visit.housing.title} a été refusée',
            message_en=f'Your visit request for {visit.housing.title_en or visit.housing.title} has been refused',
            link='/dashboard?tab=visits'
        )
        
        return Response({'status': 'refused'})
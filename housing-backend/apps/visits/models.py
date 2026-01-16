from django.db import models

# Create your models here.

# ============================================
# 📁 apps/visits/models.py
# ============================================

from django.db import models
from django.conf import settings


class Visit(models.Model):
    """Demande de visite d'un logement"""
    STATUS_CHOICES = [
        ('attente', 'En attente'),
        ('confirme', 'Confirmée'),
        ('refuse', 'Refusée'),
        ('annule', 'Annulée'),
    ]
    
    housing = models.ForeignKey('housing.Housing', on_delete=models.CASCADE, related_name='visits')
    locataire = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='visits')
    
    date = models.DateField(verbose_name="Date de visite")
    time = models.TimeField(verbose_name="Heure de visite")
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='attente')
    
    message = models.TextField(blank=True, verbose_name="Message du locataire")
    response_message = models.TextField(blank=True, verbose_name="Réponse du propriétaire")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Visite"
        verbose_name_plural = "Visites"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Visite de {self.housing.title} le {self.date}"
    
    @property
    def is_upcoming(self):
        from datetime import datetime
        visit_datetime = datetime.combine(self.date, self.time)
        return visit_datetime > datetime.now() and self.status == 'confirme'

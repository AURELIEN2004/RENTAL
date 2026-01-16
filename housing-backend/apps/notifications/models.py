from django.db import models

# Create your models here.
# ============================================
# 📁 apps/notifications/models.py
# ============================================

from django.db import models
from django.conf import settings


class Notification(models.Model):
    """Notifications pour les utilisateurs"""
    TYPE_CHOICES = [
        ('message', 'Nouveau message'),
        ('visit', 'Demande de visite'),
        ('visit_confirmed', 'Visite confirmée'),
        ('visit_refused', 'Visite refusée'),
        ('new_housing', 'Nouveau logement'),
        ('admin', 'Notification admin'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    title = models.CharField(max_length=255)
    message = models.CharField(max_length=500)
    
    link = models.CharField(max_length=255, blank=True)
    
    is_read = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Notification"
        verbose_name_plural = "Notifications"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Notification pour {self.user.username}: {self.title}"

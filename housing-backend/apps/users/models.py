
# ============================================
# 📁 apps/users/models.py
# ============================================

from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
import uuid
from datetime import timedelta




class User(AbstractUser):
    """
    Modèle utilisateur étendu
    Peut être locataire ET/OU propriétaire
    """
    phone = models.CharField(max_length=20, blank=True, verbose_name="Téléphone")
    photo = models.ImageField(upload_to='profiles/', blank=True, null=True, verbose_name="Photo de profil")
    
    # Rôles
    is_locataire = models.BooleanField(default=False, verbose_name="Est locataire")
    is_proprietaire = models.BooleanField(default=False, verbose_name="Est propriétaire")
    
    # Blocage
    is_blocked = models.BooleanField(default=False, verbose_name="Bloqué")
    blocked_until = models.DateTimeField(null=True, blank=True, verbose_name="Bloqué jusqu'à")
    
    # Préférences pour l'algorithme génétique
    preferred_max_price = models.IntegerField(null=True, blank=True, verbose_name="Budget max")
    preferred_location_lat = models.FloatField(null=True, blank=True, verbose_name="Latitude préférée")
    preferred_location_lng = models.FloatField(null=True, blank=True, verbose_name="Longitude préférée")
    
    class Meta:
        verbose_name = "Utilisateur"
        verbose_name_plural = "Utilisateurs"
    
    def __str__(self):
        return self.username
    
    @property
    def is_active_blocked(self):
        """Vérifie si le blocage est encore actif"""
        if not self.is_blocked:
            return False
        if self.blocked_until and timezone.now() > self.blocked_until:
            self.is_blocked = False
            self.save()
            return False
        return True




class PasswordResetToken(models.Model):
    """Token pour la réinitialisation du mot de passe"""
    user = models.ForeignKey('User', on_delete=models.CASCADE, related_name='reset_tokens')
    token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    used = models.BooleanField(default=False)
    
    class Meta:
        verbose_name = "Token de réinitialisation"
        verbose_name_plural = "Tokens de réinitialisation"
        ordering = ['-created_at']
    
    def save(self, *args, **kwargs):
        if not self.expires_at:
            # Token valide pendant 1 heure
            self.expires_at = timezone.now() + timedelta(hours=1)
        super().save(*args, **kwargs)
    
    def is_valid(self):
        """Vérifier si le token est encore valide"""
        return not self.used and timezone.now() < self.expires_at
    
    def mark_as_used(self):
        """Marquer le token comme utilisé"""
        self.used = True
        self.save()
    
    def __str__(self):
        return f"Token for {self.user.email} - Valid: {self.is_valid()}"
















# ============================================
# 📁 apps/location/models.py
# ============================================

from django.db import models


class Region(models.Model):
    """Région géographique (ex: Centre, Littoral)"""
    name = models.CharField(max_length=100, unique=True, verbose_name="Nom")
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Région"
        verbose_name_plural = "Régions"
        ordering = ['name']
    
    def __str__(self):
        return self.name


class City(models.Model):
    """Ville (ex: Yaoundé, Douala)"""
    region = models.ForeignKey(Region, on_delete=models.CASCADE, related_name='cities')
    name = models.CharField(max_length=100, verbose_name="Nom")
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Ville"
        verbose_name_plural = "Villes"
        ordering = ['name']
        unique_together = ['region', 'name']
    
    def __str__(self):
        return f"{self.name} ({self.region.name})"


class District(models.Model):
    """Quartier (ex: Bastos, Akwa)"""
    city = models.ForeignKey(City, on_delete=models.CASCADE, related_name='districts')
    name = models.CharField(max_length=100, verbose_name="Nom")
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Quartier"
        verbose_name_plural = "Quartiers"
        ordering = ['name']
        unique_together = ['city', 'name']
    
    def __str__(self):
        return f"{self.name} ({self.city.name})"

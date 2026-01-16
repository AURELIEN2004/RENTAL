from django.db import models

# Create your models here.

# ============================================
# 📁 apps/housing/models.py
# ============================================

from django.db import models
from django.core.validators import MinValueValidator
from django.conf import settings
from django.utils import timezone


class Category(models.Model):
    """Catégorie de logement (Studio, Chambre, Appartement, Maison)"""
    name = models.CharField(max_length=50, unique=True, verbose_name="Nom")
    description = models.TextField(blank=True, verbose_name="Description")
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Catégorie"
        verbose_name_plural = "Catégories"
        ordering = ['name']
    
    def __str__(self):
        return self.name


class HousingType(models.Model):
    """Type de logement (Simple, Moderne, Meublé)"""
    name = models.CharField(max_length=50, unique=True, verbose_name="Nom")
    description = models.TextField(blank=True, verbose_name="Description")
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Type de logement"
        verbose_name_plural = "Types de logement"
        ordering = ['name']
    
    def __str__(self):
        return self.name


class Housing(models.Model):
    """Modèle principal : Logement"""
    STATUS_CHOICES = [
        ('disponible', 'Disponible'),
        ('reserve', 'Réservé'),
        ('occupe', 'Occupé'),
    ]
    
    # Relations
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='housings')
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True)
    housing_type = models.ForeignKey(HousingType, on_delete=models.SET_NULL, null=True)
    
    # Informations de base
    title = models.CharField(max_length=255, verbose_name="Titre")
    description = models.TextField(verbose_name="Description")
    
    # Caractéristiques
    price = models.IntegerField(validators=[MinValueValidator(0)], verbose_name="Prix (FCFA/mois)")
    area = models.PositiveIntegerField(help_text="Superficie en m²", verbose_name="Superficie")
    rooms = models.PositiveIntegerField(verbose_name="Nombre de chambres")
    bathrooms = models.PositiveIntegerField(verbose_name="Nombre de douches")
    
    # Localisation
    region = models.ForeignKey('location.Region', on_delete=models.SET_NULL, null=True)
    city = models.ForeignKey('location.City', on_delete=models.SET_NULL, null=True)
    district = models.ForeignKey('location.District', on_delete=models.SET_NULL, null=True)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    
    # Statut
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='disponible')
    
    # Médias
    video = models.FileField(upload_to='videos/', null=True, blank=True)
    virtual_360 = models.URLField(null=True, blank=True)
    
    # Options supplémentaires
    additional_features = models.TextField(blank=True, verbose_name="Caractéristiques supplémentaires")
    
    # Compteurs
    views_count = models.PositiveIntegerField(default=0)
    likes_count = models.PositiveIntegerField(default=0)
    
    # Visibilité
    is_visible = models.BooleanField(default=True)
    
    # Dates
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Logement"
        verbose_name_plural = "Logements"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} - {self.city}"
    
    @property
    def display_name(self):
        category_name = self.category.name if self.category else "Logement"
        type_name = self.housing_type.name.lower() if self.housing_type else ""
        return f"{category_name} {type_name}".strip()
    
    @property
    def days_since_published(self):
        return (timezone.now() - self.created_at).days
    
    def increment_views(self):
        self.views_count += 1
        self.save(update_fields=['views_count'])
    
    def increment_likes(self):
        self.likes_count += 1
        self.save(update_fields=['likes_count'])
    
    def decrement_likes(self):
        if self.likes_count > 0:
            self.likes_count -= 1
            self.save(update_fields=['likes_count'])


class HousingImage(models.Model):
    """Images d'un logement"""
    housing = models.ForeignKey(Housing, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='housings/')
    is_main = models.BooleanField(default=False)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Image de logement"
        verbose_name_plural = "Images de logement"
        ordering = ['-is_main', 'uploaded_at']
    
    def __str__(self):
        return f"Image de {self.housing.title}"


class Favorite(models.Model):
    """Logements favoris"""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='favorites')
    housing = models.ForeignKey(Housing, on_delete=models.CASCADE, related_name='favorited_by')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['user', 'housing']
        ordering = ['-created_at']


class SavedHousing(models.Model):
    """Logements enregistrés"""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='saved_housings')
    housing = models.ForeignKey(Housing, on_delete=models.CASCADE, related_name='saved_by')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['user', 'housing']
        ordering = ['-created_at']


class UserInteraction(models.Model):
    """Interactions utilisateur (pour algorithme génétique)"""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='interactions')
    housing = models.ForeignKey(Housing, on_delete=models.CASCADE, related_name='interactions')
    
    viewed = models.BooleanField(default=False)
    liked = models.BooleanField(default=False)
    saved = models.BooleanField(default=False)
    contacted = models.BooleanField(default=False)
    
    view_count = models.PositiveIntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['user', 'housing']
        ordering = ['-updated_at']


class Comment(models.Model):
    """Commentaires sur logements"""
    housing = models.ForeignKey(Housing, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='comments')
    
    content = models.TextField()
    rating = models.PositiveSmallIntegerField(default=5)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']


class Testimonial(models.Model):
    """Témoignages plateforme"""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='testimonials')
    
    content = models.TextField()
    rating = models.PositiveSmallIntegerField(default=5)
    
    is_approved = models.BooleanField(default=False)
    is_featured = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
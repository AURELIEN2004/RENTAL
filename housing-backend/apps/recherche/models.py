
# # ============================================
# # 📁 apps/recherche/models.py
# # ============================================

# from django.db import models
# from django.conf import settings
# # from django.contrib.postgres.fields import ArrayField
# import json

# class SearchHistory(models.Model):
#     """Historique des recherches utilisateur"""
#     user = models.ForeignKey(
#         settings.AUTH_USER_MODEL, 
#         on_delete=models.CASCADE, 
#         related_name='search_history',
#         null=True,
#         blank=True
#     )
    
#     # Critères de recherche
#     query_text = models.CharField(max_length=500, blank=True)
#     category = models.ForeignKey(
#         'housing.Category', 
#         on_delete=models.SET_NULL, 
#         null=True, 
#         blank=True
#     )
#     housing_type = models.ForeignKey(
#         'housing.HousingType', 
#         on_delete=models.SET_NULL, 
#         null=True, 
#         blank=True
#     )
#     region = models.ForeignKey(
#         'location.Region', 
#         on_delete=models.SET_NULL, 
#         null=True, 
#         blank=True
#     )
#     city = models.ForeignKey(
#         'location.City', 
#         on_delete=models.SET_NULL, 
#         null=True, 
#         blank=True
#     )
#     district = models.ForeignKey(
#         'location.District', 
#         on_delete=models.SET_NULL, 
#         null=True, 
#         blank=True
#     )
    
#     # Filtres prix et caractéristiques
#     min_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
#     max_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
#     min_rooms = models.IntegerField(null=True, blank=True)
#     max_rooms = models.IntegerField(null=True, blank=True)
#     min_area = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
#     max_area = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    
#     # Filtres avancés (stockés en JSON)
#     advanced_filters = models.JSONField(default=dict, blank=True)
    
#     # Métadonnées
#     results_count = models.IntegerField(default=0)
#     search_type = models.CharField(
#         max_length=20,
#         choices=[
#             ('form', 'Formulaire'),
#             ('chatbot', 'Chatbot'),
#             ('voice', 'Vocal'),
#         ],
#         default='form'
#     )
#     language = models.CharField(max_length=2, choices=[('fr', 'Français'), ('en', 'English')], default='fr')
    
#     created_at = models.DateTimeField(auto_now_add=True)
    
#     class Meta:
#         verbose_name = "Historique de recherche"
#         verbose_name_plural = "Historiques de recherche"
#         ordering = ['-created_at']
#         indexes = [
#             models.Index(fields=['user', '-created_at']),
#             models.Index(fields=['created_at']),
#         ]
    
#     def __str__(self):
#         return f"Recherche {self.search_type} - {self.created_at.strftime('%d/%m/%Y %H:%M')}"


# class NearbyPlace(models.Model):
#     """Lieux à proximité des logements"""
#     PLACE_TYPE_CHOICES = [
#         ('school', 'École'),
#         ('supermarket', 'Supermarché'),
#         ('hospital', 'Hôpital'),
#         ('pharmacy', 'Pharmacie'),
#         ('restaurant', 'Restaurant'),
#         ('transport', 'Transport public'),
#         ('bank', 'Banque'),
#         ('market', 'Marché'),
#         ('church', 'Église'),
#         ('mosque', 'Mosquée'),
#         ('park', 'Parc'),
#         ('gym', 'Salle de sport'),
#         ('other', 'Autre'),
#     ]
    
#     name = models.CharField(max_length=200)
#     place_type = models.CharField(max_length=20, choices=PLACE_TYPE_CHOICES)
    
#     # Localisation
#     region = models.ForeignKey('location.Region', on_delete=models.CASCADE, related_name='nearby_places')
#     city = models.ForeignKey('location.City', on_delete=models.CASCADE, related_name='nearby_places')
#     district = models.ForeignKey('location.District', on_delete=models.CASCADE, related_name='nearby_places', null=True, blank=True)
    
#     latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
#     longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    
#     address = models.CharField(max_length=500, blank=True)
#     description = models.TextField(blank=True)
    
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)
    
#     class Meta:
#         verbose_name = "Lieu à proximité"
#         verbose_name_plural = "Lieux à proximité"
#         ordering = ['name']
#         indexes = [
#             models.Index(fields=['place_type', 'city']),
#         ]
    
#     def __str__(self):
#         return f"{self.name} ({self.get_place_type_display()})"


# class ChatbotConversation(models.Model):
#     """Conversations du chatbot de recherche"""
#     user = models.ForeignKey(
#         settings.AUTH_USER_MODEL,
#         on_delete=models.CASCADE,
#         related_name='chatbot_conversations',
#         null=True,
#         blank=True
#     )
#     session_id = models.CharField(max_length=100, unique=True)
#     language = models.CharField(max_length=2, choices=[('fr', 'Français'), ('en', 'English')], default='fr')
    
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)
    
#     class Meta:
#         verbose_name = "Conversation Chatbot"
#         verbose_name_plural = "Conversations Chatbot"
#         ordering = ['-updated_at']
    
#     def __str__(self):
#         username = self.user.username if self.user else "Anonyme"
#         return f"Conversation {username} - {self.session_id[:8]}"


# class ChatbotMessage(models.Model):
#     """Messages du chatbot"""
#     conversation = models.ForeignKey(
#         ChatbotConversation,
#         on_delete=models.CASCADE,
#         related_name='messages'
#     )
    
#     role = models.CharField(
#         max_length=10,
#         choices=[('user', 'Utilisateur'), ('assistant', 'Assistant')]
#     )
#     content = models.TextField()
    
#     # Pour les messages vocaux
#     is_voice = models.BooleanField(default=False)
#     audio_file = models.FileField(upload_to='chatbot/audio/', null=True, blank=True)
    
#     # Résultats de recherche associés (si applicable)
#     search_results = models.JSONField(default=list, blank=True)
    
#     created_at = models.DateTimeField(auto_now_add=True)
    
#     class Meta:
#         verbose_name = "Message Chatbot"
#         verbose_name_plural = "Messages Chatbot"
#         ordering = ['created_at']
    
#     def __str__(self):
#         return f"{self.role} - {self.content[:50]}..."


# class SearchPreference(models.Model):
#     """Préférences de recherche utilisateur pour l'algorithme génétique"""
#     user = models.OneToOneField(
#         settings.AUTH_USER_MODEL,
#         on_delete=models.CASCADE,
#         related_name='search_preferences'
#     )
    
#     # Poids des critères (0-1)
#     price_weight = models.FloatField(default=0.3)
#     location_weight = models.FloatField(default=0.25)
#     size_weight = models.FloatField(default=0.2)
#     amenities_weight = models.FloatField(default=0.15)
#     proximity_weight = models.FloatField(default=0.1)
    
#     # Préférences spécifiques
#     preferred_categories = models.ManyToManyField('housing.Category', blank=True)
#     preferred_cities = models.ManyToManyField('location.City', blank=True)
#     preferred_districts = models.ManyToManyField('location.District', blank=True)
    
#     # Lieux importants à proximité
#     important_places = models.JSONField(default=list, blank=True)  # ['school', 'supermarket', ...]
    
#     updated_at = models.DateTimeField(auto_now=True)
    
#     class Meta:
#         verbose_name = "Préférence de recherche"
#         verbose_name_plural = "Préférences de recherche"
    
#     def __str__(self):
#         return f"Préférences de {self.user.username}"

# ============================================
# 📁 apps/recherche/models.py
# ============================================

from django.db import models
from django.conf import settings
from apps.housing.models import Category
from apps.location.models import City


class UserPreference(models.Model):
    """
    Préférences de recherche utilisateur pour personnalisation
    """
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='search_preferences'
    )
    
    # Préférences de localisation
    preferred_city = models.ForeignKey(
        City,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name="Ville préférée"
    )
    last_lat = models.FloatField(null=True, blank=True, verbose_name="Dernière latitude")
    last_lng = models.FloatField(null=True, blank=True, verbose_name="Dernière longitude")
    
    # Préférences de logement
    preferred_categories = models.ManyToManyField(
        Category,
        blank=True,
        verbose_name="Catégories préférées"
    )
    max_budget = models.PositiveIntegerField(
        null=True,
        blank=True,
        verbose_name="Budget maximum"
    )
    
    # Métadonnées
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Préférence utilisateur"
        verbose_name_plural = "Préférences utilisateurs"
    
    def __str__(self):
        return f"Préférences de {self.user.username}"


class ConversationHistory(models.Model):
    """
    Historique des conversations avec le chatbot
    """
    conversation_id = models.CharField(
        max_length=100,
        db_index=True,
        verbose_name="ID de conversation"
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='chat_history'
    )
    
    # Messages
    user_message = models.TextField(verbose_name="Message utilisateur")
    bot_response = models.TextField(verbose_name="Réponse du bot")
    
    # Métadonnées de la recherche
    filters_extracted = models.JSONField(
        default=dict,
        blank=True,
        verbose_name="Filtres extraits"
    )
    search_type = models.CharField(
        max_length=50,
        default='standard',
        verbose_name="Type de recherche"
    )
    results_count = models.PositiveIntegerField(
        default=0,
        verbose_name="Nombre de résultats"
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Historique de conversation"
        verbose_name_plural = "Historiques de conversations"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Conversation {self.conversation_id} - {self.created_at}"
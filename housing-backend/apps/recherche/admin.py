# from django.contrib import admin

# # Register your models here.
# # ============================================
# # 📁 apps/recherche/admin.py
# # ============================================

# from django.contrib import admin
# from .models import (
#     SearchHistory, NearbyPlace, ChatbotConversation,
#     ChatbotMessage, SearchPreference
# )


# @admin.register(SearchHistory)
# class SearchHistoryAdmin(admin.ModelAdmin):
#     list_display = [
#         'user', 'query_text', 'city', 'category',
#         'results_count', 'search_type', 'created_at'
#     ]
#     list_filter = ['search_type', 'language', 'created_at', 'city']
#     search_fields = ['user__username', 'query_text']
#     readonly_fields = ['created_at']
#     date_hierarchy = 'created_at'
    
#     fieldsets = (
#         ('Utilisateur', {
#             'fields': ('user', 'search_type', 'language')
#         }),
#         ('Critères de recherche', {
#             'fields': (
#                 'query_text', 'category', 'housing_type',
#                 'region', 'city', 'district'
#             )
#         }),
#         ('Filtres de prix et caractéristiques', {
#             'fields': (
#                 ('min_price', 'max_price'),
#                 ('min_rooms', 'max_rooms'),
#                 ('min_area', 'max_area')
#             )
#         }),
#         ('Filtres avancés', {
#             'fields': ('advanced_filters',),
#             'classes': ('collapse',)
#         }),
#         ('Résultats', {
#             'fields': ('results_count', 'created_at')
#         }),
#     )


# @admin.register(NearbyPlace)
# class NearbyPlaceAdmin(admin.ModelAdmin):
#     list_display = [
#         'name', 'place_type', 'city', 'district', 'created_at'
#     ]
#     list_filter = ['place_type', 'city']
#     search_fields = ['name', 'city__name', 'district__name']
#     readonly_fields = ['created_at', 'updated_at']
    
#     fieldsets = (
#         ('Informations de base', {
#             'fields': ('name', 'place_type', 'description')
#         }),
#         ('Localisation', {
#             'fields': (
#                 'region', 'city', 'district',
#                 'address',
#                 ('latitude', 'longitude')
#             )
#         }),
#         ('Métadonnées', {
#             'fields': ('created_at', 'updated_at'),
#             'classes': ('collapse',)
#         }),
#     )


# class ChatbotMessageInline(admin.TabularInline):
#     model = ChatbotMessage
#     extra = 0
#     readonly_fields = ['created_at']
#     fields = ['role', 'content', 'is_voice', 'created_at']


# @admin.register(ChatbotConversation)
# class ChatbotConversationAdmin(admin.ModelAdmin):
#     list_display = [
#         'session_id', 'user', 'language', 
#         'message_count', 'created_at', 'updated_at'
#     ]
#     list_filter = ['language', 'created_at']
#     search_fields = ['session_id', 'user__username']
#     readonly_fields = ['session_id', 'created_at', 'updated_at']
#     inlines = [ChatbotMessageInline]
    
#     def message_count(self, obj):
#         return obj.messages.count()
#     message_count.short_description = 'Messages'


# @admin.register(ChatbotMessage)
# class ChatbotMessageAdmin(admin.ModelAdmin):
#     list_display = [
#         'conversation', 'role', 'content_preview',
#         'is_voice', 'created_at'
#     ]
#     list_filter = ['role', 'is_voice', 'created_at']
#     search_fields = ['content', 'conversation__session_id']
#     readonly_fields = ['created_at']
    
#     def content_preview(self, obj):
#         return obj.content[:100] + '...' if len(obj.content) > 100 else obj.content
#     content_preview.short_description = 'Contenu'


# @admin.register(SearchPreference)
# class SearchPreferenceAdmin(admin.ModelAdmin):
#     list_display = [
#         'user', 'price_weight', 'location_weight',
#         'size_weight', 'updated_at'
#     ]
#     search_fields = ['user__username']
#     readonly_fields = ['updated_at']
#     filter_horizontal = ['preferred_categories', 'preferred_cities', 'preferred_districts']
    
#     fieldsets = (
#         ('Utilisateur', {
#             'fields': ('user',)
#         }),
#         ('Poids des critères', {
#             'fields': (
#                 ('price_weight', 'location_weight'),
#                 ('size_weight', 'amenities_weight'),
#                 'proximity_weight'
#             ),
#             'description': 'Les poids doivent totaliser environ 1.0'
#         }),
#         ('Préférences', {
#             'fields': (
#                 'preferred_categories',
#                 'preferred_cities',
#                 'preferred_districts',
#                 'important_places'
#             )
#         }),
#         ('Métadonnées', {
#             'fields': ('updated_at',),
#             'classes': ('collapse',)
#         }),
#     )

# ============================================
# 📁 apps/recherche/admin.py
# ============================================

from django.contrib import admin
from .models import UserPreference, ConversationHistory


@admin.register(UserPreference)
class UserPreferenceAdmin(admin.ModelAdmin):
    """Administration des préférences utilisateur"""
    
    list_display = ['user', 'preferred_city', 'max_budget', 'created_at', 'updated_at']
    list_filter = ['preferred_city', 'created_at']
    search_fields = ['user__username', 'user__email']
    filter_horizontal = ['preferred_categories']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Utilisateur', {
            'fields': ('user',)
        }),
        ('Préférences de localisation', {
            'fields': ('preferred_city', 'last_lat', 'last_lng')
        }),
        ('Préférences de logement', {
            'fields': ('preferred_categories', 'max_budget')
        }),
        ('Métadonnées', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(ConversationHistory)
class ConversationHistoryAdmin(admin.ModelAdmin):
    """Administration de l'historique des conversations"""
    
    list_display = [
        'conversation_id', 'user', 'search_type', 
        'results_count', 'created_at'
    ]
    list_filter = ['search_type', 'created_at']
    search_fields = [
        'conversation_id', 'user__username', 
        'user_message', 'bot_response'
    ]
    readonly_fields = ['created_at']
    
    fieldsets = (
        ('Conversation', {
            'fields': ('conversation_id', 'user')
        }),
        ('Messages', {
            'fields': ('user_message', 'bot_response')
        }),
        ('Métadonnées de recherche', {
            'fields': ('filters_extracted', 'search_type', 'results_count')
        }),
        ('Date', {
            'fields': ('created_at',)
        }),
    )
    
    def has_add_permission(self, request):
        """Désactiver l'ajout manuel"""
        return False
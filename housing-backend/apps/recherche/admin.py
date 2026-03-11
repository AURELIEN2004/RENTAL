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
# ============================================================
# apps/recherche/admin.py — VERSION ROBUSTE
# ============================================================

from django.contrib import admin
from .models import (
    NearbyPlace, ChatbotConversation, ChatbotMessage,
    SearchHistory, SearchPreference,
)


@admin.register(NearbyPlace)
class NearbyPlaceAdmin(admin.ModelAdmin):
    list_display  = ['name', 'place_type', 'city', 'created_at']
    list_filter   = ['place_type', 'city']
    search_fields = ['name_fr', 'name_en', 'address_fr']

    fieldsets = (
        ('Informations', {
            'fields': ('place_type', 'region', 'city', 'district',
                       'latitude', 'longitude'),
        }),
        ('🇫🇷 Français', {
            'fields': ('name_fr', 'address_fr', 'description_fr'),
        }),
        ('🇬🇧 English', {
            'fields': ('name_en', 'address_en', 'description_en'),
            'classes': ('collapse',),
        }),
    )


@admin.register(ChatbotConversation)
class ChatbotConversationAdmin(admin.ModelAdmin):
    list_display    = ['user', 'session_id', 'language', 'created_at']
    list_filter     = ['language']
    search_fields   = ['user__username', 'session_id']
    readonly_fields = ['session_id', 'created_at', 'updated_at']


@admin.register(ChatbotMessage)
class ChatbotMessageAdmin(admin.ModelAdmin):
    list_display    = ['conversation', 'role', 'is_voice', 'created_at']
    list_filter     = ['role', 'is_voice']
    search_fields   = ['content_fr', 'content_en']
    readonly_fields = ['created_at']

    fieldsets = (
        ('Informations', {
            'fields': ('conversation', 'role', 'is_voice',
                       'audio_file', 'search_results'),
        }),
        ('🇫🇷 Contenu (Français)', {
            'fields': ('content_fr',),
        }),
        ('🇬🇧 Content (English)', {
            'fields': ('content_en',),
            'classes': ('collapse',),
        }),
    )


@admin.register(SearchHistory)
class SearchHistoryAdmin(admin.ModelAdmin):
    list_display    = ['user', 'search_type', 'language', 'results_count', 'created_at']
    list_filter     = ['search_type', 'language', 'created_at']
    search_fields   = ['user__username', 'query_text_fr', 'query_text_en']
    readonly_fields = ['created_at']

    fieldsets = (
        ('Informations', {
            'fields': ('user', 'search_type', 'language', 'results_count',
                       'category', 'housing_type', 'region', 'city', 'district',
                       'min_price', 'max_price', 'min_rooms', 'max_rooms',
                       'advanced_filters', 'created_at'),
        }),
        ('🇫🇷 Requête (Français)', {
            'fields': ('query_text_fr',),
        }),
        ('🇬🇧 Query (English)', {
            'fields': ('query_text_en',),
            'classes': ('collapse',),
        }),
    )


@admin.register(SearchPreference)
class SearchPreferenceAdmin(admin.ModelAdmin):
    list_display    = ['user', 'updated_at']
    search_fields   = ['user__username']
    readonly_fields = ['updated_at']
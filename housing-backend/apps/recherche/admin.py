# from django.contrib import admin

# # Register your models here.
# # ============================================
# # 📁 apps/recherche/admin.py
# # ============================================

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
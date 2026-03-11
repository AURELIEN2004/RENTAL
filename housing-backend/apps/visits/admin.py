
# # ============================================
# # 📁 apps/visits/admin.py
# # ============================================

# from django.contrib import admin
# from .models import Visit


# @admin.register(Visit)
# class VisitAdmin(admin.ModelAdmin):
#     list_display = ['housing', 'locataire', 'date', 'time', 'status', 'created_at']
#     list_filter = ['status', 'date']
#     search_fields = ['housing__title', 'locataire__username']
#     readonly_fields = ['created_at', 'updated_at']
# ============================================================
# apps/visits/admin.py — VERSION ROBUSTE
# ============================================================

from django.contrib import admin
from .models import Visit


@admin.register(Visit)
class VisitAdmin(admin.ModelAdmin):
    list_display    = ['housing', 'locataire', 'date', 'time', 'status', 'created_at']
    list_filter     = ['status', 'date']
    search_fields   = ['housing__title_fr', 'locataire__username']
    readonly_fields = ['created_at', 'updated_at']

    fieldsets = (
        ('Informations', {
            'fields': ('housing', 'locataire', 'date', 'time', 'status'),
        }),
        ('🇫🇷 Messages (Français)', {
            'fields': ('message_fr', 'response_message_fr'),
        }),
        ('🇬🇧 Messages (English)', {
            'fields': ('message_en', 'response_message_en'),
            'classes': ('collapse',),
        }),
        ('Dates', {
            'fields': ('created_at', 'updated_at'),
        }),
    )
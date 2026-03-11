# from django.contrib import admin

# # Register your models here.
# # ============================================
# # 📁 apps/notifications/admin.py
# # ============================================

# from django.contrib import admin
# from .models import Notification


# @admin.register(Notification)
# class NotificationAdmin(admin.ModelAdmin):
#     list_display = ['user', 'type', 'title', 'is_read', 'created_at']
#     list_filter = ['type', 'is_read', 'created_at']
#     search_fields = ['user__username', 'title', 'message']
# ============================================================
# apps/notifications/admin.py — VERSION ROBUSTE
# ============================================================

from django.contrib import admin
from .models import Notification


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display  = ['user', 'type', 'title', 'is_read', 'created_at']
    list_filter   = ['type', 'is_read', 'created_at']
    search_fields = ['user__username', 'title_fr', 'title_en']

    fieldsets = (
        ('Informations', {
            'fields': ('user', 'type', 'link', 'is_read'),
        }),
        ('🇫🇷 Français', {
            'fields': ('title_fr', 'message_fr'),
        }),
        ('🇬🇧 English', {
            'fields': ('title_en', 'message_en'),
            'classes': ('collapse',),
        }),
    )
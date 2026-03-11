# from django.contrib import admin

# # Register your models here.

# # ============================================
# # 📁 apps/messaging/admin.py
# # ============================================

# from django.contrib import admin
# from .models import Conversation, Message


# @admin.register(Conversation)
# class ConversationAdmin(admin.ModelAdmin):
#     list_display = ['housing', 'created_at']
#     filter_horizontal = ['participants']
#     readonly_fields = ['created_at', 'updated_at']


# @admin.register(Message)
# class MessageAdmin(admin.ModelAdmin):
#     list_display = ['conversation', 'sender', 'created_at', 'is_read']
#     list_filter = ['is_read', 'created_at']
#     search_fields = ['content', 'sender__username']
#     readonly_fields = ['created_at']
# ============================================================
# apps/messaging/admin.py — VERSION ROBUSTE
# ============================================================

from django.contrib import admin
from .models import Conversation, Message


@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display      = ['housing', 'created_at']
    filter_horizontal = ['participants']
    readonly_fields   = ['created_at', 'updated_at']


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display    = ['conversation', 'sender', 'created_at', 'is_read']
    list_filter     = ['is_read', 'created_at']
    search_fields   = ['content_fr', 'content_en', 'sender__username']
    readonly_fields = ['created_at']

    fieldsets = (
        ('Informations', {
            'fields': ('conversation', 'sender', 'image', 'video', 'is_read'),
        }),
        ('🇫🇷 Message (Français)', {
            'fields': ('content_fr',),
        }),
        ('🇬🇧 Message (English)', {
            'fields': ('content_en',),
            'classes': ('collapse',),
        }),
    )
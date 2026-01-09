
# ============================================
# 📁 apps/visits/admin.py
# ============================================

from django.contrib import admin
from .models import Visit


@admin.register(Visit)
class VisitAdmin(admin.ModelAdmin):
    list_display = ['housing', 'locataire', 'date', 'time', 'status', 'created_at']
    list_filter = ['status', 'date']
    search_fields = ['housing__title', 'locataire__username']
    readonly_fields = ['created_at', 'updated_at']

from django.contrib import admin
from .models import PasswordResetToken


# Register your models here.

# ============================================
# 📁 apps/users/admin.py
# ============================================

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth import get_user_model

User = get_user_model()


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Configuration admin pour User"""
    list_display = ['username', 'email', 'is_locataire', 'is_proprietaire', 
                    'is_blocked', 'date_joined']
    list_filter = ['is_locataire', 'is_proprietaire', 'is_blocked', 'is_staff']
    search_fields = ['username', 'email', 'phone']
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Informations supplémentaires', {
            'fields': ('phone', 'photo')
        }),
        ('Rôles', {
            'fields': ('is_locataire', 'is_proprietaire')
        }),
        ('Blocage', {
            'fields': ('is_blocked', 'blocked_until')
        }),
        ('Préférences', {
            'fields': ('preferred_max_price', 'preferred_location_lat', 
                      'preferred_location_lng')
        }),
    )

# apps/users/admin.py (ajoutez)
from .models import PasswordResetToken

@admin.register(PasswordResetToken)
class PasswordResetTokenAdmin(admin.ModelAdmin):
    list_display = ['user', 'token', 'created_at', 'expires_at', 'used', 'is_valid']
    list_filter = ['used', 'created_at']
    search_fields = ['user__email', 'user__username']
    readonly_fields = ['token', 'created_at']
    
    def is_valid(self, obj):
        return obj.is_valid()
    is_valid.boolean = True
    is_valid.short_description = 'Valide'
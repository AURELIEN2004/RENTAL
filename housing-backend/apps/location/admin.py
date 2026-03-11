# from django.contrib import admin

# # Register your models here.

# # ============================================
# # 📁 apps/location/admin.py
# # ============================================

# from django.contrib import admin
# from .models import Region, City, District


# @admin.register(Region)
# class RegionAdmin(admin.ModelAdmin):
#     list_display = ['name', 'created_at']
#     search_fields = ['name']


# @admin.register(City)
# class CityAdmin(admin.ModelAdmin):
#     list_display = ['name', 'region', 'created_at']
#     list_filter = ['region']
#     search_fields = ['name']


# @admin.register(District)
# class DistrictAdmin(admin.ModelAdmin):
#     list_display = ['name', 'city', 'created_at']
#     list_filter = ['city__region', 'city']
#     search_fields = ['name']
# ============================================================
# apps/location/admin.py — VERSION ROBUSTE
# ============================================================

from django.contrib import admin
from .models import Region, City, District


@admin.register(Region)
class RegionAdmin(admin.ModelAdmin):
    list_display  = ['name', 'created_at']
    search_fields = ['name_fr', 'name_en']

    fieldsets = (
        ('🇫🇷 Français', {'fields': ('name_fr',)}),
        ('🇬🇧 English',  {'fields': ('name_en',), 'classes': ('collapse',)}),
    )


@admin.register(City)
class CityAdmin(admin.ModelAdmin):
    list_display  = ['name', 'region', 'created_at']
    list_filter   = ['region']
    search_fields = ['name_fr', 'name_en']

    fieldsets = (
        ('Région', {'fields': ('region',)}),
        ('🇫🇷 Français', {'fields': ('name_fr',)}),
        ('🇬🇧 English',  {'fields': ('name_en',), 'classes': ('collapse',)}),
    )


@admin.register(District)
class DistrictAdmin(admin.ModelAdmin):
    list_display  = ['name', 'city', 'created_at']
    list_filter   = ['city__region', 'city']
    search_fields = ['name_fr', 'name_en']

    fieldsets = (
        ('Ville', {'fields': ('city',)}),
        ('🇫🇷 Français', {'fields': ('name_fr',)}),
        ('🇬🇧 English',  {'fields': ('name_en',), 'classes': ('collapse',)}),
    )
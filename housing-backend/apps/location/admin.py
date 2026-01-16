from django.contrib import admin

# Register your models here.

# ============================================
# 📁 apps/location/admin.py
# ============================================

from django.contrib import admin
from .models import Region, City, District


@admin.register(Region)
class RegionAdmin(admin.ModelAdmin):
    list_display = ['name', 'created_at']
    search_fields = ['name']


@admin.register(City)
class CityAdmin(admin.ModelAdmin):
    list_display = ['name', 'region', 'created_at']
    list_filter = ['region']
    search_fields = ['name']


@admin.register(District)
class DistrictAdmin(admin.ModelAdmin):
    list_display = ['name', 'city', 'created_at']
    list_filter = ['city__region', 'city']
    search_fields = ['name']

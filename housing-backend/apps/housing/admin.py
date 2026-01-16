from django.contrib import admin

# Register your models here.

# ============================================
# 📁 apps/housing/admin.py - COMPLET
# ============================================

from django.contrib import admin
from .models import (
    Category, HousingType, Housing, HousingImage,
    Favorite, SavedHousing, UserInteraction,
    Comment, Testimonial
)


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'created_at']
    search_fields = ['name']


@admin.register(HousingType)
class HousingTypeAdmin(admin.ModelAdmin):
    list_display = ['name', 'created_at']
    search_fields = ['name']


class HousingImageInline(admin.TabularInline):
    model = HousingImage
    extra = 1


@admin.register(Housing)
class HousingAdmin(admin.ModelAdmin):
    list_display = ['title', 'owner', 'category', 'housing_type', 'city', 
                    'price', 'status', 'is_visible', 'views_count', 'likes_count', 
                    'created_at']
    list_filter = ['status', 'category', 'housing_type', 'city', 'is_visible']
    search_fields = ['title', 'description', 'owner__username']
    readonly_fields = ['views_count', 'likes_count', 'created_at', 'updated_at']
    
    inlines = [HousingImageInline]
    
    fieldsets = (
        ('Propriétaire', {
            'fields': ('owner',)
        }),
        ('Informations de base', {
            'fields': ('title', 'description', 'category', 'housing_type')
        }),
        ('Caractéristiques', {
            'fields': ('price', 'area', 'rooms', 'bathrooms', 'additional_features')
        }),
        ('Localisation', {
            'fields': ('region', 'city', 'district', 'latitude', 'longitude')
        }),
        ('Médias', {
            'fields': ('video', 'virtual_360')
        }),
        ('Statut & Visibilité', {
            'fields': ('status', 'is_visible')
        }),
        ('Statistiques', {
            'fields': ('views_count', 'likes_count', 'created_at', 'updated_at')
        }),
    )


@admin.register(Favorite)
class FavoriteAdmin(admin.ModelAdmin):
    list_display = ['user', 'housing', 'created_at']
    search_fields = ['user__username', 'housing__title']


@admin.register(SavedHousing)
class SavedHousingAdmin(admin.ModelAdmin):
    list_display = ['user', 'housing', 'created_at']
    search_fields = ['user__username', 'housing__title']


@admin.register(UserInteraction)
class UserInteractionAdmin(admin.ModelAdmin):
    list_display = ['user', 'housing', 'viewed', 'liked', 'saved', 
                    'contacted', 'view_count', 'updated_at']
    list_filter = ['viewed', 'liked', 'saved', 'contacted']
    search_fields = ['user__username', 'housing__title']


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ['housing', 'user', 'rating', 'created_at']
    list_filter = ['rating', 'created_at']
    search_fields = ['housing__title', 'user__username', 'content']


@admin.register(Testimonial)
class TestimonialAdmin(admin.ModelAdmin):
    list_display = ['user', 'rating', 'is_approved', 'is_featured', 'created_at']
    list_filter = ['is_approved', 'is_featured', 'rating']
    search_fields = ['user__username', 'content']
    actions = ['approve_testimonials', 'feature_testimonials']
    
    def approve_testimonials(self, request, queryset):
        queryset.update(is_approved=True)
    approve_testimonials.short_description = "Approuver les témoignages sélectionnés"
    
    def feature_testimonials(self, request, queryset):
        queryset.update(is_featured=True)
    feature_testimonials.short_description = "Mettre en avant"


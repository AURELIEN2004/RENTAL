# # ============================================
# # 📁 apps/housing/admin.py - COMPLET
# # ============================================

# from django.contrib import admin
# from .models import (
#     Category, HousingType, Housing, HousingImage,
#     Favorite, SavedHousing, UserInteraction,
#     Comment, Testimonial
# )


# @admin.register(Category)
# class CategoryAdmin(admin.ModelAdmin):
#     list_display = ['name', 'created_at']
#     search_fields = ['name']


# @admin.register(HousingType)
# class HousingTypeAdmin(admin.ModelAdmin):
#     list_display = ['name', 'created_at']
#     search_fields = ['name']


# class HousingImageInline(admin.TabularInline):
#     model = HousingImage
#     extra = 1


# @admin.register(Housing)
# class HousingAdmin(admin.ModelAdmin):
#     list_display = ['title', 'owner', 'category', 'housing_type', 'city','district', 
#                     'price', 'status', 'is_visible', 'views_count', 'likes_count', 
#                     'created_at']
#     list_filter = ['status', 'category', 'housing_type', 'city', 'is_visible']
#     search_fields = ['title', 'description', 'owner__username']
#     readonly_fields = ['views_count', 'likes_count', 'created_at', 'updated_at']
    
#     inlines = [HousingImageInline]
    
#     fieldsets = (
#         ('Propriétaire', {
#             'fields': ('owner',)
#         }),
#         ('Informations de base', {
#             'fields': ('title', 'description', 'category', 'housing_type')
#         }),
#         ('Caractéristiques', {
#             'fields': ('price', 'area', 'rooms', 'bathrooms', 'additional_features')
#         }),
#         ('Localisation', {
#             'fields': ('region', 'city', 'district', 'latitude', 'longitude')
#         }),
#         ('Médias', {
#             'fields': ('video', 'virtual_360')
#         }),
#         ('Statut & Visibilité', {
#             'fields': ('status', 'is_visible')
#         }),
#         ('Statistiques', {
#             'fields': ('views_count', 'likes_count', 'created_at', 'updated_at')
#         }),
#     )


# @admin.register(Favorite)
# class FavoriteAdmin(admin.ModelAdmin):
#     list_display = ['user', 'housing', 'created_at']
#     search_fields = ['user__username', 'housing__title']


# @admin.register(SavedHousing)
# class SavedHousingAdmin(admin.ModelAdmin):
#     list_display = ['user', 'housing', 'created_at']
#     search_fields = ['user__username', 'housing__title']


# @admin.register(UserInteraction)
# class UserInteractionAdmin(admin.ModelAdmin):
#     list_display = ['user', 'housing', 'viewed', 'liked', 'saved', 
#                     'contacted', 'view_count', 'updated_at']
#     list_filter = ['viewed', 'liked', 'saved', 'contacted']
#     search_fields = ['user__username', 'housing__title']


# @admin.register(Comment)
# class CommentAdmin(admin.ModelAdmin):
#     list_display = ['housing', 'user', 'rating', 'created_at']
#     list_filter = ['rating', 'created_at']
#     search_fields = ['housing__title', 'user__username', 'content']


# @admin.register(Testimonial)
# class TestimonialAdmin(admin.ModelAdmin):
#     list_display = ['user', 'rating', 'is_approved', 'is_featured', 'created_at']
#     list_filter = ['is_approved', 'is_featured', 'rating']
#     search_fields = ['user__username', 'content']
#     actions = ['approve_testimonials', 'feature_testimonials']
    
#     def approve_testimonials(self, request, queryset):
#         queryset.update(is_approved=True)
#     approve_testimonials.short_description = "Approuver les témoignages sélectionnés"
    
#     def feature_testimonials(self, request, queryset):
#         queryset.update(is_featured=True)
#     feature_testimonials.short_description = "Mettre en avant"

# ============================================================
# apps/housing/admin.py — VERSION ROBUSTE SANS TabbedTranslationAdmin
# ============================================================
# Affiche les champs FR et EN explicitement dans les fieldsets.
# Ne dépend PAS de TabbedTranslationAdmin → aucun risque de
# NotRegistered.
# ============================================================

from django.contrib import admin
from .models import (
    Category, HousingType, Housing, HousingImage,
    Favorite, SavedHousing, UserInteraction,
    Comment, Testimonial,
)


# ── Category ─────────────────────────────────────────────────
@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display  = ['name', 'created_at']
    search_fields = ['name', 'name_fr', 'name_en']

    fieldsets = (
        ('🇫🇷 Français', {
            'fields': ('name_fr', 'description_fr'),
        }),
        ('🇬🇧 English', {
            'fields': ('name_en', 'description_en'),
        }),
    )


# ── HousingType ───────────────────────────────────────────────
@admin.register(HousingType)
class HousingTypeAdmin(admin.ModelAdmin):
    list_display  = ['name', 'created_at']
    search_fields = ['name', 'name_fr', 'name_en']

    fieldsets = (
        ('🇫🇷 Français', {
            'fields': ('name_fr', 'description_fr'),
        }),
        ('🇬🇧 English', {
            'fields': ('name_en', 'description_en'),
        }),
    )


# ── HousingImage (inline) ─────────────────────────────────────
class HousingImageInline(admin.TabularInline):
    model = HousingImage
    extra = 1


# ── Housing ───────────────────────────────────────────────────
@admin.register(Housing)
class HousingAdmin(admin.ModelAdmin):
    list_display  = [
        'title', 'owner', 'category', 'housing_type',
        'city', 'district', 'price', 'status',
        'is_visible', 'views_count', 'likes_count', 'created_at',
    ]
    list_filter   = ['status', 'category', 'housing_type', 'city', 'is_visible']
    search_fields = ['title_fr', 'title_en', 'description_fr', 'owner__username']
    readonly_fields = ['views_count', 'likes_count', 'created_at', 'updated_at']
    inlines = [HousingImageInline]

    fieldsets = (
        ('Propriétaire', {
            'fields': ('owner',),
        }),
        ('🇫🇷 Titre & Description (Français)', {
            'fields': ('title_fr', 'description_fr', 'additional_features_fr'),
        }),
        ('🇬🇧 Title & Description (English)', {
            'fields': ('title_en', 'description_en', 'additional_features_en'),
            'classes': ('collapse',),   # réduit par défaut, clic pour ouvrir
        }),
        ('Caractéristiques', {
            'fields': ('category', 'housing_type', 'price', 'area', 'rooms', 'bathrooms'),
        }),
        ('Localisation', {
            'fields': ('region', 'city', 'district', 'latitude', 'longitude'),
        }),
        ('Médias', {
            'fields': ('video', 'virtual_360'),
        }),
        ('Statut & Visibilité', {
            'fields': ('status', 'is_visible'),
        }),
        ('Statistiques', {
            'fields': ('views_count', 'likes_count', 'created_at', 'updated_at'),
        }),
    )


# ── Favorite ──────────────────────────────────────────────────
@admin.register(Favorite)
class FavoriteAdmin(admin.ModelAdmin):
    list_display  = ['user', 'housing', 'created_at']
    search_fields = ['user__username', 'housing__title_fr']


# ── SavedHousing ──────────────────────────────────────────────
@admin.register(SavedHousing)
class SavedHousingAdmin(admin.ModelAdmin):
    list_display  = ['user', 'housing', 'created_at']
    search_fields = ['user__username', 'housing__title_fr']


# ── UserInteraction ───────────────────────────────────────────
@admin.register(UserInteraction)
class UserInteractionAdmin(admin.ModelAdmin):
    list_display  = [
        'user', 'housing', 'viewed', 'liked',
        'saved', 'contacted', 'view_count', 'updated_at',
    ]
    list_filter   = ['viewed', 'liked', 'saved', 'contacted']
    search_fields = ['user__username', 'housing__title_fr']


# ── Comment ───────────────────────────────────────────────────
@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display  = ['housing', 'user', 'rating', 'created_at']
    list_filter   = ['rating', 'created_at']
    search_fields = ['housing__title_fr', 'user__username', 'content_fr']

    fieldsets = (
        ('Informations', {
            'fields': ('housing', 'user', 'rating'),
        }),
        ('🇫🇷 Commentaire (Français)', {
            'fields': ('content_fr',),
        }),
        ('🇬🇧 Comment (English)', {
            'fields': ('content_en',),
            'classes': ('collapse',),
        }),
        ('Dates', {
            'fields': ('created_at', 'updated_at'),
        }),
    )
    readonly_fields = ['created_at', 'updated_at']


# ── Testimonial ───────────────────────────────────────────────
@admin.register(Testimonial)
class TestimonialAdmin(admin.ModelAdmin):
    list_display  = ['user', 'rating', 'is_approved', 'is_featured', 'created_at']
    list_filter   = ['is_approved', 'is_featured', 'rating']
    search_fields = ['user__username', 'content_fr']
    actions       = ['approve_testimonials', 'feature_testimonials']

    fieldsets = (
        ('Informations', {
            'fields': ('user', 'rating', 'is_approved', 'is_featured'),
        }),
        ('🇫🇷 Témoignage (Français)', {
            'fields': ('content_fr',),
        }),
        ('🇬🇧 Testimonial (English)', {
            'fields': ('content_en',),
            'classes': ('collapse',),
        }),
    )

    def approve_testimonials(self, request, queryset):
        queryset.update(is_approved=True)
    approve_testimonials.short_description = "Approuver les témoignages sélectionnés"

    def feature_testimonials(self, request, queryset):
        queryset.update(is_featured=True)
    feature_testimonials.short_description = "Mettre en avant"
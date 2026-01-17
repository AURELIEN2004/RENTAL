# ============================================
# apps/housing/filters.py - FILTRES COMPLETS
# ============================================

import django_filters
from django.db.models import Q
from .models import Housing

class HousingFilter(django_filters.FilterSet):
    """
    Système de filtrage complet pour les logements
    Supporte tous les critères de recherche avancée
    """
    
    # ================== RECHERCHE TEXTUELLE ==================
    search = django_filters.CharFilter(method='filter_search', label='Recherche')
    
    # ================== LOCALISATION ==================
    category = django_filters.NumberFilter(field_name='category__id')
    housing_type = django_filters.NumberFilter(field_name='housing_type__id')
    region = django_filters.NumberFilter(field_name='region__id')
    city = django_filters.NumberFilter(field_name='city__id')
    district = django_filters.NumberFilter(field_name='district__id')
    
    # ================== PRIX ==================
    min_price = django_filters.NumberFilter(field_name='price', lookup_expr='gte')
    max_price = django_filters.NumberFilter(field_name='price', lookup_expr='lte')
    
    # ================== SUPERFICIE ==================
    min_area = django_filters.NumberFilter(field_name='area', lookup_expr='gte')
    max_area = django_filters.NumberFilter(field_name='area', lookup_expr='lte')
    
    # ================== CARACTÉRISTIQUES ==================
    rooms = django_filters.NumberFilter(field_name='rooms', lookup_expr='exact')
    min_rooms = django_filters.NumberFilter(field_name='rooms', lookup_expr='gte')
    max_rooms = django_filters.NumberFilter(field_name='rooms', lookup_expr='lte')
    
    bathrooms = django_filters.NumberFilter(field_name='bathrooms', lookup_expr='exact')
    min_bathrooms = django_filters.NumberFilter(field_name='bathrooms', lookup_expr='gte')
    max_bathrooms = django_filters.NumberFilter(field_name='bathrooms', lookup_expr='lte')
    
    # ================== STATUT ==================
    status = django_filters.CharFilter(field_name='status', lookup_expr='exact')
    
    # ================== TRI ==================
    ordering = django_filters.OrderingFilter(
        fields=(
            ('created_at', 'recent'),
            ('price', 'price'),
            ('area', 'area'),
            ('views_count', 'views'),
            ('likes_count', 'likes'),
        ),
        field_labels={
            'created_at': 'Date de publication',
            'price': 'Prix',
            'area': 'Superficie',
            'views_count': 'Vues',
            'likes_count': 'Likes',
        }
    )
    
    class Meta:
        model = Housing
        fields = []  # On définit tout manuellement ci-dessus
    
    def filter_search(self, queryset, name, value):
        """
        Recherche textuelle multicritères
        Cherche dans: titre, description, ville, quartier, région
        """
        if not value:
            return queryset
        
        return queryset.filter(
            Q(title__icontains=value) |
            Q(description__icontains=value) |
            Q(city__name__icontains=value) |
            Q(district__name__icontains=value) |
            Q(region__name__icontains=value) |
            Q(category__name__icontains=value) |
            Q(housing_type__name__icontains=value)
        ).distinct()


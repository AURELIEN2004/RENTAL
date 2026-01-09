
# ============================================
# 📁 apps/housing/filters.py - COMPLET
# ============================================

import django_filters
from .models import Housing

class HousingFilter(django_filters.FilterSet):
    min_price = django_filters.NumberFilter(field_name='price', lookup_expr='gte')
    max_price = django_filters.NumberFilter(field_name='price', lookup_expr='lte')
    min_area = django_filters.NumberFilter(field_name='area', lookup_expr='gte')
    max_area = django_filters.NumberFilter(field_name='area', lookup_expr='lte')
    status = django_filters.CharFilter(field_name='status')
    category = django_filters.NumberFilter(field_name='category__id')
    
    class Meta:
        model = Housing
        fields = {
            'category': ['exact'],
            'housing_type': ['exact'],
            'status': ['exact'],
            'city': ['exact'],
            'district': ['exact'],
            'region': ['exact'],
            'rooms': ['exact', 'gte', 'lte'],
            'bathrooms': ['exact', 'gte', 'lte'],
        }
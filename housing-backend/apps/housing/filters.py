
# ============================================
# 📁 apps/housing/filters.py - COMPLET
# ============================================
 
import django_filters
from .models import Housing
 
class HousingFilter(django_filters.FilterSet):
    # ── Filtres existants (ne pas toucher) ──────────────────────
    min_price = django_filters.NumberFilter(field_name='price', lookup_expr='gte')
    max_price = django_filters.NumberFilter(field_name='price', lookup_expr='lte')
    min_area  = django_filters.NumberFilter(field_name='area',  lookup_expr='gte')
    max_area  = django_filters.NumberFilter(field_name='area',  lookup_expr='lte')
    status    = django_filters.CharFilter(field_name='status')
    category  = django_filters.NumberFilter(field_name='category__id')
 
    # ── NOUVEAU : Bounding box carte (ajouter ces 4 lignes) ─────
    sw_lat = django_filters.NumberFilter(field_name='latitude',  lookup_expr='gte')
    ne_lat = django_filters.NumberFilter(field_name='latitude',  lookup_expr='lte')
    sw_lng = django_filters.NumberFilter(field_name='longitude', lookup_expr='gte')
    ne_lng = django_filters.NumberFilter(field_name='longitude', lookup_expr='lte')
 
    class Meta:
        model  = Housing
        fields = {
            'category':     ['exact'],
            'housing_type': ['exact'],
            'status':       ['exact'],
            'city':         ['exact'],
            'district':     ['exact'],
            'region':       ['exact'],
            'rooms':        ['exact', 'gte', 'lte'],
            'bathrooms':    ['exact', 'gte', 'lte'],
            # NOUVEAU : ajouter latitude/longitude ici aussi
            'latitude':     ['gte', 'lte'],
            'longitude':    ['gte', 'lte'],
        }
 
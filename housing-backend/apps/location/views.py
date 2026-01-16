from django.shortcuts import render

# Create your views here.
# ============================================
# 📁 apps/location/views.py - COMPLET
# ============================================

from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from .models import Region, City, District
from .serializers import RegionSerializer, CitySerializer, DistrictSerializer


class RegionViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet pour les régions"""
    queryset = Region.objects.all()
    serializer_class = RegionSerializer
    permission_classes = [AllowAny]


class CityViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet pour les villes"""
    queryset = City.objects.all()
    serializer_class = CitySerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        queryset = City.objects.all()
        region_id = self.request.query_params.get('region', None)
        if region_id:
            queryset = queryset.filter(region_id=region_id)
        return queryset


class DistrictViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet pour les quartiers"""
    queryset = District.objects.all()
    serializer_class = DistrictSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        queryset = District.objects.all()
        city_id = self.request.query_params.get('city', None)
        if city_id:
            queryset = queryset.filter(city_id=city_id)
        return queryset

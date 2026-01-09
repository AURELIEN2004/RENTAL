
# ============================================
# 📁 apps/location/serializers.py
# ============================================

from rest_framework import serializers
from .models import Region, City, District


class RegionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Region
        fields = '__all__'


class CitySerializer(serializers.ModelSerializer):
    region_name = serializers.CharField(source='region.name', read_only=True)
    
    class Meta:
        model = City
        fields = ['id', 'name', 'region', 'region_name']


class DistrictSerializer(serializers.ModelSerializer):
    city_name = serializers.CharField(source='city.name', read_only=True)
    
    class Meta:
        model = District
        fields = ['id', 'name', 'city', 'city_name']


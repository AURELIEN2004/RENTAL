# ============================================
# 📁 apps/recherche/serializers.py
# ============================================
"""
Serializers pour les résultats de recherche enrichis
"""

from rest_framework import serializers
from apps.housing.serializers import HousingListSerializer


class SearchResultSerializer(HousingListSerializer):
    """
    Serializer enrichi pour les résultats de recherche
    Ajoute : score, distance, pertinence
    """
    score = serializers.IntegerField(read_only=True, required=False)
    distance = serializers.FloatField(read_only=True, required=False)
    distance_category = serializers.CharField(read_only=True, required=False)
    
    class Meta(HousingListSerializer.Meta):
        fields = HousingListSerializer.Meta.fields + [
            'score',
            'distance',
            'distance_category'
        ]


class SearchStatsSerializer(serializers.Serializer):
    """
    Statistiques de recherche
    """
    total_results = serializers.IntegerField()
    avg_price = serializers.FloatField()
    min_price = serializers.IntegerField()
    max_price = serializers.IntegerField()
    avg_area = serializers.FloatField(required=False)
    categories_breakdown = serializers.ListField(required=False)
    cities_breakdown = serializers.ListField(required=False)


class NearbySearchSerializer(serializers.Serializer):
    """
    Serializer pour la recherche "Près de moi"
    """
    lat = serializers.FloatField(required=True)
    lng = serializers.FloatField(required=True)
    radius = serializers.FloatField(default=5.0, required=False)
    max_results = serializers.IntegerField(default=20, required=False)
    
    def validate_lat(self, value):
        if not -90 <= value <= 90:
            raise serializers.ValidationError("Latitude invalide")
        return value
    
    def validate_lng(self, value):
        if not -180 <= value <= 180:
            raise serializers.ValidationError("Longitude invalide")
        return value
    
    def validate_radius(self, value):
        if value <= 0 or value > 50:
            raise serializers.ValidationError("Rayon doit être entre 0 et 50 km")
        return value


class SmartSearchSerializer(serializers.Serializer):
    """
    Serializer pour la recherche intelligente
    """
    # Critères de base
    query = serializers.CharField(required=False, allow_blank=True)
    city = serializers.CharField(required=False, allow_blank=True)
    category = serializers.IntegerField(required=False, allow_null=True)
    
    # Budget
    min_price = serializers.IntegerField(required=False, allow_null=True)
    max_price = serializers.IntegerField(required=False, allow_null=True)
    
    # Caractéristiques
    min_rooms = serializers.IntegerField(required=False, allow_null=True)
    min_area = serializers.IntegerField(required=False, allow_null=True)
    
    # Localisation
    lat = serializers.FloatField(required=False, allow_null=True)
    lng = serializers.FloatField(required=False, allow_null=True)
    
    # Options
    furnished = serializers.BooleanField(required=False, allow_null=True)
    max_results = serializers.IntegerField(default=20, required=False)
    
    
    def validate(self, data):
        # Au moins un critère doit être fourni
        if not any([
            data.get('query'),
            data.get('city'),
            data.get('category'),
            data.get('max_price'),
            data.get('min_rooms'),
        ]):
            raise serializers.ValidationError(
                "Au moins un critère de recherche doit être fourni"
            )
        return data
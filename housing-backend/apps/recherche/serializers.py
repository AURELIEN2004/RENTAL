# ============================================
# 📁 apps/recherche/serializers.py
# ============================================

from rest_framework import serializers
from .models import (
    SearchHistory, NearbyPlace, ChatbotConversation, 
    ChatbotMessage, SearchPreference
)
from apps.housing.serializers import HousingListSerializer


class SearchHistorySerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    city_name = serializers.CharField(source='city.name', read_only=True)
    district_name = serializers.CharField(source='district.name', read_only=True)
    
    class Meta:
        model = SearchHistory
        fields = [
            'id', 'query_text', 'category', 'category_name',
            'housing_type', 'region', 'city', 'city_name',
            'district', 'district_name', 'min_price', 'max_price',
            'min_rooms', 'max_rooms', 'min_area', 'max_area',
            'advanced_filters', 'results_count', 'search_type',
            'language', 'created_at'
        ]
        read_only_fields = ['created_at', 'results_count']


class NearbyPlaceSerializer(serializers.ModelSerializer):
    place_type_display = serializers.CharField(source='get_place_type_display', read_only=True)
    city_name = serializers.CharField(source='city.name', read_only=True)
    district_name = serializers.CharField(source='district.name', read_only=True)
    
    class Meta:
        model = NearbyPlace
        fields = [
            'id', 'name', 'place_type', 'place_type_display',
            'region', 'city', 'city_name', 'district', 'district_name',
            'latitude', 'longitude', 'address', 'description',
            'created_at', 'updated_at'
        ]


class ChatbotMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatbotMessage
        fields = [
            'id', 'conversation', 'role', 'content',
            'is_voice', 'audio_file', 'search_results', 'created_at'
        ]
        read_only_fields = ['created_at']


class ChatbotConversationSerializer(serializers.ModelSerializer):
    messages = ChatbotMessageSerializer(many=True, read_only=True)
    last_message = serializers.SerializerMethodField()
    
    class Meta:
        model = ChatbotConversation
        fields = [
            'id', 'session_id', 'language', 'messages',
            'last_message', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def get_last_message(self, obj):
        last_msg = obj.messages.order_by('-created_at').first()
        if last_msg:
            return ChatbotMessageSerializer(last_msg).data
        return None


class SearchPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = SearchPreference
        fields = [
            'id', 'user', 'price_weight', 'location_weight',
            'size_weight', 'amenities_weight', 'proximity_weight',
            'preferred_categories', 'preferred_cities', 'preferred_districts',
            'important_places', 'updated_at'
        ]
        read_only_fields = ['updated_at']


class SearchRequestSerializer(serializers.Serializer):
    """Serializer pour les requêtes de recherche"""
    # Recherche textuelle
    query = serializers.CharField(required=False, allow_blank=True)
    
    # Filtres de base
    category = serializers.IntegerField(required=False)
    housing_type = serializers.IntegerField(required=False)
    region = serializers.IntegerField(required=False)
    city = serializers.IntegerField(required=False)
    district = serializers.IntegerField(required=False)
    
    # Filtres prix
    min_price = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    max_price = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    
    # Filtres caractéristiques
    min_rooms = serializers.IntegerField(required=False)
    max_rooms = serializers.IntegerField(required=False)
    min_bathrooms = serializers.IntegerField(required=False)
    min_area = serializers.DecimalField(max_digits=8, decimal_places=2, required=False)
    max_area = serializers.DecimalField(max_digits=8, decimal_places=2, required=False)
    
    # Filtres avancés
    status = serializers.CharField(required=False)
    nearby_places = serializers.ListField(
        child=serializers.CharField(),
        required=False
    )
    
    # Options
    use_genetic_algorithm = serializers.BooleanField(default=False)
    language = serializers.ChoiceField(choices=['fr', 'en'], default='fr')
    
    # Tri
    ordering = serializers.CharField(required=False, default='-created_at')


class VoiceSearchSerializer(serializers.Serializer):
    """Serializer pour la recherche vocale"""
    audio_file = serializers.FileField(required=True)
    language = serializers.ChoiceField(choices=['fr', 'en'], default='fr')
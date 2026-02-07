
# ============================================
# 📁 apps/recherche/serializers.py - VERSION CORRIGÉE
# ============================================

from rest_framework import serializers
from .models import (
    SearchHistory, NearbyPlace, ChatbotConversation,
    ChatbotMessage, SearchPreference
)


class SearchHistorySerializer(serializers.ModelSerializer):
    """Serializer pour l'historique de recherche"""
    
    category_name = serializers.CharField(source='category.name', read_only=True)
    city_name = serializers.CharField(source='city.name', read_only=True)
    district_name = serializers.CharField(source='district.name', read_only=True)
    housing_type_name = serializers.CharField(source='housing_type.name', read_only=True)
    
    class Meta:
        model = SearchHistory
        fields = [
            'id', 'user', 'query_text', 'search_type', 'language',
            'category', 'category_name',
            'housing_type', 'housing_type_name',
            'city', 'city_name',
            'district', 'district_name',
            'min_price', 'max_price',
            'min_rooms', 'max_rooms',
            'min_area', 'max_area',
            'results_count', 'advanced_filters',
            'created_at'
        ]
        read_only_fields = ['user', 'created_at']


class NearbyPlaceSerializer(serializers.ModelSerializer):
    """Serializer pour les lieux à proximité"""
    
    city_name = serializers.CharField(source='city.name', read_only=True)
    district_name = serializers.CharField(source='district.name', read_only=True)
    region_name = serializers.CharField(source='region.name', read_only=True)
    place_type_display = serializers.CharField(source='get_place_type_display', read_only=True)
    
    class Meta:
        model = NearbyPlace
        fields = [
            'id', 'name', 'place_type', 'place_type_display',
            'description', 'address',
            'region', 'region_name',
            'city', 'city_name',
            'district', 'district_name',
            'latitude', 'longitude',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class ChatbotMessageSerializer(serializers.ModelSerializer):
    """Serializer pour les messages du chatbot"""
    
    class Meta:
        model = ChatbotMessage
        fields = [
            'id', 'conversation', 'role', 'content',
            'is_voice', 'created_at'
        ]
        read_only_fields = ['created_at']


class ChatbotConversationSerializer(serializers.ModelSerializer):
    """Serializer pour les conversations du chatbot"""
    
    messages = ChatbotMessageSerializer(many=True, read_only=True)
    message_count = serializers.IntegerField(
        source='messages.count',
        read_only=True
    )
    last_message = serializers.SerializerMethodField()
    
    class Meta:
        model = ChatbotConversation
        fields = [
            'id', 'session_id', 'user', 'language',
            'messages', 'message_count', 'last_message',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['session_id', 'created_at', 'updated_at']
    
    def get_last_message(self, obj):
        """Récupérer le dernier message"""
        last_msg = obj.messages.order_by('-created_at').first()
        if last_msg:
            return {
                'role': last_msg.role,
                'content': last_msg.content[:100] + '...' if len(last_msg.content) > 100 else last_msg.content,
                'created_at': last_msg.created_at
            }
        return None


class SearchPreferenceSerializer(serializers.ModelSerializer):
    """Serializer pour les préférences de recherche"""
    
    preferred_categories_details = serializers.SerializerMethodField()
    preferred_cities_details = serializers.SerializerMethodField()
    preferred_districts_details = serializers.SerializerMethodField()
    
    class Meta:
        model = SearchPreference
        fields = [
            'id', 'user',
            'price_weight', 'location_weight', 'size_weight',
            'amenities_weight', 'proximity_weight',
            'preferred_categories', 'preferred_categories_details',
            'preferred_cities', 'preferred_cities_details',
            'preferred_districts', 'preferred_districts_details',
            'important_places',
            'updated_at'
        ]
        read_only_fields = ['user', 'updated_at']
    
    def get_preferred_categories_details(self, obj):
        """Détails des catégories préférées"""
        return [
            {'id': cat.id, 'name': cat.name}
            for cat in obj.preferred_categories.all()
        ]
    
    def get_preferred_cities_details(self, obj):
        """Détails des villes préférées"""
        return [
            {'id': city.id, 'name': city.name, 'region': city.region.name}
            for city in obj.preferred_cities.all()
        ]
    
    def get_preferred_districts_details(self, obj):
        """Détails des quartiers préférés"""
        return [
            {'id': dist.id, 'name': dist.name, 'city': dist.city.name}
            for dist in obj.preferred_districts.all()
        ]
    
    def validate(self, data):
        """Valider que les poids totalisent environ 1.0"""
        weights = [
            data.get('price_weight', 0.2),
            data.get('location_weight', 0.3),
            data.get('size_weight', 0.2),
            data.get('amenities_weight', 0.15),
            data.get('proximity_weight', 0.15)
        ]
        
        total = sum(weights)
        if not 0.9 <= total <= 1.1:
            raise serializers.ValidationError(
                f"La somme des poids doit être proche de 1.0 (actuellement: {total})"
            )
        
        return data

        
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

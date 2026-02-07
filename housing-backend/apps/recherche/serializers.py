
# ============================================
# 📁 apps/recherche/serializers.py
# ============================================

from rest_framework import serializers
from .models import UserPreference, ConversationHistory


class UserPreferenceSerializer(serializers.ModelSerializer):
    """Serializer pour les préférences utilisateur"""
    
    class Meta:
        model = UserPreference
        fields = '__all__'
        read_only_fields = ['user', 'created_at', 'updated_at']


class ConversationHistorySerializer(serializers.ModelSerializer):
    """Serializer pour l'historique des conversations"""
    
    class Meta:
        model = ConversationHistory
        fields = [
            'id', 'conversation_id', 'user_message', 'bot_response',
            'filters_extracted', 'search_type', 'results_count', 'created_at'
        ]
        read_only_fields = ['created_at']
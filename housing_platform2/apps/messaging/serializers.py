
# ============================================
# 📁 apps/messaging/serializers.py
# ============================================

from rest_framework import serializers
from .models import Conversation, Message
from apps.users.serializers import UserSerializer


class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.username', read_only=True)
    sender_photo = serializers.ImageField(source='sender.photo', read_only=True)
    
    class Meta:
        model = Message
        fields = '__all__'


class ConversationSerializer(serializers.ModelSerializer):
    housing_title = serializers.CharField(source='housing.title', read_only=True)
    housing_image = serializers.SerializerMethodField()
    last_message = MessageSerializer(read_only=True)
    participants = UserSerializer(many=True, read_only=True)
    
    class Meta:
        model = Conversation
        fields = '__all__'
    
    def get_housing_image(self, obj):
        main_img = obj.housing.images.filter(is_main=True).first()
        if main_img:
            request = self.context.get('request')
            return request.build_absolute_uri(main_img.image.url) if request else main_img.image.url
        return None

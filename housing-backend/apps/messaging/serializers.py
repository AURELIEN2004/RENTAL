
# # ============================================
# # 📁 apps/messaging/serializers.py
# # ============================================


from rest_framework import serializers
from .models import Conversation, Message
from apps.users.serializers import UserSerializer
from apps.housing.serializers import HousingListSerializer


class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.username', read_only=True)
    sender_photo = serializers.SerializerMethodField()
    
    class Meta:
        model = Message
        fields = [
            'id', 'conversation', 'sender', 'sender_name', 'sender_photo',
            'content', 'image', 'video', 'is_read', 'created_at'
        ]
        read_only_fields = ['sender', 'created_at']
    
    def get_sender_photo(self, obj):
        request = self.context.get('request')
        if obj.sender and obj.sender.photo:
            if request:
                return request.build_absolute_uri(obj.sender.photo.url)
            return obj.sender.photo.url
        return None


class ConversationSerializer(serializers.ModelSerializer):
    housing = HousingListSerializer(read_only=True)
    participants = UserSerializer(many=True, read_only=True)
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Conversation
        fields = [
            'id', 'housing', 'participants', 'last_message', 
            'unread_count', 'created_at', 'updated_at'
        ]
    
    def get_last_message(self, obj):
        last_msg = obj.messages.order_by('-created_at').first()
        if last_msg:
            return {
                'id': last_msg.id,
                'sender': last_msg.sender.id,
                'content': last_msg.content,
                'image': last_msg.image.url if last_msg.image else None,
                'video': last_msg.video.url if last_msg.video else None,
                'created_at': last_msg.created_at,
                'is_read': last_msg.is_read
            }
        return None
    
    def get_unread_count(self, obj):
        request = self.context.get('request')
        if request and request.user:
            # Compter les messages non lus envoyés par les autres participants
            return obj.messages.filter(
                is_read=False
            ).exclude(sender=request.user).count()
        return 0
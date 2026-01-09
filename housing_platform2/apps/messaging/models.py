from django.db import models

# Create your models here.
# ============================================
# 📁 apps/messaging/models.py
# ============================================

from django.db import models
from django.conf import settings


class Conversation(models.Model):
    """Conversation entre locataire et propriétaire"""
    housing = models.ForeignKey('housing.Housing', on_delete=models.CASCADE, related_name='conversations')
    participants = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='conversations')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Conversation"
        verbose_name_plural = "Conversations"
        ordering = ['-updated_at']
    
    def __str__(self):
        return f"Conversation sur {self.housing.title}"
    
    @property
    def last_message(self):
        return self.messages.first()


class Message(models.Model):
    """Message dans une conversation"""
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sent_messages')
    
    content = models.TextField(blank=True)
    image = models.ImageField(upload_to='messages/', null=True, blank=True)
    video = models.FileField(upload_to='messages/videos/', null=True, blank=True)
    
    is_read = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Message"
        verbose_name_plural = "Messages"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Message de {self.sender.username} à {self.created_at}"

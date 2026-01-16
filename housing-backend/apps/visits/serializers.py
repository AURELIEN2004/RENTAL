
# ============================================
# 📁 apps/visits/serializers.py
# ============================================

from rest_framework import serializers
from .models import Visit


class VisitSerializer(serializers.ModelSerializer):
    housing_title = serializers.CharField(source='housing.title', read_only=True)
    housing_image = serializers.SerializerMethodField()
    locataire_name = serializers.CharField(source='locataire.username', read_only=True)
    owner_name = serializers.CharField(source='housing.owner.username', read_only=True)
    is_upcoming = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Visit
        fields = '__all__'
    
    def get_housing_image(self, obj):
        main_img = obj.housing.images.filter(is_main=True).first()
        if main_img:
            request = self.context.get('request')
            return request.build_absolute_uri(main_img.image.url) if request else main_img.image.url
        return None


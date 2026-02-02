
# # ============================================
# # 📁 apps/visits/serializers.py
# # ============================================

# from rest_framework import serializers
# from .models import Visit


# class VisitSerializer(serializers.ModelSerializer):
#     housing_title = serializers.CharField(source='housing.title', read_only=True)
#     housing_image = serializers.SerializerMethodField()
#     locataire_name = serializers.CharField(source='locataire.username', read_only=True)
#     owner_name = serializers.CharField(source='housing.owner.username', read_only=True)
#     is_upcoming = serializers.BooleanField(read_only=True)
    
#     class Meta:
#         model = Visit
#         fields = '__all__'
    
#     def get_housing_image(self, obj):
#         main_img = obj.housing.images.filter(is_main=True).first()
#         if main_img:
#             request = self.context.get('request')
#             return request.build_absolute_uri(main_img.image.url) if request else main_img.image.url
#         return None

from rest_framework import serializers
from .models import Visit


class VisitSerializer(serializers.ModelSerializer):
    housing_title = serializers.CharField(source='housing.title', read_only=True)
    housing_image = serializers.SerializerMethodField()
    locataire_name = serializers.CharField(source='locataire.username', read_only=True)
    locataire_phone = serializers.CharField(source='locataire.phone', read_only=True)
    owner_name = serializers.CharField(source='housing.owner.username', read_only=True)
    owner_phone = serializers.CharField(source='housing.owner.phone', read_only=True)
    is_upcoming = serializers.BooleanField(read_only=True)
    
    # ✅ AJOUT : Informations supplémentaires du logement
    housing_price = serializers.IntegerField(source='housing.price', read_only=True)
    housing_address = serializers.SerializerMethodField()
    
    class Meta:
        model = Visit
        fields = [
            'id', 'housing', 'housing_title', 'housing_image', 
            'housing_price', 'housing_address',
            'locataire', 'locataire_name', 'locataire_phone',
            'owner_name', 'owner_phone',
            'date', 'time', 'status', 'message', 'response_message',
            'is_upcoming', 'created_at', 'updated_at'
        ]
        read_only_fields = ['locataire', 'created_at', 'updated_at']
    
    def get_housing_image(self, obj):
        """Récupérer l'image principale du logement"""
        try:
            # Chercher l'image marquée comme principale
            main_img = obj.housing.images.filter(is_main=True).first()
            
            # Si pas d'image principale, prendre la première disponible
            if not main_img:
                main_img = obj.housing.images.first()
            
            if main_img and main_img.image:
                request = self.context.get('request')
                if request:
                    # Construire l'URL absolue
                    return request.build_absolute_uri(main_img.image.url)
                # Fallback : retourner l'URL relative
                return main_img.image.url
        except Exception as e:
            print(f"❌ Erreur récupération image visite: {e}")
        
        # Retourner None si aucune image
        return None
    
    def get_housing_address(self, obj):
        """Adresse complète du logement"""
        parts = []
        if obj.housing.district:
            parts.append(obj.housing.district.name)
        if obj.housing.city:
            parts.append(obj.housing.city.name)
        return ', '.join(parts) if parts else 'Non spécifié'
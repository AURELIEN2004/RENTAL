

# ============================================
# apps/housing/serializers.py - CORRECTION URLS IMAGES
# ============================================

from rest_framework import serializers
from .models import (
    Category, HousingType, Housing, HousingImage, 
    Favorite, SavedHousing, UserInteraction, Comment, Testimonial
)
from apps.location.serializers import RegionSerializer, CitySerializer, DistrictSerializer
from apps.users.serializers import UserSerializer


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'


class HousingTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = HousingType
        fields = '__all__'


class HousingImageSerializer(serializers.ModelSerializer):
    # CORRECTION: Forcer l'URL complÃ¨te
    image = serializers.SerializerMethodField()
    
    class Meta:
        model = HousingImage
        fields = ['id', 'image', 'is_main', 'uploaded_at']
    
    def get_image(self, obj):
        request = self.context.get('request')
        if obj.image and hasattr(obj.image, 'url'):
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None


class HousingListSerializer(serializers.ModelSerializer):
    """SÃ©rialiseur pour la liste des logements (lÃ©ger)"""
    owner_name = serializers.CharField(source='owner.username', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    type_name = serializers.CharField(source='housing_type.name', read_only=True)
    city_name = serializers.CharField(source='city.name', read_only=True)
    district_name = serializers.CharField(source='district.name', read_only=True)
    main_image = serializers.SerializerMethodField()
    display_name = serializers.CharField(read_only=True)
    days_since_published = serializers.IntegerField(read_only=True)
    
    # CORRECTION: Ajouter is_liked et is_saved
    is_liked = serializers.SerializerMethodField()
    is_saved = serializers.SerializerMethodField()
    
    class Meta:
        model = Housing
        fields = [
            'id', 'title', 'display_name', 'price', 'area', 'rooms', 
            'bathrooms', 'status', 'views_count', 'likes_count',
            'owner_name', 'category_name', 'type_name', 'city_name', 
            'district_name', 'main_image', 'days_since_published', 
            'is_liked', 'is_saved', 'created_at','latitude', 'longitude'  # ✅ AJOUT pour la carte
        ]
    
    def get_main_image(self, obj):
        request = self.context.get('request')
        main_img = obj.images.filter(is_main=True).first()
        if not main_img:
            main_img = obj.images.first()
        
        if main_img and main_img.image:
            if request:
                return request.build_absolute_uri(main_img.image.url)
            return main_img.image.url
        return None
    
    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Favorite.objects.filter(user=request.user, housing=obj).exists()
        return False
    
    def get_is_saved(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return SavedHousing.objects.filter(user=request.user, housing=obj).exists()
        return False


class HousingDetailSerializer(serializers.ModelSerializer):
    """SÃ©rialiseur dÃ©taillÃ© pour un logement"""
    owner = UserSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    housing_type = HousingTypeSerializer(read_only=True)
    region = RegionSerializer(read_only=True)
    city = CitySerializer(read_only=True)
    district = DistrictSerializer(read_only=True)
    images = HousingImageSerializer(many=True, read_only=True)
    display_name = serializers.CharField(read_only=True)
    days_since_published = serializers.IntegerField(read_only=True)
    
    # CORRECTION: Ajouter statut like/save
    is_liked = serializers.SerializerMethodField()
    is_saved = serializers.SerializerMethodField()
    
    # CORRECTION: Ajouter les commentaires
    comments = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Housing
        fields = [
            'id', 'owner', 'category', 'housing_type', 'title', 'display_name',
            'description', 'price', 'area', 'rooms', 'bathrooms',
            'region', 'city', 'district', 'latitude', 'longitude',
            'status', 'video', 'virtual_360', 'additional_features',
            'views_count', 'likes_count', 'is_visible', 'images',
            'days_since_published', 'is_liked', 'is_saved',
            'comments', 'comments_count', 'created_at', 'updated_at'
        ]
    
    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Favorite.objects.filter(user=request.user, housing=obj).exists()
        return False
    
    def get_is_saved(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return SavedHousing.objects.filter(user=request.user, housing=obj).exists()
        return False
    
    def get_comments(self, obj):
        comments = obj.comments.all()[:5]  # Les 5 derniers
        return CommentSerializer(comments, many=True, context=self.context).data
    
    def get_comments_count(self, obj):
        return obj.comments.count()


class HousingCreateUpdateSerializer(serializers.ModelSerializer):
    """SÃ©rialiseur pour crÃ©ation/modification de logement"""
    class Meta:
        model = Housing
        exclude = ['owner', 'views_count', 'likes_count']


class FavoriteSerializer(serializers.ModelSerializer):
    housing = HousingListSerializer(read_only=True)
    
    class Meta:
        model = Favorite
        fields = '__all__'


class SavedHousingSerializer(serializers.ModelSerializer):
    housing = HousingListSerializer(read_only=True)
    
    class Meta:
        model = SavedHousing
        fields = '__all__'


class UserInteractionSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserInteraction
        fields = '__all__'


class CommentSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True)
    user_photo = serializers.SerializerMethodField()
    
    class Meta:
        model = Comment
        fields = '__all__'
    
    def get_user_photo(self, obj):
        request = self.context.get('request')
        if obj.user.photo:
            if request:
                return request.build_absolute_uri(obj.user.photo.url)
            return obj.user.photo.url
        return None


class TestimonialSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True)
    user_photo = serializers.SerializerMethodField()
    
    class Meta:
        model = Testimonial
        fields = '__all__'
    
    def get_user_photo(self, obj):
        request = self.context.get('request')
        if obj.user.photo:
            if request:
                return request.build_absolute_uri(obj.user.photo.url)
            return obj.user.photo.url
        return None
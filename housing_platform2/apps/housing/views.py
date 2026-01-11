# ============================================
# 📁 apps/housing/views.py - COMPLET  hulll
# ============================================

from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q

from .models import (
    Category, HousingType, Housing, HousingImage,
    Favorite, SavedHousing, UserInteraction, Comment, Testimonial
)
from .serializers import (
    CategorySerializer, HousingTypeSerializer,
    HousingListSerializer, HousingDetailSerializer, HousingCreateUpdateSerializer,
    FavoriteSerializer, SavedHousingSerializer,
    CommentSerializer, TestimonialSerializer
)
from .genetic_algorithm import apply_genetic_algorithm
from .filters import HousingFilter
from .permissions import IsOwnerOrReadOnly


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet pour les catégories"""
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]


class HousingTypeViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet pour les types de logement"""
    queryset = HousingType.objects.all()
    serializer_class = HousingTypeSerializer
    permission_classes = [AllowAny]


class HousingViewSet(viewsets.ModelViewSet):
    """ViewSet principal pour les logements"""
    queryset = Housing.objects.filter(is_visible=True).select_related(
        'owner', 'category', 'housing_type', 'region', 'city', 'district'
    ).prefetch_related('images')
    
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = HousingFilter
    search_fields = ['title', 'description', 'city__name', 'district__name']
    ordering_fields = ['price', 'created_at', 'views_count', 'likes_count']
    permission_classes = [IsOwnerOrReadOnly]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return HousingListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return HousingCreateUpdateSerializer
        return HousingDetailSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]
    
    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)
    
    @action(detail=True, methods=['post'])
    def increment_views(self, request, pk=None):
        """Incrémenter le compteur de vues"""
        housing = self.get_object()
        housing.increment_views()
        
        # Enregistrer l'interaction
        if request.user.is_authenticated:
            interaction, created = UserInteraction.objects.get_or_create(
                user=request.user,
                housing=housing
            )
            interaction.viewed = True
            interaction.view_count += 1
            interaction.save()
        
        return Response({'views_count': housing.views_count})
    
    @action(detail=True, methods=['post'])
    def toggle_like(self, request, pk=None):
        """Liker/Unliker un logement"""
        housing = self.get_object()
        
        favorite, created = Favorite.objects.get_or_create(
            user=request.user,
            housing=housing
        )
        
        if not created:
            favorite.delete()
            housing.decrement_likes()
            liked = False
        else:
            housing.increment_likes()
            liked = True
            
            # Enregistrer l'interaction
            interaction, _ = UserInteraction.objects.get_or_create(
                user=request.user,
                housing=housing
            )
            interaction.liked = True
            interaction.save()
        
        return Response({'liked': liked, 'likes_count': housing.likes_count})
    
    @action(detail=True, methods=['post'])
    def toggle_save(self, request, pk=None):
        """Enregistrer/Désenregistrer un logement"""
        housing = self.get_object()
        
        saved, created = SavedHousing.objects.get_or_create(
            user=request.user,
            housing=housing
        )
        
        if not created:
            saved.delete()
            is_saved = False
        else:
            is_saved = True
            
            # Enregistrer l'interaction
            interaction, _ = UserInteraction.objects.get_or_create(
                user=request.user,
                housing=housing
            )
            interaction.saved = True
            interaction.save()
        
        return Response({'saved': is_saved})
    
    @action(detail=False, methods=['get'])
    def my_housings(self, request):
        """Logements du propriétaire connecté"""
        housings = Housing.objects.filter(owner=request.user)
        serializer = HousingListSerializer(housings, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def recommended(self, request):
        """Logements recommandés avec algorithme génétique"""
        housings = self.get_queryset()
        
        if request.user.is_authenticated:
            # Utiliser l'algorithme génétique
            ranked_housings = apply_genetic_algorithm(request.user, housings)
            serializer = HousingListSerializer(
                ranked_housings, 
                many=True, 
                context={'request': request}
            )
        else:
            # Si non connecté, tri par popularité
            ranked_housings = housings.order_by('-views_count', '-likes_count')[:20]
            serializer = HousingListSerializer(ranked_housings, many=True, context={'request': request})
        
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def favorites(self, request):
        """Logements favoris de l'utilisateur"""
        favorites = Favorite.objects.filter(user=request.user)
        serializer = FavoriteSerializer(favorites, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def saved(self, request):
        """Logements enregistrés par l'utilisateur"""
        saved = SavedHousing.objects.filter(user=request.user)
        serializer = SavedHousingSerializer(saved, many=True, context={'request': request})
        return Response(serializer.data)


class CommentViewSet(viewsets.ModelViewSet):
    """ViewSet pour les commentaires"""
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        housing_id = self.request.query_params.get('housing')
        if housing_id:
            return Comment.objects.filter(housing_id=housing_id)
        return Comment.objects.all()
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class TestimonialViewSet(viewsets.ModelViewSet):
    """ViewSet pour les témoignages"""
    queryset = Testimonial.objects.filter(is_approved=True)
    serializer_class = TestimonialSerializer
    permission_classes = [AllowAny]
    
    def get_permissions(self):
        if self.action == 'create':
            return [IsAuthenticated()]
        return super().get_permissions()
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

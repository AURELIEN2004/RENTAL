# ============================================
# 📁 apps/housing/views.py 
# ===================================

from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Count, Sum, Avg
from datetime import datetime, timedelta
from django.utils import timezone

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
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]


class HousingTypeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = HousingType.objects.all()
    serializer_class = HousingTypeSerializer
    permission_classes = [AllowAny]


class HousingViewSet(viewsets.ModelViewSet):
    queryset = Housing.objects.filter(is_visible=True).select_related(
        'owner', 'category', 'housing_type', 'region', 'city', 'district'
    ).prefetch_related('images')
    
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = HousingFilter
    search_fields = ['title', 'description', 'city__name', 'district__name']
    ordering_fields = ['price', 'created_at', 'views_count', 'likes_count', 'area', 'rooms']
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
        return [IsAuthenticated(), IsOwnerOrReadOnly()]
    
    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)
    
    def perform_update(self, serializer):
        """Mise à jour d'un logement (vérifier ownership)"""
        serializer.save()
    
    def perform_destroy(self, instance):
        """Suppression d'un logement (vérifier ownership)"""
        instance.delete()
    
    @action(detail=True, methods=['post'])
    def increment_views(self, request, pk=None):
        """Incrémenter le compteur de vues"""
        housing = self.get_object()
        housing.increment_views()
        
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
            
            interaction, _ = UserInteraction.objects.get_or_create(
                user=request.user,
                housing=housing
            )
            interaction.saved = True
            interaction.save()
        
        return Response({'saved': is_saved})
    
    @action(detail=False, methods=['get'])
    def my_housings(self, request):
        """Logements du propriétaire connecté avec options de tri et filtres avancés"""
        housings = Housing.objects.filter(owner=request.user).select_related(
            'category', 'housing_type', 'city', 'district'
        ).prefetch_related('images')
        
        # Tri personnalisé
        sort_by = request.query_params.get('sort', '-created_at')
        valid_sorts = [
            'price', '-price', 'created_at', '-created_at', 
            'views_count', '-views_count', 'likes_count', '-likes_count',
            'title', '-title', 'area', '-area', 'rooms', '-rooms'
        ]
        if sort_by in valid_sorts:
            housings = housings.order_by(sort_by)
        else:
            housings = housings.order_by('-created_at')
        
        # Filtres additionnels
        status_filter = request.query_params.get('status')
        if status_filter and status_filter in ['disponible', 'reserve', 'occupe']:
            housings = housings.filter(status=status_filter)
        
        category_filter = request.query_params.get('category')
        if category_filter:
            try:
                housings = housings.filter(category_id=int(category_filter))
            except ValueError:
                pass
        
        housing_type_filter = request.query_params.get('housing_type')
        if housing_type_filter:
            try:
                housings = housings.filter(housing_type_id=int(housing_type_filter))
            except ValueError:
                pass
        
        # Recherche textuelle
        search = request.query_params.get('search')
        if search:
            housings = housings.filter(
                Q(title__icontains=search) | 
                Q(description__icontains=search)
            )
        
        serializer = HousingListSerializer(housings, many=True, context={'request': request})
        
        return Response({
            'count': housings.count(),
            'results': serializer.data
        })
    
    @action(detail=False, methods=['get'])
    def owner_statistics(self, request):
        """Statistiques détaillées pour le propriétaire"""
        housings = Housing.objects.filter(owner=request.user)
        
        # Statistiques globales
        total_housings = housings.count()
        total_views = housings.aggregate(Sum('views_count'))['views_count__sum'] or 0
        total_likes = housings.aggregate(Sum('likes_count'))['likes_count__sum'] or 0
        
        # Répartition par statut
        status_distribution = housings.values('status').annotate(
            count=Count('id')
        ).order_by('status')
        
        # Répartition par catégorie
        category_distribution = housings.values(
            'category__name'
        ).annotate(
            count=Count('id')
        ).order_by('-count')
        
        # Prix moyen
        avg_price = housings.aggregate(Avg('price'))['price__avg'] or 0
        
        # Logements les plus populaires (top 5)
        top_housings = housings.order_by('-views_count')[:5]
        top_housings_data = HousingListSerializer(
            top_housings, 
            many=True, 
            context={'request': request}
        ).data
        
        # Statistiques des 30 derniers jours
        thirty_days_ago = timezone.now() - timedelta(days=30)
        recent_housings = housings.filter(created_at__gte=thirty_days_ago).count()
        
        # Interactions utilisateurs
        total_interactions = UserInteraction.objects.filter(
            housing__owner=request.user
        ).count()
        
        total_favorites = Favorite.objects.filter(
            housing__owner=request.user
        ).count()
        
        total_saved = SavedHousing.objects.filter(
            housing__owner=request.user
        ).count()
        
        # Messages reçus
        from apps.messaging.models import Conversation
        total_conversations = Conversation.objects.filter(
            housing__owner=request.user
        ).count()
        
        # Visites demandées
        from apps.visits.models import Visit
        total_visits = Visit.objects.filter(
            housing__owner=request.user
        ).count()
        
        pending_visits = Visit.objects.filter(
            housing__owner=request.user,
            status='attente'
        ).count()
        
        return Response({
            'total_housings': total_housings,
            'total_views': total_views,
            'total_likes': total_likes,
            'total_favorites': total_favorites,
            'total_saved': total_saved,
            'total_interactions': total_interactions,
            'total_conversations': total_conversations,
            'total_visits': total_visits,
            'pending_visits': pending_visits,
            'recent_housings_30d': recent_housings,
            'average_price': round(avg_price, 2),
            'status_distribution': list(status_distribution),
            'category_distribution': list(category_distribution),
            'top_housings': top_housings_data,
        })
    
    @action(detail=False, methods=['get'])
    def recommended(self, request):
        """Logements recommandés avec algorithme génétique"""
        housings = self.get_queryset()
        
        if request.user.is_authenticated:
            ranked_housings = apply_genetic_algorithm(request.user, housings)
            serializer = HousingListSerializer(
                ranked_housings, 
                many=True, 
                context={'request': request}
            )
        else:
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
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        housing_id = self.request.query_params.get('housing')
        if housing_id:
            return Comment.objects.filter(housing_id=housing_id).order_by('-created_at')
        return Comment.objects.all()
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class TestimonialViewSet(viewsets.ModelViewSet):
    queryset = Testimonial.objects.filter(is_approved=True)
    serializer_class = TestimonialSerializer
    permission_classes = [AllowAny]
    
    def get_permissions(self):
        if self.action == 'create':
            return [IsAuthenticated()]
        return super().get_permissions()
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
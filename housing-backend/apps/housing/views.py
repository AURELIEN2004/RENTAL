
# # ============================================
# # 📁 apps/housing/views.py 
# # ============================================

from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Count, Sum, Avg, Min, Max
from django.utils import timezone
import traceback

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
# from .genetic_algorithm import apply_genetic_algorithm
# from .filters import HousingFilter
from .permissions import IsOwnerOrReadOnly


# --- CATEGORIES ET TYPES ---
class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]

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


class HousingTypeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = HousingType.objects.all()
    serializer_class = HousingTypeSerializer
    permission_classes = [AllowAny]


# --- HOUSING VIEWSET FUSIONNÉ ---
class HousingViewSet(viewsets.ModelViewSet):
    """
    ViewSet principal pour les logements
    Avec filtrage avancé, recherche, tri, recommandations, interactions et statistiques propriétaires
    """
    queryset = Housing.objects.filter(is_visible=True).select_related(
        'owner', 'category', 'housing_type', 'region', 'city', 'district'
    ).prefetch_related('images')

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]

    search_fields = ['title', 'description', 'city__name', 'district__name']
    ordering_fields = ['price', 'created_at', 'views_count', 'likes_count', 'area', 'rooms']
    permission_classes = [IsOwnerOrReadOnly]

    # ----------------------------
    # Serializers selon l'action
    # ----------------------------
    def get_serializer_class(self):
        if self.action == 'list':
            return HousingListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return HousingCreateUpdateSerializer
        return HousingDetailSerializer

    # ----------------------------
    # Permissions dynamiques
    # ----------------------------
    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'search_advanced', 'recommended']:
            return [AllowAny()]
        elif self.action == 'increment_views':  # ✅ CORRECTION
            return [AllowAny()]  # Tout le monde peut voir
        return [IsAuthenticated(), IsOwnerOrReadOnly()]

    # ----------------------------
    # CRUD OWNER
    # ----------------------------
    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    def perform_update(self, serializer):
        serializer.save()

    def perform_destroy(self, instance):
        instance.delete()

    # ----------------------------
    # LIST AVEC TRI ET PAGINATION
    # ----------------------------
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())

        # Tri personnalisé via query param
        sort_by = request.query_params.get('sortBy', 'recent')
        queryset = self.apply_sorting(queryset, sort_by)

        # Pagination
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'count': queryset.count(),
            'results': serializer.data
        })

    def apply_sorting(self, queryset, sort_by):
        sorting_map = {
            'recent': '-created_at',
            'price_asc': 'price',
            'price_desc': '-price',
            'area_asc': 'area',
            'area_desc': '-area',
            'popular': '-views_count',
            'liked': '-likes_count',
        }
        return queryset.order_by(sorting_map.get(sort_by, '-created_at'))

    # ----------------------------
    # RECHERCHE AVANCÉE
    # ----------------------------
    @action(detail=False, methods=['get'])
    def search_advanced(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        sort_by = request.query_params.get('sortBy', 'recent')
        queryset = self.apply_sorting(queryset, sort_by)

        stats = {
            'total': queryset.count(),
            'avg_price': queryset.aggregate(Avg('price'))['price__avg'] or 0,
            'min_price': queryset.aggregate(Min('price'))['price__min'] or 0,
            'max_price': queryset.aggregate(Max('price'))['price__max'] or 0,
            'categories': queryset.values('category__name').annotate(count=Count('id')),
        }

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            response = self.get_paginated_response(serializer.data)
            response.data['stats'] = stats
            return response

        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'count': queryset.count(),
            'stats': stats,
            'results': serializer.data
        })

    # ----------------------------
    # RECOMMANDATIONS
    # ----------------------------
    @action(detail=False, methods=['get'])
    def recommended(self, request):
        try:
            housings = Housing.objects.filter(is_visible=True, status='disponible').select_related(
                'owner', 'category', 'housing_type', 'region', 'city', 'district'
            ).prefetch_related('images')

            if not housings.exists():
                return Response([], status=status.HTTP_200_OK)

            if request.user.is_authenticated:
                try:
                    ranked_housings = apply_genetic_algorithm(request.user, housings)
                except Exception as e:
                    print(f"⚠️ Genetic algorithm error: {e}")
                    ranked_housings = housings.order_by('-views_count', '-likes_count')[:20]
            else:
                ranked_housings = housings.order_by('-views_count', '-likes_count')[:20]

            serializer = HousingListSerializer(ranked_housings, many=True, context={'request': request})
            return Response(serializer.data)
        except Exception as e:
            print(f"❌ Error in recommended endpoint: {e}")
            traceback.print_exc()
            return Response({"error": "Erreur lors du chargement des recommandations"},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # ----------------------------
    # ACTIONS UTILISATEURS
    # ----------------------------
    @action(detail=True, methods=['post'])
    def increment_views(self, request, pk=None):
        housing = self.get_object()
        housing.increment_views()

        if request.user.is_authenticated:
            interaction, _ = UserInteraction.objects.get_or_create(user=request.user, housing=housing)
            interaction.viewed = True
            interaction.view_count += 1
            interaction.save()

        return Response({'views_count': housing.views_count})

    @action(detail=True, methods=['post'])
    def toggle_like(self, request, pk=None):
        housing = self.get_object()
        favorite, created = Favorite.objects.get_or_create(user=request.user, housing=housing)
        if not created:
            favorite.delete()
            housing.decrement_likes()
            liked = False
        else:
            housing.increment_likes()
            liked = True
            interaction, _ = UserInteraction.objects.get_or_create(user=request.user, housing=housing)
            interaction.liked = True
            interaction.save()
        return Response({'liked': liked, 'likes_count': housing.likes_count})

    @action(detail=True, methods=['post'])
    def toggle_save(self, request, pk=None):
        housing = self.get_object()
        saved, created = SavedHousing.objects.get_or_create(user=request.user, housing=housing)
        if not created:
            saved.delete()
            is_saved = False
        else:
            is_saved = True
            interaction, _ = UserInteraction.objects.get_or_create(user=request.user, housing=housing)
            interaction.saved = True
            interaction.save()
        return Response({'saved': is_saved})

    @action(detail=False, methods=['get'])
    def favorites(self, request):
        favorites = Favorite.objects.filter(user=request.user)
        serializer = FavoriteSerializer(favorites, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def saved(self, request):
        saved = SavedHousing.objects.filter(user=request.user)
        serializer = SavedHousingSerializer(saved, many=True, context={'request': request})
        return Response(serializer.data)

    # ----------------------------
    # ACTIONS PROPRIÉTAIRES
    # ----------------------------
    @action(detail=False, methods=['get'])
    def my_housings(self, request):
        housings = Housing.objects.filter(owner=request.user).select_related(
            'category', 'housing_type', 'city', 'district'
        ).prefetch_related('images')

        sort_by = request.query_params.get('sort', '-created_at')
        valid_sorts = ['price', '-price', 'created_at', '-created_at', 'views_count', '-views_count', 'area', 'rooms']
        if sort_by in valid_sorts:
            housings = housings.order_by(sort_by)

        status_filter = request.query_params.get('status')
        if status_filter in ['disponible', 'reserve', 'occupe']:
            housings = housings.filter(status=status_filter)

        search = request.query_params.get('search')
        if search:
            housings = housings.filter(Q(title__icontains=search) | Q(description__icontains=search))

        serializer = HousingListSerializer(housings, many=True, context={'request': request})
        return Response({'count': housings.count(), 'results': serializer.data})

    @action(detail=False, methods=['get'])
    def owner_statistics(self, request):
        housings = Housing.objects.filter(owner=request.user)

        from apps.messaging.models import Conversation
        from apps.visits.models import Visit

        total_views = housings.aggregate(Sum('views_count'))['views_count__sum'] or 0
        total_likes = housings.aggregate(Sum('likes_count'))['likes_count__sum'] or 0
        avg_price = housings.aggregate(Avg('price'))['price__avg'] or 0

        return Response({
            'total_housings': housings.count(),
            'total_views': total_views,
            'total_likes': total_likes,
            'average_price': round(avg_price, 2),
            'status_distribution': list(housings.values('status').annotate(count=Count('id'))),
            'total_conversations': Conversation.objects.filter(housing__owner=request.user).count(),
            'pending_visits': Visit.objects.filter(housing__owner=request.user, status='attente').count(),
        })

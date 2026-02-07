
# # ============================================
# # 📁 apps/housing/urls.py - COMPLET
# # ============================================

# from django.urls import path, include
# from rest_framework.routers import DefaultRouter
# from . import views

# router = DefaultRouter()
# router.register(r'categories', views.CategoryViewSet)
# router.register(r'types', views.HousingTypeViewSet)
# router.register(r'housings', views.HousingViewSet)
# router.register(r'comments', views.CommentViewSet)
# router.register(r'testimonials', views.TestimonialViewSet)

# urlpatterns = [
#     path('', include(router.urls)),
# ]

# ============================================
# 📁 apps/housing/urls.py - VERSION CORRIGÉE COMPATIBLE FRONTEND
# ============================================

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Router pour les ViewSets
router = DefaultRouter()
router.register(r'housings', views.HousingViewSet, basename='housing')

urlpatterns = [
    # ==================== ROUTES CLASSIQUES (pour frontend existant) ====================
    
    # ✅ NOUVEAU - Route de recherche compatible avec votre frontend
    path('housing/search/', views.HousingSearchView.as_view(), name='housing-search'),
    
    # ✅ NOUVEAU - Route des catégories compatible avec votre frontend
    path('housing/categories/', views.CategoryListView.as_view(), name='category-list'),
    
    # ==================== ROUTES VIEWSET ====================
    # Toutes les routes /api/housings/* (recommended, favorites, etc.)
    path('', include(router.urls)),
]
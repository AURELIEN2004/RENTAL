
# ============================================
# 📁 apps/housing/urls.py - COMPLET
# ============================================

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
# from .preferences import RecommendedHousingsView, UserPreferenceView
from .preference_views import UserPreferenceView, RecommendedHousingsView

router = DefaultRouter()
router.register(r'categories', views.CategoryViewSet)
router.register(r'types', views.HousingTypeViewSet)
router.register(r'housings', views.HousingViewSet)
router.register(r'comments', views.CommentViewSet)
router.register(r'testimonials', views.TestimonialViewSet)
# router.register(r'housings', HousingViewSet, basename='housing')

urlpatterns = [
    path('housings/preferences/', UserPreferenceView.as_view(), name='housing-preferences'),
    path('housings/recommended/', RecommendedHousingsView.as_view(), name='housing-recommended'),
    path('', include(router.urls)),   # ← toujours en DERNIER
]

# ============================================
# 📁 apps/recherche/urls.py
# ============================================

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'search', views.SearchViewSet, basename='search')
router.register(r'history', views.SearchHistoryViewSet, basename='search-history')
router.register(r'nearby-places', views.NearbyPlaceViewSet, basename='nearby-places')
router.register(r'chatbot', views.ChatbotViewSet, basename='chatbot')
router.register(r'preferences', views.SearchPreferenceViewSet, basename='search-preferences')

urlpatterns = [
    path('', include(router.urls)),
]
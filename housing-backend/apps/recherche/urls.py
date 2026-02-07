# # ============================================
# # 📁 apps/recherche/urls.py
# # ============================================

# from django.urls import path, include
# from rest_framework.routers import DefaultRouter
# from . import views

# router = DefaultRouter()
# router.register(r'search', views.SearchViewSet, basename='search')
# router.register(r'history', views.SearchHistoryViewSet, basename='search-history')
# router.register(r'nearby-places', views.NearbyPlaceViewSet, basename='nearby-places')
# router.register(r'chatbot', views.ChatbotViewSet, basename='chatbot')
# router.register(r'preferences', views.SearchPreferenceViewSet, basename='search-preferences')

# urlpatterns = [
#     path('', include(router.urls)),
# ]

# ============================================
# 📁 apps/recherche/urls.py
# ============================================
"""
Routes pour le module de recherche
"""

from django.urls import path
from .views import (
    HousingSearchAPIView,
    NearbyHousingAPIView,
    SmartSearchAPIView,
    MapHousingAPIView
)
from .chatbot_views import (
    ChatbotQueryAPIView,
    ChatbotSuggestionsAPIView,
    ChatbotCitiesAPIView,
    ChatbotCategoriesAPIView
)

urlpatterns = [
    # 🔍 Recherche classique avec filtres
    path('search/', HousingSearchAPIView.as_view(), name='housing-search'),
    
    # 📍 Recherche géolocalisée "Près de moi"
    path('nearby/', NearbyHousingAPIView.as_view(), name='housing-nearby'),
    
    # 🧠 Recherche intelligente avec scoring
    path('smart/', SmartSearchAPIView.as_view(), name='housing-smart-search'),
    
    # 🗺️ Carte des logements
    path('map/', MapHousingAPIView.as_view(), name='housing-map'),
    
    # 🤖 CHATBOT IA
    path('chatbot/', ChatbotQueryAPIView.as_view(), name='chatbot-query'),
    path('chatbot/suggestions/', ChatbotSuggestionsAPIView.as_view(), name='chatbot-suggestions'),
    path('chatbot/cities/', ChatbotCitiesAPIView.as_view(), name='chatbot-cities'),
    path('chatbot/categories/', ChatbotCategoriesAPIView.as_view(), name='chatbot-categories'),
]
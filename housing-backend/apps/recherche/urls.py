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

from django.urls import path
from . import views

urlpatterns = [
    # Chatbot conversationnel principal
    path('chatbot/', views.ChatbotAPIView.as_view(), name='chatbot'),
    
    # Recherche intelligente avec scoring
    path('smart/', views.SmartSearchAPIView.as_view(), name='smart_search'),
    
    # Recherche par proximité
    path('nearby/', views.NearbyHousingAPIView.as_view(), name='nearby'),
    
    # Gestion des conversations
    path('conversation/<str:conversation_id>/', views.ConversationHistoryAPIView.as_view(), name='conversation_history'),
    path('conversations/', views.UserConversationsAPIView.as_view(), name='user_conversations'),
]
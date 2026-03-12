
# ============================================
# 📁 apps/recherche/urls.py  — VERSION MISE À JOUR
# ============================================

from django.urls import path
from .views import (
    HousingSearchAPIView,
    # NearbyHousingAPIView,
    # SmartSearchAPIView,
    # MapHousingAPIView,
    NLPSearchAPIView,          # ← NOUVEAU
)
from .chatbot_views import (
    ChatbotQueryAPIView,
    ChatbotSuggestionsAPIView,
    ChatbotCitiesAPIView,
    ChatbotCategoriesAPIView,
)

urlpatterns = [
    # 🔍 Recherche classique avec filtres
    path('search/',    HousingSearchAPIView.as_view(),  name='housing-search'),

    # 📍 Recherche géolocalisée "Près de moi"
    # path('nearby/',    NearbyHousingAPIView.as_view(),  name='housing-nearby'),

    # 🧠 Recherche intelligente avec scoring
    # path('smart/',     SmartSearchAPIView.as_view(),    name='housing-smart-search'),

    # 🗺️ Carte des logements
    # path('map/',       MapHousingAPIView.as_view(),     name='housing-map'),

    # 🔤 Recherche en langage naturel (NLP) — NOUVEAU — remplace le chatbot côté frontend
    path('nlp/',       NLPSearchAPIView.as_view(),      name='housing-nlp-search'),

    # 🤖 CHATBOT IA (conservé pour compatibilité)
    path('chatbot/',              ChatbotQueryAPIView.as_view(),        name='chatbot-query'),
    path('chatbot/suggestions/',  ChatbotSuggestionsAPIView.as_view(),  name='chatbot-suggestions'),
    path('chatbot/cities/',       ChatbotCitiesAPIView.as_view(),       name='chatbot-cities'),
    path('chatbot/categories/',   ChatbotCategoriesAPIView.as_view(),   name='chatbot-categories'),
]
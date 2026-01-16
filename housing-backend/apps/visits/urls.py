
# ============================================
# 📁 apps/visits/urls.py - COMPLET
# ============================================

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'visits', views.VisitViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
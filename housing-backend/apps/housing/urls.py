
# ============================================
# 📁 apps/housing/urls.py - COMPLET
# ============================================

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'categories', views.CategoryViewSet)
router.register(r'types', views.HousingTypeViewSet)
router.register(r'housings', views.HousingViewSet)
router.register(r'comments', views.CommentViewSet)
router.register(r'testimonials', views.TestimonialViewSet)

urlpatterns = [
    path('', include(router.urls)),
]


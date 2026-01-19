# ============================================
# 📁 apps/users/urls.py
# ============================================

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'users', views.UserViewSet, basename='user')

urlpatterns = [
    path('', include(router.urls)),
    path('login/', views.login_view, name='login'),
    path('register/', views.UserViewSet.as_view({'post': 'register'}), name='register'),
    path('password-reset/request/', views.password_reset_request, name='password-reset-request'),
    path('password-reset/verify/', views.password_reset_verify, name='password-reset-verify'),
    path('password-reset/confirm/', views.password_reset_confirm, name='password-reset-confirm'),
    
    # ✅ NOUVEAUX ENDPOINTS ADMIN
    path('admin/stats/', views.admin_stats_view, name='admin-stats'),
    path('admin/users/', views.admin_users_list, name='admin-users'),
    path('admin/users/<int:user_id>/block/', views.admin_block_user, name='block-user'),
    path('admin/users/<int:user_id>/unblock/', views.admin_unblock_user, name='unblock-user'),
    path('admin/users/<int:user_id>/delete/', views.admin_delete_user, name='delete-user'),
]
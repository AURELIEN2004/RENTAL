

# ============================================
# 📁 apps/users/urls.py
# ============================================


# apps/users/urls.py
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
#     path('admin/stats/', views.AdminStatsView.as_view(), name='admin-stats'),
#     path('admin/users/', views.AdminUsersView.as_view(), name='admin-users'),
#     path('admin/users/<int:user_id>/block/', views.block_user, name='block-user'),
#     path('admin/users/<int:user_id>/unblock/', views.unblock_user, name='unblock-user'),
#     path('admin/users/<int:user_id>/delete/', views.delete_user_admin, name='delete-user'),

 ]
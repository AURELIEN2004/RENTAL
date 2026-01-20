
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
    
    # Statistiques Admin
    path('admin/stats/', views.admin_stats_view, name='admin-stats'),
    path('admin/stats/detailed/', views.admin_stats_detailed, name='admin-stats-detailed'),
    
    # Gestion Utilisateurs
    path('admin/users/', views.admin_users_list, name='admin-users'),
    path('admin/users/enhanced/', views.admin_users_list_enhanced, name='admin-users-enhanced'),
    path('admin/users/<int:user_id>/', views.admin_user_detail, name='admin-user-detail'),
    path('admin/users/<int:user_id>/block/', views.admin_block_user, name='block-user'),
    path('admin/users/<int:user_id>/unblock/', views.admin_unblock_user, name='unblock-user'),
    path('admin/users/<int:user_id>/delete/', views.admin_delete_user, name='delete-user'),
    path('admin/proprietaires/', views.admin_proprietaires_list, name='admin_proprietaires_list'),

    # Gestion Logements
    path('admin/housings/', views.admin_housings_list, name='admin-housings'),
    path('admin/housings/<int:housing_id>/toggle-visibility/', views.admin_toggle_housing_visibility, name='admin-toggle-housing'),
    path('admin/housings/<int:housing_id>/delete/', views.admin_delete_housing, name='admin-delete-housing'),
    
    # Support
    path('admin/support/messages/', views.admin_support_messages, name='admin-support'),

    # ✅ CORRECTION : Route pour créer conversation support
    path('create-support-conversation/', 
         views.create_support_conversation, 
         name='create_support_conversation'),
]
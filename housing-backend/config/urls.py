# ============================================
# 📁 config/urls.py - VERSION CORRIGÉE
# ============================================

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.conf.urls.i18n import i18n_patterns
from django.utils.translation import gettext_lazy as _

urlpatterns = [
    # ==================== ADMIN ====================
    path('admin/', admin.site.urls),
    
    # ==================== API ====================
    # Authentification JWT
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Users (login, register, profile)
    path('api/', include('apps.users.urls')),
    
    # Location (regions, cities, districts)
    path('api/', include('apps.location.urls')),
    
    # Housing (logements, catégories, types)
    path('api/', include('apps.housing.urls')),
    
    # Messaging (conversations, messages)
    path('api/', include('apps.messaging.urls')),
    
    # Visits (visites)
    path('api/', include('apps.visits.urls')),
    
    # ✅ CORRECTION: Ajouter le préfixe 'recherche' pour correspondre au frontend
    path('api/recherche/', include('apps.recherche.urls')),  # ← MODIFIÉ ICI
    
    # Notifications
    path('api/', include('apps.notifications.urls')),
    
    # ==================== DRF AUTH (Browsable API) ====================
    path('api-auth/', include('rest_framework.urls')),

    path('i18n/', include('django.conf.urls.i18n')),  # ← endpoint set_language

]


# Les URLs API restent sans préfixe de langue
# urlpatterns += [
#     path('api/', include('apps.housing.urls')),
#     path('api/users/', include('apps.users.urls')),
#     ...
# ]

# ==================== MEDIA & STATIC FILES ====================
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)


# ==================== PERSONNALISATION ADMIN ====================
admin.site.site_header = "Administration Housing Platform"
admin.site.site_title = "Housing Admin"
admin.site.index_title = "Bienvenue dans l'administration"
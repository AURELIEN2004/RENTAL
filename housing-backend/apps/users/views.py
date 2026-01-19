# # ============================================
# # 📁 apps/users/views.py
# # ===========================================

from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, get_user_model
from django.db.models import Count, Sum, Avg, Q
from django.utils import timezone
from datetime import timedelta
from django.core.mail import send_mail
from django.conf import settings

from .serializers import (
    UserSerializer, 
    UserRegistrationSerializer,
    UserUpdateSerializer,
    ChangePasswordSerializer,
    DeleteAccountSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
    PasswordResetVerifySerializer
)
from .models import PasswordResetToken

User = get_user_model()


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_permissions(self):
        if self.action in ['create', 'register']:
            return [AllowAny()]
        elif self.action == 'admin_dashboard':
            return [IsAdminUser()]
        return super().get_permissions()
    
    def get_serializer_class(self):
        if self.action == 'update_profile':
            return UserUpdateSerializer
        elif self.action == 'change_password':
            return ChangePasswordSerializer
        elif self.action == 'delete_account':
            return DeleteAccountSerializer
        return super().get_serializer_class()
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """Récupère le profil de l'utilisateur connecté"""
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)
    
    @action(detail=False, methods=['put', 'patch'])
    def update_profile(self, request):
        """Mettre à jour le profil utilisateur"""
        serializer = UserUpdateSerializer(
            request.user, 
            data=request.data, 
            partial=True,
            context={'request': request}
        )
        
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'Profil mis à jour avec succès',
                'user': UserSerializer(request.user).data
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def change_password(self, request):
        """Changer le mot de passe"""
        serializer = ChangePasswordSerializer(
            data=request.data,
            context={'request': request}
        )
        
        if serializer.is_valid():
            serializer.save()
            refresh = RefreshToken.for_user(request.user)
            
            return Response({
                'message': 'Mot de passe modifié avec succès',
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def delete_account(self, request):
        """Supprimer définitivement le compte utilisateur"""
        serializer = DeleteAccountSerializer(
            data=request.data,
            context={'request': request}
        )
        
        if serializer.is_valid():
            user = request.user
            user_email = user.email
            user.delete()
            
            return Response({
                'message': f'Le compte {user_email} a été supprimé définitivement'
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def register(self, request):
        """Inscription d'un nouvel utilisateur"""
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'user': UserSerializer(user).data,
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAdminUser])
    def admin_dashboard(self, request):
        """Dashboard statistiques pour les administrateurs"""
        from apps.housing.models import Housing, Comment, Favorite, SavedHousing
        from apps.messaging.models import Conversation, Message
        from apps.visits.models import Visit
        from apps.notifications.models import Notification
        
        # Période d'analyse
        thirty_days_ago = timezone.now() - timedelta(days=30)
        seven_days_ago = timezone.now() - timedelta(days=7)
        
        # ==================== UTILISATEURS ====================
        total_users = User.objects.count()
        locataires_count = User.objects.filter(is_locataire=True).count()
        proprietaires_count = User.objects.filter(is_proprietaire=True).count()
        blocked_users = User.objects.filter(is_blocked=True).count()
        
        new_users_30d = User.objects.filter(date_joined__gte=thirty_days_ago).count()
        new_users_7d = User.objects.filter(date_joined__gte=seven_days_ago).count()
        
        # ==================== LOGEMENTS ====================
        total_housings = Housing.objects.count()
        available_housings = Housing.objects.filter(status='disponible').count()
        reserved_housings = Housing.objects.filter(status='reserve').count()
        occupied_housings = Housing.objects.filter(status='occupe').count()
        
        new_housings_30d = Housing.objects.filter(created_at__gte=thirty_days_ago).count()
        new_housings_7d = Housing.objects.filter(created_at__gte=seven_days_ago).count()
        
        # Logements par catégorie
        housings_by_category = Housing.objects.values(
            'category__name'
        ).annotate(count=Count('id')).order_by('-count')
        
        # ==================== INTERACTIONS ====================
        total_views = Housing.objects.aggregate(Sum('views_count'))['views_count__sum'] or 0
        total_likes = Housing.objects.aggregate(Sum('likes_count'))['likes_count__sum'] or 0
        total_favorites = Favorite.objects.count()
        total_saved = SavedHousing.objects.count()
        total_comments = Comment.objects.count()
        
        # ==================== MESSAGERIE ====================
        total_conversations = Conversation.objects.count()
        total_messages = Message.objects.count()
        unread_messages = Message.objects.filter(is_read=False).count()
        
        new_conversations_30d = Conversation.objects.filter(created_at__gte=thirty_days_ago).count()
        new_messages_30d = Message.objects.filter(created_at__gte=thirty_days_ago).count()
        
        # ==================== VISITES ====================
        total_visits = Visit.objects.count()
        pending_visits = Visit.objects.filter(status='attente').count()
        confirmed_visits = Visit.objects.filter(status='confirme').count()
        refused_visits = Visit.objects.filter(status='refuse').count()
        
        new_visits_30d = Visit.objects.filter(created_at__gte=thirty_days_ago).count()
        
        # ==================== NOTIFICATIONS ====================
        total_notifications = Notification.objects.count()
        unread_notifications = Notification.objects.filter(is_read=False).count()
        
        # ==================== PRIX MOYEN ====================
        avg_price = Housing.objects.aggregate(Avg('price'))['price__avg'] or 0
        
        # ==================== TOP LOGEMENTS ====================
        from apps.housing.serializers import HousingListSerializer
        top_housings = Housing.objects.order_by('-views_count')[:5]
        top_housings_data = HousingListSerializer(
            top_housings,
            many=True,
            context={'request': request}
        ).data
        
        # ==================== TOP PROPRIÉTAIRES ====================
        top_owners = User.objects.filter(
            is_proprietaire=True
        ).annotate(
            housings_count=Count('housings')
        ).order_by('-housings_count')[:5]
        
        top_owners_data = [{
            'id': owner.id,
            'username': owner.username,
            'email': owner.email,
            'housings_count': owner.housings_count,
        } for owner in top_owners]
        
        # ==================== ACTIVITÉ RÉCENTE ====================
        recent_users = User.objects.order_by('-date_joined')[:5]
        recent_users_data = UserSerializer(recent_users, many=True).data
        
        recent_housings = Housing.objects.order_by('-created_at')[:5]
        recent_housings_data = HousingListSerializer(
            recent_housings,
            many=True,
            context={'request': request}
        ).data
        
        return Response({
            # Utilisateurs
            'users': {
                'total': total_users,
                'locataires': locataires_count,
                'proprietaires': proprietaires_count,
                'blocked': blocked_users,
                'new_30d': new_users_30d,
                'new_7d': new_users_7d,
                'recent': recent_users_data,
            },
            
            # Logements
            'housings': {
                'total': total_housings,
                'available': available_housings,
                'reserved': reserved_housings,
                'occupied': occupied_housings,
                'new_30d': new_housings_30d,
                'new_7d': new_housings_7d,
                'average_price': round(avg_price, 2),
                'by_category': list(housings_by_category),
                'top': top_housings_data,
                'recent': recent_housings_data,
            },
            
            # Interactions
            'interactions': {
                'total_views': total_views,
                'total_likes': total_likes,
                'total_favorites': total_favorites,
                'total_saved': total_saved,
                'total_comments': total_comments,
            },
            
            # Messagerie
            'messaging': {
                'total_conversations': total_conversations,
                'total_messages': total_messages,
                'unread_messages': unread_messages,
                'new_conversations_30d': new_conversations_30d,
                'new_messages_30d': new_messages_30d,
            },
            
            # Visites
            'visits': {
                'total': total_visits,
                'pending': pending_visits,
                'confirmed': confirmed_visits,
                'refused': refused_visits,
                'new_30d': new_visits_30d,
            },
            
            # Notifications
            'notifications': {
                'total': total_notifications,
                'unread': unread_notifications,
            },
            
            # Top propriétaires
            'top_owners': top_owners_data,
        })


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """Connexion utilisateur"""
    username = request.data.get('username')
    password = request.data.get('password')
    
    user = authenticate(username=username, password=password)
    
    if user:
        if user.is_blocked:
            return Response({
                'error': 'Votre compte est bloqué'
            }, status=status.HTTP_403_FORBIDDEN)
        
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        })
    
    return Response({
        'error': 'Identifiants invalides'
    }, status=status.HTTP_401_UNAUTHORIZED)


# ==================== RÉINITIALISATION MOT DE PASSE ====================

@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_request(request):
    """Demander la réinitialisation du mot de passe"""
    serializer = PasswordResetRequestSerializer(data=request.data)
    
    if serializer.is_valid():
        email = serializer.validated_data['email']
        user = User.objects.get(email=email)
        
        # Invalider les anciens tokens
        PasswordResetToken.objects.filter(user=user, used=False).update(used=True)
        
        # Créer nouveau token
        reset_token = PasswordResetToken.objects.create(user=user)
        
        # URL de réinitialisation
        reset_url = f"{settings.FRONTEND_URL}/reset-password/{reset_token.token}"
        
        # Email HTML
        html_message = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }}
                .content {{ background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }}
                .button {{ display: inline-block; background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }}
                .warning {{ background: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Réinitialisation de mot de passe</h1>
                </div>
                <div class="content">
                    <p>Bonjour <strong>{user.first_name or user.username}</strong>,</p>
                    <p>Cliquez sur le bouton ci-dessous pour réinitialiser votre mot de passe :</p>
                    <div style="text-align: center;">
                        <a href="{reset_url}" class="button">Réinitialiser mon mot de passe</a>
                    </div>
                    <p>Lien : {reset_url}</p>
                    <div class="warning">
                        <strong>⚠️ Important :</strong>
                        <ul>
                            <li>Ce lien est valide pendant <strong>1 heure</strong></li>
                            <li>Ne partagez jamais ce lien</li>
                        </ul>
                    </div>
                </div>
            </div>
        </body>
        </html>
        """
        
        try:
            send_mail(
                subject='Réinitialisation de votre mot de passe',
                message=f'Réinitialisez votre mot de passe : {reset_url}',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
                html_message=html_message,
                fail_silently=False,
            )
            
            return Response({
                'message': 'Email de réinitialisation envoyé',
                'email': email
            })
        except Exception as e:
            return Response({
                'error': 'Erreur lors de l\'envoi de l\'email'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_verify(request):
    """Vérifier la validité d'un token"""
    serializer = PasswordResetVerifySerializer(data=request.data)
    
    if serializer.is_valid():
        token_value = serializer.validated_data['token']
        
        try:
            reset_token = PasswordResetToken.objects.get(token=token_value)
            
            if reset_token.is_valid():
                return Response({
                    'valid': True,
                    'message': 'Token valide',
                    'email': reset_token.user.email
                })
            else:
                return Response({
                    'valid': False,
                    'message': 'Ce lien a expiré ou a déjà été utilisé'
                }, status=status.HTTP_400_BAD_REQUEST)
        except PasswordResetToken.DoesNotExist:
            return Response({
                'valid': False,
                'message': 'Lien invalide'
            }, status=status.HTTP_404_NOT_FOUND)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_confirm(request):
    """Confirmer la réinitialisation"""
    serializer = PasswordResetConfirmSerializer(data=request.data)
    
    if serializer.is_valid():
        token_value = serializer.validated_data['token']
        new_password = serializer.validated_data['new_password']
        
        try:
            reset_token = PasswordResetToken.objects.get(token=token_value)
            
            if not reset_token.is_valid():
                return Response({
                    'error': 'Ce lien a expiré'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Changer le mot de passe
            user = reset_token.user
            user.set_password(new_password)
            user.save()
            
            # Marquer token comme utilisé
            reset_token.mark_as_used()
            PasswordResetToken.objects.filter(user=user, used=False).update(used=True)
            
            return Response({
                'message': 'Mot de passe réinitialisé avec succès',
                'email': user.email
            })
        except PasswordResetToken.DoesNotExist:
            return Response({
                'error': 'Lien invalide'
            }, status=status.HTTP_404_NOT_FOUND)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# apps/users/views.py - AJOUTER CES MÉTHODES

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from datetime import timedelta

# ========================================
# 🆕 ADMIN: STATISTIQUES GLOBALES
# ========================================

@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_stats_view(request):
    """Dashboard admin - Statistiques complètes"""
    from apps.housing.models import Housing, Comment
    from apps.messaging.models import Conversation, Message
    from apps.visits.models import Visit
    from apps.notifications.models import Notification
    
    # Période d'analyse
    thirty_days_ago = timezone.now() - timedelta(days=30)
    seven_days_ago = timezone.now() - timedelta(days=7)
    
    # Utilisateurs
    total_users = User.objects.count()
    locataires_count = User.objects.filter(is_locataire=True).count()
    proprietaires_count = User.objects.filter(is_proprietaire=True).count()
    blocked_users = User.objects.filter(is_blocked=True).count()
    new_users_30d = User.objects.filter(date_joined__gte=thirty_days_ago).count()
    new_users_7d = User.objects.filter(date_joined__gte=seven_days_ago).count()
    
    # Logements
    total_housings = Housing.objects.count()
    available_housings = Housing.objects.filter(status='disponible').count()
    reserved_housings = Housing.objects.filter(status='reserve').count()
    occupied_housings = Housing.objects.filter(status='occupe').count()
    new_housings_30d = Housing.objects.filter(created_at__gte=thirty_days_ago).count()
    
    # Activité
    total_messages = Message.objects.count()
    total_visits = Visit.objects.count()
    pending_visits = Visit.objects.filter(status='attente').count()
    
    return Response({
        'users': {
            'total': total_users,
            'locataires': locataires_count,
            'proprietaires': proprietaires_count,
            'blocked': blocked_users,
            'new_30d': new_users_30d,
            'new_7d': new_users_7d,
        },
        'housings': {
            'total': total_housings,
            'available': available_housings,
            'reserved': reserved_housings,
            'occupied': occupied_housings,
            'new_30d': new_housings_30d,
        },
        'activity': {
            'total_messages': total_messages,
            'total_visits': total_visits,
            'pending_visits': pending_visits,
        }
    })





# ========================================
# 🆕 ADMIN: STATISTIQUES GLOBALES DÉTAILLÉES
# ========================================

@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_stats_detailed(request):
    """Statistiques détaillées pour le dashboard admin"""
    from apps.housing.models import Housing, Comment
    from apps.messaging.models import Conversation, Message
    from apps.visits.models import Visit
    from apps.notifications.models import Notification
    
    # Périodes d'analyse
    thirty_days_ago = timezone.now() - timedelta(days=30)
    seven_days_ago = timezone.now() - timedelta(days=7)
    today = timezone.now().date()
    
    # ==================== UTILISATEURS ====================
    total_users = User.objects.count()
    locataires = User.objects.filter(is_locataire=True).count()
    proprietaires = User.objects.filter(is_proprietaire=True).count()
    blocked = User.objects.filter(is_blocked=True).count()
    active_today = User.objects.filter(last_login__date=today).count()
    
    new_users_30d = User.objects.filter(date_joined__gte=thirty_days_ago).count()
    new_users_7d = User.objects.filter(date_joined__gte=seven_days_ago).count()
    
    # Top propriétaires
    top_owners = User.objects.filter(is_proprietaire=True).annotate(
        housings_count=Count('housings')
    ).order_by('-housings_count')[:5]
    
    top_owners_data = [{
        'id': owner.id,
        'username': owner.username,
        'email': owner.email,
        'housings_count': owner.housings_count,
        'photo': owner.photo.url if owner.photo else None
    } for owner in top_owners]
    
    # ==================== LOGEMENTS ====================
    total_housings = Housing.objects.count()
    visible_housings = Housing.objects.filter(is_visible=True).count()
    hidden_housings = Housing.objects.filter(is_visible=False).count()
    
    disponible = Housing.objects.filter(status='disponible').count()
    reserve = Housing.objects.filter(status='reserve').count()
    occupe = Housing.objects.filter(status='occupe').count()
    
    new_housings_30d = Housing.objects.filter(created_at__gte=thirty_days_ago).count()
    new_housings_7d = Housing.objects.filter(created_at__gte=seven_days_ago).count()
    
    # Par catégorie
    by_category = Housing.objects.values('category__name').annotate(
        count=Count('id')
    ).order_by('-count')
    
    # ==================== ACTIVITÉ ====================
    total_views = Housing.objects.aggregate(
        total=Count('views_count')
    )['total'] or 0
    
    total_likes = Housing.objects.aggregate(
        total=Count('likes_count')
    )['total'] or 0
    
    total_messages = Message.objects.count()
    messages_30d = Message.objects.filter(created_at__gte=thirty_days_ago).count()
    
    total_visits = Visit.objects.count()
    pending_visits = Visit.objects.filter(status='attente').count()
    confirmed_visits = Visit.objects.filter(status='confirme').count()
    
    # ==================== RESPONSE ====================
    return Response({
        'users': {
            'total': total_users,
            'locataires': locataires,
            'proprietaires': proprietaires,
            'blocked': blocked,
            'active_today': active_today,
            'new_30d': new_users_30d,
            'new_7d': new_users_7d,
            'top_owners': top_owners_data
        },
        'housings': {
            'total': total_housings,
            'visible': visible_housings,
            'hidden': hidden_housings,
            'disponible': disponible,
            'reserve': reserve,
            'occupe': occupe,
            'new_30d': new_housings_30d,
            'new_7d': new_housings_7d,
            'by_category': list(by_category)
        },
        'activity': {
            'total_views': total_views,
            'total_likes': total_likes,
            'total_messages': total_messages,
            'messages_30d': messages_30d,
            'total_visits': total_visits,
            'pending_visits': pending_visits,
            'confirmed_visits': confirmed_visits
        }
    })

# ========================================
# 🆕 ADMIN: LISTE UTILISATEURS
# ========================================

@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_users_list(request):
    """Liste tous les utilisateurs pour l'admin"""
    from .serializers import UserSerializer
    
    users = User.objects.all().order_by('-date_joined')
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)




# ========================================
# 🆕 ADMIN: GESTION UTILISATEURS AMÉLIORÉE
# ========================================

@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_users_list_enhanced(request):
    """Liste améliorée des utilisateurs avec nombre de logements"""
    from apps.housing.models import Housing
    
    users = User.objects.all().annotate(
        housings_count=Count('housings')
    ).order_by('-date_joined')
    
    users_data = []
    for user in users:
        user_data = UserSerializer(user).data
        user_data['housings_count'] = user.housings_count
        # 🔧 FIX: Ajouter l'URL complète de la photo
        if user.photo:
            user_data['photo'] = request.build_absolute_uri(user.photo.url)
        users_data.append(user_data)
    
    return Response(users_data)

# ========================================
# 🆕 ADMIN: BLOQUER/DÉBLOQUER UTILISATEUR
# ========================================

@api_view(['POST'])
@permission_classes([IsAdminUser])
def admin_block_user(request, user_id):
    """Bloquer un utilisateur"""
    try:
        user = User.objects.get(id=user_id)
        duration = request.data.get('duration')  # '7', '30', 'permanent'
        
        user.is_blocked = True
        
        if duration and duration != 'permanent':
            user.blocked_until = timezone.now() + timedelta(days=int(duration))
        else:
            user.blocked_until = None  # Permanent
        
        user.save()
        
        return Response({
            'message': 'Utilisateur bloqué avec succès',
            'blocked_until': user.blocked_until
        })
    except User.DoesNotExist:
        return Response(
            {'error': 'Utilisateur introuvable'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['POST'])
@permission_classes([IsAdminUser])
def admin_unblock_user(request, user_id):
    """Débloquer un utilisateur"""
    try:
        user = User.objects.get(id=user_id)
        user.is_blocked = False
        user.blocked_until = None
        user.save()
        
        return Response({'message': 'Utilisateur débloqué'})
    except User.DoesNotExist:
        return Response(
            {'error': 'Utilisateur introuvable'},
            status=status.HTTP_404_NOT_FOUND
        )


# ========================================
# 🆕 ADMIN: SUPPRIMER UTILISATEUR
# ========================================

@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def admin_delete_user(request, user_id):
    """Supprimer un utilisateur (⚠️ cascade)"""
    try:
        user = User.objects.get(id=user_id)
        username = user.username
        user.delete()
        
        return Response({
            'message': f'Utilisateur {username} supprimé définitivement'
        })
    except User.DoesNotExist:
        return Response(
            {'error': 'Utilisateur introuvable'},
            status=status.HTTP_404_NOT_FOUND
        )





@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_user_detail(request, user_id):
    """Détails d'un utilisateur avec ses logements"""
    try:
        from apps.housing.models import Housing
        from apps.housing.serializers import HousingListSerializer
        
        user = User.objects.get(id=user_id)
        user_data = UserSerializer(user).data
        
        # 🔧 FIX: Photo complète
        if user.photo:
            user_data['photo'] = request.build_absolute_uri(user.photo.url)
        
        # Récupérer les logements de l'utilisateur
        housings = Housing.objects.filter(owner=user).select_related(
            'category', 'housing_type', 'city', 'district'
        ).prefetch_related('images')
        
        user_data['housings'] = HousingListSerializer(
            housings, 
            many=True,
            context={'request': request}
        ).data
        user_data['housings_count'] = housings.count()
        
        return Response(user_data)
    except User.DoesNotExist:
        return Response(
            {'error': 'Utilisateur introuvable'},
            status=status.HTTP_404_NOT_FOUND
        )



# ========================================
# 🆕 ADMIN: GESTION LOGEMENTS
# ========================================

@api_view(['GET'])
@permission_classes([IsAdminUser])

def admin_housings_list(request):
    """Liste des logements avec filtrage par utilisateur"""
    from apps.housing.models import Housing
    from apps.housing.serializers import HousingListSerializer
    
    # Filtrage par utilisateur si spécifié
    owner_id = request.query_params.get('owner')
    visibility = request.query_params.get('visibility')  # 'visible', 'hidden', 'all'
    
    housings = Housing.objects.select_related(
        'owner', 'category', 'housing_type', 'city', 'district'
    ).prefetch_related('images')
    
    if owner_id:
        housings = housings.filter(owner_id=owner_id)
    
    if visibility == 'visible':
        housings = housings.filter(is_visible=True)
    elif visibility == 'hidden':
        housings = housings.filter(is_visible=False)
    # 'all' = pas de filtre
    
    housings = housings.order_by('-created_at')
    
    serializer = HousingListSerializer(
        housings, 
        many=True,
        context={'request': request}
    )
    
    return Response({
        'count': housings.count(),
        'results': serializer.data
    })



# 🆕 NOUVEAU: Liste des propriétaires uniquement pour le filtre
@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_proprietaires_list(request):
    """Liste des propriétaires uniquement (pour le filtre)"""
    proprietaires = User.objects.filter(
        is_proprietaire=True
    ).annotate(
        housings_count=Count('housings')
    ).order_by('username')
    
    data = [{
        'id': p.id,
        'username': p.username,
        'email': p.email,
        'housings_count': p.housings_count,
        'photo': request.build_absolute_uri(p.photo.url) if p.photo else None
    } for p in proprietaires]
    
    return Response(data)

@api_view(['POST'])
@permission_classes([IsAdminUser])
def admin_toggle_housing_visibility(request, housing_id):
    """Activer/désactiver la visibilité d'un logement"""
    try:
        from apps.housing.models import Housing
        from apps.notifications.models import Notification
        
        housing = Housing.objects.get(id=housing_id)
        housing.is_visible = not housing.is_visible
        housing.save()
        
        # Notifier le propriétaire
        action = "activé" if housing.is_visible else "désactivé"
        Notification.objects.create(
            user=housing.owner,
            type='admin',
            title='Modification de visibilité',
            message=f'Votre logement "{housing.title}" a été {action} par l\'administrateur',
            link=f'/dashboard/housings'
        )
        
        return Response({
            'message': f'Visibilité {action}e avec succès',
            'is_visible': housing.is_visible
        })
    except Housing.DoesNotExist:
        return Response(
            {'error': 'Logement introuvable'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def admin_delete_housing(request, housing_id):
    """Supprimer un logement (admin only)"""
    try:
        from apps.housing.models import Housing
        from apps.notifications.models import Notification
        
        housing = Housing.objects.get(id=housing_id)
        owner = housing.owner
        title = housing.title
        
        housing.delete()
        
        # Notifier le propriétaire
        Notification.objects.create(
            user=owner,
            type='admin',
            title='Logement supprimé',
            message=f'Votre logement "{title}" a été supprimé par l\'administrateur',
            link=f'/dashboard/housings'
        )
        
        return Response({
            'message': 'Logement supprimé avec succès'
        })
    except Housing.DoesNotExist:
        return Response(
            {'error': 'Logement introuvable'},
            status=status.HTTP_404_NOT_FOUND
        )




# ========================================
# 🆕 ADMIN: SUPPORT CHAT - CRÉER CONVERSATION
# ========================================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_support_conversation(request):
    """Créer une conversation avec le support (admin)"""
    from apps.messaging.models import Conversation, Message
    
    try:
        # Récupérer tous les admins
        admins = User.objects.filter(is_staff=True, is_superuser=True)
        
        if not admins.exists():
            return Response(
                {'error': 'Aucun administrateur disponible'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Prendre le premier admin disponible
        admin = admins.first()
        
        # Vérifier si une conversation existe déjà entre l'utilisateur et cet admin
        existing_conversation = Conversation.objects.filter(
            participants=request.user
        ).filter(
            participants=admin
        ).first()
        
        if existing_conversation:
            return Response({
                'conversation_id': existing_conversation.id,
                'admin': {
                    'id': admin.id,
                    'username': admin.username,
                    'photo': request.build_absolute_uri(admin.photo.url) if admin.photo else None
                }
            })
        
        # Créer une nouvelle conversation
        conversation = Conversation.objects.create()
        conversation.participants.add(request.user, admin)
        
        # Message initial automatique
        Message.objects.create(
            conversation=conversation,
            sender=admin,
            content=f"Bonjour {request.user.username}! Je suis l'équipe support. Comment puis-je vous aider?"
        )
        
        return Response({
            'conversation_id': conversation.id,
            'admin': {
                'id': admin.id,
                'username': admin.username,
                'photo': request.build_absolute_uri(admin.photo.url) if admin.photo else None
            }
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_support_messages(request):
    """Messages support pour admin"""
    from apps.messaging.models import Conversation
    
    conversations = Conversation.objects.filter(
        participants=request.user
    ).order_by('-updated_at')
    
    from apps.messaging.serializers import ConversationSerializer
    serializer = ConversationSerializer(
        conversations, 
        many=True,
        context={'request': request}
    )
    
    return Response(serializer.data)









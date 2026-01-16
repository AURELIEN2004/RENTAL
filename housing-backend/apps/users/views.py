# ============================================
# 📁 apps/users/views.py
# ============================================

# apps/users/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, get_user_model
from .serializers import (
    UserSerializer, 
    UserRegistrationSerializer,
    UserUpdateSerializer,
    ChangePasswordSerializer,
    DeleteAccountSerializer
)

User = get_user_model()


# ============================================
# 🔧 BACKEND - apps/users/views.py - AJOUTER CES ENDPOINTS ✅
# ============================================

from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from apps.housing.models import Housing

User = get_user_model()


# ✅ NOUVEAU : Endpoint pour les statistiques admin
class AdminStatsView(APIView):
    """Statistiques globales pour l'admin"""
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        """Retourner les stats globales"""
        
        # Vérifier que l'utilisateur est superuser
        if not request.user.is_superuser:
            return Response(
                {'error': 'Accès refusé. Vous devez être administrateur.'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Calculer les statistiques
        total_users = User.objects.count()
        locataires_count = User.objects.filter(is_locataire=True).count()
        proprietaires_count = User.objects.filter(is_proprietaire=True).count()
        
        total_housings = Housing.objects.count()
        available_housings = Housing.objects.filter(status='disponible').count()
        reserved_housings = Housing.objects.filter(status='reserve').count()
        occupied_housings = Housing.objects.filter(status='occupe').count()
        
        # Statistiques mensuelles (exemple simplifié)
        from django.utils import timezone
        from datetime import timedelta
        
        last_month = timezone.now() - timedelta(days=30)
        new_users_this_month = User.objects.filter(date_joined__gte=last_month).count()
        new_housings_this_month = Housing.objects.filter(created_at__gte=last_month).count()
        
        # Calculer le nombre total de messages (si vous avez le modèle)
        from apps.messaging.models import Message
        total_messages = Message.objects.count()
        
        return Response({
            'total_users': total_users,
            'locataires_count': locataires_count,
            'proprietaires_count': proprietaires_count,
            'total_housings': total_housings,
            'available_housings': available_housings,
            'reserved_housings': reserved_housings,
            'occupied_housings': occupied_housings,
            'new_users_this_month': new_users_this_month,
            'new_housings_this_month': new_housings_this_month,
            'total_messages': total_messages,
        })


# ✅ NOUVEAU : Endpoint pour gérer les utilisateurs (admin)
class AdminUsersView(APIView):
    """Gestion des utilisateurs par l'admin"""
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        """Liste de tous les utilisateurs"""
        if not request.user.is_superuser:
            return Response(
                {'error': 'Accès refusé'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        from apps.users.serializers import UserSerializer
        users = User.objects.all().order_by('-date_joined')
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)


# ✅ NOUVEAU : Bloquer/Débloquer un utilisateur
@api_view(['POST'])
@permission_classes([IsAdminUser])
def block_user(request, user_id):
    """Bloquer un utilisateur"""
    if not request.user.is_superuser:
        return Response({'error': 'Accès refusé'}, status=403)
    
    try:
        user = User.objects.get(id=user_id)
        duration = request.data.get('duration')  # 7, 30, ou 'permanent'
        
        user.is_blocked = True
        
        if duration and duration != 'permanent':
            from django.utils import timezone
            from datetime import timedelta
            user.blocked_until = timezone.now() + timedelta(days=int(duration))
        else:
            user.blocked_until = None  # Blocage permanent
        
        user.save()
        
        return Response({
            'message': f'Utilisateur {user.username} bloqué',
            'blocked_until': user.blocked_until
        })
    except User.DoesNotExist:
        return Response({'error': 'Utilisateur non trouvé'}, status=404)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def unblock_user(request, user_id):
    """Débloquer un utilisateur"""
    if not request.user.is_superuser:
        return Response({'error': 'Accès refusé'}, status=403)
    
    try:
        user = User.objects.get(id=user_id)
        user.is_blocked = False
        user.blocked_until = None
        user.save()
        
        return Response({'message': f'Utilisateur {user.username} débloqué'})
    except User.DoesNotExist:
        return Response({'error': 'Utilisateur non trouvé'}, status=404)


@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def delete_user_admin(request, user_id):
    """Supprimer un utilisateur (admin)"""
    if not request.user.is_superuser:
        return Response({'error': 'Accès refusé'}, status=403)
    
    try:
        user = User.objects.get(id=user_id)
        username = user.username
        user.delete()
        
        return Response({'message': f'Utilisateur {username} supprimé'})
    except User.DoesNotExist:
        return Response({'error': 'Utilisateur non trouvé'}, status=404)


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_permissions(self):
        if self.action in ['create', 'register']:
            return [AllowAny()]
        return super().get_permissions()
    
    def get_serializer_class(self):
        """Retourner le sérialiseur approprié selon l'action"""
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
            
            # Régénérer les tokens après changement de mot de passe
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
            
            # Supprimer l'utilisateur (cascade sur les logements)
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



# apps/users/views.py (ajoutez ces fonctions)

from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from .models import PasswordResetToken
from .serializers import (
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
    PasswordResetVerifySerializer
)


@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_request(request):
    """Demander la réinitialisation du mot de passe"""
    serializer = PasswordResetRequestSerializer(data=request.data)
    
    if serializer.is_valid():
        email = serializer.validated_data['email']
        user = User.objects.get(email=email)
        
        # Invalider les anciens tokens non utilisés
        PasswordResetToken.objects.filter(
            user=user, 
            used=False
        ).update(used=True)
        
        # Créer un nouveau token
        reset_token = PasswordResetToken.objects.create(user=user)
        
        # Construire l'URL de réinitialisation
        reset_url = f"{settings.FRONTEND_URL}/reset-password/{reset_token.token}"
        
        # Préparer le contenu de l'email
        context = {
            'user': user,
            'reset_url': reset_url,
            'expires_minutes': 60,
        }
        
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
                .footer {{ text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }}
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
                    
                    <p>Vous avez demandé à réinitialiser votre mot de passe sur Housing Platform.</p>
                    
                    <p>Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe :</p>
                    
                    <div style="text-align: center;">
                        <a href="{reset_url}" class="button">Réinitialiser mon mot de passe</a>
                    </div>
                    
                    <p>Ou copiez ce lien dans votre navigateur :</p>
                    <p style="background: white; padding: 10px; word-break: break-all; border-radius: 4px;">
                        {reset_url}
                    </p>
                    
                    <div class="warning">
                        <strong>⚠️ Important :</strong>
                        <ul>
                            <li>Ce lien est valide pendant <strong>1 heure</strong></li>
                            <li>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email</li>
                            <li>Ne partagez jamais ce lien avec personne</li>
                        </ul>
                    </div>
                    
                    <p>Besoin d'aide ? Contactez-nous :</p>
                    <ul>
                        <li>📧 Email : feudjioaurelien24@gmail.com</li>
                        <li>📱 Téléphone : +237 659887452</li>
                    </ul>
                </div>
                <div class="footer">
                    <p>Housing Platform - Yaoundé, Cameroun</p>
                    <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        # Email texte simple (fallback)
        text_message = f"""
        Bonjour {user.first_name or user.username},
        
        Vous avez demandé à réinitialiser votre mot de passe sur Housing Platform.
        
        Cliquez sur ce lien pour choisir un nouveau mot de passe :
        {reset_url}
        
        Ce lien est valide pendant 1 heure.
        
        Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
        
        Cordialement,
        L'équipe Housing Platform
        """
        
        # Envoyer l'email
        try:
            send_mail(
                subject='Réinitialisation de votre mot de passe - Housing Platform',
                message=text_message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
                html_message=html_message,
                fail_silently=False,
            )
            
            return Response({
                'message': 'Un email de réinitialisation a été envoyé à votre adresse',
                'email': email
            })
            
        except Exception as e:
            print(f"Erreur envoi email: {e}")
            return Response({
                'error': 'Erreur lors de l\'envoi de l\'email. Veuillez réessayer.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_verify(request):
    """Vérifier la validité d'un token de réinitialisation"""
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
                'message': 'Lien de réinitialisation invalide'
            }, status=status.HTTP_404_NOT_FOUND)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_confirm(request):
    """Confirmer la réinitialisation avec le nouveau mot de passe"""
    serializer = PasswordResetConfirmSerializer(data=request.data)
    
    if serializer.is_valid():
        token_value = serializer.validated_data['token']
        new_password = serializer.validated_data['new_password']
        
        try:
            reset_token = PasswordResetToken.objects.get(token=token_value)
            
            if not reset_token.is_valid():
                return Response({
                    'error': 'Ce lien a expiré ou a déjà été utilisé'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Changer le mot de passe
            user = reset_token.user
            user.set_password(new_password)
            user.save()
            
            # Marquer le token comme utilisé
            reset_token.mark_as_used()
            
            # Invalider tous les autres tokens de cet utilisateur
            PasswordResetToken.objects.filter(
                user=user, 
                used=False
            ).update(used=True)
            
            # Envoyer un email de confirmation
            try:
                confirmation_html = f"""
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                        .header {{ background: #10b981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }}
                        .content {{ background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }}
                        .success {{ background: #d1fae5; padding: 15px; border-left: 4px solid #10b981; margin: 20px 0; }}
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>✅ Mot de passe modifié</h1>
                        </div>
                        <div class="content">
                            <p>Bonjour <strong>{user.first_name or user.username}</strong>,</p>
                            
                            <div class="success">
                                Votre mot de passe a été modifié avec succès !
                            </div>
                            
                            <p>Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.</p>
                            
                            <p><strong>Si vous n'êtes pas à l'origine de cette modification</strong>, contactez-nous immédiatement :</p>
                            <ul>
                                <li>📧 feudjioaurelien24@gmail.com</li>
                                <li>📱 +237 659887452</li>
                            </ul>
                        </div>
                    </div>
                </body>
                </html>
                """
                
                send_mail(
                    subject='Confirmation de modification de mot de passe',
                    message=f'Bonjour, votre mot de passe a été modifié avec succès.',
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[user.email],
                    html_message=confirmation_html,
                    fail_silently=True,
                )
            except Exception as e:
                print(f"Erreur envoi email confirmation: {e}")
            
            return Response({
                'message': 'Mot de passe réinitialisé avec succès',
                'email': user.email
            })
            
        except PasswordResetToken.DoesNotExist:
            return Response({
                'error': 'Lien de réinitialisation invalide'
            }, status=status.HTTP_404_NOT_FOUND)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)





















# # ============================================
# # 📁 apps/users/serializers.py
# # ============================================


# apps/users/serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth import get_user_model

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """Sérialiseur pour le modèle User"""
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 
                  'phone', 'photo', 'is_locataire', 'is_proprietaire',
                  'preferred_max_price', 'preferred_location_lat', 
                  'preferred_location_lng', 'date_joined']
        read_only_fields = ['id', 'date_joined', 'username']  # username non modifiable


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Sérialiseur pour l'inscription"""
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password_confirm', 
                  'first_name', 'last_name', 'phone', 'is_locataire', 
                  'is_proprietaire']
    
    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({
                "password": "Les mots de passe ne correspondent pas"
            })
        
        if User.objects.filter(email=data['email']).exists():
            raise serializers.ValidationError({
                "email": "Cet email est déjà utilisé"
            })
        
        if User.objects.filter(username=data['username']).exists():
            raise serializers.ValidationError({
                "username": "Ce nom d'utilisateur est déjà pris"
            })
        
        return data
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        return user


class UserUpdateSerializer(serializers.ModelSerializer):
    """Sérialiseur pour la mise à jour du profil"""
    email = serializers.EmailField(required=False)
    photo = serializers.ImageField(required=False, allow_null=True)
    
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'email', 'phone', 'photo',
                  'preferred_max_price', 'preferred_location_lat', 
                  'preferred_location_lng']
    
    def validate_email(self, value):
        """Vérifier l'unicité de l'email (sauf pour l'utilisateur actuel)"""
        user = self.context['request'].user
        if User.objects.exclude(pk=user.pk).filter(email=value).exists():
            raise serializers.ValidationError("Cet email est déjà utilisé par un autre utilisateur")
        return value
    
    def update(self, instance, validated_data):
        # Gestion spéciale pour la photo
        if 'photo' in validated_data:
            if validated_data['photo'] is None:
                # Supprimer l'ancienne photo si elle existe
                if instance.photo:
                    instance.photo.delete(save=False)
                instance.photo = None
            else:
                # Remplacer la photo
                if instance.photo:
                    instance.photo.delete(save=False)
                instance.photo = validated_data['photo']
            validated_data.pop('photo', None)
        
        # Mettre à jour les autres champs
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        return instance


class ChangePasswordSerializer(serializers.Serializer):
    """Sérialiseur pour le changement de mot de passe"""
    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True, min_length=8)
    new_password_confirm = serializers.CharField(required=True, write_only=True)
    
    def validate_old_password(self, value):
        """Vérifier que l'ancien mot de passe est correct"""
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("L'ancien mot de passe est incorrect")
        return value
    
    def validate(self, data):
        """Vérifier que les nouveaux mots de passe correspondent"""
        if data['new_password'] != data['new_password_confirm']:
            raise serializers.ValidationError({
                "new_password": "Les nouveaux mots de passe ne correspondent pas"
            })
        
        # Valider la complexité du mot de passe
        try:
            validate_password(data['new_password'], self.context['request'].user)
        except Exception as e:
            raise serializers.ValidationError({
                "new_password": list(e.messages)
            })
        
        return data
    
    def save(self):
        """Sauvegarder le nouveau mot de passe"""
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user


class DeleteAccountSerializer(serializers.Serializer):
    """Sérialiseur pour la suppression de compte"""
    password = serializers.CharField(required=True, write_only=True)
    confirmation = serializers.CharField(required=True, write_only=True)
    
    def validate_password(self, value):
        """Vérifier le mot de passe"""
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Mot de passe incorrect")
        return value
    
    def validate_confirmation(self, value):
        """Vérifier la confirmation de suppression"""
        if value.upper() != "SUPPRIMER":
            raise serializers.ValidationError(
                'Vous devez taper "SUPPRIMER" pour confirmer'
            )
        return value
    


class PasswordResetRequestSerializer(serializers.Serializer):
    """Sérialiseur pour la demande de réinitialisation"""
    email = serializers.EmailField(required=True)
    
    def validate_email(self, value):
        """Vérifier que l'email existe"""
        if not User.objects.filter(email=value).exists():
            raise serializers.ValidationError(
                "Aucun compte n'est associé à cet email"
            )
        return value


class PasswordResetConfirmSerializer(serializers.Serializer):
    """Sérialiseur pour la confirmation de réinitialisation"""
    token = serializers.UUIDField(required=True)
    new_password = serializers.CharField(required=True, write_only=True, min_length=8)
    new_password_confirm = serializers.CharField(required=True, write_only=True)
    
    def validate(self, data):
        """Valider les mots de passe"""
        if data['new_password'] != data['new_password_confirm']:
            raise serializers.ValidationError({
                "new_password": "Les mots de passe ne correspondent pas"
            })
        
        # Valider la complexité du mot de passe
        try:
            validate_password(data['new_password'])
        except Exception as e:
            raise serializers.ValidationError({
                "new_password": list(e.messages)
            })
        
        return data


class PasswordResetVerifySerializer(serializers.Serializer):
    """Sérialiseur pour vérifier la validité du token"""
    token = serializers.UUIDField(required=True)







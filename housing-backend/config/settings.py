import os

from pathlib import Path

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.0/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-n+*s%o9udbitkylsd!%c4%i!i*x#p1p1wy66v3jcu_o-*d0q2#'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = []


# Application definition

INSTALLED_APPS = [
        'corsheaders',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # Third party
    'rest_framework',
    'rest_framework_simplejwt',
    # 'corsheaders',
    'django_filters',
    'modeltranslation',
    
    # Apps locales
    'apps.users',
    'apps.housing',
    'apps.location',
    'apps.messaging',
    'apps.visits',
    'apps.notifications',
    'apps.recherche',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Pour React et Flutter
    'django.middleware.common.CommonMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

AUTH_USER_MODEL = 'users.User'


ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'


# Database
# https://docs.djangoproject.com/en/5.0/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# Pour PostgreSQL en production:
# """
# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.postgresql',
#         'NAME': 'housing_db',
#         'USER': 'your_user',
#         'PASSWORD': 'your_password',
#         'HOST': 'localhost',
#         'PORT': '5432',
#     }
# }
# """


# Password validation
# https://docs.djangoproject.com/en/5.0/ref/settings/#auth-password-validators

# AUTH_PASSWORD_VALIDATORS = [
#     {
#         'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
#     },
#     {
#         'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
#     },
#     {
#         'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
#     },
#     {
#         'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
#     },
# ]


# Internationalization
# https://docs.djangoproject.com/en/5.0/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True

# Fichiers statiques et médias
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, 'static'),
]

# Internationalisation
LANGUAGE_CODE = 'fr-fr'
TIME_ZONE = 'Africa/Douala'
USE_I18N = True
USE_TZ = True

LANGUAGES = [
    ('fr', 'Français'),
    ('en', 'English'),
]

# Configuration email (pour notifications)
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
# EMAIL_HOST_USER = 'votre_email@gmail.com'
# EMAIL_HOST_PASSWORD = 'votre_mot_de_passe'
EMAIL_HOST_USER = 'feudjioaurelien24@gmail.com'  # Votre email
EMAIL_HOST_PASSWORD = '15012004Fa'  # Mot de passe d'application
DEFAULT_FROM_EMAIL = 'Housing Platform <feudjioaurelien24@gmail.com>'


FRONTEND_URL = 'http://localhost:5173'  # ou votre URL frontend

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.0/howto/static-files/

STATIC_URL = 'static/'

# Default primary key field type
# https://docs.djangoproject.com/en/5.0/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'



# REST Framework configuration
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.SessionAuthentication',
        'rest_framework.authentication.TokenAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
        # 'rest_framework.permissions.IsAuthenticated',  # Par défaut, auth requise

    ],
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
}

# JWT configuration
from datetime import timedelta

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': False,  # ✅ Désactiver si pas de blacklist
    'UPDATE_LAST_LOGIN': True,
}

# CORS (pour React et Flutter)
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",  # React dev
    "http://localhost:8000",
    "http://127.0.0.1:3000",
    # "http://localhost:5174",
    "http://localhost:5173",
    "http://127.0.0.1:5173",  # Vite dev
]

CORS_ALLOW_CREDENTIALS = True
CSRF_TRUSTED_ORIGINS = [
    "http://localhost:5173",
]
# Optionnel : si tu ajoutes des headers personnalisés
CORS_ALLOW_HEADERS = [
    "accept",
    "authorization",
    "content-type",
    "user-agent",
    "x-csrftoken",
    "x-requested-with",
]

DATA_UPLOAD_MAX_MEMORY_SIZE = 52428800  # 50MB
FILE_UPLOAD_MAX_MEMORY_SIZE = 52428800

# ============================================
# CONFIGURATION OPTIONNELLE POUR LA RECHERCHE
# ============================================

# Configuration Ollama (LLM local)
OLLAMA_API_URL = 'http://localhost:11434'
OLLAMA_MODEL = 'mistral'  # ou 'llama2', 'phi'

# Configuration reconnaissance vocale
SPEECH_RECOGNITION_ENGINE = 'google'  # ou 'whisper'
WHISPER_MODEL = 'base'  # 'tiny', 'base', 'small', 'medium', 'large'

# Algorithme génétique
GENETIC_ALGORITHM_ENABLED = True
GENETIC_POPULATION_SIZE = 50
GENETIC_GENERATIONS = 30

# Recherche
SEARCH_RESULTS_PER_PAGE = 20
SEARCH_MAX_RESULTS = 100

# # configuration OSGeo4W
# import os
# if os.name == 'nt':
#     # Remplacez par votre chemin d'installation
#     os.environ['PATH'] = r"C:\OSGeo4W\bin" + ';' + os.environ['PATH']
#     GDAL_LIBRARY_PATH = r"C:\OSGeo4W\bin\gdal310.dll" # Vérifiez le numéro du dll


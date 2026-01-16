#!/usr/bin/env python3
# ============================================
# setup.py - Script d'installation automatique
# ============================================

"""
Script pour créer automatiquement la structure complète du backend Django
Usage: python setup.py
"""

import os
import subprocess
import sys

def run_command(command, description):
    """Exécute une commande shell"""
    print(f"\n🔧 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} - OK")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Erreur: {e}")
        print(f"Output: {e.output}")
        return False

def create_directory(path):
    """Crée un dossier s'il n'existe pas"""
    if not os.path.exists(path):
        os.makedirs(path)
        print(f"📁 Créé: {path}")

def create_file(path, content=""):
    """Crée un fichier avec du contenu"""
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"📄 Créé: {path}")

def main():
    print("""
╔═══════════════════════════════════════════════════════════╗
║     🏠 HOUSING PLATFORM - INSTALLATION AUTOMATIQUE       ║
║              Backend Django Setup Script                  ║
╚═══════════════════════════════════════════════════════════╝
    """)

    # Vérifier Python
    print("🐍 Vérification de Python...")
    if sys.version_info < (3, 8):
        print("❌ Python 3.8+ requis")
        sys.exit(1)
    print(f"✅ Python {sys.version_info.major}.{sys.version_info.minor} détecté")

    # Créer la structure de base
    print("\n📦 Création de la structure du projet...")
    
    # Dossiers principaux
    directories = [
        'config',
        'apps',
        'apps/users',
        'apps/users/migrations',
        'apps/users/management',
        'apps/users/management/commands',
        'apps/housing',
        'apps/housing/migrations',
        'apps/housing/management',
        'apps/housing/management/commands',
        'apps/location',
        'apps/location/migrations',
        'apps/messaging',
        'apps/messaging/migrations',
        'apps/visits',
        'apps/visits/migrations',
        'apps/notifications',
        'apps/notifications/migrations',
        'media',
        'media/profiles',
        'media/housings',
        'media/videos',
        'media/messages',
        'static',
        'static/css',
        'static/js',
        'static/images',
    ]

    for directory in directories:
        create_directory(directory)

    # Créer __init__.py
    init_files = [
        'apps/__init__.py',
        'apps/users/__init__.py',
        'apps/users/migrations/__init__.py',
        'apps/housing/__init__.py',
        'apps/housing/migrations/__init__.py',
        'apps/location/__init__.py',
        'apps/location/migrations/__init__.py',
        'apps/messaging/__init__.py',
        'apps/messaging/migrations/__init__.py',
        'apps/visits/__init__.py',
        'apps/visits/migrations/__init__.py',
        'apps/notifications/__init__.py',
        'apps/notifications/migrations/__init__.py',
    ]

    for init_file in init_files:
        create_file(init_file, "")

    # Créer requirements.txt
    requirements = """Django==5.0
djangorestframework==3.14.0
djangorestframework-simplejwt==5.3.0
django-cors-headers==4.3.0
django-filter==23.5
Pillow==10.1.0
python-decouple==3.8
"""
    create_file('requirements.txt', requirements)

    # Créer .env.example
    env_example = """SECRET_KEY=django-insecure-change-this-in-production
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

DATABASE_URL=sqlite:///db.sqlite3

CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
"""
    create_file('.env.example', env_example)
    create_file('.env', env_example)

    # Créer .gitignore
    gitignore = """# Python
*.py[cod]
__pycache__/
*.so
*.egg
*.egg-info/
dist/
build/
venv/
env/

# Django
*.log
db.sqlite3
db.sqlite3-journal
media/
staticfiles/

# Environment
.env

# IDE
.vscode/
.idea/
*.swp

# OS
.DS_Store
Thumbs.db
"""
    create_file('.gitignore', gitignore)

    # Créer apps.py pour chaque app
    apps_config = {
        'apps/users/apps.py': """from django.apps import AppConfig

class UsersConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.users'
""",
        'apps/housing/apps.py': """from django.apps import AppConfig

class HousingConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.housing'
""",
        'apps/location/apps.py': """from django.apps import AppConfig

class LocationConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.location'
""",
        'apps/messaging/apps.py': """from django.apps import AppConfig

class MessagingConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.messaging'
""",
        'apps/visits/apps.py': """from django.apps import AppConfig

class VisitsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.visits'
""",
        'apps/notifications/apps.py': """from django.apps import AppConfig

class NotificationsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.notifications'
""",
    }

    for path, content in apps_config.items():
        create_file(path, content)

    # Créer README.md
    readme = """# 🏠 Housing Platform - Backend Django

Backend API REST pour la plateforme de location de logements.

## 🚀 Installation

### 1. Créer un environnement virtuel
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\\Scripts\\activate     # Windows
```

### 2. Installer les dépendances
```bash
pip install -r requirements.txt
```

### 3. Configuration
```bash
cp .env.example .env
# Modifier .env selon vos besoins
```

### 4. Migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

### 5. Créer un superuser
```bash
python manage.py createsuperuser
```

### 6. Générer des données de test
```bash
python manage.py populate_data
```

### 7. Lancer le serveur
```bash
python manage.py runserver
```

## 📡 API Documentation

- Admin: http://localhost:8000/admin/
- API Root: http://localhost:8000/api/
- Swagger (à venir): http://localhost:8000/swagger/

## 👥 Comptes de test

Après `populate_data`:
- Admin: admin / admin123
- Propriétaires: proprio1-5 / password123
- Locataires: locataire1-10 / password123

## 📞 Contact

Email: feudjioaurelien24@gmail.com
"""
    create_file('README.md', readme)

    print("\n✅ Structure créée avec succès!")
    print("\n📋 PROCHAINES ÉTAPES:")
    print("""
1. Copier tous les fichiers models.py, views.py, serializers.py 
   depuis les artifacts Claude dans les dossiers correspondants

2. Créer l'environnement virtuel:
   python -m venv venv
   
3. Activer l'environnement:
   Linux/Mac: source venv/bin/activate
   Windows: venv\\Scripts\\activate

4. Installer les dépendances:
   pip install -r requirements.txt

5. Créer le projet Django:
   django-admin startproject config .

6. Faire les migrations:
   python manage.py makemigrations
   python manage.py migrate

7. Créer un superuser:
   python manage.py createsuperuser

8. Lancer le serveur:
   python manage.py runserver
    """)

if __name__ == '__main__':
    main()


# ============================================
# GUIDE COMPLET D'INSTALLATION MANUELLE
# ============================================

"""
╔═══════════════════════════════════════════════════════════╗
║          GUIDE D'INSTALLATION ÉTAPE PAR ÉTAPE            ║
╚═══════════════════════════════════════════════════════════╝

ÉTAPE 1: CRÉER LE DOSSIER DU PROJET
------------------------------------
mkdir housing_platform
cd housing_platform


ÉTAPE 2: CRÉER L'ENVIRONNEMENT VIRTUEL
---------------------------------------
python -m venv venv

# Activer l'environnement:
# Sur Windows:
venv\\Scripts\\activate

# Sur Linux/Mac:
source venv/bin/activate


ÉTAPE 3: CRÉER requirements.txt
--------------------------------
Créer un fichier requirements.txt avec:

Django==5.0
djangorestframework==3.14.0
djangorestframework-simplejwt==5.3.0
django-cors-headers==4.3.0
django-filter==23.5
Pillow==10.1.0
python-decouple==3.8


ÉTAPE 4: INSTALLER LES DÉPENDANCES
-----------------------------------
pip install -r requirements.txt


ÉTAPE 5: CRÉER LE PROJET DJANGO
--------------------------------
django-admin startproject config .


ÉTAPE 6: CRÉER LA STRUCTURE DES APPS
-------------------------------------
# Créer le dossier apps
mkdir apps
touch apps/__init__.py

# Créer chaque application
python manage.py startapp users
python manage.py startapp housing
python manage.py startapp location
python manage.py startapp messaging
python manage.py startapp visits
python manage.py startapp notifications

# Déplacer dans apps/
mv users apps/
mv housing apps/
mv location apps/
mv messaging apps/
mv visits apps/
mv notifications apps/


ÉTAPE 7: CRÉER LES DOSSIERS MEDIA ET STATIC
--------------------------------------------
mkdir media media/profiles media/housings media/videos media/messages
mkdir static static/css static/js static/images


ÉTAPE 8: COPIER LES FICHIERS DEPUIS CLAUDE
-------------------------------------------
Copier depuis les artifacts:

1. apps/users/models.py (artifact "Backend Django - Models Complets")
2. apps/housing/models.py (même artifact)
3. apps/location/models.py (même artifact)
4. apps/messaging/models.py (même artifact)
5. apps/visits/models.py (même artifact)
6. apps/notifications/models.py (même artifact)

7. apps/housing/serializers.py (artifact "Backend Django - API REST")
8. apps/housing/views.py (même artifact)
9. apps/housing/genetic_algorithm.py (même artifact)

10. config/urls.py (artifact "Backend Django - URLs + Settings")
11. apps/housing/admin.py (même artifact)

12. config/settings.py - À CONFIGURER (voir artifact ci-dessus)


ÉTAPE 9: CONFIGURER settings.py
--------------------------------
Modifier config/settings.py:

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'django_filters',
    
    'apps.users',
    'apps.housing',
    'apps.location',
    'apps.messaging',
    'apps.visits',
    'apps.notifications',
]

AUTH_USER_MODEL = 'users.User'

# Ajouter toutes les configurations de l'artifact


ÉTAPE 10: FAIRE LES MIGRATIONS
-------------------------------
python manage.py makemigrations
python manage.py migrate


ÉTAPE 11: CRÉER UN SUPERUSER
-----------------------------
python manage.py createsuperuser
# Username: admin
# Email: admin@housing.cm
# Password: admin123


ÉTAPE 12: CRÉER LE SCRIPT populate_data.py
-------------------------------------------
Créer: apps/housing/management/commands/populate_data.py
(Copier depuis l'artifact "Backend Django - URLs + Settings")


ÉTAPE 13: GÉNÉRER DES DONNÉES DE TEST
--------------------------------------
python manage.py populate_data


ÉTAPE 14: LANCER LE SERVEUR
----------------------------
python manage.py runserver

Accéder à:
- Admin: http://localhost:8000/admin/
- API: http://localhost:8000/api/


╔═══════════════════════════════════════════════════════════╗
║                  STRUCTURE FINALE                         ║
╚═══════════════════════════════════════════════════════════╝

housing_platform/
│
├── venv/                    # Environnement virtuel
├── config/                  # Configuration Django
│   ├── settings.py         ✅ À configurer
│   ├── urls.py             ✅ À copier
│   ├── wsgi.py             ✅ Auto-créé
│   └── asgi.py             ✅ Auto-créé
│
├── apps/
│   ├── users/
│   │   ├── models.py       ✅ À copier (User)
│   │   ├── admin.py        ✅ À copier
│   │   ├── serializers.py  ✅ À copier
│   │   ├── views.py        ✅ À copier
│   │   └── apps.py         ✅ À créer
│   │
│   ├── housing/
│   │   ├── models.py       ✅ À copier (Housing, Category, etc.)
│   │   ├── admin.py        ✅ À copier
│   │   ├── serializers.py  ✅ À copier
│   │   ├── views.py        ✅ À copier
│   │   ├── genetic_algorithm.py ✅ À copier
│   │   ├── apps.py         ✅ À créer
│   │   └── management/
│   │       └── commands/
│   │           └── populate_data.py ✅ À copier
│   │
│   ├── location/
│   │   ├── models.py       ✅ À copier (Region, City, District)
│   │   └── apps.py         ✅ À créer
│   │
│   ├── messaging/
│   │   ├── models.py       ✅ À copier (Conversation, Message)
│   │   └── apps.py         ✅ À créer
│   │
│   ├── visits/
│   │   ├── models.py       ✅ À copier (Visit)
│   │   └── apps.py         ✅ À créer
│   │
│   └── notifications/
│       ├── models.py       ✅ À copier (Notification)
│       └── apps.py         ✅ À créer
│
├── media/                   ✅ À créer
├── static/                  ✅ À créer
├── db.sqlite3              ✅ Auto-créé après migrate
├── manage.py               ✅ Auto-créé
├── requirements.txt        ✅ À créer
├── .env                    ✅ À créer
├── .gitignore              ✅ À créer
└── README.md               ✅ À créer


╔═══════════════════════════════════════════════════════════╗
║             CHECKLIST DE VÉRIFICATION                     ║
╚═══════════════════════════════════════════════════════════╝

□ Environnement virtuel créé et activé
□ Django installé
□ Projet Django créé (config/)
□ Structure apps/ créée
□ Tous les models.py copiés
□ settings.py configuré (INSTALLED_APPS, AUTH_USER_MODEL)
□ urls.py configuré
□ Migrations effectuées
□ Superuser créé
□ Données de test générées
□ Serveur démarre sans erreur
□ Admin accessible (localhost:8000/admin/)
□ API accessible (localhost:8000/api/)


╔═══════════════════════════════════════════════════════════╗
║                 DÉPANNAGE RAPIDE                          ║
╚═══════════════════════════════════════════════════════════╝

ERREUR: "No module named 'apps'"
→ Vérifier que apps/__init__.py existe
→ Redémarrer le serveur

ERREUR: "AUTH_USER_MODEL"
→ Ajouter AUTH_USER_MODEL = 'users.User' dans settings.py

ERREUR: Migrations
→ python manage.py makemigrations
→ python manage.py migrate

ERREUR: "module not found"
→ pip install -r requirements.txt

ERREUR: Port 8000 occupé
→ python manage.py runserver 8001
"""
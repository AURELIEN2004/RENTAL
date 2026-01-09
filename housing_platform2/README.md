# 🏠 Housing Platform - Backend Django

Backend API REST pour la plateforme de location de logements.

## 🚀 Installation

### 1. Créer un environnement virtuel
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows
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

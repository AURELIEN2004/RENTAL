# ============================================
# 📁 apps/housing/management/commandes/populate_data.py - COMPLET
# ============================================

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.housing.models import *
import random
from apps.location.models import Region
from apps.location.models import City
from apps.location.models import District
from apps.housing.models import Category, HousingType, Housing


User = get_user_model()


class Command(BaseCommand):
    help = 'Génère des données de test pour la plateforme'
    
    def handle(self, *args, **kwargs):
        self.stdout.write('Génération des données...')
        
        # Créer des régions
        regions_data = ['Centre', 'Littoral', 'Ouest', 'Nord']
        regions = []
        for name in regions_data:
            region, created = Region.objects.get_or_create(name=name)
            regions.append(region)
            if created:
                self.stdout.write(f'✓ Région créée: {name}')
        
        # Créer des villes
        cities_data = {
            'Centre': ['Yaoundé', 'Mbalmayo'],
            'Littoral': ['Douala', 'Edéa'],
            'Ouest': ['Bafoussam', 'Dschang'],
            'Nord': ['Garoua', 'Maroua']
        }
        
        cities = []
        for region_name, city_list in cities_data.items():
            region = Region.objects.get(name=region_name)
            for city_name in city_list:
                city, created = City.objects.get_or_create(
                    name=city_name,
                    region=region
                )
                cities.append(city)
                if created:
                    self.stdout.write(f'✓ Ville créée: {city_name}')
        
        # Créer des quartiers pour Yaoundé
        yaounde = City.objects.get(name='Yaoundé')
        quartiers_yaounde = ['Bastos', 'Mimboman', 'Essos', 'Ngousso', 
                             'Tsinga', 'Odza', 'Mokolo']
        
        for quartier_name in quartiers_yaounde:
            district, created = District.objects.get_or_create(
                name=quartier_name,
                city=yaounde
            )
            if created:
                self.stdout.write(f'✓ Quartier créé: {quartier_name}')
        
        # Créer des catégories
        categories_data = ['Studio', 'Chambre', 'Appartement', 'Maison']
        categories = []
        for name in categories_data:
            category, created = Category.objects.get_or_create(name=name)
            categories.append(category)
            if created:
                self.stdout.write(f'✓ Catégorie créée: {name}')
        
        # Créer des types
        types_data = ['Simple', 'Moderne', 'Meublé']
        housing_types = []
        for name in types_data:
            housing_type, created = HousingType.objects.get_or_create(name=name)
            housing_types.append(housing_type)
            if created:
                self.stdout.write(f'✓ Type créé: {name}')
        
        # Créer des utilisateurs de test
        if not User.objects.filter(username='admin').exists():
            User.objects.create_superuser(
                username='admin',
                email='admin@housing.cm',
                password='admin123',
                is_proprietaire=True,
                is_locataire=True
            )
            self.stdout.write('✓ Admin créé (admin/admin123)')
        
        # Créer des propriétaires
        for i in range(1, 6):
            username = f'proprio{i}'
            if not User.objects.filter(username=username).exists():
                User.objects.create_user(
                    username=username,
                    email=f'{username}@housing.cm',
                    password='password123',
                    is_proprietaire=True,
                    phone=f'+237 6{random.randint(10000000, 99999999)}'
                )
                self.stdout.write(f'✓ Propriétaire créé: {username}')
        
        # Créer des locataires
        for i in range(1, 11):
            username = f'locataire{i}'
            if not User.objects.filter(username=username).exists():
                User.objects.create_user(
                    username=username,
                    email=f'{username}@housing.cm',
                    password='password123',
                    is_locataire=True,
                    preferred_max_price=random.choice([50000, 75000, 100000, 150000])
                )
                self.stdout.write(f'✓ Locataire créé: {username}')
        
        # Créer des logements
        proprietaires = User.objects.filter(is_proprietaire=True)
        districts = District.objects.all()
        
        for i in range(30):
            proprio = random.choice(proprietaires)
            category = random.choice(categories)
            housing_type = random.choice(housing_types)
            district = random.choice(districts)
            
            housing = Housing.objects.create(
                owner=proprio,
                title=f"{category.name} {housing_type.name} à {district.name}",
                description=f"Magnifique {category.name.lower()} {housing_type.name.lower()} situé à {district.name}. Proche de toutes commodités.",
                category=category,
                housing_type=housing_type,
                price=random.choice([25000, 35000, 50000, 75000, 100000, 150000]),
                area=random.choice([20, 30, 45, 60, 80, 100]),
                rooms=random.randint(1, 4),
                bathrooms=random.randint(1, 3),
                region=district.city.region,
                city=district.city,
                district=district,
                latitude=3.8 + random.uniform(-0.1, 0.1),  # Coordonnées Yaoundé
                longitude=11.5 + random.uniform(-0.1, 0.1),
                status=random.choice(['disponible', 'disponible', 'reserve']),
                views_count=random.randint(0, 200),
                likes_count=random.randint(0, 50)
            )
            
            self.stdout.write(f'✓ Logement créé: {housing.title}')
        
        self.stdout.write(self.style.SUCCESS('\n✅ Données de test générées avec succès!'))
        self.stdout.write('\nComptes créés:')
        self.stdout.write('  - Admin: admin / admin123')
        self.stdout.write('  - Propriétaires: proprio1-5 / password123')
        self.stdout.write('  - Locataires: locataire1-10 / password123')


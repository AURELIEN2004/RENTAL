# apps/housing/voice_search.py

import re
from django.db.models import Q
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from .models import Housing
from apps.location.models import City, District, Region
from .serializers import HousingListSerializer

class VoiceSearchParser:
    """
    Parser intelligent pour les commandes vocales
    Extrait les critères de recherche depuis une phrase naturelle
    """
    
    # Mots-clés par langue
    KEYWORDS = {
        'fr': {
            'categories': {
                'studio': ['studio', 'studios'],
                'chambre': ['chambre', 'chambres'],
                'appartement': ['appartement', 'appartements', 'appart'],
                'maison': ['maison', 'maisons', 'villa', 'villas']
            },
            'types': {
                'meublé': ['meublé', 'meuble', 'meublés', 'meubles'],
                'moderne': ['moderne', 'modernes', 'contemporain'],
                'simple': ['simple', 'simples', 'basique']
            },
            'proximity': {
                'près': ['près', 'proche', 'à côté', 'autour', 'environs'],
                'loin': ['loin', 'éloigné', 'distant']
            },
            'price_indicators': {
                'moins': ['moins', 'maximum', 'max'],
                'plus': ['plus', 'minimum', 'min'],
                'entre': ['entre']
            },
            'poi': {  # Points of Interest
                'école': ['école', 'écoles', 'établissement scolaire'],
                'université': ['université', 'universités', 'campus', 'fac'],
                'hôpital': ['hôpital', 'hôpitaux', 'clinique', 'centre médical'],
                'marché': ['marché', 'marchés', 'supermarché', 'magasin'],
                'centre': ['centre', 'centre-ville', 'downtown'],
                'stade': ['stade', 'terrain', 'complexe sportif'],
                'église': ['église', 'cathédrale', 'chapelle'],
                'mosquée': ['mosquée'],
                'gare': ['gare', 'station'],
                'aéroport': ['aéroport']
            }
        },
        'en': {
            'categories': {
                'studio': ['studio', 'studios'],
                'room': ['room', 'rooms', 'bedroom'],
                'apartment': ['apartment', 'apartments', 'flat'],
                'house': ['house', 'houses', 'villa']
            },
            'types': {
                'furnished': ['furnished', 'equipped'],
                'modern': ['modern', 'contemporary'],
                'simple': ['simple', 'basic']
            },
            'proximity': {
                'near': ['near', 'close', 'nearby', 'around'],
                'far': ['far', 'distant']
            },
            'price_indicators': {
                'less': ['less', 'maximum', 'max', 'under'],
                'more': ['more', 'minimum', 'min', 'above'],
                'between': ['between']
            },
            'poi': {
                'school': ['school', 'schools', 'educational'],
                'university': ['university', 'universities', 'campus'],
                'hospital': ['hospital', 'clinic', 'medical center'],
                'market': ['market', 'supermarket', 'shop', 'mall'],
                'center': ['center', 'downtown', 'city center'],
                'stadium': ['stadium', 'sports complex'],
                'church': ['church', 'cathedral'],
                'mosque': ['mosque'],
                'station': ['station', 'terminal'],
                'airport': ['airport']
            }
        }
    }
    
    def __init__(self, query, language='fr'):
        self.query = query.lower()
        self.language = 'fr' if language.startswith('fr') else 'en'
        self.keywords = self.KEYWORDS[self.language]
    
    def parse(self):
        """Parse la requête et retourne les filtres"""
        filters = {}
        
        # Extraire la catégorie
        filters['category'] = self._extract_category()
        
        # Extraire le type
        filters['housing_type'] = self._extract_type()
        
        # Extraire le prix
        price_info = self._extract_price()
        if price_info:
            filters.update(price_info)
        
        # Extraire la localisation
        location = self._extract_location()
        if location:
            filters.update(location)
        
        # Extraire les POI (Points d'intérêt)
        poi = self._extract_poi()
        if poi:
            filters['poi'] = poi
        
        # Extraire nombre de chambres
        rooms = self._extract_rooms()
        if rooms:
            filters['rooms'] = rooms
        
        return filters
    
    def _extract_category(self):
        """Extraire la catégorie de logement"""
        from apps.housing.models import Category
        
        for cat_name, keywords in self.keywords['categories'].items():
            for keyword in keywords:
                if keyword in self.query:
                    try:
                        category = Category.objects.filter(
                            name__icontains=cat_name
                        ).first()
                        return category.id if category else None
                    except:
                        pass
        return None
    
    def _extract_type(self):
        """Extraire le type de logement"""
        from apps.housing.models import HousingType
        
        for type_name, keywords in self.keywords['types'].items():
            for keyword in keywords:
                if keyword in self.query:
                    try:
                        housing_type = HousingType.objects.filter(
                            name__icontains=type_name
                        ).first()
                        return housing_type.id if housing_type else None
                    except:
                        pass
        return None
    
    def _extract_price(self):
        """Extraire les informations de prix"""
        # Chercher des nombres (prix)
        numbers = re.findall(r'\d+(?:\s?\d{3})*', self.query)
        prices = [int(n.replace(' ', '')) for n in numbers]
        
        if not prices:
            return None
        
        result = {}
        
        # Vérifier "moins de" / "less than"
        for keyword in self.keywords['price_indicators']['moins']:
            if keyword in self.query and prices:
                result['max_price'] = prices[0]
                return result
        
        # Vérifier "plus de" / "more than"
        for keyword in self.keywords['price_indicators']['plus']:
            if keyword in self.query and prices:
                result['min_price'] = prices[0]
                return result
        
        # Vérifier "entre" / "between"
        for keyword in self.keywords['price_indicators']['entre']:
            if keyword in self.query and len(prices) >= 2:
                result['min_price'] = min(prices[0], prices[1])
                result['max_price'] = max(prices[0], prices[1])
                return result
        
        # Si un seul prix, on suppose "max"
        if len(prices) == 1:
            result['max_price'] = prices[0]
        
        return result if result else None
    
    def _extract_location(self):
        """Extraire la localisation (ville, quartier)"""
        result = {}
        
        # Chercher des villes connues
        cities = City.objects.all()
        for city in cities:
            if city.name.lower() in self.query:
                result['city'] = city.id
                
                # Chercher un quartier dans cette ville
                districts = District.objects.filter(city=city)
                for district in districts:
                    if district.name.lower() in self.query:
                        result['district'] = district.id
                        break
                break
        
        return result if result else None
    
    def _extract_poi(self):
        """Extraire les points d'intérêt mentionnés"""
        pois = []
        
        for poi_type, keywords in self.keywords['poi'].items():
            for keyword in keywords:
                if keyword in self.query:
                    pois.append(poi_type)
                    break
        
        return pois if pois else None
    
    def _extract_rooms(self):
        """Extraire le nombre de chambres"""
        # Chercher des patterns comme "2 chambres", "3 rooms"
        patterns = [
            r'(\d+)\s*(?:chambre|room)',
            r'(?:chambre|room)\s*(\d+)'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, self.query)
            if match:
                return int(match.group(1))
        
        return None


@api_view(['POST'])
@permission_classes([AllowAny])
def voice_search(request):
    """
    Endpoint pour la recherche vocale
    Reçoit une commande vocale et retourne les résultats
    """
    query = request.data.get('query', '')
    language = request.data.get('language', 'fr-FR')
    
    if not query:
        return Response({
            'error': 'Aucune requête fournie'
        }, status=400)
    
    # Parser la commande vocale
    parser = VoiceSearchParser(query, language)
    filters = parser.parse()
    
    # Construire le queryset
    housings = Housing.objects.filter(
        is_visible=True,
        status='disponible'
    ).select_related(
        'owner', 'category', 'housing_type', 'city', 'district'
    ).prefetch_related('images')
    
    # Appliquer les filtres
    if filters.get('category'):
        housings = housings.filter(category_id=filters['category'])
    
    if filters.get('housing_type'):
        housings = housings.filter(housing_type_id=filters['housing_type'])
    
    if filters.get('city'):
        housings = housings.filter(city_id=filters['city'])
    
    if filters.get('district'):
        housings = housings.filter(district_id=filters['district'])
    
    if filters.get('min_price'):
        housings = housings.filter(price__gte=filters['min_price'])
    
    if filters.get('max_price'):
        housings = housings.filter(price__lte=filters['max_price'])
    
    if filters.get('rooms'):
        housings = housings.filter(rooms=filters['rooms'])
    
    # Recherche de proximité avec POI
    if filters.get('poi'):
        # Recherche dans le champ additional_features
        poi_query = Q()
        for poi in filters['poi']:
            poi_query |= Q(additional_features__icontains=poi)
        
        housings = housings.filter(poi_query)
    
    # Limiter les résultats
    housings = housings[:20]
    
    # Sérialiser
    serializer = HousingListSerializer(
        housings,
        many=True,
        context={'request': request}
    )
    
    return Response({
        'query': query,
        'filters': filters,
        'count': housings.count(),
        'results': serializer.data
    })
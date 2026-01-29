# ============================================
# 📁 apps/recherche/search_engine.py
# ============================================

from django.db.models import Q, Count, Avg, F
from django.contrib.gis.measure import D
from typing import List, Dict, Optional
import math

from apps.housing.models import Housing
from .models import NearbyPlace, SearchHistory
from .genetic_algorithm import GeneticSearchOptimizer, calculate_housing_score


class SearchEngine:
    """Moteur de recherche principal pour les logements"""
    
    def __init__(self, user=None, language='fr'):
        self.user = user
        self.language = language
        self.genetic_optimizer = GeneticSearchOptimizer()
    
    def search(
        self,
        query: Optional[str] = None,
        filters: Optional[Dict] = None,
        use_genetic_algorithm: bool = False
    ) -> List[Housing]:
        """
        Recherche principale
        
        Args:
            query: Texte de recherche
            filters: Dictionnaire de filtres
            use_genetic_algorithm: Utiliser l'algorithme génétique
        
        Returns:
            Liste de logements
        """
        filters = filters or {}
        
        # Base queryset
        queryset = Housing.objects.filter(
            status='disponible',
            is_visible=True
        ).select_related(
            'owner', 'category', 'housing_type', 
            'region', 'city', 'district'
        ).prefetch_related('images')
        
        # Filtre de recherche textuelle
        if query:
            queryset = self._apply_text_search(queryset, query)
        
        # Appliquer les filtres
        queryset = self._apply_filters(queryset, filters)
        
        # Récupérer les résultats
        results = list(queryset)
        
        # Sauvegarder dans l'historique
        if self.user:
            self._save_search_history(query, filters, len(results))
        
        # Optimisation avec algorithme génétique
        if use_genetic_algorithm and len(results) > 10:
            user_preferences = self._get_user_preferences()
            results = self.genetic_optimizer.optimize(
                results,
                user_preferences,
                filters
            )
        else:
            # Tri par défaut
            results = self._default_sorting(results, filters)
        
        return results
    
    def _apply_text_search(self, queryset, query: str):
        """Applique la recherche textuelle"""
        search_terms = query.lower().split()
        
        q_objects = Q()
        for term in search_terms:
            q_objects |= Q(title__icontains=term)
            q_objects |= Q(description__icontains=term)
            q_objects |= Q(city__name__icontains=term)
            q_objects |= Q(district__name__icontains=term)
            q_objects |= Q(category__name__icontains=term)
            q_objects |= Q(additional_features__icontains=term)
        
        return queryset.filter(q_objects)
    
    def _apply_filters(self, queryset, filters: Dict):
        """Applique tous les filtres"""
        
        # Filtres de catégorie et type
        if filters.get('category'):
            queryset = queryset.filter(category_id=filters['category'])
        
        if filters.get('housing_type'):
            queryset = queryset.filter(housing_type_id=filters['housing_type'])
        
        # Filtres de localisation
        if filters.get('region'):
            queryset = queryset.filter(region_id=filters['region'])
        
        if filters.get('city'):
            queryset = queryset.filter(city_id=filters['city'])
        
        if filters.get('district'):
            queryset = queryset.filter(district_id=filters['district'])
        
        # Filtres de prix
        if filters.get('min_price'):
            queryset = queryset.filter(price__gte=filters['min_price'])
        
        if filters.get('max_price'):
            queryset = queryset.filter(price__lte=filters['max_price'])
        
        # Filtres de caractéristiques
        if filters.get('min_rooms'):
            queryset = queryset.filter(rooms__gte=filters['min_rooms'])
        
        if filters.get('max_rooms'):
            queryset = queryset.filter(rooms__lte=filters['max_rooms'])
        
        if filters.get('min_bathrooms'):
            queryset = queryset.filter(bathrooms__gte=filters['min_bathrooms'])
        
        if filters.get('min_area'):
            queryset = queryset.filter(area__gte=filters['min_area'])
        
        if filters.get('max_area'):
            queryset = queryset.filter(area__lte=filters['max_area'])
        
        # Filtre de lieux à proximité
        if filters.get('nearby_places'):
            queryset = self._filter_by_nearby_places(queryset, filters['nearby_places'])
        
        return queryset
    
    def _filter_by_nearby_places(self, queryset, place_types: List[str]):
        """Filtre par lieux à proximité"""
        # Pour chaque logement, vérifier s'il y a des lieux du type demandé dans le même quartier/ville
        housing_ids = []
        
        for housing in queryset:
            nearby = NearbyPlace.objects.filter(
                city=housing.city,
                place_type__in=place_types
            )
            
            if housing.district:
                nearby = nearby.filter(district=housing.district)
            
            if nearby.exists():
                housing_ids.append(housing.id)
        
        return queryset.filter(id__in=housing_ids)
    
    def _default_sorting(self, results: List[Housing], filters: Dict) -> List[Housing]:
        """Tri par défaut des résultats"""
        ordering = filters.get('ordering', '-created_at')
        
        # Map des champs de tri
        sort_key_map = {
            'price': lambda h: h.price,
            '-price': lambda h: -h.price,
            'area': lambda h: h.area,
            '-area': lambda h: -h.area,
            'created_at': lambda h: h.created_at,
            '-created_at': lambda h: -h.created_at.timestamp(),
            'popularity': lambda h: -(h.likes_count + h.views_count),
        }
        
        if ordering in sort_key_map:
            results.sort(key=sort_key_map[ordering])
        
        return results
    
    def _get_user_preferences(self) -> Dict:
        """Récupère les préférences utilisateur"""
        if not self.user:
            return self._default_preferences()
        
        try:
            prefs = self.user.search_preferences
            return {
                'price_weight': prefs.price_weight,
                'location_weight': prefs.location_weight,
                'size_weight': prefs.size_weight,
                'amenities_weight': prefs.amenities_weight,
                'proximity_weight': prefs.proximity_weight,
                'diversity_weight': 0.2,
            }
        except:
            return self._default_preferences()
    
    def _default_preferences(self) -> Dict:
        """Préférences par défaut"""
        return {
            'price_weight': 0.3,
            'location_weight': 0.25,
            'size_weight': 0.2,
            'amenities_weight': 0.15,
            'proximity_weight': 0.1,
            'diversity_weight': 0.2,
        }
    
    def _save_search_history(self, query: Optional[str], filters: Dict, results_count: int):
        """Sauvegarde dans l'historique"""
        try:
            SearchHistory.objects.create(
                user=self.user,
                query_text=query or '',
                category_id=filters.get('category'),
                housing_type_id=filters.get('housing_type'),
                region_id=filters.get('region'),
                city_id=filters.get('city'),
                district_id=filters.get('district'),
                min_price=filters.get('min_price'),
                max_price=filters.get('max_price'),
                min_rooms=filters.get('min_rooms'),
                max_rooms=filters.get('max_rooms'),
                min_area=filters.get('min_area'),
                max_area=filters.get('max_area'),
                advanced_filters=filters,
                results_count=results_count,
                search_type='form',
                language=self.language
            )
        except Exception as e:
            # Log l'erreur mais ne pas bloquer la recherche
            print(f"Erreur sauvegarde historique: {e}")


class NaturalLanguageSearchEngine:
    """Moteur de recherche en langage naturel pour le chatbot"""
    
    def __init__(self, language='fr'):
        self.language = language
        self.search_engine = SearchEngine(language=language)
    
    def parse_and_search(self, user_message: str, user=None) -> Dict:
        """
        Parse le message utilisateur et effectue une recherche
        
        Args:
            user_message: Message de l'utilisateur
            user: Utilisateur (optionnel)
        
        Returns:
            Dictionnaire avec résultats et réponse
        """
        # Extraire les critères du message
        criteria = self._extract_criteria(user_message)
        
        # Effectuer la recherche
        self.search_engine.user = user
        results = self.search_engine.search(
            query=criteria.get('query'),
            filters=criteria.get('filters', {}),
            use_genetic_algorithm=True
        )
        
        # Générer une réponse
        response = self._generate_response(results, criteria)
        
        return {
            'results': results[:10],  # Top 10
            'response': response,
            'criteria': criteria,
            'total_count': len(results)
        }
    
    def _extract_criteria(self, message: str) -> Dict:
        """Extrait les critères de recherche du message"""
        message_lower = message.lower()
        filters = {}
        query_terms = []
        
        # Extraction du prix (expressions régulières simplifiées)
        if self.language == 'fr':
            # Prix
            if 'moins de' in message_lower or 'maximum' in message_lower:
                # Chercher un nombre après ces expressions
                import re
                price_match = re.search(r'(moins de|maximum)\s+(\d+)', message_lower)
                if price_match:
                    filters['max_price'] = int(price_match.group(2))
            
            if 'plus de' in message_lower or 'minimum' in message_lower:
                import re
                price_match = re.search(r'(plus de|minimum)\s+(\d+)', message_lower)
                if price_match:
                    filters['min_price'] = int(price_match.group(2))
            
            # Nombre de chambres
            if 'chambre' in message_lower:
                import re
                rooms_match = re.search(r'(\d+)\s+chambre', message_lower)
                if rooms_match:
                    filters['min_rooms'] = int(rooms_match.group(1))
            
            # Lieux à proximité
            nearby_keywords = {
                'école': 'school',
                'ecole': 'school',
                'supermarché': 'supermarket',
                'supermarche': 'supermarket',
                'hôpital': 'hospital',
                'hopital': 'hospital',
                'marché': 'market',
                'marche': 'market',
                'transport': 'transport',
                'banque': 'bank',
            }
            
            nearby_places = []
            for keyword, place_type in nearby_keywords.items():
                if keyword in message_lower:
                    nearby_places.append(place_type)
            
            if nearby_places:
                filters['nearby_places'] = nearby_places
            
            # Villes communes
            cities = ['yaoundé', 'yaounde', 'douala', 'bafoussam', 'garoua']
            for city in cities:
                if city in message_lower:
                    query_terms.append(city)
        
        else:  # English
            # Prix
            if 'less than' in message_lower or 'maximum' in message_lower:
                import re
                price_match = re.search(r'(less than|maximum)\s+(\d+)', message_lower)
                if price_match:
                    filters['max_price'] = int(price_match.group(2))
            
            # Chambres
            if 'bedroom' in message_lower or 'room' in message_lower:
                import re
                rooms_match = re.search(r'(\d+)\s+(bedroom|room)', message_lower)
                if rooms_match:
                    filters['min_rooms'] = int(rooms_match.group(1))
            
            # Lieux à proximité
            nearby_keywords = {
                'school': 'school',
                'supermarket': 'supermarket',
                'hospital': 'hospital',
                'market': 'market',
                'transport': 'transport',
                'bank': 'bank',
            }
            
            nearby_places = []
            for keyword, place_type in nearby_keywords.items():
                if keyword in message_lower:
                    nearby_places.append(place_type)
            
            if nearby_places:
                filters['nearby_places'] = nearby_places
        
        return {
            'query': ' '.join(query_terms) if query_terms else None,
            'filters': filters
        }
    
    def _generate_response(self, results: List[Housing], criteria: Dict) -> str:
        """Génère une réponse textuelle"""
        count = len(results)
        
        if self.language == 'fr':
            if count == 0:
                return "Désolé, je n'ai trouvé aucun logement correspondant à vos critères. Voulez-vous modifier votre recherche ?"
            elif count == 1:
                return f"J'ai trouvé 1 logement qui correspond à vos critères !"
            else:
                return f"J'ai trouvé {count} logements correspondant à vos critères. Voici les meilleurs résultats :"
        else:  # English
            if count == 0:
                return "Sorry, I couldn't find any housing matching your criteria. Would you like to modify your search?"
            elif count == 1:
                return f"I found 1 housing that matches your criteria!"
            else:
                return f"I found {count} housing options matching your criteria. Here are the best results:"
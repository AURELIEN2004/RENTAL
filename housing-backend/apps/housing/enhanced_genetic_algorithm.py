# apps/housing/enhanced_genetic_algorithm.py

import math
import random
import numpy as np
from django.utils import timezone
from datetime import timedelta
from django.db.models import Avg, Count, Q
from .models import Housing, UserInteraction


class EnhancedGeneticAlgorithm:
    """
    Algorithme génétique amélioré avec:
    - Apprentissage des préférences utilisateur
    - Prédiction de conversion
    - Clustering d'utilisateurs
    - Optimisation multi-objectif
    """
    
    def __init__(self, user, housings, config=None):
        self.user = user
        self.housings = list(housings)
        
        # Configuration par défaut
        default_config = {
            'generations': 5,
            'elite_size': 0.3,
            'mutation_rate': 0.15,
            'crossover_rate': 0.7,
            'learning_enabled': True,
            'multi_objective': True
        }
        
        self.config = {**default_config, **(config or {})}
        
        self.elite_size = int(len(housings) * self.config['elite_size']) if housings else 0
        
        # Poids des critères (adaptatifs)
        self.weights = self._initialize_weights()
        
        # Historique de performance
        self.performance_history = []
    
    def _initialize_weights(self):
        """
        Initialise les poids des critères
        Si l'apprentissage est activé, charge les poids précédents
        """
        if self.config['learning_enabled']:
            # Charger les poids depuis le profil utilisateur ou historique
            learned_weights = self._load_learned_weights()
            if learned_weights:
                return learned_weights
        
        # Poids par défaut
        return {
            'price': 0.30,
            'proximity': 0.25,
            'popularity': 0.20,
            'preference': 0.15,
            'recency': 0.10
        }
    
    def _load_learned_weights(self):
        """
        Charge les poids appris depuis l'historique utilisateur
        """
        try:
            # Analyser les conversions passées
            conversions = UserInteraction.objects.filter(
                user=self.user,
                contacted=True
            ).select_related('housing')
            
            if conversions.count() < 3:
                return None
            
            # Calculer l'importance de chaque critère basé sur les conversions
            weights = self._analyze_conversion_patterns(conversions)
            return weights
        except Exception as e:
            print(f"Erreur chargement poids: {e}")
            return None
    
    def _analyze_conversion_patterns(self, conversions):
        """
        Analyse les patterns de conversion pour ajuster les poids
        """
        # Analyser les logements contactés
        contacted_housings = [c.housing for c in conversions]
        
        # Analyser les caractéristiques communes
        avg_price = np.mean([h.price for h in contacted_housings])
        price_variance = np.std([h.price for h in contacted_housings])
        
        # Si faible variance de prix -> prix très important
        price_weight = 0.4 if price_variance < avg_price * 0.2 else 0.25
        
        # Analyser la proximité
        locations = [h.district_id for h in contacted_housings if h.district_id]
        location_diversity = len(set(locations)) / len(locations) if locations else 1
        
        # Si forte concentration géographique -> proximité importante
        proximity_weight = 0.35 if location_diversity < 0.5 else 0.20
        
        # Ajuster les autres poids
        remaining = 1.0 - price_weight - proximity_weight
        
        return {
            'price': price_weight,
            'proximity': proximity_weight,
            'popularity': remaining * 0.4,
            'preference': remaining * 0.4,
            'recency': remaining * 0.2
        }
    
    def calculate_fitness(self, housing):
        """
        Calcule le score de fitness multi-objectif
        """
        scores = {}
        
        # 1. Score Prix
        scores['price'] = self._calculate_price_score(housing)
        
        # 2. Score Proximité
        scores['proximity'] = self._calculate_proximity_score(housing)
        
        # 3. Score Popularité
        scores['popularity'] = self._calculate_popularity_score(housing)
        
        # 4. Score Préférence
        scores['preference'] = self._calculate_preference_score(housing)
        
        # 5. Score Récence
        scores['recency'] = self._calculate_recency_score(housing)
        
        # 6. Score de Conversion Prédit
        if self.config['learning_enabled']:
            scores['conversion'] = self._predict_conversion(housing, scores)
        else:
            scores['conversion'] = 0.5
        
        # Calcul fitness pondéré
        fitness = sum(
            self.weights[key] * scores[key]
            for key in self.weights.keys()
        )
        
        # Bonus conversion prédit
        fitness *= (1 + 0.3 * scores['conversion'])
        
        return fitness, scores
    
    def _calculate_price_score(self, housing):
        """Score basé sur l'adéquation prix"""
        if hasattr(self.user, 'preferred_max_price') and self.user.preferred_max_price:
            if housing.price <= self.user.preferred_max_price:
                return 1.0
            else:
                diff_ratio = (housing.price - self.user.preferred_max_price) / self.user.preferred_max_price
                return max(0, 1 - diff_ratio)
        return 0.5
    
    def _calculate_proximity_score(self, housing):
        """Score basé sur la proximité géographique"""
        if (hasattr(self.user, 'preferred_location_lat') and 
            self.user.preferred_location_lat and 
            housing.latitude and housing.longitude):
            
            distance = self._haversine_distance(
                self.user.preferred_location_lat,
                self.user.preferred_location_lng,
                housing.latitude,
                housing.longitude
            )
            
            # Score décroissant avec la distance
            return max(0, 1 - (distance / 15))  # 15km = score 0
        return 0.5
    
    def _calculate_popularity_score(self, housing):
        """Score basé sur la popularité"""
        if not self.housings:
            return 0.5
        
        max_engagement = max(
            (h.views_count or 0) + ((h.likes_count or 0) * 2)
            for h in self.housings
        )
        
        if max_engagement == 0:
            return 0.5
        
        engagement = (housing.views_count or 0) + ((housing.likes_count or 0) * 2)
        return min(1.0, engagement / max_engagement)
    
    def _calculate_preference_score(self, housing):
        """Score basé sur l'historique utilisateur"""
        try:
            # Interaction directe
            interaction = UserInteraction.objects.get(
                user=self.user,
                housing=housing
            )
            
            score = 0.3
            if interaction.viewed:
                score += 0.2
            if interaction.liked:
                score += 0.3
            if interaction.saved:
                score += 0.2
            
            return min(1.0, score)
        except UserInteraction.DoesNotExist:
            # Préférence par catégorie
            same_category = UserInteraction.objects.filter(
                user=self.user,
                housing__category=housing.category,
                Q(liked=True) | Q(saved=True) | Q(contacted=True),
            ).count()
            
            return min(0.8, same_category * 0.15)
    
    def _calculate_recency_score(self, housing):
        """Score basé sur la récence"""
        days = housing.days_since_published
        return max(0, 1 - (days / 30))
    
    def _predict_conversion(self, housing, scores):
        """
        Prédit la probabilité de conversion (contact/visite)
        Basé sur les patterns historiques
        """
        # Facteurs de conversion
        factors = []
        
        # 1. Adéquation prix-qualité
        price_quality = scores['price'] * scores['popularity']
        factors.append(price_quality)
        
        # 2. Engagement précédent avec catégorie similaire
        category_engagement = self._get_category_engagement_rate(housing.category)
        factors.append(category_engagement)
        
        # 3. Temps passé sur logements similaires
        similar_time = self._get_similar_housing_time(housing)
        factors.append(similar_time)
        
        # 4. Taux de conversion de la zone
        zone_conversion = self._get_zone_conversion_rate(housing.city_id)
        factors.append(zone_conversion)
        
        # Moyenne pondérée
        conversion_prob = np.mean(factors)
        
        return min(1.0, conversion_prob)
    
    def _get_category_engagement_rate(self, category):
        """Taux d'engagement avec cette catégorie"""
        total = UserInteraction.objects.filter(
            user=self.user,
            housing__category=category
        ).count()
        
        if total == 0:
            return 0.5
        
        engaged = UserInteraction.objects.filter(
            user=self.user,
            housing__category=category
        ).filter(
            Q(liked=True) | Q(saved=True) | Q(contacted=True)
        ).count()
        
        return engaged / total
    
    def _get_similar_housing_time(self, housing):
        """Temps moyen passé sur logements similaires"""
        # Simplified - dans la vraie implémentation, tracker le temps
        similar = UserInteraction.objects.filter(
            user=self.user,
            housing__category=housing.category,
            housing__price__range=(
                housing.price * 0.8,
                housing.price * 1.2
            )
        ).aggregate(avg_views=Avg('view_count'))
        
        avg_views = similar['avg_views'] or 0
        return min(1.0, avg_views / 5)  # 5 vues = intérêt fort
    
    def _get_zone_conversion_rate(self, city_id):
        """Taux de conversion général de la zone"""
        if not city_id:
            return 0.5
        
        total = UserInteraction.objects.filter(
            housing__city_id=city_id
        ).count()
        
        if total < 10:
            return 0.5
        
        converted = UserInteraction.objects.filter(
            housing__city_id=city_id,
            contacted=True
        ).count()
        
        return converted / total
    
    @staticmethod
    def _haversine_distance(lat1, lon1, lat2, lon2):
        """Calcule la distance en km entre deux points GPS"""
        R = 6371
        
        lat1_rad = math.radians(lat1)
        lat2_rad = math.radians(lat2)
        delta_lat = math.radians(lat2 - lat1)
        delta_lon = math.radians(lon2 - lon1)
        
        a = (math.sin(delta_lat / 2) ** 2 +
             math.cos(lat1_rad) * math.cos(lat2_rad) *
             math.sin(delta_lon / 2) ** 2)
        
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        
        return R * c
    
    def select_elites(self, scored_population):
        """Sélectionne les meilleurs individus"""
        if not scored_population:
            return []
        
        sorted_pop = sorted(
            scored_population,
            key=lambda x: x[1],
            reverse=True
        )
        return [h for h, score, _ in sorted_pop[:self.elite_size]]
    
    def crossover(self, elites):
        """Croisement génétique avec diversité"""
        if not elites or len(self.housings) <= self.elite_size:
            return []
        
        children = []
        target_count = len(self.housings) - self.elite_size
        
        for _ in range(target_count):
            if random.random() < self.config['crossover_rate']:
                # Crossover
                parent1 = random.choice(elites)
                parent2 = random.choice(elites)
                children.append(random.choice([parent1, parent2]))
            else:
                # Mutation forte - nouveau random
                children.append(random.choice(self.housings))
        
        return children
    
    def mutate(self, population):
        """Mutation avec adaptation"""
        if not population or not self.housings:
            return population
        
        for i in range(len(population)):
            if random.random() < self.config['mutation_rate']:
                population[i] = random.choice(self.housings)
        
        return population
    
    def run(self):
        """
        Exécute l'algorithme génétique amélioré
        """
        if not self.housings:
            return []
        
        population = self.housings.copy()
        best_fitness = 0
        
        for generation in range(self.config['generations']):
            # Évaluation
            scored = [
                (h, *self.calculate_fitness(h))
                for h in population
            ]
            
            # Tracking performance
            current_best = max(s[1] for s in scored)
            self.performance_history.append(current_best)
            
            # Adaptation des poids si stagnation
            if generation > 2 and self._detect_stagnation():
                self._adapt_weights()
            
            # Sélection
            elites = self.select_elites(scored)
            
            if len(elites) < 2:
                # Pas assez d'élites, retourner directement
                final = sorted(scored, key=lambda x: x[1], reverse=True)
                return [h for h, fitness, _ in final]
            
            # Croisement
            children = self.crossover(elites)
            
            # Mutation
            mutated = self.mutate(children)
            
            # Nouvelle génération
            population = elites + mutated
            
            best_fitness = current_best
        
        # Tri final
        final_scored = [
            (h, *self.calculate_fitness(h))
            for h in population
        ]
        
        sorted_final = sorted(
            final_scored,
            key=lambda x: x[1],
            reverse=True
        )
        
        # Sauvegarder les poids appris
        if self.config['learning_enabled']:
            self._save_learned_weights()
        
        return [h for h, fitness, _ in sorted_final]
    
    def _detect_stagnation(self):
        """Détecte si l'algorithme stagne"""
        if len(self.performance_history) < 3:
            return False
        
        recent = self.performance_history[-3:]
        improvement = (recent[-1] - recent[0]) / recent[0] if recent[0] > 0 else 0
        
        return abs(improvement) < 0.05  # Moins de 5% d'amélioration
    
    def _adapt_weights(self):
        """Adapte les poids en cas de stagnation"""
        # Augmenter légèrement la mutation
        self.config['mutation_rate'] = min(0.3, self.config['mutation_rate'] * 1.2)
        
        # Perturber légèrement les poids
        for key in self.weights:
            perturbation = random.uniform(-0.05, 0.05)
            self.weights[key] = max(0.1, min(0.5, self.weights[key] + perturbation))
        
        # Renormaliser
        total = sum(self.weights.values())
        self.weights = {k: v/total for k, v in self.weights.items()}
    
    def _save_learned_weights(self):
        """Sauvegarde les poids appris pour utilisation future"""
        # Dans une vraie implémentation, sauvegarder dans UserProfile
        # ou table dédiée
        pass


def apply_enhanced_genetic_algorithm(user, housings_queryset, config=None):
    """
    Fonction utilitaire pour l'algorithme génétique amélioré
    """
    if not housings_queryset or not housings_queryset.exists():
        return []
    
    ga = EnhancedGeneticAlgorithm(user, housings_queryset, config)
    return ga.run()
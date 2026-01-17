
# # ============================================
# # GENETIC_ALGORITHM.PY - 
# # ============================================


import math
import random
from django.utils import timezone
from .models import Housing, UserInteraction


class GeneticAlgorithm:
    """
    Algorithme génétique pour optimiser le classement des logements
    selon les préférences et comportements utilisateur
    """
    
    def __init__(self, user, housings, generations=3, elite_size=0.3, mutation_rate=0.1):
        self.user = user
        self.housings = list(housings)
        self.generations = generations
        self.elite_size = int(len(housings) * elite_size) if len(housings) > 0 else 0
        self.mutation_rate = mutation_rate
    
    def calculate_fitness(self, housing):
        """
        Calcule le score de pertinence (fitness) d'un logement
        
        Critères:
        - 30% : Adéquation prix
        - 25% : Proximité géographique
        - 20% : Popularité (vues + likes)
        - 15% : Préférences utilisateur (historique)
        - 10% : Récence (nouveaux logements)
        """
        
        # 1. Adéquation prix (30%)
        # ✅ CORRECTION : Vérification sécurisée de l'attribut
        if hasattr(self.user, 'preferred_max_price') and self.user.preferred_max_price:
            if housing.price <= self.user.preferred_max_price:
                price_score = 1.0
            else:
                diff_ratio = (housing.price - self.user.preferred_max_price) / self.user.preferred_max_price
                price_score = max(0, 1 - diff_ratio)
        else:
            price_score = 0.5
        
        # 2. Proximité (25%)
        # ✅ CORRECTION : Vérification sécurisée des coordonnées
        if (hasattr(self.user, 'preferred_location_lat') and 
            self.user.preferred_location_lat and 
            housing.latitude and housing.longitude):
            
            distance = self.haversine_distance(
                self.user.preferred_location_lat,
                self.user.preferred_location_lng,
                housing.latitude,
                housing.longitude
            )
            # Normalisation: 0km = 1.0, 10km+ = 0.0
            proximity_score = max(0, 1 - (distance / 10))
        else:
            proximity_score = 0.5
        
        # 3. Popularité (20%)
        # ✅ CORRECTION : Protection contre division par zéro
        if not self.housings:
            popularity_score = 0.5
        else:
            max_engagement = max(
                (h.views_count or 0) + ((h.likes_count or 0) * 2) 
                for h in self.housings
            )
            
            if max_engagement == 0:
                popularity_score = 0.5
            else:
                engagement = (housing.views_count or 0) + ((housing.likes_count or 0) * 2)
                popularity_score = min(1.0, engagement / max_engagement)
        
        # 4. Préférence utilisateur (15%)
        try:
            interaction = UserInteraction.objects.get(
                user=self.user,
                housing=housing
            )
            preference_score = 0.3  # Base
            if interaction.viewed:
                preference_score += 0.2
            if interaction.liked:
                preference_score += 0.3
            if interaction.saved:
                preference_score += 0.2
            preference_score = min(1.0, preference_score)
        except UserInteraction.DoesNotExist:
            # Vérifier si l'utilisateur aime cette catégorie
            same_category_interactions = UserInteraction.objects.filter(
                user=self.user,
                housing__category=housing.category
            ).count()
            preference_score = min(0.7, same_category_interactions * 0.1)
        
        # 5. Récence (10%)
        days = housing.days_since_published
        recency_score = max(0, 1 - (days / 30))  # 30 jours = score 0
        
        # Calcul final avec pondération
        fitness = (
            0.30 * price_score +
            0.25 * proximity_score +
            0.20 * popularity_score +
            0.15 * preference_score +
            0.10 * recency_score
        )
        
        return fitness
    
    @staticmethod
    def haversine_distance(lat1, lon1, lat2, lon2):
        """Calcule la distance en km entre deux points GPS"""
        R = 6371  # Rayon de la Terre en km
        
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
        """Sélectionne les meilleurs logements (élites)"""
        if not scored_population:
            return []
        
        sorted_population = sorted(scored_population, key=lambda x: x[1], reverse=True)
        return [h for h, score in sorted_population[:self.elite_size]]
    
    def crossover(self, elites):
        """
        Croisement génétique
        Combine les caractéristiques des meilleurs logements
        """
        if not elites or len(self.housings) <= self.elite_size:
            return []
        
        children = []
        for _ in range(len(self.housings) - self.elite_size):
            parent1 = random.choice(elites)
            parent2 = random.choice(elites)
            children.append(random.choice([parent1, parent2]))
        return children
    
    def mutate(self, population):
        """
        Mutation génétique
        Introduit de la diversité en ajoutant des logements aléatoires
        """
        if not population or not self.housings:
            return population
        
        for i in range(len(population)):
            if random.random() < self.mutation_rate:
                population[i] = random.choice(self.housings)
        return population
    
    def run(self):
        """
        Exécute l'algorithme génétique
        Retourne les logements classés par pertinence
        """
        # ✅ CORRECTION : Gérer le cas où il n'y a pas de logements
        if not self.housings:
            return []
        
        population = self.housings.copy()
        
        for generation in range(self.generations):
            # Évaluation
            scored = [(h, self.calculate_fitness(h)) for h in population]
            
            # Sélection des élites
            elites = self.select_elites(scored)
            
            # Si pas assez d'élites, retourner directement
            if len(elites) < 2:
                final_scored = [(h, self.calculate_fitness(h)) for h in population]
                sorted_housings = sorted(final_scored, key=lambda x: x[1], reverse=True)
                return [h for h, score in sorted_housings]
            
            # Croisement
            children = self.crossover(elites)
            
            # Mutation
            mutated = self.mutate(children)
            
            # Nouvelle génération
            population = elites + mutated
        
        # Tri final par fitness
        final_scored = [(h, self.calculate_fitness(h)) for h in population]
        sorted_housings = sorted(final_scored, key=lambda x: x[1], reverse=True)
        
        return [h for h, score in sorted_housings]


def apply_genetic_algorithm(user, housings_queryset):
    """
    Fonction utilitaire pour appliquer l'algorithme génétique
    
    Usage:
        housings = Housing.objects.filter(status='disponible', is_visible=True)
        ranked_housings = apply_genetic_algorithm(user, housings)
    """
    # ✅ CORRECTION : Vérifier que le queryset n'est pas vide
    if not housings_queryset or not housings_queryset.exists():
        return []
    
    ga = GeneticAlgorithm(user, housings_queryset)
    return ga.run()
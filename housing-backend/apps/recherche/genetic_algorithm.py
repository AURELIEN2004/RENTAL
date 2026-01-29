# ============================================
# 📁 apps/recherche/genetic_algorithm.py
# ============================================

import random
import math
from typing import List, Dict, Tuple
from django.db.models import Q
from apps.housing.models import Housing


class GeneticSearchOptimizer:
    """
    Algorithme génétique pour optimiser les résultats de recherche
    en fonction des préférences utilisateur
    """
    
    def __init__(
        self,
        population_size: int = 50,
        generations: int = 30,
        mutation_rate: float = 0.1,
        crossover_rate: float = 0.7
    ):
        self.population_size = population_size
        self.generations = generations
        self.mutation_rate = mutation_rate
        self.crossover_rate = crossover_rate
    
    def optimize(
        self,
        initial_results: List[Housing],
        user_preferences: Dict,
        search_criteria: Dict
    ) -> List[Housing]:
        """
        Optimise les résultats de recherche
        
        Args:
            initial_results: Liste initiale de logements
            user_preferences: Préférences utilisateur (poids des critères)
            search_criteria: Critères de recherche
        
        Returns:
            Liste optimisée de logements
        """
        if len(initial_results) <= 10:
            return initial_results
        
        # Initialiser la population
        population = self._initialize_population(initial_results)
        
        # Évolution sur plusieurs générations
        for generation in range(self.generations):
            # Calculer le fitness de chaque individu
            fitness_scores = [
                self._calculate_fitness(individual, user_preferences, search_criteria)
                for individual in population
            ]
            
            # Sélection des meilleurs individus
            selected = self._selection(population, fitness_scores)
            
            # Crossover (croisement)
            offspring = self._crossover(selected)
            
            # Mutation
            offspring = self._mutation(offspring, initial_results)
            
            # Nouvelle population
            population = offspring
        
        # Retourner la meilleure solution
        fitness_scores = [
            self._calculate_fitness(individual, user_preferences, search_criteria)
            for individual in population
        ]
        best_index = fitness_scores.index(max(fitness_scores))
        best_solution = population[best_index]
        
        return [initial_results[i] for i in best_solution]
    
    def _initialize_population(self, results: List[Housing]) -> List[List[int]]:
        """Crée une population initiale de solutions"""
        population = []
        result_indices = list(range(len(results)))
        
        for _ in range(self.population_size):
            # Créer un ordre aléatoire des résultats
            individual = random.sample(result_indices, len(result_indices))
            population.append(individual)
        
        return population
    
    def _calculate_fitness(
        self,
        individual: List[int],
        user_preferences: Dict,
        search_criteria: Dict
    ) -> float:
        """
        Calcule le score de fitness d'un individu
        
        Plus le score est élevé, meilleure est la solution
        """
        score = 0.0
        
        # Bonus pour les résultats en début de liste (décroissance exponentielle)
        for position, _ in enumerate(individual[:20]):  # Top 20 seulement
            position_bonus = math.exp(-position / 5)  # Décroissance exponentielle
            score += position_bonus
        
        # Bonus pour la diversité (éviter trop de logements similaires en haut)
        diversity_score = self._calculate_diversity(individual[:10])
        score += diversity_score * user_preferences.get('diversity_weight', 0.2)
        
        return score
    
    def _calculate_diversity(self, top_results: List[int]) -> float:
        """Calcule le score de diversité des résultats"""
        # Plus il y a de variation dans les types, catégories, prix, etc., mieux c'est
        # Pour simplifier, on retourne un score basé sur la longueur
        unique_positions = len(set(top_results))
        return unique_positions / len(top_results) if top_results else 0
    
    def _selection(
        self,
        population: List[List[int]],
        fitness_scores: List[float]
    ) -> List[List[int]]:
        """Sélection par tournoi"""
        selected = []
        tournament_size = 5
        
        for _ in range(self.population_size):
            # Sélectionner aléatoirement tournament_size individus
            tournament_indices = random.sample(range(len(population)), tournament_size)
            tournament_fitness = [fitness_scores[i] for i in tournament_indices]
            
            # Sélectionner le meilleur
            winner_index = tournament_indices[tournament_fitness.index(max(tournament_fitness))]
            selected.append(population[winner_index].copy())
        
        return selected
    
    def _crossover(self, population: List[List[int]]) -> List[List[int]]:
        """Croisement par ordre (Order Crossover - OX)"""
        offspring = []
        
        for i in range(0, len(population), 2):
            parent1 = population[i]
            parent2 = population[i + 1] if i + 1 < len(population) else population[0]
            
            if random.random() < self.crossover_rate:
                child1, child2 = self._order_crossover(parent1, parent2)
                offspring.extend([child1, child2])
            else:
                offspring.extend([parent1.copy(), parent2.copy()])
        
        return offspring[:self.population_size]
    
    def _order_crossover(
        self,
        parent1: List[int],
        parent2: List[int]
    ) -> Tuple[List[int], List[int]]:
        """Opérateur de croisement par ordre"""
        size = len(parent1)
        
        # Choisir deux points de croisement
        cx_point1, cx_point2 = sorted(random.sample(range(size), 2))
        
        # Créer les enfants
        child1 = [-1] * size
        child2 = [-1] * size
        
        # Copier la section entre les points de croisement
        child1[cx_point1:cx_point2] = parent1[cx_point1:cx_point2]
        child2[cx_point1:cx_point2] = parent2[cx_point1:cx_point2]
        
        # Remplir le reste en respectant l'ordre du parent opposé
        self._fill_remaining(child1, parent2, cx_point2)
        self._fill_remaining(child2, parent1, cx_point2)
        
        return child1, child2
    
    def _fill_remaining(self, child: List[int], parent: List[int], start_pos: int):
        """Remplit les positions restantes d'un enfant"""
        size = len(child)
        parent_index = start_pos
        child_index = start_pos
        
        while -1 in child:
            if parent[parent_index % size] not in child:
                child[child_index % size] = parent[parent_index % size]
                child_index += 1
            parent_index += 1
    
    def _mutation(
        self,
        population: List[List[int]],
        original_results: List[Housing]
    ) -> List[List[int]]:
        """Mutation par échange (Swap Mutation)"""
        for individual in population:
            if random.random() < self.mutation_rate:
                # Échanger deux positions aléatoires
                pos1, pos2 = random.sample(range(len(individual)), 2)
                individual[pos1], individual[pos2] = individual[pos2], individual[pos1]
        
        return population


def calculate_housing_score(
    housing: Housing,
    user_preferences: Dict,
    search_criteria: Dict
) -> float:
    """
    Calcule un score pour un logement basé sur les préférences
    
    Args:
        housing: Instance de Housing
        user_preferences: Dictionnaire des préférences (poids)
        search_criteria: Critères de recherche
    
    Returns:
        Score entre 0 et 1
    """
    score = 0.0
    
    # Score basé sur le prix
    price_weight = user_preferences.get('price_weight', 0.3)
    if search_criteria.get('min_price') and search_criteria.get('max_price'):
        target_price = (search_criteria['min_price'] + search_criteria['max_price']) / 2
        price_diff = abs(housing.price - target_price)
        max_diff = search_criteria['max_price'] - search_criteria['min_price']
        price_score = 1 - (price_diff / max_diff) if max_diff > 0 else 1
        score += price_score * price_weight
    
    # Score basé sur la localisation
    location_weight = user_preferences.get('location_weight', 0.25)
    if search_criteria.get('preferred_cities'):
        if housing.city.id in search_criteria['preferred_cities']:
            score += location_weight
    
    # Score basé sur la taille
    size_weight = user_preferences.get('size_weight', 0.2)
    if search_criteria.get('min_area'):
        if housing.area >= search_criteria['min_area']:
            score += size_weight
    
    # Score basé sur les équipements
    amenities_weight = user_preferences.get('amenities_weight', 0.15)
    if housing.additional_features:
        # Plus il y a d'équipements, mieux c'est
        features_list = housing.additional_features.split(',') if isinstance(housing.additional_features, str) else []
        amenities_score = min(len(features_list) / 10, 1)  # Normaliser sur 10 équipements max
        score += amenities_score * amenities_weight
    
    # Score de proximité (si applicable)
    proximity_weight = user_preferences.get('proximity_weight', 0.1)
    # TODO: Implémenter le calcul de proximité avec les lieux importants
    
    # Score basé sur les interactions (vues, likes)
    popularity_score = (housing.likes_count / 100) * 0.1  # Bonus jusqu'à 10%
    score += min(popularity_score, 0.1)
    
    return min(score, 1.0)  # S'assurer que le score est entre 0 et 1
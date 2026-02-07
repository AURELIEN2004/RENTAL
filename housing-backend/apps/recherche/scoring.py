# ============================================
# 📁 apps/recherche/scoring.py
# ============================================
"""
Algorithmes de scoring pour la recherche intelligente
Adapté au modèle Housing avec area, rooms, bathrooms, status
"""


def compute_score(housing, criteria):
    """
    Calcule un score de pertinence basé sur les critères de recherche
    
    Args:
        housing: Instance de Housing
        criteria: Dict avec les critères de recherche
            - city (str): Nom de la ville
            - category (int): ID de catégorie
            - max_price (int): Budget maximum
            - min_rooms (int): Nombre de chambres minimum
            - furnished (bool): Meublé ou non
    
    Returns:
        int: Score de 0 à 100
    """
    score = 0

    # 🏙️ VILLE (30 points)
    if criteria.get("city"):
        if housing.city and housing.city.name.lower() == criteria["city"].lower():
            score += 30
        elif housing.city and criteria["city"].lower() in housing.city.name.lower():
            score += 15

    # 🏠 CATÉGORIE (20 points)
    if criteria.get("category"):
        try:
            category_id = int(criteria["category"])
            if housing.category_id == category_id:
                score += 20
        except (ValueError, TypeError):
            pass

    # 💰 BUDGET (20 points)
    if criteria.get("max_price"):
        try:
            max_price = int(criteria["max_price"])
            if housing.price <= max_price:
                score += 20
            elif housing.price <= max_price * 1.1:  # 10% de tolérance
                score += 12
            elif housing.price <= max_price * 1.2:  # 20% de tolérance
                score += 5
        except (ValueError, TypeError):
            pass

    # 🛏️ CHAMBRES (10 points)
    if criteria.get("min_rooms"):
        try:
            min_rooms = int(criteria["min_rooms"])
            if housing.rooms >= min_rooms:
                score += 10
                # Bonus si correspond exactement
                if housing.rooms == min_rooms:
                    score += 5
        except (ValueError, TypeError):
            pass

    # 🪑 MEUBLÉ (10 points) - Adaptation pour housing_type
    if criteria.get("furnished") is not None:
        # Vérifier si le type contient "meublé" ou "moderne"
        if housing.housing_type:
            type_name = housing.housing_type.name.lower()
            if criteria["furnished"] and "meublé" in type_name:
                score += 10
            elif not criteria["furnished"] and "simple" in type_name:
                score += 10

    # ✅ STATUT DISPONIBLE (10 points)
    if housing.status == 'disponible':
        score += 10

    return min(score, 100)  # Plafonner à 100


def score_distance(distance_km):
    """
    Score basé sur la distance géographique
    
    Args:
        distance_km: Distance en kilomètres
    
    Returns:
        int: Score de 0 à 25
    """
    if distance_km <= 1:
        return 25
    elif distance_km <= 2:
        return 20
    elif distance_km <= 3:
        return 15
    elif distance_km <= 5:
        return 10
    elif distance_km <= 10:
        return 5
    return 0


def score_price_range(housing_price, budget_max, budget_min=0):
    """
    Score basé sur l'adéquation au budget
    
    Args:
        housing_price: Prix du logement
        budget_max: Budget maximum
        budget_min: Budget minimum (optionnel)
    
    Returns:
        int: Score de 0 à 20
    """
    if budget_min and housing_price < budget_min:
        return 0
    
    if housing_price <= budget_max:
        # Plus le prix est proche du budget max, meilleur le score
        ratio = housing_price / budget_max
        if ratio >= 0.9:  # 90-100% du budget
            return 20
        elif ratio >= 0.7:  # 70-90%
            return 15
        else:  # < 70%
            return 10
    elif housing_price <= budget_max * 1.1:  # 10% au-dessus
        return 8
    elif housing_price <= budget_max * 1.2:  # 20% au-dessus
        return 3
    
    return 0


def score_area_match(housing_area, desired_area=None, tolerance=20):
    """
    Score basé sur la superficie
    
    Args:
        housing_area: Superficie du logement
        desired_area: Superficie souhaitée (optionnel)
        tolerance: Tolérance en % (par défaut 20%)
    
    Returns:
        int: Score de 0 à 10
    """
    if not desired_area:
        return 5  # Score neutre
    
    diff = abs(housing_area - desired_area)
    tolerance_value = desired_area * (tolerance / 100)
    
    if diff <= tolerance_value:
        return 10
    elif diff <= tolerance_value * 2:
        return 5
    
    return 0


def compute_smart_score(housing, criteria, distance=None):
    """
    Score intelligent combinant tous les facteurs
    
    Args:
        housing: Instance Housing
        criteria: Critères de recherche
        distance: Distance en km (optionnel)
    
    Returns:
        int: Score total de 0 à 150
    """
    score = 0
    
    # Score de base (critères)
    score += compute_score(housing, criteria)
    
    # Score de distance
    if distance is not None:
        score += score_distance(distance)
    
    # Score budget affiné
    if criteria.get("max_price"):
        budget_min = criteria.get("min_price", 0)
        score += score_price_range(
            housing.price,
            int(criteria["max_price"]),
            int(budget_min) if budget_min else 0
        )
    
    # Score superficie
    if criteria.get("area"):
        score += score_area_match(housing.area, int(criteria["area"]))
    
    # Bonus pour logements populaires
    if housing.views_count > 50:
        score += 5
    if housing.likes_count > 10:
        score += 5
    
    # Bonus pour logements récents
    if housing.days_since_published <= 7:
        score += 5
    
    return score
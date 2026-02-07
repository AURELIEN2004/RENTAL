# ============================================
# 📁 apps/recherche/scoring.py
# ============================================

from .utils import haversine


def compute_score(housing, criteria):
    """
    Calcule un score de pertinence pour un logement basé sur les critères
    
    Args:
        housing: Instance de Housing
        criteria: Dictionnaire de critères de recherche
        
    Returns:
        Score total (0-100)
    """
    score = 0

    # 1. Ville (30 points)
    if criteria.get("city"):
        if housing.city and housing.city.name.lower() == criteria["city"].lower():
            score += 30

    # 2. Type de logement (20 points)
    if criteria.get("category"):
        if housing.category and housing.category.name.lower() == criteria["category"].lower():
            score += 20

    # 3. Budget (15 points)
    if criteria.get("max_price"):
        price = housing.price
        max_price = criteria["max_price"]
        if price <= max_price:
            score += 15
        elif price <= max_price * 1.1:  # 10% de marge
            score += 8

    # 4. Disponibilité (10 points)
    if housing.status == 'disponible' and housing.is_visible:
        score += 10

    # 5. Nombre de chambres (10 points)
    if criteria.get("rooms"):
        if housing.rooms == criteria["rooms"]:
            score += 10
        elif abs(housing.rooms - criteria["rooms"]) == 1:
            score += 5

    # 6. Superficie (5 points)
    if criteria.get("min_area"):
        if housing.area >= criteria["min_area"]:
            score += 5

    return score


def score_distance(distance_km):
    """
    Calcule un score basé sur la distance géographique
    
    Args:
        distance_km: Distance en kilomètres
        
    Returns:
        Score de proximité (0-25 points)
    """
    if distance_km <= 1:
        return 25
    elif distance_km <= 3:
        return 15
    elif distance_km <= 5:
        return 5
    return 0


def preference_bonus(housing, prefs):
    """
    Calcule un bonus basé sur les préférences utilisateur
    
    Args:
        housing: Instance de Housing
        prefs: Instance de UserPreference
        
    Returns:
        Score bonus (0-35 points)
    """
    score = 0

    # Ville préférée (15 points)
    if prefs.preferred_city and housing.city_id == prefs.preferred_city_id:
        score += 15

    # Budget maximum (10 points)
    if prefs.max_budget and housing.price <= prefs.max_budget:
        score += 10

    # Catégories préférées (10 points)
    if prefs.preferred_categories.filter(id=housing.category_id).exists():
        score += 10

    return score
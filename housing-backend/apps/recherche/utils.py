# ============================================
# 📁 apps/recherche/utils.py
# ============================================
"""
Utilitaires pour le module de recherche
"""

import math


def haversine(lat1, lon1, lat2, lon2):
    """
    Calcule la distance entre deux points GPS en kilomètres
    Formule de Haversine
    
    Args:
        lat1, lon1: Coordonnées du point 1
        lat2, lon2: Coordonnées du point 2
    
    Returns:
        float: Distance en kilomètres
    """
    R = 6371  # Rayon de la Terre en km
    
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (
        math.sin(delta_phi / 2) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2) ** 2
    )
    
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    
    return R * c


def validate_coordinates(lat, lng):
    """
    Valide des coordonnées GPS
    
    Args:
        lat: Latitude
        lng: Longitude
    
    Returns:
        bool: True si valide
    """
    try:
        lat = float(lat)
        lng = float(lng)
        return -90 <= lat <= 90 and -180 <= lng <= 180
    except (TypeError, ValueError):
        return False


def get_distance_category(distance_km):
    """
    Catégorise une distance
    
    Args:
        distance_km: Distance en km
    
    Returns:
        str: Catégorie ('très proche', 'proche', 'moyen', 'loin')
    """
    if distance_km <= 1:
        return 'très proche'
    elif distance_km <= 3:
        return 'proche'
    elif distance_km <= 5:
        return 'moyen'
    else:
        return 'loin'
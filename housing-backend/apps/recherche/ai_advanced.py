# ============================================
# 📁 apps/recherche/ai_advanced.py
# ============================================

import os
import re
import json
from django.conf import settings
from django.db.models import Q

# Configuration OpenAI (optionnelle)
try:
    import openai
    openai.api_key = getattr(settings, 'OPENAI_API_KEY', None)
    OPENAI_AVAILABLE = bool(openai.api_key)
except ImportError:
    OPENAI_AVAILABLE = False


def extract_filters_advanced(message, conversation_history=None):
    """
    Extraction avancée de filtres avec compréhension du contexte conversationnel.
    
    Args:
        message: Message utilisateur
        conversation_history: Historique de conversation (optionnel)
        
    Returns:
        Dictionnaire avec filtres, type de recherche et réponse
    """
    
    # Tentative avec OpenAI si disponible
    if OPENAI_AVAILABLE:
        try:
            result = extract_with_openai(message, conversation_history)
            if result:
                return result
        except Exception as e:
            print(f"⚠️ Erreur OpenAI : {e}")
    
    # Fallback : extraction par règles
    return extract_with_rules(message)


def extract_with_openai(message, conversation_history=None):
    """
    Extraction de filtres en utilisant OpenAI GPT
    
    Args:
        message: Message utilisateur
        conversation_history: Historique (optionnel)
        
    Returns:
        Dictionnaire de filtres ou None
    """
    try:
        # Construction du contexte
        context = ""
        if conversation_history:
            for item in conversation_history[-3:]:  # 3 derniers échanges
                context += f"User: {item['user']}\nAssistant: {item['assistant']}\n"
        
        # Prompt pour extraction structurée
        prompt = f"""
Tu es un assistant de recherche de logements au Cameroun.
Extrais les filtres de recherche du message suivant et retourne un JSON.

Contexte précédent:
{context}

Message actuel: {message}

Retourne un JSON avec cette structure (sans texte avant ou après):
{{
  "filters": {{
    "category": "studio|appartement|chambre|maison|bureau ou null",
    "city": "yaoundé|douala|etc ou null",
    "district": "bastos|akwa|etc ou null",
    "max_price": nombre ou null,
    "min_price": nombre ou null,
    "rooms": nombre ou null,
    "furnished": true|false ou null
  }},
  "search_type": "standard|proximity|features",
  "proximity_search": {{
    "landmark": "nom du lieu" ou null,
    "max_distance": 2
  }},
  "features_keywords": ["parking", "sécurité", etc],
  "response_text": "message de réponse naturel"
}}
"""
        
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "Tu es un expert en extraction de critères de recherche de logements."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=500
        )
        
        content = response.choices[0].message.content.strip()
        
        # Nettoyer le JSON si nécessaire
        content = re.sub(r'^```json\s*', '', content)
        content = re.sub(r'\s*```$', '', content)
        
        result = json.loads(content)
        return result
        
    except Exception as e:
        print(f"❌ Erreur extraction OpenAI: {e}")
        return None


def extract_with_rules(message):
    """
    Extraction par règles regex (fallback sans OpenAI).
    VERSION AMÉLIORÉE avec meilleure détection.
    
    Args:
        message: Message utilisateur
        
    Returns:
        Dictionnaire de filtres
    """
    
    message_lower = message.lower()
    
    result = {
        "filters": {},
        "search_type": "standard",
        "proximity_search": None,
        "features_keywords": [],
        "response_text": f"Je recherche des logements selon vos critères..."
    }
    
    # ============================================
    # 1. DÉTECTION DE PROXIMITÉ
    # ============================================
    
    # Patterns pour détecter la proximité
    proximity_indicators = [
        r'(?:près|proche|prox|autour|à côté|aux alentours|à proximité)\s+(?:de\s+|du\s+|de\s+la\s+|de\s+l\'|d\')?',
        r'(?:vers|dans le secteur de|dans la zone de|du côté de)\s+',
    ]
    
    # Chercher si c'est une recherche de proximité
    is_proximity_search = False
    landmark = None
    
    for pattern in proximity_indicators:
        match = re.search(pattern, message_lower)
        if match:
            is_proximity_search = True
            # Extraire ce qui suit le pattern
            after_pattern = message_lower[match.end():]
            
            # Extraire le landmark
            landmark_match = re.match(r'([^,\.!\?]+?)(?:\s+(?:à|en|dans|de|avec|moins|max)|,|\.|\?|!|$)', after_pattern)
            if landmark_match:
                landmark = landmark_match.group(1).strip()
                
                # Nettoyer le landmark (enlever les articles)
                landmark = re.sub(r'^(?:le|la|les|l\'|un|une|des)\s+', '', landmark)
                
                result["search_type"] = "proximity"
                result["proximity_search"] = {
                    "landmark": landmark,
                    "max_distance": 2
                }
                result["response_text"] = f"Je recherche des logements près de {landmark}..."
                break
    
    # Si pas de pattern explicite, chercher des mots-clés de lieux
    if not is_proximity_search:
        places_keywords = {
            "université": ["université", "fac", "faculté", "campus", "uy1", "uy2"],
            "école": ["école", "lycée", "collège", "établissement scolaire"],
            "marché": ["marché", "market"],
            "supermarché": ["supermarché", "super marché", "supermarket"],
            "hôpital": ["hôpital", "clinique", "centre de santé"],
            "transport": ["gare", "arrêt", "station", "taxi"],
            "commerce": ["centre commercial", "boutique", "magasin"],
        }
        
        for place_type, keywords in places_keywords.items():
            for keyword in keywords:
                if keyword in message_lower:
                    result["search_type"] = "proximity"
                    result["proximity_search"] = {
                        "landmark": keyword,
                        "max_distance": 2
                    }
                    result["response_text"] = f"Je recherche des logements près de {keyword}..."
                    is_proximity_search = True
                    break
            if is_proximity_search:
                break
    
    # ============================================
    # 2. DÉTECTION DE CARACTÉRISTIQUES
    # ============================================
    
    features_keywords_map = {
        "parking": ["parking", "garage", "stationnement"],
        "sécurité": ["sécurité", "gardien", "gardiennage", "surveillance", "sécurisé"],
        "jardin": ["jardin", "espace vert", "cour"],
        "piscine": ["piscine", "swimming pool"],
        "climatisation": ["climatisation", "climatisé", "clim", "air conditionné"],
        "cuisine": ["cuisine équipée", "cuisine aménagée"],
        "eau": ["eau courante", "eau potable", "citerne"],
        "électricité": ["électricité", "générateur", "groupe électrogène"],
        "internet": ["internet", "wifi", "fibre"],
    }
    
    detected_features = []
    for feature, keywords in features_keywords_map.items():
        if any(kw in message_lower for kw in keywords):
            detected_features.append(feature)
    
    if detected_features and not is_proximity_search:
        result["search_type"] = "features"
        result["features_keywords"] = detected_features
        features_text = ", ".join(detected_features)
        result["response_text"] = f"Je recherche des logements avec {features_text}..."
    elif detected_features and is_proximity_search:
        # Les deux : proximité ET caractéristiques
        result["features_keywords"] = detected_features
    
    # ============================================
    # 3. FILTRES CLASSIQUES
    # ============================================
    
    # Catégories
    categories = {
        "studio": ["studio", "t1", "f1"],
        "appartement": ["appartement", "appart", "t2", "t3", "f2", "f3"],
        "chambre": ["chambre", "chamber"],
        "maison": ["maison", "villa"],
        "bureau": ["bureau", "office"],
    }
    
    for category, keywords in categories.items():
        if any(kw in message_lower for kw in keywords):
            result["filters"]["category"] = category
            break
    
    # Villes camerounaises
    cities = ["yaoundé", "douala", "bafoussam", "garoua", "maroua", "ngaoundéré", 
              "bamenda", "bertoua", "ebolowa", "kribi", "limbe", "buea"]
    
    for city in cities:
        if city in message_lower:
            result["filters"]["city"] = city.capitalize()
            break
    
    # Quartiers populaires
    districts = {
        "yaoundé": ["bastos", "mvan", "nlongkak", "omnisport", "essos", "mokolo", "tsinga", "emana"],
        "douala": ["akwa", "bonanjo", "bonabéri", "bonapriso", "deido", "new bell"]
    }
    
    for city_name, district_list in districts.items():
        for district in district_list:
            if district in message_lower:
                result["filters"]["district"] = district.capitalize()
                break
    
    # Prix
    price_patterns = [
        r'moins\s+de\s+(\d+)',
        r'max(?:imum)?\s+(\d+)',
        r'jusqu[\'à]\s+(\d+)',
        r'(?:maximum|max)\s+de\s+(\d+)',
    ]
    
    for pattern in price_patterns:
        match = re.search(pattern, message_lower)
        if match:
            price = int(match.group(1))
            # Si le prix est < 1000, on suppose que c'est en milliers
            if price < 1000:
                price *= 1000
            result["filters"]["max_price"] = price
            break
    
    # Nombre de chambres
    bedrooms_match = re.search(r'(\d+)\s*(?:chambre|bedroom|ch)', message_lower)
    if bedrooms_match:
        result["filters"]["rooms"] = int(bedrooms_match.group(1))
    
    # Meublé
    if any(word in message_lower for word in ["meublé", "meuble", "équipé", "equipé"]):
        result["filters"]["furnished"] = True
    elif any(word in message_lower for word in ["non meublé", "vide", "non équipé"]):
        result["filters"]["furnished"] = False
    
    return result


def search_with_advanced_filters(filters_data):
    """
    Recherche intelligente avec scoring et filtres avancés
    
    Args:
        filters_data: Dictionnaire de filtres extraits
        
    Returns:
        QuerySet de Housing trié par pertinence
    """
    from apps.housing.models import Housing
    from .scoring import compute_score, score_distance
    from .utils import haversine
    
    # Base de la requête
    qs = Housing.objects.filter(
        is_visible=True,
        status='disponible'
    ).select_related(
        'owner', 'category', 'housing_type', 'region', 'city', 'district'
    ).prefetch_related('images')
    
    filters = filters_data.get("filters", {})
    search_type = filters_data.get("search_type", "standard")
    
    # ============================================
    # RECHERCHE PAR PROXIMITÉ
    # ============================================
    if search_type == "proximity":
        proximity = filters_data.get("proximity_search")
        if proximity and proximity.get("landmark"):
            landmark = proximity["landmark"]
            
            # Rechercher dans additional_features, description, district
            qs = qs.filter(
                Q(additional_features__icontains=landmark) |
                Q(description__icontains=landmark) |
                Q(district__name__icontains=landmark)
            )
    
    # ============================================
    # RECHERCHE PAR CARACTÉRISTIQUES
    # ============================================
    if search_type == "features":
        features = filters_data.get("features_keywords", [])
        if features:
            # Construire une query OR pour chaque caractéristique
            q_objects = Q()
            for feature in features:
                q_objects |= Q(additional_features__icontains=feature)
            
            qs = qs.filter(q_objects)
    
    # ============================================
    # FILTRES CLASSIQUES
    # ============================================
    
    # Catégorie
    if filters.get("category"):
        qs = qs.filter(category__name__iexact=filters["category"])
    
    # Ville
    if filters.get("city"):
        qs = qs.filter(city__name__iexact=filters["city"])
    
    # Quartier
    if filters.get("district"):
        qs = qs.filter(district__name__iexact=filters["district"])
    
    # Prix
    if filters.get("max_price"):
        qs = qs.filter(price__lte=filters["max_price"])
    if filters.get("min_price"):
        qs = qs.filter(price__gte=filters["min_price"])
    
    # Chambres
    if filters.get("rooms"):
        qs = qs.filter(rooms=filters["rooms"])
    
    # Meublé (si applicable via housing_type)
    if filters.get("furnished") is not None:
        if filters["furnished"]:
            qs = qs.filter(housing_type__name__icontains="meublé")
        else:
            qs = qs.exclude(housing_type__name__icontains="meublé")
    
    return qs


def generate_chatbot_response(filters_data, results_count):
    """
    Génère une réponse naturelle du chatbot
    
    Args:
        filters_data: Données de filtres
        results_count: Nombre de résultats
        
    Returns:
        Message de réponse
    """
    filters = filters_data.get("filters", {})
    search_type = filters_data.get("search_type", "standard")
    
    # Base de la réponse
    if results_count == 0:
        response = "😕 Désolé, je n'ai trouvé aucun logement correspondant exactement à vos critères."
        response += "\n\n💡 Suggestions :\n"
        response += "- Essayez d'augmenter votre budget\n"
        response += "- Élargissez la zone de recherche\n"
        response += "- Réduisez certains critères"
        
    elif results_count == 1:
        response = f"✨ J'ai trouvé 1 logement qui correspond parfaitement à vos critères !"
        
    elif results_count <= 5:
        response = f"✨ J'ai trouvé {results_count} logements intéressants pour vous !"
        
    else:
        response = f"🎯 J'ai trouvé {results_count} logements disponibles."
    
    # Ajouter les détails de la recherche
    if filters.get("city"):
        response += f"\n📍 Ville : {filters['city']}"
    
    if filters.get("category"):
        response += f"\n🏠 Type : {filters['category'].capitalize()}"
    
    if filters.get("max_price"):
        response += f"\n💰 Budget max : {filters['max_price']:,} FCFA"
    
    if search_type == "proximity":
        proximity = filters_data.get("proximity_search", {})
        landmark = proximity.get("landmark")
        if landmark:
            response += f"\n📌 Près de : {landmark}"
    
    return response
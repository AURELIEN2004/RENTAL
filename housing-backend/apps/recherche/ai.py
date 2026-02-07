# ============================================
# 📁 apps/recherche/ai.py
# ============================================
"""
Assistant IA pour recherche en langage naturel
Utilise OpenAI ou Ollama pour comprendre les requêtes utilisateur
"""

import json
import re
from django.conf import settings


def extract_search_criteria_simple(user_query):
    """
    Extraction simple de critères sans IA externe
    Utilise des patterns et mots-clés
    
    Args:
        user_query (str): Requête utilisateur en langage naturel
    
    Returns:
        dict: Critères de recherche structurés
    """
    query = user_query.lower().strip()
    criteria = {}
    
    # 🏙️ VILLES CAMEROUNAISES
    cities = [
        'yaoundé', 'yaounde', 'douala', 'bafoussam', 'garoua', 
        'maroua', 'bamenda', 'ngaoundéré', 'bertoua', 'buea',
        'limbé', 'kumba', 'nkongsamba', 'edéa', 'kribi'
    ]
    for city in cities:
        if city in query:
            criteria['city'] = city.capitalize()
            break
    
    # 🏠 CATÉGORIES
    if any(word in query for word in ['studio', 'studios']):
        criteria['category_name'] = 'Studio'
    elif any(word in query for word in ['chambre', 'chambres']):
        criteria['category_name'] = 'Chambre'
    elif any(word in query for word in ['appartement', 'appartements', 'appart']):
        criteria['category_name'] = 'Appartement'
    elif any(word in query for word in ['maison', 'villa']):
        criteria['category_name'] = 'Maison'
    
    # 💰 BUDGET (prix)
    price_patterns = [
        r'(\d+)\s*(?:k|mille)',  # 50k, 50 mille
        r'(\d+)\s*000',          # 50000
        r'moins\s+de\s+(\d+)',   # moins de 50000
        r'max\s+(\d+)',          # max 50000
        r'jusqu[\""]à\s+(\d+)',  # jusqu'à 50000
    ]
    
    for pattern in price_patterns:
        match = re.search(pattern, query)
        if match:
            price = int(match.group(1))
            # Convertir k en milliers
            if 'k' in pattern or 'mille' in pattern:
                price *= 1000
            criteria['max_price'] = price
            break
    
    # Fourchette de prix
    range_match = re.search(r'entre\s+(\d+)\s*(?:et|à|-)\s*(\d+)', query)
    if range_match:
        criteria['min_price'] = int(range_match.group(1)) * 1000
        criteria['max_price'] = int(range_match.group(2)) * 1000
    
    # 🛏️ CHAMBRES
    rooms_patterns = [
        r'(\d+)\s+chambre',
        r'(\d+)\s+pièce',
        r'(\d+)\s+bedroom',
    ]
    for pattern in rooms_patterns:
        match = re.search(pattern, query)
        if match:
            criteria['min_rooms'] = int(match.group(1))
            break
    
    # 📏 SURFACE
    area_match = re.search(r'(\d+)\s*m[²2]', query)
    if area_match:
        criteria['min_area'] = int(area_match.group(1))
    
    # 🪑 TYPE (meublé)
    if any(word in query for word in ['meublé', 'meuble', 'équipé', 'moderne']):
        criteria['furnished'] = True
    elif any(word in query for word in ['vide', 'simple', 'non meublé']):
        criteria['furnished'] = False
    
    # 📍 QUARTIERS POPULAIRES YAOUNDÉ
    districts_yaounde = {
        'bastos': 'Bastos',
        'essos': 'Essos',
        'mvan': 'Mvan',
        'ngousso': 'Ngousso',
        'messa': 'Messa',
        'ekounou': 'Ekounou',
        'odza': 'Odza',
        'nkolndongo': 'Nkolndongo',
        'emana': 'Emana',
        'etoudi': 'Etoudi'
    }
    for key, value in districts_yaounde.items():
        if key in query:
            criteria['district_name'] = value
            if not criteria.get('city'):
                criteria['city'] = 'Yaoundé'
            break
    
    # 🎯 Intentions spéciales
    if any(word in query for word in ['près', 'proche', 'autour', 'proximité']):
        criteria['intent'] = 'nearby'
    
    if any(word in query for word in ['urgent', 'rapidement', 'vite']):
        criteria['sort'] = 'recent'
    
    if any(word in query for word in ['pas cher', 'économique', 'abordable', 'budget']):
        criteria['sort'] = 'price_asc'
    
    if any(word in query for word in ['luxe', 'haut de gamme', 'standing']):
        criteria['sort'] = 'price_desc'
    
    # Ajouter la requête originale pour recherche textuelle
    criteria['query'] = user_query
    
    return criteria


def extract_search_criteria_openai(user_query):
    """
    Extraction avancée avec OpenAI
    Nécessite : OPENAI_API_KEY dans settings
    
    Args:
        user_query (str): Requête utilisateur
    
    Returns:
        dict: Critères extraits
    """
    try:
        import openai
        
        openai.api_key = getattr(settings, 'OPENAI_API_KEY', None)
        if not openai.api_key:
            return extract_search_criteria_simple(user_query)
        
        prompt = f"""
Analyse cette demande de recherche de logement au Cameroun et extrais les critères au format JSON.

Requête utilisateur: "{user_query}"

Retourne uniquement un JSON avec ces champs (omets les champs non mentionnés):
{{
  "city": "nom de ville",
  "category_name": "Studio|Chambre|Appartement|Maison",
  "min_price": nombre,
  "max_price": nombre,
  "min_rooms": nombre,
  "min_area": nombre,
  "furnished": true|false,
  "district_name": "nom quartier",
  "intent": "nearby|urgent|budget",
  "sort": "recent|price_asc|price_desc"
}}

Villes camerounaises: Yaoundé, Douala, Bafoussam, Garoua, etc.
Prix en FCFA (ex: 50000 = 50k).
"""
        
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "Tu es un assistant de recherche immobilière au Cameroun."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=300
        )
        
        result = response.choices[0].message.content.strip()
        
        # Nettoyer la réponse (parfois il y a du texte autour)
        json_match = re.search(r'\{.*\}', result, re.DOTALL)
        if json_match:
            result = json_match.group()
        
        criteria = json.loads(result)
        criteria['query'] = user_query
        
        return criteria
        
    except Exception as e:
        print(f"⚠️ Erreur OpenAI: {e}")
        return extract_search_criteria_simple(user_query)


def extract_search_criteria_ollama(user_query):
    """
    Extraction avec Ollama (LLM local)
    Nécessite : Ollama installé localement
    
    Args:
        user_query (str): Requête utilisateur
    
    Returns:
        dict: Critères extraits
    """
    try:
        import requests
        
        ollama_url = getattr(settings, 'OLLAMA_API_URL', 'http://localhost:11434')
        ollama_model = getattr(settings, 'OLLAMA_MODEL', 'mistral')
        
        prompt = f"""
Analyse cette demande de logement et extrais les critères au format JSON.

Demande: "{user_query}"

Retourne UNIQUEMENT un JSON valide avec ces champs (omets si non mentionné):
{{
  "city": "Yaoundé|Douala|...",
  "category_name": "Studio|Chambre|Appartement|Maison",
  "max_price": nombre_fcfa,
  "min_rooms": nombre,
  "furnished": true|false,
  "district_name": "quartier"
}}
"""
        
        response = requests.post(
            f"{ollama_url}/api/generate",
            json={
                "model": ollama_model,
                "prompt": prompt,
                "stream": False,
                "temperature": 0.1
            },
            timeout=10
        )
        
        if response.status_code == 200:
            result = response.json()['response']
            
            # Extraire JSON
            json_match = re.search(r'\{.*\}', result, re.DOTALL)
            if json_match:
                criteria = json.loads(json_match.group())
                criteria['query'] = user_query
                return criteria
        
        return extract_search_criteria_simple(user_query)
        
    except Exception as e:
        print(f"⚠️ Erreur Ollama: {e}")
        return extract_search_criteria_simple(user_query)


def extract_search_criteria(user_query, method='simple'):
    """
    Fonction principale d'extraction de critères
    
    Args:
        user_query (str): Requête utilisateur
        method (str): 'simple', 'openai', 'ollama'
    
    Returns:
        dict: Critères de recherche
    """
    if method == 'openai':
        return extract_search_criteria_openai(user_query)
    elif method == 'ollama':
        return extract_search_criteria_ollama(user_query)
    else:
        return extract_search_criteria_simple(user_query)


def generate_response(criteria, results_count):
    """
    Génère une réponse naturelle pour l'utilisateur
    
    Args:
        criteria (dict): Critères de recherche
        results_count (int): Nombre de résultats
    
    Returns:
        str: Réponse en langage naturel
    """
    if results_count == 0:
        return "Désolé, je n'ai trouvé aucun logement correspondant à vos critères. Voulez-vous élargir votre recherche ?"
    
    # Construction de la réponse
    response_parts = [f"J'ai trouvé {results_count} logement{'s' if results_count > 1 else ''}"]
    
    if criteria.get('city'):
        response_parts.append(f"à {criteria['city']}")
    
    if criteria.get('category_name'):
        response_parts.append(f"de type {criteria['category_name']}")
    
    if criteria.get('max_price'):
        price_formatted = f"{criteria['max_price']:,}".replace(',', ' ')
        response_parts.append(f"jusqu'à {price_formatted} FCFA/mois")
    
    if criteria.get('min_rooms'):
        response_parts.append(f"avec minimum {criteria['min_rooms']} chambre{'s' if criteria['min_rooms'] > 1 else ''}")
    
    response = " ".join(response_parts) + "."
    
    if results_count > 5:
        response += " Voici les meilleures options pour vous."
    
    return response


def suggest_alternatives(criteria):
    """
    Suggère des alternatives si peu de résultats
    
    Args:
        criteria (dict): Critères actuels
    
    Returns:
        list: Liste de suggestions
    """
    suggestions = []
    
    if criteria.get('max_price'):
        new_price = int(criteria['max_price'] * 1.2)
        suggestions.append({
            'text': f"Élargir le budget à {new_price:,} FCFA".replace(',', ' '),
            'criteria': {**criteria, 'max_price': new_price}
        })
    
    if criteria.get('min_rooms') and criteria['min_rooms'] > 1:
        suggestions.append({
            'text': f"Chercher avec {criteria['min_rooms'] - 1} chambre",
            'criteria': {**criteria, 'min_rooms': criteria['min_rooms'] - 1}
        })
    
    if criteria.get('district_name'):
        suggestions.append({
            'text': f"Élargir à toute la ville de {criteria.get('city', 'la ville')}",
            'criteria': {k: v for k, v in criteria.items() if k != 'district_name'}
        })
    
    return suggestions
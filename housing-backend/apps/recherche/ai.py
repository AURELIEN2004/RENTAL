# # # ============================================
# # # 📁 apps/recherche/ai.py
# # # ============================================
# # """
# # Assistant IA pour recherche en langage naturel
# # Utilise OpenAI ou Ollama pour comprendre les requêtes utilisateur
# # """

# # import json
# # import re
# # from django.conf import settings


# # def extract_search_criteria_simple(user_query):
# #     """
# #     Extraction simple de critères sans IA externe
# #     Utilise des patterns et mots-clés
    
# #     Args:
# #         user_query (str): Requête utilisateur en langage naturel
    
# #     Returns:
# #         dict: Critères de recherche structurés
# #     """
# #     query = user_query.lower().strip()
# #     criteria = {}
    
# #     # 🏙️ VILLES CAMEROUNAISES
# #     cities = [
# #         'yaoundé', 'yaounde', 'douala', 'bafoussam', 'garoua', 
# #         'maroua', 'bamenda', 'ngaoundéré', 'bertoua', 'buea',
# #         'limbé', 'kumba', 'nkongsamba', 'edéa', 'kribi'
# #     ]
# #     for city in cities:
# #         if city in query:
# #             criteria['city'] = city.capitalize()
# #             break
    
# #     # 🏠 CATÉGORIES
# #     if any(word in query for word in ['studio', 'studios']):
# #         criteria['category_name'] = 'Studio'
# #     elif any(word in query for word in ['chambre', 'chambres']):
# #         criteria['category_name'] = 'Chambre'
# #     elif any(word in query for word in ['appartement', 'appartements', 'appart']):
# #         criteria['category_name'] = 'Appartement'
# #     elif any(word in query for word in ['maison', 'villa']):
# #         criteria['category_name'] = 'Maison'
    
# #     # 💰 BUDGET (prix)
# #     price_patterns = [
# #         r'(\d+)\s*(?:k|mille)',  # 50k, 50 mille
# #         r'(\d+)\s*000',          # 50000
# #         r'moins\s+de\s+(\d+)',   # moins de 50000
# #         r'max\s+(\d+)',          # max 50000
# #         r'jusqu[\""]à\s+(\d+)',  # jusqu'à 50000
# #     ]
    
# #     for pattern in price_patterns:
# #         match = re.search(pattern, query)
# #         if match:
# #             price = int(match.group(1))
# #             # Convertir k en milliers
# #             if 'k' in pattern or 'mille' in pattern:
# #                 price *= 1000
# #             criteria['max_price'] = price
# #             break
    
# #     # Fourchette de prix
# #     range_match = re.search(r'entre\s+(\d+)\s*(?:et|à|-)\s*(\d+)', query)
# #     if range_match:
# #         criteria['min_price'] = int(range_match.group(1)) * 1000
# #         criteria['max_price'] = int(range_match.group(2)) * 1000
    
# #     # 🛏️ CHAMBRES
# #     rooms_patterns = [
# #         r'(\d+)\s+chambre',
# #         r'(\d+)\s+pièce',
# #         r'(\d+)\s+bedroom',
# #     ]
# #     for pattern in rooms_patterns:
# #         match = re.search(pattern, query)
# #         if match:
# #             criteria['min_rooms'] = int(match.group(1))
# #             break
    
# #     # 📏 SURFACE
# #     area_match = re.search(r'(\d+)\s*m[²2]', query)
# #     if area_match:
# #         criteria['min_area'] = int(area_match.group(1))
    
# #     # 🪑 TYPE (meublé)
# #     if any(word in query for word in ['meublé', 'meuble', 'équipé', 'moderne']):
# #         criteria['furnished'] = True
# #     elif any(word in query for word in ['vide', 'simple', 'non meublé']):
# #         criteria['furnished'] = False
    
# #     # 📍 QUARTIERS POPULAIRES YAOUNDÉ
# #     districts_yaounde = {
# #         'bastos': 'Bastos',
# #         'essos': 'Essos',
# #         'mvan': 'Mvan',
# #         'ngousso': 'Ngousso',
# #         'messa': 'Messa',
# #         'ekounou': 'Ekounou',
# #         'odza': 'Odza',
# #         'nkolndongo': 'Nkolndongo',
# #         'emana': 'Emana',
# #         'etoudi': 'Etoudi'
# #     }
# #     for key, value in districts_yaounde.items():
# #         if key in query:
# #             criteria['district_name'] = value
# #             if not criteria.get('city'):
# #                 criteria['city'] = 'Yaoundé'
# #             break
    
# #     # 🎯 Intentions spéciales
# #     if any(word in query for word in ['près', 'proche', 'autour', 'proximité']):
# #         criteria['intent'] = 'nearby'
    
# #     if any(word in query for word in ['urgent', 'rapidement', 'vite']):
# #         criteria['sort'] = 'recent'
    
# #     if any(word in query for word in ['pas cher', 'économique', 'abordable', 'budget']):
# #         criteria['sort'] = 'price_asc'
    
# #     if any(word in query for word in ['luxe', 'haut de gamme', 'standing']):
# #         criteria['sort'] = 'price_desc'
    
# #     # Ajouter la requête originale pour recherche textuelle
# #     criteria['query'] = user_query
    
# #     return criteria


# # def extract_search_criteria_openai(user_query):
# #     """
# #     Extraction avancée avec OpenAI
# #     Nécessite : OPENAI_API_KEY dans settings
    
# #     Args:
# #         user_query (str): Requête utilisateur
    
# #     Returns:
# #         dict: Critères extraits
# #     """
# #     try:
# #         import openai
        
# #         openai.api_key = getattr(settings, 'OPENAI_API_KEY', None)
# #         if not openai.api_key:
# #             return extract_search_criteria_simple(user_query)
        
# #         prompt = f"""
# # Analyse cette demande de recherche de logement au Cameroun et extrais les critères au format JSON.

# # Requête utilisateur: "{user_query}"

# # Retourne uniquement un JSON avec ces champs (omets les champs non mentionnés):
# # {{
# #   "city": "nom de ville",
# #   "category_name": "Studio|Chambre|Appartement|Maison",
# #   "min_price": nombre,
# #   "max_price": nombre,
# #   "min_rooms": nombre,
# #   "min_area": nombre,
# #   "furnished": true|false,
# #   "district_name": "nom quartier",
# #   "intent": "nearby|urgent|budget",
# #   "sort": "recent|price_asc|price_desc"
# # }}

# # Villes camerounaises: Yaoundé, Douala, Bafoussam, Garoua, etc.
# # Prix en FCFA (ex: 50000 = 50k).
# # """
        
# #         response = openai.ChatCompletion.create(
# #             model="gpt-3.5-turbo",
# #             messages=[
# #                 {"role": "system", "content": "Tu es un assistant de recherche immobilière au Cameroun."},
# #                 {"role": "user", "content": prompt}
# #             ],
# #             temperature=0.3,
# #             max_tokens=300
# #         )
        
# #         result = response.choices[0].message.content.strip()
        
# #         # Nettoyer la réponse (parfois il y a du texte autour)
# #         json_match = re.search(r'\{.*\}', result, re.DOTALL)
# #         if json_match:
# #             result = json_match.group()
        
# #         criteria = json.loads(result)
# #         criteria['query'] = user_query
        
# #         return criteria
        
# #     except Exception as e:
# #         print(f"⚠️ Erreur OpenAI: {e}")
# #         return extract_search_criteria_simple(user_query)


# # def extract_search_criteria_ollama(user_query):
# #     """
# #     Extraction avec Ollama (LLM local)
# #     Nécessite : Ollama installé localement
    
# #     Args:
# #         user_query (str): Requête utilisateur
    
# #     Returns:
# #         dict: Critères extraits
# #     """
# #     try:
# #         import requests
        
# #         ollama_url = getattr(settings, 'OLLAMA_API_URL', 'http://localhost:11434')
# #         ollama_model = getattr(settings, 'OLLAMA_MODEL', 'mistral')
        
# #         prompt = f"""
# # Analyse cette demande de logement et extrais les critères au format JSON.

# # Demande: "{user_query}"

# # Retourne UNIQUEMENT un JSON valide avec ces champs (omets si non mentionné):
# # {{
# #   "city": "Yaoundé|Douala|...",
# #   "category_name": "Studio|Chambre|Appartement|Maison",
# #   "max_price": nombre_fcfa,
# #   "min_rooms": nombre,
# #   "furnished": true|false,
# #   "district_name": "quartier"
# # }}
# # """
        
# #         response = requests.post(
# #             f"{ollama_url}/api/generate",
# #             json={
# #                 "model": ollama_model,
# #                 "prompt": prompt,
# #                 "stream": False,
# #                 "temperature": 0.1
# #             },
# #             timeout=10
# #         )
        
# #         if response.status_code == 200:
# #             result = response.json()['response']
            
# #             # Extraire JSON
# #             json_match = re.search(r'\{.*\}', result, re.DOTALL)
# #             if json_match:
# #                 criteria = json.loads(json_match.group())
# #                 criteria['query'] = user_query
# #                 return criteria
        
# #         return extract_search_criteria_simple(user_query)
        
# #     except Exception as e:
# #         print(f"⚠️ Erreur Ollama: {e}")
# #         return extract_search_criteria_simple(user_query)


# # def extract_search_criteria(user_query, method='simple'):
# #     """
# #     Fonction principale d'extraction de critères
    
# #     Args:
# #         user_query (str): Requête utilisateur
# #         method (str): 'simple', 'openai', 'ollama'
    
# #     Returns:
# #         dict: Critères de recherche
# #     """
# #     if method == 'openai':
# #         return extract_search_criteria_openai(user_query)
# #     elif method == 'ollama':
# #         return extract_search_criteria_ollama(user_query)
# #     else:
# #         return extract_search_criteria_simple(user_query)


# # def generate_response(criteria, results_count):
# #     """
# #     Génère une réponse naturelle pour l'utilisateur
    
# #     Args:
# #         criteria (dict): Critères de recherche
# #         results_count (int): Nombre de résultats
    
# #     Returns:
# #         str: Réponse en langage naturel
# #     """
# #     if results_count == 0:
# #         return "Désolé, je n'ai trouvé aucun logement correspondant à vos critères. Voulez-vous élargir votre recherche ?"
    
# #     # Construction de la réponse
# #     response_parts = [f"J'ai trouvé {results_count} logement{'s' if results_count > 1 else ''}"]
    
# #     if criteria.get('city'):
# #         response_parts.append(f"à {criteria['city']}")
    
# #     if criteria.get('category_name'):
# #         response_parts.append(f"de type {criteria['category_name']}")
    
# #     if criteria.get('max_price'):
# #         price_formatted = f"{criteria['max_price']:,}".replace(',', ' ')
# #         response_parts.append(f"jusqu'à {price_formatted} FCFA/mois")
    
# #     if criteria.get('min_rooms'):
# #         response_parts.append(f"avec minimum {criteria['min_rooms']} chambre{'s' if criteria['min_rooms'] > 1 else ''}")
    
# #     response = " ".join(response_parts) + "."
    
# #     if results_count > 5:
# #         response += " Voici les meilleures options pour vous."
    
# #     return response


# # def suggest_alternatives(criteria):
# #     """
# #     Suggère des alternatives si peu de résultats
    
# #     Args:
# #         criteria (dict): Critères actuels
    
# #     Returns:
# #         list: Liste de suggestions
# #     """
# #     suggestions = []
    
# #     if criteria.get('max_price'):
# #         new_price = int(criteria['max_price'] * 1.2)
# #         suggestions.append({
# #             'text': f"Élargir le budget à {new_price:,} FCFA".replace(',', ' '),
# #             'criteria': {**criteria, 'max_price': new_price}
# #         })
    
# #     if criteria.get('min_rooms') and criteria['min_rooms'] > 1:
# #         suggestions.append({
# #             'text': f"Chercher avec {criteria['min_rooms'] - 1} chambre",
# #             'criteria': {**criteria, 'min_rooms': criteria['min_rooms'] - 1}
# #         })
    
# #     if criteria.get('district_name'):
# #         suggestions.append({
# #             'text': f"Élargir à toute la ville de {criteria.get('city', 'la ville')}",
# #             'criteria': {k: v for k, v in criteria.items() if k != 'district_name'}
# #         })
    
# #     return suggestions

# # ============================================
# # 📁 apps/recherche/ai.py  — VERSION CORRIGÉE
# #
# # Bugs corrigés :
# #  - "50 000 FCFA" (avec espace) maintenant correctement parsé → 50000
# #  - "50k" → 50000 correctement
# #  - La clé 'query' ne contient plus la requête brute (évite les faux filtres)
# #    → elle contient uniquement les termes résiduels utiles pour la recherche texte
# #  - Meilleure détection des villes camerounaises (accents variés)
# # ============================================

# import re
# import json
# from django.conf import settings


# # ---------------------------------------------------------------------------
# # Dictionnaires de référence
# # ---------------------------------------------------------------------------

# CITIES_CAMEROON = {
#     'fr': {
#         'yaoundé': 'Yaoundé', 'yaounde': 'Yaoundé',
#         'douala': 'Douala', 'bafoussam': 'Bafoussam',
#         'garoua': 'Garoua', 'maroua': 'Maroua',
#         'bamenda': 'Bamenda', 'ngaoundéré': 'Ngaoundéré',
#         'ngaoundere': 'Ngaoundéré', 'bertoua': 'Bertoua',
#         'buea': 'Buea', 'limbé': 'Limbé', 'limbe': 'Limbé',
#         'kumba': 'Kumba', 'nkongsamba': 'Nkongsamba',
#         'edéa': 'Edéa', 'edea': 'Edéa', 'kribi': 'Kribi',
#     },
#     'en': {
#         'yaounde': 'Yaoundé', 'douala': 'Douala',
#         'bafoussam': 'Bafoussam', 'garoua': 'Garoua',
#         'maroua': 'Maroua', 'bamenda': 'Bamenda',
#         'buea': 'Buea', 'limbe': 'Limbé', 'kumba': 'Kumba',
#         'kribi': 'Kribi',
#     }
# }

# DISTRICTS_MAP = {
#     # Yaoundé
#     'bastos': ('Bastos', 'Yaoundé'),
#     'essos': ('Essos', 'Yaoundé'),
#     'mvan': ('Mvan', 'Yaoundé'),
#     'ngousso': ('Ngousso', 'Yaoundé'),
#     'messa': ('Messa', 'Yaoundé'),
#     'ekounou': ('Ekounou', 'Yaoundé'),
#     'odza': ('Odza', 'Yaoundé'),
#     'nkolndongo': ('Nkolndongo', 'Yaoundé'),
#     'emana': ('Emana', 'Yaoundé'),
#     'etoudi': ('Etoudi', 'Yaoundé'),
#     'mvog-mbi': ('Mvog-Mbi', 'Yaoundé'),
#     'nlongkak': ('Nlongkak', 'Yaoundé'),
#     'omnisport': ('Omnisport', 'Yaoundé'),
#     'biyem-assi': ('Biyem-Assi', 'Yaoundé'),
#     'mendong': ('Mendong', 'Yaoundé'),
#     'mokolo': ('Mokolo', 'Yaoundé'),
#     # Douala
#     'akwa': ('Akwa', 'Douala'),
#     'bonapriso': ('Bonapriso', 'Douala'),
#     'bonanjo': ('Bonanjo', 'Douala'),
#     'bali': ('Bali', 'Douala'),
#     'makepe': ('Makepe', 'Douala'),
#     'kotto': ('Kotto', 'Douala'),
#     'deïdo': ('Deïdo', 'Douala'),
#     'deido': ('Deïdo', 'Douala'),
#     'ndokotti': ('Ndokotti', 'Douala'),
#     'logbessou': ('Logbessou', 'Douala'),
# }

# CATEGORIES_FR = {
#     'studio': 'Studio', 'studios': 'Studio',
#     'chambre': 'Chambre', 'chambres': 'Chambre',
#     'appartement': 'Appartement', 'appartements': 'Appartement', 'appart': 'Appartement',
#     'maison': 'Maison', 'villa': 'Maison', 'villas': 'Maison',
# }

# CATEGORIES_EN = {
#     'studio': 'Studio',
#     'room': 'Chambre', 'rooms': 'Chambre',
#     'apartment': 'Appartement', 'apartments': 'Appartement', 'flat': 'Appartement',
#     'house': 'Maison', 'villa': 'Maison',
# }

# FEATURES_FR = {
#     'balcon': 'balcon', 'balcons': 'balcon',
#     'terrasse': 'terrasse',
#     'piscine': 'piscine',
#     'jardin': 'jardin',
#     'parking': 'parking',
#     'garage': 'garage',
#     'gardien': 'gardien',
#     'sécurisé': 'sécurisé', 'securise': 'sécurisé',
#     'clôture': 'clôture', 'cloture': 'clôture',
#     'eau courante': 'eau', 'eau': 'eau',
#     'électricité': 'electricite', 'electricite': 'electricite',
#     'climatisation': 'climatisation', 'clim': 'climatisation',
#     'wifi': 'wifi', 'internet': 'wifi',
#     'cuisine équipée': 'cuisine', 'cuisine': 'cuisine',
#     'salle de bain': 'bain', 'douche': 'bain',
#     'ascenseur': 'ascenseur',
#     'vue': 'vue',
# }

# FEATURES_EN = {
#     'balcony': 'balcon', 'terrace': 'terrasse',
#     'pool': 'piscine', 'swimming pool': 'piscine',
#     'garden': 'jardin', 'parking': 'parking', 'garage': 'garage',
#     'security': 'sécurisé', 'water': 'eau',
#     'electricity': 'electricite',
#     'air conditioning': 'climatisation', 'ac': 'climatisation',
#     'wifi': 'wifi', 'internet': 'wifi',
#     'kitchen': 'cuisine', 'elevator': 'ascenseur', 'lift': 'ascenseur',
# }

# NEARBY_FR = {
#     'université': 'school', 'universite': 'school',
#     'école': 'school', 'ecole': 'school',
#     'lycée': 'school', 'lycee': 'school',
#     'collège': 'school', 'college': 'school',
#     'campus': 'school',
#     'supermarché': 'supermarket', 'supermarche': 'supermarket',
#     'super marché': 'supermarket', 'boutique': 'supermarket',
#     'marché': 'market', 'marche': 'market',
#     'hôpital': 'hospital', 'hopital': 'hospital', 'clinique': 'hospital',
#     'pharmacie': 'pharmacy',
#     'transport': 'transport', 'bus': 'transport', 'taxi': 'transport',
#     'banque': 'bank', 'atm': 'bank',
#     'église': 'church', 'eglise': 'church',
#     'mosquée': 'mosque', 'mosquee': 'mosque',
#     'parc': 'park', 'stade': 'park',
#     'salle de sport': 'gym', 'gym': 'gym', 'fitness': 'gym',
#     'restaurant': 'restaurant',
# }

# NEARBY_EN = {
#     'university': 'school', 'school': 'school',
#     'high school': 'school', 'college': 'school', 'campus': 'school',
#     'supermarket': 'supermarket', 'grocery': 'supermarket',
#     'market': 'market', 'hospital': 'hospital', 'clinic': 'hospital',
#     'pharmacy': 'pharmacy', 'transport': 'transport', 'bus': 'transport',
#     'bank': 'bank', 'church': 'church', 'mosque': 'mosque',
#     'park': 'park', 'stadium': 'park',
#     'gym': 'gym', 'fitness': 'gym', 'restaurant': 'restaurant',
# }


# # ---------------------------------------------------------------------------
# # Utilitaire : parser un montant avec espaces ou k
# # ---------------------------------------------------------------------------

# def _parse_amount(raw: str, query: str, position: int) -> int:
#     """
#     Convertit une chaîne de chiffres (éventuellement avec espaces) en entier.
#     Gère :  "50000", "50 000", "50", "50k", "50 k", "50 mille"
#     """
#     # Supprimer les espaces internes entre chiffres
#     digits = raw.replace(' ', '').replace('\u00a0', '')
#     value  = int(digits)

#     # Détection de "k" ou "mille" dans les 6 chars suivant le nombre
#     suffix = query[position: position + 8].lower()
#     if value < 5000 and re.search(r'\bk\b|\bmille\b', suffix):
#         value *= 1000

#     return value


# # ---------------------------------------------------------------------------
# # Extraction principale
# # ---------------------------------------------------------------------------

# def extract_search_criteria_simple(user_query: str, language: str = 'fr') -> dict:
#     """
#     Extraction de critères depuis un texte libre (sans IA externe).
    
#     Retourne un dict avec :
#       city, district_name, category_name, furnished,
#       min_price, max_price, min_rooms, min_area,
#       features, nearby_places, sort, intent,
#       text_query  ← termes résiduels pour recherche fulltext
#                     (≠ 'query' brute qui causait de faux filtres)
#     """
#     query = user_query.lower().strip()
#     # Normaliser les espaces insécables et apostrophes
#     query = query.replace('\u00a0', ' ').replace('\u2019', "'").replace('\u2018', "'")
#     criteria = {}

#     cities     = CITIES_CAMEROON.get(language, CITIES_CAMEROON['fr'])
#     categories = CATEGORIES_EN if language == 'en' else CATEGORIES_FR
#     features_d = FEATURES_EN   if language == 'en' else FEATURES_FR
#     nearby_d   = NEARBY_EN     if language == 'en' else NEARBY_FR

#     # ── 1. VILLE ──────────────────────────────────────────────────────────
#     for key, canonical in cities.items():
#         if re.search(rf'\b{re.escape(key)}\b', query):
#             criteria['city'] = canonical
#             break

#     # ── 2. QUARTIER ───────────────────────────────────────────────────────
#     for key, (district, city) in DISTRICTS_MAP.items():
#         if key in query:
#             criteria['district_name'] = district
#             if not criteria.get('city'):
#                 criteria['city'] = city
#             break

#     # ── 3. CATÉGORIE ─────────────────────────────────────────────────────
#     for key, canonical in categories.items():
#         if re.search(rf'\b{re.escape(key)}\b', query):
#             criteria['category_name'] = canonical
#             break

#     # ── 4. MEUBLÉ / VIDE ─────────────────────────────────────────────────
#     if language == 'fr':
#         furnished_kw   = ['meublé', 'meuble', 'équipé', 'moderne', 'tout équipé']
#         unfurnished_kw = ['vide', 'simple', 'non meublé', 'non-meublé']
#     else:
#         furnished_kw   = ['furnished', 'equipped', 'modern', 'fully equipped']
#         unfurnished_kw = ['unfurnished', 'empty', 'bare']

#     if any(w in query for w in furnished_kw):
#         criteria['furnished'] = True
#     elif any(w in query for w in unfurnished_kw):
#         criteria['furnished'] = False

#     # ── 5. PRIX ──────────────────────────────────────────────────────────
#     #
#     # Patterns gérés (FR + EN) :
#     #   "50 000 FCFA", "50000 FCFA", "50k", "50 k", "50 mille"
#     #   "moins de 80 000", "max 80000", "entre 30 000 et 60 000"
#     #   "à partir de 30000", "plus de 30000"
#     #
#     # ⚠️  Regex unifiée : \d{1,3}(?:[\s\u00a0]\d{3})+ pour "50 000"
#     #                   + \d{4,6}                       pour "50000"
#     #                   + \d{1,4} suivi de k/mille      pour "50k"

#     AMT = r'(\d{1,3}(?:[\s\u00a0]\d{3})+|\d{1,6})'  # montant avec ou sans espace

#     # Fourchette : entre X et Y
#     range_m = re.search(
#         rf'(?:entre|from|between)\s+{AMT}\s*(?:et|à|and|-)\s+{AMT}',
#         query
#     )
#     if range_m:
#         p1 = _parse_amount(range_m.group(1), query, range_m.end(1))
#         p2 = _parse_amount(range_m.group(2), query, range_m.end(2))
#         criteria['min_price'] = min(p1, p2)
#         criteria['max_price'] = max(p1, p2)
#     else:
#         # Prix max
#         max_m = re.search(
#             rf'(?:moins de|maximum|max|jusqu\'à|jusqu.à|less than|under|up to|at most)\s*{AMT}',
#             query
#         )
#         if max_m:
#             criteria['max_price'] = _parse_amount(max_m.group(1), query, max_m.end(1))
#         else:
#             # Dernier recours : montant suivi de FCFA / XAF / k / mille
#             fcfa_m = re.search(
#                 rf'{AMT}\s*(?:fcfa|xaf|f\b)',
#                 query
#             )
#             if fcfa_m:
#                 criteria['max_price'] = _parse_amount(fcfa_m.group(1), query, fcfa_m.end(1))
#             else:
#                 # "50k" ou "50 000" seul (si aucun autre pattern)
#                 k_m = re.search(r'(\d{1,4})\s*(?:k|mille)\b', query)
#                 if k_m:
#                     criteria['max_price'] = int(k_m.group(1)) * 1000
#                 else:
#                     bare_m = re.search(r'\b(\d{5,6})\b', query)
#                     if bare_m:
#                         criteria['max_price'] = int(bare_m.group(1))

#         # Prix min
#         min_m = re.search(
#             rf'(?:plus de|minimum|au moins|at least|from|more than|à partir de)\s*{AMT}',
#             query
#         )
#         if min_m:
#             criteria['min_price'] = _parse_amount(min_m.group(1), query, min_m.end(1))

#     # Validation : prix doit être >= 1000 pour être plausible
#     for k in ('min_price', 'max_price'):
#         if k in criteria and criteria[k] < 1000:
#             del criteria[k]

#     # ── 6. CHAMBRES ──────────────────────────────────────────────────────
#     room_pat = r'(\d+)\s*(?:chambres?|pièces?|bedrooms?|rooms?)'
#     room_m   = re.search(room_pat, query)
#     if room_m:
#         criteria['min_rooms'] = int(room_m.group(1))

#     # ── 7. SUPERFICIE ────────────────────────────────────────────────────
#     area_m = re.search(r'(\d+)\s*m[²2]', query)
#     if area_m:
#         criteria['min_area'] = int(area_m.group(1))

#     # ── 8. ÉQUIPEMENTS ────────────────────────────────────────────────────
#     found_features = []
#     # Trier par longueur décroissante pour favoriser les expressions longues
#     for keyword, feature in sorted(features_d.items(), key=lambda x: -len(x[0])):
#         if keyword in query:
#             found_features.append(feature)
#     if found_features:
#         criteria['features'] = list(dict.fromkeys(found_features))  # déduplique en ordre

#     # ── 9. LIEUX À PROXIMITÉ ─────────────────────────────────────────────
#     proximity_words = ['près', 'proche', 'autour', 'proximité',
#                        'near', 'close to', 'next to', 'around', 'beside']
#     nearby_intent = any(w in query for w in proximity_words)

#     found_nearby = []
#     for keyword, place_type in sorted(nearby_d.items(), key=lambda x: -len(x[0])):
#         if keyword in query:
#             found_nearby.append(place_type)
#             nearby_intent = True

#     if found_nearby:
#         criteria['nearby_places'] = list(dict.fromkeys(found_nearby))
#     if nearby_intent:
#         criteria['intent'] = 'nearby'

#     # ── 10. INTENTIONS DE TRI ────────────────────────────────────────────
#     urgent_w = ['urgent', 'rapidement', 'vite', 'asap', 'immediately']
#     cheap_w  = ['pas cher', 'économique', 'abordable', 'budget',
#                  'cheap', 'affordable', 'low cost']
#     luxury_w = ['luxe', 'haut de gamme', 'standing', 'luxury', 'premium']

#     if any(w in query for w in urgent_w):
#         criteria['sort'] = 'recent'
#     elif any(w in query for w in cheap_w):
#         criteria['sort'] = 'price_asc'
#     elif any(w in query for w in luxury_w):
#         criteria['sort'] = 'price_desc'

#     # ── 11. TERMES RÉSIDUELS pour recherche fulltext ──────────────────────
#     #
#     # On ne met PAS la requête brute ici pour éviter que
#     # "Studio meublé à Yaoundé pour 50 000 FCFA" soit cherché mot à mot
#     # dans title/description sans aucun résultat.
#     #
#     # On extrait uniquement les mots-clés non reconnus qui pourraient
#     # être utiles (ex : nom propre d'un lieu, surnom de quartier…)
    
#     STOP_WORDS = {
#         'je', 'cherche', 'un', 'une', 'le', 'la', 'les', 'des', 'de', 'du',
#         'à', 'a', 'en', 'pour', 'avec', 'dans', 'sur', 'qui', 'et', 'ou',
#         'pas', 'non', 'très', 'plus', 'moins', 'ma', 'mon', 'mes',
#         'studio', 'chambre', 'appartement', 'maison', 'villa',
#         'meublé', 'meuble', 'vide', 'simple',
#         'fcfa', 'xaf', 'f', 'k', 'mille',
#         'i', 'am', 'looking', 'for', 'a', 'an', 'the', 'in', 'with',
#         'near', 'close', 'to', 'bedroom', 'apartment', 'furnished',
#     }
#     # Ajouter les villes / quartiers détectés comme stop words
#     if criteria.get('city'):
#         STOP_WORDS.add(criteria['city'].lower())
#         # Variantes
#         for k, v in cities.items():
#             if v == criteria['city']:
#                 STOP_WORDS.add(k)
#     if criteria.get('district_name'):
#         STOP_WORDS.add(criteria['district_name'].lower())

#     words = re.findall(r'\b[a-záàâäéèêëíìîïóòôöúùûüñç]{3,}\b', query)
#     residual = [w for w in words if w not in STOP_WORDS]

#     # text_query = les termes résiduels pertinents (peut être vide)
#     criteria['text_query'] = ' '.join(residual) if residual else ''

#     return criteria


# # ---------------------------------------------------------------------------
# # Résumé lisible
# # ---------------------------------------------------------------------------

# def describe_criteria(criteria: dict, language: str = 'fr') -> str:
#     """Génère un résumé lisible pour validation utilisateur."""
#     parts = []
#     if language == 'fr':
#         if criteria.get('category_name'):
#             label = criteria['category_name']
#             if criteria.get('furnished') is True:
#                 label += ' meublé'
#             elif criteria.get('furnished') is False:
#                 label += ' vide'
#             parts.append(label)
#         if criteria.get('city'):
#             parts.append(f"à {criteria['city']}")
#         if criteria.get('district_name'):
#             parts.append(f"quartier {criteria['district_name']}")
#         if criteria.get('min_price') and criteria.get('max_price'):
#             parts.append(
#                 f"entre {criteria['min_price']:,} et {criteria['max_price']:,} FCFA"
#                 .replace(',', ' ')
#             )
#         elif criteria.get('max_price'):
#             parts.append(f"max {criteria['max_price']:,} FCFA".replace(',', ' '))
#         elif criteria.get('min_price'):
#             parts.append(f"à partir de {criteria['min_price']:,} FCFA".replace(',', ' '))
#         if criteria.get('min_rooms'):
#             n = criteria['min_rooms']
#             parts.append(f"{n} chambre{'s' if n > 1 else ''} min.")
#         if criteria.get('features'):
#             parts.append(f"avec : {', '.join(criteria['features'])}")
#         if criteria.get('nearby_places'):
#             place_labels = {
#                 'school': 'école/université', 'supermarket': 'supermarché',
#                 'hospital': 'hôpital', 'market': 'marché',
#                 'transport': 'transport', 'bank': 'banque',
#                 'church': 'église', 'mosque': 'mosquée',
#                 'park': 'parc', 'gym': 'salle de sport',
#                 'restaurant': 'restaurant', 'pharmacy': 'pharmacie',
#             }
#             labels = [place_labels.get(p, p) for p in criteria['nearby_places']]
#             parts.append(f"proche {', '.join(labels)}")

#         return ("Recherche : " + " • ".join(parts)) if parts else "Recherche générale"

#     else:  # EN
#         if criteria.get('category_name'):
#             label = criteria['category_name']
#             if criteria.get('furnished') is True:  label += ' furnished'
#             elif criteria.get('furnished') is False: label += ' unfurnished'
#             parts.append(label)
#         if criteria.get('city'):     parts.append(f"in {criteria['city']}")
#         if criteria.get('district_name'): parts.append(f"district {criteria['district_name']}")
#         if criteria.get('max_price'): parts.append(f"max {criteria['max_price']:,} FCFA".replace(',', ' '))
#         elif criteria.get('min_price'): parts.append(f"from {criteria['min_price']:,} FCFA".replace(',', ' '))
#         if criteria.get('min_rooms'): parts.append(f"min. {criteria['min_rooms']} bedroom(s)")
#         if criteria.get('features'): parts.append(f"with: {', '.join(criteria['features'])}")
#         if criteria.get('nearby_places'): parts.append(f"near: {', '.join(criteria['nearby_places'])}")
#         return ("Search: " + " • ".join(parts)) if parts else "General search"


# # ---------------------------------------------------------------------------
# # Point d'entrée principal
# # ---------------------------------------------------------------------------

# def extract_search_criteria(user_query: str, method: str = 'simple', language: str = 'fr') -> dict:
#     if method == 'ollama':
#         return _extract_ollama(user_query, language)
#     elif method == 'openai':
#         return _extract_openai(user_query, language)
#     return extract_search_criteria_simple(user_query, language)


# # ---------------------------------------------------------------------------
# # Ollama / OpenAI (inchangés)
# # ---------------------------------------------------------------------------

# def _extract_ollama(user_query, language='fr'):
#     try:
#         import requests
#         ollama_url   = getattr(settings, 'OLLAMA_API_URL', 'http://localhost:11434')
#         ollama_model = getattr(settings, 'OLLAMA_MODEL', 'mistral')
#         prompt = f"""
# Analyse cette demande de logement et extrais les critères au format JSON.
# Demande: "{user_query}"
# Retourne UNIQUEMENT un JSON valide (omets les champs non mentionnés):
# {{
#   "city": "Yaoundé|Douala|...",
#   "category_name": "Studio|Chambre|Appartement|Maison",
#   "max_price": nombre_fcfa,
#   "min_rooms": nombre,
#   "furnished": true|false,
#   "district_name": "quartier",
#   "features": ["balcon","terrasse"],
#   "nearby_places": ["school","supermarket"]
# }}
# """
#         response = requests.post(
#             f"{ollama_url}/api/generate",
#             json={"model": ollama_model, "prompt": prompt, "stream": False, "temperature": 0.1},
#             timeout=10
#         )
#         if response.status_code == 200:
#             result = response.json()['response']
#             json_match = re.search(r'\{.*\}', result, re.DOTALL)
#             if json_match:
#                 c = json.loads(json_match.group())
#                 c['text_query'] = ''
#                 return c
#     except Exception as e:
#         print(f"⚠️ Erreur Ollama: {e}")
#     return extract_search_criteria_simple(user_query, language)


# def _extract_openai(user_query, language='fr'):
#     try:
#         import openai
#         openai.api_key = getattr(settings, 'OPENAI_API_KEY', None)
#         if not openai.api_key:
#             return extract_search_criteria_simple(user_query, language)
#         response = openai.ChatCompletion.create(
#             model="gpt-3.5-turbo",
#             messages=[
#                 {"role": "system", "content": "Assistant immobilier Cameroun, retourne uniquement du JSON."},
#                 {"role": "user", "content": f'Extrais les critères JSON de: "{user_query}"'}
#             ],
#             temperature=0.3, max_tokens=300
#         )
#         result = response.choices[0].message.content.strip()
#         json_match = re.search(r'\{.*\}', result, re.DOTALL)
#         if json_match:
#             c = json.loads(json_match.group())
#             c['text_query'] = ''
#             return c
#     except Exception as e:
#         print(f"⚠️ Erreur OpenAI: {e}")
#     return extract_search_criteria_simple(user_query, language)


# # ---------------------------------------------------------------------------
# # Réponses naturelles
# # ---------------------------------------------------------------------------

# def generate_response(criteria: dict, results_count: int, language: str = 'fr') -> str:
#     if language == 'fr':
#         if results_count == 0:
#             return "Aucun logement trouvé. Essayez d'élargir vos critères."
#         s = 's' if results_count > 1 else ''
#         msg = f"{results_count} logement{s} trouvé{s}"
#         if criteria.get('city'):    msg += f" à {criteria['city']}"
#         if criteria.get('max_price'): msg += f" • max {criteria['max_price']:,} FCFA".replace(',', ' ')
#         return msg + "."
#     else:
#         if results_count == 0:
#             return "No housing found. Try broadening your criteria."
#         s = 's' if results_count > 1 else ''
#         msg = f"{results_count} housing{s} found"
#         if criteria.get('city'):    msg += f" in {criteria['city']}"
#         if criteria.get('max_price'): msg += f" • max {criteria['max_price']:,} FCFA".replace(',', ' ')
#         return msg + "."


# def suggest_alternatives(criteria: dict, language: str = 'fr') -> list:
#     suggestions = []
#     if criteria.get('max_price'):
#         new_price = int(criteria['max_price'] * 1.2)
#         label = (f"Budget élargi à {new_price:,} FCFA".replace(',', ' ')
#                  if language == 'fr' else
#                  f"Budget up to {new_price:,} FCFA".replace(',', ' '))
#         suggestions.append({'text': label, 'criteria': {**criteria, 'max_price': new_price}})
#     if criteria.get('min_rooms', 0) > 1:
#         nr = criteria['min_rooms'] - 1
#         label = (f"Chercher avec {nr} chambre" if language == 'fr'
#                  else f"Search with {nr} bedroom")
#         suggestions.append({'text': label, 'criteria': {**criteria, 'min_rooms': nr}})
#     return suggestions

# ============================================
# 📁 apps/recherche/ai.py  — VERSION CORRIGÉE
#
# Bugs corrigés :
#  - "50 000 FCFA" (avec espace) maintenant correctement parsé → 50000
#  - "50k" → 50000 correctement
#  - La clé 'query' ne contient plus la requête brute (évite les faux filtres)
#    → elle contient uniquement les termes résiduels utiles pour la recherche texte
#  - Meilleure détection des villes camerounaises (accents variés)
# ============================================

import re
import json
from django.conf import settings


# ---------------------------------------------------------------------------
# Dictionnaires de référence
# ---------------------------------------------------------------------------

CITIES_CAMEROON = {
    'fr': {
        'yaoundé': 'Yaoundé', 'yaounde': 'Yaoundé',
        'douala': 'Douala', 'bafoussam': 'Bafoussam',
        'garoua': 'Garoua', 'maroua': 'Maroua',
        'bamenda': 'Bamenda', 'ngaoundéré': 'Ngaoundéré',
        'ngaoundere': 'Ngaoundéré', 'bertoua': 'Bertoua',
        'buea': 'Buea', 'limbé': 'Limbé', 'limbe': 'Limbé',
        'kumba': 'Kumba', 'nkongsamba': 'Nkongsamba',
        'edéa': 'Edéa', 'edea': 'Edéa', 'kribi': 'Kribi',
    },
    'en': {
        'yaounde': 'Yaoundé', 'douala': 'Douala',
        'bafoussam': 'Bafoussam', 'garoua': 'Garoua',
        'maroua': 'Maroua', 'bamenda': 'Bamenda',
        'buea': 'Buea', 'limbe': 'Limbé', 'kumba': 'Kumba',
        'kribi': 'Kribi',
    }
}

DISTRICTS_MAP = {
    # Yaoundé
    'bastos': ('Bastos', 'Yaoundé'),
    'essos': ('Essos', 'Yaoundé'),
    'mvan': ('Mvan', 'Yaoundé'),
    'ngousso': ('Ngousso', 'Yaoundé'),
    'messa': ('Messa', 'Yaoundé'),
    'ekounou': ('Ekounou', 'Yaoundé'),
    'odza': ('Odza', 'Yaoundé'),
    'nkolndongo': ('Nkolndongo', 'Yaoundé'),
    'emana': ('Emana', 'Yaoundé'),
    'etoudi': ('Etoudi', 'Yaoundé'),
    'mvog-mbi': ('Mvog-Mbi', 'Yaoundé'),
    'nlongkak': ('Nlongkak', 'Yaoundé'),
    'omnisport': ('Omnisport', 'Yaoundé'),
    'biyem-assi': ('Biyem-Assi', 'Yaoundé'),
    'mendong': ('Mendong', 'Yaoundé'),
    'mokolo': ('Mokolo', 'Yaoundé'),
    # Douala
    'akwa': ('Akwa', 'Douala'),
    'bonapriso': ('Bonapriso', 'Douala'),
    'bonanjo': ('Bonanjo', 'Douala'),
    'bali': ('Bali', 'Douala'),
    'makepe': ('Makepe', 'Douala'),
    'kotto': ('Kotto', 'Douala'),
    'deïdo': ('Deïdo', 'Douala'),
    'deido': ('Deïdo', 'Douala'),
    'ndokotti': ('Ndokotti', 'Douala'),
    'logbessou': ('Logbessou', 'Douala'),
}

CATEGORIES_FR = {
    'studio': 'Studio', 'studios': 'Studio',
    'chambre': 'Chambre', 'chambres': 'Chambre',
    'appartement': 'Appartement', 'appartements': 'Appartement', 'appart': 'Appartement',
    'maison': 'Maison', 'villa': 'Maison', 'villas': 'Maison',
}

CATEGORIES_EN = {
    'studio': 'Studio',
    'room': 'Chambre', 'rooms': 'Chambre',
    'apartment': 'Appartement', 'apartments': 'Appartement', 'flat': 'Appartement',
    'house': 'Maison', 'villa': 'Maison',
}

FEATURES_FR = {
    'balcon': 'balcon', 'balcons': 'balcon',
    'terrasse': 'terrasse',
    'piscine': 'piscine',
    'jardin': 'jardin',
    'parking': 'parking',
    'garage': 'garage',
    'gardien': 'gardien',
    'sécurisé': 'sécurisé', 'securise': 'sécurisé',
    'clôture': 'clôture', 'cloture': 'clôture',
    'eau courante': 'eau', 'eau': 'eau',
    'électricité': 'electricite', 'electricite': 'electricite',
    'climatisation': 'climatisation', 'clim': 'climatisation',
    'wifi': 'wifi', 'internet': 'wifi',
    'cuisine équipée': 'cuisine', 'cuisine': 'cuisine',
    'salle de bain': 'bain', 'douche': 'bain',
    'ascenseur': 'ascenseur',
    'vue': 'vue',
}

FEATURES_EN = {
    'balcony': 'balcon', 'terrace': 'terrasse',
    'pool': 'piscine', 'swimming pool': 'piscine',
    'garden': 'jardin', 'parking': 'parking', 'garage': 'garage',
    'security': 'sécurisé', 'water': 'eau',
    'electricity': 'electricite',
    'air conditioning': 'climatisation', 'ac': 'climatisation',
    'wifi': 'wifi', 'internet': 'wifi',
    'kitchen': 'cuisine', 'elevator': 'ascenseur', 'lift': 'ascenseur',
}

NEARBY_FR = {
    'université': 'school', 'universite': 'school',
    'école': 'school', 'ecole': 'school',
    'lycée': 'school', 'lycee': 'school',
    'collège': 'school', 'college': 'school',
    'campus': 'school',
    'supermarché': 'supermarket', 'supermarche': 'supermarket',
    'super marché': 'supermarket', 'boutique': 'supermarket',
    'marché': 'market', 'marche': 'market',
    'hôpital': 'hospital', 'hopital': 'hospital', 'clinique': 'hospital',
    'pharmacie': 'pharmacy',
    'transport': 'transport', 'bus': 'transport', 'taxi': 'transport',
    'banque': 'bank', 'atm': 'bank',
    'église': 'church', 'eglise': 'church',
    'mosquée': 'mosque', 'mosquee': 'mosque',
    'parc': 'park', 'stade': 'park',
    'salle de sport': 'gym', 'gym': 'gym', 'fitness': 'gym',
    'restaurant': 'restaurant',
}

NEARBY_EN = {
    'university': 'school', 'school': 'school',
    'high school': 'school', 'college': 'school', 'campus': 'school',
    'supermarket': 'supermarket', 'grocery': 'supermarket',
    'market': 'market', 'hospital': 'hospital', 'clinic': 'hospital',
    'pharmacy': 'pharmacy', 'transport': 'transport', 'bus': 'transport',
    'bank': 'bank', 'church': 'church', 'mosque': 'mosque',
    'park': 'park', 'stadium': 'park',
    'gym': 'gym', 'fitness': 'gym', 'restaurant': 'restaurant',
}


# ---------------------------------------------------------------------------
# Utilitaire : parser un montant avec espaces ou k
# ---------------------------------------------------------------------------

def _parse_amount(raw: str, query: str, position: int) -> int:
    """
    Convertit une chaîne de chiffres (éventuellement avec espaces) en entier.
    Gère :  "50000", "50 000", "50", "50k", "50 k", "50 mille"
    """
    # Supprimer les espaces internes entre chiffres
    digits = raw.replace(' ', '').replace('\u00a0', '')
    value  = int(digits)

    # Détection de "k" ou "mille" dans les 6 chars suivant le nombre
    suffix = query[position: position + 8].lower()
    if value < 5000 and re.search(r'\bk\b|\bmille\b', suffix):
        value *= 1000

    return value


# ---------------------------------------------------------------------------
# Extraction principale
# ---------------------------------------------------------------------------

def extract_search_criteria_simple(user_query: str, language: str = 'fr') -> dict:
    """
    Extraction de critères depuis un texte libre (sans IA externe).
    
    Retourne un dict avec :
      city, district_name, category_name, furnished,
      min_price, max_price, min_rooms, min_area,
      features, nearby_places, sort, intent,
      text_query  ← termes résiduels pour recherche fulltext
                    (≠ 'query' brute qui causait de faux filtres)
    """
    query = user_query.lower().strip()
    # Normaliser les espaces insécables et apostrophes
    query = query.replace('\u00a0', ' ').replace('\u2019', "'").replace('\u2018', "'")
    criteria = {}

    cities     = CITIES_CAMEROON.get(language, CITIES_CAMEROON['fr'])
    categories = CATEGORIES_EN if language == 'en' else CATEGORIES_FR
    features_d = FEATURES_EN   if language == 'en' else FEATURES_FR
    nearby_d   = NEARBY_EN     if language == 'en' else NEARBY_FR

    # ── 1. VILLE ──────────────────────────────────────────────────────────
    for key, canonical in cities.items():
        if re.search(rf'\b{re.escape(key)}\b', query):
            criteria['city'] = canonical
            break

    # ── 2. QUARTIER ───────────────────────────────────────────────────────
    for key, (district, city) in DISTRICTS_MAP.items():
        if key in query:
            criteria['district_name'] = district
            if not criteria.get('city'):
                criteria['city'] = city
            break

    # ── 3. CATÉGORIE ─────────────────────────────────────────────────────
    for key, canonical in categories.items():
        if re.search(rf'\b{re.escape(key)}\b', query):
            criteria['category_name'] = canonical
            break

    # ── 4. MEUBLÉ / VIDE ─────────────────────────────────────────────────
    if language == 'fr':
        furnished_kw   = ['meublé', 'meuble', 'équipé', 'moderne', 'tout équipé']
        unfurnished_kw = ['vide', 'simple', 'non meublé', 'non-meublé']
    else:
        furnished_kw   = ['furnished', 'equipped', 'modern', 'fully equipped']
        unfurnished_kw = ['unfurnished', 'empty', 'bare']

    if any(w in query for w in furnished_kw):
        criteria['furnished'] = True
    elif any(w in query for w in unfurnished_kw):
        criteria['furnished'] = False

    # ── 5. PRIX ──────────────────────────────────────────────────────────
    #
    # Patterns gérés (FR + EN) :
    #   "50 000 FCFA", "50000 FCFA", "50k", "50 k", "50 mille"
    #   "moins de 80 000", "max 80000", "entre 30 000 et 60 000"
    #   "à partir de 30000", "plus de 30000"
    #   "pour 500" / "à 500" / "budget 500"  ← 3-4 chiffres → ×1000
    #
    # Règle d'interprétation des montants courts (contexte immobilier camerounais) :
    #   100–9999   sans suffixe → ×1000   (500 → 500 000 FCFA)
    #   ≥ 10 000   sans suffixe → valeur brute
    #   + suffixe k/mille       → ×1000 quelque soit la taille

    AMT = r'(\d{1,3}(?:[\s\u00a0]\d{3})+|\d{1,6})'  # "50 000" ou "50000"

    def _to_fcfa(raw: str, query_str: str, end_pos: int) -> int:
        """
        Convertit un montant capturé en FCFA.
        Gère :  espaces internes ("50 000"),  suffixe k/mille, montants courts (×1000).
        """
        digits = raw.replace(' ', '').replace('\u00a0', '')
        value  = int(digits)
        suffix = query_str[end_pos: end_pos + 8].lower()

        if re.search(r'\bk\b|\bmille\b', suffix):
            # Suffixe explicite → toujours ×1000
            if value < 10000:
                value *= 1000
        elif value < 10000:
            # Montant court sans suffixe → ×1000 (contexte immobilier)
            # Exemples : 500 → 500 000, 50 → 50 000, 100 → 100 000
            value *= 1000
        # Sinon (≥ 10 000 sans suffixe) → valeur brute : 50000, 150000…

        return value

    # 5a. Fourchette : entre X et Y
    range_m = re.search(
        rf'(?:entre|from|between)\s+{AMT}\s*(?:et|à|and|-)\s+{AMT}',
        query
    )
    if range_m:
        p1 = _to_fcfa(range_m.group(1), query, range_m.end(1))
        p2 = _to_fcfa(range_m.group(2), query, range_m.end(2))
        criteria['min_price'] = min(p1, p2)
        criteria['max_price'] = max(p1, p2)
    else:
        # 5b. Prix max — mots-clés explicites
        max_m = re.search(
            rf'(?:moins de|maximum|max|jusqu\'à|jusqu.à|less than|under|up to|at most)\s*{AMT}',
            query
        )
        if max_m:
            criteria['max_price'] = _to_fcfa(max_m.group(1), query, max_m.end(1))
        else:
            # 5c. Montant suivi de FCFA / XAF
            fcfa_m = re.search(rf'{AMT}\s*(?:fcfa|xaf)\b', query)
            if fcfa_m:
                criteria['max_price'] = _to_fcfa(fcfa_m.group(1), query, fcfa_m.end(1))
            else:
                # 5d. Suffixe k ou mille : "50k", "50 mille"
                k_m = re.search(r'(\d{1,4})\s*(?:k|mille)\b', query)
                if k_m:
                    criteria['max_price'] = int(k_m.group(1)) * 1000
                else:
                    # 5e. CAS CORRIGE : "pour 500", "budget 500", "loyer 500"
                    # \b apres les chiffres : empeche de capturer "5000" dans "50000"
                    # Lookahead negatif : ignore chambres, m2, personnes, etc.
                    PRIX_PREP = r'(?:pour|budget|loyer|prix|tarif)'
                    short_m = re.search(
                        rf'{PRIX_PREP}' + r'\s+(\d{1,4})\b(?!\s*(?:000|chambres?|pieces?|personnes?|m[2]|ans?|mois|jours?|bedroom|\d))',
                        query
                    )
                    if short_m:
                        val = int(short_m.group(1))
                        # Minimum 10 pour eviter des valeurs absurdes
                        if val >= 10:
                            criteria['max_price'] = val * 1000
                    else:
                        # 5f. Nombre seul ≥ 5 chiffres : "50000", "150000"
                        bare_m = re.search(r'\b(\d{5,6})\b', query)
                        if bare_m:
                            criteria['max_price'] = int(bare_m.group(1))

        # 5g. Prix min — mots-clés explicites
        min_m = re.search(
            rf'(?:plus de|minimum|au moins|at least|from|more than|à partir de)\s*{AMT}',
            query
        )
        if min_m:
            criteria['min_price'] = _to_fcfa(min_m.group(1), query, min_m.end(1))

    # 5h. Validation finale : prix doit être réaliste (≥ 1 000 FCFA)
    for k in ('min_price', 'max_price'):
        if k in criteria and criteria[k] < 1000:
            del criteria[k]

    # ── 6. CHAMBRES ──────────────────────────────────────────────────────
    room_pat = r'(\d+)\s*(?:chambres?|pièces?|bedrooms?|rooms?)'
    room_m   = re.search(room_pat, query)
    if room_m:
        criteria['min_rooms'] = int(room_m.group(1))

    # ── 7. SUPERFICIE ────────────────────────────────────────────────────
    area_m = re.search(r'(\d+)\s*m[²2]', query)
    if area_m:
        criteria['min_area'] = int(area_m.group(1))

    # ── 8. ÉQUIPEMENTS ────────────────────────────────────────────────────
    found_features = []
    # Trier par longueur décroissante pour favoriser les expressions longues
    for keyword, feature in sorted(features_d.items(), key=lambda x: -len(x[0])):
        if keyword in query:
            found_features.append(feature)
    if found_features:
        criteria['features'] = list(dict.fromkeys(found_features))  # déduplique en ordre

    # ── 9. LIEUX À PROXIMITÉ ─────────────────────────────────────────────
    proximity_words = ['près', 'proche', 'autour', 'proximité',
                       'near', 'close to', 'next to', 'around', 'beside']
    nearby_intent = any(w in query for w in proximity_words)

    found_nearby = []
    for keyword, place_type in sorted(nearby_d.items(), key=lambda x: -len(x[0])):
        if keyword in query:
            found_nearby.append(place_type)
            nearby_intent = True

    if found_nearby:
        criteria['nearby_places'] = list(dict.fromkeys(found_nearby))
    if nearby_intent:
        criteria['intent'] = 'nearby'

    # ── 10. INTENTIONS DE TRI ────────────────────────────────────────────
    urgent_w = ['urgent', 'rapidement', 'vite', 'asap', 'immediately']
    cheap_w  = ['pas cher', 'économique', 'abordable', 'budget',
                 'cheap', 'affordable', 'low cost']
    luxury_w = ['luxe', 'haut de gamme', 'standing', 'luxury', 'premium']

    if any(w in query for w in urgent_w):
        criteria['sort'] = 'recent'
    elif any(w in query for w in cheap_w):
        criteria['sort'] = 'price_asc'
    elif any(w in query for w in luxury_w):
        criteria['sort'] = 'price_desc'

    # ── 11. TERMES RÉSIDUELS pour recherche fulltext ──────────────────────
    #
    # On ne met PAS la requête brute ici pour éviter que
    # "Studio meublé à Yaoundé pour 50 000 FCFA" soit cherché mot à mot
    # dans title/description sans aucun résultat.
    #
    # On extrait uniquement les mots-clés non reconnus qui pourraient
    # être utiles (ex : nom propre d'un lieu, surnom de quartier…)
    
    STOP_WORDS = {
        'je', 'cherche', 'un', 'une', 'le', 'la', 'les', 'des', 'de', 'du',
        'à', 'a', 'en', 'pour', 'avec', 'dans', 'sur', 'qui', 'et', 'ou',
        'pas', 'non', 'très', 'plus', 'moins', 'ma', 'mon', 'mes',
        'studio', 'chambre', 'appartement', 'maison', 'villa',
        'meublé', 'meuble', 'vide', 'simple',
        'fcfa', 'xaf', 'f', 'k', 'mille',
        'i', 'am', 'looking', 'for', 'a', 'an', 'the', 'in', 'with',
        'near', 'close', 'to', 'bedroom', 'apartment', 'furnished',
    }
    # Ajouter les villes / quartiers détectés comme stop words
    if criteria.get('city'):
        STOP_WORDS.add(criteria['city'].lower())
        # Variantes
        for k, v in cities.items():
            if v == criteria['city']:
                STOP_WORDS.add(k)
    if criteria.get('district_name'):
        STOP_WORDS.add(criteria['district_name'].lower())

    words = re.findall(r'\b[a-záàâäéèêëíìîïóòôöúùûüñç]{3,}\b', query)
    residual = [w for w in words if w not in STOP_WORDS]

    # text_query = les termes résiduels pertinents (peut être vide)
    criteria['text_query'] = ' '.join(residual) if residual else ''

    return criteria


# ---------------------------------------------------------------------------
# Résumé lisible
# ---------------------------------------------------------------------------

def describe_criteria(criteria: dict, language: str = 'fr') -> str:
    """Génère un résumé lisible pour validation utilisateur."""
    parts = []
    if language == 'fr':
        if criteria.get('category_name'):
            label = criteria['category_name']
            if criteria.get('furnished') is True:
                label += ' meublé'
            elif criteria.get('furnished') is False:
                label += ' vide'
            parts.append(label)
        if criteria.get('city'):
            parts.append(f"à {criteria['city']}")
        if criteria.get('district_name'):
            parts.append(f"quartier {criteria['district_name']}")
        if criteria.get('min_price') and criteria.get('max_price'):
            parts.append(
                f"entre {criteria['min_price']:,} et {criteria['max_price']:,} FCFA"
                .replace(',', ' ')
            )
        elif criteria.get('max_price'):
            parts.append(f"max {criteria['max_price']:,} FCFA".replace(',', ' '))
        elif criteria.get('min_price'):
            parts.append(f"à partir de {criteria['min_price']:,} FCFA".replace(',', ' '))
        if criteria.get('min_rooms'):
            n = criteria['min_rooms']
            parts.append(f"{n} chambre{'s' if n > 1 else ''} min.")
        if criteria.get('features'):
            parts.append(f"avec : {', '.join(criteria['features'])}")
        if criteria.get('nearby_places'):
            place_labels = {
                'school': 'école/université', 'supermarket': 'supermarché',
                'hospital': 'hôpital', 'market': 'marché',
                'transport': 'transport', 'bank': 'banque',
                'church': 'église', 'mosque': 'mosquée',
                'park': 'parc', 'gym': 'salle de sport',
                'restaurant': 'restaurant', 'pharmacy': 'pharmacie',
            }
            labels = [place_labels.get(p, p) for p in criteria['nearby_places']]
            parts.append(f"proche {', '.join(labels)}")

        return ("Recherche : " + " • ".join(parts)) if parts else "Recherche générale"

    else:  # EN
        if criteria.get('category_name'):
            label = criteria['category_name']
            if criteria.get('furnished') is True:  label += ' furnished'
            elif criteria.get('furnished') is False: label += ' unfurnished'
            parts.append(label)
        if criteria.get('city'):     parts.append(f"in {criteria['city']}")
        if criteria.get('district_name'): parts.append(f"district {criteria['district_name']}")
        if criteria.get('max_price'): parts.append(f"max {criteria['max_price']:,} FCFA".replace(',', ' '))
        elif criteria.get('min_price'): parts.append(f"from {criteria['min_price']:,} FCFA".replace(',', ' '))
        if criteria.get('min_rooms'): parts.append(f"min. {criteria['min_rooms']} bedroom(s)")
        if criteria.get('features'): parts.append(f"with: {', '.join(criteria['features'])}")
        if criteria.get('nearby_places'): parts.append(f"near: {', '.join(criteria['nearby_places'])}")
        return ("Search: " + " • ".join(parts)) if parts else "General search"


# ---------------------------------------------------------------------------
# Point d'entrée principal
# ---------------------------------------------------------------------------

def extract_search_criteria(user_query: str, method: str = 'simple', language: str = 'fr') -> dict:
    if method == 'ollama':
        return _extract_ollama(user_query, language)
    elif method == 'openai':
        return _extract_openai(user_query, language)
    return extract_search_criteria_simple(user_query, language)


# ---------------------------------------------------------------------------
# Ollama / OpenAI (inchangés)
# ---------------------------------------------------------------------------

def _extract_ollama(user_query, language='fr'):
    try:
        import requests
        ollama_url   = getattr(settings, 'OLLAMA_API_URL', 'http://localhost:11434')
        ollama_model = getattr(settings, 'OLLAMA_MODEL', 'mistral')
        prompt = f"""
Analyse cette demande de logement et extrais les critères au format JSON.
Demande: "{user_query}"
Retourne UNIQUEMENT un JSON valide (omets les champs non mentionnés):
{{
  "city": "Yaoundé|Douala|...",
  "category_name": "Studio|Chambre|Appartement|Maison",
  "max_price": nombre_fcfa,
  "min_rooms": nombre,
  "furnished": true|false,
  "district_name": "quartier",
  "features": ["balcon","terrasse"],
  "nearby_places": ["school","supermarket"]
}}
"""
        response = requests.post(
            f"{ollama_url}/api/generate",
            json={"model": ollama_model, "prompt": prompt, "stream": False, "temperature": 0.1},
            timeout=10
        )
        if response.status_code == 200:
            result = response.json()['response']
            json_match = re.search(r'\{.*\}', result, re.DOTALL)
            if json_match:
                c = json.loads(json_match.group())
                c['text_query'] = ''
                return c
    except Exception as e:
        print(f"⚠️ Erreur Ollama: {e}")
    return extract_search_criteria_simple(user_query, language)


def _extract_openai(user_query, language='fr'):
    try:
        import openai
        openai.api_key = getattr(settings, 'OPENAI_API_KEY', None)
        if not openai.api_key:
            return extract_search_criteria_simple(user_query, language)
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "Assistant immobilier Cameroun, retourne uniquement du JSON."},
                {"role": "user", "content": f'Extrais les critères JSON de: "{user_query}"'}
            ],
            temperature=0.3, max_tokens=300
        )
        result = response.choices[0].message.content.strip()
        json_match = re.search(r'\{.*\}', result, re.DOTALL)
        if json_match:
            c = json.loads(json_match.group())
            c['text_query'] = ''
            return c
    except Exception as e:
        print(f"⚠️ Erreur OpenAI: {e}")
    return extract_search_criteria_simple(user_query, language)


# ---------------------------------------------------------------------------
# Réponses naturelles
# ---------------------------------------------------------------------------

def generate_response(criteria: dict, results_count: int, language: str = 'fr') -> str:
    if language == 'fr':
        if results_count == 0:
            return "Aucun logement trouvé. Essayez d'élargir vos critères."
        s = 's' if results_count > 1 else ''
        msg = f"{results_count} logement{s} trouvé{s}"
        if criteria.get('city'):    msg += f" à {criteria['city']}"
        if criteria.get('max_price'): msg += f" • max {criteria['max_price']:,} FCFA".replace(',', ' ')
        return msg + "."
    else:
        if results_count == 0:
            return "No housing found. Try broadening your criteria."
        s = 's' if results_count > 1 else ''
        msg = f"{results_count} housing{s} found"
        if criteria.get('city'):    msg += f" in {criteria['city']}"
        if criteria.get('max_price'): msg += f" • max {criteria['max_price']:,} FCFA".replace(',', ' ')
        return msg + "."


def suggest_alternatives(criteria: dict, language: str = 'fr') -> list:
    suggestions = []
    if criteria.get('max_price'):
        new_price = int(criteria['max_price'] * 1.2)
        label = (f"Budget élargi à {new_price:,} FCFA".replace(',', ' ')
                 if language == 'fr' else
                 f"Budget up to {new_price:,} FCFA".replace(',', ' '))
        suggestions.append({'text': label, 'criteria': {**criteria, 'max_price': new_price}})
    if criteria.get('min_rooms', 0) > 1:
        nr = criteria['min_rooms'] - 1
        label = (f"Chercher avec {nr} chambre" if language == 'fr'
                 else f"Search with {nr} bedroom")
        suggestions.append({'text': label, 'criteria': {**criteria, 'min_rooms': nr}})
    return suggestions
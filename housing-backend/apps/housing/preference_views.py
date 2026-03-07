# ============================================================
# apps/housing/preference_views.py   ← NOUVEAU FICHIER
# Contient les 2 vues :
#   - UserPreferenceView  : GET/POST /api/housings/preferences/
#   - RecommendedHousingsView : GET /api/housings/recommended/
# ============================================================

import random
from django.utils import timezone
from rest_framework.views    import APIView
from rest_framework.response import Response
from rest_framework          import status
from rest_framework.permissions import IsAuthenticated, AllowAny


# ─── Score de fitness ────────────────────────────────────────────────────────

def compute_fitness(housing, preferences: dict) -> float:
    """
    Calcule le score de compatibilité d'un logement avec les préférences.
    Retourne un float >= 0. Plus le score est élevé, meilleur est le match.
    """
    score    = 0.0
    priority = preferences.get('priority', 'price')

    # Ville (+30, x1.2 si priority=location)
    pref_city = (preferences.get('city') or '').lower()
    if pref_city:
        housing_city = ''
        if hasattr(housing, 'city') and housing.city:
            housing_city = housing.city.name.lower()
        if pref_city in housing_city:
            score += 30 * (1.2 if priority == 'location' else 1.0)

    # Catégorie (+25)
    pref_cat = (preferences.get('category') or '').lower()
    if pref_cat and housing.category:
        if pref_cat in housing.category.name.lower():
            score += 25

    # Budget (+20, x1.2 si priority=price)
    min_p = preferences.get('min_price') or 0
    max_p = preferences.get('max_price') or 999999
    if min_p <= housing.price <= max_p:
        score += 20 * (1.2 if priority == 'price' else 1.0)
    else:
        # Pénalité progressive
        ref = max_p if housing.price > max_p else min_p
        gap = abs(housing.price - ref) / max(ref, 1)
        score -= min(15, gap * 15)

    # Meublé (+10)
    furnished_pref = preferences.get('furnished')
    if furnished_pref is not None:
        housing_furnished = False
        if housing.housing_type:
            housing_furnished = any(
                w in housing.housing_type.name.lower()
                for w in ['meublé', 'moderne', 'équipé', 'furnished']
            )
        if furnished_pref == housing_furnished:
            score += 10

    # Équipements (+2/équipement, x1.2 si priority=comfort)
    pref_features = preferences.get('features') or []
    if pref_features:
        text = ' '.join(filter(None, [
            getattr(housing, 'additional_features', '') or '',
            getattr(housing, 'description', '') or '',
            getattr(housing, 'title', '') or '',
        ])).lower()
        matched = sum(1 for f in pref_features if f.lower() in text)
        score  += matched * 2 * (1.2 if priority == 'comfort' else 1.0)

    # Popularité (jusqu'à +10)
    views = getattr(housing, 'views_count', 0) or 0
    likes = getattr(housing, 'likes_count', 0) or 0
    score += min(10, views / 100 + likes * 0.5)

    # Fraîcheur (+5 si < 30j, +2 si < 90j)
    age = (timezone.now() - housing.created_at).days
    if age <= 30:
        score += 5
    elif age <= 90:
        score += 2

    return max(0.0, score)


# ─── Algorithme génétique ────────────────────────────────────────────────────

def genetic_recommend(candidates: list, preferences: dict, n: int = 3) -> list:
    """
    Sélectionne les n meilleurs logements via algorithme génétique.
    Garantit : déduplication + limite stricte à n résultats.
    """
    if len(candidates) <= n:
        seen, result = set(), []
        for h in candidates:
            if h.id not in seen:
                seen.add(h.id)
                result.append(h)
        return result[:n]

    POPULATION_SIZE = min(20, len(candidates))
    GENERATIONS     = 10

    # Population initiale
    population = [
        random.sample(candidates, POPULATION_SIZE)
        for _ in range(POPULATION_SIZE)
    ]

    def score_individual(ind):
        return sum(compute_fitness(h, preferences) for h in ind)

    for _ in range(GENERATIONS):
        scored    = sorted(population, key=score_individual, reverse=True)
        survivors = scored[:POPULATION_SIZE // 2]

        children = []
        while len(children) < POPULATION_SIZE - len(survivors):
            p1, p2 = random.sample(survivors, 2)
            cut   = random.randint(1, len(p1) - 1)
            child = p1[:cut] + [h for h in p2 if h not in p1[:cut]]
            child = child[:POPULATION_SIZE]
            # Mutation 5%
            if random.random() < 0.05:
                idx = random.randint(0, len(child) - 1)
                new_gene = random.choice(candidates)
                if new_gene not in child:
                    child[idx] = new_gene
            children.append(child)

        population = survivors + children

    # Meilleur individu
    best = max(population, key=score_individual)
    best_sorted = sorted(best, key=lambda h: compute_fitness(h, preferences), reverse=True)

    # Déduplication + limite
    seen, result = set(), []
    for h in best_sorted:
        if h.id not in seen:
            seen.add(h.id)
            result.append(h)
        if len(result) >= n:
            break
    return result


# ─── Vue : préférences utilisateur ───────────────────────────────────────────

class UserPreferenceView(APIView):
    """
    GET  /api/housings/preferences/  → retourne les prefs de l'utilisateur
    POST /api/housings/preferences/  → crée ou met à jour les prefs
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from .models      import UserPreference
        from .serializers import UserPreferenceSerializer
        try:
            pref = request.user.preference
            return Response(UserPreferenceSerializer(pref).data)
        except UserPreference.DoesNotExist:
            return Response({})

    def post(self, request):
        from .models      import UserPreference
        from .serializers import UserPreferenceSerializer

        pref, _ = UserPreference.objects.get_or_create(user=request.user)
        serializer = UserPreferenceSerializer(pref, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ─── Vue : logements recommandés ─────────────────────────────────────────────

class RecommendedHousingsView(APIView):
    """
    GET /api/housings/recommended/
    Retourne exactement 3 logements uniques via algo génétique.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        from .models      import Housing
        from .serializers import HousingListSerializer

        MAX = 3  # limite absolue

        try:
            qs = Housing.objects.filter(
                is_visible=True, status='disponible'
            ).select_related(
                'owner', 'category', 'housing_type', 'city', 'district'
            ).prefetch_related('images')

            # Récupérer les préférences si connecté
            preferences = {}
            if request.user and request.user.is_authenticated:
                try:
                    p = request.user.preference
                    preferences = {
                        'city':          p.city or '',
                        'category':      p.category or '',
                        'min_price':     p.min_price or 0,
                        'max_price':     p.max_price or 999999,
                        'furnished':     p.furnished,
                        'features':      p.features or [],
                        'nearby_places': p.nearby_places or [],
                        'priority':      p.priority or 'price',
                    }
                except Exception:
                    pass

            candidates = list(qs[:100])

            if preferences:
                recommended = genetic_recommend(candidates, preferences, n=MAX)
            else:
                # Anonyme : tri par popularité + déduplication
                sorted_c = sorted(
                    candidates,
                    key=lambda h: (getattr(h, 'views_count', 0) or 0) + (getattr(h, 'likes_count', 0) or 0) * 2,
                    reverse=True
                )
                seen, recommended = set(), []
                for h in sorted_c:
                    if h.id not in seen:
                        seen.add(h.id)
                        recommended.append(h)
                    if len(recommended) >= MAX:
                        break

            serializer = HousingListSerializer(
                recommended, many=True, context={'request': request}
            )
            return Response(serializer.data)

        except Exception as e:
            import traceback; traceback.print_exc()
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
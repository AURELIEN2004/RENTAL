# # # ============================================
# # # 📁 apps/recherche/views.py
# # # ============================================



from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.db.models import Q

from apps.housing.models import Housing
from apps.housing.serializers import HousingListSerializer
from .utils import haversine, get_distance_category
from .scoring import compute_smart_score
from .ai import (
    extract_search_criteria,
    describe_criteria,
    generate_response,
    suggest_alternatives,
)
from .models import NearbyPlace, SearchHistory


class NLPSearchAPIView(APIView):
    """
    🔤 Recherche en langage naturel.

    POST /api/recherche/nlp/
    {
        "query"    : "Studio meublé à Yaoundé pour 50 000 FCFA",
        "language" : "fr",          // 'fr' | 'en'
        "method"   : "simple",      // 'simple' | 'ollama'
        "user_lat" : 3.848,         // optionnel
        "user_lng" : 11.502         // optionnel
    }

    Réponse :
    {
        "query"              : "...",
        "criteria_extracted" : { city, category_name, max_price, ... },
        "criteria_summary"   : "Recherche : Studio meublé à Yaoundé • max 50 000 FCFA",
        "count"              : 5,
        "results"            : [...],
        "suggestions"        : [...]
    }
    """
    permission_classes = [AllowAny]

    def post(self, request):
        user_query = request.data.get('query', '').strip()
        language   = request.data.get('language', 'fr')
        method     = request.data.get('method', 'simple')
        user_lat   = request.data.get('user_lat')
        user_lng   = request.data.get('user_lng')

        if not user_query:
            return Response({'error': 'query requis'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # 1. Extraction des critères
            criteria = extract_search_criteria(user_query, method=method, language=language)
            criteria['language'] = language

            # 2. Coordonnées GPS (optionnel)
            if user_lat and user_lng:
                try:
                    criteria['lat'] = float(user_lat)
                    criteria['lng'] = float(user_lng)
                except (ValueError, TypeError):
                    pass

            # 3. Résumé lisible pour l'interface
            summary = describe_criteria(criteria, language=language)

            # 4. Queryset de base
            queryset = Housing.objects.filter(
                is_visible=True, status='disponible'
            ).select_related(
                'owner', 'category', 'housing_type', 'region', 'city', 'district'
            ).prefetch_related('images')

            # 5. Application des filtres (CORRIGÉ)
            queryset = self._apply_filters(queryset, criteria)

            # 6. Scoring + géolocalisation
            results = []
            for h in queryset:
                distance = None
                if criteria.get('lat') and criteria.get('lng') and h.latitude and h.longitude:
                    distance   = haversine(criteria['lat'], criteria['lng'],
                                           h.latitude, h.longitude)
                    h.distance = round(distance, 2)
                    h.distance_category = get_distance_category(distance)
                h.score = compute_smart_score(h, criteria, distance)
                results.append(h)

            # 7. Tri
            sort_intent = criteria.get('sort')
            if sort_intent == 'price_asc':
                results.sort(key=lambda x: x.price)
            elif sort_intent == 'price_desc':
                results.sort(key=lambda x: -x.price)
            elif sort_intent == 'recent':
                results.sort(key=lambda x: -x.created_at.timestamp())
            else:
                results.sort(key=lambda x: -x.score)

            results = results[:20]

            # 8. Sérialisation
            serialized = HousingListSerializer(
                results, many=True, context={'request': request}
            ).data

            # 9. Suggestions si peu de résultats
            suggestions = []
            if len(results) < 3:
                suggestions = suggest_alternatives(criteria, language=language)

            # 10. Historique
            if request.user and request.user.is_authenticated:
                self._save_history(request.user, user_query, criteria, len(results))

            return Response({
                'query':              user_query,
                'criteria_extracted': {
                    k: v for k, v in criteria.items()
                    if k not in ('language', 'text_query')
                },
                'criteria_summary': summary,
                'count':            len(results),
                'results':          serialized,
                'suggestions':      suggestions,
            })

        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({
                'query':   user_query,
                'error':   str(e),
                'results': [],
                'count':   0,
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # -----------------------------------------------------------------------

    def _apply_filters(self, queryset, criteria: dict):
        """
        Applique les critères extraits au queryset.

        RÈGLE CLEF :
          - On n'utilise JAMAIS la requête brute originale comme filtre texte.
          - On utilise criteria['text_query'] (termes résiduels) seulement
            s'il n'est pas vide ET qu'il y a peu d'autres critères.
          - Les critères structurés (ville, catégorie, prix…) sont prioritaires.
        """

        # ── Ville ──────────────────────────────────────────────────────────
        if criteria.get('city'):
            queryset = queryset.filter(city__name__icontains=criteria['city'])

        # ── Quartier ───────────────────────────────────────────────────────
        if criteria.get('district_name'):
            queryset = queryset.filter(district__name__icontains=criteria['district_name'])

        # ── Catégorie ──────────────────────────────────────────────────────
        if criteria.get('category_name'):
            queryset = queryset.filter(category__name__icontains=criteria['category_name'])

        # ── Prix ───────────────────────────────────────────────────────────
        if criteria.get('min_price'):
            queryset = queryset.filter(price__gte=criteria['min_price'])
        if criteria.get('max_price'):
            queryset = queryset.filter(price__lte=criteria['max_price'])

        # ── Chambres ───────────────────────────────────────────────────────
        if criteria.get('min_rooms'):
            queryset = queryset.filter(rooms__gte=criteria['min_rooms'])

        # ── Surface ────────────────────────────────────────────────────────
        if criteria.get('min_area'):
            queryset = queryset.filter(area__gte=criteria['min_area'])

        # ── Meublé / Vide ──────────────────────────────────────────────────
        if criteria.get('furnished') is True:
            queryset = queryset.filter(
                Q(housing_type__name__icontains='meublé') |
                Q(housing_type__name__icontains='moderne')
            )
        elif criteria.get('furnished') is False:
            queryset = queryset.filter(housing_type__name__icontains='simple')

        # ── Équipements → additional_features + description + title ────────
        if criteria.get('features'):
            q_features = Q()
            for feat in criteria['features']:
                q_features |= Q(additional_features__icontains=feat)
                q_features |= Q(description__icontains=feat)
                q_features |= Q(title__icontains=feat)
            queryset = queryset.filter(q_features)

        # ── Lieux à proximité → NearbyPlace ────────────────────────────────
        if criteria.get('nearby_places'):
            housing_ids = []
            for h in queryset:
                nearby_qs = NearbyPlace.objects.filter(
                    city=h.city,
                    place_type__in=criteria['nearby_places']
                )
                if h.district:
                    # Quartier exact ou ville entière (OR)
                    nearby_qs = NearbyPlace.objects.filter(
                        Q(district=h.district) | Q(city=h.city, district__isnull=True),
                        place_type__in=criteria['nearby_places']
                    )
                if nearby_qs.exists():
                    housing_ids.append(h.id)
            # Fallback : si NearbyPlace vide → on ne filtre pas
            if housing_ids:
                queryset = queryset.filter(id__in=housing_ids)

        # ── Termes résiduels (text_query) ──────────────────────────────────
        # Utilisé SEULEMENT si aucun critère structuré n'a été trouvé
        # (= recherche vraiment libre par mots-clés)
        text_q = criteria.get('text_query', '').strip()
        has_structured = any(criteria.get(k) for k in [
            'city', 'district_name', 'category_name',
            'max_price', 'min_price', 'min_rooms', 'features', 'nearby_places'
        ])

        if text_q and not has_structured:
            # Recherche fulltext sur les termes résiduels
            q_text = Q()
            for term in text_q.split():
                q_text |= Q(title__icontains=term)
                q_text |= Q(description__icontains=term)
                q_text |= Q(city__name__icontains=term)
                q_text |= Q(district__name__icontains=term)
                q_text |= Q(additional_features__icontains=term)
            queryset = queryset.filter(q_text)

        return queryset

    def _save_history(self, user, query_text, criteria, results_count):
        try:
            SearchHistory.objects.create(
                user=user,
                query_text=query_text,
                min_price=criteria.get('min_price'),
                max_price=criteria.get('max_price'),
                min_rooms=criteria.get('min_rooms'),
                advanced_filters={
                    k: v for k, v in criteria.items()
                    if k not in ('language', 'lat', 'lng')
                },
                results_count=results_count,
                search_type='nlp',
                language=criteria.get('language', 'fr'),
            )
        except Exception as e:
            print(f"⚠️ Historique non sauvegardé : {e}")


# class HousingSearchAPIView(APIView):
#     def get(self, request):
#         return Response({"message": "Search API works"})




class HousingSearchAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):

        query = request.GET.get("query", "")
        category = request.GET.get("category")
        housing_type = request.GET.get("housing_type")

        region = request.GET.get("region")
        city = request.GET.get("city")
        district = request.GET.get("district")

        min_price = request.GET.get("min_price")
        max_price = request.GET.get("max_price")

        min_rooms = request.GET.get("min_rooms")
        max_rooms = request.GET.get("max_rooms")

        page = int(request.GET.get("page", 1))
        page_size = 10

        filters = {}

        if category:
            filters["category"] = category

        if housing_type:
            filters["housing_type"] = housing_type

        if region:
            filters["region"] = region

        if city:
            filters["city"] = city

        if district:
            filters["district"] = district

        if min_price:
            filters["min_price"] = min_price

        if max_price:
            filters["max_price"] = max_price

        if min_rooms:
            filters["min_rooms"] = min_rooms

        if max_rooms:
            filters["max_rooms"] = max_rooms

        engine = SearchEngine()

        results = engine.search(
            query=query,
            filters=filters
        )

        paginator = Paginator(results, page_size)

        page_obj = paginator.get_page(page)

        serializer = HousingSerializer(page_obj.object_list, many=True)

        return Response({
            "count": paginator.count,
            "total_pages": paginator.num_pages,
            "page": page,
            "results": serializer.data
        })


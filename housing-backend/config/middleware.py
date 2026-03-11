
# config/middleware.py — NOUVEAU FICHIER

class LanguageFromHeaderMiddleware:

    # Détecte la langue depuis :
    #   1. Header HTTP : X-Language: fr | en
    #   2. Paramètre URL : ?lang=fr | ?lang=en
    #   3. Fallback : LANGUAGE_CODE de settings
    # \"\"\"
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        lang = (
            request.GET.get('lang')
            or request.headers.get('X-Language')
            or 'fr'
        )
        from django.utils.translation import activate
        from django.utils import translation
        if lang in ('fr', 'en'):
            translation.activate(lang)
            request.LANGUAGE_CODE = lang
        return self.get_response(request)




# # ============================================================
# # config/middleware.py  — NOUVEAU FICHIER À CRÉER
# # ============================================================
# # Détecte la langue active à partir :
# #   1. Header HTTP  : X-Language: fr  (envoyé par api.js)
# #   2. Paramètre URL: ?lang=fr
# #   3. Header HTTP  : Accept-Language (standard navigateur)
# #   4. Fallback     : 'fr'
# # ============================================================

# from django.utils import translation


# class LanguageFromHeaderMiddleware:
#     """
#     Middleware qui active la bonne langue pour chaque requête.
#     Utilisé par django-modeltranslation pour retourner les
#     champs dans la langue correcte (title_fr vs title_en, etc.)
#     """

#     def __init__(self, get_response):
#         self.get_response = get_response

#     def __call__(self, request):
#         # 1. Priorité : header X-Language envoyé par le frontend React
#         lang = request.headers.get('X-Language', '').strip().lower()

#         # 2. Sinon : paramètre GET ?lang=
#         if lang not in ('fr', 'en'):
#             lang = request.GET.get('lang', '').strip().lower()

#         # 3. Sinon : header standard Accept-Language
#         if lang not in ('fr', 'en'):
#             accept = request.headers.get('Accept-Language', 'fr')
#             # Prendre la première langue de la liste (ex: "en-US,en;q=0.9")
#             lang = accept.split(',')[0].split('-')[0].strip().lower()

#         # 4. Fallback
#         if lang not in ('fr', 'en'):
#             lang = 'fr'

#         # Activer la langue pour cette requête
#         translation.activate(lang)
#         request.LANGUAGE_CODE = lang

#         response = self.get_response(request)

#         # Désactiver après la requête (bonne pratique)
#         translation.deactivate()

#         return response
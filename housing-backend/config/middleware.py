
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

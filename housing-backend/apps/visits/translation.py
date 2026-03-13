# ============================================================
# apps/visits/translation.py
# ============================================================

from modeltranslation.translator import TranslationOptions, register
from .models import Visit


@register(Visit)
class VisitTranslationOptions(TranslationOptions):
    """
    Champs traduits : message, response_message
    Colonnes créées :
      message_fr, message_en
      response_message_fr, response_message_en

    Exemple de saisie :
      Message (fr)          : Bonjour, je souhaite visiter ce logement...
      Message (en)          : Hello, I would like to visit this property...
      Réponse (fr)          : Visite confirmée pour samedi 10h
      Réponse (en)          : Visit confirmed for Saturday 10am
    """
    fields = ('message', 'response_message')
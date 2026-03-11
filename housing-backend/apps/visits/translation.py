# ============================================================
# apps/visits/translation.py
# ============================================================
# Modèles traduits :
#   ┌───────┬────────────────────────────────────────────────┐
#   │ Modèle│ Champs traduits                               │
#   ├───────┼────────────────────────────────────────────────┤
#   │ Visit │ message, response_message                     │
#   └───────┴────────────────────────────────────────────────┘
#
# Colonnes générées :
#   message          → message_fr          | message_en
#   response_message → response_message_fr | response_message_en
#
# Note :
#   - message          = texte libre du locataire (sa demande)
#   - response_message = réponse du propriétaire
#
#   Ces deux champs sont écrits par les utilisateurs dans leur
#   langue. Le frontend doit sauvegarder dans le bon champ
#   selon la langue active :
#     si language='fr' → message_fr
#     si language='en' → message_en
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
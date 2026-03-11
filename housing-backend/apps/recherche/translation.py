# ============================================================
# apps/recherche/translation.py
# ============================================================
# Modèles traduits :
#   ┌──────────────────────┬────────────────────────────────┐
#   │ Modèle               │ Champs traduits                │
#   ├──────────────────────┼────────────────────────────────┤
#   │ NearbyPlace          │ name, address, description     │
#   │ ChatbotMessage       │ content                        │
#   │ SearchHistory        │ query_text                     │
#   └──────────────────────┴────────────────────────────────┘
#
# Colonnes générées :
#   NearbyPlace.name        → name_fr        | name_en
#   NearbyPlace.address     → address_fr     | address_en
#   NearbyPlace.description → description_fr | description_en
#   ChatbotMessage.content  → content_fr     | content_en
#   SearchHistory.query_text→ query_text_fr  | query_text_en
#
# Note : SearchPreference et ChatbotConversation n'ont pas
# de champs texte libres à traduire (FloatField, JSONField,
# session_id, language sont techniques/neutres).
# ============================================================

from modeltranslation.translator import TranslationOptions, register
from .models import NearbyPlace, ChatbotMessage, SearchHistory


@register(NearbyPlace)
class NearbyPlaceTranslationOptions(TranslationOptions):
    """
    Champs traduits : name, address, description
    Colonnes créées :
      name_fr, name_en
      address_fr, address_en
      description_fr, description_en

    Exemple de saisie admin :
      Nom (fr)         : École Publique de Bastos
      Nom (en)         : Bastos Public School
      Adresse (fr)     : Rue de Bastos, Yaoundé
      Adresse (en)     : Bastos Street, Yaoundé
      Description (fr) : École primaire à 200m
      Description (en) : Primary school 200m away
    """
    fields = ('name', 'address', 'description')


@register(ChatbotMessage)
class ChatbotMessageTranslationOptions(TranslationOptions):
    """
    Champs traduits : content
    Colonnes créées : content_fr, content_en

    Le chatbot génère ses réponses dans la langue de la
    conversation (stockée dans ChatbotConversation.language).
    La réponse est stockée dans content_fr ou content_en
    selon cette langue.
    """
    fields = ('content',)


@register(SearchHistory)
class SearchHistoryTranslationOptions(TranslationOptions):
    """
    Champs traduits : query_text
    Colonnes créées : query_text_fr, query_text_en

    La requête de recherche est stockée dans la langue
    dans laquelle elle a été saisie/dictée.
    """
    fields = ('query_text',)
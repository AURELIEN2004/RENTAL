# ============================================================
# apps/messaging/translation.py
# ============================================================
# Modèles traduits :
#   ┌─────────────┬────────────────────────────────────────┐
#   │ Modèle      │ Champs traduits                        │
#   ├─────────────┼────────────────────────────────────────┤
#   │ Message     │ content                                │
#   └─────────────┴────────────────────────────────────────┘
#
# Colonnes générées :
#   content → content_fr | content_en
#
# Note : Conversation n'a aucun champ texte libre à traduire
# (housing et participants sont des FK, pas du texte).
#
# Message.content contient le texte du message. L'utilisateur
# écrit dans sa langue → stocké dans content_fr ou content_en
# selon sa langue active au moment de l'envoi.
# ============================================================

from modeltranslation.translator import TranslationOptions, register
from .models import Message


@register(Message)
class MessageTranslationOptions(TranslationOptions):
    """
    Champs traduits : content
    Colonnes créées : content_fr, content_en

    Exemple de création dans la view :
        lang = request.headers.get('X-Language', 'fr')
        msg_data = {
            'conversation': conversation,
            'sender': request.user,
            f'content_{lang}': request.data.get('content', ''),
        }
    """
    fields = ('content',)
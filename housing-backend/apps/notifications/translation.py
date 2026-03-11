# ============================================================
# apps/notifications/translation.py
# ============================================================
# Modèles traduits :
#   ┌──────────────┬───────────────────────────────────────┐
#   │ Modèle       │ Champs traduits                       │
#   ├──────────────┼───────────────────────────────────────┤
#   │ Notification │ title, message                        │
#   └──────────────┴───────────────────────────────────────┘
#
# Colonnes générées :
#   title   → title_fr   | title_en
#   message → message_fr | message_en
#
# IMPORTANT : Puisque les notifications sont créées
# dynamiquement dans les views (pas dans l'admin), il faut
# mettre à jour tous les appels Notification.objects.create()
# pour renseigner les deux langues.
# Voir notifications_views_patch.py pour les exemples.
# ============================================================

from modeltranslation.translator import TranslationOptions, register
from .models import Notification


@register(Notification)
class NotificationTranslationOptions(TranslationOptions):
    """
    Champs traduits : title, message
    Colonnes créées : title_fr, title_en, message_fr, message_en

    Exemple de création bilingue dans une view :
        Notification.objects.create(
            user=housing.owner,
            type='visit',
            title_fr='Nouvelle demande de visite',
            title_en='New visit request',
            message_fr=f'{user.username} souhaite visiter {housing.title_fr}',
            message_en=f'{user.username} wants to visit {housing.title_en}',
            link='/dashboard?tab=reservations'
        )
    """
    fields = ('title', 'message')
# ============================================================
# apps/location/translation.py
# ============================================================
# Modèles traduits :
#   ┌──────────┬──────────────────────────────────────────┐
#   │ Modèle   │ Champs traduits                          │
#   ├──────────┼──────────────────────────────────────────┤
#   │ Region   │ name                                     │
#   │ City     │ name                                     │
#   │ District │ name                                     │
#   └──────────┴──────────────────────────────────────────┘
#
# Colonnes générées automatiquement par la migration :
#   name → name_fr | name_en
# ============================================================

from modeltranslation.translator import TranslationOptions, register
from .models import Region, City, District


@register(Region)
class RegionTranslationOptions(TranslationOptions):
    """
    Champs traduits : name
    Colonnes créées : name_fr, name_en

    Exemple de saisie admin :
      Nom (fr) : Centre
      Nom (en) : Centre Region

      Nom (fr) : Littoral
      Nom (en) : Littoral Region
    """
    fields = ('name',)


@register(City)
class CityTranslationOptions(TranslationOptions):
    """
    Champs traduits : name
    Colonnes créées : name_fr, name_en

    Exemple de saisie admin :
      Nom (fr) : Yaoundé
      Nom (en) : Yaoundé

      Nom (fr) : Douala
      Nom (en) : Douala

    Note : les noms de villes camerounaises sont généralement
    identiques FR/EN, mais ce champ permet d'ajouter une
    orthographe ou description localisée si nécessaire.
    """
    fields = ('name',)


@register(District)
class DistrictTranslationOptions(TranslationOptions):
    """
    Champs traduits : name
    Colonnes créées : name_fr, name_en

    Exemple de saisie admin :
      Nom (fr) : Bastos
      Nom (en) : Bastos

      Nom (fr) : Akwa
      Nom (en) : Akwa
    """
    fields = ('name',)
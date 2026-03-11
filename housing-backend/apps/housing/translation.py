
    # ============================================================
# apps/housing/translation.py
# ============================================================
# Modèles traduits :
#   ┌─────────────────┬─────────────────────────────────────┐
#   │ Modèle          │ Champs traduits                     │
#   ├─────────────────┼─────────────────────────────────────┤
#   │ Category        │ name, description                   │
#   │ HousingType     │ name, description                   │
#   │ Housing         │ title, description,                 │
#   │                 │ additional_features                 │
#   │ Comment         │ content                             │
#   │ Testimonial     │ content                             │
#   └─────────────────┴─────────────────────────────────────┘
#
# Colonnes générées automatiquement par la migration :
#   name               → name_fr        | name_en
#   description        → description_fr | description_en
#   title              → title_fr       | title_en
#   additional_features→ additional_features_fr | additional_features_en
#   content            → content_fr     | content_en
# ============================================================

from modeltranslation.translator import TranslationOptions, register
from .models import Category, HousingType, Housing, Comment, Testimonial


@register(Category)
class CategoryTranslationOptions(TranslationOptions):
    """
    Champs traduits : name, description
    Colonnes créées : name_fr, name_en, description_fr, description_en

    Exemple de saisie admin :
      Nom (fr)         : Appartement
      Nom (en)         : Apartment
      Description (fr) : Logement en immeuble collectif
      Description (en) : Housing in a residential building
    """
    fields = ('name', 'description')


@register(HousingType)
class HousingTypeTranslationOptions(TranslationOptions):
    """
    Champs traduits : name, description
    Colonnes créées : name_fr, name_en, description_fr, description_en

    Exemple de saisie admin :
      Nom (fr)         : Meublé moderne
      Nom (en)         : Modern furnished
      Description (fr) : Logement entièrement équipé
      Description (en) : Fully equipped housing
    """
    fields = ('name', 'description')


@register(Housing)
class HousingTranslationOptions(TranslationOptions):
    """
    Champs traduits : title, description, additional_features
    Colonnes créées :
      title_fr, title_en
      description_fr, description_en
      additional_features_fr, additional_features_en

    Les champs NON traduits (identiques dans toutes les langues) :
      price, area, rooms, bathrooms, status, latitude, longitude,
      views_count, likes_count, is_visible, video, virtual_360

    Exemple de saisie admin :
      Titre (fr)        : Appartement F3 meublé à Bastos
      Titre (en)        : Furnished 3-room apartment in Bastos
      Description (fr)  : Bel appartement au 3ème étage...
      Description (en)  : Beautiful apartment on the 3rd floor...
    """
    fields = ('title', 'description', 'additional_features')


@register(Comment)
class CommentTranslationOptions(TranslationOptions):
    """
    Champs traduits : content
    Colonnes créées : content_fr, content_en

    Note : les commentaires sont écrits par les utilisateurs dans leur langue.
    Le champ content_fr stocke le commentaire original si l'utilisateur
    écrit en français, content_en s'il écrit en anglais.
    Le champ `content` (sans suffixe) retourne automatiquement
    la version de la langue active.
    """
    fields = ('content',)


@register(Testimonial)
class TestimonialTranslationOptions(TranslationOptions):
    """
    Champs traduits : content
    Colonnes créées : content_fr, content_en

    Même logique que Comment.
    """
    fields = ('content',)
# apps/housing/translation.py
# ============================================================
# Enregistrement des champs à traduire via django-modeltranslation
# Crée automatiquement : title_fr, title_en, description_fr, etc.
# ============================================================

from modeltranslation.translator import TranslationOptions, register
from .models import Category, HousingType, Housing, Comment, Testimonial


@register(Category)
class CategoryTranslationOptions(TranslationOptions):
    """
    name_fr, name_en
    description_fr, description_en
    """
    fields = ('name', 'description')


@register(HousingType)
class HousingTypeTranslationOptions(TranslationOptions):
    """
    name_fr, name_en
    description_fr, description_en
    """
    fields = ('name', 'description')


@register(Housing)
class HousingTranslationOptions(TranslationOptions):
    """
    title_fr, title_en
    description_fr, description_en
    additional_features_fr, additional_features_en
    """
    fields = ('title', 'description', 'additional_features')


@register(Comment)
class CommentTranslationOptions(TranslationOptions):
    """content_fr, content_en"""
    fields = ('content',)


@register(Testimonial)
class TestimonialTranslationOptions(TranslationOptions):
    """content_fr, content_en"""
    fields = ('content',)
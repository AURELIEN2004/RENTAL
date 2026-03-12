
// // ============================================
// // src/contexts/ThemeContext.jsx
// // ============================================

// import React, { createContext, useContext, useState, useEffect } from 'react';

// const ThemeContext = createContext(null);

// export const useTheme = () => {
//   const context = useContext(ThemeContext);
//   if (!context) {
//     throw new Error('useTheme must be used within ThemeProvider');
//   }
//   return context;
// };

// export const ThemeProvider = ({ children }) => {
//   const [theme, setTheme] = useState('light');
//   const [language, setLanguage] = useState('fr');

//   useEffect(() => {
//     const savedTheme = localStorage.getItem('theme') || 'light';
//     const savedLang = localStorage.getItem('language') || 'fr';
//     setTheme(savedTheme);
//     setLanguage(savedLang);
//     document.documentElement.setAttribute('data-theme', savedTheme);
//   }, []);

//   const toggleTheme = () => {
//     const newTheme = theme === 'light' ? 'dark' : 'light';
//     setTheme(newTheme);
//     localStorage.setItem('theme', newTheme);
//     document.documentElement.setAttribute('data-theme', newTheme);
//   };

//   const toggleLanguage = () => {
//     const newLang = language === 'fr' ? 'en' : 'fr';
//     setLanguage(newLang);
//     localStorage.setItem('language', newLang);
//   };

//   const t = (key) => {
//     // Fonction de traduction simple (peut être améliorée avec i18n)
//     const translations = {
//       fr: {
//         home: 'Accueil',
//         search: 'Rechercher',
//         about: 'À propos',
//         services: 'Services',
//         contact: 'Contact',
//         login: 'Connexion',
//         register: 'Inscription',
//         logout: 'Déconnexion',
//         dashboard: 'Tableau de bord',
//         // ... autres traductions
//       },
//       en: {
//         home: 'Home',
//         search: 'Search',
//         about: 'About',
//         services: 'Services',
//         contact: 'Contact',
//         login: 'Login',
//         register: 'Register',
//         logout: 'Logout',
//         dashboard: 'Dashboard',
//         // ... autres traductions
//       },
//     };

//     return translations[language][key] || key;
//   };

//   return (
//     <ThemeContext.Provider value={{ theme, toggleTheme, language, toggleLanguage, t }}>
//       {children}
//     </ThemeContext.Provider>
//   );
// };


// src/contexts/ThemeContext.jsx
// ============================================================
// Gestion centralisée : mode sombre/clair + traduction FR/EN
// Utilisation : const { theme, toggleTheme, language, t } = useTheme();
// ============================================================

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext(null);

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};

// ─── Dictionnaire de traductions ────────────────────────────────────────────
const TRANSLATIONS = {
  fr: {
    // ── Navbar ──────────────────────────────────────────────
    home:               'Accueil',
    search:             'Rechercher',
    about:              'À propos',
    services:           'Services',
    contact:            'Contact',
    login:              'Connexion',
    register:           'Inscription',
    logout:             'Déconnexion',
    dashboard:          'Tableau de bord',
    theme_toggle:       'Changer le thème',
    lang_toggle:        'Switch to English',

    // ── Footer ──────────────────────────────────────────────
    footer_about:       'À propos',
    footer_desc:        'Plateforme innovante de location de logements au Cameroun. Trouvez le logement idéal grâce à notre algorithme intelligent.',
    footer_quick_links: 'Liens Rapides',
    footer_testimonials:'Témoignages',
    footer_contact:     'Contact',
    footer_mobile_app:  'Application Mobile',
    footer_mobile_desc: 'Téléchargez notre application (version test)',
    footer_rights:      'Tous droits réservés.',
    footer_privacy:     'Politique de confidentialité',
    footer_terms:       "Conditions d'utilisation",
    footer_legal:       'Mentions légales',

    // ── Home ────────────────────────────────────────────────
    hero_title:         'Trouvez Votre Logement Idéal',
    hero_subtitle:      'Plateforme intelligente de location de logements au Cameroun',
    hero_cta:           'Rechercher un logement',
    hero_refine:        'Affiner mes recommandations',
    stats_housings:     'Logements disponibles',
    stats_cities:       'Villes couvertes',
    stats_clients:      'Clients satisfaits',
    stats_support:      'Support disponible',
    featured_title:     'Logements en Vedette',
    featured_subtitle:  'Sélectionnés par notre algorithme génétique intelligent',
    featured_refine:    '· Affiner mes préférences',
    featured_empty:     'Aucune recommandation disponible pour le moment.',
    featured_browse:    'Parcourir les logements',
    view_all:           'Voir tous les logements',
    how_title:          'Comment Ça Marche ?',
    step1_title:        'Recherchez',
    step1_desc:         'Utilisez notre recherche intelligente ou la voix',
    step2_title:        'Comparez',
    step2_desc:         'Consultez les détails, photos et localisation',
    step3_title:        'Contactez',
    step3_desc:         'Discutez directement avec le propriétaire',
    step4_title:        'Visitez',
    step4_desc:         'Planifiez une visite et trouvez votre logement',
    cta_owner_title:    'Vous êtes propriétaire ?',
    cta_owner_desc:     'Publiez vos logements gratuitement et touchez des milliers de locataires',
    cta_start:          'Commencer Maintenant',

    // ── About ───────────────────────────────────────────────
    about_title:        'À Propos de RentAL',
    about_subtitle:     'Votre partenaire de confiance pour trouver le logement idéal au Cameroun',
    about_mission_title:'Notre Mission',
    about_mission_text: "RentAL a pour mission de faciliter la recherche et la location de logements au Cameroun en utilisant les technologies les plus innovantes. Nous croyons que trouver un logement ne devrait pas être compliqué.",
    about_innov_title:  'Notre Innovation',
    innov_genetic:      'Algorithme Génétique',
    innov_genetic_desc: 'Notre système utilise un algorithme génétique avancé pour vous recommander les logements les plus pertinents selon vos préférences et votre budget.',
    innov_geo:          'Géolocalisation',
    innov_geo_desc:     'Visualisez les logements sur une carte interactive et trouvez ceux qui sont proches de vos lieux d\'intérêt.',
    innov_msg:          'Messagerie Intégrée',
    innov_msg_desc:     'Communiquez directement avec les propriétaires via notre messagerie sécurisée.',
    innov_mobile:       'Multiplateforme',
    innov_mobile_desc:  'Accédez à nos services sur le web et via notre application mobile iOS et Android.',
    about_values_title: 'Nos Valeurs',
    val_transparency:   '🎯 Transparence',
    val_transparency_d: 'Toutes les informations sur les logements sont vérifiées et transparentes.',
    val_trust:          '🤝 Confiance',
    val_trust_d:        'Nous vérifions l\'identité de tous nos propriétaires et modérons activement les annonces.',
    val_speed:          '⚡ Rapidité',
    val_speed_d:        'Notre plateforme vous permet de trouver et contacter des propriétaires en quelques clics.',
    val_access:         '🌍 Accessibilité',
    val_access_d:       'Service gratuit pour les locataires, interface multilingue et support 24/7.',
    about_stats_title:  'RentAL en Chiffres',
    stat_housings_label:'Logements disponibles',
    stat_cities_label:  'Villes couvertes',
    stat_users_label:   'Utilisateurs actifs',
    stat_satisfaction:  'Taux de satisfaction',
    about_team_title:   'Notre Équipe',
    about_team_text:    'RentAL est développé par une équipe passionnée de développeurs et de professionnels de l\'immobilier basés à Yaoundé, Cameroun.',
    about_cta_title:    'Prêt à trouver votre logement idéal ?',
    about_cta_register: 'Créer un compte gratuitement',
    about_cta_browse:   'Parcourir les logements',

    // ── Contact ─────────────────────────────────────────────
    contact_title:      'Contactez-nous',
    contact_subtitle:   'Nous sommes là pour vous aider',
    contact_name:       'Nom complet',
    contact_email:      'Adresse email',
    contact_subject:    'Sujet',
    contact_message:    'Message',
    contact_send:       'Envoyer le message',
    contact_sending:    'Envoi en cours...',
    contact_success:    'Message envoyé avec succès !',
    contact_info_title: 'Informations de contact',
    contact_hours:      'Lundi - Vendredi : 8h - 18h',
    contact_location:   'Yaoundé, Cameroun',
    contact_whatsapp:   'Discuter sur WhatsApp',

    // ── Services ────────────────────────────────────────────
    services_title:     'Nos Services',
    services_subtitle:  'Des solutions complètes pour locataires et propriétaires',
    services_tenant:    'Pour les Locataires',
    services_tenant_sub:'Trouvez votre logement idéal en toute simplicité',
    services_owner:     'Pour les Propriétaires',
    services_owner_sub: 'Louez vos logements rapidement et efficacement',
    svc_search:         'Recherche Intelligente',
    svc_search_d:       'Trouvez rapidement le logement idéal grâce à notre algorithme de recommandation.',
    svc_geo:            'Géolocalisation',
    svc_geo_d:          'Visualisez les logements sur une carte et calculez les itinéraires.',
    svc_msg:            'Messagerie Sécurisée',
    svc_msg_d:          'Communiquez directement avec les propriétaires via notre messagerie intégrée.',
    svc_visit:          'Planification de Visites',
    svc_visit_d:        'Planifiez vos visites en ligne et recevez des confirmations instantanées.',
    svc_virtual:        'Visites Virtuelles',
    svc_virtual_d:      'Découvrez les logements à distance grâce aux vidéos et visites 360°.',
    svc_notif:          'Notifications',
    svc_notif_d:        'Recevez des alertes instantanées pour les nouveaux logements correspondant à vos critères.',
    svc_manage:         'Gestion Complète',
    svc_manage_d:       'Dashboard intuitif pour gérer tous vos logements, visites et réservations.',
    svc_stats:          'Statistiques Détaillées',
    svc_stats_d:        'Suivez les performances de vos annonces : vues, likes, taux de conversion.',
    svc_comm:           'Communication Facilitée',
    svc_comm_d:         'Répondez rapidement aux demandes des locataires via notre messagerie.',
    svc_media:          'Médias Enrichis',
    svc_media_d:        'Ajoutez des photos, vidéos et visites virtuelles pour valoriser vos logements.',
    svc_alert:          'Alertes en Temps Réel',
    svc_alert_d:        'Recevez des notifications pour chaque nouvelle demande de visite.',
    svc_mobile:         'Gestion Mobile',
    svc_mobile_d:       'Gérez vos logements depuis votre smartphone avec notre application.',
    process_title:      'Comment ça marche ?',
    process_step1:      'Inscription',
    process_step1_d:    'Créez votre compte gratuitement en quelques clics',
    process_step2:      'Recherche',
    process_step2_d:    'Parcourez ou publiez des logements',
    process_step3:      'Contact',
    process_step3_d:    'Échangez via notre messagerie sécurisée',
    process_step4:      'Visite',
    process_step4_d:    'Planifiez et effectuez une visite',
    svc_cta_title:      'Prêt à commencer ?',
    svc_cta_sub:        'Rejoignez des milliers d\'utilisateurs satisfaits',
    svc_cta_register:   'Créer un compte',
    svc_cta_browse:     'Voir les logements',

    // ── Auth ────────────────────────────────────────────────
    login_title:        'Connexion',
    login_subtitle:     'Accédez à votre espace personnel',
    login_username:     "Nom d'utilisateur ou Email",
    login_password:     'Mot de passe',
    login_remember:     'Se souvenir de moi',
    login_forgot:       'Mot de passe oublié ?',
    login_btn:          'Se connecter',
    login_loading:      'Connexion...',
    login_or:           'OU',
    login_google:       'Continuer avec Google',
    login_facebook:     'Continuer avec Facebook',
    login_no_account:   "Vous n'avez pas de compte ?",
    login_signup:       'Inscrivez-vous',
    register_title:     'Inscription',
    register_subtitle:  'Créez votre compte gratuitement',
    register_firstname: 'Prénom',
    register_lastname:  'Nom',
    register_username:  "Nom d'utilisateur",
    register_email:     'Adresse email',
    register_phone:     'Téléphone',
    register_password:  'Mot de passe',
    register_confirm:   'Confirmer le mot de passe',
    register_role:      'Je suis',
    register_tenant:    'Locataire',
    register_owner:     'Propriétaire',
    register_btn:       'Créer mon compte',
    register_loading:   'Inscription...',
    register_have_acct: 'Déjà un compte ?',
    register_login:     'Connectez-vous',

    // ── Dashboard commun ────────────────────────────────────
    my_profile:         'Mon Profil',
    my_housings:        'Mes Logements',
    add_housing:        'Ajouter un logement',
    statistics:         'Statistiques',
    visibility:         'Visibilité',
    reservations:       'Réservations',
    messages:           'Messages',
    notifications:      'Notifications',
    settings:           'Paramètres',
    favorites:          'Favoris',
    saved:              'Sauvegardés',
    visits:             'Visites',
    overview:           'Vue d\'ensemble',
    users:              'Utilisateurs',
    disconnect:         'Déconnexion',

    admin_panel: "Admin",

dashboard_overview: "Vue d'ensemble",

users: "Utilisateurs",

housings: "Logements",

profile: "Profil",

support: "Support",

notifications: "Notifications",

    email: 'Email',
phone: 'Téléphone',
not_provided: 'Non renseigné',
member_since: 'Membre depuis',
edit_profile: 'Modifier le profil',
change_password: 'Changer le mot de passe',
owner: 'Propriétaire',
tenant: 'Locataire',

admin_profile_title: "Mon Profil Admin",
admin_role: "Administrateur",

email: "Email",
phone: "Téléphone",

member_since: "Membre depuis",
not_provided: "Non renseigné",

edit_profile: "Modifier le profil",
change_password: "Changer le mot de passe",

// edit profle
profile_edit_title: "Modifier mon profil",

profile_remove_photo: "Supprimer la photo",

profile_personal_info: "Informations personnelles",

profile_first_name: "Prénom",
profile_last_name: "Nom",

profile_first_name_placeholder: "Votre prénom",
profile_last_name_placeholder: "Votre nom",

profile_email: "Email",
profile_email_placeholder: "votre@email.com",

profile_phone: "Téléphone",
profile_phone_placeholder: "+237 6XX XXX XXX",

profile_search_preferences: "Préférences de recherche",

profile_max_budget: "Budget maximum (FCFA)",
profile_budget_placeholder: "Ex: 50000",

profile_saving: "Enregistrement...",

save: "Enregistrer",
cancel: "Annuler",

// change_password
change_password_title: "Changer le mot de passe",

old_password: "Ancien mot de passe",
old_password_placeholder: "Entrez votre ancien mot de passe",

new_password: "Nouveau mot de passe",
new_password_placeholder: "Minimum 8 caractères",

confirm_new_password: "Confirmer le nouveau mot de passe",
confirm_password_placeholder: "Répétez le nouveau mot de passe",

password_tips_title: "Conseils pour un mot de passe sécurisé :",

password_tip_1: "Au moins 8 caractères",
password_tip_2: "Combiner lettres majuscules et minuscules",
password_tip_3: "Inclure des chiffres et des caractères spéciaux",
password_tip_4: "Ne pas utiliser d'informations personnelles",

changing_password: "Modification...",
change_password: "Modifier",
cancel: "Annuler",


all_categories: 'Toutes les catégories',
total: 'Total',
available_plural: 'Disponibles',
reserved_plural: 'Réservés',
occupied_plural: 'Occupés',

add_housing_title: 'Ajouter un logement',
edit_housing_title: 'Modifier le logement',
general_information: 'Informations générales',
title: 'Titre',
category: 'Catégorie',
type: 'Type',
select_option: 'Sélectionner',
description: 'Description',
features: 'Caractéristiques',
monthly_price: 'Prix mensuel',
area_label: 'Superficie',
rooms_label: 'Chambres',
bathrooms_label: 'Douches',
additional_features: 'Caractéristiques supplémentaires',
location: 'Localisation',
region: 'Région',
city: 'Ville',
district: 'Quartier',
enable_gps: 'Activer GPS',
capturing_gps: 'Capture...',
media: 'Médias',
photos: 'Photos',
video: 'Vidéo',
virtual_visit: 'Visite 360° URL',
publish: 'Publier',
processing: 'En cours...',
optionnal: 'Optionnel',

edit_housing: 'Modifier',
basic_information: 'Informations de base',
features: 'Caractéristiques',
price: 'Prix',
status: 'Statut',
location: 'Localisation',
region: 'Région',
city: 'Ville',
district: 'Quartier',
update_gps: 'Mettre à jour GPS',
gps_location: 'Localisation...',
media: 'Médias',
new_photos: 'Nouvelles photos',
video: 'Vidéo',
virtual_visit_url: 'URL visite virtuelle',
saving: 'Enregistrement...',
update: 'Mettre à jour',

stats_title: '📊 Statistiques de mes logements',
total_housings: 'Total logements',
available: 'Disponibles',
reserved: 'Réservés',
occupied: 'Occupés',
status_distribution: 'Répartition par statut',
top_housings: '📈 Logements les plus vus',
no_housings_stats: 'Aucun logement disponible pour les statistiques',

visibility_title: 'Gestion de la Visibilité',
visibility_subtitle: 'Contrôlez la visibilité et le statut de vos logements',
total: 'Total',
visible: 'Visibles',
hidden: 'Masqués',
available: 'Disponibles',
filter_all: 'Tous',
empty_housing: 'Aucun logement à afficher',
info_title: '💡 À savoir',
info_visible: 'Visible : Le logement apparaît dans les résultats de recherche',
info_hidden: 'Masqué : Le logement n\'est plus visible publiquement',
info_occupied: 'Statut "Occupé" : Masque automatiquement le logement',
visibility_label: 'Visibilité',
status_label: 'Statut',
visible_btn: 'Visible',
hidden_btn: 'Masqué',

  status_options_disponible: 'Disponible',
  status_options_reserve: 'Réservé',
  status_options_occupe: 'Occupé'
,
stats_label: 'Statistiques',

// pour la visite
visits_loading: "Chargement des visites...",
visits_title_owner: "Demandes de Visites",
visits_title_tenant: "Mes Visites",

visits_stats_total: "Total",
visits_stats_waiting: "En attente",
visits_stats_confirmed: "Confirmées",
visits_stats_refused: "Refusées",
visits_stats_cancelled: "Annulées",
visits_stats_upcoming: "À venir",

visits_filter_all: "Toutes",
visits_filter_waiting: "En attente",
visits_filter_confirmed: "Confirmées",
visits_filter_refused: "Refusées",
visits_filter_cancelled: "Annulées",
visits_filter_upcoming: "À venir",
visits_filter_past: "Passées",

visits_empty: "Aucune visite",

visits_label_owner: "Propriétaire",
visits_label_tenant: "Locataire",
visits_label_view_housing: "Voir logement",
visits_label_confirm: "Confirmer",
visits_label_refuse: "Refuser",
visits_label_cancel: "Annuler",

visits_modal_title: "Refuser la visite",
visits_modal_placeholder: "Message optionnel",
visits_modal_submit: "Confirmer refus",
visits_modal_cancel: "Annuler"
,

// pour les message
messages_loading: "Chargement des conversations...",
messages_select_conversation: "Sélectionnez une conversation",
messages_choose_conversation: "Choisissez une conversation dans la liste pour commencer à échanger",

messages_header_title: "Messages",
messages_search_placeholder: "🔍 Rechercher une conversation...",

messages_empty_search: "Aucune conversation trouvée",
messages_empty_conversations: "Vous n'avez pas encore de conversations",

messages_user_default: "Utilisateur",

messages_view_housing: "Voir le logement",
messages_call: "Appeler",
messages_more_options: "Plus d'options",

messages_housing_details: "Voir les détails →",

messages_loading_messages: "Chargement des messages...",
messages_no_messages: "Aucun message pour le moment",
messages_start_conversation: "Envoyez le premier message pour commencer la conversation",

messages_you_prefix: "Vous: ",
messages_photo: "📷 Photo",
messages_video: "🎥 Vidéo",
messages_start: "Commencer la conversation",

messages_write_message: "Écrivez votre message...",
messages_add_image: "Ajouter une image",
messages_add_video: "Ajouter une vidéo",


// pour notification
notifications_loading: "Chargement des notifications...",
notif_mark_all: "Tout marquer comme lu",
notif_filter_all: "Toutes",
notif_filter_unread: "Non lues",
notif_filter_read: "Lues",
notif_view: "Voir →",
notif_unread_label: "non lue",
notif_unread_single: "non lue",
notif_unread_plural: "non lues",
notif_error_load: "Erreur lors du chargement des notifications",
notif_error_mark: "Erreur lors du marquage",
notif_delete_confirm: "Supprimer cette notification ?",

// pour parametre
settings_title: "Paramètres",
settings_email_notifications: "Notifications par email",
settings_push_notifications: "Notifications push",
settings_language: "Langue",
settings_theme: "Thème",
settings_danger_zone: "Zone de danger",
settings_delete_account: "Supprimer mon compte",
confirm_delete_account: "Êtes-vous sûr de vouloir supprimer votre compte ?",
theme_light: "Clair",
theme_dark: "Sombre",  

// dashbord
owner_dashboard: "Dashboard Propriétaire",
menu_profile: "Mon Profil",
menu_housings: "Mes Logements",
menu_add_housing: "Ajouter un logement",
menu_stats: "Statistiques",
menu_visibility: "Visibilité",
menu_reservations: "Réservations",
menu_messages: "Messages",
menu_notifications: "Notifications",
menu_settings: "Paramètres",
logout: "Déconnexion",

tenant_dashboard: "Dashboard Locataire",
menu_profile: "Mon profil",
menu_favorites: "Favoris",
menu_saved: "Enregistrés",
menu_visits: "Visites",
menu_messages: "Messages",
menu_notifications: "Notifications",
menu_settings: "Paramètres",
logout: "Déconnexion",

// favoris save
favorites_title: "Mes favoris",
favorites_empty: "Vous n'avez pas encore de favoris",

saved_title: "Logements enregistrés",
saved_empty: "Vous n'avez pas encore enregistré de logements",

browse_housings: "Parcourir les logements",

remove: "Retirer",
confirm_remove: "Retirer ce logement ?",

loading: "Chargement...",

// dashbord admin
dashboard_overview: "Vue d'ensemble",

users: "Utilisateurs",

total: "Total",

owners: "Propriétaires",

tenants: "Locataires",

blocked: "Bloqués",

housings: "Logements",

visible: "Visibles",

hidden: "Masqués",

available: "Disponibles",

top_owners: "Top Propriétaires",

// user
users_management: "Gestion des utilisateurs",

photo: "Photo",
name: "Nom",
email: "Email",
role: "Rôle",
housings: "Logements",
status: "Statut",
registered_on: "Inscrit le",
actions: "Actions",

owner: "Propriétaire",
tenant: "Locataire",

blocked: "Bloqué",
active: "Actif",

view_details: "Voir détails",
block: "Bloquer",
unblock: "Débloquer",
delete: "Supprimer",

back: "Retour",

user_details: "Détails utilisateur",

phone: "Téléphone",
not_provided: "Non renseigné",


// logement
housings_management: "Gestion des logements",

all_owners: "Tous les propriétaires",

all: "Tous",

visible: "Visibles",
hidden: "Masqués",

hide: "Masquer",
activate: "Activer",

delete: "Supprimer",

support_client: "Support client",
user_conversations: "Conversations avec les utilisateurs",


// detail page
    loading: "Chargement...",
    notFound: "Logement non trouvé",
    back: "Retour",
    home: "Accueil",
    search: "Recherche",
    rooms: "chambres",
    baths: "douches",
    views: "vues",
    favorites: "Favoris",
    planVisit: "Planifier une visite",
    description: "Description",
    additionalFeatures: "Caractéristiques supplémentaires",
    virtualVisit: "Visite Virtuelle",
    route: "Tracer l'itinéraire",
    owner: "Propriétaire",
    info: "Informations",
    published: "Publié le",
    type: "Type",
    category: "Catégorie",
    date: "Date",
    time: "Heure",
    cancel: "Annuler",
    confirm: "Confirmer",
    WhatsApp: "WhatsApp",
    call: "Appeler",
    message: "Message",
    location: "Localisation",
    tour: "Visite 360°",
  
 // page home
  
    home_hero_title: "Trouvez votre logement idéal",
home_hero_subtitle: "Plateforme intelligente de location de logements au Cameroun",

search_housing: "Rechercher logement",
refine_recommendations: "Affiner mes recommandations",

available_housings: "Logements disponibles",
covered_cities: "Villes couvertes",
satisfied_clients: "Clients satisfaits",
support_available: "Support disponible",

featured_housings: "Logements en vedette",
selected_by_algorithm: "Sélectionnés par notre algorithme génétique intelligent",

improve_suggestions: "Améliorer mes suggestions",
refine_preferences: "Affiner mes préférences",

loading: "Chargement...",
no_recommendations: "Aucune recommandation disponible pour le moment",

browse_housings: "Parcourir les logements",
view_all_housings: "Voir tous les logements",

how_it_works: "Comment ça marche",

step_search: "Recherchez",
step_search_desc: "Utilisez notre recherche intelligente ou la voix",

step_compare: "Comparez",
step_compare_desc: "Consultez les détails, photos et localisation",

step_contact: "Contactez",
step_contact_desc: "Discutez directement avec le propriétaire",

step_visit: "Visitez",
step_visit_desc: "Planifiez une visite et trouvez votre logement",

cta_owner_title: "Vous êtes propriétaire ?",
cta_owner_desc: "Publiez vos logements gratuitement et touchez des milliers de locataires",
start_now: "Commencer maintenant",


    // ── Logement / Carte ─────────────────────────────────────
    // available:          'Disponible',
    // reserved:           'Réservé',
    // occupied:           'Occupé',
    per_month:          '/mois',
    rooms:              'ch.',
    bathrooms:          'sdb.',
    area:               'm²',
    see_detail:         'Voir le détail',
    contact_owner:      'Contacter le propriétaire',
    schedule_visit:     'Planifier une visite',
    status_available: "Disponible",
status_reserved: "Réservé",
status_occupied: "Occupé",

    // ── Notifications ────────────────────────────────────────
    notif_title:        'Notifications',
    notif_view_all:     'Voir toutes les notifications',
    notif_empty:        'Aucune notification',
    notif_new_msg:      'Nouveau message',
    notif_new_conv:     'Nouvelle conversation',
    notif_visit_req:    'Nouvelle demande de visite',
    mark_read:          'Marquer comme lu',

    // ── Recherche ────────────────────────────────────────────
    search_placeholder: 'Rechercher un logement...',
    search_voice:       'Recherche vocale',
    search_filters:     'Filtres',
    search_results:     'résultats trouvés',
    search_no_results:  'Aucun logement trouvé',
    search_loading:     'Recherche en cours...',

    // ── Quiz ─────────────────────────────────────────────────
// ── Quiz ─────────────────────────────────────────────────
quiz_title:         'Personnalisez vos recommandations',
quiz_desc:          'Notre algorithme génétique analyse vos préférences pour vous proposer les logements les plus adaptés.',
quiz_time:          '⏱️ 2 minutes · 7 questions',
quiz_start:         'Commencer le quiz',
quiz_skip:          'Passer pour l\'instant',
quiz_next:          'Suivant →',
quiz_prev:          '← Précédent',
quiz_summary_title: 'Voir le résumé',
quiz_confirm:       '🚀 Affiner mes suggestions',
quiz_saving:        '⏳ Enregistrement…',
quiz_edit:          '✏️ Modifier',
quiz_profile_title: 'Votre profil de recherche',
quiz_profile_desc:  'Voici ce que nous avons retenu. Confirmez pour affiner vos recommandations.',
quiz_multi_hint:    'Sélectionnez une ou plusieurs réponses',

// questions
quiz_q_city: "Dans quelle ville cherchez-vous ?",
quiz_q_category: "Quel type de logement recherchez-vous ?",
quiz_q_budget: "Quel est votre budget mensuel ?",
quiz_q_furnished: "Préférez-vous un logement meublé ?",
quiz_q_features: "Quels équipements sont importants pour vous ?",
quiz_q_nearby: "Que souhaitez-vous avoir à proximité ?",
quiz_q_priority: "Qu'est-ce qui compte le plus dans votre choix ?",

// villes
quiz_city_yaounde: "Yaoundé",
quiz_city_douala: "Douala",
quiz_city_bafoussam: "Bafoussam",
quiz_city_other: "Autre ville",

// catégories
quiz_cat_studio: "Studio",
quiz_cat_room: "Chambre",
quiz_cat_apartment: "Appartement",
quiz_cat_house: "Maison / Villa",

// budget
quiz_budget_1: "Moins de 30 000 FCFA",
quiz_budget_2: "30 000 – 60 000 FCFA",
quiz_budget_3: "60 000 – 100 000 FCFA",
quiz_budget_4: "Plus de 100 000 FCFA",

// meublé
quiz_furnished_yes: "Oui, meublé",
quiz_furnished_no: "Non, vide",
quiz_furnished_any: "Peu importe",

// équipements
quiz_feat_parking: "Parking",
quiz_feat_wifi: "Wi-Fi",
quiz_feat_ac: "Climatisation",
quiz_feat_balcony: "Balcon / Terrasse",
quiz_feat_pool: "Piscine",
quiz_feat_security: "Gardien / Sécurité",
quiz_feat_water: "Eau courante",
quiz_feat_kitchen: "Cuisine équipée",

// proximité
quiz_near_school: "École / Université",
quiz_near_market: "Supermarché",
quiz_near_hospital: "Hôpital / Clinique",
quiz_near_transport: "Transport en commun",
quiz_near_bank: "Banque / ATM",
quiz_near_restaurant: "Restaurants",

// priorité
quiz_priority_price: "Le prix avant tout",
quiz_priority_location: "L'emplacement",
quiz_priority_comfort: "Le confort / équipements",
quiz_priority_security: "La sécurité du quartier",
quiz_city_yaounde: "Yaoundé",
quiz_city_douala: "Douala",

quiz_cat_studio: "Studio",
quiz_cat_room: "Chambre",
quiz_cat_apartment: "Appartement",
quiz_cat_house: "Maison",


    // ── Messages génériques ──────────────────────────────────
    loading:            'Chargement...',
    save:               'Enregistrer',
    cancel:             'Annuler',
    delete:             'Supprimer',
    edit:               'Modifier',
    confirm:            'Confirmer',
    back:               'Retour',
    yes:                'Oui',
    no:                 'Non',
    error_generic:      'Une erreur est survenue. Veuillez réessayer.',
  },

  en: {
    // ── Navbar ──────────────────────────────────────────────
    home:               'Home',
    search:             'Search',
    about:              'About',
    services:           'Services',
    contact:            'Contact',
    login:              'Login',
    register:           'Sign Up',
    logout:             'Logout',
    dashboard:          'Dashboard',
    theme_toggle:       'Toggle theme',
    lang_toggle:        'Passer en Français',

    // ── Footer ──────────────────────────────────────────────
    footer_about:       'About',
    footer_desc:        'Innovative housing rental platform in Cameroon. Find your ideal home with our smart algorithm.',
    footer_quick_links: 'Quick Links',
    footer_testimonials:'Testimonials',
    footer_contact:     'Contact',
    footer_mobile_app:  'Mobile App',
    footer_mobile_desc: 'Download our app (test version)',
    footer_rights:      'All rights reserved.',
    footer_privacy:     'Privacy Policy',
    footer_terms:       'Terms of Use',
    footer_legal:       'Legal Notice',

    // ── Home ────────────────────────────────────────────────
    hero_title:         'Find Your Ideal Home',
    hero_subtitle:      'Smart housing rental platform in Cameroon',
    hero_cta:           'Search Housing',
    hero_refine:        'Refine my recommendations',
    stats_housings:     'Available housings',
    stats_cities:       'Cities covered',
    stats_clients:      'Satisfied clients',
    stats_support:      'Support available',
    featured_title:     'Featured Housings',
    featured_subtitle:  'Selected by our smart genetic algorithm',
    featured_refine:    '· Refine my preferences',
    featured_empty:     'No recommendations available at the moment.',
    featured_browse:    'Browse housings',
    view_all:           'View all housings',
    how_title:          'How It Works?',
    step1_title:        'Search',
    step1_desc:         'Use our smart search or voice recognition',
    step2_title:        'Compare',
    step2_desc:         'View details, photos and location',
    step3_title:        'Contact',
    step3_desc:         'Chat directly with the landlord',
    step4_title:        'Visit',
    step4_desc:         'Schedule a visit and find your home',
    cta_owner_title:    'Are you a landlord?',
    cta_owner_desc:     'List your properties for free and reach thousands of tenants',
    cta_start:          'Get Started',

    // ── About ───────────────────────────────────────────────
    about_title:        'About RentAL',
    about_subtitle:     'Your trusted partner to find the ideal housing in Cameroon',
    about_mission_title:'Our Mission',
    about_mission_text: 'RentAL\'s mission is to simplify the search and rental of housing in Cameroon using the most innovative technologies. We believe finding a home should not be complicated.',
    about_innov_title:  'Our Innovation',
    innov_genetic:      'Genetic Algorithm',
    innov_genetic_desc: 'Our system uses an advanced genetic algorithm to recommend the most relevant housings based on your preferences and budget.',
    innov_geo:          'Geolocation',
    innov_geo_desc:     'View housings on an interactive map and find those closest to your points of interest.',
    innov_msg:          'Integrated Messaging',
    innov_msg_desc:     'Communicate directly with landlords via our secure messaging system.',
    innov_mobile:       'Multiplatform',
    innov_mobile_desc:  'Access our services on the web and via our iOS and Android mobile app.',
    about_values_title: 'Our Values',
    val_transparency:   '🎯 Transparency',
    val_transparency_d: 'All housing information is verified and transparent. No surprises, no hidden fees.',
    val_trust:          '🤝 Trust',
    val_trust_d:        'We verify the identity of all landlords and actively moderate listings for your safety.',
    val_speed:          '⚡ Speed',
    val_speed_d:        'Our platform lets you find and contact landlords in just a few clicks.',
    val_access:         '🌍 Accessibility',
    val_access_d:       'Free service for tenants, multilingual interface and 24/7 support.',
    about_stats_title:  'RentAL in Numbers',
    stat_housings_label:'Available housings',
    stat_cities_label:  'Cities covered',
    stat_users_label:   'Active users',
    stat_satisfaction:  'Satisfaction rate',
    about_team_title:   'Our Team',
    about_team_text:    'RentAL is developed by a passionate team of developers and real estate professionals based in Yaoundé, Cameroon.',
    about_cta_title:    'Ready to find your ideal housing?',
    about_cta_register: 'Create a free account',
    about_cta_browse:   'Browse housings',

    // ── Contact ─────────────────────────────────────────────
    contact_title:      'Contact Us',
    contact_subtitle:   'We are here to help you',
    contact_name:       'Full name',
    contact_email:      'Email address',
    contact_subject:    'Subject',
    contact_message:    'Message',
    contact_send:       'Send message',
    contact_sending:    'Sending...',
    contact_success:    'Message sent successfully!',
    contact_info_title: 'Contact information',
    contact_hours:      'Monday - Friday: 8am - 6pm',
    contact_location:   'Yaoundé, Cameroon',
    contact_whatsapp:   'Chat on WhatsApp',

    // ── Services ────────────────────────────────────────────
    services_title:     'Our Services',
    services_subtitle:  'Complete solutions for tenants and landlords',
    services_tenant:    'For Tenants',
    services_tenant_sub:'Find your ideal housing with ease',
    services_owner:     'For Landlords',
    services_owner_sub: 'Rent your properties quickly and efficiently',
    svc_search:         'Smart Search',
    svc_search_d:       'Quickly find your ideal housing with our recommendation algorithm.',
    svc_geo:            'Geolocation',
    svc_geo_d:          'View housings on a map and calculate routes to your destinations.',
    svc_msg:            'Secure Messaging',
    svc_msg_d:          'Communicate directly with landlords via our integrated messaging system.',
    svc_visit:          'Visit Planning',
    svc_visit_d:        'Schedule visits online and receive instant confirmations from landlords.',
    svc_virtual:        'Virtual Tours',
    svc_virtual_d:      'Discover housings remotely through videos and 360° virtual tours.',
    svc_notif:          'Notifications',
    svc_notif_d:        'Receive instant alerts for new housings matching your criteria.',
    svc_manage:         'Complete Management',
    svc_manage_d:       'Intuitive dashboard to manage all your housings, visits and reservations.',
    svc_stats:          'Detailed Statistics',
    svc_stats_d:        'Track the performance of your listings: views, likes, conversion rate.',
    svc_comm:           'Easy Communication',
    svc_comm_d:         'Quickly respond to tenant requests via our integrated messaging.',
    svc_media:          'Rich Media',
    svc_media_d:        'Add photos, videos and virtual tours to showcase your housings.',
    svc_alert:          'Real-Time Alerts',
    svc_alert_d:        'Receive notifications for each new visit request.',
    svc_mobile:         'Mobile Management',
    svc_mobile_d:       'Manage your housings from your smartphone with our app.',
    process_title:      'How does it work?',
    process_step1:      'Sign Up',
    process_step1_d:    'Create your account for free in a few clicks',
    process_step2:      'Search',
    process_step2_d:    'Browse or list housings',
    process_step3:      'Contact',
    process_step3_d:    'Chat via our secure messaging',
    process_step4:      'Visit',
    process_step4_d:    'Schedule and conduct a visit',
    svc_cta_title:      'Ready to get started?',
    svc_cta_sub:        'Join thousands of satisfied users',
    svc_cta_register:   'Create an account',
    svc_cta_browse:     'View housings',

    // ── Auth ────────────────────────────────────────────────
    login_title:        'Login',
    login_subtitle:     'Access your personal space',
    login_username:     'Username or Email',
    login_password:     'Password',
    login_remember:     'Remember me',
    login_forgot:       'Forgot password?',
    login_btn:          'Sign In',
    login_loading:      'Signing in...',
    login_or:           'OR',
    login_google:       'Continue with Google',
    login_facebook:     'Continue with Facebook',
    login_no_account:   "Don't have an account?",
    login_signup:       'Sign up',
    register_title:     'Sign Up',
    register_subtitle:  'Create your account for free',
    register_firstname: 'First name',
    register_lastname:  'Last name',
    register_username:  'Username',
    register_email:     'Email address',
    register_phone:     'Phone number',
    register_password:  'Password',
    register_confirm:   'Confirm password',
    register_role:      'I am a',
    register_tenant:    'Tenant',
    register_owner:     'Landlord',
    register_btn:       'Create my account',
    register_loading:   'Creating account...',
    register_have_acct: 'Already have an account?',
    register_login:     'Sign in',

    // ── Dashboard commun ────────────────────────────────────
    my_profile:         'My Profile',
    my_housings:        'My Housings',
    add_housing:        'Add a housing',
    statistics:         'Statistics',
    visibility:         'Visibility',
    reservations:       'Reservations',
    messages:           'Messages',
    notifications:      'Notifications',
    settings:           'Settings',
    favorites:          'Favorites',
    saved:              'Saved',
    visits:             'Visits',
    overview:           'Overview',
    users:              'Users',
    disconnect:         'Logout',

    admin_panel: "Admin",

dashboard_overview: "Overview",

users: "Users",

housings: "Housings",

profile: "Profile",

support: "Support",

notifications: "Notifications",

    email: 'Email',
phone: 'Phone',
not_provided: 'Not provided',
member_since: 'Member since',
edit_profile: 'Edit profile',
change_password: 'Change password',
owner: 'owner',
tenant: 'tenant',

admin_profile_title: "My Admin Profile",
admin_role: "Administrator",

email: "Email",
phone: "Phone",

member_since: "Member since",
not_provided: "Not provided",

edit_profile: "Edit profile",
change_password: "Change password",

// edit profle
profile_edit_title: "Edit profile",

profile_remove_photo: "Remove photo",

profile_personal_info: "Personal information",

profile_first_name: "First name",
profile_last_name: "Last name",

profile_first_name_placeholder: "Your first name",
profile_last_name_placeholder: "Your last name",

profile_email: "Email",
profile_email_placeholder: "your@email.com",

profile_phone: "Phone",
profile_phone_placeholder: "+237 6XX XXX XXX",

profile_search_preferences: "Search preferences",

profile_max_budget: "Maximum budget (FCFA)",
profile_budget_placeholder: "Example: 50000",

profile_saving: "Saving...",

save: "Save",
cancel: "Cancel",

// change_password
change_password_title: "Change password",

old_password: "Old password",
old_password_placeholder: "Enter your old password",

new_password: "New password",
new_password_placeholder: "Minimum 8 characters",

confirm_new_password: "Confirm new password",
confirm_password_placeholder: "Repeat the new password",

password_tips_title: "Tips for a secure password:",

password_tip_1: "At least 8 characters",
password_tip_2: "Use uppercase and lowercase letters",
password_tip_3: "Include numbers and special characters",
password_tip_4: "Do not use personal information",

changing_password: "Updating...",
change_password: "Change password",
cancel: "Cancel",

all_categories: 'All categories',
total: 'Total',
available_plural: 'Available',
reserved_plural: 'Reserved',
occupied_plural: 'Occupied',

add_housing_title: 'Add housing',
edit_housing_title: 'Edit housing',
general_information: 'General information',
title: 'Title',
category: 'Category',
type: 'Type',
select_option: 'Select',
description: 'Description',
features: 'Features',
monthly_price: 'Monthly price',
area_label: 'Area',
rooms_label: 'Rooms',
bathrooms_label: 'Bathrooms',
additional_features: 'Additional features',
location: 'Location',
region: 'Region',
city: 'City',
district: 'District',
enable_gps: 'Enable GPS',
capturing_gps: 'Capturing...',
media: 'Media',
photos: 'Photos',
video: 'Video',
virtual_visit: '360° tour URL',
publish: 'Publish',
processing: 'Processing...',
optionnal: 'Optional',

edit_housing: 'Edit',
basic_information: 'Basic information',
features: 'Features',
price: 'Price',
status: 'Status',
location: 'Location',
region: 'Region',
city: 'City',
district: 'District',
update_gps: 'Update GPS',
gps_location: 'Locating...',
media: 'Media',
new_photos: 'New photos',
video: 'Video',
virtual_visit_url: 'Virtual tour URL',
saving: 'Saving...',
update: 'Update',

stats_title: '📊 My housing statistics',
total_housings: 'Total housings',
available: 'Available',
reserved: 'Reserved',
occupied: 'Occupied',
status_distribution: 'Status distribution',
top_housings: '📈 Most viewed housings',
no_housings_stats: 'No housings available for statistics',

visibility_title: 'Visibility Management',
visibility_subtitle: 'Control the visibility and status of your housings',
total: 'Total',
visible: 'Visible',
hidden: 'Hidden',
available: 'Available',
filter_all: 'All',
empty_housing: 'No housings to display',
info_title: '💡 Info',
info_visible: 'Visible: The housing appears in search results',
info_hidden: 'Hidden: The housing is no longer publicly visible',
info_occupied: 'Status "Occupied": Automatically hides the housing',
visibility_label: 'Visibility',
status_label: 'Status',
visible_btn: 'Visible',
hidden_btn: 'Hidden',
  status_options_disponible: 'Available',
  status_options_reserve: 'Reserved',
  status_options_occupe: 'Occupied'
,
stats_label: 'Statistics',

// pour les visite 
visits_loading: "Loading visits...",
visits_title_owner: "Visit Requests",
visits_title_tenant: "My Visits",

visits_stats_total: "Total",
visits_stats_waiting: "Pending",
visits_stats_confirmed: "Confirmed",
visits_stats_refused: "Refused",
visits_stats_cancelled: "Cancelled",
visits_stats_upcoming: "Upcoming",

visits_filter_all: "All",
visits_filter_waiting: "Pending",
visits_filter_confirmed: "Confirmed",
visits_filter_refused: "Refused",
visits_filter_cancelled: "Cancelled",
visits_filter_upcoming: "Upcoming",
visits_filter_past: "Past",

visits_empty: "No visits",

visits_label_owner: "Owner",
visits_label_tenant: "Tenant",
visits_label_view_housing: "View Housing",
visits_label_confirm: "Confirm",
visits_label_refuse: "Refuse",
visits_label_cancel: "Cancel",

visits_modal_title: "Refuse Visit",
visits_modal_placeholder: "Optional message",
visits_modal_submit: "Confirm Refusal",
visits_modal_cancel: "Cancel",

// pour les message
messages_loading: "Loading conversations...",
messages_select_conversation: "Select a conversation",
messages_choose_conversation: "Choose a conversation from the list to start chatting",

messages_header_title: "Messages",
messages_search_placeholder: "🔍 Search conversation...",

messages_empty_search: "No conversation found",
messages_empty_conversations: "You don't have any conversations yet",

messages_user_default: "User",

messages_view_housing: "View housing",
messages_call: "Call",
messages_more_options: "More options",

messages_housing_details: "View details →",

messages_loading_messages: "Loading messages...",
messages_no_messages: "No messages yet",
messages_start_conversation: "Send the first message to start the conversation",

messages_you_prefix: "You: ",
messages_photo: "📷 Photo",
messages_video: "🎥 Video",
messages_start: "Start the conversation",

messages_write_message: "Write your message...",
messages_add_image: "Add image",
messages_add_video: "Add video",

// pour les notification
notifications_loading: "Loading notifications...",
notif_mark_all: "Mark all as read",
notif_filter_all: "All",
notif_filter_unread: "Unread",
notif_filter_read: "Read",
notif_view: "View →",
notif_unread_single: "unread",
notif_unread_plural: "unread",
notif_unread_label: "unread",
notif_error_load: "Error loading notifications",
notif_error_mark: "Error while marking notification",
notif_delete_confirm: "Delete this notification?",

// pour les parametre
settings_title: "Settings",
settings_email_notifications: "Email notifications",
settings_push_notifications: "Push notifications",
settings_language: "Language",
settings_theme: "Theme",
settings_danger_zone: "Danger zone",
settings_delete_account: "Delete my account",
confirm_delete_account: "Are you sure you want to delete your account?",
theme_light: "Light",
theme_dark: "Dark",

// dashbord
owner_dashboard: "Owner Dashboard",
menu_profile: "My Profile",
menu_housings: "My Housings",
menu_add_housing: "Add Housing",
menu_stats: "Statistics",
menu_visibility: "Visibility",
menu_reservations: "Reservations",
menu_messages: "Messages",
menu_notifications: "Notifications",
menu_settings: "Settings",
logout: "Logout",

tenant_dashboard: "Tenant Dashboard",
menu_profile: "My profile",
menu_favorites: "Favorites",
menu_saved: "Saved",
menu_visits: "Visits",
menu_messages: "Messages",
menu_notifications: "Notifications",
menu_settings: "Settings",
logout: "Logout",

// favoris save
favorites_title: "My favorites",
favorites_empty: "You don't have any favorites yet",

saved_title: "Saved housings",
saved_empty: "You haven't saved any housings yet",

browse_housings: "Browse housings",

remove: "Remove",
confirm_remove: "Remove this housing?",

loading: "Loading...",

// dashbord admin
dashboard_overview: "Overview",

users: "Users",

total: "Total",

owners: "Owners",

tenants: "Tenants",

blocked: "Blocked",

housings: "Housings",

visible: "Visible",

hidden: "Hidden",

available: "Available",

top_owners: "Top Owners",


// user
users_management: "User Management",

photo: "Photo",
name: "Name",
email: "Email",
role: "Role",
housings: "Housings",
status: "Status",
registered_on: "Registered on",
actions: "Actions",

owner: "Owner",
tenant: "Tenant",

blocked: "Blocked",
active: "Active",

view_details: "View details",
block: "Block",
unblock: "Unblock",
delete: "Delete",

back: "Back",

user_details: "User details",

phone: "Phone",
not_provided: "Not provided",

// logement
housings_management: "Housing Management",

all_owners: "All owners",

all: "All",

visible: "Visible",
hidden: "Hidden",

hide: "Hide",
activate: "Activate",

delete: "Delete",

support_client: "Customer Support",
user_conversations: "Conversations with users",


// detail page
 
  
    call: "Call",
    message: "Message",
    location: "Location",
    tour: "360° Tour",
    WhatsApp: "WhatsApp",
    loading: "Loading...",
    notFound: "Housing not found",
    back: "Back",
    home: "Home",
    search: "Search",
    rooms: "rooms",
    baths: "bathrooms",
    views: "views",
    favorites: "Favorites",
    planVisit: "Schedule a visit",
    description: "Description",
    additionalFeatures: "Additional features",
    virtualVisit: "Virtual tour",
    route: "Get directions",
    owner: "Owner",
    info: "Information",
    published: "Published on",
    type: "Type",
    category: "Category",
    date: "Date",
    time: "Time",
    cancel: "Cancel",
    confirm: "Confirm"
  ,

  // page home
 
home_hero_title: "Find Your Ideal Home",
home_hero_subtitle: "Smart housing rental platform in Cameroon",

search_housing: "Search housing",
refine_recommendations: "Refine my recommendations",

available_housings: "Available housings",
covered_cities: "Covered cities",
satisfied_clients: "Satisfied clients",
support_available: "Support available",

featured_housings: "Featured housings",
selected_by_algorithm: "Selected by our intelligent genetic algorithm",

improve_suggestions: "Improve my suggestions",
refine_preferences: "Refine my preferences",

loading: "Loading...",
no_recommendations: "No recommendations available at the moment",

browse_housings: "Browse housings",
view_all_housings: "View all housings",

how_it_works: "How it works",

step_search: "Search",
step_search_desc: "Use our intelligent search or voice",

step_compare: "Compare",
step_compare_desc: "Check details, photos and location",

step_contact: "Contact",
step_contact_desc: "Chat directly with the owner",

step_visit: "Visit",
step_visit_desc: "Schedule a visit and find your home",

cta_owner_title: "Are you an owner?",
cta_owner_desc: "Publish your housings for free and reach thousands of tenants",
start_now: "Start now",

    // ── Logement / Carte ─────────────────────────────────────
    // available:          'Available',
    // reserved:           'Reserved',
    // occupied:           'Occupied',
    per_month:          '/month',
    rooms:              'bed.',
    bathrooms:          'bath.',
    area:               'm²',
    see_detail:         'See details',
    contact_owner:      'Contact landlord',
    schedule_visit:     'Schedules a visit',
    status_available: "Disponible",
status_reserved: "Réservé",
status_occupied: "Occupé",

    // ── Notifications ────────────────────────────────────────
    notif_title:        'Notifications',
    notif_view_all:     'View all notifications',
    notif_empty:        'No notifications',
    notif_new_msg:      'New message',
    notif_new_conv:     'New conversation',
    notif_visit_req:    'New visit request',
    mark_read:          'Mark as read',

    // ── Recherche ────────────────────────────────────────────
    search_placeholder: 'Search for a housing...',
    search_voice:       'Voice search',
    search_filters:     'Filters',
    search_results:     'results found',
    search_no_results:  'No housing found',
    search_loading:     'Searching...',

    // ── Quiz ─────────────────────────────────────────────────
   // ── Quiz ─────────────────────────────────────────────────
quiz_title:         'Personalize your recommendations',
quiz_desc:          'Our genetic algorithm analyzes your preferences to suggest the most suitable housings.',
quiz_time:          '⏱️ 2 minutes · 7 questions',
quiz_start:         'Start the quiz',
quiz_skip:          'Skip for now',
quiz_next:          'Next →',
quiz_prev:          '← Previous',
quiz_summary_title: 'View summary',
quiz_confirm:       '🚀 Refine my suggestions',
quiz_saving:        '⏳ Saving…',
quiz_edit:          '✏️ Edit',
quiz_profile_title: 'Your search profile',
quiz_profile_desc:  'Here is what we noted. Confirm to refine your recommendations.',
quiz_multi_hint:    'Select one or more answers',

// questions
quiz_q_city: "Which city are you looking in?",
quiz_q_category: "What type of housing are you looking for?",
quiz_q_budget: "What is your monthly budget?",
quiz_q_furnished: "Do you prefer a furnished place?",
quiz_q_features: "Which features are important to you?",
quiz_q_nearby: "What would you like nearby?",
quiz_q_priority: "What matters most in your choice?",

// cities
quiz_city_yaounde: "Yaoundé",
quiz_city_douala: "Douala",
quiz_city_bafoussam: "Bafoussam",
quiz_city_other: "Other city",

// housing type
quiz_cat_studio: "Studio",
quiz_cat_room: "Room",
quiz_cat_apartment: "Apartment",
quiz_cat_house: "House / Villa",

// budget
quiz_budget_1: "Less than 30,000 FCFA",
quiz_budget_2: "30,000 – 60,000 FCFA",
quiz_budget_3: "60,000 – 100,000 FCFA",
quiz_budget_4: "More than 100,000 FCFA",

// furnished
quiz_furnished_yes: "Yes, furnished",
quiz_furnished_no: "No, empty",
quiz_furnished_any: "Doesn't matter",

// features
quiz_feat_parking: "Parking",
quiz_feat_wifi: "Wi-Fi",
quiz_feat_ac: "Air conditioning",
quiz_feat_balcony: "Balcony / Terrace",
quiz_feat_pool: "Swimming pool",
quiz_feat_security: "Security / Guard",
quiz_feat_water: "Running water",
quiz_feat_kitchen: "Equipped kitchen",

// nearby
quiz_near_school: "School / University",
quiz_near_market: "Supermarket",
quiz_near_hospital: "Hospital / Clinic",
quiz_near_transport: "Public transport",
quiz_near_bank: "Bank / ATM",
quiz_near_restaurant: "Restaurants",

// priority
quiz_priority_price: "Price first",
quiz_priority_location: "Location",
quiz_priority_comfort: "Comfort / amenities",
quiz_priority_security: "Neighborhood safety",
quiz_city_yaounde: "Yaoundé",
quiz_city_douala: "Douala",

quiz_cat_studio: "Studio",
quiz_cat_room: "Room",
quiz_cat_apartment: "Apartment",
quiz_cat_house: "House",


    // ── Messages génériques ──────────────────────────────────
    loading:            'Loading...',
    save:               'Save',
    cancel:             'Cancel',
    delete:             'Delete',
    edit:               'Edit',
    confirm:            'Confirm',
    back:               'Back',
    yes:                'Yes',
    no:                 'No',
    error_generic:      'An error occurred. Please try again.',
  },


}




// ─── Provider ────────────────────────────────────────────────────────────────
export const ThemeProvider = ({ children }) => {
  const [theme,    setTheme]    = useState('light');
  const [language, setLanguage] = useState('fr');

  // Charger depuis localStorage au démarrage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')    || 'light';
    const savedLang  = localStorage.getItem('language') || 'fr';
    applyTheme(savedTheme);
    setLanguage(savedLang);
  }, []);

  // Appliquer le thème au <html>
  const applyTheme = (t) => {
    setTheme(t);
    document.documentElement.setAttribute('data-theme', t);
    // Pour compatibilité Tailwind
    if (t === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const toggleTheme = useCallback(() => {
    const next = theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', next);
    applyTheme(next);
  }, [theme]);

  const toggleLanguage = useCallback(() => {
    const next = language === 'fr' ? 'en' : 'fr';
    setLanguage(next);
    localStorage.setItem('language', next);
  }, [language]);

  // Fonction de traduction : t('key') → string traduit
  const t = useCallback((key, fallback) => {
    return TRANSLATIONS[language]?.[key]
        ?? TRANSLATIONS['fr']?.[key]
        ?? fallback
        ?? key;
  }, [language]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, language, toggleLanguage, t }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;


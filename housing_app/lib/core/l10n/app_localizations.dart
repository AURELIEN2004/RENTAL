// // // lib/core/l10n/app_localizations.dart
// // // Système bilingue FR/EN — synchronisé avec ThemeContext.jsx du web
// // // Usage : context.l10n.home  ou  AppL10n.of(context).search

// // import 'package:flutter/material.dart';

// // class AppL10n {
// //   final String locale;
// //   const AppL10n(this.locale);

// //   static AppL10n of(BuildContext context) {
// //     final provider = context.findAncestorStateOfType<_AppL10nState>();
// //     return provider?._l10n ?? const AppL10n('fr');
// //   }

// //   String get(String key) => _data[locale]?[key] ?? _data['fr']![key] ?? key;

// //   // ── Shortcuts ──────────────────────────────────────────────
// //   String get appName       => get('appName');
// //   String get discover      => get('discover');
// //   String get tagline       => get('tagline');
// //   String get search        => get('search');
// //   String get searchHint    => get('searchHint');
// //   String get home          => get('home');
// //   String get favorites     => get('favorites');
// //   String get messages      => get('messages');
// //   String get profile       => get('profile');
// //   String get notifications => get('notifications');
// //   String get recentListings => get('recentListings');
// //   String get seeAll        => get('seeAll');
// //   String get loading       => get('loading');
// //   String get error         => get('error');
// //   String get retry         => get('retry');
// //   String get noResults     => get('noResults');
// //   String get filters       => get('filters');
// //   String get apply         => get('apply');
// //   String get reset         => get('reset');
// //   String get cancel        => get('cancel');
// //   String get confirm       => get('confirm');
// //   String get save          => get('save');
// //   String get logout        => get('logout');
// //   String get login         => get('login');
// //   String get register      => get('register');
// //   String get available     => get('available');
// //   String get reserved      => get('reserved');
// //   String get occupied      => get('occupied');
// //   String get perMonth      => get('perMonth');
// //   String get rooms         => get('rooms');
// //   String get bathrooms     => get('bathrooms');
// //   String get area          => get('area');
// //   String get planVisit     => get('planVisit');
// //   String get contactOwner  => get('contactOwner');
// //   String get description   => get('description');
// //   String get equipment     => get('equipment');
// //   String get location      => get('location');
// //   String get viewOnMap     => get('viewOnMap');
// //   String get addHousing    => get('addHousing');
// //   String get myListings    => get('myListings');
// //   String get myVisits      => get('myVisits');
// //   String get myFavorites   => get('myFavorites');
// //   String get priceRange    => get('priceRange');
// //   String get housingType   => get('housingType');
// //   String get minRooms      => get('minRooms');
// //   String get minArea       => get('minArea');
// //   String get amenities     => get('amenities');
// //   String get furnished     => get('furnished');
// //   String get unfurnished   => get('unfurnished');
// //   String get parking       => get('parking');
// //   String get pool          => get('pool');
// //   String get wifi          => get('wifi');
// //   String get security24h   => get('security24h');
// //   String get visitDate     => get('visitDate');
// //   String get visitTime     => get('visitTime');
// //   String get confirmVisit  => get('confirmVisit');
// //   String get refuseVisit   => get('refuseVisit');
// //   String get today         => get('today');
// //   String get yesterday     => get('yesterday');
// //   String get thisWeek      => get('thisWeek');
// //   String get markAllRead   => get('markAllRead');
// //   String get noNotifications => get('noNotifications');
// //   String get noFavorites   => get('noFavorites');
// //   String get noMessages    => get('noMessages');
// //   String get typeMessage   => get('typeMessage');
// //   String get send          => get('send');
// //   String get languageLabel => get('languageLabel');
// //   String get darkMode      => get('darkMode');
// //   String get accountInfo   => get('accountInfo');
// //   String get switchToOwner => get('switchToOwner');
// //   String get switchToTenant => get('switchToTenant');
// //   String get editProfile   => get('editProfile');
// //   String get owner         => get('owner');
// //   String get tenant        => get('tenant');
// //   String get verified      => get('verified');
// //   String get general       => get('general');
// //   String get details       => get('details');
// //   String get photos        => get('photos');
// //   String get preview       => get('preview');
// //   String get next          => get('next');
// //   String get back          => get('back');
// //   String get publish       => get('publish');
// //   String get titleLabel    => get('titleLabel');
// //   String get priceLabel    => get('priceLabel');
// //   String get areaLabel     => get('areaLabel');
// //   String get descriptionLabel => get('descriptionLabel');
// //   String get categoryLabel => get('categoryLabel');
// //   String get regionLabel   => get('regionLabel');
// //   String get cityLabel     => get('cityLabel');
// //   String get districtLabel => get('districtLabel');
// //   String get nlpSearch     => get('nlpSearch');
// //   String get voiceSearch   => get('voiceSearch');
// //   String get nearMe        => get('nearMe');
// //   String get smartSearch   => get('smartSearch');
// //   String get showListings  => get('showListings');
// //   String get newBadge      => get('newBadge');
// //   String get popularBadge  => get('popularBadge');

// //   // ── Dictionnaire ───────────────────────────────────────────
// //   static const Map<String, Map<String, String>> _data = {
// //     'fr': {
// //       'appName': 'RentAL',
// //       'discover': 'Découvrir',
// //       'tagline': 'Trouvez votre chez-vous au Cameroun',
// //       'search': 'Rechercher',
// //       'searchHint': 'Un quartier, une ville…',
// //       'home': 'Accueil',
// //       'favorites': 'Favoris',
// //       'messages': 'Messages',
// //       'profile': 'Profil',
// //       'notifications': 'Notifications',
// //       'recentListings': 'Logements récents',
// //       'seeAll': 'Voir tout',
// //       'loading': 'Chargement…',
// //       'error': 'Une erreur est survenue',
// //       'retry': 'Réessayer',
// //       'noResults': 'Aucun résultat trouvé',
// //       'filters': 'Filtres',
// //       'apply': 'Appliquer',
// //       'reset': 'Réinitialiser',
// //       'cancel': 'Annuler',
// //       'confirm': 'Confirmer',
// //       'save': 'Enregistrer',
// //       'logout': 'Déconnexion',
// //       'login': 'Connexion',
// //       'register': 'Inscription',
// //       'available': 'Disponible',
// //       'reserved': 'Réservé',
// //       'occupied': 'Occupé',
// //       'perMonth': '/mois',
// //       'rooms': 'chambres',
// //       'bathrooms': 'salles de bain',
// //       'area': 'm²',
// //       'planVisit': 'Planifier une visite',
// //       'contactOwner': 'Contacter le propriétaire',
// //       'description': 'Description',
// //       'equipment': 'Équipements',
// //       'location': 'Localisation',
// //       'viewOnMap': 'Voir sur Google Maps',
// //       'addHousing': 'Ajouter un logement',
// //       'myListings': 'Mes annonces',
// //       'myVisits': 'Mes visites',
// //       'myFavorites': 'Mes favoris',
// //       'priceRange': 'Gamme de prix (FCFA)',
// //       'housingType': 'Type de logement',
// //       'minRooms': 'Chambres',
// //       'minArea': 'Surface (m²)',
// //       'amenities': 'Commodités',
// //       'furnished': 'Meublé',
// //       'unfurnished': 'Non-meublé',
// //       'parking': 'Parking',
// //       'pool': 'Piscine',
// //       'wifi': 'Wi-Fi',
// //       'security24h': 'Sécurité 24h',
// //       'visitDate': 'Choisir une date',
// //       'visitTime': 'Choisir une heure',
// //       'confirmVisit': 'Confirmer la visite',
// //       'refuseVisit': 'Refuser la visite',
// //       'today': "Aujourd'hui",
// //       'yesterday': 'Hier',
// //       'thisWeek': 'Cette semaine',
// //       'markAllRead': 'Tout marquer',
// //       'noNotifications': 'Aucune notification',
// //       'noFavorites': 'Aucun favori',
// //       'noMessages': 'Aucune conversation',
// //       'typeMessage': 'Message…',
// //       'send': 'Envoyer',
// //       'languageLabel': 'Langue',
// //       'darkMode': 'Mode sombre',
// //       'accountInfo': 'Informations personnelles',
// //       'switchToOwner': 'Passer en mode Propriétaire',
// //       'switchToTenant': 'Passer en mode Locataire',
// //       'editProfile': 'Modifier le profil',
// //       'owner': 'Propriétaire',
// //       'tenant': 'Locataire',
// //       'verified': 'Vérifié',
// //       'general': 'Informations générales',
// //       'details': 'Détails du logement',
// //       'photos': 'Photos',
// //       'preview': 'Aperçu',
// //       'next': 'Suivant',
// //       'back': 'Retour',
// //       'publish': 'Publier',
// //       'titleLabel': "Titre de l'annonce",
// //       'priceLabel': 'Loyer (FCFA/mois)',
// //       'areaLabel': 'Surface (m²)',
// //       'descriptionLabel': 'Description',
// //       'categoryLabel': 'Catégorie',
// //       'regionLabel': 'Région',
// //       'cityLabel': 'Ville',
// //       'districtLabel': 'Quartier',
// //       'nlpSearch': 'Langage naturel',
// //       'voiceSearch': 'Recherche vocale',
// //       'nearMe': 'Près de moi',
// //       'smartSearch': 'Recherche intelligente',
// //       'showListings': 'Afficher les logements',
// //       'newBadge': 'NOUVEAU',
// //       'popularBadge': 'POPULAIRE',
// //     },
// //     'en': {
// //       'appName': 'RentAL',
// //       'discover': 'Discover',
// //       'tagline': 'Find your home in Cameroon',
// //       'search': 'Search',
// //       'searchHint': 'A neighborhood, a city…',
// //       'home': 'Home',
// //       'favorites': 'Favorites',
// //       'messages': 'Messages',
// //       'profile': 'Profile',
// //       'notifications': 'Notifications',
// //       'recentListings': 'Recent listings',
// //       'seeAll': 'See all',
// //       'loading': 'Loading…',
// //       'error': 'An error occurred',
// //       'retry': 'Retry',
// //       'noResults': 'No results found',
// //       'filters': 'Filters',
// //       'apply': 'Apply',
// //       'reset': 'Reset',
// //       'cancel': 'Cancel',
// //       'confirm': 'Confirm',
// //       'save': 'Save',
// //       'logout': 'Log out',
// //       'login': 'Login',
// //       'register': 'Register',
// //       'available': 'Available',
// //       'reserved': 'Reserved',
// //       'occupied': 'Occupied',
// //       'perMonth': '/month',
// //       'rooms': 'bedrooms',
// //       'bathrooms': 'bathrooms',
// //       'area': 'm²',
// //       'planVisit': 'Schedule a visit',
// //       'contactOwner': 'Contact owner',
// //       'description': 'Description',
// //       'equipment': 'Equipment',
// //       'location': 'Location',
// //       'viewOnMap': 'View on Google Maps',
// //       'addHousing': 'Add listing',
// //       'myListings': 'My listings',
// //       'myVisits': 'My visits',
// //       'myFavorites': 'My favorites',
// //       'priceRange': 'Price range (FCFA)',
// //       'housingType': 'Housing type',
// //       'minRooms': 'Bedrooms',
// //       'minArea': 'Area (m²)',
// //       'amenities': 'Amenities',
// //       'furnished': 'Furnished',
// //       'unfurnished': 'Unfurnished',
// //       'parking': 'Parking',
// //       'pool': 'Pool',
// //       'wifi': 'Wi-Fi',
// //       'security24h': '24h Security',
// //       'visitDate': 'Choose a date',
// //       'visitTime': 'Choose a time',
// //       'confirmVisit': 'Confirm visit',
// //       'refuseVisit': 'Refuse visit',
// //       'today': 'Today',
// //       'yesterday': 'Yesterday',
// //       'thisWeek': 'This week',
// //       'markAllRead': 'Mark all read',
// //       'noNotifications': 'No notifications',
// //       'noFavorites': 'No favorites',
// //       'noMessages': 'No conversations',
// //       'typeMessage': 'Message…',
// //       'send': 'Send',
// //       'languageLabel': 'Language',
// //       'darkMode': 'Dark mode',
// //       'accountInfo': 'Personal information',
// //       'switchToOwner': 'Switch to Owner mode',
// //       'switchToTenant': 'Switch to Tenant mode',
// //       'editProfile': 'Edit profile',
// //       'owner': 'Owner',
// //       'tenant': 'Tenant',
// //       'verified': 'Verified',
// //       'general': 'General information',
// //       'details': 'Housing details',
// //       'photos': 'Photos',
// //       'preview': 'Preview',
// //       'next': 'Next',
// //       'back': 'Back',
// //       'publish': 'Publish',
// //       'titleLabel': 'Title',
// //       'priceLabel': 'Rent (FCFA/month)',
// //       'areaLabel': 'Area (m²)',
// //       'descriptionLabel': 'Description',
// //       'categoryLabel': 'Category',
// //       'regionLabel': 'Region',
// //       'cityLabel': 'City',
// //       'districtLabel': 'Neighborhood',
// //       'nlpSearch': 'Natural language',
// //       'voiceSearch': 'Voice search',
// //       'nearMe': 'Near me',
// //       'smartSearch': 'Smart search',
// //       'showListings': 'Show listings',
// //       'newBadge': 'NEW',
// //       'popularBadge': 'POPULAR',
// //     },
// //   };
// // }

// // // ── Widget Provider ────────────────────────────────────────────
// // class L10nProvider extends StatefulWidget {
// //   final String language;
// //   final Widget child;
// //   const L10nProvider({super.key, required this.language, required this.child});

// //   @override
// //   State<L10nProvider> createState() => _AppL10nState();
// // }

// // class _AppL10nState extends State<L10nProvider> {
// //   late AppL10n _l10n;

// //   @override
// //   void initState() {
// //     super.initState();
// //     _l10n = AppL10n(widget.language);
// //   }

// //   @override
// //   void didUpdateWidget(L10nProvider oldWidget) {
// //     super.didUpdateWidget(oldWidget);
// //     if (oldWidget.language != widget.language) {
// //       setState(() => _l10n = AppL10n(widget.language));
// //     }
// //   }

// //   @override
// //   Widget build(BuildContext context) => widget.child;
// // }

// // // ── Extension helper ───────────────────────────────────────────
// // extension L10nExtension on BuildContext {
// //   AppL10n get l10n {
// //     try {
// //       return AppL10n.of(this);
// //     } catch (_) {
// //       return const AppL10n('fr');
// //     }
// //   }
// // }
// // lib/core/l10n/app_localizations.dart
// // Système bilingue FR/EN — synchronisé avec ThemeContext.jsx du web
// // Usage : context.l10n.home  ou  AppL10n.of(context).search
// //
// // ✅ V2 — Clés ajoutées :
// //   • Onglets visits : pending, confirmed, past
// //   • Onglets profil : dashboard, users, housings, settings, reservations
// //   • housing_detail : virtualVisit, views, likes, added, viewMore, viewLess,
// //                      smartSuggestions, messagePlaceholder, visitSuccess,
// //                      copiedToClipboard, openInBrowser, seeOnMaps,
// //                      administrator, refuse, block, unblock, delete
// //   • notifications  : minutesAgo, hoursAgo (formatTime bilingue)
// //   • profile        : cancelVisit, security, personalInfo

// import 'package:flutter/material.dart';

// class AppL10n {
//   final String locale;
//   const AppL10n(this.locale);

//   static AppL10n of(BuildContext context) {
//     final provider = context.findAncestorStateOfType<_AppL10nState>();
//     return provider?._l10n ?? const AppL10n('fr');
//   }

//   String get(String key) => _data[locale]?[key] ?? _data['fr']![key] ?? key;

//   // ── Navbar / Navigation ──────────────────────────────────────────────────
//   String get appName       => get('appName');
//   String get discover      => get('discover');
//   String get tagline       => get('tagline');
//   String get search        => get('search');
//   String get searchHint    => get('searchHint');
//   String get home          => get('home');
//   String get favorites     => get('favorites');
//   String get messages      => get('messages');
//   String get profile       => get('profile');
//   String get notifications => get('notifications');
//   String get recentListings => get('recentListings');
//   String get seeAll        => get('seeAll');

//   // ── Actions génériques ──────────────────────────────────────────────────
//   String get loading       => get('loading');
//   String get error         => get('error');
//   String get retry         => get('retry');
//   String get noResults     => get('noResults');
//   String get filters       => get('filters');
//   String get apply         => get('apply');
//   String get reset         => get('reset');
//   String get cancel        => get('cancel');
//   String get confirm       => get('confirm');
//   String get save          => get('save');
//   String get logout        => get('logout');
//   String get login         => get('login');
//   String get register      => get('register');
//   String get next          => get('next');
//   String get back          => get('back');

//   // ── Statuts logement ────────────────────────────────────────────────────
//   String get available     => get('available');
//   String get reserved      => get('reserved');
//   String get occupied      => get('occupied');

//   // ── Détail logement ─────────────────────────────────────────────────────
//   String get perMonth      => get('perMonth');
//   String get rooms         => get('rooms');
//   String get bathrooms     => get('bathrooms');
//   String get area          => get('area');
//   String get planVisit     => get('planVisit');
//   String get contactOwner  => get('contactOwner');
//   String get description   => get('description');
//   String get equipment     => get('equipment');
//   String get location      => get('location');
//   String get viewOnMap     => get('viewOnMap');
//   String get virtualVisit  => get('virtualVisit');
//   String get views         => get('views');
//   String get likes         => get('likes');
//   String get added         => get('added');
//   String get viewMore      => get('viewMore');
//   String get viewLess      => get('viewLess');
//   String get smartSuggestions => get('smartSuggestions');
//   String get messagePlaceholder => get('messagePlaceholder');
//   String get visitSuccess  => get('visitSuccess');
//   String get copiedToClipboard => get('copiedToClipboard');
//   String get openInBrowser => get('openInBrowser');
//   String get seeOnMaps     => get('seeOnMaps');

//   // ── Dates relatives ─────────────────────────────────────────────────────
//   String get today         => get('today');
//   String get yesterday     => get('yesterday');
//   String get thisWeek      => get('thisWeek');
//   /// Usage : l10n.daysAgo(3)  →  'Il y a 3j' / '3 days ago'
//   String daysAgo(int n)    => get('daysAgo').replaceAll('{n}', '$n');
//   /// Usage : l10n.monthsAgo(2) → 'Il y a 2 mois' / '2 months ago'
//   String monthsAgo(int n)  => get('monthsAgo').replaceAll('{n}', '$n');
//   /// Usage : l10n.minutesAgo(5) → 'Il y a 5 min' / '5 min ago'
//   String minutesAgo(int n) => get('minutesAgo').replaceAll('{n}', '$n');
//   /// Usage : l10n.hoursAgo(2)   → 'Il y a 2h' / '2h ago'
//   String hoursAgo(int n)   => get('hoursAgo').replaceAll('{n}', '$n');

//   // ── Notifications ────────────────────────────────────────────────────────
//   String get markAllRead   => get('markAllRead');
//   String get noNotifications => get('noNotifications');

//   // ── Visites ──────────────────────────────────────────────────────────────
//   String get visitDate     => get('visitDate');
//   String get visitTime     => get('visitTime');
//   String get confirmVisit  => get('confirmVisit');
//   String get refuseVisit   => get('refuseVisit');
//   String get cancelVisit   => get('cancelVisit');
//   String get pending       => get('pending');
//   String get confirmed     => get('confirmed');
//   String get past          => get('past');
//   /// Usage : l10n.noVisitLabel('En attente') → 'Aucune visite En attente'
//   String noVisitLabel(String lbl) => get('noVisitLabel').replaceAll('{lbl}', lbl);

//   // ── Profil / Dashboard ───────────────────────────────────────────────────
//   String get dashboard     => get('dashboard');
//   String get users         => get('users');
//   String get housings      => get('housings');
//   String get settings      => get('settings');
//   String get reservations  => get('reservations');
//   String get myListings    => get('myListings');
//   String get myVisits      => get('myVisits');
//   String get myFavorites   => get('myFavorites');
//   String get addHousing    => get('addHousing');
//   String get editProfile   => get('editProfile');
//   String get owner         => get('owner');
//   String get tenant        => get('tenant');
//   String get administrator => get('administrator');
//   String get verified      => get('verified');
//   String get switchToOwner => get('switchToOwner');
//   String get switchToTenant => get('switchToTenant');
//   String get languageLabel => get('languageLabel');
//   String get darkMode      => get('darkMode');
//   String get accountInfo   => get('accountInfo');
//   String get personalInfo  => get('personalInfo');
//   String get security      => get('security');

//   // ── Actions admin ────────────────────────────────────────────────────────
//   String get refuse        => get('refuse');
//   String get block         => get('block');
//   String get unblock       => get('unblock');
//   String get delete        => get('delete');
//   String get edit          => get('edit');

//   // ── Messagerie ───────────────────────────────────────────────────────────
//   String get noFavorites   => get('noFavorites');
//   String get noMessages    => get('noMessages');
//   String get typeMessage   => get('typeMessage');
//   String get send          => get('send');

//   // ── Formulaire logement ──────────────────────────────────────────────────
//   String get general       => get('general');
//   String get details       => get('details');
//   String get photos        => get('photos');
//   String get preview       => get('preview');
//   String get publish       => get('publish');
//   String get titleLabel    => get('titleLabel');
//   String get priceLabel    => get('priceLabel');
//   String get areaLabel     => get('areaLabel');
//   String get descriptionLabel => get('descriptionLabel');
//   String get categoryLabel => get('categoryLabel');
//   String get regionLabel   => get('regionLabel');
//   String get cityLabel     => get('cityLabel');
//   String get districtLabel => get('districtLabel');

//   // ── Filtres ──────────────────────────────────────────────────────────────
//   String get priceRange    => get('priceRange');
//   String get housingType   => get('housingType');
//   String get minRooms      => get('minRooms');
//   String get minArea       => get('minArea');
//   String get amenities     => get('amenities');
//   String get furnished     => get('furnished');
//   String get unfurnished   => get('unfurnished');
//   String get parking       => get('parking');
//   String get pool          => get('pool');
//   String get wifi          => get('wifi');
//   String get security24h   => get('security24h');

//   // ── Recherche ────────────────────────────────────────────────────────────
//   String get nlpSearch     => get('nlpSearch');
//   String get voiceSearch   => get('voiceSearch');
//   String get nearMe        => get('nearMe');
//   String get smartSearch   => get('smartSearch');
//   String get showListings  => get('showListings');
//   String get newBadge      => get('newBadge');
//   String get popularBadge  => get('popularBadge');

//   // ══════════════════════════════════════════════════════════════════════════
//   // DICTIONNAIRE
//   // ══════════════════════════════════════════════════════════════════════════
//   static const Map<String, Map<String, String>> _data = {
//     'fr': {
//       // ── App ──────────────────────────────────────────────────────────────
//       'appName': 'RentAL',
//       'discover': 'Découvrir',
//       'tagline': 'Trouvez votre chez-vous au Cameroun',
//       'search': 'Rechercher',
//       'searchHint': 'Un quartier, une ville…',
//       'home': 'Accueil',
//       'favorites': 'Favoris',
//       'messages': 'Messages',
//       'profile': 'Profil',
//       'notifications': 'Notifications',
//       'recentListings': 'Logements récents',
//       'seeAll': 'Voir tout',
//       // ── Actions génériques ───────────────────────────────────────────────
//       'loading': 'Chargement…',
//       'error': 'Une erreur est survenue',
//       'retry': 'Réessayer',
//       'noResults': 'Aucun résultat trouvé',
//       'filters': 'Filtres',
//       'apply': 'Appliquer',
//       'reset': 'Réinitialiser',
//       'cancel': 'Annuler',
//       'confirm': 'Confirmer',
//       'save': 'Enregistrer',
//       'logout': 'Déconnexion',
//       'login': 'Connexion',
//       'register': 'Inscription',
//       'next': 'Suivant',
//       'back': 'Retour',
//       'refuse': 'Refuser',
//       'block': 'Bloquer',
//       'unblock': 'Débloquer',
//       'delete': 'Supprimer',
//       'edit': 'Modifier',
//       // ── Statuts ──────────────────────────────────────────────────────────
//       'available': 'Disponible',
//       'reserved': 'Réservé',
//       'occupied': 'Occupé',
//       // ── Détail logement ──────────────────────────────────────────────────
//       'perMonth': '/mois',
//       'rooms': 'chambres',
//       'bathrooms': 'salles de bain',
//       'area': 'm²',
//       'planVisit': 'Planifier une visite',
//       'contactOwner': 'Contacter le propriétaire',
//       'description': 'Description',
//       'equipment': 'Équipements',
//       'location': 'Localisation',
//       'viewOnMap': 'Voir sur Google Maps',
//       'virtualVisit': 'Visite virtuelle',
//       'views': 'Vues',
//       'likes': 'Likes',
//       'added': 'Ajouté',
//       'viewMore': 'Voir plus',
//       'viewLess': 'Voir moins',
//       'smartSuggestions': 'Suggestions intelligentes',
//       'messagePlaceholder': 'Message au propriétaire (optionnel)',
//       'visitSuccess': 'Visite planifiée avec succès ✓',
//       'copiedToClipboard': 'Copié dans le presse-papier',
//       'openInBrowser': 'Ouvre dans le navigateur',
//       'seeOnMaps': 'Voir sur Maps',
//       // ── Dates relatives ──────────────────────────────────────────────────
//       'today': "Aujourd'hui",
//       'yesterday': 'Hier',
//       'thisWeek': 'Cette semaine',
//       'daysAgo': 'Il y a {n}j',
//       'monthsAgo': 'Il y a {n} mois',
//       'minutesAgo': 'Il y a {n} min',
//       'hoursAgo': 'Il y a {n}h',
//       // ── Notifications ────────────────────────────────────────────────────
//       'markAllRead': 'Tout marquer',
//       'noNotifications': 'Aucune notification',
//       // ── Visites ──────────────────────────────────────────────────────────
//       'visitDate': 'Choisir une date',
//       'visitTime': 'Choisir une heure',
//       'confirmVisit': 'Confirmer la visite',
//       'refuseVisit': 'Refuser la visite',
//       'cancelVisit': 'Annuler la visite',
//       'pending': 'En attente',
//       'confirmed': 'Confirmées',
//       'past': 'Passées',
//       'noVisitLabel': 'Aucune visite {lbl}',
//       // ── Profil / Dashboard ───────────────────────────────────────────────
//       'dashboard': 'Tableau de bord',
//       'users': 'Utilisateurs',
//       'housings': 'Logements',
//       'settings': 'Paramètres',
//       'reservations': 'Réservations',
//       'myListings': 'Mes annonces',
//       'myVisits': 'Mes visites',
//       'myFavorites': 'Mes favoris',
//       'addHousing': 'Ajouter un logement',
//       'editProfile': 'Modifier le profil',
//       'owner': 'Propriétaire',
//       'tenant': 'Locataire',
//       'administrator': 'Administrateur',
//       'verified': 'Vérifié',
//       'switchToOwner': 'Passer en mode Propriétaire',
//       'switchToTenant': 'Passer en mode Locataire',
//       'languageLabel': 'Langue',
//       'darkMode': 'Mode sombre',
//       'accountInfo': 'Informations personnelles',
//       'personalInfo': 'Informations personnelles',
//       'security': 'Sécurité & Mot de passe',
//       // ── Messagerie ───────────────────────────────────────────────────────
//       'noFavorites': 'Aucun favori',
//       'noMessages': 'Aucune conversation',
//       'typeMessage': 'Message…',
//       'send': 'Envoyer',
//       // ── Formulaire logement ──────────────────────────────────────────────
//       'general': 'Informations générales',
//       'details': 'Détails du logement',
//       'photos': 'Photos',
//       'preview': 'Aperçu',
//       'publish': 'Publier',
//       'titleLabel': "Titre de l'annonce",
//       'priceLabel': 'Loyer (FCFA/mois)',
//       'areaLabel': 'Surface (m²)',
//       'descriptionLabel': 'Description',
//       'categoryLabel': 'Catégorie',
//       'regionLabel': 'Région',
//       'cityLabel': 'Ville',
//       'districtLabel': 'Quartier',
//       // ── Filtres ──────────────────────────────────────────────────────────
//       'priceRange': 'Gamme de prix (FCFA)',
//       'housingType': 'Type de logement',
//       'minRooms': 'Chambres',
//       'minArea': 'Surface (m²)',
//       'amenities': 'Commodités',
//       'furnished': 'Meublé',
//       'unfurnished': 'Non-meublé',
//       'parking': 'Parking',
//       'pool': 'Piscine',
//       'wifi': 'Wi-Fi',
//       'security24h': 'Sécurité 24h',
//       // ── Recherche ────────────────────────────────────────────────────────
//       'nlpSearch': 'Langage naturel',
//       'voiceSearch': 'Recherche vocale',
//       'nearMe': 'Près de moi',
//       'smartSearch': 'Recherche intelligente',
//       'showListings': 'Afficher les logements',
//       'newBadge': 'NOUVEAU',
//       'popularBadge': 'POPULAIRE',
//     },

//     'en': {
//       // ── App ──────────────────────────────────────────────────────────────
//       'appName': 'RentAL',
//       'discover': 'Discover',
//       'tagline': 'Find your home in Cameroon',
//       'search': 'Search',
//       'searchHint': 'A neighborhood, a city…',
//       'home': 'Home',
//       'favorites': 'Favorites',
//       'messages': 'Messages',
//       'profile': 'Profile',
//       'notifications': 'Notifications',
//       'recentListings': 'Recent listings',
//       'seeAll': 'See all',
//       // ── Actions génériques ───────────────────────────────────────────────
//       'loading': 'Loading…',
//       'error': 'An error occurred',
//       'retry': 'Retry',
//       'noResults': 'No results found',
//       'filters': 'Filters',
//       'apply': 'Apply',
//       'reset': 'Reset',
//       'cancel': 'Cancel',
//       'confirm': 'Confirm',
//       'save': 'Save',
//       'logout': 'Log out',
//       'login': 'Login',
//       'register': 'Register',
//       'next': 'Next',
//       'back': 'Back',
//       'refuse': 'Refuse',
//       'block': 'Block',
//       'unblock': 'Unblock',
//       'delete': 'Delete',
//       'edit': 'Edit',
//       // ── Statuts ──────────────────────────────────────────────────────────
//       'available': 'Available',
//       'reserved': 'Reserved',
//       'occupied': 'Occupied',
//       // ── Détail logement ──────────────────────────────────────────────────
//       'perMonth': '/month',
//       'rooms': 'bedrooms',
//       'bathrooms': 'bathrooms',
//       'area': 'm²',
//       'planVisit': 'Schedule a visit',
//       'contactOwner': 'Contact owner',
//       'description': 'Description',
//       'equipment': 'Equipment',
//       'location': 'Location',
//       'viewOnMap': 'View on Google Maps',
//       'virtualVisit': 'Virtual tour',
//       'views': 'Views',
//       'likes': 'Likes',
//       'added': 'Added',
//       'viewMore': 'View more',
//       'viewLess': 'View less',
//       'smartSuggestions': 'Smart suggestions',
//       'messagePlaceholder': 'Message to owner (optional)',
//       'visitSuccess': 'Visit scheduled successfully ✓',
//       'copiedToClipboard': 'Copied to clipboard',
//       'openInBrowser': 'Opens in browser',
//       'seeOnMaps': 'View on Maps',
//       // ── Dates relatives ──────────────────────────────────────────────────
//       'today': 'Today',
//       'yesterday': 'Yesterday',
//       'thisWeek': 'This week',
//       'daysAgo': '{n} days ago',
//       'monthsAgo': '{n} months ago',
//       'minutesAgo': '{n} min ago',
//       'hoursAgo': '{n}h ago',
//       // ── Notifications ────────────────────────────────────────────────────
//       'markAllRead': 'Mark all read',
//       'noNotifications': 'No notifications',
//       // ── Visites ──────────────────────────────────────────────────────────
//       'visitDate': 'Choose a date',
//       'visitTime': 'Choose a time',
//       'confirmVisit': 'Confirm visit',
//       'refuseVisit': 'Refuse visit',
//       'cancelVisit': 'Cancel visit',
//       'pending': 'Pending',
//       'confirmed': 'Confirmed',
//       'past': 'Past',
//       'noVisitLabel': 'No {lbl} visit',
//       // ── Profil / Dashboard ───────────────────────────────────────────────
//       'dashboard': 'Dashboard',
//       'users': 'Users',
//       'housings': 'Listings',
//       'settings': 'Settings',
//       'reservations': 'Reservations',
//       'myListings': 'My listings',
//       'myVisits': 'My visits',
//       'myFavorites': 'My favorites',
//       'addHousing': 'Add listing',
//       'editProfile': 'Edit profile',
//       'owner': 'Owner',
//       'tenant': 'Tenant',
//       'administrator': 'Administrator',
//       'verified': 'Verified',
//       'switchToOwner': 'Switch to Owner mode',
//       'switchToTenant': 'Switch to Tenant mode',
//       'languageLabel': 'Language',
//       'darkMode': 'Dark mode',
//       'accountInfo': 'Personal information',
//       'personalInfo': 'Personal information',
//       'security': 'Security & Password',
//       // ── Messagerie ───────────────────────────────────────────────────────
//       'noFavorites': 'No favorites',
//       'noMessages': 'No conversations',
//       'typeMessage': 'Message…',
//       'send': 'Send',
//       // ── Formulaire logement ──────────────────────────────────────────────
//       'general': 'General information',
//       'details': 'Housing details',
//       'photos': 'Photos',
//       'preview': 'Preview',
//       'publish': 'Publish',
//       'titleLabel': 'Title',
//       'priceLabel': 'Rent (FCFA/month)',
//       'areaLabel': 'Area (m²)',
//       'descriptionLabel': 'Description',
//       'categoryLabel': 'Category',
//       'regionLabel': 'Region',
//       'cityLabel': 'City',
//       'districtLabel': 'Neighborhood',
//       // ── Filtres ──────────────────────────────────────────────────────────
//       'priceRange': 'Price range (FCFA)',
//       'housingType': 'Housing type',
//       'minRooms': 'Bedrooms',
//       'minArea': 'Area (m²)',
//       'amenities': 'Amenities',
//       'furnished': 'Furnished',
//       'unfurnished': 'Unfurnished',
//       'parking': 'Parking',
//       'pool': 'Pool',
//       'wifi': 'Wi-Fi',
//       'security24h': '24h Security',
//       // ── Recherche ────────────────────────────────────────────────────────
//       'nlpSearch': 'Natural language',
//       'voiceSearch': 'Voice search',
//       'nearMe': 'Near me',
//       'smartSearch': 'Smart search',
//       'showListings': 'Show listings',
//       'newBadge': 'NEW',
//       'popularBadge': 'POPULAR',
//     },
//   };
// }

// // ── Widget Provider ────────────────────────────────────────────────────────
// class L10nProvider extends StatefulWidget {
//   final String language;
//   final Widget child;
//   const L10nProvider({super.key, required this.language, required this.child});

//   @override
//   State<L10nProvider> createState() => _AppL10nState();
// }

// class _AppL10nState extends State<L10nProvider> {
//   late AppL10n _l10n;

//   @override
//   void initState() {
//     super.initState();
//     _l10n = AppL10n(widget.language);
//   }

//   @override
//   void didUpdateWidget(L10nProvider oldWidget) {
//     super.didUpdateWidget(oldWidget);
//     if (oldWidget.language != widget.language) {
//       setState(() => _l10n = AppL10n(widget.language));
//     }
//   }

//   @override
//   Widget build(BuildContext context) => widget.child;
// }

// // ── Extension helper ───────────────────────────────────────────────────────
// extension L10nExtension on BuildContext {
//   AppL10n get l10n {
//     try {
//       return AppL10n.of(this);
//     } catch (_) {
//       return const AppL10n('fr');
//     }
//   }
// }

// lib/core/l10n/app_localizations.dart
// Système bilingue FR/EN — V3 FINALE
// ✅ Clés ajoutées vs V2 :
//   • forYou, all, all (catégorie "Tous")
//   • cancelVisit
//   • toutes les clés home/search/visits/profile/detail

import 'package:flutter/material.dart';

class AppL10n {
  final String locale;
  const AppL10n(this.locale);

  static AppL10n of(BuildContext context) {
    final provider = context.findAncestorStateOfType<_AppL10nState>();
    return provider?._l10n ?? const AppL10n('fr');
  }

  String get(String key) => _data[locale]?[key] ?? _data['fr']![key] ?? key;

  // ── App ──────────────────────────────────────────────────────────────────
  String get appName       => get('appName');
  String get discover      => get('discover');
  String get tagline       => get('tagline');
  String get search        => get('search');
  String get searchHint    => get('searchHint');
  String get home          => get('home');
  String get favorites     => get('favorites');
  String get messages      => get('messages');
  String get profile       => get('profile');
  String get notifications => get('notifications');
  String get recentListings => get('recentListings');
  String get seeAll        => get('seeAll');

  // ── HOME spécifiques ─────────────────────────────────────────────────────
  /// "Pour vous" / "For you" — section recommandations IA
  String get forYou        => get('forYou');
  /// "Tous" / "All" — premier chip filtre catégorie
  String get all           => get('all');
  String get activateSuggestions => get('activateSuggestions');
  String get configurePref => get('configurePref');
  String get loadMore      => get('loadMore');

  // ── SEARCH spécifiques ───────────────────────────────────────────────────
  String get searchTitle   => get('searchTitle');
  String get results       => get('results');
  String get sortBy        => get('sortBy');
  String get sortRecent    => get('sortRecent');
  String get sortPriceAsc  => get('sortPriceAsc');
  String get sortPriceDesc => get('sortPriceDesc');
  String get sortPopular   => get('sortPopular');
  String get iaActive      => get('iaActive');
  String get searchLoading => get('searchLoading');
  String get searchError   => get('searchError');
  String get noHousing     => get('noHousing');
  String get voiceHint     => get('voiceHint');

  // ── Actions génériques ────────────────────────────────────────────────────
  String get loading       => get('loading');
  String get error         => get('error');
  String get retry         => get('retry');
  String get noResults     => get('noResults');
  String get filters       => get('filters');
  String get apply         => get('apply');
  String get reset         => get('reset');
  String get cancel        => get('cancel');
  String get confirm       => get('confirm');
  String get save          => get('save');
  String get logout        => get('logout');
  String get login         => get('login');
  String get register      => get('register');
  String get next          => get('next');
  String get back          => get('back');
  String get refuse        => get('refuse');
  String get block         => get('block');
  String get unblock       => get('unblock');
  String get delete        => get('delete');
  String get edit          => get('edit');

  // ── Statuts logement ─────────────────────────────────────────────────────
  String get available     => get('available');
  String get reserved      => get('reserved');
  String get occupied      => get('occupied');

  // ── Détail logement ──────────────────────────────────────────────────────
  String get perMonth      => get('perMonth');
  String get rooms         => get('rooms');
  String get bathrooms     => get('bathrooms');
  String get area          => get('area');
  String get planVisit     => get('planVisit');
  String get contactOwner  => get('contactOwner');
  String get description   => get('description');
  String get equipment     => get('equipment');
  String get location      => get('location');
  String get viewOnMap     => get('viewOnMap');
  String get virtualVisit  => get('virtualVisit');
  String get views         => get('views');
  String get likes         => get('likes');
  String get added         => get('added');
  String get viewMore      => get('viewMore');
  String get viewLess      => get('viewLess');
  String get smartSuggestions => get('smartSuggestions');
  String get messagePlaceholder => get('messagePlaceholder');
  String get visitSuccess  => get('visitSuccess');
  String get copiedToClipboard => get('copiedToClipboard');
  String get openInBrowser => get('openInBrowser');
  String get seeOnMaps     => get('seeOnMaps');

  // ── Dates relatives ───────────────────────────────────────────────────────
  String get today         => get('today');
  String get yesterday     => get('yesterday');
  String get thisWeek      => get('thisWeek');
  String daysAgo(int n)    => get('daysAgo').replaceAll('{n}', '$n');
  String monthsAgo(int n)  => get('monthsAgo').replaceAll('{n}', '$n');
  String minutesAgo(int n) => get('minutesAgo').replaceAll('{n}', '$n');
  String hoursAgo(int n)   => get('hoursAgo').replaceAll('{n}', '$n');

  // ── Notifications ─────────────────────────────────────────────────────────
  String get markAllRead      => get('markAllRead');
  String get noNotifications  => get('noNotifications');

  // ── Visites ───────────────────────────────────────────────────────────────
  String get visitDate     => get('visitDate');
  String get visitTime     => get('visitTime');
  String get confirmVisit  => get('confirmVisit');
  String get refuseVisit   => get('refuseVisit');
  String get cancelVisit   => get('cancelVisit');
  String get pending       => get('pending');
  String get confirmed     => get('confirmed');
  String get past          => get('past');
  String noVisitLabel(String lbl) => get('noVisitLabel').replaceAll('{lbl}', lbl);

  // ── Profil / Dashboard ────────────────────────────────────────────────────
  String get dashboard     => get('dashboard');
  String get users         => get('users');
  String get housings      => get('housings');
  String get settings      => get('settings');
  String get reservations  => get('reservations');
  String get myListings    => get('myListings');
  String get myVisits      => get('myVisits');
  String get myFavorites   => get('myFavorites');
  String get addHousing    => get('addHousing');
  String get editProfile   => get('editProfile');
  String get owner         => get('owner');
  String get tenant        => get('tenant');
  String get administrator => get('administrator');
  String get verified      => get('verified');
  String get switchToOwner => get('switchToOwner');
  String get switchToTenant => get('switchToTenant');
  String get languageLabel => get('languageLabel');
  String get darkMode      => get('darkMode');
  String get accountInfo   => get('accountInfo');
  String get personalInfo  => get('personalInfo');
  String get security      => get('security');

  // ── Messagerie ────────────────────────────────────────────────────────────
  String get noFavorites   => get('noFavorites');
  String get noMessages    => get('noMessages');
  String get typeMessage   => get('typeMessage');
  String get send          => get('send');

  // ── Formulaire logement ───────────────────────────────────────────────────
  String get general       => get('general');
  String get details       => get('details');
  String get photos        => get('photos');
  String get preview       => get('preview');
  String get publish       => get('publish');
  String get titleLabel    => get('titleLabel');
  String get priceLabel    => get('priceLabel');
  String get areaLabel     => get('areaLabel');
  String get descriptionLabel => get('descriptionLabel');
  String get categoryLabel => get('categoryLabel');
  String get regionLabel   => get('regionLabel');
  String get cityLabel     => get('cityLabel');
  String get districtLabel => get('districtLabel');

  // ── Filtres ───────────────────────────────────────────────────────────────
  String get priceRange    => get('priceRange');
  String get housingType   => get('housingType');
  String get minRooms      => get('minRooms');
  String get minArea       => get('minArea');
  String get amenities     => get('amenities');
  String get furnished     => get('furnished');
  String get unfurnished   => get('unfurnished');
  String get parking       => get('parking');
  String get pool          => get('pool');
  String get wifi          => get('wifi');
  String get security24h   => get('security24h');

  // ── Recherche ─────────────────────────────────────────────────────────────
  String get nlpSearch     => get('nlpSearch');
  String get voiceSearch   => get('voiceSearch');
  String get nearMe        => get('nearMe');
  String get smartSearch   => get('smartSearch');
  String get showListings  => get('showListings');
  String get newBadge      => get('newBadge');
  String get popularBadge  => get('popularBadge');

  // ══════════════════════════════════════════════════════════════════════════
  // DICTIONNAIRE
  // ══════════════════════════════════════════════════════════════════════════
  static const Map<String, Map<String, String>> _data = {
    'fr': {
      'appName': 'RentAL',
      'discover': 'Découvrir',
      'tagline': 'Trouvez votre chez-vous au Cameroun',
      'search': 'Rechercher',
      'searchHint': 'Un quartier, une ville…',
      'home': 'Accueil',
      'favorites': 'Favoris',
      'messages': 'Messages',
      'profile': 'Profil',
      'notifications': 'Notifications',
      'recentListings': 'Logements récents',
      'seeAll': 'Voir tout',
      // HOME
      'forYou': 'Pour vous',
      'all': 'Tous',
      'activateSuggestions': 'Activez les suggestions intelligentes',
      'configurePref': 'Configurez vos préférences',
      'loadMore': 'Charger plus',
      // SEARCH
      'searchTitle': 'Rechercher',
      'results': 'résultat(s)',
      'sortBy': 'Trier',
      'sortRecent': 'Plus récent',
      'sortPriceAsc': 'Prix croissant',
      'sortPriceDesc': 'Prix décroissant',
      'sortPopular': 'Plus populaires',
      'iaActive': 'IA active',
      'searchLoading': 'Recherche en cours…',
      'searchError': 'Erreur de recherche',
      'noHousing': 'Aucun logement trouvé',
      'voiceHint': 'Parlez maintenant…',
      // Actions
      'loading': 'Chargement…',
      'error': 'Une erreur est survenue',
      'retry': 'Réessayer',
      'noResults': 'Aucun résultat trouvé',
      'filters': 'Filtres',
      'apply': 'Appliquer',
      'reset': 'Réinitialiser',
      'cancel': 'Annuler',
      'confirm': 'Confirmer',
      'save': 'Enregistrer',
      'logout': 'Déconnexion',
      'login': 'Connexion',
      'register': 'Inscription',
      'next': 'Suivant',
      'back': 'Retour',
      'refuse': 'Refuser',
      'block': 'Bloquer',
      'unblock': 'Débloquer',
      'delete': 'Supprimer',
      'edit': 'Modifier',
      // Statuts
      'available': 'Disponible',
      'reserved': 'Réservé',
      'occupied': 'Occupé',
      // Détail
      'perMonth': '/mois',
      'rooms': 'chambres',
      'bathrooms': 'salles de bain',
      'area': 'm²',
      'planVisit': 'Planifier une visite',
      'contactOwner': 'Contacter le propriétaire',
      'description': 'Description',
      'equipment': 'Équipements',
      'location': 'Localisation',
      'viewOnMap': 'Voir sur Google Maps',
      'virtualVisit': 'Visite virtuelle',
      'views': 'Vues',
      'likes': 'Likes',
      'added': 'Ajouté',
      'viewMore': 'Voir plus',
      'viewLess': 'Voir moins',
      'smartSuggestions': 'Suggestions intelligentes',
      'messagePlaceholder': 'Message au propriétaire (optionnel)',
      'visitSuccess': 'Visite planifiée avec succès ✓',
      'copiedToClipboard': 'Copié dans le presse-papier',
      'openInBrowser': 'Ouvre dans le navigateur',
      'seeOnMaps': 'Voir sur Maps',
      // Dates
      'today': "Aujourd'hui",
      'yesterday': 'Hier',
      'thisWeek': 'Cette semaine',
      'daysAgo': 'Il y a {n}j',
      'monthsAgo': 'Il y a {n} mois',
      'minutesAgo': 'Il y a {n} min',
      'hoursAgo': 'Il y a {n}h',
      // Notifications
      'markAllRead': 'Tout marquer',
      'noNotifications': 'Aucune notification',
      // Visites
      'visitDate': 'Choisir une date',
      'visitTime': 'Choisir une heure',
      'confirmVisit': 'Confirmer la visite',
      'refuseVisit': 'Refuser la visite',
      'cancelVisit': 'Annuler la visite',
      'pending': 'En attente',
      'confirmed': 'Confirmées',
      'past': 'Passées',
      'noVisitLabel': 'Aucune visite {lbl}',
      // Profil
      'dashboard': 'Tableau de bord',
      'users': 'Utilisateurs',
      'housings': 'Logements',
      'settings': 'Paramètres',
      'reservations': 'Réservations',
      'myListings': 'Mes annonces',
      'myVisits': 'Mes visites',
      'myFavorites': 'Mes favoris',
      'addHousing': 'Ajouter un logement',
      'editProfile': 'Modifier le profil',
      'owner': 'Propriétaire',
      'tenant': 'Locataire',
      'administrator': 'Administrateur',
      'verified': 'Vérifié',
      'switchToOwner': 'Passer en mode Propriétaire',
      'switchToTenant': 'Passer en mode Locataire',
      'languageLabel': 'Langue',
      'darkMode': 'Mode sombre',
      'accountInfo': 'Informations personnelles',
      'personalInfo': 'Informations personnelles',
      'security': 'Sécurité & Mot de passe',
      // Messagerie
      'noFavorites': 'Aucun favori',
      'noMessages': 'Aucune conversation',
      'typeMessage': 'Message…',
      'send': 'Envoyer',
      // Formulaire
      'general': 'Informations générales',
      'details': 'Détails du logement',
      'photos': 'Photos',
      'preview': 'Aperçu',
      'publish': 'Publier',
      'titleLabel': "Titre de l'annonce",
      'priceLabel': 'Loyer (FCFA/mois)',
      'areaLabel': 'Surface (m²)',
      'descriptionLabel': 'Description',
      'categoryLabel': 'Catégorie',
      'regionLabel': 'Région',
      'cityLabel': 'Ville',
      'districtLabel': 'Quartier',
      // Filtres
      'priceRange': 'Gamme de prix (FCFA)',
      'housingType': 'Type de logement',
      'minRooms': 'Chambres',
      'minArea': 'Surface (m²)',
      'amenities': 'Commodités',
      'furnished': 'Meublé',
      'unfurnished': 'Non-meublé',
      'parking': 'Parking',
      'pool': 'Piscine',
      'wifi': 'Wi-Fi',
      'security24h': 'Sécurité 24h',
      // Recherche
      'nlpSearch': 'Langage naturel',
      'voiceSearch': 'Recherche vocale',
      'nearMe': 'Près de moi',
      'smartSearch': 'Recherche intelligente',
      'showListings': 'Afficher les logements',
      'newBadge': 'NOUVEAU',
      'popularBadge': 'POPULAIRE',
    },

    'en': {
      'appName': 'RentAL',
      'discover': 'Discover',
      'tagline': 'Find your home in Cameroon',
      'search': 'Search',
      'searchHint': 'A neighborhood, a city…',
      'home': 'Home',
      'favorites': 'Favorites',
      'messages': 'Messages',
      'profile': 'Profile',
      'notifications': 'Notifications',
      'recentListings': 'Recent listings',
      'seeAll': 'See all',
      // HOME
      'forYou': 'For you',
      'all': 'All',
      'activateSuggestions': 'Activate smart suggestions',
      'configurePref': 'Configure your preferences',
      'loadMore': 'Load more',
      // SEARCH
      'searchTitle': 'Search',
      'results': 'result(s)',
      'sortBy': 'Sort',
      'sortRecent': 'Most recent',
      'sortPriceAsc': 'Price: low to high',
      'sortPriceDesc': 'Price: high to low',
      'sortPopular': 'Most popular',
      'iaActive': 'AI active',
      'searchLoading': 'Searching…',
      'searchError': 'Search error',
      'noHousing': 'No housing found',
      'voiceHint': 'Speak now…',
      // Actions
      'loading': 'Loading…',
      'error': 'An error occurred',
      'retry': 'Retry',
      'noResults': 'No results found',
      'filters': 'Filters',
      'apply': 'Apply',
      'reset': 'Reset',
      'cancel': 'Cancel',
      'confirm': 'Confirm',
      'save': 'Save',
      'logout': 'Log out',
      'login': 'Login',
      'register': 'Register',
      'next': 'Next',
      'back': 'Back',
      'refuse': 'Refuse',
      'block': 'Block',
      'unblock': 'Unblock',
      'delete': 'Delete',
      'edit': 'Edit',
      // Statuts
      'available': 'Available',
      'reserved': 'Reserved',
      'occupied': 'Occupied',
      // Détail
      'perMonth': '/month',
      'rooms': 'bedrooms',
      'bathrooms': 'bathrooms',
      'area': 'm²',
      'planVisit': 'Schedule a visit',
      'contactOwner': 'Contact owner',
      'description': 'Description',
      'equipment': 'Equipment',
      'location': 'Location',
      'viewOnMap': 'View on Google Maps',
      'virtualVisit': 'Virtual tour',
      'views': 'Views',
      'likes': 'Likes',
      'added': 'Added',
      'viewMore': 'View more',
      'viewLess': 'View less',
      'smartSuggestions': 'Smart suggestions',
      'messagePlaceholder': 'Message to owner (optional)',
      'visitSuccess': 'Visit scheduled successfully ✓',
      'copiedToClipboard': 'Copied to clipboard',
      'openInBrowser': 'Opens in browser',
      'seeOnMaps': 'View on Maps',
      // Dates
      'today': 'Today',
      'yesterday': 'Yesterday',
      'thisWeek': 'This week',
      'daysAgo': '{n} days ago',
      'monthsAgo': '{n} months ago',
      'minutesAgo': '{n} min ago',
      'hoursAgo': '{n}h ago',
      // Notifications
      'markAllRead': 'Mark all read',
      'noNotifications': 'No notifications',
      // Visites
      'visitDate': 'Choose a date',
      'visitTime': 'Choose a time',
      'confirmVisit': 'Confirm visit',
      'refuseVisit': 'Refuse visit',
      'cancelVisit': 'Cancel visit',
      'pending': 'Pending',
      'confirmed': 'Confirmed',
      'past': 'Past',
      'noVisitLabel': 'No {lbl} visit',
      // Profil
      'dashboard': 'Dashboard',
      'users': 'Users',
      'housings': 'Listings',
      'settings': 'Settings',
      'reservations': 'Reservations',
      'myListings': 'My listings',
      'myVisits': 'My visits',
      'myFavorites': 'My favorites',
      'addHousing': 'Add listing',
      'editProfile': 'Edit profile',
      'owner': 'Owner',
      'tenant': 'Tenant',
      'administrator': 'Administrator',
      'verified': 'Verified',
      'switchToOwner': 'Switch to Owner mode',
      'switchToTenant': 'Switch to Tenant mode',
      'languageLabel': 'Language',
      'darkMode': 'Dark mode',
      'accountInfo': 'Personal information',
      'personalInfo': 'Personal information',
      'security': 'Security & Password',
      // Messagerie
      'noFavorites': 'No favorites',
      'noMessages': 'No conversations',
      'typeMessage': 'Message…',
      'send': 'Send',
      // Formulaire
      'general': 'General information',
      'details': 'Housing details',
      'photos': 'Photos',
      'preview': 'Preview',
      'publish': 'Publish',
      'titleLabel': 'Title',
      'priceLabel': 'Rent (FCFA/month)',
      'areaLabel': 'Area (m²)',
      'descriptionLabel': 'Description',
      'categoryLabel': 'Category',
      'regionLabel': 'Region',
      'cityLabel': 'City',
      'districtLabel': 'Neighborhood',
      // Filtres
      'priceRange': 'Price range (FCFA)',
      'housingType': 'Housing type',
      'minRooms': 'Bedrooms',
      'minArea': 'Area (m²)',
      'amenities': 'Amenities',
      'furnished': 'Furnished',
      'unfurnished': 'Unfurnished',
      'parking': 'Parking',
      'pool': 'Pool',
      'wifi': 'Wi-Fi',
      'security24h': '24h Security',
      // Recherche
      'nlpSearch': 'Natural language',
      'voiceSearch': 'Voice search',
      'nearMe': 'Near me',
      'smartSearch': 'Smart search',
      'showListings': 'Show listings',
      'newBadge': 'NEW',
      'popularBadge': 'POPULAR',
    },
  };
}

// ── Widget Provider ────────────────────────────────────────────────────────
class L10nProvider extends StatefulWidget {
  final String language;
  final Widget child;
  const L10nProvider({super.key, required this.language, required this.child});

  @override
  State<L10nProvider> createState() => _AppL10nState();
}

class _AppL10nState extends State<L10nProvider> {
  late AppL10n _l10n;

  @override
  void initState() {
    super.initState();
    _l10n = AppL10n(widget.language);
  }

  @override
  void didUpdateWidget(L10nProvider oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.language != widget.language) {
      setState(() => _l10n = AppL10n(widget.language));
    }
  }

  @override
  Widget build(BuildContext context) => widget.child;
}

// ── Extension helper ───────────────────────────────────────────────────────
extension L10nExtension on BuildContext {
  AppL10n get l10n {
    try {
      return AppL10n.of(this);
    } catch (_) {
      return const AppL10n('fr');
    }
  }
}

// // // ============================================
// // // lib/core/constants/api_constants.dart
// // // ============================================


// CORRECTION BUG :
//   Flutter envoyait POST /api/users/register/  ← FAUX
//   Django écoute sur  POST /api/register/      ← CORRECT
//
// Vérification dans apps/users/urls.py :
//   path('login/', views.login_view)        → /api/login/
//   path('register/', UserViewSet.register) → /api/register/
//
// ╔══════════════════════════════════════════════════════╗
// ║  CHOISIR L'URL SELON VOTRE PLATEFORME DE TEST       ║
// ╠══════════════════════════════════════════════════════╣
// ║  Chrome / Web     → http://localhost:8000/api       ║
// ║  Android Emul.    → http://10.0.2.2:8000/api       ║
// ║  Android physique → http://VOTRE_IP:8000/api       ║
// ║  iOS Simulator    → http://localhost:8000/api       ║
// ╚══════════════════════════════════════════════════════╝

class ApiConstants {
  // ── URL de base ─────────────────────────────────────────
  // Décommentez selon votre plateforme de test :

  static const String baseUrl = 'http://localhost:8000/api'; // Chrome ✅

  // static const String baseUrl = 'http://10.0.2.2:8000/api'; // Android Emulator
  // static const String baseUrl = 'http://192.168.1.XX:8000/api'; // Physique
  // static const String baseUrl = 'https://votre-domaine.com/api'; // Production

  // ── Auth ─────────────────────────────────────────────────
  static const String login          = '/login/';
  static const String register       = '/register/';   // ✅ CORRIGÉ (était /users/register/)
  static const String profile        = '/users/me/';
  static const String tokenRefresh   = '/token/refresh/';
  static const String changePassword = '/users/change_password/';

  // ── Housing ──────────────────────────────────────────────
  static const String housings            = '/housings/';
  static const String recommendedHousings = '/housings/recommended/';
  static const String myHousings          = '/housings/my_housings/';
  static const String categories          = '/categories/';
  static const String housingTypes        = '/types/';

  // ── Location ─────────────────────────────────────────────
  static const String regions   = '/regions/';
  static const String cities    = '/cities/';
  static const String districts = '/districts/';

  // ── Visits ───────────────────────────────────────────────
  static const String visits = '/visits/';

  // ── Messaging ────────────────────────────────────────────
  static const String conversations     = '/conversations/';
  static const String messages          = '/messages/';
  static const String startConversation = '/conversations/start/';

  // ── Notifications ────────────────────────────────────────
  static const String notifications = '/notifications/';
  static const String markAllRead   = '/notifications/mark_all_read/';

  // ── Search NLP ───────────────────────────────────────────
  static const String nlpSearch = '/recherche/nlp/';

// //   // Google Maps API Key
// //   static const String googleMapsApiKey = 'VOTRE_CLE_GOOGLE_MAPS';
 

  // ── Timeouts ─────────────────────────────────────────────
  static const Duration connectTimeout = Duration(seconds: 30);
  static const Duration receiveTimeout = Duration(seconds: 30);
}
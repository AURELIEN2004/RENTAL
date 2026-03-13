

// // ============================================
// // 📁 src/services/searchService.js  — VERSION MISE À JOUR
// // Ajout : nlpSearch() pour la recherche en langage naturel
// // ============================================

// import api from './api';

// const searchService = {

//   // ------------------------------------------------------------------
//   // 🔍  Recherche classique avec filtres structurés
//   // GET /api/recherche/search/
//   // ------------------------------------------------------------------
//   async searchHousings(filters = {}) {
//     const response = await api.get('/recherche/search/', { params: filters });
//     return response.data;
//   },

//   // ------------------------------------------------------------------
//   // 📍  Recherche "Près de moi"
//   // GET /api/recherche/nearby/
//   // ------------------------------------------------------------------
//   async searchNearby(lat, lng, radius = 5, extraFilters = {}) {
//     const response = await api.get('/recherche/nearby/', {
//       params: { lat, lng, radius, ...extraFilters },
//     });
//     return response.data;
//   },

//   // ------------------------------------------------------------------
//   // 🧠  Recherche intelligente avec scoring
//   // GET /api/recherche/smart/
//   // ------------------------------------------------------------------
//   async smartSearch(filters = {}) {
//     const response = await api.get('/recherche/smart/', { params: filters });
//     return response.data;
//   },

//   // ------------------------------------------------------------------
//   // 🔤  Recherche en Langage Naturel (NLP) — NOUVEAU
//   // POST /api/recherche/nlp/
//   //
//   // Params:
//   //   query     {string}  — texte libre de l'utilisateur
//   //   language  {string}  — 'fr' ou 'en' (défaut 'fr')
//   //   method    {string}  — 'simple' | 'ollama' (défaut 'simple')
//   //   user_lat  {number}  — latitude (optionnel)
//   //   user_lng  {number}  — longitude (optionnel)
//   //
//   // Retourne:
//   //   { query, criteria_extracted, criteria_summary,
//   //     count, results, suggestions }
//   // ------------------------------------------------------------------
//   async nlpSearch({ query, language = 'fr', method = 'simple', user_lat, user_lng } = {}) {
//     const payload = { query, language, method };
//     if (user_lat !== undefined) payload.user_lat = user_lat;
//     if (user_lng !== undefined) payload.user_lng = user_lng;

//     const response = await api.post('/recherche/nlp/', payload);
//     return response.data;
//   },

//   // ------------------------------------------------------------------
//   // 🗺️  Logements pour la carte
//   // GET /api/recherche/map/
//   // ------------------------------------------------------------------
//   async getMapHousings() {
//     const response = await api.get('/recherche/map/');
//     return response.data;
//   },

//   // ------------------------------------------------------------------
//   // 📍  Géolocalisation navigateur
//   // ------------------------------------------------------------------
//   getUserLocation() {
//     return new Promise((resolve, reject) => {
//       if (!navigator.geolocation) {
//         reject(new Error('Géolocalisation non supportée'));
//         return;
//       }
//       navigator.geolocation.getCurrentPosition(
//         (position) => resolve({ lat: position.coords.latitude, lng: position.coords.longitude }),
//         (error) => {
//           const messages = {
//             1: 'Accès à la localisation refusé.',
//             2: 'Position indisponible.',
//             3: 'Délai dépassé.',
//           };
//           reject(new Error(messages[error.code] || 'Erreur de géolocalisation'));
//         },
//         { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
//       );
//     });
//   },

//   // ------------------------------------------------------------------
//   // 💡  Suggestions de recherche
//   // GET /api/recherche/chatbot/suggestions/
//   // ------------------------------------------------------------------
//   async getSuggestions() {
//     const response = await api.get('/recherche/chatbot/suggestions/');
//     return response.data.suggestions || [];
//   },
// };

// export default searchService;








// src/services/searchService.js
// ============================================================
// ENDPOINTS ACTIFS (vérifiés dans apps/recherche/urls.py) :
//   ✅ POST /api/recherche/nlp/       → NLPSearchAPIView
//   ❌ GET  /api/recherche/search/    → retourne juste {"message":"works"}
//   ❌ GET  /api/recherche/nearby/    → commenté dans urls.py
//   ❌ GET  /api/recherche/smart/     → commenté dans urls.py
//   ❌ GET  /api/recherche/map/       → commenté dans urls.py
//
// Stratégie :
//   • Texte / vocal / NLP  → nlpSearch()    (POST /nlp/)
//   • Filtres structurés   → housingService.getHousings()
//   • Près de moi          → nlpSearch() + coords GPS
// ============================================================

import api from './api';

const searchService = {

  // ──────────────────────────────────────────────────────────
  // 🧠  Recherche NLP — seul endpoint de recherche fonctionnel
  // POST /api/recherche/nlp/
  //
  // Payload :
  //   query    {string}  texte libre (FR ou EN)
  //   language {string}  'fr' | 'en'
  //   method   {string}  'simple' (défaut)
  //   user_lat {number}  latitude GPS  (optionnel)
  //   user_lng {number}  longitude GPS (optionnel)
  //
  // Réponse :
  //   { query, criteria_summary, count, results[], suggestions[] }
  // ──────────────────────────────────────────────────────────
  async nlpSearch({ query, language = 'fr', user_lat, user_lng } = {}) {
    const payload = { query, language, method: 'simple' };
    if (user_lat !== undefined && user_lat !== null) payload.user_lat = user_lat;
    if (user_lng !== undefined && user_lng !== null) payload.user_lng = user_lng;

    const response = await api.post('/recherche/nlp/', payload);
    return response.data;
    // { query, criteria_summary, count, results[], suggestions[] }
  },

  // ──────────────────────────────────────────────────────────
  // 📍  Géolocalisation navigateur
  // ──────────────────────────────────────────────────────────
  getUserLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject({ code: 0, message: 'not_supported' });
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }),
        (err) => reject(err),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 300_000 }
      );
    });
  },
};

export default searchService;








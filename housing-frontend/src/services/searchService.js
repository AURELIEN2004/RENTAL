// ============================================
// 📁 src/services/searchService.js
// ============================================

import api from './api';

/**
 * Service de recherche de logements
 */
const searchService = {
  
  /**
   * 🔍 Recherche classique avec filtres
   * @param {Object} filters - Filtres de recherche
   * @returns {Promise} Résultats de recherche
   */
  async searchHousings(filters = {}) {
    try {
      const response = await api.get('/recherche/search/', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Erreur recherche:', error);
      throw error;
    }
  },

  /**
   * 📍 Recherche "Près de moi"
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @param {number} radius - Rayon en km (défaut: 5)
   * @returns {Promise} Logements à proximité
   */
  async searchNearby(lat, lng, radius = 5) {
    try {
      const response = await api.get('/recherche/nearby/', {
        params: { lat, lng, radius }
      });
      return response.data;
    } catch (error) {
      console.error('Erreur recherche proximité:', error);
      throw error;
    }
  },

  /**
   * 🧠 Recherche intelligente avec scoring
   * @param {Object} criteria - Critères de recherche avancés
   * @returns {Promise} Résultats scorés
   */
  async smartSearch(criteria = {}) {
    try {
      const response = await api.get('/recherche/smart/', { params: criteria });
      return response.data;
    } catch (error) {
      console.error('Erreur recherche intelligente:', error);
      throw error;
    }
  },

  /**
   * 🗺️ Récupérer tous les logements pour la carte
   * @returns {Promise} Logements avec coordonnées
   */
  async getMapHousings() {
    try {
      const response = await api.get('/recherche/map/');
      return response.data;
    } catch (error) {
      console.error('Erreur chargement carte:', error);
      throw error;
    }
  },

  /**
   * 📱 Obtenir la position GPS de l'utilisateur
   * @returns {Promise<{lat: number, lng: number}>} Coordonnées
   */
  async getUserLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Géolocalisation non supportée'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  },

  /**
   * 🎯 Recherche combinée (texte + proximité + scoring)
   * @param {Object} params - Paramètres combinés
   * @returns {Promise} Résultats optimisés
   */
  // async combinedSearch(params = {}) {
  //   try {
  //     // Si coordonnées fournies, utiliser recherche intelligente
  //     if (params.lat && params.lng) {
  //       return await this.smartSearch(params);
  //     }
      
  //     // Sinon, recherche classique
  //     return await this.searchHousings(params);
  //   } catch (error) {
  //     console.error('Erreur recherche combinée:', error);
  //     throw error;
  //   }
  // }
  async combinedSearch(params = {}) {
  try {
    const { lat, lng, query, city, category, max_price, min_rooms } = params;

    // Cas 1 : seulement position → Nearby
    const hasBusinessCriteria =
      query || city || category || max_price || min_rooms;

    if (lat && lng && !hasBusinessCriteria) {
      return await this.searchNearby(lat, lng, params.radius || 5);
    }

    // Cas 2 : position + critères → Smart
    if (lat && lng && hasBusinessCriteria) {
      const { radius, ...smartParams } = params; // radius non supporté par smart
      return await this.smartSearch(smartParams);
    }

    // Cas 3 : recherche classique
    return await this.searchHousings(params);

  } catch (error) {
    console.error('Erreur recherche combinée:', error);
    throw error;
  }
}


};

export default searchService;
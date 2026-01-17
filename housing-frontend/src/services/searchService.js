// ============================================
// src/services/searchService.js - SERVICE RECHERCHE
// ============================================

import api from './api';

export const searchService = {
  /**
   * Recherche de logements avec filtres avancés
   * @param {Object} filters - Objet contenant tous les filtres
   * @returns {Promise} Résultats de recherche
   */
  async searchHousings(filters = {}) {
    try {
      // Construire les paramètres de requête
      const params = this.buildQueryParams(filters);
      
      const response = await api.get('/housings/', { params });
      return response.data;
    } catch (error) {
      console.error('Erreur recherche:', error);
      throw error;
    }
  },

  /**
   * Recherche avancée avec statistiques
   */
  async advancedSearch(filters = {}) {
    try {
      const params = this.buildQueryParams(filters);
      const response = await api.get('/housings/search_advanced/', { params });
      return response.data;
    } catch (error) {
      console.error('Erreur recherche avancée:', error);
      throw error;
    }
  },

  /**
   * Recommandations personnalisées (avec ou sans filtres)
   */
  async getRecommendations(filters = {}) {
    try {
      const params = this.buildQueryParams(filters);
      const response = await api.get('/housings/recommended/', { params });
      return response.data;
    } catch (error) {
      console.error('Erreur recommandations:', error);
      throw error;
    }
  },

  /**
   * Construit les paramètres de requête à partir des filtres
   */
  buildQueryParams(filters) {
    const params = {};

    // Recherche textuelle
    if (filters.searchTerm) {
      params.search = filters.searchTerm;
    }

    // Localisation
    if (filters.category) params.category = filters.category;
    if (filters.housingType) params.housing_type = filters.housingType;
    if (filters.city) params.city = filters.city;
    if (filters.district) params.district = filters.district;
    if (filters.region) params.region = filters.region;

    // Prix
    if (filters.minPrice) params.min_price = filters.minPrice;
    if (filters.maxPrice) params.max_price = filters.maxPrice;

    // Superficie
    if (filters.minArea) params.min_area = filters.minArea;
    if (filters.maxArea) params.max_area = filters.maxArea;

    // Caractéristiques
    if (filters.rooms) {
      params.rooms = filters.rooms;
    }
    if (filters.minRooms) params.min_rooms = filters.minRooms;
    if (filters.maxRooms) params.max_rooms = filters.maxRooms;

    if (filters.bathrooms) {
      params.bathrooms = filters.bathrooms;
    }
    if (filters.minBathrooms) params.min_bathrooms = filters.minBathrooms;
    if (filters.maxBathrooms) params.max_bathrooms = filters.maxBathrooms;

    // Statut
    if (filters.status) params.status = filters.status;

    // Tri
    if (filters.sortBy) params.sortBy = filters.sortBy;

    // Pagination
    if (filters.page) params.page = filters.page;
    if (filters.pageSize) params.page_size = filters.pageSize;

    return params;
  },

  /**
   * Obtenir les options pour les filtres (catégories, villes, etc.)
   */
  async getFilterOptions() {
    try {
      const [categories, types, regions, cities] = await Promise.all([
        api.get('/categories/'),
        api.get('/types/'),
        api.get('/regions/'),
        api.get('/cities/')
      ]);

      return {
        categories: categories.data.results || categories.data,
        types: types.data.results || types.data,
        regions: regions.data.results || regions.data,
        cities: cities.data.results || cities.data,
      };
    } catch (error) {
      console.error('Erreur chargement options:', error);
      throw error;
    }
  },

  /**
   * Obtenir les quartiers d'une ville
   */
  async getDistricts(cityId) {
    try {
      const response = await api.get('/districts/', {
        params: { city: cityId }
      });
      return response.data.results || response.data;
    } catch (error) {
      console.error('Erreur chargement quartiers:', error);
      throw error;
    }
  },

  /**
   * Obtenir les villes d'une région
   */
  async getCities(regionId) {
    try {
      const response = await api.get('/cities/', {
        params: { region: regionId }
      });
      return response.data.results || response.data;
    } catch (error) {
      console.error('Erreur chargement villes:', error);
      throw error;
    }
  }
};



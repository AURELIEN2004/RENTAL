// // ============================================
// // 📁 src/services/searchService.js
// // ============================================

// import API_URL from '../config/api';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

class SearchService {
  // Recherche principale avec tous les filtres
  async search(filters) {
    try {
      const queryParams = this.buildQueryParams(filters);
      const response = await fetch(`${API_URL}/recherche/search/?${queryParams}`);
      
      if (!response.ok) {
        throw new Error('Erreur lors de la recherche');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Search error:', error);
      throw error;
    }
  }

  // Construire les paramètres de recherche
  buildQueryParams(filters) {
    const params = new URLSearchParams();
    
    if (filters.category) params.append('category', filters.category);
    if (filters.city) params.append('city', filters.city);
    if (filters.district) params.append('district', filters.district);
    if (filters.housingType) params.append('housing_type', filters.housingType);
    if (filters.minPrice) params.append('min_price', filters.minPrice);
    if (filters.maxPrice) params.append('max_price', filters.maxPrice);
    if (filters.minSurface) params.append('min_surface', filters.minSurface);
    if (filters.maxSurface) params.append('max_surface', filters.maxSurface);
    if (filters.bedrooms) params.append('bedrooms', filters.bedrooms);
    if (filters.bathrooms) params.append('bathrooms', filters.bathrooms);
    
    // Équipements
    if (filters.hasParking) params.append('has_parking', 'true');
    if (filters.hasGarden) params.append('has_garden', 'true');
    if (filters.hasPool) params.append('has_pool', 'true');
    if (filters.isFurnished) params.append('is_furnished', 'true');
    
    return params.toString();
  }

  // Recherche par texte libre
  async searchByText(query) {
    try {
      const response = await fetch(`${API_URL}/recherche/search/?query=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        throw new Error('Erreur lors de la recherche textuelle');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Text search error:', error);
      throw error;
    }
  }

  // Sauvegarder les filtres de recherche
  async saveFilters(filters) {
    try {
      const response = await fetch(`${API_URL}/recherche/save-filters/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(filters),
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la sauvegarde des filtres');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Save filters error:', error);
      throw error;
    }
  }

  // Récupérer les filtres sauvegardés
  async getSavedFilters() {
    try {
      const response = await fetch(`${API_URL}/recherche/saved-filters/`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des filtres');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Get saved filters error:', error);
      return [];
    }
  }

  // Récupérer les suggestions de recherche
  async getSearchSuggestions(query) {
    try {
      const response = await fetch(`${API_URL}/recherche/suggestions/?q=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des suggestions');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Get suggestions error:', error);
      return [];
    }
  }

  // Obtenir les logements recommandés
  async getRecommendations(filters = {}) {
    try {
      const queryParams = this.buildQueryParams(filters);
      const response = await fetch(`${API_URL}/recherche/recommendations/?${queryParams}`);
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des recommandations');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Get recommendations error:', error);
      return [];
    }
  }

  // Obtenir les logements vedettes
  async getFeaturedHousings() {
    try {
      const response = await fetch(`${API_URL}/recherche/featured/`);
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des logements vedettes');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Get featured housings error:', error);
      return [];
    }
  }

  // Obtenir les logements récents
  async getRecentHousings(limit = 8) {
    try {
      const response = await fetch(`${API_URL}/recherche/recent/?limit=${limit}`);
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des logements récents');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Get recent housings error:', error);
      return [];
    }
  }

  // Obtenir les statistiques de la plateforme
  async getPlatformStats() {
    try {
      const response = await fetch(`${API_URL}/recherche/stats/`);
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des statistiques');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Get stats error:', error);
      return {
        total_housings: 0,
        total_cities: 0,
        total_users: 0
      };
    }
  }

  // Récupérer les catégories
  async getCategories() {
    try {
      const response = await fetch(`${API_URL}/housing/categories/`);
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des catégories');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Get categories error:', error);
      return [];
    }
  }

  // Récupérer les villes
  async getCities() {
    try {
      const response = await fetch(`${API_URL}/location/cities/`);
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des villes');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Get cities error:', error);
      return [];
    }
  }

  // Récupérer les quartiers par ville
  async getDistricts(cityId) {
    try {
      const url = cityId 
        ? `${API_URL}/location/districts/?city=${cityId}`
        : `${API_URL}/location/districts/`;
        
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des quartiers');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Get districts error:', error);
      return [];
    }
  }

  // Récupérer les types de logement
  async getHousingTypes() {
    try {
      const response = await fetch(`${API_URL}/housing/types/`);
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des types de logement');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Get housing types error:', error);
      return [];
    }
  }
}

export default new SearchService();
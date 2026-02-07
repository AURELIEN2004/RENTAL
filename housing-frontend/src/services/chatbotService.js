
// ============================================
// 📁 src/services/chatbotService.js
// ============================================

import api from './api';

/**
 * Service pour l'assistant chatbot IA
 */
const chatbotService = {
  
  /**
   * 🤖 Envoyer un message au chatbot
   * @param {string} message - Message utilisateur
   * @param {Object} options - Options (method, coordinates)
   * @returns {Promise} Réponse du bot
   */
  async sendMessage(message, options = {}) {
    try {
      const payload = {
        message: message.trim(),
        method: options.method || 'simple', // 'simple', 'openai', 'ollama'
      };

      // Ajouter coordonnées si disponibles
      if (options.lat && options.lng) {
        payload.user_lat = options.lat;
        payload.user_lng = options.lng;
      }

      const response = await api.post('/recherche/chatbot/', payload);
      return response.data;
    } catch (error) {
      console.error('Erreur chatbot:', error);
      throw error;
    }
  },

  /**
   * 💡 Obtenir des suggestions de recherche
   * @returns {Promise<Array>} Liste de suggestions
   */
  async getSuggestions() {
    try {
      const response = await api.get('/recherche/chatbot/suggestions/');
      return response.data.suggestions;
    } catch (error) {
      console.error('Erreur suggestions:', error);
      return [];
    }
  },

  /**
   * 🏙️ Obtenir la liste des villes
   * @returns {Promise<Array>} Liste des villes
   */
  async getCities() {
    try {
      const response = await api.get('/recherche/chatbot/cities/');
      return response.data.cities;
    } catch (error) {
      console.error('Erreur villes:', error);
      return [];
    }
  },

  /**
   * 🏠 Obtenir la liste des catégories
   * @returns {Promise<Array>} Liste des catégories
   */
  async getCategories() {
    try {
      const response = await api.get('/recherche/chatbot/categories/');
      return response.data.categories;
    } catch (error) {
      console.error('Erreur catégories:', error);
      return [];
    }
  },

  /**
   * 📝 Formater les critères pour affichage
   * @param {Object} criteria - Critères extraits
   * @returns {string} Texte formaté
   */
  formatCriteria(criteria) {
    const parts = [];

    if (criteria.city) {
      parts.push(`Ville: ${criteria.city}`);
    }

    if (criteria.category_name) {
      parts.push(`Type: ${criteria.category_name}`);
    }

    if (criteria.max_price) {
      parts.push(`Budget max: ${criteria.max_price.toLocaleString()} FCFA`);
    }

    if (criteria.min_rooms) {
      parts.push(`${criteria.min_rooms} chambre${criteria.min_rooms > 1 ? 's' : ''}`);
    }

    if (criteria.district_name) {
      parts.push(`Quartier: ${criteria.district_name}`);
    }

    return parts.join(' • ') || 'Tous logements';
  }
};

export default chatbotService;
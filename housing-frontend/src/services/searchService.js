// ============================================
// 📁 src/services/searchService.js
// Service API pour toutes les recherches
// ============================================

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

class SearchService {
  // ========== Recherche Simple ==========
  async searchHousings(params) {
    const queryParams = new URLSearchParams(params).toString();
    const response = await axios.get(
      `${API_BASE_URL}/recherche/search/?${queryParams}`
    );
    return response.data;
  }

  // ========== Recherche Avancée ==========
  async advancedSearch(filters) {
    const response = await axios.post(
      `${API_BASE_URL}/recherche/search/advanced/`,
      filters
    );
    return response.data;
  }

  // ========== Recherche Vocale ==========
  async voiceSearch(audioBlob, language = 'fr') {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.wav');
    formData.append('language', language);

    const response = await axios.post(
      `${API_BASE_URL}/recherche/search/voice/`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  }

  // ========== Chatbot ==========
  async sendChatMessage(message, sessionId = null, language = 'fr') {
    const response = await axios.post(
      `${API_BASE_URL}/recherche/chatbot/chat/`,
      {
        message,
        session_id: sessionId,
        language,
      }
    );
    return response.data;
  }

  async sendVoiceMessage(audioBlob, sessionId = null, language = 'fr') {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.wav');
    formData.append('language', language);
    if (sessionId) formData.append('session_id', sessionId);

    const response = await axios.post(
      `${API_BASE_URL}/recherche/chatbot/chat/`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  }

  async getChatHistory(sessionId) {
    const response = await axios.get(
      `${API_BASE_URL}/recherche/chatbot/history/?session_id=${sessionId}`
    );
    return response.data;
  }

  // ========== Filtres Sauvegardés ==========
  async getSavedFilters() {
    const response = await axios.get(
      `${API_BASE_URL}/recherche/saved-filters/`
    );
    return response.data;
  }

  async createSavedFilter(filterData) {
    const response = await axios.post(
      `${API_BASE_URL}/recherche/saved-filters/`,
      filterData
    );
    return response.data;
  }

  async applySavedFilter(filterId) {
    const response = await axios.post(
      `${API_BASE_URL}/recherche/saved-filters/${filterId}/apply/`
    );
    return response.data;
  }

  async deleteSavedFilter(filterId) {
    const response = await axios.delete(
      `${API_BASE_URL}/recherche/saved-filters/${filterId}/`
    );
    return response.data;
  }

  // ========== Historique ==========
  async getSearchHistory() {
    const response = await axios.get(
      `${API_BASE_URL}/recherche/history/`
    );
    return response.data;
  }

  // ========== Lieux de Proximité ==========
  async getProximityPlaces(params = {}) {
    const queryParams = new URLSearchParams(params).toString();
    const response = await axios.get(
      `${API_BASE_URL}/recherche/proximity-places/?${queryParams}`
    );
    return response.data;
  }

  async getProximityPlaceTypes() {
    const response = await axios.get(
      `${API_BASE_URL}/recherche/proximity-places/types/`
    );
    return response.data;
  }

  // ========== Données de Base ==========
  async getCategories() {
    const response = await axios.get(`${API_BASE_URL}/housing/categories/`);
    return response.data;
  }

  async getHousingTypes() {
    const response = await axios.get(`${API_BASE_URL}/housing/types/`);
    return response.data;
  }

  async getCities(regionId = null) {
    const url = regionId 
      ? `${API_BASE_URL}/location/cities/?region=${regionId}`
      : `${API_BASE_URL}/location/cities/`;
    const response = await axios.get(url);
    return response.data;
  }

  async getDistricts(cityId = null) {
    const url = cityId
      ? `${API_BASE_URL}/location/districts/?city=${cityId}`
      : `${API_BASE_URL}/location/districts/`;
    const response = await axios.get(url);
    return response.data;
  }
}

export default new SearchService();
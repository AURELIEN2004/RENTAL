
// src/services/housingService.js - VERSION COMPLÈTE

import api from './api';

export const housingService = {
  // ===============================
  // HOUSINGS
  // ===============================
  
  async getHousings(params = {}) {
    const response = await api.get('/housings/', { params });
    return response.data;
  },

  async getRecommendedHousings() {
    const response = await api.get('/housings/recommended/');
    return response.data;
  },

  async getHousing(id) {
    const response = await api.get(`/housings/${id}/`);
    return response.data;
  },

  async createHousing(housingData) {
    const formData = new FormData();
    
    Object.keys(housingData).forEach(key => {
      if (key !== 'images' && housingData[key] !== null && housingData[key] !== undefined) {
        formData.append(key, housingData[key]);
      }
    });

    if (housingData.images && housingData.images.length > 0) {
      housingData.images.forEach((image, index) => {
        formData.append(`images[${index}]`, image);
      });
    }

    const response = await api.post('/housings/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async updateHousing(id, housingData) {
    const response = await api.patch(`/housings/${id}/`, housingData);
    return response.data;
  },

  async deleteHousing(id) {
    await api.delete(`/housings/${id}/`);
  },

  async getMyHousings(params = {}) {
    const response = await api.get('/housings/my_housings/', { params });
    return response.data;
  },

  async incrementViews(id) {
    const response = await api.post(`/housings/${id}/increment_views/`);
    return response.data;
  },

  // ===============================
  // FAVORIS & ENREGISTRÉS - AJOUTÉ
  // ===============================

  async toggleLike(id) {
    const response = await api.post(`/housings/${id}/toggle_like/`);
    return response.data;
  },

  async toggleSave(id) {
    const response = await api.post(`/housings/${id}/toggle_save/`);
    return response.data;
  },

  // 🆕 Récupérer les favoris du locataire
  async getFavorites() {
    const response = await api.get('/housings/favorites/');
    return response.data;
  },

  // 🆕 Récupérer les enregistrés du locataire
  async getSavedHousings() {
    const response = await api.get('/housings/saved/');
    return response.data;
  },

  // ===============================
  // VISITES
  // ===============================

  async getVisits() {
    const response = await api.get('/visits/');
    return response.data;
  },

  async createVisit(visitData) {
    const response = await api.post('/visits/', visitData);
    return response.data;
  },

  async confirmVisit(id) {
    const response = await api.post(`/visits/${id}/confirm/`);
    return response.data;
  },

  async refuseVisit(id, message = '') {
    const response = await api.post(`/visits/${id}/refuse/`, { message });
    return response.data;
  },

  // ===============================
  // MESSAGERIE
  // ===============================

  async getConversations() {
    const response = await api.get('/conversations/');
    return response.data;
  },

  async startConversation(housingId) {
    const response = await api.post('/conversations/start/', { housing_id: housingId });
    return response.data;
  },

  async getMessages(conversationId) {
    const response = await api.get('/messages/', { params: { conversation: conversationId } });
    return response.data;
  },

  async sendMessage(messageData) {
    // messageData peut être un FormData (avec images/vidéos) ou un objet JSON
    const response = await api.post('/messages/', messageData, {
      headers: messageData instanceof FormData 
        ? { 'Content-Type': 'multipart/form-data' }
        : { 'Content-Type': 'application/json' }
    });
    return response.data;
  },

  // ===============================
  // NOTIFICATIONS
  // ===============================

  async getNotifications() {
    const response = await api.get('/notifications/');
    return response.data;
  },

  async markNotificationAsRead(id) {
    const response = await api.post(`/notifications/${id}/mark_read/`);
    return response.data;
  },

  // ===============================
  // CATÉGORIES & TYPES
  // ===============================

  async getCategories() {
    const response = await api.get('/categories/');
    return response.data;
  },

  async getHousingTypes() {
    const response = await api.get('/types/');
    return response.data;
  },

  // ===============================
  // LOCALISATION
  // ===============================

  async getRegions() {
    const response = await api.get('/regions/');
    return response.data;
  },

  async getCities(regionId = null) {
    const params = regionId ? { region: regionId } : {};
    const response = await api.get('/cities/', { params });
    return response.data;
  },

  async getDistricts(cityId = null) {
    const params = cityId ? { city: cityId } : {};
    const response = await api.get('/districts/', { params });
    return response.data;
  },
};
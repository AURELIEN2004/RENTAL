
// ============================================
// src/services/housingService.js
// ============================================

import axios from 'axios';
import api from './api';

export const housingService = {
  // Liste des logements
  async getHousings(params = {}) {
    const response = await api.get('/housings/', { params });
    return response.data;
  },

  // Logements recommandés (avec algorithme génétique)
  async getRecommendedHousings() {
    const response = await api.get('/housings/recommended/');
    return response.data;
  },

  // Détail d'un logement
  async getHousing(id) {
    const response = await api.get(`/housings/${id}/`);
    return response.data;
  },

  // Créer un logement
  async createHousing(housingData) {
    const formData = new FormData();
    
    // Ajouter les champs simples
    Object.keys(housingData).forEach(key => {
      if (key !== 'images' && housingData[key] !== null && housingData[key] !== undefined) {
        formData.append(key, housingData[key]);
      }
    });

    // Ajouter les images
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

  // Mettre à jour un logement
  async updateHousing(id, housingData) {
    const response = await api.patch(`/housings/${id}/`, housingData);
    return response.data;
  },

  // Supprimer un logement
  async deleteHousing(id) {
    await api.delete(`/housings/${id}/`);
  },

  // Mes logements (propriétaire)
  async getMyHousings() {
    const response = await api.get('/housings/my_housings/');
    return response.data;
  },

  // Incrémenter les vues
  async incrementViews(id) {
    const response = await api.post(`/housings/${id}/increment_views/`);
    return response.data;
  },

  // Toggle like
  async toggleLike(id) {
    const response = await api.post(`/housings/${id}/toggle_like/`);
    return response.data;
  },

  // Visites
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

  // Conversations
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
    const response = await api.post('/messages/', messageData);
    return response.data;
  },

  // Notifications
  async getNotifications() {
    const response = await api.get('/notifications/');
    return response.data;
  },

  async markNotificationAsRead(id) {
    const response = await api.post(`/notifications/${id}/mark_read/`);
    return response.data;
  },

  async getHousingCategories() {
  const res = await axios.get('/api/categories/');
  return res.data;
},

};

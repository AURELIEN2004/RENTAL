

// src/services/authService.js
import api from './api';

export const authService = {
  async login(username, password) {
    const response = await api.post('/login/', { username, password });
    const { tokens, user } = response.data;
    
    localStorage.setItem('access_token', tokens.access);
    localStorage.setItem('refresh_token', tokens.refresh);
    localStorage.setItem('user', JSON.stringify(user));
    
    return user;
  },

  async register(userData) {
    const response = await api.post('/users/register/', userData);
    const { tokens, user } = response.data;
    
    localStorage.setItem('access_token', tokens.access);
    localStorage.setItem('refresh_token', tokens.refresh);
    localStorage.setItem('user', JSON.stringify(user));
    
    return user;
  },

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated() {
    return !!localStorage.getItem('access_token');
  },

  async getProfile() {
    const response = await api.get('/users/me/');
    localStorage.setItem('user', JSON.stringify(response.data));
    return response.data;
  },

  async updateProfile(userData) {
    // Créer un FormData pour supporter l'upload de fichiers
    const formData = new FormData();
    
    Object.keys(userData).forEach(key => {
      if (userData[key] !== null && userData[key] !== undefined) {
        formData.append(key, userData[key]);
      }
    });

    const response = await api.put('/users/update_profile/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    localStorage.setItem('user', JSON.stringify(response.data.user));
    return response.data;
  },

  async changePassword(oldPassword, newPassword, newPasswordConfirm) {
    const response = await api.post('/users/change_password/', {
      old_password: oldPassword,
      new_password: newPassword,
      new_password_confirm: newPasswordConfirm,
    });
    
    // Mettre à jour les tokens après changement de mot de passe
    if (response.data.tokens) {
      localStorage.setItem('access_token', response.data.tokens.access);
      localStorage.setItem('refresh_token', response.data.tokens.refresh);
    }
    
    return response.data;
  },

  async deleteAccount(password, confirmation) {
    await api.post('/users/delete_account/', {
      password,
      confirmation,
    });
    
    // Nettoyer le localStorage
    this.logout();
  },
};
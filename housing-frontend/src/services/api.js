
// ============================================
// src/services/api.js
// ============================================

import axios from 'axios';

/* ===============================
   CONFIG API
================================ */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/* ===============================
   INTERCEPTORS
================================ */

// // Ajouter le token d'accès
// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('access_token');
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// // Refresh automatique du token
// api.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;

//     if (error.response?.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;

//       try {
//         const refreshToken = localStorage.getItem('refresh_token');

//         const response = await axios.post(
//           `${API_URL}/token/refresh/`,
//           { refresh: refreshToken }
//         );

//         const { access } = response.data;
//         localStorage.setItem('access_token', access);

//         originalRequest.headers.Authorization = `Bearer ${access}`;
//         return api(originalRequest);
//       } catch (refreshError) {
//         localStorage.removeItem('access_token');
//         localStorage.removeItem('refresh_token');
//         window.location.href = '/login';
//         return Promise.reject(refreshError);
//       }
//     }

//     return Promise.reject(error);
//   }
// );
// ── Interceptor REQUEST — token auth + langue ────────────────
api.interceptors.request.use(
  (config) => {
    // Token JWT
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // ← NOUVEAU : Langue active → Django retourne le bon contenu
    const lang = localStorage.getItem('language') || 'fr';
    config.headers['X-Language']       = lang;
    config.headers['Accept-Language']  = lang;

    return config;
  },
  (error) => Promise.reject(error)
);

// ── Interceptor RESPONSE — refresh token auto ────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refreshToken = localStorage.getItem('refresh_token');

      if (refreshToken) {
        try {
          const res = await axios.post(
            `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/users/token/refresh/`,
            { refresh: refreshToken }
          );
          const { access } = res.data;
          localStorage.setItem('access_token', access);
          original.headers.Authorization = `Bearer ${access}`;
          return api(original);
        } catch {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

/* ===============================
   ADMIN STATS
================================ */


/* ===============================
   USERS
================================ */

export const getUsers = async () => {
  const res = await api.get('/admin/users/');
  return res.data;
};



export const deleteUser = (id) =>
  api.delete(`/admin/users/${id}/`);





export const getAdminStats = async () => {
  const res = await api.get('/admin/stats/');
  return res.data;
};

/* ===============================
   🆕 ADMIN USERS
================================ */

export const getAdminUsers = async () => {
  const res = await api.get('/admin/users/');
  return res.data;
};

export const blockUser = async (userId, duration) => {
  const res = await api.post(`/admin/users/${userId}/block/`, { duration });
  return res.data;
};

export const unblockUser = async (userId) => {
  const res = await api.post(`/admin/users/${userId}/unblock/`);
  return res.data;
};

export const deleteUserAdmin = async (userId) => {
  const res = await api.delete(`/admin/users/${userId}/delete/`);
  return res.data;
};

/* ===============================
   CATEGORIES
================================ */

export const getCategories = async () => {
  const res = await api.get('/housing/categories/');
  return res.data;
};

export const createCategory = (data) =>
  api.post('/housing/categories/', data);

export const deleteCategory = (id) =>
  api.delete(`/housing/categories/${id}/`);

/* ===============================
   MESSAGES & CONVERSATIONS
================================ */

export const sendMessage = async (formData) => {
  const res = await api.post('/messages/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data', // Indispensable pour les images/vidéos
    },
  });
  return res.data;
};

export const getConversations = async () => {
  const res = await api.get('/conversations/');
  return res.data;
};

//
// // ← Ajouter cet interceptor
// api.interceptors.request.use(config => {
//     const lang = localStorage.getItem('language') || 'fr';
//     config.headers['X-Language'] = lang;
//     return config;
// });

export default api;

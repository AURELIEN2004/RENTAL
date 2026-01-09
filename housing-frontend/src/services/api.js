
// import axios from 'axios';


// export const getUsers = () => api.get("/admin/users/");
// export const blockUser = (id) => api.post(`/admin/users/${id}/block/`);
// export const unblockUser = (id) => api.post(`/admin/users/${id}/unblock/`);


// const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// const api = axios.create({
//   baseURL: API_URL,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// // Intercepteur pour ajouter le token
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

// // Intercepteur pour gérer le refresh token
// api.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;

//     if (error.response?.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;

//       try {
//         const refreshToken = localStorage.getItem('refresh_token');
//         const response = await axios.post(`${API_URL}/token/refresh/`, {
//           refresh: refreshToken,
//         });

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

// export default api;


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

// Ajouter le token d'accès
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Refresh automatique du token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');

        const response = await axios.post(
          `${API_URL}/token/refresh/`,
          { refresh: refreshToken }
        );

        const { access } = response.data;
        localStorage.setItem('access_token', access);

        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

/* ===============================
   ADMIN STATS
================================ */

export const getAdminStats = async () => {
  const res = await api.get('/admin/stats/');
  return res.data;
};

/* ===============================
   USERS
================================ */

export const getUsers = async () => {
  const res = await api.get('/admin/users/');
  return res.data;
};

export const blockUser = (id) =>
  api.post(`/admin/users/${id}/block/`);

export const unblockUser = (id) =>
  api.post(`/admin/users/${id}/unblock/`);

export const deleteUser = (id) =>
  api.delete(`/admin/users/${id}/`);

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

export default api;

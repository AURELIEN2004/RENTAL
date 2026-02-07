// ============================================
// src/config/api.js
// ============================================
import axios from "axios";   // ✅ OBLIGATOIRE

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api/",
});

export default API_URL;

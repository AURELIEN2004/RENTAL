
// ============================================
// src/pages/Dashboard.jsx - Hub Dashboard
// ============================================

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ProprietaireDashboard from '../components/dashboard/ProprietaireDashboard';
import LocataireDashboard from '../components/dashboard/LocataireDashboard';
import AdminDashboard from '../components/dashboard/AdminDashboard';

const Dashboard = () => {
  const { user } = useAuth();

  // Rediriger selon le rôle
  if (user?.is_superuser) {
    return <AdminDashboard />;
  }

  if (user?.is_proprietaire) {
    return <ProprietaireDashboard />;
  }

  if (user?.is_locataire) {
    return <LocataireDashboard />;
  }

  return <Navigate to="/" />;
};

export default Dashboard;



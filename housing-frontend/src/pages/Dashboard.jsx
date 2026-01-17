
// // ============================================
// // src/pages/Dashboard.jsx - Hub Dashboard
// // ============================================

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ProprietaireDashboard from '../components/dashboard/ProprietaireDashboard';
import LocataireDashboard from '../components/dashboard/LocataireDashboard';
import AdminDashboard from '../components/dashboard/AdminDashboard';
import Loading from '../components/common/Loading';

const Dashboard = () => {
  const { user, loading } = useAuth();

  // ✅ CORRECTION : Afficher un loader pendant le chargement
  if (loading) {
    return <Loading fullScreen message="Chargement du dashboard..." />;
  }

  // ✅ CORRECTION : Vérifier que l'utilisateur existe
  if (!user) {
    return <Navigate to="/login" />;
  }

  // ✅ DEBUG : Afficher les informations utilisateur (à retirer en production)
  console.log('Dashboard - User:', {
    username: user.username,
    is_superuser: user.is_superuser,
    is_staff: user.is_staff,
    is_proprietaire: user.is_proprietaire,
    is_locataire: user.is_locataire
  });

  // ✅ CORRECTION : Vérifier is_superuser ET is_staff pour admin
  if (user.is_superuser || user.is_staff) {
    return <AdminDashboard />;
  }

  // Propriétaire
  if (user.is_proprietaire) {
    return <ProprietaireDashboard />;
  }

  // Locataire
  if (user.is_locataire) {
    return <LocataireDashboard />;
  }

  // ✅ CORRECTION : Rediriger vers la page d'accueil si aucun rôle n'est défini
  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h2>⚠️ Aucun rôle défini</h2>
      <p>Votre compte n'a pas de rôle attribué (locataire ou propriétaire).</p>
      <p>Veuillez contacter l'administrateur.</p>
      <button 
        className="btn btn-primary"
        onClick={() => window.location.href = '/'}
      >
        Retour à l'accueil
      </button>
    </div>
  );
};

export default Dashboard;
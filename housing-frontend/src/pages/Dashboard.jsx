
// // // // ============================================
// // // // src/pages/Dashboard.jsx - Hub Dashboard
// // // // ============================================

// // import React from 'react';
// // import { Routes, Route, Navigate } from 'react-router-dom';
// // import { useAuth } from '../contexts/AuthContext';
// // import ProprietaireDashboard from '../components/dashboard/ProprietaireDashboard';
// // import LocataireDashboard from '../components/dashboard/LocataireDashboard';
// // import AdminDashboard from '../components/dashboard/AdminDashboard';
// // import Loading from '../components/common/Loading';

// // const Dashboard = () => {
// //   const { user, loading } = useAuth();

// //   // ✅ CORRECTION : Afficher un loader pendant le chargement
// //   if (loading) {
// //     return <Loading fullScreen message="Chargement du dashboard..." />;
// //   }

// //   // ✅ CORRECTION : Vérifier que l'utilisateur existe
// //   if (!user) {
// //     return <Navigate to="/login" />;
// //   }

// //   // ✅ DEBUG : Afficher les informations utilisateur (à retirer en production)
// //   console.log('Dashboard - User:', {
// //     username: user.username,
// //     is_superuser: user.is_superuser,
// //     is_staff: user.is_staff,
// //     is_proprietaire: user.is_proprietaire,
// //     is_locataire: user.is_locataire
// //   });

// //   // ✅ CORRECTION : Vérifier is_superuser ET is_staff pour admin
// //   if (user.is_superuser || user.is_staff) {
// //     return <AdminDashboard />;
// //   }

// //   // Propriétaire
// //   if (user.is_proprietaire) {
// //     return <ProprietaireDashboard />;
// //   }

// //   // Locataire
// //   if (user.is_locataire) {
// //     return <LocataireDashboard />;
// //   }

// //   // ✅ CORRECTION : Rediriger vers la page d'accueil si aucun rôle n'est défini
// //   return (
// //     <div style={{ padding: '40px', textAlign: 'center' }}>
// //       <h2>⚠️ Aucun rôle défini</h2>
// //       <p>Votre compte n'a pas de rôle attribué (locataire ou propriétaire).</p>
// //       <p>Veuillez contacter l'administrateur.</p>
// //       <button 
// //         className="btn btn-primary"
// //         onClick={() => window.location.href = '/'}
// //       >
// //         Retour à l'accueil
// //       </button>
// //     </div>
// //   );
// // };

// // export default Dashboard;






























// // ============================================
// // src/pages/Dashboard.jsx - Hub Dashboard
// // ============================================

// import React from 'react';
// import { Navigate } from 'react-router-dom';
// import { useAuth } from '../contexts/AuthContext';
// import ProprietaireDashboard from '../components/dashboard/ProprietaireDashboard';
// import LocataireDashboard from '../components/dashboard/LocataireDashboard';
// import AdminDashboard from '../components/dashboard/AdminDashboard';
// import Loading from '../components/common/Loading';

// const Dashboard = () => {

//   const { user, loading, language } = useAuth(); // language = 'fr' ou 'en'

//   const text = {
//     fr: {
//       loading: "Chargement du dashboard...",
//       noRoleTitle: "⚠️ Aucun rôle défini",
//       noRoleText1: "Votre compte n'a pas de rôle attribué (locataire ou propriétaire).",
//       noRoleText2: "Veuillez contacter l'administrateur.",
//       backHome: "Retour à l'accueil"
//     },
//     en: {
//       loading: "Loading dashboard...",
//       noRoleTitle: "⚠️ No role defined",
//       noRoleText1: "Your account has no assigned role (tenant or owner).",
//       noRoleText2: "Please contact the administrator.",
//       backHome: "Back to home"
//     }
//   };

//   const t = text[language || "fr"];

//   // Loader
//   if (loading) {
//     return <Loading fullScreen message={t.loading} />;
//   }

//   // Utilisateur non connecté
//   if (!user) {
//     return <Navigate to="/login" />;
//   }

//   // Debug
//   console.log('Dashboard - User:', {
//     username: user.username,
//     is_superuser: user.is_superuser,
//     is_staff: user.is_staff,
//     is_proprietaire: user.is_proprietaire,
//     is_locataire: user.is_locataire
//   });

//   // Admin
//   if (user.is_superuser || user.is_staff) {
//     return <AdminDashboard />;
//   }

//   // Propriétaire
//   if (user.is_proprietaire) {
//     return <ProprietaireDashboard />;
//   }

//   // Locataire
//   if (user.is_locataire) {
//     return <LocataireDashboard />;
//   }

//   // Aucun rôle
//   return (

//     <div style={{ padding: '40px', textAlign: 'center' }}>

//       <h2>{t.noRoleTitle}</h2>

//       <p>{t.noRoleText1}</p>

//       <p>{t.noRoleText2}</p>

//       <button
//         className="btn btn-primary"
//         onClick={() => window.location.href = '/'}
//       >
//         {t.backHome}
//       </button>

//     </div>

//   );

// };

// export default Dashboard;








// src/pages/Dashboard.jsx - Hub Dashboard
// ============================================
// FIX : passer user en prop à AdminDashboard
//   Avant : <AdminDashboard />          → user = undefined dans le composant
//   Après : <AdminDashboard user={user} /> → user disponible

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ProprietaireDashboard from '../components/dashboard/ProprietaireDashboard';
import LocataireDashboard from '../components/dashboard/LocataireDashboard';
import AdminDashboard from '../components/dashboard/AdminDashboard';
import Loading from '../components/common/Loading';

const Dashboard = () => {

  const { user, loading, language } = useAuth();

  const text = {
    fr: {
      loading: "Chargement du dashboard...",
      noRoleTitle: "⚠️ Aucun rôle défini",
      noRoleText1: "Votre compte n'a pas de rôle attribué (locataire ou propriétaire).",
      noRoleText2: "Veuillez contacter l'administrateur.",
      backHome: "Retour à l'accueil"
    },
    en: {
      loading: "Loading dashboard...",
      noRoleTitle: "⚠️ No role defined",
      noRoleText1: "Your account has no assigned role (tenant or owner).",
      noRoleText2: "Please contact the administrator.",
      backHome: "Back to home"
    }
  };

  const t = text[language || "fr"];

  // Loader
  if (loading) {
    return <Loading fullScreen message={t.loading} />;
  }

  // Utilisateur non connecté
  if (!user) {
    return <Navigate to="/login" />;
  }

  // Admin
  if (user.is_superuser || user.is_staff) {
    // ✅ FIX : user passé en prop
    return <AdminDashboard user={user} />;
  }

  // Propriétaire
  if (user.is_proprietaire) {
    return <ProprietaireDashboard />;
  }

  // Locataire
  if (user.is_locataire) {
    return <LocataireDashboard />;
  }

  // Aucun rôle défini
  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h2>{t.noRoleTitle}</h2>
      <p>{t.noRoleText1}</p>
      <p>{t.noRoleText2}</p>
      <button
        className="btn btn-primary"
        onClick={() => window.location.href = '/'}
      >
        {t.backHome}
      </button>
    </div>
  );

};

export default Dashboard;
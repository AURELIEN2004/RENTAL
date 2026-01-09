

// src/components/dashboard/ProprietaireDashboard.jsx
// ============================================

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { housingService } from '../../services/housingService';
import HousingCard from '../housing/HousingCard';
import ProfileEdit from '../profile/ProfileEdit';
import ChangePassword from '../profile/ChangePassword';
import {
  FaHome, FaPlus, FaEye, FaCalendar, FaEnvelope,
  FaBell, FaCog, FaUser, FaTrash, FaChartLine,
} from 'react-icons/fa';

import { toast } from 'react-toastify';
import './Dashboard.css';
import api from '../../services/api';

const ProprietaireDashboard = () => {
  const { user, logout, updateUser } = useAuth();

  const [activeTab, setActiveTab] = useState('profile');
  const [housings, setHousings] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    disponible: 0,
    reserve: 0,
    occupe: 0
  });
  const [visits, setVisits] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // 🔹 AJOUT : états des modales (sans modifier l’existant)
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  const [categories, setCategories] = useState([]);
  const [selectedHousingCategory, setSelectedHousingCategory] = useState('all');


  useEffect(() => {
    loadDashboardData();
  }, []);

  


const loadDashboardData = async () => {
  try {
    const [
      housingsData,
      visitsData,
      notificationsData,
      categoriesRes // Changez le nom ici pour plus de clarté
    ] = await Promise.all([
      housingService.getMyHousings(),
      housingService.getVisits(),
      housingService.getNotifications(),
      api.get('/categories/'), // Utilisez api.get directement si le service pose problème
    ]);

    setHousings(housingsData);
    
    // ICI : Vérifiez si les catégories sont dans .results
    const cats = categoriesRes.data.results || categoriesRes.data || [];
    setCategories(Array.isArray(cats) ? cats : []);
    
    console.log('Catégories chargées :', cats); // Pour vérifier dans la console F12

    calculateStats(housingsData);
    setVisits(visitsData);
    setNotifications(notificationsData);
  } catch (error) {
    console.error("Erreur détaillée:", error);
    toast.error('Erreur lors du chargement des données');
  } finally {
    setLoading(false);
  }
};


  const calculateStats = (housings) => {
    setStats({
      total: housings.length,
      disponible: housings.filter(h => h.status === 'disponible').length,
      reserve: housings.filter(h => h.status === 'reserve').length,
      occupe: housings.filter(h => h.status === 'occupe').length,
    });
  };


      const filterHousings = () => {
      return housings.filter(housing => {
        const matchStatus =
          selectedCategory === 'all' || housing.status === selectedCategory;

        const matchCategory =
          selectedHousingCategory === 'all' ||
          housing.category?.id === Number(selectedHousingCategory);

        return matchStatus && matchCategory;
      });
    };

      const fetchFilteredHousings = async () => {
        try {
          const params = {};

          if (selectedCategory !== 'all') {
            params.status = selectedCategory;
          }

          if (selectedHousingCategory !== 'all') {
            params.category = selectedHousingCategory;
          }

          const data = await housingService.getMyHousings(params);
          setHousings(data);
          calculateStats(data);
        } catch (error) {
          toast.error('Erreur lors du filtrage des logements');
        }
      };


  const handleDeleteHousing = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce logement ?')) return;
    try {
      await housingService.deleteHousing(id);
      toast.success('Logement supprimé avec succès');
      loadDashboardData();
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleConfirmVisit = async (id) => {
    try {
      await housingService.confirmVisit(id);
      toast.success('Visite confirmée');
      loadDashboardData();
    } catch {
      toast.error('Erreur lors de la confirmation');
    }
  };

  const handleRefuseVisit = async (id) => {
    try {
      await housingService.refuseVisit(id);
      toast.success('Visite refusée');
      loadDashboardData();
    } catch {
      toast.error('Erreur lors du refus');
    }
  };

  const renderContent = () => {
    switch (activeTab) {

      // ===============================
      // PROFIL
      // ===============================
      case 'profile':
        return (
          <div className="dashboard-section">
            <h2>Mon Profil</h2>

            <div className="profile-card">
              <div className="profile-header">
                <img
                  src={user.photo || '/default-avatar.png'}
                  alt={user.username}
                  className="profile-avatar-large"
                />
                <div className="profile-info">
                  <h3>{user.first_name} {user.last_name}</h3>
                  <p>@{user.username}</p>
                  <p className="role-badge">Propriétaire</p>
                </div>
              </div>

              <div className="profile-details">
                <div className="detail-item">
                  <strong>Email:</strong> {user.email}
                </div>
                <div className="detail-item">
                  <strong>Téléphone:</strong> {user.phone || 'Non renseigné'}
                </div>
                <div className="detail-item">
                  <strong>Membre depuis:</strong>{' '}
                  {new Date(user.date_joined).toLocaleDateString()}
                </div>
              </div>

              {/* 🔹 Boutons existants + actions */}
              <div className="profile-actions">
                <button
                  className="btn btn-primary"
                  onClick={() => setShowEditProfile(true)}
                >
                  Modifier le profil
                </button>

                <button
                  className="btn btn-outline"
                  onClick={() => setShowChangePassword(true)}
                >
                  Changer le mot de passe
                </button>
              </div>
            </div>

            {/* 🔹 AJOUT : Modales */}
            {showEditProfile && (
              <ProfileEdit
                onClose={() => setShowEditProfile(false)}
                onUpdate={(updatedUser) => {
                  if (typeof updateUser === 'function') {
                    updateUser(updatedUser);
                  }
                  setShowEditProfile(false);
                }}
              />
            )}

            {showChangePassword && (
              <ChangePassword
                onClose={() => setShowChangePassword(false)}
              />
            )}
          </div>
        );

      // ===============================
      // LOGEMENTS
      // ===============================
                
      case 'housings':
                  return (
                    <div className="dashboard-section">
                      <div className="section-header-flex">
                        <h2>Mes Logements</h2>
                        
                      </div>

                      <div className="housing-filter-header">
                        <p style={{color: 'red'}}>Nombre de catégories : {categories.length}</p>
            <select
            className="category-filter-select"
            value={selectedHousingCategory}
            onChange={(e) => setSelectedHousingCategory(e.target.value)}
          >
            <option value="all">Toutes les catégories</option>

            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          </div>

            <div className="stats-bar">
              <div className={`stat-item ${selectedCategory === 'all' ? 'active' : ''}`}
                   onClick={() => setSelectedCategory('all')}>
                <div className="stat-number">{stats.total}</div>
                <div className="stat-label">Total</div>
              </div>

              <div className={`stat-item ${selectedCategory === 'disponible' ? 'active' : ''}`}
                   onClick={() => setSelectedCategory('disponible')}>
                <div className="stat-number">{stats.disponible}</div>
                <div className="stat-label">Disponibles</div>
              </div>

              <div className={`stat-item ${selectedCategory === 'reserve' ? 'active' : ''}`}
                   onClick={() => setSelectedCategory('reserve')}>
                <div className="stat-number">{stats.reserve}</div>
                <div className="stat-label">Réservés</div>
              </div>

              <div className={`stat-item ${selectedCategory === 'occupe' ? 'active' : ''}`}
                   onClick={() => setSelectedCategory('occupe')}>
                <div className="stat-number">{stats.occupe}</div>
                <div className="stat-label">Occupés</div>
              </div>
            </div>

            {loading ? (
              <div className="loading">Chargement...</div>
            ) : (
              <div className="housing-list">
                {filterHousings().map(housing => (
                  <div key={housing.id} className="housing-item-owner">
                    <HousingCard housing={housing} />
                    <div className="housing-actions">
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDeleteHousing(housing.id)}
                      >
                        <FaTrash /> Supprimer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );


  // ===============================
  // AJOUT LOGEMENTS
  // ===============================
      
        
        case 'HousingForm':
        return (
          <div className="dashboard-section">
            <h2>Ajouter un Logement</h2>
            <p>Pour ajouter un nouveau logement, veuillez remplir le formulaire ci-dessous.</p>
            <button
              className="btn btn-primary"
              onClick={() => window.location.href = '/HousingForm'}
            >
              Aller au formulaire d'ajout de logement
            </button>
          </div>
        );

      // ===============================
      // AUTRES CASES (INCHANGÉS)
      // ===============================
      case 'stats':
      case 'reservations':
      case 'messages':
      case 'notifications':
      case 'settings':
      case 'visibility':  
        return null;
        

      default:
        return null;
    }
  };

  return (
    <div className="dashboard-layout">
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <h2>Dashboard Propriétaire</h2>
        </div>

        <nav className="sidebar-nav">
          <button className={activeTab === 'profile' ? 'active' : ''}
                  onClick={() => setActiveTab('profile')}>
            <FaUser /> Mon Profil
          </button>

          <button className={activeTab === 'housings' ? 'active' : ''}
                  onClick={() => setActiveTab('housings')}>
            <FaHome /> Mes Logements
          </button>

          <button className="btn btn-primary"
                   onClick={() => setActiveTab('HousingForm')}>
            <FaPlus /> Ajouter un logement
         </button>
        
          <button className={activeTab === 'stats' ? 'active' : ''}
                  onClick={() => setActiveTab('stats')}>
            <FaChartLine /> Statistiques
          </button>

          <button className={activeTab === 'visibility' ? 'active' : ''}
                onClick={() => window.location.href = '/visibility'}>
            <FaEye /> Visibilité
          </button>

          <button className={activeTab === 'reservations' ? 'active' : ''}
                  onClick={() => setActiveTab('reservations')}>
            <FaCalendar /> Réservations
          </button>

          <button className={activeTab === 'messages' ? 'active' : ''}
                  onClick={() => setActiveTab('messages')}>
            <FaEnvelope /> Messages
          </button>

          <button className={activeTab === 'notifications' ? 'active' : ''}
                  onClick={() => setActiveTab('notifications')}>
            <FaBell /> Notifications
          </button>

          <button className={activeTab === 'settings' ? 'active' : ''}
                  onClick={() => setActiveTab('settings')}>
            <FaCog /> Paramètres
          </button>
        </nav>

        <button className="btn btn-danger btn-block mt-auto" onClick={logout}>
          Déconnexion
        </button>
      </aside>

      <main className="dashboard-main">
        {renderContent()}
      </main>
    </div>
  );
};

export default ProprietaireDashboard;

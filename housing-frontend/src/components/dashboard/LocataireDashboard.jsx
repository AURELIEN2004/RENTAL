
// ============================================
// src/components/dashboard/LocataireDashboard.jsx
// ============================================
import React, { useState, useEffect } from 'react';
import { housingService } from '../../services/housingService';
import { useAuth } from '../../contexts/AuthContext';

import ProfileEdit from '../profile/ProfileEdit';
import ChangePassword from '../profile/ChangePassword';
import NotificationsList from '../notifications/NotificationsList';
import VisitsList from '../visits/VisitsList';
import MessagingPage from '../messaging/MessagingPage';

import {
  FaHeart, FaBookmark, FaCalendar, FaEnvelope,
  FaBell, FaCog, FaUser, FaTrash
} from 'react-icons/fa';

import HousingCard from '../housing/HousingCard';
import './Dashboard.css';
import { toast } from 'react-toastify';

const LocataireDashboard = () => {
  const { user, logout, updateUser } = useAuth();

  const [activeTab, setActiveTab] = useState('profile');
  const [favorites, setFavorites] = useState([]);
  const [saved, setSaved] = useState([]);
  const [visits, setVisits] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, [activeTab]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Charger selon l'onglet actif
      if (activeTab === 'favorites') {
        await loadFavorites();
      } else if (activeTab === 'saved') {
        await loadSaved();
      } else if (activeTab === 'visits') {
        const visitsData = await housingService.getVisits();
        setVisits(visitsData);
      } else if (activeTab === 'notifications') {
        const notificationsData = await housingService.getNotifications();
        setNotifications(notificationsData);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Erreur de chargement des données');
    } finally {
      setLoading(false);
    }
  };

  // 🔧 CORRECTION : Charger les favoris
  const loadFavorites = async () => {
    try {
      const data = await housingService.getFavorites();
      // La réponse contient des objets Favorite avec housing nested
      const favHousings = data.map(fav => fav.housing);
      setFavorites(favHousings);
    } catch (error) {
      console.error('Erreur favoris:', error);
      toast.error('Erreur lors du chargement des favoris');
    }
  };

  // 🔧 CORRECTION : Charger les enregistrés
  const loadSaved = async () => {
    try {
      const data = await housingService.getSavedHousings();
      // La réponse contient des objets SavedHousing avec housing nested
      const savedHousings = data.map(saved => saved.housing);
      setSaved(savedHousings);
    } catch (error) {
      console.error('Erreur enregistrés:', error);
      toast.error('Erreur lors du chargement des enregistrés');
    }
  };

  // 🔧 CORRECTION : Gérer le retrait des favoris
  const handleRemoveFavorite = async (housingId) => {
    try {
      await housingService.toggleLike(housingId);
      toast.success('Retiré des favoris');
      loadFavorites(); // Recharger
    } catch (error) {
      toast.error('Erreur lors du retrait');
    }
  };

  // 🔧 CORRECTION : Gérer le retrait des enregistrés
  const handleRemoveSaved = async (housingId) => {
    try {
      await housingService.toggleSave(housingId);
      toast.success('Retiré des enregistrés');
      loadSaved(); // Recharger
    } catch (error) {
      toast.error('Erreur lors du retrait');
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
                  <p className="role-badge">Locataire</p>
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
      // FAVORIS - CORRIGÉ
      // ===============================
      case 'favorites':
        return (
          <div className="dashboard-section">
            <h2>Mes Favoris ({favorites.length})</h2>
            
            {loading ? (
              <div className="loading">Chargement...</div>
            ) : favorites.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">❤️</div>
                <p>Vous n'avez pas encore de favoris</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => window.location.href = '/search'}
                >
                  Parcourir les logements
                </button>
              </div>
            ) : (
              <div className="housing-grid">
                {favorites.map(housing => (
                  <div key={housing.id} className="housing-item-with-actions">
                    <HousingCard housing={housing} />
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleRemoveFavorite(housing.id)}
                    >
                      <FaTrash /> Retirer
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      // ===============================
      // ENREGISTRÉS - CORRIGÉ
      // ===============================
      case 'saved':
        return (
          <div className="dashboard-section">
            <h2>Logements Enregistrés ({saved.length})</h2>
            
            {loading ? (
              <div className="loading">Chargement...</div>
            ) : saved.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">💾</div>
                <p>Vous n'avez pas encore enregistré de logements</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => window.location.href = '/search'}
                >
                  Parcourir les logements
                </button>
              </div>
            ) : (
              <div className="housing-grid">
                {saved.map(housing => (
                  <div key={housing.id} className="housing-item-with-actions">
                    <HousingCard housing={housing} />
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleRemoveSaved(housing.id)}
                    >
                      <FaTrash /> Retirer
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      // ===============================
      // VISITES
      // ===============================
      case 'visits':
        return (
          <div className="dashboard-section">
            <VisitsList userRole="locataire" />
          </div>
        );

      // ===============================
      // MESSAGES
      // ===============================
      case 'messages':
        return (
          <div className="dashboard-section full-height">
            <MessagingPage />
          </div>
        );

      // ===============================
      // NOTIFICATIONS
      // ===============================
      case 'notifications':
        return (
          <div className="dashboard-section">
            <NotificationsList />
          </div>
        );

      // ===============================
      // PARAMÈTRES
      // ===============================
      case 'settings':
        return (
          <div className="dashboard-section">
            <h2>Paramètres</h2>
            <div className="settings-form">
              <div className="setting-item">
                <label>Notifications par email</label>
                <input type="checkbox" defaultChecked />
              </div>
              <div className="setting-item">
                <label>Notifications push</label>
                <input type="checkbox" defaultChecked />
              </div>
              <div className="setting-item danger-zone">
                <h3>Zone de danger</h3>
                <button className="btn btn-danger">
                  <FaTrash /> Supprimer mon compte
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="dashboard-layout">
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <h2>Dashboard Locataire</h2>
        </div>

        <nav className="sidebar-nav">
          <button
            className={activeTab === 'profile' ? 'active' : ''}
            onClick={() => setActiveTab('profile')}
          >
            <FaUser /> Mon Profil
          </button>

          <button
            className={activeTab === 'favorites' ? 'active' : ''}
            onClick={() => setActiveTab('favorites')}
          >
            <FaHeart /> Favoris
          </button>

          <button
            className={activeTab === 'saved' ? 'active' : ''}
            onClick={() => setActiveTab('saved')}
          >
            <FaBookmark /> Enregistrés
          </button>

          <button
            className={activeTab === 'visits' ? 'active' : ''}
            onClick={() => setActiveTab('visits')}
          >
            <FaCalendar /> Visites
          </button>

          <button
            className={activeTab === 'messages' ? 'active' : ''}
            onClick={() => setActiveTab('messages')}
          >
            <FaEnvelope /> Messages
          </button>

          <button
            className={activeTab === 'notifications' ? 'active' : ''}
            onClick={() => setActiveTab('notifications')}
          >
            <FaBell /> Notifications
          </button>

          <button
            className={activeTab === 'settings' ? 'active' : ''}
            onClick={() => setActiveTab('settings')}
          >
            <FaCog /> Paramètres
          </button>
        </nav>

        <button
          className="btn btn-danger btn-block mt-auto"
          onClick={logout}
        >
          Déconnexion
        </button>
      </aside>

      <main className="dashboard-main">
        {renderContent()}
      </main>
    </div>
  );
};

export default LocataireDashboard;
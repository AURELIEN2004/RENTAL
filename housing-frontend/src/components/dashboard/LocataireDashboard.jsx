

// ============================================
// src/components/dashboard/LocataireDashboard.jsx
// ============================================

import React, { useState, useEffect } from 'react';
import { housingService } from '../../services/housingService';
import { useAuth } from '../../contexts/AuthContext';

import ProfileEdit from '../profile/ProfileEdit';
import ChangePassword from '../profile/ChangePassword';

import {
  FaHeart, FaBookmark, FaCalendar, FaEnvelope,
  FaBell, FaCog, FaUser, FaTrash
} from 'react-icons/fa';

import HousingCard from '../housing/HousingCard';
import './Dashboard.css';

const LocataireDashboard = () => {
  const { user, logout, updateUser } = useAuth();

  const [activeTab, setActiveTab] = useState('profile');
  const [favorites, setFavorites] = useState([]);
  const [saved, setSaved] = useState([]);
  const [visits, setVisits] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // 🔹 AJOUT : états modales (même logique que Propriétaire)
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [visitsData, notificationsData] = await Promise.all([
        housingService.getVisits(),
        housingService.getNotifications(),
      ]);

      setVisits(visitsData);
      setNotifications(notificationsData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
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

              {/* 🔹 Actions profil */}
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

            {/* 🔹 Modales */}
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
      // FAVORIS
      // ===============================
      case 'favorites':
        return (
          <div className="dashboard-section">
            <h2>Mes Favoris</h2>
            <div className="housing-grid">
              {favorites.length === 0 ? (
                <p className="empty-state">Vous n'avez pas encore de favoris</p>
              ) : (
                favorites.map(housing => (
                  <HousingCard key={housing.id} housing={housing} />
                ))
              )}
            </div>
          </div>
        );

      // ===============================
      // ENREGISTRÉS
      // ===============================
      case 'saved':
        return (
          <div className="dashboard-section">
            <h2>Logements Enregistrés</h2>
            <div className="housing-grid">
              {saved.length === 0 ? (
                <p className="empty-state">
                  Vous n'avez pas encore enregistré de logements
                </p>
              ) : (
                saved.map(housing => (
                  <HousingCard key={housing.id} housing={housing} />
                ))
              )}
            </div>
          </div>
        );

      // ===============================
      // VISITES
      // ===============================
      case 'visits':
        return (
          <div className="dashboard-section">
            <h2>Visites Planifiées</h2>
            <div className="visits-list">
              {visits.length === 0 ? (
                <p className="empty-state">Aucune visite planifiée</p>
              ) : (
                visits.map(visit => (
                  <div key={visit.id} className="visit-card">
                    <img
                      src={visit.housing_image}
                      alt={visit.housing_title}
                    />
                    <div className="visit-info">
                      <h3>{visit.housing_title}</h3>
                      <p>
                        📅 {new Date(visit.date).toLocaleDateString()} à {visit.time}
                      </p>
                      <span className={`status-badge status-${visit.status}`}>
                        {visit.status}
                      </span>
                    </div>
                    <div className="visit-actions">
                      <button className="btn btn-sm btn-outline">
                        Modifier
                      </button>
                      <button className="btn btn-sm btn-danger">
                        Annuler
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );

      // ===============================
      // MESSAGES
      // ===============================
      case 'messages':
        return (
          <div className="dashboard-section">
            <h2>Messages</h2>
            <p className="info-message">
              Fonctionnalité de messagerie à venir
            </p>
          </div>
        );

      // ===============================
      // NOTIFICATIONS
      // ===============================
      case 'notifications':
        return (
          <div className="dashboard-section">
            <h2>Notifications</h2>
            <div className="notifications-list">
              {notifications.length === 0 ? (
                <p className="empty-state">Aucune notification</p>
              ) : (
                notifications.map(notif => (
                  <div
                    key={notif.id}
                    className={`notification-item ${notif.is_read ? '' : 'unread'}`}
                  >
                    <div className="notif-icon">
                      <FaBell />
                    </div>
                    <div className="notif-content">
                      <h4>{notif.title}</h4>
                      <p>{notif.message}</p>
                      <span className="notif-time">
                        {new Date(notif.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
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


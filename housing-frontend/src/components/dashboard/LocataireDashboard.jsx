// src/components/dashboard/LocataireDashboard.jsx
// ============================================
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { housingService } from '../../services/housingService';
import { useAuth } from '../../contexts/AuthContext';

import ProfileEdit from '../profile/ProfileEdit';
import ChangePassword from '../profile/ChangePassword';
import NotificationsList from '../notifications/NotificationsList';
import VisitsList from '../visits/VisitsList';
import MessagingPage from '../messaging/MessagingPage';
import { useTheme } from '../../contexts/ThemeContext';


import {
  FaHeart, FaBookmark, FaCalendar, FaEnvelope,
  FaBell, FaCog, FaUser, FaTrash
} from 'react-icons/fa';

import HousingCard from '../housing/HousingCard';
import './Dashboard.css';
import { toast } from 'react-toastify';

const LocataireDashboard = () => {
  const { user, logout, updateUser } = useAuth();
    const { t, language, theme } = useTheme();
  

  const location = useLocation();
  const navigate  = useNavigate();

  const VALID_TABS = ['profile', 'favorites', 'saved', 'visits', 'messages', 'notifications', 'settings'];

  const getTabFromURL = () => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    return VALID_TABS.includes(tab) ? tab : 'profile';
  };

  const [activeTab, setActiveTab] = useState(getTabFromURL);

  useEffect(() => {
    setActiveTab(getTabFromURL());
  }, [location.search]); // eslint-disable-line

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    navigate(`/dashboard?tab=${tab}`, { replace: true });
  };
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
            <h2> {t('my_profile')}</h2>
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
                  <p className="role-badge">{t('tenant')}</p>
                </div>
              </div>

              <div className="profile-details">
                <div className="detail-item">
                  <strong>{t('email')}:</strong> {user.email}
                </div>
                <div className="detail-item">
                  <strong>{t('phone')}:</strong> {user.phone || t('not_provided')}
                </div>
                <div className="detail-item">
                  <strong>{t('member_since')}:</strong>{' '}
                  {new Date(user.date_joined).toLocaleDateString()}
                </div>
              </div>

               <div className="profile-actions">
                <button
                  className="btn btn-primary"
                  onClick={() => setShowEditProfile(true)}
                >
                  {t('edit_profile')}
                </button>
                <button
                  className="btn btn-outline"
                  onClick={() => setShowChangePassword(true)}
                >
                  {t('change_password')}
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
      // case 'favorites':
      //   return (
      //     <div className="dashboard-section">
      //       <h2>Mes Favoris ({favorites.length})</h2>
            
      //       {loading ? (
      //         <div className="loading">Chargement...</div>
      //       ) : favorites.length === 0 ? (
      //         <div className="empty-state">
      //           <div className="empty-icon">❤️</div>
      //           <p>Vous n'avez pas encore de favoris</p>
      //           <button 
      //             className="btn btn-primary"
      //             onClick={() => window.location.href = '/search'}
      //           >
      //             Parcourir les logements
      //           </button>
      //         </div>
      //       ) : (
      //         <div className="housing-grid">
      //           {favorites.map(housing => (
      //             <div key={housing.id} className="housing-item-with-actions">
      //               <HousingCard housing={housing} />
      //               <button
      //                 className="btn btn-danger btn-sm"
      //                 onClick={() => handleRemoveFavorite(housing.id)}
      //               >
      //                 <FaTrash /> Retirer
      //               </button>
      //             </div>
      //           ))}
      //         </div>
      //       )}
      //     </div>
      //   );
      case 'favorites':
  return (
    <div className="dashboard-section">

      <h2>
        {t('favorites_title')} ({favorites.length})
      </h2>

      {loading ? (

        <div className="loading">
          {t('loading')}
        </div>

      ) : favorites.length === 0 ? (

        <div className="empty-state">

          <div className="empty-icon">❤️</div>

          <p>{t('favorites_empty')}</p>

          <button
            className="btn btn-primary"
            onClick={() => navigate('/search')}
          >
            {t('browse_housings')}
          </button>

        </div>

      ) : (

        <div className="housing-grid">

          {favorites.map(housing => (

            <div
              key={housing.id}
              className="housing-item-with-actions"
            >

              <HousingCard housing={housing} />

              <button
                className="btn btn-danger btn-sm"
                onClick={() => {
                  if (window.confirm(t('confirm_remove'))) {
                    handleRemoveFavorite(housing.id);
                  }
                }}
              >
                <FaTrash />
                {t('remove')}
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
      // case 'saved':
      //   return (
      //     <div className="dashboard-section">
      //       <h2>Logements Enregistrés ({saved.length})</h2>
            
      //       {loading ? (
      //         <div className="loading">Chargement...</div>
      //       ) : saved.length === 0 ? (
      //         <div className="empty-state">
      //           <div className="empty-icon">💾</div>
      //           <p>Vous n'avez pas encore enregistré de logements</p>
      //           <button 
      //             className="btn btn-primary"
      //             onClick={() => window.location.href = '/search'}
      //           >
      //             Parcourir les logements
      //           </button>
      //         </div>
      //       ) : (
      //         <div className="housing-grid">
      //           {saved.map(housing => (
      //             <div key={housing.id} className="housing-item-with-actions">
      //               <HousingCard housing={housing} />
      //               <button
      //                 className="btn btn-danger btn-sm"
      //                 onClick={() => handleRemoveSaved(housing.id)}
      //               >
      //                 <FaTrash /> Retirer
      //               </button>
      //             </div>
      //           ))}
      //         </div>
      //       )}
      //     </div>
      //   );
      case 'saved':
  return (
    <div className="dashboard-section">

      <h2>
        {t('saved_title')} ({saved.length})
      </h2>

      {loading ? (

        <div className="loading">
          {t('loading')}
        </div>

      ) : saved.length === 0 ? (

        <div className="empty-state">

          <div className="empty-icon">💾</div>

          <p>{t('saved_empty')}</p>

          <button
            className="btn btn-primary"
            onClick={() => navigate('/search')}
          >
            {t('browse_housings')}
          </button>

        </div>

      ) : (

        <div className="housing-grid">

          {saved.map(housing => (

            <div
              key={housing.id}
              className="housing-item-with-actions"
            >

              <HousingCard housing={housing} />

              <button
                className="btn btn-danger btn-sm"
                onClick={() => {
                  if (window.confirm(t('confirm_remove'))) {
                    handleRemoveSaved(housing.id);
                  }
                }}
              >
                <FaTrash />
                {t('remove')}
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
      
            <h2>{t('settings_title')}</h2>
      
            <div className="settings-form">
      
              {/* EMAIL NOTIFICATIONS */}
              <div className="setting-item">
      
                <label htmlFor="emailNotif">
                  {t('settings_email_notifications')}
                </label>
      
                <input
                  id="emailNotif"
                  type="checkbox"
                  defaultChecked
                />
      
              </div>
      
      
              {/* PUSH NOTIFICATIONS */}
              <div className="setting-item">
      
                <label htmlFor="pushNotif">
                  {t('settings_push_notifications')}
                </label>
      
                <input
                  id="pushNotif"
                  type="checkbox"
                  defaultChecked
                />
      
              </div>
      
      
              {/* LANGUAGE */}
              <div className="setting-item">
      
                <label>{t('settings_language')}</label>
      
                <select
                  value={language}
                  onChange={(e) => changeLanguage(e.target.value)}
                >
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                </select>
      
              </div>
      
      
              {/* THEME */}
              <div className="setting-item">
      
                <label>{t('settings_theme')}</label>
      
                <select
                  value={theme}
                  onChange={(e) => changeTheme(e.target.value)}
                >
                  <option value="light">{t('theme_light')}</option>
                  <option value="dark">{t('theme_dark')}</option>
                </select>
      
              </div>
      
      
              {/* DANGER ZONE */}
              <div className="setting-item danger-zone">
      
                <h3>{t('settings_danger_zone')}</h3>
      
                <button
                  className="btn btn-danger"
                  onClick={() => {
                    if (window.confirm(t('confirm_delete_account'))) {
                      console.log("Delete account");
                    }
                  }}
                >
                  <FaTrash />
                  {t('settings_delete_account')}
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

    {/* SIDEBAR */}
    <aside className="dashboard-sidebar">

      <div className="sidebar-header">
        <h2>{t('tenant_dashboard')}</h2>
      </div>

      <nav className="sidebar-nav">

        <button
          className={activeTab === 'profile' ? 'active' : ''}
          onClick={() => handleTabChange('profile')}
        >
          <FaUser />
          {t('menu_profile')}
        </button>

        <button
          className={activeTab === 'favorites' ? 'active' : ''}
          onClick={() => handleTabChange('favorites')}
        >
          <FaHeart />
          {t('menu_favorites')}
        </button>

        <button
          className={activeTab === 'saved' ? 'active' : ''}
          onClick={() => handleTabChange('saved')}
        >
          <FaBookmark />
          {t('menu_saved')}
        </button>

        <button
          className={activeTab === 'visits' ? 'active' : ''}
          onClick={() => handleTabChange('visits')}
        >
          <FaCalendar />
          {t('menu_visits')}
        </button>

        <button
          className={activeTab === 'messages' ? 'active' : ''}
          onClick={() => handleTabChange('messages')}
        >
          <FaEnvelope />
          {t('menu_messages')}
        </button>

        <button
          className={activeTab === 'notifications' ? 'active' : ''}
          onClick={() => handleTabChange('notifications')}
        >
          <FaBell />
          {t('menu_notifications')}
        </button>

        <button
          className={activeTab === 'settings' ? 'active' : ''}
          onClick={() => handleTabChange('settings')}
        >
          <FaCog />
          {t('menu_settings')}
        </button>

      </nav>

      {/* LOGOUT */}
      <button
        className="btn btn-danger btn-block mt-auto"
        onClick={logout}
      >
        {t('logout')}
      </button>

    </aside>

    {/* MAIN CONTENT */}
    <main className="dashboard-main">
      {renderContent()}
    </main>

  </div>
);
};

export default LocataireDashboard;
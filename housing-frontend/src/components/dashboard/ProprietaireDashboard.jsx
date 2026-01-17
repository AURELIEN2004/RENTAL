// // src/components/dashboard/ProprietaireDashboard.jsx
// // ============================================

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { housingService } from '../../services/housingService';
import HousingCard from '../housing/HousingCard';
import ProfileEdit from '../profile/ProfileEdit';
import ChangePassword from '../profile/ChangePassword';
import MessagingPage from '../messaging/MessagingPage';
import VisibilityManagement from '../../pages/VisibilityManagement';
import HousingForm from '../housing/HousingForm';
import HousingEditModal from '../housing/HousingEditModal'; // ✅ IMPORT MANQUANT

import {
  FaHome, FaPlus, FaEye, FaCalendar, FaEnvelope,
  FaBell, FaCog, FaUser, FaTrash, FaChartLine, FaEdit,
} from 'react-icons/fa';
import NotificationsList from '../notifications/NotificationsList';
import VisitsList from '../visits/VisitsList';

import { toast } from 'react-toastify';
import './Dashboard.css';
import api from '../../services/api';

const ProprietaireDashboard = () => {
  const { user, logout, updateUser } = useAuth();

  const [activeTab, setActiveTab] = useState('profile');
  const [housings, setHousings] = useState([]); // ✅ INITIALISATION AVEC TABLEAU VIDE
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
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedHousingCategory, setSelectedHousingCategory] = useState('all');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingHousing, setEditingHousing] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  // ✅ CORRECTION : Gestion robuste du chargement
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [
        housingsData,
        visitsData,
        notificationsData,
        categoriesRes
      ] = await Promise.all([
        housingService.getMyHousings(),
        housingService.getVisits(),
        housingService.getNotifications(),
        api.get('/categories/'),
      ]);

      // ✅ SÉCURITÉ : S'assurer que housingsData est un tableau
      const housingsArray = Array.isArray(housingsData) 
        ? housingsData 
        : (housingsData?.results || []);
      
      setHousings(housingsArray);
      
      const cats = categoriesRes.data.results || categoriesRes.data || [];
      setCategories(Array.isArray(cats) ? cats : []);
      
      calculateStats(housingsArray);
      setVisits(visitsData);
      setNotifications(notificationsData);
    } catch (error) {
      console.error("Erreur détaillée:", error);
      toast.error('Erreur lors du chargement des données');
      setHousings([]); // ✅ En cas d'erreur, on met un tableau vide
    } finally {
      setLoading(false);
    }
  };

  // ✅ CORRECTION : Vérification du type de données
  const calculateStats = (housings) => {
    const data = Array.isArray(housings) ? housings : [];

    setStats({
      total: data.length,
      disponible: data.filter(h => h.status === 'disponible').length,
      reserve: data.filter(h => h.status === 'reserve').length,
      occupe: data.filter(h => h.status === 'occupe').length,
    });
  };

  // ✅ CORRECTION : Protection contre les données non-tableau
  const filterHousings = () => {
    if (!housings || !Array.isArray(housings)) {
      return [];
    }
    
    return housings.filter(housing => {
      const matchStatus =
        selectedCategory === 'all' || housing.status === selectedCategory;

      const matchCategory =
        selectedHousingCategory === 'all' ||
        housing.category?.id === Number(selectedHousingCategory);

      return matchStatus && matchCategory;
    });
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

  const handleUpdateHousing = async (housingId) => {
    try {
      const housing = housings.find(h => h.id === housingId);
      if (!housing) {
        toast.error('Logement introuvable');
        return;
      }
      
      setEditingHousing(housing);
      setShowEditModal(true);
    } catch (error) {
      toast.error('Erreur lors du chargement du logement');
    }
  };

  const handleUpdateSubmit = async (updatedData) => {
    try {
      await housingService.updateHousing(editingHousing.id, updatedData);
      toast.success('Logement modifié avec succès');
      setShowEditModal(false);
      setEditingHousing(null);
      loadDashboardData();
    } catch (error) {
      toast.error('Erreur lors de la modification');
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      
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
              <ChangePassword onClose={() => setShowChangePassword(false)} />
            )}
          </div>
        );

      case 'housings':
        return (
          <div className="dashboard-section">
            <div className="section-header-flex">
              <h2>Mes Logements</h2>
            </div>

            <div className="housing-filter-header">
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
                        className="btn btn-sm btn-primary"
                        onClick={() => handleUpdateHousing(housing.id)}
                      >
                        <FaEdit /> Modifier
                      </button>
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

            {showEditModal && editingHousing && (
              <HousingEditModal
                housing={editingHousing}
                onClose={() => {
                  setShowEditModal(false);
                  setEditingHousing(null);
                }}
                onUpdate={handleUpdateSubmit}
              />
            )}
          </div>
        );

      case 'AddHousing':
        return (
          <div className="dashboard-section">
            <HousingForm />
          </div>
        );

      case 'stats':
        return (
          <div className="dashboard-section">
            <h2>📊 Statistiques de mes logements</h2>

            <div className="stats-grid">
              <div className="stat-card blue">
                <div className="stat-icon">🏠</div>
                <div className="stat-info">
                  <div className="stat-number">{stats.total}</div>
                  <div className="stat-label">Total logements</div>
                </div>
              </div>
              <div className="stat-card green">
                <div className="stat-icon">✅</div>
                <div className="stat-info">
                  <div className="stat-number">{stats.disponible}</div>
                  <div className="stat-label">Disponibles</div>
                </div>
              </div>
              <div className="stat-card orange">
                <div className="stat-icon">⏳</div>
                <div className="stat-info">
                  <div className="stat-number">{stats.reserve}</div>
                  <div className="stat-label">Réservés</div>
                </div>
              </div>
              <div className="stat-card red">
                <div className="stat-icon">🔒</div>
                <div className="stat-info">
                  <div className="stat-number">{stats.occupe}</div>
                  <div className="stat-label">Occupés</div>
                </div>
              </div>
            </div>

            <div className="chart-section">
              <h3>Répartition par statut</h3>
              <div className="status-chart">
                <div className="chart-bar">
                  <div className="bar-label">Disponibles</div>
                  <div className="bar-container">
                    <div
                      className="bar-fill available"
                      style={{ 
                        width: stats.total > 0 
                          ? `${(stats.disponible / stats.total) * 100}%` 
                          : '0%' 
                      }}
                    >
                      {stats.disponible}
                    </div>
                  </div>
                </div>
                <div className="chart-bar">
                  <div className="bar-label">Réservés</div>
                  <div className="bar-container">
                    <div
                      className="bar-fill reserved"
                      style={{ 
                        width: stats.total > 0 
                          ? `${(stats.reserve / stats.total) * 100}%` 
                          : '0%' 
                      }}
                    >
                      {stats.reserve}
                    </div>
                  </div>
                </div>
                <div className="chart-bar">
                  <div className="bar-label">Occupés</div>
                  <div className="bar-container">
                    <div
                      className="bar-fill occupied"
                      style={{ 
                        width: stats.total > 0 
                          ? `${(stats.occupe / stats.total) * 100}%` 
                          : '0%' 
                      }}
                    >
                      {stats.occupe}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ✅ CORRECTION : Protection contre housings non-tableau */}
            <div className="top-housings-section">
              <h3>📈 Logements les plus vus</h3>
              <div className="top-housings-list">
                {Array.isArray(housings) && housings.length > 0 ? (
                  [...housings] // ✅ Créer une copie pour ne pas muter l'original
                    .sort((a, b) => (b.views_count || 0) - (a.views_count || 0))
                    .slice(0, 5)
                    .map((housing, index) => (
                      <div key={housing.id} className="top-housing-item">
                        <div className="rank">#{index + 1}</div>
                        <img 
                          src={housing.main_image || '/placeholder.jpg'} 
                          alt={housing.title}
                          onError={(e) => e.target.src = '/placeholder.jpg'}
                        />
                        <div className="housing-details">
                          <h4>{housing.title}</h4>
                          <p>{housing.price?.toLocaleString()} FCFA/mois</p>
                        </div>
                        <div className="housing-stats">
                          <span>👁️ {housing.views_count || 0}</span>
                          <span>❤️ {housing.likes_count || 0}</span>
                        </div>
                      </div>
                    ))
                ) : (
                  <p className="no-data">Aucun logement disponible pour les statistiques</p>
                )}
              </div>
            </div>
          </div>
        );

      case 'visibility':
        return (
          <div className="dashboard-section full-width">
            <VisibilityManagement />
          </div>
        );

      case 'reservations':
        return (
          <div className="dashboard-section">
            <VisitsList userRole="proprietaire" />
          </div>
        );

      case 'messages':
        return (
          <div className="dashboard-section full-height">
            <MessagingPage />
          </div>
        );

      case 'notifications':
        return (
          <div className="dashboard-section">
            <NotificationsList />
          </div>
        );

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
          <button className={activeTab === 'AddHousing' ? 'active' : ''}
                  onClick={() => setActiveTab('AddHousing')}>
            <FaPlus /> Ajouter un logement
          </button>
          <button className={activeTab === 'stats' ? 'active' : ''}
                  onClick={() => setActiveTab('stats')}>
            <FaChartLine /> Statistiques
          </button>
          <button className={activeTab === 'visibility' ? 'active' : ''}
                  onClick={() => setActiveTab('visibility')}>
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

// src/components/dashboard/AdminDashboard.jsx - VERSION CORRIGÉE

import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Loading from '../common/Loading';
import HousingCard from '../housing/HousingCard';
import MessagingPage from '../messaging/MessagingPage';
import NotificationsList from '../notifications/NotificationsList';
import ProfileEdit from '../profile/ProfileEdit';
import ChangePassword from '../profile/ChangePassword';
import { toast } from 'react-toastify';
import {
  FaUsers, FaEdit , FaHome, FaEye, FaEyeSlash, FaBell, FaTrash, FaBan,
  FaCheck, FaCog, FaChartBar, FaUser, FaEnvelope, FaTrophy,
  FaSearch, FaArrowLeft, FaLock, FaCheckCircle, FaComments
} from 'react-icons/fa';
import './AdminDashboard.css';
import { useAuth } from '../../contexts/AuthContext';



const AdminDashboard = ({ user }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [housings, setHousings] = useState([]);
  const [proprietaires, setProprietaires] = useState([]); // 🆕 NOUVEAU
  const [selectedUser, setSelectedUser] = useState(null);
  const [filterOwner, setFilterOwner] = useState('');
  const [filterVisibility, setFilterVisibility] = useState('all');
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  const [showEditProfile, setShowEditProfile] = useState(false); // ✅ AJOUTÉ
  // ... autres états

  useEffect(() => {
    loadData();
  }, [activeTab, filterOwner, filterVisibility]);

  // 🆕 Charger la liste des propriétaires au montage
  useEffect(() => {
    loadProprietaires();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      if (activeTab === 'overview') {
        const response = await api.get('/admin/stats/detailed/');
        setStats(response.data);
      } else if (activeTab === 'users') {
        const response = await api.get('/admin/users/enhanced/');
        setUsers(response.data);
      } else if (activeTab === 'housings') {
        const params = {};
        if (filterOwner) params.owner = filterOwner;
        if (filterVisibility !== 'all') params.visibility = filterVisibility;
        
        const response = await api.get('/admin/housings/', { params });
        setHousings(response.data.results || response.data);
      }
    } catch (error) {
      console.error('Erreur chargement:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  // 🆕 NOUVEAU: Charger uniquement les propriétaires
  const loadProprietaires = async () => {
    try {
      const response = await api.get('/admin/proprietaires/');
      setProprietaires(response.data);
    } catch (error) {
      console.error('Erreur chargement propriétaires:', error);
    }
  };

  // ==================== GESTION UTILISATEURS ====================
  
  const handleViewUserDetail = async (userId) => {
    try {
      const response = await api.get(`/admin/users/${userId}/`);
      setSelectedUser(response.data);
      setActiveTab('user-detail');
    } catch (error) {
      toast.error('Erreur lors du chargement');
    }
  };

  const handleBlockUser = async (userId, duration) => {
    try {
      await api.post(`/admin/users/${userId}/block/`, { duration });
      toast.success('Utilisateur bloqué');
      loadData();
    } catch (error) {
      toast.error('Erreur lors du blocage');
    }
  };

  const handleUnblockUser = async (userId) => {
    try {
      await api.post(`/admin/users/${userId}/unblock/`);
      toast.success('Utilisateur débloqué');
      loadData();
    } catch (error) {
      toast.error('Erreur lors du déblocage');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Attention: Supprimer cet utilisateur et tous ses logements ?')) return;
    
    try {
      await api.delete(`/admin/users/${userId}/delete/`);
      toast.success('Utilisateur supprimé');
      loadData();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  // ==================== GESTION LOGEMENTS ====================
  
  const handleToggleVisibility = async (housingId) => {
    try {
      const response = await api.post(`/admin/housings/${housingId}/toggle-visibility/`);
      toast.success(response.data.message);
      loadData();
    } catch (error) {
      toast.error('Erreur lors de la modification');
    }
  };

  const handleDeleteHousing = async (housingId) => {
    if (!window.confirm('Supprimer ce logement ?')) return;
    
    try {
      await api.delete(`/admin/housings/${housingId}/delete/`);
      toast.success('Logement supprimé');
      loadData();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  // Génère une couleur unique basée sur le nom
const getAvatarColor = (name) => {
  let hash = 0;
  const text = name || "User";
  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash % 360);
  return `hsl(${hue}, 65%, 45%)`;
};

// Récupère les initiales (ex: "JD" pour Jean Dupont)
const getInitials = (user) => {
  const first = user.first_name || "";
  const last = user.last_name || user.username || "U";
  if (first && last) return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
  return last.charAt(0).toUpperCase();
};
  // ==================== RENDER ====================
  
  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="overview-section">
            <h1><FaChartBar /> Vue d'ensemble</h1>
            
            {loading ? <Loading /> : stats && (
              <>
                {/* Statistiques Utilisateurs */}
                <section className="stats-section">
                  <h2><FaUsers /> Utilisateurs</h2>
                  <div className="stats-grid">
                    <div className="stat-card blue">
                      <div className="stat-icon"><FaUsers /></div>
                      <div className="stat-number">{stats.users.total}</div>
                      <div className="stat-label">Total</div>
                    </div>
                    <div className="stat-card green">
                      <div className="stat-icon"><FaHome /></div>
                      <div className="stat-number">{stats.users.proprietaires}</div>
                      <div className="stat-label">Propriétaires</div>
                    </div>
                    <div className="stat-card purple">
                      <div className="stat-icon"><FaSearch /></div>
                      <div className="stat-number">{stats.users.locataires}</div>
                      <div className="stat-label">Locataires</div>
                    </div>
                    <div className="stat-card orange">
                      <div className="stat-icon"><FaBan /></div>
                      <div className="stat-number">{stats.users.blocked}</div>
                      <div className="stat-label">Bloqués</div>
                    </div>
                  </div>
                </section>

                {/* Statistiques Logements */}
                <section className="stats-section">
                  <h2><FaHome /> Logements</h2>
                  <div className="stats-grid">
                    <div className="stat-card blue">
                      <div className="stat-icon"><FaChartBar /></div>
                      <div className="stat-number">{stats.housings.total}</div>
                      <div className="stat-label">Total</div>
                    </div>
                    <div className="stat-card green">
                      <div className="stat-icon"><FaEye /></div>
                      <div className="stat-number">{stats.housings.visible}</div>
                      <div className="stat-label">Visibles</div>
                    </div>
                    <div className="stat-card orange">
                      <div className="stat-icon"><FaLock /></div>
                      <div className="stat-number">{stats.housings.hidden}</div>
                      <div className="stat-label">Masqués</div>
                    </div>
                    <div className="stat-card purple">
                      <div className="stat-icon"><FaCheckCircle /></div>
                      <div className="stat-number">{stats.housings.disponible}</div>
                      <div className="stat-label">Disponibles</div>
                    </div>
                  </div>
                </section>

                {/* Top Propriétaires */}
                <section className="stats-section">
                  <h2><FaTrophy /> Top Propriétaires</h2>
                  <div className="top-users-list">
                    {stats.users.top_owners.map((owner, idx) => (
                      <div key={owner.id} className="top-user-item">
                        <div className="rank">#{idx + 1}</div>


                        {/* <img 
                          src={owner.photo || '/default-avatar.png'} 
                          alt={owner.username}
                          onError={(e) => { e.target.src = '/default-avatar.png'; }}
                        /> */}
                        
                          <div 
                          className="avatar-initials-only"
                          style={{ 
                            backgroundColor: getAvatarColor(owner.last_name || owner.username) 
                          }}
                          title={`${owner.first_name || ''} ${owner.last_name || owner.username}`}
                        >
                          {getInitials(owner)}
                        </div>



                        <div className="user-info">
                          <h4>{owner.username}</h4>
                          <p>{owner.email}</p>
                        </div>
                        <div className="user-stats">
                          <span><FaHome /> {owner.housings_count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </>
            )}
          </div>
        );

      case 'users':
        return (
          <div className="users-section">
            <h1><FaUsers /> Gestion des Utilisateurs</h1>
            
            {loading ? <Loading /> : (
              <div className="users-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Photo</th>
                      <th>Nom</th>
                      <th>Email</th>
                      <th>Rôle</th>
                      <th>Logements</th>
                      <th>Statut</th>
                      <th>Inscrit le</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.id}>
                        <td>
                          {/* <img 
                            src={user.photo || '/default-avatar.png'} 
                            alt={user.username}
                            className="user-avatar-sm"
                            onError={(e) => { e.target.src = '/default-avatar.png'; }}
                          /> */}
                          {user.photo ? (
                          <img 
                            src={user.photo} 
                            alt={user.username}
                            className="user-avatar-sm"
                            onError={(e) => { 
                              e.target.onerror = null; 
                              e.target.src = '/default-avatar.png'; 
                            }}
                          />
                        ) : (
                          <div 
                            className="user-avatar-sm avatar-initials"
                            style={{ backgroundColor: getAvatarColor(user.last_name || user.username) }}
                          >
                            {(user.last_name || user.username).charAt(0).toUpperCase()}
                          </div>
                        )}


                        </td>
                        <td>{user.username}</td>
                        <td>{user.email}</td>
                        <td>
                          <span className={`role-badge ${user.is_proprietaire ? 'proprietaire' : 'locataire'}`}>
                            {user.is_proprietaire ? 'Propriétaire' : 'Locataire'}
                          </span>
                        </td>
                        <td>
                          <button 
                            className="btn-link"
                            onClick={() => handleViewUserDetail(user.id)}
                          >
                            <FaHome /> {user.housings_count || 0}
                          </button>
                        </td>
                        <td>
                          <span className={`status-badge ${user.is_blocked ? 'blocked' : 'active'}`}>
                            {user.is_blocked ? 'Bloqué' : 'Actif'}
                          </span>
                        </td>
                        <td>{new Date(user.date_joined).toLocaleDateString('fr-FR')}</td>
                        <td>
                          <div className="action-buttons">
                            <button 
                              className="btn-icon"
                              onClick={() => handleViewUserDetail(user.id)}
                              title="Voir détails"
                            >
                              <FaEye />
                            </button>
                            
                            {!user.is_blocked ? (
                              <button 
                                className="btn-icon danger"
                                onClick={() => handleBlockUser(user.id, 'permanent')}
                                title="Bloquer"
                              >
                                <FaBan />
                              </button>
                            ) : (
                              <button 
                                className="btn-icon success"
                                onClick={() => handleUnblockUser(user.id)}
                                title="Débloquer"
                              >
                                <FaCheck />
                              </button>
                            )}
                            
                            <button 
                              className="btn-icon danger"
                              onClick={() => handleDeleteUser(user.id)}
                              title="Supprimer"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );

      case 'user-detail':
        return selectedUser && (
          <div className="user-detail-section">
            <button 
              className="btn btn-outline"
              onClick={() => setActiveTab('users')}
            >
              <FaArrowLeft /> Retour
            </button>
            
            <h1>Détails: {selectedUser.username}</h1>
            
            <div className="user-detail-card">
              <img 
                src={selectedUser.photo || '/default-avatar.png'} 
                alt={selectedUser.username}
                className="user-avatar-large"
                onError={(e) => { e.target.src = '/default-avatar.png'; }}
              />
              <div className="user-info">
                <p><strong><FaEnvelope /> Email:</strong> {selectedUser.email}</p>
                <p><strong>Téléphone:</strong> {selectedUser.phone || 'Non renseigné'}</p>
                <p><strong><FaUser /> Rôle:</strong> {selectedUser.is_proprietaire ? 'Propriétaire' : 'Locataire'}</p>
              </div>
            </div>

            <h2><FaHome /> Logements ({selectedUser.housings_count})</h2>
            <div className="housing-grid">
              {selectedUser.housings && selectedUser.housings.map(housing => (
                <HousingCard key={housing.id} housing={housing} />
              ))}
            </div>
          </div>
        );

      case 'housings':
        return (
          <div className="housings-section">
            <h1><FaHome /> Gestion des Logements</h1>
            
            <div className="filters-bar">
              {/* 🔧 FIX: Filtre uniquement sur les propriétaires */}
              <select 
                value={filterOwner}
                onChange={(e) => setFilterOwner(e.target.value)}
              >
                <option value="">Tous les propriétaires</option>
                {proprietaires.map(proprio => (
                  <option key={proprio.id} value={proprio.id}>
                    {proprio.username} ({proprio.housings_count} logements)
                  </option>
                ))}
              </select>

              <select 
                value={filterVisibility}
                onChange={(e) => setFilterVisibility(e.target.value)}
              >
                <option value="all">Tous</option>
                <option value="visible">Visibles</option>
                <option value="hidden">Masqués</option>
              </select>
            </div>

            {loading ? <Loading /> : (
              <div className="housings-list">
                {housings.map(housing => (
                  <div key={housing.id} className="housing-admin-item">
                    <HousingCard housing={housing} />
                    
                    <div className="housing-admin-actions">
                      <button 
                        className={`btn btn-sm ${housing.is_visible ? 'btn-warning' : 'btn-success'}`}
                        onClick={() => handleToggleVisibility(housing.id)}
                      >
                        {housing.is_visible ? (
                          <><FaEyeSlash /> Masquer</>
                        ) : (
                          <><FaEye /> Activer</>
                        )}
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
          </div>
        );

      // AdminDashboard.jsx - SECTION PROFIL

case 'profile':
  return (
    <div className="profile-section">
      <h1><FaUser /> Mon Profil Admin</h1>
      
      {/* Carte profil */}
      <div className="profile-card">
        <div className="profile-header">

          {/* <img
            src={user?.photo || '/default-avatar.png'}
            alt={user?.username}
            className="profile-avatar-large"
            onError={(e) => { e.target.src = '/default-avatar.png'; }}
          />
           */}
           {/* Vérification si user existe pour éviter les erreurs de rendu */}
{user?.photo ? (
  <img 
    src={user.photo} 
    alt={user.username}
    className="user-avatar-sm"
    onError={(e) => { 
      e.target.onerror = null; 
      e.target.src = '/default-avatar.png'; 
    }}
  />
) : (
  <div 
    className="user-avatar-sm avatar-initials"
    style={{ 
      backgroundColor: getAvatarColor(user?.last_name || user?.username || 'User'),
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontWeight: 'bold',
      borderRadius: '50%',
      textTransform: 'uppercase'
    }}
  >
    {/* Affiche l'initiale du nom, sinon du pseudo, sinon 'U' par défaut */}
    {(user?.last_name || user?.username || 'U').charAt(0)}
  </div>
)}

          <div className="profile-info">
            <h3>{user?.first_name} {user?.last_name}</h3>
            <p>@{user?.username}</p>
            <p className="role-badge admin">Administrateur</p>
          </div>
        </div>

        <div className="profile-details">
          <div className="detail-item">
            <strong>Email:</strong> {user?.email}
          </div>
          <div className="detail-item">
            <strong>Téléphone:</strong> {user?.phone || 'Non renseigné'}
          </div>
          <div className="detail-item">
            <strong>Membre depuis:</strong>{' '}
            {new Date(user?.date_joined).toLocaleDateString('fr-FR')}
          </div>
        </div>

        <div className="profile-actions">
          <button
            className="btn btn-primary"
            onClick={() => setShowEditProfile(true)}
          >
            <FaEdit /> Modifier le profil
          </button>

          <button
            className="btn btn-outline"
            onClick={() => setShowChangePassword(true)}
          >
            <FaLock /> Changer le mot de passe
          </button>
        </div>
      </div>

      {/* Modals */}
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

      // AdminDashboard.jsx - SECTION MESSAGES/SUPPORT

case 'messages':
  return (
    <div className="messages-section">
      <div className="messages-header">
        <h1><FaComments /> Support Client</h1>
        <p>Conversations avec les utilisateurs</p>
      </div>
      
      {/* ✅ Intégration MessagingPage avec filtre admin */}
      <MessagingPage isAdminView={true} />
    </div>
  );



      case 'notifications':
        return (
          <div className="notifications-section">
            <NotificationsList />
          </div>
        );

      default:
        return <div>Section en développement</div>;
    }
  };

  return (
    <div className="dashboard-layout">
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <h2><FaCog /> Admin</h2>
        </div>

        <nav className="sidebar-nav">
          <button 
            className={activeTab === 'overview' ? 'active' : ''}
            onClick={() => setActiveTab('overview')}
          >
            <FaChartBar /> Vue d'ensemble
          </button>
          
          <button 
            className={activeTab === 'users' ? 'active' : ''}
            onClick={() => setActiveTab('users')}
          >
            <FaUsers /> Utilisateurs
          </button>
          
          <button 
            className={activeTab === 'housings' ? 'active' : ''}
            onClick={() => setActiveTab('housings')}
          >
            <FaHome /> Logements
          </button>
          
          <button 
            className={activeTab === 'profile' ? 'active' : ''}
            onClick={() => setActiveTab('profile')}
          >
            <FaUser /> Profil
          </button>
          
          <button 
            className={activeTab === 'messages' ? 'active' : ''}
            onClick={() => setActiveTab('messages')}
          >
            <FaComments /> Support
          </button>
          
          <button 
            className={activeTab === 'notifications' ? 'active' : ''}
            onClick={() => setActiveTab('notifications')}
          >
            <FaBell /> Notifications
          </button>
        </nav>
      </aside>

      <main className="dashboard-main">
        {renderContent()}
      </main>
    </div>
  );
};

export default AdminDashboard;
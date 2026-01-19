// // ============================================
// // src/components/dashboard/AdminDashboard.jsx
// // ============================================

import React, { useState, useEffect } from 'react';
import { 
  getAdminStats, 
  getAdminUsers, 
  blockUser, 
  unblockUser, 
  deleteUserAdmin 
} from '../../services/api';
import Loading from '../common/Loading';
import { toast } from 'react-toastify';
import './AdminDashboard.css';
import {
  FaHeart, FaBookmark, FaCalendar, FaEnvelope,
  FaBell, FaCog, FaUser, FaTrash
} from 'react-icons/fa';


const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  // ✅ CORRECTION: Appels API fonctionnels
  const fetchData = async () => {
    try {
      setLoading(true);
      
      if (activeTab === 'overview') {
        const statsData = await getAdminStats();
        setStats(statsData);
      } else if (activeTab === 'users') {
        const usersData = await getAdminUsers();
        setUsers(usersData);
      }
    } catch (error) {
      console.error('Erreur chargement:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  // ✅ CORRECTION: Blocage utilisateur
  const handleBlockUser = async (userId) => {
    const duration = prompt('Durée du blocage (jours) ou "permanent" :', '7');
    if (!duration) return;

    try {
      await blockUser(userId, duration);
      toast.success('Utilisateur bloqué avec succès');
      fetchData();
    } catch (error) {
      toast.error('Erreur lors du blocage');
    }
  };

  // ✅ CORRECTION: Déblocage utilisateur
  const handleUnblockUser = async (userId) => {
    try {
      await unblockUser(userId);
      toast.success('Utilisateur débloqué');
      fetchData();
    } catch (error) {
      toast.error('Erreur lors du déblocage');
    }
  };

  // ✅ CORRECTION: Suppression utilisateur
  const handleDeleteUser = async (userId) => {
    if (!window.confirm('⚠️ ATTENTION: Supprimer définitivement cet utilisateur et TOUTES ses données ?')) {
      return;
    }

    try {
      await deleteUserAdmin(userId);
      toast.success('Utilisateur supprimé');
      fetchData();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  // Filtrage utilisateurs
  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <Loading fullScreen message="Chargement du dashboard admin..." />;
  }

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <div className="admin-sidebar">
        <div className="sidebar-header">
          <h2>⚙️ Administration</h2>
        </div>
        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            📊 Vue d'ensemble
          </button>
          <button 
            className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            👥 Utilisateurs
          </button>
          <button 
            className={`nav-item ${activeTab === 'housings' ? 'active' : ''}`}
            onClick={() => setActiveTab('housings')}
          >
            🏠 Logements
          </button>
          <button 
            className={`nav-item ${activeTab === 'support' ? 'active' : ''}`}
            onClick={() => setActiveTab('support')}
          >
            💬 Support
          </button>

            <button
                className={activeTab === 'notifications' ? 'active' : ''}
                onClick={() => setActiveTab('notifications')}
                  >
              <FaBell /> Notifications
            </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="admin-content">
        {/* Overview */}
        {activeTab === 'overview' && stats && (
          <div className="overview-section">
            <h1>📊 Vue d'ensemble</h1>
            
            <div className="stats-grid">
              <div className="stat-card blue">
                <div className="stat-icon">👥</div>
                <div className="stat-info">
                  <div className="stat-value">{stats.users.total}</div>
                  <div className="stat-label">Utilisateurs</div>
                </div>
              </div>
              
              <div className="stat-card green">
                <div className="stat-icon">🏠</div>
                <div className="stat-info">
                  <div className="stat-value">{stats.housings.total}</div>
                  <div className="stat-label">Logements</div>
                </div>
              </div>
              
              <div className="stat-card orange">
                <div className="stat-icon">💬</div>
                <div className="stat-info">
                  <div className="stat-value">{stats.activity.total_messages}</div>
                  <div className="stat-label">Messages</div>
                </div>
              </div>
              
              <div className="stat-card purple">
                <div className="stat-icon">📅</div>
                <div className="stat-info">
                  <div className="stat-value">{stats.activity.pending_visits}</div>
                  <div className="stat-label">Visites en attente</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Management */}
        {activeTab === 'users' && (
          <div className="users-section">
            <div className="section-header">
              <h1>👥 Gestion des Utilisateurs</h1>
              <input
                type="text"
                placeholder="🔍 Rechercher un utilisateur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="users-table-container">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Photo</th>
                    <th>Nom</th>
                    <th>Email</th>
                    <th>Rôle</th>
                    <th>Statut</th>
                    <th>Inscrit le</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(user => (
                    <tr key={user.id}>
                      <td>
                        <img 
                          src={user.photo || '/default-avatar.png'} 
                          alt={user.username}
                          className="user-avatar-small"
                        />
                      </td>
                      <td>{user.username}</td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`role-badge ${user.is_proprietaire ? 'proprietaire' : 'locataire'}`}>
                          {user.is_proprietaire ? 'Propriétaire' : 'Locataire'}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${user.is_blocked ? 'blocked' : 'active'}`}>
                          {user.is_blocked ? 'Bloqué' : 'Actif'}
                        </span>
                      </td>
                      <td>{new Date(user.date_joined).toLocaleDateString('fr-FR')}</td>
                      <td>
                        <div className="action-buttons">
                          {!user.is_blocked ? (
                            <button 
                              className="btn btn-warning btn-sm"
                              onClick={() => handleBlockUser(user.id)}
                            >
                              🚫 Bloquer
                            </button>
                          ) : (
                            <button 
                              className="btn btn-success btn-sm"
                              onClick={() => handleUnblockUser(user.id)}
                            >
                              ✅ Débloquer
                            </button>
                          )}
                          
                          <button 
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            🗑️ Supprimer
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Placeholder autres sections */}
        {(activeTab === 'housings' || activeTab === 'support') && (
          <div className="placeholder-section">
            <div className="placeholder-icon">🚧</div>
            <h2>Section en développement</h2>
            <p>Cette fonctionnalité sera disponible prochainement</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
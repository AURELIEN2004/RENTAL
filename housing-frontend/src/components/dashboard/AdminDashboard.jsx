// ============================================
// src/components/dashboard/AdminDashboard.jsx
// ============================================
import React, { useState, useEffect } from 'react';
import { getAdminStats, getUsers, blockUser, deleteUser, getCategories, createCategory, deleteCategory } from '../../services/api';
import Loading from '../common/Loading';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'overview') {
        const statsData = await getAdminStats();
        setStats(statsData);
      } else if (activeTab === 'users') {
        const usersData = await getUsers();
        setUsers(usersData);
      } else if (activeTab === 'categories') {
        const categoriesData = await getCategories();
        setCategories(categoriesData);
      }
    } catch (error) {
      console.error('Erreur chargement données:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBlockUser = async (userId, duration) => {
    try {
      await blockUser(userId, duration);
      alert('Utilisateur bloqué avec succès');
      fetchData();
    } catch (error) {
      console.error('Erreur blocage:', error);
      alert('Erreur lors du blocage');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ? Toutes ses données seront supprimées définitivement.')) {
      try {
        await deleteUser(userId);
        alert('Utilisateur supprimé');
        fetchData();
      } catch (error) {
        console.error('Erreur suppression:', error);
        alert('Erreur lors de la suppression');
      }
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    
    try {
      await createCategory({ name: newCategoryName });
      alert('Catégorie créée avec succès');
      setNewCategoryName('');
      fetchData();
    } catch (error) {
      console.error('Erreur création:', error);
      alert('Erreur lors de la création');
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm('Supprimer cette catégorie ? Tous les logements associés seront impactés.')) {
      try {
        await deleteCategory(categoryId);
        alert('Catégorie supprimée');
        fetchData();
      } catch (error) {
        console.error('Erreur suppression:', error);
        alert('Erreur lors de la suppression');
      }
    }
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            className={`nav-item ${activeTab === 'categories' ? 'active' : ''}`}
            onClick={() => setActiveTab('categories')}
          >
            📁 Catégories
          </button>

           <button 
            className={`nav-item ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            📁 Notifications
          </button>
          
          
          <button 
            className={`nav-item ${activeTab === 'locations' ? 'active' : ''}`}
            onClick={() => setActiveTab('locations')}
          >
            📍 Localisations
          </button>
          <button 
            className={`nav-item ${activeTab === 'support' ? 'active' : ''}`}
            onClick={() => setActiveTab('support')}
          >
            💬 Support
          </button>
        </nav>
      </div>

      

      {/* Main Content */}
      <div className="admin-content">
        {loading ? (
          <Loading fullScreen message="Chargement..." />
        ) : (
          <>
            {/* Overview */}
            {activeTab === 'overview' && stats && (
              <div className="overview-section">
                <h1>📊 Vue d'ensemble</h1>
                
                <div className="stats-grid">
                  <div className="stat-card blue">
                    <div className="stat-icon">👥</div>
                    <div className="stat-info">
                      <div className="stat-value">{stats.total_users}</div>
                      <div className="stat-label">Utilisateurs</div>
                    </div>
                  </div>
                  
                  <div className="stat-card green">
                    <div className="stat-icon">🏠</div>
                    <div className="stat-info">
                      <div className="stat-value">{stats.total_housings}</div>
                      <div className="stat-label">Logements</div>
                    </div>
                  </div>
                  
                  <div className="stat-card orange">
                    <div className="stat-icon">👤</div>
                    <div className="stat-info">
                      <div className="stat-value">{stats.locataires_count}</div>
                      <div className="stat-label">Locataires</div>
                    </div>
                  </div>
                  
                  <div className="stat-card purple">
                    <div className="stat-icon">🏢</div>
                    <div className="stat-info">
                      <div className="stat-value">{stats.proprietaires_count}</div>
                      <div className="stat-label">Propriétaires</div>
                    </div>
                  </div>
                </div>

                <div className="charts-section">
                  <div className="chart-card">
                    <h3>Logements par statut</h3>
                    <div className="status-bars">
                      <div className="status-bar">
                        <span>Disponibles</span>
                        <div className="bar">
                          <div 
                            className="bar-fill available"
                            style={{ width: `${(stats.available_housings / stats.total_housings) * 100}%` }}
                          />
                        </div>
                        <span>{stats.available_housings}</span>
                      </div>
                      <div className="status-bar">
                        <span>Réservés</span>
                        <div className="bar">
                          <div 
                            className="bar-fill reserved"
                            style={{ width: `${(stats.reserved_housings / stats.total_housings) * 100}%` }}
                          />
                        </div>
                        <span>{stats.reserved_housings}</span>
                      </div>
                      <div className="status-bar">
                        <span>Occupés</span>
                        <div className="bar">
                          <div 
                            className="bar-fill occupied"
                            style={{ width: `${(stats.occupied_housings / stats.total_housings) * 100}%` }}
                          />
                        </div>
                        <span>{stats.occupied_housings}</span>
                      </div>
                    </div>
                  </div>

                  <div className="chart-card">
                    <h3>Activité récente</h3>
                    <div className="activity-list">
                      <div className="activity-item">
                        <span className="activity-icon">📈</span>
                        <span>+{stats.new_users_this_month} nouveaux utilisateurs ce mois</span>
                      </div>
                      <div className="activity-item">
                        <span className="activity-icon">🏠</span>
                        <span>+{stats.new_housings_this_month} nouveaux logements ce mois</span>
                      </div>
                      <div className="activity-item">
                        <span className="activity-icon">💬</span>
                        <span>{stats.total_messages} messages échangés</span>
                      </div>
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
                        <th>Téléphone</th>
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
                          <td>{user.phone}</td>
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
                                <select 
                                  onChange={(e) => handleBlockUser(user.id, e.target.value)}
                                  className="block-select"
                                >
                                  <option value="">Bloquer...</option>
                                  <option value="7">7 jours</option>
                                  <option value="30">30 jours</option>
                                  <option value="permanent">Permanent</option>
                                </select>
                              ) : (
                                <button 
                                  className="unblock-btn"
                                  onClick={() => handleBlockUser(user.id, null)}
                                >
                                  Débloquer
                                </button>
                              )}
                              <button 
                                className="delete-btn"
                                onClick={() => handleDeleteUser(user.id)}
                              >
                                🗑️
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

            {/* Categories Management */}
            {activeTab === 'categories' && (
              <div className="categories-section">
                <h1>📁 Gestion des Catégories</h1>
                
                <form className="add-category-form" onSubmit={handleCreateCategory}>
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Nom de la nouvelle catégorie"
                    required
                  />
                  <button type="submit">➕ Ajouter</button>
                </form>

                <div className="categories-grid">
                  {categories.map(category => (
                    <div key={category.id} className="category-card">
                      <div className="category-info">
                        <h3>{category.name}</h3>
                        <p>{category.housings_count || 0} logements</p>
                      </div>
                      <button 
                        className="delete-category-btn"
                        onClick={() => handleDeleteCategory(category.id)}
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Placeholder pour autres sections */}
            {(activeTab === 'housings' || activeTab === 'locations' || activeTab === 'support') && (
              <div className="placeholder-section">
                <div className="placeholder-icon">🚧</div>
                <h2>Section en développement</h2>
                <p>Cette fonctionnalité sera disponible prochainement</p>
              </div>
            )}

             {(activeTab === 'notifications' || activeTab === 'locations' || activeTab === 'support') && (
              <div className="placeholder-section">
                <div className="placeholder-icon">🚧</div>
                <h2>Section en développement</h2>
                <p>Cette fonctionnalité sera disponible prochainement</p>
              </div>
            )}

          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;



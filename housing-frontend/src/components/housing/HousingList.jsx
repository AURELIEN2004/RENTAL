// ============================================
// src/components/housing/HousingList.jsx - CORRECTION
// ============================================

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import HousingCard from './HousingCard';
import Loading from '../common/Loading';
import './HousingList.css';

const HousingList = ({ housings, loading, showActions = false, onDelete, onEdit, onStatusChange }) => {
  const [filteredHousings, setFilteredHousings] = useState([]);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  useEffect(() => {
    applyFilters();
  }, [housings, filter, sortBy]);

  const applyFilters = () => {
    let filtered = [...housings];

    if (filter !== 'all') {
      filtered = filtered.filter(h => h.status === filter);
    }

    switch (sortBy) {
      case 'recent':
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case 'price_asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'views':
        filtered.sort((a, b) => b.views_count - a.views_count);
        break;
      case 'likes':
        filtered.sort((a, b) => b.likes_count - a.likes_count);
        break;
      default:
        break;
    }

    setFilteredHousings(filtered);
  };

  const getStatusBadge = (status) => {
    const badges = {
      disponible: { text: 'Disponible', class: 'status-available' },
      reserve: { text: 'Réservé', class: 'status-reserved' },
      occupe: { text: 'Occupé', class: 'status-occupied' }
    };
    return badges[status] || badges.disponible;
  };

  const getStats = () => {
    return {
      total: housings.length,
      disponible: housings.filter(h => h.status === 'disponible').length,
      reserve: housings.filter(h => h.status === 'reserve').length,
      occupe: housings.filter(h => h.status === 'occupe').length
    };
  };

  const stats = getStats();

  if (loading) {
    return <Loading message="Chargement des logements..." />;
  }

  return (
    <div className="housing-list-container">
      {showActions && (
        <div className="stats-bar">
          <div className="stat-item" onClick={() => setFilter('all')}>
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total</div>
          </div>
          <div className="stat-item" onClick={() => setFilter('disponible')}>
            <div className="stat-value">{stats.disponible}</div>
            <div className="stat-label">Disponibles</div>
          </div>
          <div className="stat-item" onClick={() => setFilter('reserve')}>
            <div className="stat-value">{stats.reserve}</div>
            <div className="stat-label">Réservés</div>
          </div>
          <div className="stat-item" onClick={() => setFilter('occupe')}>
            <div className="stat-value">{stats.occupe}</div>
            <div className="stat-label">Occupés</div>
          </div>
        </div>
      )}

      <div className="list-controls">
        <div className="filter-group">
          <label>Statut:</label>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">Tous</option>
            <option value="disponible">Disponible</option>
            <option value="reserve">Réservé</option>
            <option value="occupe">Occupé</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Trier par:</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="recent">Plus récent</option>
            <option value="price_asc">Prix croissant</option>
            <option value="price_desc">Prix décroissant</option>
            <option value="views">Plus vus</option>
            <option value="likes">Plus aimés</option>
          </select>
        </div>

        <div className="result-count">
          {filteredHousings.length} logement(s)
        </div>
      </div>

      {filteredHousings.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🏠</div>
          <h3>Aucun logement trouvé</h3>
          <p>
            {filter !== 'all' 
              ? `Aucun logement avec le statut "${filter}"`
              : 'Commencez par ajouter votre premier logement'}
          </p>
          {showActions && (
            <Link to="/dashboard/ajouter-logement" className="add-btn">
              ➕ Ajouter un logement
            </Link>
          )}
        </div>
      ) : (
        <div className="housings-grid">
          {filteredHousings.map(housing => (
            <div key={housing.id} className="housing-item">
              <HousingCard housing={housing} />
              
              {showActions && (
                <div className="housing-actions">
                  <div className="status-section">
                    <span className={`status-badge ${getStatusBadge(housing.status).class}`}>
                      {getStatusBadge(housing.status).text}
                    </span>
                    <select 
                      value={housing.status}
                      onChange={(e) => onStatusChange(housing.id, e.target.value)}
                      className="status-select"
                    >
                      <option value="disponible">Disponible</option>
                      <option value="reserve">Réservé</option>
                      <option value="occupe">Occupé</option>
                    </select>
                  </div>

                  <div className="action-buttons">
                    <button 
                      className="action-btn view-btn"
                      onClick={() => window.open(`/logement/${housing.id}`, '_blank')}
                      title="Voir le logement"
                    >
                      👁️
                    </button>
                    <button 
                      className="action-btn edit-btn"
                      onClick={() => onEdit(housing.id)}
                      title="Modifier"
                    >
                      ✏️
                    </button>
                    <button 
                      className="action-btn stats-btn"
                      title={`${housing.views_count} vues | ${housing.likes_count} likes`}
                    >
                      📊
                    </button>
                    <button 
                      className="action-btn delete-btn"
                      onClick={() => {
                        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce logement ?')) {
                          onDelete(housing.id);
                        }
                      }}
                      title="Supprimer"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HousingList;
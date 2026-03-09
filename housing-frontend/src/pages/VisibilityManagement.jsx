// src/pages/VisibilityManagement.jsx - NOUVELLE PAGE

import React, { useState, useEffect } from 'react';
import { housingService } from '../services/housingService';
import { toast } from 'react-toastify';
import { FaEye, FaEyeSlash, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import './VisibilityManagement.css';
import { useTheme } from '../contexts/ThemeContext';

const VisibilityManagement = () => {
  const [housings, setHousings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, visible, hidden
const { t, language, theme } = useTheme();
  useEffect(() => {
    loadHousings();
  }, []);


  const loadHousings = async () => {
    try {
      setLoading(true);
      const data = await housingService.getMyHousings();
      setHousings(Array.isArray(data) ? data : data.results || []);
    } catch (error) {
      console.error('Erreur chargement:', error);
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVisibility = async (housingId, currentVisibility) => {
    try {
      await housingService.updateHousing(housingId, {
        is_visible: !currentVisibility
      });
      
      toast.success(
        !currentVisibility 
          ? 'Logement rendu visible' 
          : 'Logement masqué'
      );
      
      loadHousings();
    } catch (error) {
      toast.error('Erreur lors de la modification');
    }
  };

  const handleChangeStatus = async (housingId, newStatus) => {
    try {
      await housingService.updateHousing(housingId, {
        status: newStatus
      });
      
      toast.success('Statut modifié avec succès');
      loadHousings();
    } catch (error) {
      toast.error('Erreur lors de la modification');
    }
  };

  const filteredHousings = housings.filter(h => {
    if (filter === 'visible') return h.is_visible;
    if (filter === 'hidden') return !h.is_visible;
    return true;
  });

  const stats = {
    total: housings.length,
    visible: housings.filter(h => h.is_visible).length,
    hidden: housings.filter(h => !h.is_visible).length,
    disponible: housings.filter(h => h.status === 'disponible').length,
    reserve: housings.filter(h => h.status === 'reserve').length,
    occupe: housings.filter(h => h.status === 'occupe').length,
  };

  const getStatusBadge = (status) => {
    const badges = {
      disponible: { text: 'Disponible', class: 'status-available' },
      reserve: { text: 'Réservé', class: 'status-reserved' },
      occupe: { text: 'Occupé', class: 'status-occupied' }
    };
    return badges[status] || badges.disponible;
  };

  if (loading) {
    return (
      <div className="visibility-loading">
        <div className="spinner"></div>
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <div className="visibility-management">
      <div className="visibility-header">
<h1>{t('visibility_title')}</h1>
<p>{t('visibility_subtitle')}</p>
      </div>

      {/* Stats */}
      <div className="visibility-stats">
        <div className="stat-card blue">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <div className="stat-number">{stats.total}</div>
            <div className="stat-label">{t('total')}</div>
          </div>
        </div>

        <div className="stat-card green">
          <div className="stat-icon">👁️</div>
          <div className="stat-info">
            <div className="stat-number">{stats.visible}</div>
            <div className="stat-label">{t('visible')}</div>
          </div>
        </div>

        <div className="stat-card orange">
          <div className="stat-icon">🚫</div>
          <div className="stat-info">
            <div className="stat-number">{stats.hidden}</div>
            <div className="stat-label">{t('hidden')}</div>
          </div>
        </div>

        <div className="stat-card purple">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <div className="stat-number">{stats.disponible}</div>
            <div className="stat-label">{t('available')}</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="visibility-filters">
       <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
  {t('filter_all')} ({stats.total})
</button>
<button className={`filter-btn ${filter === 'visible' ? 'active' : ''}`} onClick={() => setFilter('visible')}>
  {t('visible')} ({stats.visible})
</button>
<button className={`filter-btn ${filter === 'hidden' ? 'active' : ''}`} onClick={() => setFilter('hidden')}>
  {t('hidden')} ({stats.hidden})
</button>
      </div>

      {/* Info Box */}
      <div className="info-box">
        <h3> {t('info_title')}</h3>
        <ul>
          <li>{t('info_visible')}</li>
  <li>{t('info_hidden')}</li>
  <li>{t('info_occupied')}</li>
  </ul>
      </div>

      {/* Housings List */}
      <div className="housings-list">
        {filteredHousings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🏠</div>
            <p>Aucun logement à afficher</p>
          </div>
        ) : (
          filteredHousings.map(housing => (
            <div key={housing.id} className="housing-visibility-card">
              <div className="housing-image">
                <img 
                  src={housing.main_image || '/placeholder.jpg'} 
                  alt={housing.title}
                  onError={(e) => e.target.src = '/placeholder.jpg'}
                />
                {!housing.is_visible && (
                  <div className="hidden-overlay">
                    <FaEyeSlash /> Masqué
                  </div>
                )}
              </div>

              <div className="housing-info">
                <h3>{housing.title}</h3>
                <p className="housing-location">
                  📍 {housing.district_name}, {housing.city_name}
                </p>
                <p className="housing-price">
                  {housing.price?.toLocaleString()} FCFA/mois
                </p>
              </div>

              <div className="housing-controls">
                {/* Toggle Visibilité */}
                <div className="control-item">
                  <label>{t('visibility_label')}</label>
                  <button
                    className={`toggle-btn ${housing.is_visible ? 'active' : ''}`}
                    onClick={() => handleToggleVisibility(housing.id, housing.is_visible)}
                    disabled={housing.status === 'occupe'}
                  >
                    {housing.is_visible ? 
                    // <FaEyeSlash />  <FaEye />
                     t('visible_btn') : t('hidden_btn')}
                  </button>
                </div>

                {/* Change Status */}
                <div className="control-item">
               <label>{t('status_label')}</label>
                  <select
                    value={housing.status}
                    onChange={(e) => handleChangeStatus(housing.id, e.target.value)}
                    className="status-select"
                  >
                     <option value="disponible">{t('status_options_disponible')}</option>
  <option value="reserve">{t('status_options_reserve')}</option>
  <option value="occupe">{t('status_options_occupe')}</option>
</select>
                </div>

                {/* Stats */}
                <div className="control-item">
                  <label>{t('stats_label')}</label>
                  <div className="housing-stats">
                    <span>👁️ {housing.views_count}</span>
                    <span>❤️ {housing.likes_count}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default VisibilityManagement;
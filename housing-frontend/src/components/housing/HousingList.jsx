

// src/components/housing/HousingList.jsx — VERSION BILINGUE
// ============================================================
// Corrections apportées :
//   • useTheme() → language lu depuis le contexte global
//   • Tous les textes traduits FR/EN (Statut, Trier par,
//     logement(s), Tous, options de tri, badges statut,
//     confirm suppression, empty state…)
//   • Props inchangées — aucune modification à faire
//     dans les composants parents
// ============================================================

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import HousingCard from './HousingCard';
import Loading from '../common/Loading';
import './HousingList.css';

// ── Dictionnaire bilingue ────────────────────────────────────
const T = {
  fr: {
    loading:       'Chargement des logements…',
    status_label:  'Statut :',
    sort_label:    'Trier par :',
    all:           'Tous',
    available:     'Disponible',
    reserved:      'Réservé',
    occupied:      'Occupé',
    sort_recent:   'Plus récent',
    sort_price_asc:'Prix croissant',
    sort_price_dsc:'Prix décroissant',
    sort_views:    'Plus vus',
    sort_likes:    'Plus aimés',
    results:       'logement(s)',
    // Stats bar (showActions)
    total:         'Total',
    disponibles:   'Disponibles',
    reserves:      'Réservés',
    occupes:       'Occupés',
    // Empty state
    empty_title:   'Aucun logement trouvé',
    empty_filter:  (f) => `Aucun logement avec le statut "${f}"`,
    empty_default: 'Commencez par ajouter votre premier logement',
    add_btn:       '➕ Ajouter un logement',
    // Actions (showActions)
    view:          'Voir le logement',
    edit:          'Modifier',
    delete:        'Supprimer',
    confirm_del:   'Êtes-vous sûr de vouloir supprimer ce logement ?',
    views_likes:   (v, l) => `${v} vues | ${l} likes`,
  },
  en: {
    loading:       'Loading housing…',
    status_label:  'Status:',
    sort_label:    'Sort by:',
    all:           'All',
    available:     'Available',
    reserved:      'Reserved',
    occupied:      'Occupied',
    sort_recent:   'Most recent',
    sort_price_asc:'Price (low to high)',
    sort_price_dsc:'Price (high to low)',
    sort_views:    'Most viewed',
    sort_likes:    'Most liked',
    results:       'result(s)',
    // Stats bar
    total:         'Total',
    disponibles:   'Available',
    reserves:      'Reserved',
    occupes:       'Occupied',
    // Empty state
    empty_title:   'No housing found',
    empty_filter:  (f) => `No housing with status "${f}"`,
    empty_default: 'Start by adding your first housing',
    add_btn:       '➕ Add housing',
    // Actions
    view:          'View housing',
    edit:          'Edit',
    delete:        'Delete',
    confirm_del:   'Are you sure you want to delete this housing?',
    views_likes:   (v, l) => `${v} views | ${l} likes`,
  },
};

// ── Badges statut (traduits) ─────────────────────────────────
const STATUS_BADGES = {
  fr: {
    disponible: { text: 'Disponible', cls: 'status-available' },
    reserve:    { text: 'Réservé',    cls: 'status-reserved'  },
    occupe:     { text: 'Occupé',     cls: 'status-occupied'  },
  },
  en: {
    disponible: { text: 'Available', cls: 'status-available' },
    reserve:    { text: 'Reserved',  cls: 'status-reserved'  },
    occupe:     { text: 'Occupied',  cls: 'status-occupied'  },
  },
};

// ────────────────────────────────────────────────────────────
const HousingList = ({
  housings      = [],
  loading       = false,
  showActions   = false,
  onDelete,
  onEdit,
  onStatusChange,
}) => {
  // ── Langue depuis le contexte global ────────────────────
  const { language } = useTheme();
  const t            = T[language] || T.fr;
  const badges       = STATUS_BADGES[language] || STATUS_BADGES.fr;

  const [filteredHousings, setFilteredHousings] = useState([]);
  const [filter,  setFilter]  = useState('all');
  const [sortBy,  setSortBy]  = useState('recent');

  // Réappliquer les filtres quand les données ou la langue changent
  useEffect(() => {
    applyFilters();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [housings, filter, sortBy, language]);

  const applyFilters = () => {
    let list = [...housings];

    if (filter !== 'all') {
      list = list.filter(h => h.status === filter);
    }

    switch (sortBy) {
      case 'recent':
        list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case 'price_asc':
        list.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        list.sort((a, b) => b.price - a.price);
        break;
      case 'views':
        list.sort((a, b) => (b.views_count || 0) - (a.views_count || 0));
        break;
      case 'likes':
        list.sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0));
        break;
      default:
        break;
    }

    setFilteredHousings(list);
  };

  const getStatusBadge = (status) =>
    badges[status] || badges.disponible;

  const getStats = () => ({
    total:      housings.length,
    disponible: housings.filter(h => h.status === 'disponible').length,
    reserve:    housings.filter(h => h.status === 'reserve').length,
    occupe:     housings.filter(h => h.status === 'occupe').length,
  });

  // ── Chargement ────────────────────────────────────────────
  if (loading) {
    return <Loading message={t.loading} />;
  }

  const stats = getStats();

  return (
    <div className="housing-list-container">

      {/* ── Stats bar (mode dashboard) ── */}
      {showActions && (
        <div className="stats-bar">
          <div className="stat-item" onClick={() => setFilter('all')}>
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">{t.total}</div>
          </div>
          <div className="stat-item" onClick={() => setFilter('disponible')}>
            <div className="stat-value">{stats.disponible}</div>
            <div className="stat-label">{t.disponibles}</div>
          </div>
          <div className="stat-item" onClick={() => setFilter('reserve')}>
            <div className="stat-value">{stats.reserve}</div>
            <div className="stat-label">{t.reserves}</div>
          </div>
          <div className="stat-item" onClick={() => setFilter('occupe')}>
            <div className="stat-value">{stats.occupe}</div>
            <div className="stat-label">{t.occupes}</div>
          </div>
        </div>
      )}

      {/* ── Contrôles (statut + tri + compteur) ── */}
      <div className="list-controls">

        {/* Filtre statut */}
        <div className="filter-group">
          <label>{t.status_label}</label>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">{t.all}</option>
            <option value="disponible">{t.available}</option>
            <option value="reserve">{t.reserved}</option>
            <option value="occupe">{t.occupied}</option>
          </select>
        </div>

        {/* Tri */}
        <div className="filter-group">
          <label>{t.sort_label}</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="recent">{t.sort_recent}</option>
            <option value="price_asc">{t.sort_price_asc}</option>
            <option value="price_desc">{t.sort_price_dsc}</option>
            <option value="views">{t.sort_views}</option>
            <option value="likes">{t.sort_likes}</option>
          </select>
        </div>

        {/* Compteur */}
        <div className="result-count">
          {filteredHousings.length} {t.results}
        </div>
      </div>

      {/* ── Liste ou état vide ── */}
      {filteredHousings.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🏠</div>
          <h3>{t.empty_title}</h3>
          <p>
            {filter !== 'all'
              ? t.empty_filter(filter)
              : t.empty_default}
          </p>
          {showActions && (
            <Link to="/dashboard/ajouter-logement" className="add-btn">
              {t.add_btn}
            </Link>
          )}
        </div>
      ) : (
        <div className="housings-grid">
          {filteredHousings.map(housing => (
            <div key={housing.id} className="housing-item">
              <HousingCard housing={housing} />

              {/* ── Actions dashboard ── */}
              {showActions && (
                <div className="housing-actions">
                  <div className="status-section">
                    <span className={`status-badge ${getStatusBadge(housing.status).cls}`}>
                      {getStatusBadge(housing.status).text}
                    </span>
                    <select
                      value={housing.status}
                      onChange={(e) => onStatusChange?.(housing.id, e.target.value)}
                      className="status-select"
                    >
                      <option value="disponible">{t.available}</option>
                      <option value="reserve">{t.reserved}</option>
                      <option value="occupe">{t.occupied}</option>
                    </select>
                  </div>

                  <div className="action-buttons">
                    <button
                      className="action-btn view-btn"
                      onClick={() => window.open(`/logement/${housing.id}`, '_blank')}
                      title={t.view}
                    >
                      👁️
                    </button>
                    <button
                      className="action-btn edit-btn"
                      onClick={() => onEdit?.(housing.id)}
                      title={t.edit}
                    >
                      ✏️
                    </button>
                    <button
                      className="action-btn stats-btn"
                      title={t.views_likes(housing.views_count || 0, housing.likes_count || 0)}
                    >
                      📊
                    </button>
                    <button
                      className="action-btn delete-btn"
                      onClick={() => {
                        if (window.confirm(t.confirm_del)) {
                          onDelete?.(housing.id);
                        }
                      }}
                      title={t.delete}
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
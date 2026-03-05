// ============================================
// 📁 src/pages/SearchPage.jsx
// ============================================

import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import SearchBar from '../components/Search/SearchBar';
import FilterPanel from '../components/Search/FilterPanel';
import NearMeButton from '../components/Search/NearMeButton';
import ChatbotButton from '../components/Search/ChatbotButton';
import VoiceSearch from '../components/Search/VoiceSearch';
import HousingList from '../components/housing/HousingList';
import searchService from '../services/searchService';
import { Loader, MapPin, TrendingUp } from 'lucide-react';
import './SearchPage.css';

/**
 * Page de recherche complète
 */
const SearchPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [housings, setHousings] = useState([]);
  const [stats, setStats] = useState(null);
  const [filters, setFilters] = useState({});
  const [searchType, setSearchType] = useState('classic'); // 'classic', 'nearby', 'smart'
  const [userLocation, setUserLocation] = useState(null);
  const [error, setError] = useState(null);

  // Récupérer query params au chargement
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const initialFilters = {};
    
    params.forEach((value, key) => {
      initialFilters[key] = value;
    });

    if (Object.keys(initialFilters).length > 0) {
      setFilters(initialFilters);
      performSearch(initialFilters);
    } else {
      // Recherche par défaut
      performSearch({});
    }
  }, [location.search]);

  /**
   * Effectuer la recherche selon le type
   */
  const performSearch = async (searchFilters = {}) => {
    setLoading(true);
    setError(null);

    try {
      let results;

      // Déterminer le type de recherche
      if (searchFilters.lat && searchFilters.lng) {
        // Recherche géolocalisée intelligente
        setSearchType('smart');
        results = await searchService.smartSearch(searchFilters);
      } else if (Object.keys(searchFilters).length === 0) {
        // Recherche par défaut (tous les logements)
        results = await searchService.searchHousings({ status: 'disponible' });
      } else {
        // Recherche classique avec filtres
        setSearchType('classic');
        results = await searchService.searchHousings(searchFilters);
      }

      setHousings(results.results || []);
      setStats(results.stats || null);
      
      // Mettre à jour l'URL
      updateURL(searchFilters);
    } catch (err) {
      console.error('Erreur recherche:', err);
      setError('Erreur lors de la recherche. Veuillez réessayer.');
      setHousings([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Mise à jour de l'URL avec les filtres
   */
  const updateURL = (searchFilters) => {
    const params = new URLSearchParams();
    Object.entries(searchFilters).forEach(([key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        params.set(key, value);
      }
    });
    navigate(`/search?${params.toString()}`, { replace: true });
  };

  /**
   * Recherche textuelle
   */
  const handleSearch = (searchData) => {
    const newFilters = { ...filters, ...searchData };
    setFilters(newFilters);
    performSearch(newFilters);
  };

  /**
   * Recherche vocale
   */
  const handleVoiceTranscript = (transcript) => {
    handleSearch({ query: transcript });
  };

  /**
   * Résultats du chatbot
   */
  const handleChatbotResults = (results, criteria) => {
    setHousings(results);
    setFilters(criteria);
    setStats({ total_results: results.length });
  };

  /**
   * Application des filtres
   */
  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
    performSearch(newFilters);
  };

  /**
   * Recherche "Près de moi"
   */
  const handleNearbySearch = async (location) => {
    setUserLocation(location);
    
    const nearbyFilters = {
      ...filters,
      lat: location.lat,
      lng: location.lng,
      radius: 5 // 5 km par défaut
    };
    
    setFilters(nearbyFilters);
    performSearch(nearbyFilters);
  };

  /**
   * Tri des résultats
   */
  const handleSort = (sortBy) => {
    const sortedFilters = { ...filters, sortBy };
    setFilters(sortedFilters);
    performSearch(sortedFilters);
  };

  return (
    <div className="search-page">
      {/* En-tête de recherche */}
      <div className="search-header">
        <div className="container">
          <h1>Rechercher un logement</h1>
          
          {/* Barre de recherche */}
          <div className="search-controls">
            <SearchBar
              onSearch={handleSearch}
              loading={loading}
              placeholder="Rechercher par titre, ville, quartier..."
            />
            
            <div className="search-actions">
              <VoiceSearch
                onTranscript={handleVoiceTranscript}
                onError={(msg) => setError(msg)}
              />
              
              <NearMeButton
                onLocationFound={handleNearbySearch}
                onError={(msg) => setError(msg)}
              />
              
              <FilterPanel
                onApplyFilters={handleApplyFilters}
                initialFilters={filters}
              />
            </div>
            {/* Bouton flottant chatbot */}
      {/* <ChatbotButton onResultsFound={handleChatbotResults} /> */}
          </div>

          {/* Indicateur de géolocalisation */}
          {userLocation && (
            <div className="location-indicator">
              <MapPin size={16} />
              <span>Recherche autour de votre position</span>
            </div>
          )}
        </div>
      </div>

      {/* Contenu principal */}
      <div className="container search-content">
        {/* Statistiques */}
        {stats && (
          <div className="search-stats">
            <div className="stat-item">
              <span className="stat-label">Résultats</span>
              <span className="stat-value">{stats.total_results}</span>
            </div>
            {stats.avg_price > 0 && (
              <>
                <div className="stat-item">
                  <span className="stat-label">Prix moyen</span>
                  <span className="stat-value">
                    {Math.round(stats.avg_price).toLocaleString()} FCFA
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Fourchette</span>
                  <span className="stat-value">
                    {stats.min_price?.toLocaleString()} - {stats.max_price?.toLocaleString()} FCFA
                  </span>
                </div>
              </>
            )}
          </div>
        )}

        {/* Tri */}
        {/* {housings.length > 0 && (
          <div className="sort-controls">
            <label>Trier par :</label>
            <select
              value={filters.sortBy || 'recent'}
              onChange={(e) => handleSort(e.target.value)}
            >
              <option value="recent">Plus récents</option>
              <option value="price_asc">Prix croissant</option>
              <option value="price_desc">Prix décroissant</option>
              <option value="area_desc">Surface (grande → petite)</option>
              <option value="popular">Popularité</option>
              {searchType === 'smart' && <option value="score">Pertinence</option>}
            </select>
          </div>
        )} */}

        {/* Messages d'état */}
        {loading && (
          <div className="loading-state">
            <Loader className="spinner" size={40} />
            <p>Recherche en cours...</p>
          </div>
        )}

        {error && (
          <div className="error-state">
            <p>{error}</p>
            <button onClick={() => performSearch(filters)}>
              Réessayer
            </button>
          </div>
        )}

        {/* Résultats */}
        {!loading && !error && (
          <>
            {housings.length > 0 ? (
              <HousingList housings={housings} />
            ) : (
              <div className="empty-state">
                <TrendingUp size={48} />
                <h3>Aucun résultat</h3>
                <p>Essayez d'ajuster vos critères de recherche</p>
                <button onClick={() => {
                  setFilters({});
                  performSearch({});
                }}>
                  Réinitialiser la recherche
                </button>
              </div>
            )}
          </>
        )}
        {/* Bouton flottant chatbot */}
      <ChatbotButton onResultsFound={handleChatbotResults} />
      </div>

    </div>
  );
};

export default SearchPage;
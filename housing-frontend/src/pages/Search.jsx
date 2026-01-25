

// src/pages/Search.jsx - VERSION AMÉLIORÉE AVEC RECHERCHE VOCALE

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchService } from '../services/searchService';
import { useAuth } from '../contexts/AuthContext';
import HousingCard from '../components/housing/HousingCard';
import SearchBar from '../components/search/SearchBar';
import FilterPanel from '../components/search/FilterPanel';
import VoiceSearch from '../components/search/VoiceSearch';
import Chatbot from '../components/search/Chatbot';
import { FaThLarge, FaList, FaFilter, FaMicrophone } from 'react-icons/fa';
import { toast } from 'react-toastify';
import './Search.css';


const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  
  const [housings, setHousings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [showVoiceSearch, setShowVoiceSearch] = useState(false);
  
  const [filters, setFilters] = useState({
    searchTerm: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    housingType: searchParams.get('type') || '',
    city: searchParams.get('city') || '',
    district: searchParams.get('district') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    minArea: searchParams.get('minArea') || '',
    maxArea: searchParams.get('maxArea') || '',
    rooms: searchParams.get('rooms') || '',
    bathrooms: searchParams.get('bathrooms') || '',
    status: searchParams.get('status') || 'disponible',
    sortBy: searchParams.get('sortBy') || 'recent',
  });

  const [stats, setStats] = useState(null);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchSource, setSearchSource] = useState('manual'); // manual, voice, chatbot

  useEffect(() => {
    performSearch();
  }, [filters, currentPage]);

  const performSearch = async () => {
    setLoading(true);
    try {
      const searchFilters = {
        ...filters,
        page: currentPage,
        pageSize: 20
      };

      let result;
      
      // Si utilisateur connecté ET pas de filtres spécifiques, utiliser recommandations
      if (user && isDefaultSearch(filters)) {
        result = await searchService.getRecommendations(searchFilters);
      } else {
        // Sinon, recherche avancée avec stats
        result = await searchService.advancedSearch(searchFilters);
      }
      
      setHousings(result.results || []);
      setTotalResults(result.count || 0);
      setStats(result.stats || null);
    } catch (error) {
      console.error('Erreur recherche:', error);
      toast.error('Erreur lors de la recherche');
    } finally {
      setLoading(false);
    }
  };

  const isDefaultSearch = (filters) => {
    return !filters.searchTerm && !filters.category && !filters.city && 
           !filters.minPrice && !filters.maxPrice;
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
    setSearchSource('manual');
    
    // Mettre à jour l'URL
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    setSearchParams(params);
  };

  const handleResetFilters = () => {
    const resetFilters = {
      searchTerm: '',
      category: '',
      housingType: '',
      city: '',
      district: '',
      minPrice: '',
      maxPrice: '',
      minArea: '',
      maxArea: '',
      rooms: '',
      bathrooms: '',
      status: 'disponible',
      sortBy: 'recent',
    };
    setFilters(resetFilters);
    setCurrentPage(1);
    setSearchParams({});
    setSearchSource('manual');
  };

  const handleChatbotSearch = (chatbotFilters) => {
    const mergedFilters = { ...filters, ...chatbotFilters };
    setFilters(mergedFilters);
    setCurrentPage(1);
    setSearchSource('chatbot');
    
    // Mettre à jour l'URL
    const params = new URLSearchParams();
    Object.entries(mergedFilters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    setSearchParams(params);
  };

  // ✨ NOUVEAU: Gestionnaire pour la recherche vocale
  const handleVoiceSearchResult = async (voiceData) => {
    try {
      setLoading(true);
      setSearchSource('voice');
      
      // Si le backend retourne directement les résultats
      if (voiceData.results) {
        setHousings(voiceData.results);
        setTotalResults(voiceData.count || voiceData.results.length);
        
        // Mettre à jour les filtres pour l'affichage
        if (voiceData.filters) {
          const newFilters = { ...filters, ...voiceData.filters };
          setFilters(newFilters);
          
          // Mettre à jour l'URL
          const params = new URLSearchParams();
          Object.entries(newFilters).forEach(([key, value]) => {
            if (value) params.set(key, value);
          });
          setSearchParams(params);
        }
        
        toast.success(`${voiceData.count || voiceData.results.length} logement(s) trouvé(s)`);
      } 
      // Si on reçoit seulement les filtres
      else if (voiceData.filters) {
        handleFilterChange({ ...filters, ...voiceData.filters });
      }
    } catch (error) {
      console.error('Erreur traitement résultat vocal:', error);
      toast.error('Erreur lors du traitement des résultats');
    } finally {
      setLoading(false);
    }
  };

  // ✨ NOUVEAU: Gestionnaire changement de langue
  const handleLanguageChange = (newLanguage) => {
    console.log('Langue changée:', newLanguage);
    // Vous pouvez sauvegarder la préférence de langue ici
    localStorage.setItem('voice_search_language', newLanguage);
  };

  return (
    <div className="search-page">
      <div className="container">
        {/* Barre de recherche */}
        <div className="search-header">
          <SearchBar 
            filters={filters}
            onFilterChange={handleFilterChange}
          />
          
          {/* ✨ NOUVEAU: Bouton pour afficher/masquer recherche vocale */}
          <button
            className={`voice-search-toggle ${showVoiceSearch ? 'active' : ''}`}
            onClick={() => setShowVoiceSearch(!showVoiceSearch)}
            title="Recherche vocale"
          >
            <FaMicrophone />
            {showVoiceSearch ? 'Masquer' : 'Recherche vocale'}
          </button>
        </div>

        {/* ✨ NOUVEAU: Composant de recherche vocale */}
        {showVoiceSearch && (
          <div className="voice-search-section">
            <VoiceSearch 
              onSearchResult={handleVoiceSearchResult}
              onLanguageChange={handleLanguageChange}
            />
          </div>
        )}

        {/* Indicateur de source de recherche */}
        {searchSource !== 'manual' && (
          <div className="search-source-indicator">
            {searchSource === 'voice' && (
              <span className="source-badge voice">
                🎤 Recherche vocale
              </span>
            )}
            {searchSource === 'chatbot' && (
              <span className="source-badge chatbot">
                🤖 Assistant IA
              </span>
            )}
          </div>
        )}

        <div className="search-layout">
          {/* Sidebar Filtres (Desktop) */}
          <aside className={`search-sidebar ${showFilters ? 'mobile-visible' : ''}`}>
            <FilterPanel
              filters={filters}
              onFilterChange={handleFilterChange}
              onReset={handleResetFilters}
            />
          </aside>

          {/* Résultats */}
          <div className="search-results">
            {/* Header résultats */}
            <div className="results-header">
              <div className="results-info">
                <h2>
                  {totalResults} logement{totalResults > 1 ? 's' : ''} trouvé{totalResults > 1 ? 's' : ''}
                </h2>
                {user && isDefaultSearch(filters) && (
                  <span className="algo-badge">✨ Recommandations personnalisées</span>
                )}
              </div>

              <div className="results-actions">
                <button 
                  className="filter-toggle-mobile"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <FaFilter /> Filtres
                </button>

                <div className="view-toggle">
                  <button
                    className={viewMode === 'grid' ? 'active' : ''}
                    onClick={() => setViewMode('grid')}
                    title="Vue grille"
                  >
                    <FaThLarge />
                  </button>
                  <button
                    className={viewMode === 'list' ? 'active' : ''}
                    onClick={() => setViewMode('list')}
                    title="Vue liste"
                  >
                    <FaList />
                  </button>
                </div>
              </div>
            </div>

            {/* Statistiques */}
            {stats && (
              <div className="search-stats">
                <div className="stat-item">
                  <span className="stat-label">Prix moyen:</span>
                  <span className="stat-value">
                    {Math.round(stats.avg_price).toLocaleString()} FCFA
                  </span>
                </div>
                {stats.min_price && (
                  <div className="stat-item">
                    <span className="stat-label">Prix min:</span>
                    <span className="stat-value">
                      {Math.round(stats.min_price).toLocaleString()} FCFA
                    </span>
                  </div>
                )}
                {stats.max_price && (
                  <div className="stat-item">
                    <span className="stat-label">Prix max:</span>
                    <span className="stat-value">
                      {Math.round(stats.max_price).toLocaleString()} FCFA
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Grille de logements */}
            {loading ? (
              <div className="loading-container">
                <div className="spinner"></div>
                <p>Chargement des résultats...</p>
              </div>
            ) : housings.length === 0 ? (
              <div className="no-results">
                <div className="no-results-icon">🏠</div>
                <h3>Aucun logement trouvé</h3>
                <p>Essayez de modifier vos critères de recherche</p>
                
                <div className="suggestions">
                  <p>💡 Suggestions:</p>
                  <ul>
                    <li>Élargissez votre fourchette de prix</li>
                    <li>Changez de ville ou quartier</li>
                    <li>Réduisez le nombre de chambres requis</li>
                    <li>Essayez la recherche vocale 🎤</li>
                  </ul>
                </div>
                
                <button className="btn btn-primary" onClick={handleResetFilters}>
                  Réinitialiser les filtres
                </button>
              </div>
            ) : (
              <>
                <div className={`housing-grid ${viewMode}`}>
                  {housings.map(housing => (
                    <HousingCard key={housing.id} housing={housing} />
                  ))}
                </div>

                {/* Pagination */}
                {totalResults > 20 && (
                  <div className="pagination">
                    <button 
                      className="btn btn-outline"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(p => p - 1)}
                    >
                      ← Précédent
                    </button>
                    
                    <div className="page-info">
                      <span>Page {currentPage}</span>
                      <span className="separator">•</span>
                      <span>{totalResults} résultats</span>
                    </div>
                    
                    <button 
                      className="btn btn-outline"
                      disabled={housings.length < 20}
                      onClick={() => setCurrentPage(p => p + 1)}
                    >
                      Suivant →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Chatbot - avec intégration recherche vocale */}
      <Chatbot 
        onSearch={handleChatbotSearch}
        voiceSearchEnabled={true}
      />
      {/* <IntelligentSearchAssistant onSearch={handleChatbotSearch} /> */}

    </div>
  );
};

export default Search;
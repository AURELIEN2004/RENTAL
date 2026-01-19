// src/pages/Search.jsx - VERSION CORRIGÉE

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchService } from '../services/searchService';
import { useAuth } from '../contexts/AuthContext';
import HousingCard from '../components/housing/HousingCard';
import SearchBar from '../components/search/SearchBar';
import FilterPanel from '../components/search/FilterPanel';
import IntelligentChatbot from '../components/search/Chatbot';
import { FaThLarge, FaList, FaFilter } from 'react-icons/fa';
import { toast } from 'react-toastify';
import './Search.css';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  
  const [housings, setHousings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  
  // Initialiser les filtres depuis l'URL
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

  // Lancer la recherche au changement de filtres ou de page
  useEffect(() => {
    performSearch();
  }, [filters, currentPage]);

  const performSearch = async () => {
    console.log('🔍 Recherche avec filtres:', filters);
    
    setLoading(true);
    try {
      const searchFilters = {
        ...filters,
        page: currentPage,
        pageSize: 20
      };

      let result;
      
      // Si utilisateur connecté ET recherche par défaut, utiliser recommandations
      if (user && isDefaultSearch(filters)) {
        result = await searchService.getRecommendations(searchFilters);
      } else {
        // Sinon, recherche avancée avec stats
        result = await searchService.advancedSearch(searchFilters);
      }
      
      console.log('✅ Résultats:', result);
      
      setHousings(result.results || []);
      setTotalResults(result.count || 0);
      setStats(result.stats || null);
    } catch (error) {
      console.error('❌ Erreur recherche:', error);
      toast.error('Erreur lors de la recherche');
      setHousings([]);
    } finally {
      setLoading(false);
    }
  };

  const isDefaultSearch = (filters) => {
    return !filters.searchTerm && !filters.category && !filters.city && 
           !filters.minPrice && !filters.maxPrice;
  };

  // ✅ CORRECTION: Fonction de changement de filtres
  const handleFilterChange = (newFilters) => {
    console.log('🔄 Nouveaux filtres:', newFilters);
    
    setFilters(newFilters);
    setCurrentPage(1);
    
    // Mettre à jour l'URL
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    setSearchParams(params);
  };

  // ✅ CORRECTION: Fonction de recherche depuis SearchBar
  const handleSearch = (searchData) => {
    console.log('🔍 Recherche depuis SearchBar:', searchData);
    
    const newFilters = {
      ...filters,
      searchTerm: searchData.searchTerm || '',
      city: searchData.city || '',
      category: searchData.category || ''
    };
    
    handleFilterChange(newFilters);
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
    handleFilterChange(resetFilters);
  };

  const handleChatbotSearch = (chatbotFilters) => {
    console.log('🤖 Recherche depuis Chatbot:', chatbotFilters);
    const mergedFilters = { ...filters, ...chatbotFilters };
    handleFilterChange(mergedFilters);
  };

  return (
    <div className="search-page">
      <div className="container">
        {/* Barre de recherche */}
        <div className="search-header">
          <SearchBar 
            onSearch={handleSearch}
            initialFilters={filters}
          />
        </div>

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
                  >
                    <FaThLarge />
                  </button>
                  <button
                    className={viewMode === 'list' ? 'active' : ''}
                    onClick={() => setViewMode('list')}
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
              </div>
            )}

            {/* Grille de logements */}
            {loading ? (
              <div className="loading">
                <div className="spinner"></div>
                <p>Recherche en cours...</p>
              </div>
            ) : housings.length === 0 ? (
              <div className="no-results">
                <div className="no-results-icon">🏠</div>
                <h3>Aucun logement trouvé</h3>
                <p>Essayez de modifier vos critères de recherche</p>
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
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(p => p - 1)}
                    >
                      Précédent
                    </button>
                    <span>Page {currentPage}</span>
                    <button 
                      disabled={housings.length < 20}
                      onClick={() => setCurrentPage(p => p + 1)}
                    >
                      Suivant
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Chatbot */}
      <IntelligentChatbot onSearch={handleChatbotSearch} />
    </div>
  );
};

export default Search;
// // ============================================
// // 📁 src/pages/SearchPage.jsx
// // ============================================


import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import SearchBar from '../components/search/SearchBar';
import AdvancedFilters from '../components/search/AdvancedFilters';
import HousingList from '../components/housing/HousingList';
// import Pagination from '../components/common/Pagination';
import searchService from '../services/searchService';
import './SearchPage.css';
import ChatbotAssistant from '../components/Search/ChatbotAssistant';

const SearchPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    city: '',
    district: '',
    housingType: '',
    minPrice: '',
    maxPrice: '',
    minSurface: '',
    maxSurface: '',
    bedrooms: '',
    bathrooms: '',
    hasParking: false,
    hasGarden: false,
    hasPool: false,
    isFurnished: false
  });
  
  const [housings, setHousings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [savedFilters, setSavedFilters] = useState([]);

  // Charger les filtres sauvegardés au montage
  useEffect(() => {
    loadSavedFilters();
  }, []);

  // Effectuer la recherche quand les filtres changent
  useEffect(() => {
    performSearch();
  }, [filters, currentPage]);

  const loadSavedFilters = async () => {
    try {
      const filters = await searchService.getSavedFilters();
      setSavedFilters(filters);
    } catch (error) {
      console.error('Error loading saved filters:', error);
    }
  };

  const performSearch = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const results = await searchService.search({
        ...filters,
        page: currentPage
      });
      
      setHousings(results.housings || []);
      setTotalPages(Math.ceil((results.total || 0) / 12));
    } catch (error) {
      console.error('Search error:', error);
      setError('Erreur lors de la recherche. Veuillez réessayer.');
      setHousings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    setFilters(prev => ({ ...prev }));
    setCurrentPage(1);
  };

  const handleVoiceSearch = (transcript) => {
    setSearchQuery(transcript);
    setFilters(prev => ({ ...prev }));
    setCurrentPage(1);
  };

  const handleFiltersChange = (newFilters) => {
    // Mise à jour des filtres SANS appeler performSearch
    // performSearch sera appelé automatiquement par useEffect
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveFilters = async () => {
    try {
      await searchService.saveFilters(filters);
      alert('Filtres sauvegardés avec succès!');
      loadSavedFilters();
    } catch (error) {
      console.error('Error saving filters:', error);
      alert('Erreur lors de la sauvegarde des filtres');
    }
  };

  const handleLoadSavedFilter = (savedFilter) => {
    setFilters(savedFilter.filters);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setFilters({
      category: '',
      city: '',
      district: '',
      housingType: '',
      minPrice: '',
      maxPrice: '',
      minSurface: '',
      maxSurface: '',
      bedrooms: '',
      bathrooms: '',
      hasParking: false,
      hasGarden: false,
      hasPool: false,
      isFurnished: false
    });
    setSearchQuery('');
    setCurrentPage(1);
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  return (
    <div className="search-page">
      <div className="search-page-header">
        <h1>Recherche de logements</h1>
        <SearchBar 
          onSearch={handleSearch}
          onVoiceSearch={handleVoiceSearch}
          placeholder="Rechercher un logement..."
        />
      </div>

      <div className="search-page-content">
        <div className={`filters-sidebar ${showFilters ? 'show' : ''}`}>
          <div className="filters-header">
            <h2>Filtres</h2>
            <button 
              className="close-filters-btn"
              onClick={toggleFilters}
            >
              ✕
            </button>
          </div>
          
          <AdvancedFilters 
            filters={filters}
            onFiltersChange={handleFiltersChange}
          />
          
          <div className="filters-actions">
            <button 
              className="btn btn-secondary"
              onClick={handleResetFilters}
            >
              Réinitialiser
            </button>
            <button 
              className="btn btn-primary"
              onClick={handleSaveFilters}
            >
              Sauvegarder
            </button>
          </div>

          {savedFilters.length > 0 && (
            <div className="saved-filters">
              <h3>Recherches sauvegardées</h3>
              <ul>
                {savedFilters.map((saved, index) => (
                  <li key={index}>
                    <button
                      onClick={() => handleLoadSavedFilter(saved)}
                      className="saved-filter-btn"
                    >
                      {saved.name || `Recherche ${index + 1}`}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="search-results">
          <div className="results-header">
            <button 
              className="toggle-filters-btn"
              onClick={toggleFilters}
            >
              <span className="icon">⚙️</span>
              Filtres
            </button>
            
            <div className="results-count">
              {loading ? (
                'Recherche en cours...'
              ) : (
                `${housings.length} logement${housings.length > 1 ? 's' : ''} trouvé${housings.length > 1 ? 's' : ''}`
              )}
            </div>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {loading ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Recherche en cours...</p>
            </div>
          ) : housings.length > 0 ? (
            <>
              <HousingList housings={housings} />
              
              {totalPages > 1 && (
                <Pagination 
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              )}
            </>
          ) : (
            <div className="no-results">
              <div className="no-results-icon">🏠</div>
              <h3>Aucun logement trouvé</h3>
              <p>Essayez de modifier vos critères de recherche</p>
              <button 
                className="btn btn-primary"
                onClick={handleResetFilters}
              >
                Réinitialiser les filtres
              </button>
            </div>
          )}
                      <ChatbotAssistant />

        </div>
      </div>
    </div>
  );
};

export default SearchPage;

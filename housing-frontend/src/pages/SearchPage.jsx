// ============================================
// 📁 src/pages/SearchPage.jsx
// Page principale de recherche
// ============================================

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import SearchBar from '../components/search/SearchBar';
import AdvancedFilters from '../components/search/AdvancedFilters';
import ChatbotAssistant from '../components/search/ChatbotAssistant';
import searchService from '../services/searchService';
import { 
  Grid, List, Loader, AlertCircle, Bookmark, 
  Save, MapPin, Bed, Maximize, Eye 
} from 'lucide-react';
import './SearchPage.css';

const SearchPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [language, setLanguage] = useState('fr');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  
  // États de recherche
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [filters, setFilters] = useState({});
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize] = useState(20);

  // Filtres sauvegardés
  const [savedFilters, setSavedFilters] = useState([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  // Charger filtres sauvegardés au montage
  useEffect(() => {
    loadSavedFilters();
  }, []);

  // Effectuer recherche initiale si paramètres URL
  useEffect(() => {
    const query = searchParams.get('q');
    if (query) {
      performSearch(query, filters);
    }
  }, []);

  const loadSavedFilters = async () => {
    try {
      const data = await searchService.getSavedFilters();
      setSavedFilters(data);
    } catch (error) {
      console.error('Error loading saved filters:', error);
    }
  };

  const performSearch = async (query = searchQuery, currentFilters = filters) => {
    setIsLoading(true);
    setError(null);

    try {
      const searchFilters = {
        ...currentFilters,
        query: query || undefined,
        page: currentPage,
        page_size: pageSize,
      };

      const data = await searchService.advancedSearch(searchFilters);

      setResults(data.results || []);
      setTotalCount(data.count || 0);
      setTotalPages(data.total_pages || 1);

      // Mettre à jour URL
      if (query) {
        setSearchParams({ q: query });
      }

    } catch (err) {
      console.error('Search error:', err);
      setError(
        language === 'fr'
          ? 'Erreur lors de la recherche. Veuillez réessayer.'
          : 'Search error. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    setCurrentPage(1);
    await performSearch(query, filters);
  };

  const handleVoiceSearch = async (voiceResult) => {
    setSearchQuery(voiceResult.transcription);
    setResults(voiceResult.results || []);
    setTotalCount(voiceResult.results_count || 0);
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleApplyFilters = async () => {
    setCurrentPage(1);
    await performSearch(searchQuery, filters);
  };

  const handlePageChange = async (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Effectuer nouvelle recherche avec nouvelle page
    const searchFilters = {
      ...filters,
      query: searchQuery || undefined,
      page,
      page_size: pageSize,
    };

    try {
      setIsLoading(true);
      const data = await searchService.advancedSearch(searchFilters);
      setResults(data.results || []);
    } catch (error) {
      console.error('Pagination error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveFilters = async (name) => {
    try {
      await searchService.createSavedFilter({
        name,
        filters: { ...filters, query: searchQuery },
        notify_new_results: true,
      });
      
      setShowSaveDialog(false);
      loadSavedFilters();
      
      alert(
        language === 'fr'
          ? 'Filtre sauvegardé avec succès !'
          : 'Filter saved successfully!'
      );
    } catch (error) {
      console.error('Save filter error:', error);
      alert(
        language === 'fr'
          ? 'Erreur lors de la sauvegarde'
          : 'Error saving filter'
      );
    }
  };

  const handleApplySavedFilter = async (filterId) => {
    try {
      const data = await searchService.applySavedFilter(filterId);
      setResults(data.results || []);
      setTotalCount(data.count || 0);
      setFilters(data.filters || {});
    } catch (error) {
      console.error('Apply filter error:', error);
    }
  };

  const handleHousingClick = (housingId) => {
    navigate(`/housing/${housingId}`);
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="pagination">
        <button
          className="page-btn"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          {language === 'fr' ? 'Précédent' : 'Previous'}
        </button>

        {startPage > 1 && (
          <>
            <button className="page-number" onClick={() => handlePageChange(1)}>
              1
            </button>
            {startPage > 2 && <span className="page-dots">...</span>}
          </>
        )}

        {pages.map(page => (
          <button
            key={page}
            className={`page-number ${page === currentPage ? 'active' : ''}`}
            onClick={() => handlePageChange(page)}
          >
            {page}
          </button>
        ))}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="page-dots">...</span>}
            <button 
              className="page-number" 
              onClick={() => handlePageChange(totalPages)}
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          className="page-btn"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          {language === 'fr' ? 'Suivant' : 'Next'}
        </button>
      </div>
    );
  };

  return (
    <div className="search-page">
      {/* Header de recherche */}
      <div className="search-header">
        <div className="container">
          <h1 className="page-title">
            {language === 'fr' 
              ? '🔍 Rechercher un logement' 
              : '🔍 Search Housing'}
          </h1>

          <SearchBar
            onSearch={handleSearch}
            onVoiceSearch={handleVoiceSearch}
            language={language}
          />

          <AdvancedFilters
            onFiltersChange={handleFiltersChange}
            initialFilters={filters}
            language={language}
          />

          <div className="search-actions">
            <button
              className="action-btn primary"
              onClick={handleApplyFilters}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader className="spinner" size={16} />
                  {language === 'fr' ? 'Recherche...' : 'Searching...'}
                </>
              ) : (
                <>
                  {language === 'fr' ? 'Appliquer les filtres' : 'Apply filters'}
                </>
              )}
            </button>

            <button
              className="action-btn"
              onClick={() => setShowSaveDialog(true)}
              disabled={Object.keys(filters).length === 0 && !searchQuery}
            >
              <Save size={16} />
              {language === 'fr' ? 'Sauvegarder' : 'Save'}
            </button>
          </div>

          {/* Filtres sauvegardés */}
          {savedFilters.length > 0 && (
            <div className="saved-filters">
              <p className="saved-filters-label">
                {language === 'fr' ? 'Filtres sauvegardés:' : 'Saved filters:'}
              </p>
              <div className="saved-filters-list">
                {savedFilters.map(filter => (
                  <button
                    key={filter.id}
                    className="saved-filter-btn"
                    onClick={() => handleApplySavedFilter(filter.id)}
                  >
                    <Bookmark size={14} />
                    {filter.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Résultats */}
      <div className="search-results">
        <div className="container">
          {/* Barre d'outils résultats */}
          {results.length > 0 && (
            <div className="results-toolbar">
              <div className="results-count">
                {totalCount} {language === 'fr' ? 'logement(s)' : 'housing(s)'}
              </div>

              <div className="view-toggle">
                <button
                  className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                >
                  <Grid size={18} />
                </button>
                <button
                  className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                >
                  <List size={18} />
                </button>
              </div>
            </div>
          )}

          {/* Loading */}
          {isLoading && (
            <div className="loading-container">
              <Loader className="spinner large" size={48} />
              <p>{language === 'fr' ? 'Recherche en cours...' : 'Searching...'}</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="error-container">
              <AlertCircle size={48} />
              <p>{error}</p>
              <button onClick={() => performSearch(searchQuery, filters)}>
                {language === 'fr' ? 'Réessayer' : 'Try again'}
              </button>
            </div>
          )}

          {/* Résultats */}
          {!isLoading && !error && results.length > 0 && (
            <>
              <div className={`results-grid ${viewMode}`}>
                {results.map(housing => (
                  <div
                    key={housing.id}
                    className="housing-card"
                    onClick={() => handleHousingClick(housing.id)}
                  >
                    {housing.main_image && (
                      <div className="card-image-container">
                        <img 
                          src={housing.main_image} 
                          alt={housing.title}
                          className="card-image"
                        />
                        {housing.status && (
                          <span className={`status-badge ${housing.status}`}>
                            {housing.status}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="card-content">
                      <h3 className="card-title">{housing.title}</h3>
                      
                      <p className="card-price">
                        {housing.price?.toLocaleString()} FCFA
                        {housing.category_name && (
                          <span className="price-period">
                            /{housing.category_name.toLowerCase()}
                          </span>
                        )}
                      </p>

                      <p className="card-location">
                        <MapPin size={14} />
                        {housing.district_name}, {housing.city_name}
                      </p>

                      <div className="card-features">
                        {housing.rooms && (
                          <span className="feature">
                            <Bed size={14} />
                            {housing.rooms} {language === 'fr' ? 'ch.' : 'beds'}
                          </span>
                        )}
                        {housing.area && (
                          <span className="feature">
                            <Maximize size={14} />
                            {housing.area}m²
                          </span>
                        )}
                        {housing.views_count && (
                          <span className="feature">
                            <Eye size={14} />
                            {housing.views_count}
                          </span>
                        )}
                      </div>

                      {housing.description && (
                        <p className="card-description">
                          {housing.description.substring(0, 100)}...
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {renderPagination()}
            </>
          )}

          {/* Aucun résultat */}
          {!isLoading && !error && results.length === 0 && searchQuery && (
            <div className="no-results">
              <AlertCircle size={48} />
              <h3>
                {language === 'fr' 
                  ? 'Aucun logement trouvé' 
                  : 'No housing found'}
              </h3>
              <p>
                {language === 'fr'
                  ? 'Essayez de modifier vos critères de recherche'
                  : 'Try modifying your search criteria'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Chatbot Assistant */}
      <ChatbotAssistant
        language={language}
        onLanguageChange={setLanguage}
        onHousingClick={handleHousingClick}
      />

      {/* Dialog sauvegarder filtre */}
      {showSaveDialog && (
        <div className="modal-overlay" onClick={() => setShowSaveDialog(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>
              {language === 'fr' 
                ? 'Sauvegarder cette recherche' 
                : 'Save this search'}
            </h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const name = e.target.filterName.value;
                if (name) handleSaveFilters(name);
              }}
            >
              <input
                type="text"
                name="filterName"
                placeholder={
                  language === 'fr' 
                    ? 'Nom du filtre...' 
                    : 'Filter name...'
                }
                required
                autoFocus
              />
              <div className="modal-actions">
                <button type="button" onClick={() => setShowSaveDialog(false)}>
                  {language === 'fr' ? 'Annuler' : 'Cancel'}
                </button>
                <button type="submit" className="primary">
                  {language === 'fr' ? 'Sauvegarder' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchPage;
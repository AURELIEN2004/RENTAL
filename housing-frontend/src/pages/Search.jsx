
// ============================================
// src/pages/Search.jsx - Page de recherche
// ============================================

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { housingService } from '../services/housingService';
import { useAuth } from '../contexts/AuthContext';
import HousingCard from '../components/housing/HousingCard';
import SearchBar from '../components/search/SearchBar';
import FilterPanel from '../components/search/FilterPanel';
import { FaThLarge, FaList } from 'react-icons/fa';
import './Search.css';

const Search = () => {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [housings, setHousings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [filters, setFilters] = useState({});
  const [totalResults, setTotalResults] = useState(0);

  useEffect(() => {
    loadHousings();
  }, [filters, user]);

  const loadHousings = async () => {
    setLoading(true);
    try {
      let result;
      
      // Si utilisateur connecté, utiliser l'algorithme génétique
      if (user) {
        result = await housingService.getRecommendedHousings();
      } else {
        // Sinon, recherche normale avec filtres
        result = await housingService.getHousings(filters);
      }
      
      setHousings(Array.isArray(result) ? result : result.results || []);
      setTotalResults(result.count || result.length || 0);
    } catch (error) {
      console.error('Error loading housings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (searchData) => {
    setFilters(prev => ({ ...prev, ...searchData }));
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleResetFilters = () => {
    setFilters({});
  };

  return (
    <div className="search-page">
      <div className="container">
        {/* Barre de recherche */}
        <div className="search-header">
          <SearchBar onSearch={handleSearch} showFilters={true} />
        </div>

        <div className="search-content">
          {/* Sidebar Filtres */}
          <aside className="search-sidebar">
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
              <div className="results-count">
                {totalResults} logement{totalResults > 1 ? 's' : ''} trouvé{totalResults > 1 ? 's' : ''}
                {user && <span className="algo-badge">✨ Recommandés pour vous</span>}
              </div>

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

            {/* Grille de logements */}
            {loading ? (
              <div className="loading">Chargement des résultats...</div>
            ) : housings.length === 0 ? (
              <div className="no-results">
                <p>Aucun logement trouvé pour ces critères</p>
                <button className="btn btn-outline" onClick={handleResetFilters}>
                  Réinitialiser les filtres
                </button>
              </div>
            ) : (
              <div className={`housing-grid ${viewMode}`}>
                {housings.map(housing => (
                  <HousingCard key={housing.id} housing={housing} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Search;


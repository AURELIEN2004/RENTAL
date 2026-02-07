

// ============================================
// 📁 pages/SearchPage.jsx - VERSION MODERNE CORRIGÉE
// ============================================

import { useState } from "react";
import HousingList from "../components/housing/HousingList";
import { searchHousing } from "../services/housingService";
import { assistantSearch } from "../services/chatbotService";
import SearchBar from "../components/Search/SearchBar";
import FilterPanel from "../components/Search/FilterPanel";
import ChatbotModal from "../components/chatbot/ChatbotModal";
import NearMeButton from "../components/Search/NearMeButton";

const SearchPage = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchInfo, setSearchInfo] = useState(null);
  
  // États pour les modales/panneaux
  const [showFilters, setShowFilters] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);
  
  // État de la recherche
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState({
    category: "",
    region: "",
    city: "",
    district: "",
    min_price: "",
    max_price: "",
    furnished: "",
  });

  // 🔍 Recherche principale - VERSION CORRIGÉE
  const handleSearch = async (searchQuery = query, searchFilters = filters) => {
    setLoading(true);
    setSearchInfo(null);
    
    try {
      // ✅ Utiliser les filtres passés en paramètre (pas le state)
      const params = { ...searchFilters };
      if (searchQuery && searchQuery.trim()) {
        params.query = searchQuery.trim();
      }

      // const res = await searchHousing(params);
      // setResults(res.data);
      const res = await searchHousing(params);
setResults(res.data.results || res.data);

      
      setSearchInfo({
        type: 'classic',
        query: searchQuery,
        count: res.data.length
      });
    } catch (error) {
      console.error("Erreur recherche:", error);
      alert("Erreur lors de la recherche. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  // 🤖 Recherche via assistant
  const handleAssistantSearch = async (message) => {
    setLoading(true);
    setSearchInfo(null);
    
    try {
      const res = await assistantSearch(message);
      setResults(res.data.results || res.data);
      
      setSearchInfo({
        type: 'assistant',
        message: message,
        filters: res.data.filters || {},
        count: (res.data.results || res.data).length,
        suggestion: res.data.suggestion
      });
      
      // Fermer le chatbot après recherche
      setShowChatbot(false);
    } catch (error) {
      console.error("Erreur recherche assistant:", error);
      alert("Erreur lors de la recherche assistée.");
    } finally {
      setLoading(false);
    }
  };

  // 📍 Recherche près de moi
  const handleNearbySearch = (nearbyResults) => {
    setResults(nearbyResults);
    setSearchInfo({
      type: 'nearby',
      count: nearbyResults.length
    });
  };

  // 🔧 Application des filtres - VERSION CORRIGÉE
  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
    setShowFilters(false);
    // ✅ Passer directement newFilters (pas attendre le state)
    handleSearch(query, newFilters);
  };

  // 🧹 Réinitialisation
  const handleReset = () => {
    setQuery("");
    const emptyFilters = {
      category: "",
      region: "",
      city: "",
      district: "",
      min_price: "",
      max_price: "",
      furnished: "",
    };
    setFilters(emptyFilters);
    setResults([]);
    setSearchInfo(null);
  };

  // Compter les filtres actifs
  const activeFiltersCount = Object.values(filters).filter(v => v !== "").length;

  return (
    <div className="search-page-modern">
      {/* 🎨 HEADER */}
      <header className="page-header">
        <div className="header-content">
          <h1>🏠 Trouve ton logement</h1>
          <p>Recherche intelligente de logements au Cameroun</p>
        </div>
      </header>

      {/* 🔍 BARRE DE RECHERCHE PRINCIPALE */}
      <section className="search-main">
        <div className="search-container">
          {/* Barre de recherche */}
          <SearchBar 
            query={query}
            setQuery={setQuery}
            onSearch={() => handleSearch(query, filters)}
          />

          {/* Boutons d'action */}
          <div className="search-actions">
            <button 
              className="btn-action btn-filters"
              onClick={() => setShowFilters(!showFilters)}
            >
              <span className="btn-icon">🔧</span>
              <span>Filtres</span>
              {activeFiltersCount > 0 && (
                <span className="badge">{activeFiltersCount}</span>
              )}
            </button>

            <button 
              className="btn-action btn-assistant"
              onClick={() => setShowChatbot(!showChatbot)}
            >
              <span className="btn-icon">🤖</span>
              <span>Assistant</span>
            </button>

            <NearMeButton onResults={handleNearbySearch} />

            {(query || activeFiltersCount > 0) && (
              <button 
                className="btn-action btn-reset"
                onClick={handleReset}
              >
                <span className="btn-icon">🔄</span>
                <span>Réinitialiser</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 🔧 PANNEAU DE FILTRES */}
      {showFilters && (
        <FilterPanel
          filters={filters}
          onApply={handleApplyFilters}
          onClose={() => setShowFilters(false)}
        />
      )}

      {/* 🤖 MODAL CHATBOT */}
      {showChatbot && (
        <ChatbotModal
          onSearch={handleAssistantSearch}
          onClose={() => setShowChatbot(false)}
        />
      )}

      {/* 📊 INFORMATIONS SUR LA RECHERCHE */}
      {searchInfo && (
        <div className="search-info-bar">
          <div className="info-content">
            {searchInfo.type === 'classic' && (
              <p>
                📊 <strong>{searchInfo.count}</strong> logement(s) trouvé(s)
                {searchInfo.query && ` pour "${searchInfo.query}"`}
              </p>
            )}
            
            {searchInfo.type === 'assistant' && (
              <div className="assistant-info">
                <p>
                  🤖 <strong>{searchInfo.count}</strong> résultat(s) : 
                  "<em>{searchInfo.message}</em>"
                </p>
                {searchInfo.filters && Object.keys(searchInfo.filters).length > 0 && (
                  <div className="filters-detected">
                    {searchInfo.filters.category && <span className="filter-tag">📦 {searchInfo.filters.category}</span>}
                    {searchInfo.filters.city && <span className="filter-tag">📍 {searchInfo.filters.city}</span>}
                    {searchInfo.filters.district && <span className="filter-tag">🏘️ {searchInfo.filters.district}</span>}
                    {searchInfo.filters.max_price && <span className="filter-tag">💰 Max {searchInfo.filters.max_price} FCFA</span>}
                    {searchInfo.filters.furnished !== undefined && (
                      <span className="filter-tag">🛋️ {searchInfo.filters.furnished ? 'Meublé' : 'Non meublé'}</span>
                    )}
                  </div>
                )}
                {searchInfo.suggestion && (
                  <p className="suggestion-text">
                    💡 {searchInfo.suggestion}
                  </p>
                )}
              </div>
            )}

            {searchInfo.type === 'nearby' && (
              <p>
                📍 <strong>{searchInfo.count}</strong> logement(s) près de vous
              </p>
            )}
          </div>
        </div>
      )}

      {/* 📦 RÉSULTATS */}
      <section className="results-section">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Recherche en cours...</p>
          </div>
        ) : results.length === 0 && searchInfo ? (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h3>Aucun logement trouvé</h3>
            <p>Essayez de modifier vos critères de recherche</p>
            <button className="btn-primary" onClick={handleReset}>
              Nouvelle recherche
            </button>
          </div>
        ) : (
          <HousingList housings={results} />
        )}
      </section>
    </div>
  );
};

export default SearchPage;
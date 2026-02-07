
// ============================================
// 📁 components/search/SearchBar.jsx - VERSION MODERNE
// ============================================

import { useState } from "react";

const SearchBar = ({ query, setQuery, onSearch }) => {
  const [focused, setFocused] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <div className={`search-bar ${focused ? 'focused' : ''}`}>
      <form onSubmit={handleSubmit} className="search-form-inline">
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input-main"
            placeholder="Ex: studio à Yaoundé, appartement Bastos, maison..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyPress={handleKeyPress}
          />
          {query && (
            <button
              type="button"
              className="clear-button"
              onClick={() => setQuery("")}
              aria-label="Effacer"
            >
              ✕
            </button>
          )}
        </div>
        <button type="submit" className="search-submit">
          Rechercher
        </button>
      </form>

      {/* Suggestions rapides (optionnel) */}
      {focused && !query && (
        <div className="quick-suggestions">
          <span className="suggestion-label">Suggestions :</span>
          <button 
            type="button"
            className="suggestion-chip"
            onClick={() => setQuery("studio yaoundé")}
          >
            Studio Yaoundé
          </button>
          <button 
            type="button"
            className="suggestion-chip"
            onClick={() => setQuery("appartement douala")}
          >
            Appartement Douala
          </button>
          <button 
            type="button"
            className="suggestion-chip"
            onClick={() => setQuery("maison bastos")}
          >
            Maison Bastos
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
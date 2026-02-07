// ============================================
// 📁 src/components/Search/SearchBar.jsx
// ============================================

import { useState } from 'react';
import { Search, Loader } from 'lucide-react';

/**
 * Barre de recherche principale
 */
const SearchBar = ({ onSearch, placeholder = "Rechercher un logement...", loading = false }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch({ query: query.trim() });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="search-bar">
      <div className="search-input-wrapper">
        <Search className="search-icon" size={20} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          className="search-input"
          disabled={loading}
        />
        {loading && <Loader className="loading-spinner" size={20} />}
        <button 
          type="submit" 
          className="search-button"
          disabled={loading || !query.trim()}
        >
          Rechercher
        </button>
      </div>
    </form>
  );
};

export default SearchBar;
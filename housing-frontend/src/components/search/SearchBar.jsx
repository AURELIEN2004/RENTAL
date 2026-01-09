
// ============================================
// src/components/search/SearchBar.jsx
// ============================================

import React, { useState } from 'react';
import { FaSearch, FaMapMarkerAlt, FaHome } from 'react-icons/fa';
import './SearchBar.css';

const SearchBar = ({ onSearch, showFilters = true }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [city, setCity] = useState('');
  const [category, setCategory] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch({ searchTerm, city, category });
  };

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <div className="search-bar-container">
        {/* Recherche textuelle */}
        <div className="search-input-group">
          <FaSearch className="input-icon" />
          <input
            type="text"
            placeholder="Rechercher un logement..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        {showFilters && (
          <>
            {/* Ville */}
            <div className="search-input-group">
              <FaMapMarkerAlt className="input-icon" />
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="search-select"
              >
                <option value="">Toutes les villes</option>
                <option value="yaounde">Yaoundé</option>
                <option value="douala">Douala</option>
                <option value="bafoussam">Bafoussam</option>
                {/* Autres villes depuis l'API */}
              </select>
            </div>

            {/* Catégorie */}
            <div className="search-input-group">
              <FaHome className="input-icon" />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="search-select"
              >
                <option value="">Toutes catégories</option>
                <option value="studio">Studio</option>
                <option value="chambre">Chambre</option>
                <option value="appartement">Appartement</option>
                <option value="maison">Maison</option>
              </select>
            </div>
          </>
        )}

        {/* Bouton recherche */}
        <button type="submit" className="search-btn">
          <FaSearch /> Rechercher
        </button>
      </div>
    </form>
  );
};

export default SearchBar;

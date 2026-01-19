// src/components/search/SearchBar.jsx - VERSION CORRIGÉE

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaMapMarkerAlt, FaHome } from 'react-icons/fa';
import api from '../../services/api';
import './SearchBar.css';

const SearchBar = ({ onSearch, showFilters = true, initialFilters = {} }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState(initialFilters.searchTerm || '');
  const [city, setCity] = useState(initialFilters.city || '');
  const [category, setCategory] = useState(initialFilters.category || '');
  
  // Listes dynamiques
  const [cities, setCities] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadOptions();
  }, []);

  const loadOptions = async () => {
    try {
      const [citiesRes, categoriesRes] = await Promise.all([
        api.get('/cities/'),
        api.get('/categories/')
      ]);

      setCities(citiesRes.data.results || citiesRes.data || []);
      setCategories(categoriesRes.data.results || categoriesRes.data || []);
    } catch (error) {
      console.error('Erreur chargement options:', error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const searchData = {
      searchTerm: searchTerm.trim(),
      city: city,
      category: category
    };

    console.log('🔍 Recherche lancée avec:', searchData);

    // Si onSearch est fourni (depuis la page Search), l'utiliser
    if (onSearch) {
      onSearch(searchData);
    } else {
      // Sinon, naviguer vers la page de recherche avec les paramètres
      const params = new URLSearchParams();
      if (searchData.searchTerm) params.set('search', searchData.searchTerm);
      if (searchData.city) params.set('city', searchData.city);
      if (searchData.category) params.set('category', searchData.category);
      
      navigate(`/search?${params.toString()}`);
    }
  };

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <div className="search-bar-container">
        {/* Recherche textuelle */}
        <div className="search-input-group">
          <FaSearch className="input-icon" />
          <input
            type="text"
            placeholder="Rechercher un logement, un quartier..."
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
                {cities.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
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
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </>
        )}

        {/* Bouton recherche */}
        <button 
          type="submit" 
          className="search-btn"
          disabled={loading}
        >
          <FaSearch /> {loading ? 'Recherche...' : 'Rechercher'}
        </button>
      </div>
    </form>
  );
};

export default SearchBar;
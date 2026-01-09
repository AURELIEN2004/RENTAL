
// ============================================
// src/components/search/FilterPanel.jsx
// ============================================

import React, { useState } from 'react';
import { FaFilter, FaTimes } from 'react-icons/fa';
import { PRICE_RANGES } from '../../utils/constants';
import './FilterPanel.css';

const FilterPanel = ({ filters, onFilterChange, onReset }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleChange = (key, value) => {
    onFilterChange({ ...filters, [key]: value });
  };

  return (
    <div className="filter-panel">
      {/* Bouton toggle mobile */}
      <button 
        className="filter-toggle-btn"
        onClick={() => setIsOpen(!isOpen)}
      >
        <FaFilter /> Filtres {Object.keys(filters).length > 0 && `(${Object.keys(filters).length})`}
      </button>

      {/* Panel */}
      <div className={`filter-panel-content ${isOpen ? 'open' : ''}`}>
        <div className="filter-header">
          <h3>Filtres</h3>
          <button className="close-btn" onClick={() => setIsOpen(false)}>
            <FaTimes />
          </button>
        </div>

        <div className="filter-body">
          {/* Prix */}
          <div className="filter-group">
            <label>Prix mensuel</label>
            <select 
              value={filters.priceRange || ''}
              onChange={(e) => handleChange('priceRange', e.target.value)}
            >
              <option value="">Tous les prix</option>
              {PRICE_RANGES.map((range, index) => (
                <option key={index} value={`${range.min}-${range.max}`}>
                  {range.label}
                </option>
              ))}
            </select>
          </div>

          {/* Nombre de chambres */}
          <div className="filter-group">
            <label>Chambres</label>
            <select
              value={filters.rooms || ''}
              onChange={(e) => handleChange('rooms', e.target.value)}
            >
              <option value="">Toutes</option>
              <option value="1">1 chambre</option>
              <option value="2">2 chambres</option>
              <option value="3">3 chambres</option>
              <option value="4">4+ chambres</option>
            </select>
          </div>

          {/* Type */}
          <div className="filter-group">
            <label>Type</label>
            <div className="checkbox-group">
              <label>
                <input 
                  type="checkbox" 
                  checked={filters.type?.includes('simple')}
                  onChange={(e) => {
                    const types = filters.type || [];
                    handleChange('type', 
                      e.target.checked 
                        ? [...types, 'simple']
                        : types.filter(t => t !== 'simple')
                    );
                  }}
                />
                Simple
              </label>
              <label>
                <input 
                  type="checkbox"
                  checked={filters.type?.includes('moderne')}
                  onChange={(e) => {
                    const types = filters.type || [];
                    handleChange('type', 
                      e.target.checked 
                        ? [...types, 'moderne']
                        : types.filter(t => t !== 'moderne')
                    );
                  }}
                />
                Moderne
              </label>
              <label>
                <input 
                  type="checkbox"
                  checked={filters.type?.includes('meuble')}
                  onChange={(e) => {
                    const types = filters.type || [];
                    handleChange('type', 
                      e.target.checked 
                        ? [...types, 'meuble']
                        : types.filter(t => t !== 'meuble')
                    );
                  }}
                />
                Meublé
              </label>
            </div>
          </div>

          {/* Tri */}
          <div className="filter-group">
            <label>Trier par</label>
            <select
              value={filters.sortBy || ''}
              onChange={(e) => handleChange('sortBy', e.target.value)}
            >
              <option value="">Pertinence</option>
              <option value="price_asc">Prix croissant</option>
              <option value="price_desc">Prix décroissant</option>
              <option value="recent">Plus récents</option>
              <option value="popular">Plus populaires</option>
            </select>
          </div>
        </div>

        <div className="filter-footer">
          <button className="btn btn-outline" onClick={onReset}>
            Réinitialiser
          </button>
          <button className="btn btn-primary" onClick={() => setIsOpen(false)}>
            Appliquer
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;

// ============================================
// 📁 components/search/FilterPanel.jsx - PANNEAU DÉPLOYABLE
// ============================================

import { useEffect, useState } from "react";
import {
  getRegions,
  getCities,
  getDistricts,
} from "../../services/locationService";
import { getCategories } from "../../services/housingService";

const FilterPanel = ({ filters: initialFilters, onApply, onClose }) => {
  const [categories, setCategories] = useState([]);
  const [regions, setRegions] = useState([]);
  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  
  const [filters, setFilters] = useState(initialFilters);

  // Chargement initial
  useEffect(() => {
    getCategories().then((res) => setCategories(res.data));
    getRegions().then((res) => setRegions(res.data));
  }, []);

  // Chargement des villes
  useEffect(() => {
    if (filters.region) {
      getCities(filters.region).then((res) => setCities(res.data));
    } else {
      setCities([]);
      setDistricts([]);
    }
  }, [filters.region]);

  // Chargement des quartiers
  useEffect(() => {
    if (filters.city) {
      getDistricts(filters.city).then((res) => setDistricts(res.data));
    } else {
      setDistricts([]);
    }
  }, [filters.city]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleReset = () => {
    setFilters({
      category: "",
      region: "",
      city: "",
      district: "",
      min_price: "",
      max_price: "",
      furnished: "",
    });
  };

  const handleApply = () => {
    onApply(filters);
  };

  // Compter les filtres actifs
  const activeCount = Object.values(filters).filter(v => v !== "").length;

  return (
    <>
      {/* Overlay */}
      <div className="filter-overlay" onClick={onClose}></div>

      {/* Panneau */}
      <div className="filter-panel">
        <div className="filter-header">
          <h3>🔧 Filtres de recherche</h3>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>

        <div className="filter-content">
          {/* Type de logement */}
          <div className="filter-group">
            <label htmlFor="category">
              <span className="label-icon">🏠</span>
              Type de logement
            </label>
            <select 
              id="category"
              name="category" 
              value={filters.category}
              onChange={handleChange}
            >
              <option value="">Tous les types</option>
              {
              categories.map((c) => 
              (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Localisation */}
          <div className="filter-section">
            <h4>📍 Localisation</h4>
            
            <div className="filter-group">
              <label htmlFor="region">Région</label>
              <select 
                id="region"
                name="region" 
                value={filters.region}
                onChange={handleChange}
              >
                <option value="">Toutes les régions</option>
                {regions.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="city">Ville</label>
              <select 
                id="city"
                name="city" 
                value={filters.city}
                onChange={handleChange}
                disabled={!filters.region}
              >
                <option value="">Toutes les villes</option>
                {cities.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="district">Quartier</label>
              <select 
                id="district"
                name="district" 
                value={filters.district}
                onChange={handleChange}
                disabled={!filters.city}
              >
                <option value="">Tous les quartiers</option>
                {districts.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Prix */}
          <div className="filter-section">
            <h4>💰 Budget (FCFA)</h4>
            
            <div className="filter-row">
              <div className="filter-group">
                <label htmlFor="min_price">Prix minimum</label>
                <input
                  id="min_price"
                  type="number"
                  name="min_price"
                  placeholder="Ex: 50000"
                  value={filters.min_price}
                  onChange={handleChange}
                  min="0"
                />
              </div>

              <div className="filter-group">
                <label htmlFor="max_price">Prix maximum</label>
                <input
                  id="max_price"
                  type="number"
                  name="max_price"
                  placeholder="Ex: 150000"
                  value={filters.max_price}
                  onChange={handleChange}
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="filter-section">
            <h4>⚙️ Options</h4>
            
            <div className="filter-group">
              <label htmlFor="furnished">
                <span className="label-icon">🛋️</span>
                Meublé
              </label>
              <select 
                id="furnished"
                name="furnished" 
                value={filters.furnished}
                onChange={handleChange}
              >
                <option value="">Peu importe</option>
                <option value="true">Oui</option>
                <option value="false">Non</option>
              </select>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="filter-footer">
          <button 
            className="btn-secondary"
            onClick={handleReset}
          >
            Réinitialiser
          </button>
          <button 
            className="btn-primary"
            onClick={handleApply}
          >
            Appliquer {activeCount > 0 && `(${activeCount})`}
          </button>
        </div>
      </div>
    </>
  );
};

export default FilterPanel;


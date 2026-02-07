
// ============================================
// 📁 components/search/SearchForm.jsx - VERSION CORRIGÉE
// ============================================

import { useEffect, useState } from "react";
import {
  getRegions,
  getCities,
  getDistricts,
} from "../../services/locationService";
import { getCategories } from "../../services/housingService";
import './SearchForm.css'; // Assurez-vous de créer ce fichier pour les styles

const SearchForm = ({ onSearch }) => {
  const [categories, setCategories] = useState([]);
  const [regions, setRegions] = useState([]);
  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  
  // 🔍 RECHERCHE TEXTUELLE LIBRE
  const [query, setQuery] = useState("");
  
  // 🔧 FILTRES STRUCTURÉS
  const [filters, setFilters] = useState({
    category: "",
    region: "",
    city: "",
    district: "",
    min_price: "",
    max_price: "",
    furnished: "",
  });

  // 📊 Chargement initial des catégories et régions
  useEffect(() => {
    getCategories().then((res) => setCategories(res.data));
    getRegions().then((res) => setRegions(res.data));
  }, []);

  // 🏙️ Chargement des villes quand une région est sélectionnée
  useEffect(() => {
    if (filters.region) {
      getCities(filters.region).then((res) => setCities(res.data));
      // Réinitialiser ville et quartier
      setFilters(prev => ({ ...prev, city: "", district: "" }));
      setDistricts([]);
    } else {
      setCities([]);
      setDistricts([]);
    }
  }, [filters.region]);

  // 📍 Chargement des quartiers quand une ville est sélectionnée
  useEffect(() => {
    if (filters.city) {
      getDistricts(filters.city).then((res) => setDistricts(res.data));
      // Réinitialiser quartier
      setFilters(prev => ({ ...prev, district: "" }));
    } else {
      setDistricts([]);
    }
  }, [filters.city]);

  // 🔄 Mise à jour des filtres
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // 🔍 Soumission de la recherche
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Envoi à la fois du texte libre et des filtres
    onSearch({
      query: query.trim(),
      filters: filters
    });
  };

  // 🧹 Réinitialisation du formulaire
  const handleReset = () => {
    setQuery("");
    setFilters({
      category: "",
      region: "",
      city: "",
      district: "",
      min_price: "",
      max_price: "",
      furnished: "",
    });
    setCities([]);
    setDistricts([]);
  };

  return (
    <form onSubmit={handleSubmit} className="search-form">
      
      {/* 🔍 RECHERCHE TEXTUELLE LIBRE */}
      <div className="form-group query-group">
        <label htmlFor="query">Recherche libre</label>
        <input
          id="query"
          type="text"
          placeholder="Ex: studio à Yaoundé, appartement Bastos..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="query-input"
        />
        <small className="form-hint">
          💡 Vous pouvez décrire ce que vous cherchez en langage naturel
        </small>
      </div>

      {/* 🔧 FILTRES STRUCTURÉS */}
      <div className="form-divider">
        <span>OU utilisez les filtres ci-dessous</span>
      </div>

      <div className="form-row">
        {/* Catégorie */}
        <div className="form-group">
          <label htmlFor="category">Catégorie</label>
          <select 
            id="category"
            name="category" 
            value={filters.category}
            onChange={handleChange}
          >
            <option value="">Toutes les catégories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Région */}
        <div className="form-group">
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
      </div>

      <div className="form-row">
        {/* Ville */}
        <div className="form-group">
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

        {/* Quartier */}
        <div className="form-group">
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

      <div className="form-row">
        {/* Prix min */}
        <div className="form-group">
          <label htmlFor="min_price">Prix minimum (FCFA)</label>
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

        {/* Prix max */}
        <div className="form-group">
          <label htmlFor="max_price">Prix maximum (FCFA)</label>
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

        {/* Meublé */}
        <div className="form-group">
          <label htmlFor="furnished">Meublé</label>
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

      {/* Boutons d'action */}
      <div className="form-actions">
        <button type="button" onClick={handleReset} className="btn-reset">
          🔄 Réinitialiser
        </button>
        <button type="submit" className="btn-submit">
          🔍 Rechercher
        </button>
      </div>
    </form>
  );
};

export default SearchForm;


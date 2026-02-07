// ============================================
// 📁 src/components/Search/AdvancedFilters.jsx
// Filtres de recherche avancés extensibles
// ============================================

import React, { useState, useEffect } from 'react';
import { Plus, X, ChevronDown, ChevronUp, MapPin } from 'lucide-react';
import searchService from '../../services/searchService';
import './AdvancedFilters.css';
// import './Search.css';

const AdvancedFilters = ({ 
  onFiltersChange, 
  initialFilters = {}, 
  language = 'fr' 
}) => {
  // États pour les données de base
  const [categories, setCategories] = useState([]);
  const [housingTypes, setHousingTypes] = useState([]);
  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [proximityTypes, setProximityTypes] = useState([]);

  // Filtres de base (toujours visibles)
  const [selectedCategory, setSelectedCategory] = useState(initialFilters.category || '');
  const [selectedCity, setSelectedCity] = useState(initialFilters.city || '');

  // Filtres supplémentaires (cachés par défaut)
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState([]);

  // Valeurs des filtres supplémentaires
  const [filters, setFilters] = useState({
    housingType: initialFilters.housing_type || '',
    district: initialFilters.district || '',
    minPrice: initialFilters.min_price || '',
    maxPrice: initialFilters.max_price || '',
    minRooms: initialFilters.min_rooms || '',
    maxRooms: initialFilters.max_rooms || '',
    minArea: initialFilters.min_area || '',
    maxArea: initialFilters.max_area || '',
    minBathrooms: initialFilters.min_bathrooms || '',
    hasParking: initialFilters.has_parking || false,
    hasGarden: initialFilters.has_garden || false,
    hasPool: initialFilters.has_pool || false,
    isFurnished: initialFilters.is_furnished || false,
    proximityPlaceType: initialFilters.proximity_place_type || '',
    proximityRadius: initialFilters.proximity_radius || 2.0,
    sortBy: initialFilters.sort_by || 'relevance',
    useGeneticAlgorithm: initialFilters.use_genetic_algorithm || false,
  });

  // Charger les données de base
  useEffect(() => {
    loadInitialData();
  }, []);

  // Charger les quartiers quand la ville change
  useEffect(() => {
    if (selectedCity) {
      loadDistricts(selectedCity);
    } else {
      setDistricts([]);
      setFilters(prev => ({ ...prev, district: '' }));
    }
  }, [selectedCity]);

  // Notifier le parent quand les filtres changent
  useEffect(() => {
    const allFilters = {
      category: selectedCategory,
      city: selectedCity,
      ...filters,
    };
    
    // Supprimer les valeurs vides
    const cleanFilters = Object.entries(allFilters).reduce((acc, [key, value]) => {
      if (value !== '' && value !== false && value !== null && value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {});

    onFiltersChange(cleanFilters);
  }, [selectedCategory, selectedCity, filters, onFiltersChange]);

  const loadInitialData = async () => {
    try {
      const [categoriesData, housingTypesData, citiesData, proximityData] = 
        await Promise.all([
          searchService.getCategories(),
          searchService.getHousingTypes(),
          searchService.getCities(),
          searchService.getProximityPlaceTypes(),
        ]);

      setCategories(categoriesData);
      setHousingTypes(housingTypesData);
      setCities(citiesData);
      setProximityTypes(proximityData.types || []);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const loadDistricts = async (cityId) => {
    try {
      const data = await searchService.getDistricts(cityId);
      setDistricts(data);
    } catch (error) {
      console.error('Error loading districts:', error);
    }
  };

  const availableFilters = [
    { 
      id: 'housingType', 
      label: language === 'fr' ? 'Type de logement' : 'Housing Type',
      icon: '🏠'
    },
    { 
      id: 'district', 
      label: language === 'fr' ? 'Quartier' : 'District',
      icon: '📍'
    },
    { 
      id: 'price', 
      label: language === 'fr' ? 'Prix' : 'Price',
      icon: '💰'
    },
    { 
      id: 'rooms', 
      label: language === 'fr' ? 'Chambres' : 'Rooms',
      icon: '🛏️'
    },
    { 
      id: 'area', 
      label: language === 'fr' ? 'Surface' : 'Area',
      icon: '📏'
    },
    { 
      id: 'bathrooms', 
      label: language === 'fr' ? 'Salles de bain' : 'Bathrooms',
      icon: '🚿'
    },
    { 
      id: 'features', 
      label: language === 'fr' ? 'Caractéristiques' : 'Features',
      icon: '⭐'
    },
    { 
      id: 'proximity', 
      label: language === 'fr' ? 'Proximité' : 'Proximity',
      icon: '📍'
    },
    { 
      id: 'advanced', 
      label: language === 'fr' ? 'Options avancées' : 'Advanced Options',
      icon: '⚙️'
    },
  ];

  const addFilter = (filterId) => {
    if (!activeFilters.includes(filterId)) {
      setActiveFilters([...activeFilters, filterId]);
    }
  };

  const removeFilter = (filterId) => {
    setActiveFilters(activeFilters.filter(id => id !== filterId));
    
    // Réinitialiser les valeurs associées
    const resetValues = {};
    switch (filterId) {
      case 'housingType':
        resetValues.housingType = '';
        break;
      case 'district':
        resetValues.district = '';
        break;
      case 'price':
        resetValues.minPrice = '';
        resetValues.maxPrice = '';
        break;
      case 'rooms':
        resetValues.minRooms = '';
        resetValues.maxRooms = '';
        break;
      case 'area':
        resetValues.minArea = '';
        resetValues.maxArea = '';
        break;
      case 'bathrooms':
        resetValues.minBathrooms = '';
        break;
      case 'features':
        resetValues.hasParking = false;
        resetValues.hasGarden = false;
        resetValues.hasPool = false;
        resetValues.isFurnished = false;
        break;
      case 'proximity':
        resetValues.proximityPlaceType = '';
        resetValues.proximityRadius = 2.0;
        break;
      case 'advanced':
        resetValues.sortBy = 'relevance';
        resetValues.useGeneticAlgorithm = false;
        break;
    }
    
    setFilters(prev => ({ ...prev, ...resetValues }));
  };

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetAllFilters = () => {
    setSelectedCategory('');
    setSelectedCity('');
    setFilters({
      housingType: '',
      district: '',
      minPrice: '',
      maxPrice: '',
      minRooms: '',
      maxRooms: '',
      minArea: '',
      maxArea: '',
      minBathrooms: '',
      hasParking: false,
      hasGarden: false,
      hasPool: false,
      isFurnished: false,
      proximityPlaceType: '',
      proximityRadius: 2.0,
      sortBy: 'relevance',
      useGeneticAlgorithm: false,
    });
    setActiveFilters([]);
    setShowMoreFilters(false);
  };

  const renderFilterContent = (filterId) => {
    switch (filterId) {
      case 'housingType':
        return (
          <select
            value={filters.housingType}
            onChange={(e) => updateFilter('housingType', e.target.value)}
            className="filter-select"
          >
            <option value="">
              {language === 'fr' ? 'Tous les types' : 'All types'}
            </option>
            {housingTypes.map(type => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        );

      case 'district':
        return (
          <select
            value={filters.district}
            onChange={(e) => updateFilter('district', e.target.value)}
            className="filter-select"
            disabled={!selectedCity}
          >
            <option value="">
              {language === 'fr' ? 'Tous les quartiers' : 'All districts'}
            </option>
            {districts.map(district => (
              <option key={district.id} value={district.id}>
                {district.name}
              </option>
            ))}
          </select>
        );

      case 'price':
        return (
          <div className="filter-range">
            <input
              type="number"
              placeholder={language === 'fr' ? 'Min (FCFA)' : 'Min (FCFA)'}
              value={filters.minPrice}
              onChange={(e) => updateFilter('minPrice', e.target.value)}
              className="filter-input"
            />
            <span className="range-separator">-</span>
            <input
              type="number"
              placeholder={language === 'fr' ? 'Max (FCFA)' : 'Max (FCFA)'}
              value={filters.maxPrice}
              onChange={(e) => updateFilter('maxPrice', e.target.value)}
              className="filter-input"
            />
          </div>
        );

      case 'rooms':
        return (
          <div className="filter-range">
            <input
              type="number"
              min="0"
              placeholder="Min"
              value={filters.minRooms}
              onChange={(e) => updateFilter('minRooms', e.target.value)}
              className="filter-input-small"
            />
            <span className="range-separator">-</span>
            <input
              type="number"
              min="0"
              placeholder="Max"
              value={filters.maxRooms}
              onChange={(e) => updateFilter('maxRooms', e.target.value)}
              className="filter-input-small"
            />
          </div>
        );

      case 'area':
        return (
          <div className="filter-range">
            <input
              type="number"
              placeholder="Min m²"
              value={filters.minArea}
              onChange={(e) => updateFilter('minArea', e.target.value)}
              className="filter-input"
            />
            <span className="range-separator">-</span>
            <input
              type="number"
              placeholder="Max m²"
              value={filters.maxArea}
              onChange={(e) => updateFilter('maxArea', e.target.value)}
              className="filter-input"
            />
          </div>
        );

      case 'bathrooms':
        return (
          <input
            type="number"
            min="0"
            placeholder={language === 'fr' ? 'Minimum' : 'Minimum'}
            value={filters.minBathrooms}
            onChange={(e) => updateFilter('minBathrooms', e.target.value)}
            className="filter-input"
          />
        );

      case 'features':
        return (
          <div className="filter-checkboxes">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={filters.hasParking}
                onChange={(e) => updateFilter('hasParking', e.target.checked)}
              />
              <span>{language === 'fr' ? 'Parking' : 'Parking'}</span>
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={filters.hasGarden}
                onChange={(e) => updateFilter('hasGarden', e.target.checked)}
              />
              <span>{language === 'fr' ? 'Jardin' : 'Garden'}</span>
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={filters.hasPool}
                onChange={(e) => updateFilter('hasPool', e.target.checked)}
              />
              <span>{language === 'fr' ? 'Piscine' : 'Pool'}</span>
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={filters.isFurnished}
                onChange={(e) => updateFilter('isFurnished', e.target.checked)}
              />
              <span>{language === 'fr' ? 'Meublé' : 'Furnished'}</span>
            </label>
          </div>
        );

      case 'proximity':
        return (
          <div className="proximity-filter">
            <select
              value={filters.proximityPlaceType}
              onChange={(e) => updateFilter('proximityPlaceType', e.target.value)}
              className="filter-select"
            >
              <option value="">
                {language === 'fr' ? 'Sélectionner un lieu' : 'Select a place'}
              </option>
              {proximityTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {language === 'fr' ? type.label : type.label}
                </option>
              ))}
            </select>
            
            {filters.proximityPlaceType && (
              <div className="radius-slider">
                <label>
                  {language === 'fr' ? 'Rayon' : 'Radius'}: {filters.proximityRadius} km
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="10"
                  step="0.5"
                  value={filters.proximityRadius}
                  onChange={(e) => updateFilter('proximityRadius', parseFloat(e.target.value))}
                  className="slider"
                />
              </div>
            )}
          </div>
        );

      case 'advanced':
        return (
          <div className="advanced-options">
            <div className="sort-option">
              <label>{language === 'fr' ? 'Trier par' : 'Sort by'}:</label>
              <select
                value={filters.sortBy}
                onChange={(e) => updateFilter('sortBy', e.target.value)}
                className="filter-select"
              >
                <option value="relevance">
                  {language === 'fr' ? 'Pertinence' : 'Relevance'}
                </option>
                <option value="price_asc">
                  {language === 'fr' ? 'Prix croissant' : 'Price ascending'}
                </option>
                <option value="price_desc">
                  {language === 'fr' ? 'Prix décroissant' : 'Price descending'}
                </option>
                <option value="area_desc">
                  {language === 'fr' ? 'Surface décroissante' : 'Area descending'}
                </option>
                <option value="date_desc">
                  {language === 'fr' ? 'Plus récents' : 'Most recent'}
                </option>
                <option value="popularity">
                  {language === 'fr' ? 'Popularité' : 'Popularity'}
                </option>
              </select>
            </div>
            
            <label className="checkbox-label genetic-option">
              <input
                type="checkbox"
                checked={filters.useGeneticAlgorithm}
                onChange={(e) => updateFilter('useGeneticAlgorithm', e.target.checked)}
              />
              <span>
                {language === 'fr' 
                  ? '🧬 Recherche intelligente (recommandé)' 
                  : '🧬 Smart search (recommended)'}
              </span>
            </label>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="advanced-filters">
      {/* Filtres de base (toujours visibles) */}
      <div className="basic-filters">
        <div className="filter-group">
          <label className="filter-label">
            {language === 'fr' ? 'Catégorie' : 'Category'}
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="filter-select"
          >
            <option value="">
              {language === 'fr' ? 'Toutes' : 'All'}
            </option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">
            <MapPin size={16} />
            {language === 'fr' ? 'Ville' : 'City'}
          </label>
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="filter-select"
          >
            <option value="">
              {language === 'fr' ? 'Toutes' : 'All'}
            </option>
            {cities.map(city => (
              <option key={city.id} value={city.id}>
                {city.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Bouton pour afficher plus de filtres */}
      <button
        type="button"
        className="toggle-filters-btn"
        onClick={() => setShowMoreFilters(!showMoreFilters)}
      >
        {showMoreFilters ? (
          <>
            <ChevronUp size={18} />
            {language === 'fr' ? 'Moins de filtres' : 'Fewer filters'}
          </>
        ) : (
          <>
            <Plus size={18} />
            {language === 'fr' ? 'Plus de filtres' : 'More filters'}
          </>
        )}
      </button>

      {/* Filtres supplémentaires */}
      {showMoreFilters && (
        <div className="more-filters">
          {/* Filtres actifs */}
          {activeFilters.map(filterId => {
            const filterInfo = availableFilters.find(f => f.id === filterId);
            return (
              <div key={filterId} className="active-filter">
                <div className="filter-header">
                  <span className="filter-icon">{filterInfo.icon}</span>
                  <span className="filter-name">{filterInfo.label}</span>
                  <button
                    type="button"
                    className="remove-filter-btn"
                    onClick={() => removeFilter(filterId)}
                    title={language === 'fr' ? 'Retirer' : 'Remove'}
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="filter-content">
                  {renderFilterContent(filterId)}
                </div>
              </div>
            );
          })}

          {/* Boutons pour ajouter des filtres */}
          <div className="add-filter-buttons">
            {availableFilters
              .filter(f => !activeFilters.includes(f.id))
              .map(filter => (
                <button
                  key={filter.id}
                  type="button"
                  className="add-filter-btn"
                  onClick={() => addFilter(filter.id)}
                >
                  <span>{filter.icon}</span>
                  <span>{filter.label}</span>
                  <Plus size={14} />
                </button>
              ))}
          </div>

          {/* Bouton réinitialiser */}
          {(activeFilters.length > 0 || selectedCategory || selectedCity) && (
            <button
              type="button"
              className="reset-filters-btn"
              onClick={resetAllFilters}
            >
              {language === 'fr' ? 'Réinitialiser tous les filtres' : 'Reset all filters'}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default AdvancedFilters;
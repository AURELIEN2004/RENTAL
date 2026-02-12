// ============================================
// 📁 src/components/Search/FilterPanel.jsx - VERSION COMPLÈTE
// ============================================

import { useState, useEffect } from 'react';
import { Filter, X, Loader } from 'lucide-react';
import { housingService } from '../../services/housingService';
import './FilterPanel.css';

/**
 * Panneau de filtres avancés avec chargement dynamique
 * Charge les catégories, régions, villes, quartiers et types depuis la BDD
 */
const FilterPanel = ({ onApplyFilters, initialFilters = {} }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    city: '',
    district: '',
    region: '',
    housingType: '',
    min_price: '',
    max_price: '',
    min_rooms: '',
    min_area: '',
    status: 'disponible',
    ...initialFilters
  });

  // États pour les données
  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [regions, setRegions] = useState([]);
  const [housingTypes, setHousingTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  // ============================================
  // CHARGEMENT DES DONNÉES
  // ============================================

  // Charger toutes les données au montage
  useEffect(() => {
    loadFilterData();
  }, []);

  // Charger les villes quand région change
  useEffect(() => {
    if (filters.region) {
      loadCitiesByRegion(filters.region);
    } else {
      loadAllCities();
    }
  }, [filters.region]);

  // Charger les quartiers quand ville change
  useEffect(() => {
    if (filters.city) {
      loadDistricts(filters.city);
    } else {
      setDistricts([]);
    }
  }, [filters.city]);

  /**
   * Charger toutes les données initiales
   */
  const loadFilterData = async () => {
    setLoading(true);
    try {
      // Charger en parallèle pour plus de rapidité
      const [categoriesData, regionsData, citiesData, housingTypesData] = await Promise.all([
        housingService.getCategories(),
        housingService.getRegions(),
        housingService.getCities(),
        housingService.getHousingTypes()
      ]);

      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      setRegions(Array.isArray(regionsData) ? regionsData : []);
      setCities(Array.isArray(citiesData) ? citiesData : []);
      setHousingTypes(Array.isArray(housingTypesData) ? housingTypesData : []);
      
      console.log('✅ Filtres chargés:', {
        categories: categoriesData?.length,
        regions: regionsData?.length,
        cities: citiesData?.length,
        housingTypes: housingTypesData?.length
      });
    } catch (error) {
      console.error('❌ Erreur chargement filtres:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Charger toutes les villes
   */
  const loadAllCities = async () => {
    try {
      const data = await housingService.getCities();
      setCities(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('❌ Erreur chargement villes:', error);
    }
  };

  /**
   * Charger les villes d'une région
   */
  const loadCitiesByRegion = async (regionId) => {
    try {
      const data = await housingService.getCities(regionId);
      setCities(Array.isArray(data) ? data : []);
      // Réinitialiser ville et quartier si région change
      setFilters(prev => ({ ...prev, city: '', district: '' }));
      setDistricts([]);
    } catch (error) {
      console.error('❌ Erreur chargement villes par région:', error);
    }
  };

  /**
   * Charger les quartiers d'une ville
   */
  const loadDistricts = async (cityId) => {
    try {
      const data = await housingService.getDistricts(cityId);
      setDistricts(Array.isArray(data) ? data : []);
      console.log(`✅ Quartiers chargés pour ville ${cityId}:`, data?.length);
    } catch (error) {
      console.error('❌ Erreur chargement quartiers:', error);
    }
  };

  // ============================================
  // GESTION DES FILTRES
  // ============================================

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleApply = () => {
    // Nettoyer les valeurs vides
    const cleanFilters = Object.entries(filters).reduce((acc, [key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {});

    onApplyFilters(cleanFilters);
    setIsOpen(false);
  };

  const handleReset = () => {
    const resetFilters = {
      category: '',
      city: '',
      district: '',
      region: '',
      housingType: '',
      min_price: '',
      max_price: '',
      min_rooms: '',
      min_area: '',
      status: 'disponible'
    };
    setFilters(resetFilters);
    onApplyFilters(resetFilters);
  };

  const activeCount = Object.values(filters).filter(v => v !== '' && v !== 'disponible').length;

  // ============================================
  // RENDU
  // ============================================

  return (
    <div className="filter-panel">
      <button onClick={() => setIsOpen(!isOpen)} className="filter-toggle-button">
        <Filter size={20} />
        <span>Filtres</span>
        {activeCount > 0 && <span className="filter-badge">{activeCount}</span>}
      </button>

      {isOpen && (
        <div className="filter-dropdown">
          <div className="filter-header">
            <h3>Filtres de recherche</h3>
            <button onClick={() => setIsOpen(false)} className="close-button">
              <X size={20} />
            </button>
          </div>

          <div className="filter-content">
            {loading ? (
              <div className="filter-loading">
                <Loader className="spinner" size={24} />
                <p>Chargement des filtres...</p>
              </div>
            ) : (
              <>
                {/* Catégorie */}
                <div className="filter-group">
                  <label>Catégorie</label>
                  <select name="category" value={filters.category} onChange={handleChange}>
                    <option value="">Toutes les catégories</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  {categories.length === 0 && (
                    <small className="filter-hint">Aucune catégorie disponible</small>
                  )}
                </div>

                {/* Type de logement */}
                <div className="filter-group">
                  <label>Type de logement</label>
                  <select name="housingType" value={filters.housingType} onChange={handleChange}>
                    <option value="">Tous les types</option>
                    {housingTypes.map(type => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                  {housingTypes.length === 0 && (
                    <small className="filter-hint">Aucun type disponible</small>
                  )}
                </div>

                {/* Région */}
                <div className="filter-group">
                  <label>Région</label>
                  <select name="region" value={filters.region} onChange={handleChange}>
                    <option value="">Toutes les régions</option>
                    {regions.map(region => (
                      <option key={region.id} value={region.id}>
                        {region.name}
                      </option>
                    ))}
                  </select>
                  {regions.length === 0 && (
                    <small className="filter-hint">Aucune région disponible</small>
                  )}
                </div>

                {/* Ville */}
                <div className="filter-group">
                  <label>
                    Ville
                    {filters.region && <small> (dans la région sélectionnée)</small>}
                  </label>
                  <select name="city" value={filters.city} onChange={handleChange}>
                    <option value="">Toutes les villes</option>
                    {cities.map(city => (
                      <option key={city.id} value={city.id}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                  {cities.length === 0 && filters.region && (
                    <small className="filter-hint">Aucune ville dans cette région</small>
                  )}
                </div>

                {/* Quartier */}
                {filters.city && (
                  <div className="filter-group">
                    <label>Quartier</label>
                    <select name="district" value={filters.district} onChange={handleChange}>
                      <option value="">Tous les quartiers</option>
                      {districts.map(district => (
                        <option key={district.id} value={district.id}>
                          {district.name}
                        </option>
                      ))}
                    </select>
                    {districts.length === 0 && (
                      <small className="filter-hint">Aucun quartier dans cette ville</small>
                    )}
                  </div>
                )}

                {/* Budget */}
                <div className="filter-group-row">
                  <div className="filter-group">
                    <label>Prix min (FCFA)</label>
                    <input
                      type="number"
                      name="min_price"
                      value={filters.min_price}
                      onChange={handleChange}
                      placeholder="0"
                      min="0"
                      step="5000"
                    />
                  </div>
                  <div className="filter-group">
                    <label>Prix max (FCFA)</label>
                    <input
                      type="number"
                      name="max_price"
                      value={filters.max_price}
                      onChange={handleChange}
                      placeholder="Illimité"
                      min="0"
                      step="5000"
                    />
                  </div>
                </div>

                {/* Caractéristiques */}
                <div className="filter-group-row">
                  <div className="filter-group">
                    <label>Chambres min</label>
                    <input
                      type="number"
                      name="min_rooms"
                      value={filters.min_rooms}
                      onChange={handleChange}
                      placeholder="0"
                      min="0"
                      max="10"
                    />
                  </div>
                  <div className="filter-group">
                    <label>Surface min (m²)</label>
                    <input
                      type="number"
                      name="min_area"
                      value={filters.min_area}
                      onChange={handleChange}
                      placeholder="0"
                      min="0"
                      step="5"
                    />
                  </div>
                </div>

                {/* Statut */}
                <div className="filter-group">
                  <label>Statut</label>
                  <select name="status" value={filters.status} onChange={handleChange}>
                    <option value="">Tous les statuts</option>
                    <option value="disponible">Disponible</option>
                    <option value="reserve">Réservé</option>
                    <option value="occupe">Occupé</option>
                  </select>
                </div>
              </>
            )}
          </div>

          <div className="filter-actions">
            <button onClick={handleReset} className="reset-button" disabled={loading}>
              Réinitialiser
            </button>
            <button onClick={handleApply} className="apply-button" disabled={loading}>
              Appliquer {activeCount > 0 && `(${activeCount})`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterPanel;

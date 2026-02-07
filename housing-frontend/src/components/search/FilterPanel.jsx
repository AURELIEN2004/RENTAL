// // // ============================================
// // // 📁 src/components/Search/FilterPanel.jsx
// // // ============================================

// export default FilterPanel;
import { useState, useEffect } from 'react';
import { Filter, X } from 'lucide-react';
import { housingService } from '../../services/housingService';

/**
 * Panneau de filtres avancés
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

  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [regions, setRegions] = useState([]); // nouvelles régions
  const [housingTypes, setHousingTypes] = useState([]);
    

  // Charger les données pour les selects
  useEffect(() => {
    loadFilterData();
  }, []);

  // Charger les quartiers quand ville change
  useEffect(() => {
    if (filters.city) {
      loadDistricts(filters.city);
    } else {
      setDistricts([]);
    }
  }, [filters.city]);

  const loadFilterData = async () => {
    try {
      const [categoriesData, citiesData, regionsData] = await Promise.all([
        housingService.getCategories(),
        housingService.getCities(),
        housingService.getRegions() // <-- Nouvelle API
      ]);

      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      setCities(Array.isArray(citiesData) ? citiesData : []);
      setRegions(Array.isArray(regionsData) ? regionsData : []);
    } catch (error) {
      console.error('Erreur chargement filtres:', error);
    }
  };

  const loadDistricts = async (cityId) => {
    try {
      const data = await housingService.getDistricts(cityId);
      setDistricts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erreur chargement quartiers:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleApply = () => {
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
            {/* Catégorie */}
            <div className="filter-group">
              <label>Catégorie</label>
              <select name="category" value={filters.category} onChange={handleChange}>
                <option value="">Toutes</option>
                {Array.isArray(categories) && categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Région */}
            <div className="filter-group">
              <label>Région</label>
              <select name="region" value={filters.region} onChange={handleChange}>
                <option value="">Toutes</option>
                {Array.isArray(regions) && regions.map(region => (
                  <option key={region.id} value={region.id}>{region.name}</option>
                ))}
              </select>
            </div>

            {/* Ville */}
            <div className="filter-group">
              <label>Ville</label>
              <select name="city" value={filters.city} onChange={handleChange}>
                <option value="">Toutes</option>
                {Array.isArray(cities) && cities.map(city => (
                  <option key={city.id} value={city.id}>{city.name}</option>
                ))}
              </select>
            </div>

            {/* Quartier */}
            {filters.city && (
              <div className="filter-group">
                <label>Quartier</label>
                <select name="district" value={filters.district} onChange={handleChange}>
                  <option value="">Tous</option>
                  {Array.isArray(districts) && districts.map(district => (
                    <option key={district.id} value={district.id}>{district.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Type de logement */}
            <div className="filter-group">
              <label>Type de logement</label>
              <select name="housingType" value={filters.housingType} onChange={handleChange}>
                <option value="">Tous</option>
                {housingTypes.map(type => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
            </div>

            {/* Budget */}
            <div className="filter-group-row">
              <div className="filter-group">
                <label>Prix min (FCFA)</label>
                <input type="number" name="min_price" value={filters.min_price} onChange={handleChange} placeholder="0" min="0" />
              </div>
              <div className="filter-group">
                <label>Prix max (FCFA)</label>
                <input type="number" name="max_price" value={filters.max_price} onChange={handleChange} placeholder="Illimité" min="0" />
              </div>
            </div>

            {/* Caractéristiques */}
            <div className="filter-group-row">
              <div className="filter-group">
                <label>Chambres min</label>
                <input type="number" name="min_rooms" value={filters.min_rooms} onChange={handleChange} placeholder="0" min="0" />
              </div>
              <div className="filter-group">
                <label>Surface min (m²)</label>
                <input type="number" name="min_area" value={filters.min_area} onChange={handleChange} placeholder="0" min="0" />
              </div>
            </div>

            {/* Statut */}
            <div className="filter-group">
              <label>Statut</label>
              <select name="status" value={filters.status} onChange={handleChange}>
                <option value="">Tous</option>
                <option value="disponible">Disponible</option>
                <option value="reserve">Réservé</option>
                <option value="occupe">Occupé</option>
              </select>
            </div>
          </div>

          <div className="filter-actions">
            <button onClick={handleReset} className="reset-button">Réinitialiser</button>
            <button onClick={handleApply} className="apply-button">Appliquer {activeCount > 0 && `(${activeCount})`}</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterPanel;

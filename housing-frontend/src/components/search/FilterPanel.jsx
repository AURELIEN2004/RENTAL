// // // // ============================================
// // // // 📁 src/components/Search/FilterPanel.jsx - VERSION COMPLÈTE
// // // // ============================================


// // import { useState, useEffect } from 'react';
// // import { SlidersHorizontal, X, Loader, ChevronDown } from 'lucide-react';
// // import { housingService } from '../../services/housingService';
// // import { useTheme } from '../../contexts/ThemeContext';
// // import './FilterPanel.css';

// // const T = {
// //   fr: {
// //     btn:          'Filtres',
// //     title:        'Filtres de recherche',
// //     close:        'Fermer',
// //     reset:        'Réinitialiser',
// //     apply:        'Appliquer',
// //     loading:      'Chargement…',
// //     category:     'Catégorie',
// //     all_cat:      'Toutes les catégories',
// //     no_cat:       'Aucune catégorie',
// //     type:         'Type de logement',
// //     all_types:    'Tous les types',
// //     no_types:     'Aucun type',
// //     region:       'Région',
// //     all_regions:  'Toutes les régions',
// //     city:         'Ville',
// //     city_hint:    '(région sélectionnée)',
// //     all_cities:   'Toutes les villes',
// //     district:     'Quartier',
// //     all_dist:     'Tous les quartiers',
// //     no_dist:      'Aucun quartier',
// //     price_min:    'Prix min (FCFA)',
// //     price_max:    'Prix max (FCFA)',
// //     unlimited:    'Illimité',
// //     rooms:        'Chambres min',
// //     area:         'Surface min (m²)',
// //     status:       'Statut',
// //     all_status:   'Tous les statuts',
// //     available:    'Disponible',
// //     reserved:     'Réservé',
// //     occupied:     'Occupé',
// //   },
// //   en: {
// //     btn:          'Filters',
// //     title:        'Search filters',
// //     close:        'Close',
// //     reset:        'Reset',
// //     apply:        'Apply',
// //     loading:      'Loading…',
// //     category:     'Category',
// //     all_cat:      'All categories',
// //     no_cat:       'No categories',
// //     type:         'Housing type',
// //     all_types:    'All types',
// //     no_types:     'No types',
// //     region:       'Region',
// //     all_regions:  'All regions',
// //     city:         'City',
// //     city_hint:    '(selected region)',
// //     all_cities:   'All cities',
// //     district:     'Neighborhood',
// //     all_dist:     'All neighborhoods',
// //     no_dist:      'No neighborhoods',
// //     price_min:    'Min price (FCFA)',
// //     price_max:    'Max price (FCFA)',
// //     unlimited:    'No limit',
// //     rooms:        'Min bedrooms',
// //     area:         'Min area (m²)',
// //     status:       'Status',
// //     all_status:   'All statuses',
// //     available:    'Available',
// //     reserved:     'Reserved',
// //     occupied:     'Occupied',
// //   },
// // };

// // const EMPTY = {
// //   category: '', housingType: '', region: '', city: '', district: '',
// //   min_price: '', max_price: '', min_rooms: '', min_area: '', status: 'disponible',
// // };

// // const FilterPanel = ({ onApplyFilters, initialFilters = {}, language: langProp }) => {
// //   const { language: langCtx } = useTheme();
// //   const lang = langProp || langCtx || 'fr';
// //   const t    = T[lang] || T.fr;

// //   const [isOpen,  setIsOpen]  = useState(false);
// //   const [loading, setLoading] = useState(true);
// //   const [filters, setFilters] = useState({ ...EMPTY, ...initialFilters });

// //   const [categories,   setCategories]   = useState([]);
// //   const [housingTypes, setHousingTypes] = useState([]);
// //   const [regions,      setRegions]      = useState([]);
// //   const [cities,       setCities]       = useState([]);
// //   const [districts,    setDistricts]    = useState([]);

// //   // ── Rechargement quand la langue change ─────────────────
// //   useEffect(() => {
// //     loadAll();
// //   // eslint-disable-next-line react-hooks/exhaustive-deps
// //   }, [lang]);

// //   // ── Villes réactives à la région ────────────────────────
// //   useEffect(() => {
// //     if (filters.region) {
// //       loadCities(filters.region);
// //     } else {
// //       loadCities(null);
// //     }
// //   // eslint-disable-next-line react-hooks/exhaustive-deps
// //   }, [filters.region, lang]);

// //   // ── Quartiers réactifs à la ville ───────────────────────
// //   useEffect(() => {
// //     if (filters.city) {
// //       loadDistricts(filters.city);
// //     } else {
// //       setDistricts([]);
// //     }
// //   // eslint-disable-next-line react-hooks/exhaustive-deps
// //   }, [filters.city, lang]);

// //   // ── Loaders ─────────────────────────────────────────────
// //   const loadAll = async () => {
// //     setLoading(true);
// //     try {
// //       const [cats, types, regs, citiesData] = await Promise.all([
// //         housingService.getCategories(),
// //         housingService.getHousingTypes(),
// //         housingService.getRegions(),
// //         housingService.getCities(),
// //       ]);
// //       setCategories(Array.isArray(cats)       ? cats       : []);
// //       setHousingTypes(Array.isArray(types)    ? types      : []);
// //       setRegions(Array.isArray(regs)           ? regs       : []);
// //       setCities(Array.isArray(citiesData)      ? citiesData : []);
// //     } catch (e) {
// //       console.error('Erreur filtres:', e);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const loadCities = async (regionId) => {
// //     try {
// //       const data = await housingService.getCities(regionId || undefined);
// //       setCities(Array.isArray(data) ? data : []);
// //       if (regionId) {
// //         // Réinitialiser ville et quartier quand région change
// //         setFilters(p => ({ ...p, city: '', district: '' }));
// //         setDistricts([]);
// //       }
// //     } catch (e) {
// //       console.error('Erreur villes:', e);
// //     }
// //   };

// //   const loadDistricts = async (cityId) => {
// //     try {
// //       const data = await housingService.getDistricts(cityId);
// //       setDistricts(Array.isArray(data) ? data : []);
// //     } catch (e) {
// //       console.error('Erreur quartiers:', e);
// //     }
// //   };

// //   // ── Gestion ─────────────────────────────────────────────
// //   const handleChange = (e) => {
// //     const { name, value } = e.target;
// //     setFilters(p => ({ ...p, [name]: value }));
// //   };

// //   const handleApply = () => {
// //     const clean = Object.fromEntries(
// //       Object.entries(filters).filter(([, v]) => v !== '' && v != null)
// //     );
// //     onApplyFilters(clean);
// //     setIsOpen(false);
// //   };

// //   const handleReset = () => {
// //     setFilters({ ...EMPTY });
// //     onApplyFilters({});
// //   };

// //   const activeCount = Object.entries(filters).filter(
// //     ([k, v]) => v !== '' && v != null && !(k === 'status' && v === 'disponible')
// //   ).length;

// //   // ── Rendu ─────────────────────────────────────────────────
// //   return (
// //     <div className="fp-root">

// //       {/* ── Bouton ── */}
// //       <button
// //         type="button"
// //         className={`fp-toggle ${isOpen ? 'fp-toggle--open' : ''}`}
// //         onClick={() => setIsOpen(o => !o)}
// //         aria-expanded={isOpen}
// //         aria-haspopup="true"
// //       >
// //         <SlidersHorizontal size={17} />
// //         <span>{t.btn}</span>
// //         {activeCount > 0 && <span className="fp-count">{activeCount}</span>}
// //         <ChevronDown size={13} className={`fp-chevron ${isOpen ? 'fp-chevron--open' : ''}`} />
// //       </button>

// //       {/* ── Panneau ── */}
// //       {isOpen && (
// //         <>
// //           <div className="fp-overlay" onClick={() => setIsOpen(false)} />

// //           <div className="fp-panel" role="dialog" aria-label={t.title}>

// //             <div className="fp-header">
// //               <h3>{t.title}</h3>
// //               <button
// //                 type="button"
// //                 className="fp-close"
// //                 onClick={() => setIsOpen(false)}
// //                 aria-label={t.close}
// //               >
// //                 <X size={18} />
// //               </button>
// //             </div>

// //             <div className="fp-body">
// //               {loading ? (
// //                 <div className="fp-loading">
// //                   <Loader className="fp-spin" size={22} />
// //                   <span>{t.loading}</span>
// //                 </div>
// //               ) : (
// //                 <>
// //                   {/* Catégorie */}
// //                   <div className="fp-field">
// //                     <label className="fp-label">{t.category}</label>
// //                     <select name="category" value={filters.category} onChange={handleChange} className="fp-select">
// //                       <option value="">{t.all_cat}</option>
// //                       {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
// //                     </select>
// //                     {categories.length === 0 && <small className="fp-hint">{t.no_cat}</small>}
// //                   </div>

// //                   {/* Type */}
// //                   <div className="fp-field">
// //                     <label className="fp-label">{t.type}</label>
// //                     <select name="housingType" value={filters.housingType} onChange={handleChange} className="fp-select">
// //                       <option value="">{t.all_types}</option>
// //                       {housingTypes.map(tp => <option key={tp.id} value={tp.id}>{tp.name}</option>)}
// //                     </select>
// //                     {housingTypes.length === 0 && <small className="fp-hint">{t.no_types}</small>}
// //                   </div>

// //                   {/* Région */}
// //                   <div className="fp-field">
// //                     <label className="fp-label">{t.region}</label>
// //                     <select name="region" value={filters.region} onChange={handleChange} className="fp-select">
// //                       <option value="">{t.all_regions}</option>
// //                       {regions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
// //                     </select>
// //                   </div>

// //                   {/* Ville */}
// //                   <div className="fp-field">
// //                     <label className="fp-label">
// //                       {t.city}
// //                       {filters.region && <small> {t.city_hint}</small>}
// //                     </label>
// //                     <select name="city" value={filters.city} onChange={handleChange} className="fp-select">
// //                       <option value="">{t.all_cities}</option>
// //                       {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
// //                     </select>
// //                   </div>

// //                   {/* Quartier — visible seulement si ville sélectionnée */}
// //                   {filters.city && (
// //                     <div className="fp-field">
// //                       <label className="fp-label">{t.district}</label>
// //                       <select name="district" value={filters.district} onChange={handleChange} className="fp-select">
// //                         <option value="">{t.all_dist}</option>
// //                         {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
// //                       </select>
// //                       {districts.length === 0 && <small className="fp-hint">{t.no_dist}</small>}
// //                     </div>
// //                   )}

// //                   {/* Prix */}
// //                   <div className="fp-field-row">
// //                     <div className="fp-field">
// //                       <label className="fp-label">{t.price_min}</label>
// //                       <input type="number" name="min_price" value={filters.min_price}
// //                         onChange={handleChange} placeholder="0" min="0" step="5000" className="fp-input" />
// //                     </div>
// //                     <div className="fp-field">
// //                       <label className="fp-label">{t.price_max}</label>
// //                       <input type="number" name="max_price" value={filters.max_price}
// //                         onChange={handleChange} placeholder={t.unlimited} min="0" step="5000" className="fp-input" />
// //                     </div>
// //                   </div>

// //                   {/* Chambres + Surface */}
// //                   <div className="fp-field-row">
// //                     <div className="fp-field">
// //                       <label className="fp-label">{t.rooms}</label>
// //                       <input type="number" name="min_rooms" value={filters.min_rooms}
// //                         onChange={handleChange} placeholder="0" min="0" max="10" className="fp-input" />
// //                     </div>
// //                     <div className="fp-field">
// //                       <label className="fp-label">{t.area}</label>
// //                       <input type="number" name="min_area" value={filters.min_area}
// //                         onChange={handleChange} placeholder="0" min="0" step="5" className="fp-input" />
// //                     </div>
// //                   </div>

// //                   {/* Statut */}
// //                   <div className="fp-field">
// //                     <label className="fp-label">{t.status}</label>
// //                     <select name="status" value={filters.status} onChange={handleChange} className="fp-select">
// //                       <option value="">{t.all_status}</option>
// //                       <option value="disponible">{t.available}</option>
// //                       <option value="reserve">{t.reserved}</option>
// //                       <option value="occupe">{t.occupied}</option>
// //                     </select>
// //                   </div>
// //                 </>
// //               )}
// //             </div>

// //             {/* Footer */}
// //             <div className="fp-footer">
// //               <button type="button" className="fp-btn-reset" onClick={handleReset} disabled={loading}>
// //                 {t.reset}
// //               </button>
// //               <button type="button" className="fp-btn-apply" onClick={handleApply} disabled={loading}>
// //                 {t.apply}{activeCount > 0 ? ` (${activeCount})` : ''}
// //               </button>
// //             </div>
// //           </div>
// //         </>
// //       )}
// //     </div>
// //   );
// // };

// // export default FilterPanel;


















// // src/components/Search/FilterPanel.jsx
// // ============================================================
// // Props :
// //   onApplyFilters {fn}     (filters) → void
// //   initialFilters {object}
// //   language       {string} 'fr' | 'en'
// //
// // Filtres supportés par housingService.getHousings() :
// //   category, housing_type, region, city, district,
// //   min_price, max_price, rooms__gte, min_area, status
// // ============================================================

// import { useState, useEffect } from 'react';
// import { SlidersHorizontal, X, Loader, ChevronDown } from 'lucide-react';
// import { housingService } from '../../services/housingService';
// import { useTheme } from '../../contexts/ThemeContext';
// import './FilterPanel.css';

// const T = {
//   fr: {
//     btn:          'Filtres',
//     title:        'Filtres de recherche',
//     close:        'Fermer',
//     reset:        'Réinitialiser',
//     apply:        'Appliquer',
//     loading:      'Chargement…',
//     category:     'Catégorie',
//     all_cat:      'Toutes les catégories',
//     no_cat:       'Aucune catégorie',
//     type:         'Type de logement',
//     all_types:    'Tous les types',
//     no_types:     'Aucun type',
//     region:       'Région',
//     all_regions:  'Toutes les régions',
//     city:         'Ville',
//     city_hint:    '(région sélectionnée)',
//     all_cities:   'Toutes les villes',
//     district:     'Quartier',
//     all_dist:     'Tous les quartiers',
//     no_dist:      'Aucun quartier',
//     price_min:    'Prix min (FCFA)',
//     price_max:    'Prix max (FCFA)',
//     unlimited:    'Illimité',
//     rooms:        'Chambres min',
//     area:         'Surface min (m²)',
//     status:       'Statut',
//     all_status:   'Tous les statuts',
//     available:    'Disponible',
//     reserved:     'Réservé',
//     occupied:     'Occupé',
//   },
//   en: {
//     btn:          'Filters',
//     title:        'Search filters',
//     close:        'Close',
//     reset:        'Reset',
//     apply:        'Apply',
//     loading:      'Loading…',
//     category:     'Category',
//     all_cat:      'All categories',
//     no_cat:       'No categories',
//     type:         'Housing type',
//     all_types:    'All types',
//     no_types:     'No types',
//     region:       'Region',
//     all_regions:  'All regions',
//     city:         'City',
//     city_hint:    '(selected region)',
//     all_cities:   'All cities',
//     district:     'Neighborhood',
//     all_dist:     'All neighborhoods',
//     no_dist:      'No neighborhoods',
//     price_min:    'Min price (FCFA)',
//     price_max:    'Max price (FCFA)',
//     unlimited:    'No limit',
//     rooms:        'Min bedrooms',
//     area:         'Min area (m²)',
//     status:       'Status',
//     all_status:   'All statuses',
//     available:    'Available',
//     reserved:     'Reserved',
//     occupied:     'Occupied',
//   },
// };

// const EMPTY = {
//   category: '', housing_type: '', region: '', city: '', district: '',
//   min_price: '', max_price: '', rooms__gte: '', min_area: '', status: 'disponible',
// };

// const FilterPanel = ({ onApplyFilters, initialFilters = {}, language: langProp }) => {
//   const { language: langCtx } = useTheme();
//   const lang = langProp || langCtx || 'fr';
//   const t    = T[lang] || T.fr;

//   const [isOpen,  setIsOpen]  = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [filters, setFilters] = useState({ ...EMPTY, ...initialFilters });

//   const [categories,   setCategories]   = useState([]);
//   const [housingTypes, setHousingTypes] = useState([]);
//   const [regions,      setRegions]      = useState([]);
//   const [cities,       setCities]       = useState([]);
//   const [districts,    setDistricts]    = useState([]);

//   // ── Rechargement quand la langue change ─────────────────
//   useEffect(() => {
//     loadAll();
//   // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [lang]);

//   // ── Villes réactives à la région ────────────────────────
//   useEffect(() => {
//     if (filters.region) {
//       loadCities(filters.region);
//     } else {
//       loadCities(null);
//     }
//   // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [filters.region, lang]);

//   // ── Quartiers réactifs à la ville ───────────────────────
//   useEffect(() => {
//     if (filters.city) {
//       loadDistricts(filters.city);
//     } else {
//       setDistricts([]);
//     }
//   // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [filters.city, lang]);

//   // ── Loaders ─────────────────────────────────────────────
//   const loadAll = async () => {
//     setLoading(true);
//     try {
//       const [cats, types, regs, citiesData] = await Promise.all([
//         housingService.getCategories(),
//         housingService.getHousingTypes(),
//         housingService.getRegions(),
//         housingService.getCities(),
//       ]);
//       setCategories(Array.isArray(cats)       ? cats       : []);
//       setHousingTypes(Array.isArray(types)    ? types      : []);
//       setRegions(Array.isArray(regs)           ? regs       : []);
//       setCities(Array.isArray(citiesData)      ? citiesData : []);
//     } catch (e) {
//       console.error('Erreur filtres:', e);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const loadCities = async (regionId) => {
//     try {
//       const data = await housingService.getCities(regionId || undefined);
//       setCities(Array.isArray(data) ? data : []);
//       if (regionId) {
//         // Réinitialiser ville et quartier quand région change
//         setFilters(p => ({ ...p, city: '', district: '' }));
//         setDistricts([]);
//       }
//     } catch (e) {
//       console.error('Erreur villes:', e);
//     }
//   };

//   const loadDistricts = async (cityId) => {
//     try {
//       const data = await housingService.getDistricts(cityId);
//       setDistricts(Array.isArray(data) ? data : []);
//     } catch (e) {
//       console.error('Erreur quartiers:', e);
//     }
//   };

//   // ── Gestion ─────────────────────────────────────────────
//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFilters(p => ({ ...p, [name]: value }));
//   };

//   const handleApply = () => {
//     const clean = Object.fromEntries(
//       Object.entries(filters).filter(([, v]) => v !== '' && v != null)
//     );
//     onApplyFilters(clean);
//     setIsOpen(false);
//   };

//   const handleReset = () => {
//     setFilters({ ...EMPTY });
//     onApplyFilters({});
//   };

//   const activeCount = Object.entries(filters).filter(
//     ([k, v]) => v !== '' && v != null && !(k === 'status' && v === 'disponible')
//   ).length;

//   // ── Rendu ─────────────────────────────────────────────────
//   return (
//     <div className="fp-root">

//       {/* ── Bouton ── */}
//       <button
//         type="button"
//         className={`fp-toggle ${isOpen ? 'fp-toggle--open' : ''}`}
//         onClick={() => setIsOpen(o => !o)}
//         aria-expanded={isOpen}
//         aria-haspopup="true"
//       >
//         <SlidersHorizontal size={17} />
//         <span>{t.btn}</span>
//         {activeCount > 0 && <span className="fp-count">{activeCount}</span>}
//         <ChevronDown size={13} className={`fp-chevron ${isOpen ? 'fp-chevron--open' : ''}`} />
//       </button>

//       {/* ── Panneau ── */}
//       {isOpen && (
//         <>
//           <div className="fp-overlay" onClick={() => setIsOpen(false)} />

//           <div className="fp-panel" role="dialog" aria-label={t.title}>

//             <div className="fp-header">
//               <h3>{t.title}</h3>
//               <button
//                 type="button"
//                 className="fp-close"
//                 onClick={() => setIsOpen(false)}
//                 aria-label={t.close}
//               >
//                 <X size={18} />
//               </button>
//             </div>

//             <div className="fp-body">
//               {loading ? (
//                 <div className="fp-loading">
//                   <Loader className="fp-spin" size={22} />
//                   <span>{t.loading}</span>
//                 </div>
//               ) : (
//                 <>
//                   {/* Catégorie */}
//                   <div className="fp-field">
//                     <label className="fp-label">{t.category}</label>
//                     <select name="category" value={filters.category} onChange={handleChange} className="fp-select">
//                       <option value="">{t.all_cat}</option>
//                       {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
//                     </select>
//                     {categories.length === 0 && <small className="fp-hint">{t.no_cat}</small>}
//                   </div>

//                   {/* Type */}
//                   <div className="fp-field">
//                     <label className="fp-label">{t.type}</label>
//                     <select name="housing_type" value={filters.housing_type} onChange={handleChange} className="fp-select">
//                       <option value="">{t.all_types}</option>
//                       {housingTypes.map(tp => <option key={tp.id} value={tp.id}>{tp.name}</option>)}
//                     </select>
//                     {housingTypes.length === 0 && <small className="fp-hint">{t.no_types}</small>}
//                   </div>

//                   {/* Région */}
//                   <div className="fp-field">
//                     <label className="fp-label">{t.region}</label>
//                     <select name="region" value={filters.region} onChange={handleChange} className="fp-select">
//                       <option value="">{t.all_regions}</option>
//                       {regions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
//                     </select>
//                   </div>

//                   {/* Ville */}
//                   <div className="fp-field">
//                     <label className="fp-label">
//                       {t.city}
//                       {filters.region && <small> {t.city_hint}</small>}
//                     </label>
//                     <select name="city" value={filters.city} onChange={handleChange} className="fp-select">
//                       <option value="">{t.all_cities}</option>
//                       {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
//                     </select>
//                   </div>

//                   {/* Quartier — visible seulement si ville sélectionnée */}
//                   {filters.city && (
//                     <div className="fp-field">
//                       <label className="fp-label">{t.district}</label>
//                       <select name="district" value={filters.district} onChange={handleChange} className="fp-select">
//                         <option value="">{t.all_dist}</option>
//                         {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
//                       </select>
//                       {districts.length === 0 && <small className="fp-hint">{t.no_dist}</small>}
//                     </div>
//                   )}

//                   {/* Prix */}
//                   <div className="fp-field-row">
//                     <div className="fp-field">
//                       <label className="fp-label">{t.price_min}</label>
//                       <input type="number" name="min_price" value={filters.min_price}
//                         onChange={handleChange} placeholder="0" min="0" step="5000" className="fp-input" />
//                     </div>
//                     <div className="fp-field">
//                       <label className="fp-label">{t.price_max}</label>
//                       <input type="number" name="max_price" value={filters.max_price}
//                         onChange={handleChange} placeholder={t.unlimited} min="0" step="5000" className="fp-input" />
//                     </div>
//                   </div>

//                   {/* Chambres + Surface */}
//                   <div className="fp-field-row">
//                     <div className="fp-field">
//                       <label className="fp-label">{t.rooms}</label>
//                       <input type="number" name="rooms__gte" value={filters.rooms__gte}
//                         onChange={handleChange} placeholder="0" min="0" max="10" className="fp-input" />
//                     </div>
//                     <div className="fp-field">
//                       <label className="fp-label">{t.area}</label>
//                       <input type="number" name="min_area" value={filters.min_area}
//                         onChange={handleChange} placeholder="0" min="0" step="5" className="fp-input" />
//                     </div>
//                   </div>

//                   {/* Statut */}
//                   <div className="fp-field">
//                     <label className="fp-label">{t.status}</label>
//                     <select name="status" value={filters.status} onChange={handleChange} className="fp-select">
//                       <option value="">{t.all_status}</option>
//                       <option value="disponible">{t.available}</option>
//                       <option value="reserve">{t.reserved}</option>
//                       <option value="occupe">{t.occupied}</option>
//                     </select>
//                   </div>
//                 </>
//               )}
//             </div>

//             {/* Footer */}
//             <div className="fp-footer">
//               <button type="button" className="fp-btn-reset" onClick={handleReset} disabled={loading}>
//                 {t.reset}
//               </button>
//               <button type="button" className="fp-btn-apply" onClick={handleApply} disabled={loading}>
//                 {t.apply}{activeCount > 0 ? ` (${activeCount})` : ''}
//               </button>
//             </div>
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default FilterPanel;


// src/components/Search/FilterPanel.jsx — CORRECTION FINALE
// ============================================================
// Paramètres exacts confirmés dans apps/housing/filters.py :
//
//  Champ FilterPanel  │ Paramètre URL      │ HousingFilter
//  ───────────────────┼────────────────────┼──────────────────────
//  category           │ category           │ NumberFilter(category__id)
//  housing_type       │ housing_type       │ Meta fields exact
//  region             │ region             │ Meta fields exact
//  city               │ city               │ Meta fields exact
//  district           │ district           │ Meta fields exact
//  min_price          │ min_price          │ NumberFilter(price gte)
//  max_price          │ max_price          │ NumberFilter(price lte)
//  rooms__gte         │ rooms__gte         │ Meta fields gte
//  min_area           │ min_area           │ NumberFilter(area gte)
//  status             │ status             │ CharFilter(status)
// ============================================================

import { useState, useEffect } from 'react';
import { SlidersHorizontal, X, Loader, ChevronDown } from 'lucide-react';
import { housingService } from '../../services/housingService';
import { useTheme } from '../../contexts/ThemeContext';
import './FilterPanel.css';

const T = {
  fr: {
    btn:          'Filtres',
    title:        'Filtres de recherche',
    close:        'Fermer',
    reset:        'Réinitialiser',
    apply:        'Appliquer',
    loading:      'Chargement…',
    category:     'Catégorie',
    all_cat:      'Toutes les catégories',
    no_cat:       'Aucune catégorie',
    type:         'Type de logement',
    all_types:    'Tous les types',
    no_types:     'Aucun type',
    region:       'Région',
    all_regions:  'Toutes les régions',
    city:         'Ville',
    city_hint:    '(région sélectionnée)',
    all_cities:   'Toutes les villes',
    district:     'Quartier',
    all_dist:     'Tous les quartiers',
    no_dist:      'Aucun quartier',
    price_min:    'Prix min (FCFA)',
    price_max:    'Prix max (FCFA)',
    unlimited:    'Illimité',
    rooms:        'Chambres min',
    area:         'Surface min (m²)',
    status:       'Statut',
    all_status:   'Tous les statuts',
    available:    'Disponible',
    reserved:     'Réservé',
    occupied:     'Occupé',
  },
  en: {
    btn:          'Filters',
    title:        'Search filters',
    close:        'Close',
    reset:        'Reset',
    apply:        'Apply',
    loading:      'Loading…',
    category:     'Category',
    all_cat:      'All categories',
    no_cat:       'No categories',
    type:         'Housing type',
    all_types:    'All types',
    no_types:     'No types',
    region:       'Region',
    all_regions:  'All regions',
    city:         'City',
    city_hint:    '(selected region)',
    all_cities:   'All cities',
    district:     'Neighborhood',
    all_dist:     'All neighborhoods',
    no_dist:      'No neighborhoods',
    price_min:    'Min price (FCFA)',
    price_max:    'Max price (FCFA)',
    unlimited:    'No limit',
    rooms:        'Min bedrooms',
    area:         'Min area (m²)',
    status:       'Status',
    all_status:   'All statuses',
    available:    'Available',
    reserved:     'Reserved',
    occupied:     'Occupied',
  },
};

// Valeurs vides — noms EXACTEMENT ceux du HousingFilter Django
const EMPTY = {
  category:     '',   // NumberFilter → category__id
  housing_type: '',   // Meta exact   → housing_type FK id
  region:       '',   // Meta exact   → region FK id
  city:         '',   // Meta exact   → city FK id
  district:     '',   // Meta exact   → district FK id
  min_price:    '',   // NumberFilter → price__gte
  max_price:    '',   // NumberFilter → price__lte
  'rooms__gte': '',   // Meta gte     → rooms__gte
  min_area:     '',   // NumberFilter → area__gte
  status:       'disponible',
};

const FilterPanel = ({ onApplyFilters, initialFilters = {}, language: langProp }) => {
  const { language: langCtx } = useTheme();
  const lang = langProp || langCtx || 'fr';
  const t    = T[lang] || T.fr;

  const [isOpen,  setIsOpen]  = useState(false);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ ...EMPTY, ...initialFilters });

  const [categories,   setCategories]   = useState([]);
  const [housingTypes, setHousingTypes] = useState([]);
  const [regions,      setRegions]      = useState([]);
  const [cities,       setCities]       = useState([]);
  const [districts,    setDistricts]    = useState([]);

  // Rechargement quand la langue change
  useEffect(() => { loadAll(); }, [lang]); // eslint-disable-line

  // Villes selon région
  useEffect(() => {
    filters.region ? loadCities(filters.region) : loadCities(null);
  }, [filters.region, lang]); // eslint-disable-line

  // Quartiers selon ville
  useEffect(() => {
    if (filters.city) loadDistricts(filters.city);
    else setDistricts([]);
  }, [filters.city, lang]); // eslint-disable-line

  const loadAll = async () => {
    setLoading(true);
    try {
      const [cats, types, regs, citiesData] = await Promise.all([
        housingService.getCategories(),
        housingService.getHousingTypes(),
        housingService.getRegions(),
        housingService.getCities(),
      ]);
      setCategories(Array.isArray(cats)      ? cats      : []);
      setHousingTypes(Array.isArray(types)   ? types     : []);
      setRegions(Array.isArray(regs)          ? regs      : []);
      setCities(Array.isArray(citiesData)     ? citiesData: []);
    } catch (e) {
      console.error('Erreur chargement filtres:', e);
    } finally {
      setLoading(false);
    }
  };

  const loadCities = async (regionId) => {
    try {
      const data = await housingService.getCities(regionId || undefined);
      setCities(Array.isArray(data) ? data : []);
      // Reset ville + quartier si région change
      if (regionId) {
        setFilters(p => ({ ...p, city: '', district: '' }));
        setDistricts([]);
      }
    } catch (e) { console.error('Erreur villes:', e); }
  };

  const loadDistricts = async (cityId) => {
    try {
      const data = await housingService.getDistricts(cityId);
      setDistricts(Array.isArray(data) ? data : []);
    } catch (e) { console.error('Erreur quartiers:', e); }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(p => ({ ...p, [name]: value }));
  };

  const handleApply = () => {
    // Envoyer uniquement les valeurs non-vides
    const clean = Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v !== '' && v !== null && v !== undefined)
    );
    console.log('✅ Filtres appliqués:', clean);
    onApplyFilters(clean);
    setIsOpen(false);
  };

  const handleReset = () => {
    setFilters({ ...EMPTY });
    onApplyFilters({});
  };

  const activeCount = Object.entries(filters).filter(
    ([k, v]) => v !== '' && v != null && !(k === 'status' && v === 'disponible')
  ).length;

  return (
    <div className="fp-root">

      {/* ── Bouton ── */}
      <button
        type="button"
        className={`fp-toggle ${isOpen ? 'fp-toggle--open' : ''}`}
        onClick={() => setIsOpen(o => !o)}
        aria-expanded={isOpen}
      >
        <SlidersHorizontal size={17} />
        <span>{t.btn}</span>
        {activeCount > 0 && <span className="fp-count">{activeCount}</span>}
        <ChevronDown size={13} className={`fp-chevron ${isOpen ? 'fp-chevron--open' : ''}`} />
      </button>

      {/* ── Panneau ── */}
      {isOpen && (
        <>
          <div className="fp-overlay" onClick={() => setIsOpen(false)} />

          <div className="fp-panel" role="dialog" aria-label={t.title}>
            <div className="fp-header">
              <h3>{t.title}</h3>
              <button type="button" className="fp-close" onClick={() => setIsOpen(false)} aria-label={t.close}>
                <X size={18} />
              </button>
            </div>

            <div className="fp-body">
              {loading ? (
                <div className="fp-loading">
                  <Loader className="fp-spin" size={22} />
                  <span>{t.loading}</span>
                </div>
              ) : (
                <>
                  {/* Catégorie — name="category" → backend: category (NumberFilter sur category__id) */}
                  <div className="fp-field">
                    <label className="fp-label">{t.category}</label>
                    <select name="category" value={filters.category} onChange={handleChange} className="fp-select">
                      <option value="">{t.all_cat}</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    {categories.length === 0 && <small className="fp-hint">{t.no_cat}</small>}
                  </div>

                  {/* Type — name="housing_type" → backend: housing_type (FK exact) */}
                  <div className="fp-field">
                    <label className="fp-label">{t.type}</label>
                    <select name="housing_type" value={filters.housing_type} onChange={handleChange} className="fp-select">
                      <option value="">{t.all_types}</option>
                      {housingTypes.map(tp => <option key={tp.id} value={tp.id}>{tp.name}</option>)}
                    </select>
                    {housingTypes.length === 0 && <small className="fp-hint">{t.no_types}</small>}
                  </div>

                  {/* Région — name="region" → backend: region (FK exact) */}
                  <div className="fp-field">
                    <label className="fp-label">{t.region}</label>
                    <select name="region" value={filters.region} onChange={handleChange} className="fp-select">
                      <option value="">{t.all_regions}</option>
                      {regions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                  </div>

                  {/* Ville — name="city" → backend: city (FK exact) */}
                  <div className="fp-field">
                    <label className="fp-label">
                      {t.city}
                      {filters.region && <small> {t.city_hint}</small>}
                    </label>
                    <select name="city" value={filters.city} onChange={handleChange} className="fp-select">
                      <option value="">{t.all_cities}</option>
                      {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>

                  {/* Quartier — name="district" → backend: district (FK exact) */}
                  {filters.city && (
                    <div className="fp-field">
                      <label className="fp-label">{t.district}</label>
                      <select name="district" value={filters.district} onChange={handleChange} className="fp-select">
                        <option value="">{t.all_dist}</option>
                        {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                      </select>
                      {districts.length === 0 && <small className="fp-hint">{t.no_dist}</small>}
                    </div>
                  )}

                  {/* Prix — min_price / max_price → backend: NumberFilter */}
                  <div className="fp-field-row">
                    <div className="fp-field">
                      <label className="fp-label">{t.price_min}</label>
                      <input
                        type="number" name="min_price" value={filters.min_price}
                        onChange={handleChange} placeholder="0" min="0" step="5000"
                        className="fp-input"
                      />
                    </div>
                    <div className="fp-field">
                      <label className="fp-label">{t.price_max}</label>
                      <input
                        type="number" name="max_price" value={filters.max_price}
                        onChange={handleChange} placeholder={t.unlimited} min="0" step="5000"
                        className="fp-input"
                      />
                    </div>
                  </div>

                  {/* Chambres + Surface */}
                  <div className="fp-field-row">
                    {/* rooms__gte → backend: Meta fields rooms gte */}
                    <div className="fp-field">
                      <label className="fp-label">{t.rooms}</label>
                      <input
                        type="number" name="rooms__gte" value={filters['rooms__gte']}
                        onChange={handleChange} placeholder="0" min="0" max="10"
                        className="fp-input"
                      />
                    </div>
                    {/* min_area → backend: NumberFilter area gte */}
                    <div className="fp-field">
                      <label className="fp-label">{t.area}</label>
                      <input
                        type="number" name="min_area" value={filters.min_area}
                        onChange={handleChange} placeholder="0" min="0" step="5"
                        className="fp-input"
                      />
                    </div>
                  </div>

                  {/* Statut — name="status" → backend: CharFilter */}
                  <div className="fp-field">
                    <label className="fp-label">{t.status}</label>
                    <select name="status" value={filters.status} onChange={handleChange} className="fp-select">
                      <option value="">{t.all_status}</option>
                      <option value="disponible">{t.available}</option>
                      <option value="reserve">{t.reserved}</option>
                      <option value="occupe">{t.occupied}</option>
                    </select>
                  </div>
                </>
              )}
            </div>

            <div className="fp-footer">
              <button type="button" className="fp-btn-reset" onClick={handleReset} disabled={loading}>
                {t.reset}
              </button>
              <button type="button" className="fp-btn-apply" onClick={handleApply} disabled={loading}>
                {t.apply}{activeCount > 0 ? ` (${activeCount})` : ''}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default FilterPanel;


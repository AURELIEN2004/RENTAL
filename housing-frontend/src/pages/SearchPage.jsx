
// // // // // src/pages/SearchPage.jsx — VERSION FINALE SIMPLE
// // // // // ============================================================
// // // // // Architecture claire et directe :
// // // // //  • Filtre  → api.get('/housings/', { params })  (directo)
// // // // //  • Texte   → searchService.nlpSearch()
// // // // //  • Vocal   → searchService.nlpSearch()
// // // // //  • GPS     → searchService.nlpSearch() + coords
// // // // //
// // // // // Problème corrigé : 
// // // // //  • Plus de double-appel (handleFilters ne fait PAS navigate)
// // // // //  • Plus de useCallback/stateRef complexe
// // // // //  • api importé directement pour bypasser toute abstraction
// // // // // ============================================================

// // // // import { useState, useEffect } from 'react';
// // // // import { useLocation, useNavigate } from 'react-router-dom';
// // // // import { Loader, MapPin, TrendingUp, Sparkles } from 'lucide-react';

// // // // import { useTheme }       from '../contexts/ThemeContext';
// // // // import searchService      from '../services/searchService';
// // // // import api                from '../services/api';

// // // // import SearchBar    from '../components/Search/SearchBar';
// // // // import FilterPanel  from '../components/Search/FilterPanel';
// // // // import NearMeButton from '../components/Search/NearMeButton';
// // // // import VoiceSearch  from '../components/Search/VoiceSearch';
// // // // import HousingList  from '../components/housing/HousingList';

// // // // import './SearchPage.css';

// // // // const T = {
// // // //   fr: {
// // // //     title:        'Rechercher un logement',
// // // //     subtitle:     'Trouvez le logement idéal au Cameroun',
// // // //     results:      'résultat(s)',
// // // //     loading:      'Recherche en cours…',
// // // //     retry:        'Réessayer',
// // // //     no_result:    'Aucun résultat',
// // // //     no_sub:       'Essayez d\'ajuster vos critères',
// // // //     reset:        'Réinitialiser',
// // // //     b_nearby:     'Autour de votre position',
// // // //     b_nlp:        'Recherche intelligente',
// // // //     b_voice:      'Recherche vocale',
// // // //     b_filters:    'filtre(s) actif(s)',
// // // //     suggestions:  'Suggestions :',
// // // //     error:        'Erreur de recherche. Veuillez réessayer.',
// // // //   },
// // // //   en: {
// // // //     title:        'Find housing',
// // // //     subtitle:     'Find your ideal home in Cameroon',
// // // //     results:      'result(s)',
// // // //     loading:      'Searching…',
// // // //     retry:        'Retry',
// // // //     no_result:    'No results found',
// // // //     no_sub:       'Try adjusting your criteria',
// // // //     reset:        'Reset',
// // // //     b_nearby:     'Near your location',
// // // //     b_nlp:        'Smart search',
// // // //     b_voice:      'Voice search',
// // // //     b_filters:    'active filter(s)',
// // // //     suggestions:  'Suggestions:',
// // // //     error:        'Search error. Please try again.',
// // // //   },
// // // // };

// // // // // ────────────────────────────────────────────────────────────
// // // // const SearchPage = () => {
// // // //   const location     = useLocation();
// // // //   const navigate     = useNavigate();
// // // //   const { language } = useTheme();
// // // //   const t            = T[language] || T.fr;

// // // //   const [housings,      setHousings]      = useState([]);
// // // //   const [loading,       setLoading]       = useState(false);
// // // //   const [error,         setError]         = useState(null);
// // // //   const [count,         setCount]         = useState(null);
// // // //   const [suggestions,   setSuggestions]   = useState([]);
// // // //   const [nlpSummary,    setNlpSummary]    = useState('');
// // // //   const [mode,          setMode]          = useState('default');
// // // //   const [userLocation,  setUserLocation]  = useState(null);
// // // //   const [activeFilters, setActiveFilters] = useState({});

// // // //   // ── Init + rechargement auto sur changement de langue ────
// // // //   useEffect(() => {
// // // //     const params = new URLSearchParams(location.search);
// // // //     const query  = params.get('query');
// // // //     if (query) {
// // // //       setMode('nlp');
// // // //       doNlp(query, null);
// // // //     } else {
// // // //       doDefault();
// // // //     }
// // // //   // eslint-disable-next-line react-hooks/exhaustive-deps
// // // //   }, [language]);

// // // //   // ─────────────────────────────────────────────────────────
// // // //   // FONCTIONS DE RECHERCHE
// // // //   // ---------------------------------------------------------

// // // //   const startSearch = () => {
// // // //     setLoading(true);
// // // //     setError(null);
// // // //     setSuggestions([]);
// // // //   };

// // // //   const setResults = (list, total) => {
// // // //     setHousings(list);
// // // //     setCount(total !== undefined ? total : list.length);
// // // //   };

// // // //   const onError = (e) => {
// // // //     console.error('Search error:', e);
// // // //     setError(t.error);
// // // //     setHousings([]);
// // // //     setCount(0);
// // // //   };

// // // //   // 1 ─ Default : tous les logements disponibles
// // // //   const doDefault = async () => {
// // // //     startSearch();
// // // //     setNlpSummary('');
// // // //     try {
// // // //       const res = await api.get('/housings/', {
// // // //         params: { status: 'disponible', ordering: '-created_at' },
// // // //       });
// // // //       const list = toList(res.data);
// // // //       setResults(list, res.data?.count);
// // // //     } catch (e) { onError(e); }
// // // //     finally { setLoading(false); }
// // // //   };

// // // //   // 2 ─ NLP / vocal
// // // //   const doNlp = async (query, coords) => {
// // // //     if (!query?.trim()) { doDefault(); return; }
// // // //     startSearch();
// // // //     try {
// // // //       const payload = { query: query.trim(), language };
// // // //       if (coords) { payload.user_lat = coords.lat; payload.user_lng = coords.lng; }
// // // //       const data = await searchService.nlpSearch(payload);
// // // //       setResults(data.results || [], data.count);
// // // //       setNlpSummary(data.criteria_summary || '');
// // // //       setSuggestions(data.suggestions || []);
// // // //     } catch (e) { onError(e); }
// // // //     finally { setLoading(false); }
// // // //   };

// // // //   // 3 ─ Filtres structurés → GET /housings/ directement
// // // //   const doFilters = async (filters) => {
// // // //     startSearch();
// // // //     setNlpSummary('');
// // // //     try {
// // // //       // Construire les params — garder uniquement les valeurs non-vides
// // // //       const params = {};
// // // //       Object.entries(filters).forEach(([k, v]) => {
// // // //         if (v !== '' && v !== null && v !== undefined) {
// // // //           params[k] = v;
// // // //         }
// // // //       });
// // // //       if (!params.status) params.status = 'disponible';

// // // //       console.log('🔍 Filtres → /housings/ :', params);

// // // //       const res = await api.get('/housings/', { params });
// // // //       const list = toList(res.data);
// // // //       setResults(list, res.data?.count);
// // // //     } catch (e) { onError(e); }
// // // //     finally { setLoading(false); }
// // // //   };

// // // //   // 4 ─ Près de moi
// // // //   const doNearby = async (coords) => {
// // // //     startSearch();
// // // //     setNlpSummary('');
// // // //     try {
// // // //       const data = await searchService.nlpSearch({
// // // //         query:    language === 'fr' ? 'logement disponible' : 'available housing',
// // // //         language,
// // // //         user_lat: coords.lat,
// // // //         user_lng: coords.lng,
// // // //       });
// // // //       setResults(data.results || [], data.count);
// // // //     } catch (e) { onError(e); }
// // // //     finally { setLoading(false); }
// // // //   };

// // // //   // Extraire la liste depuis la réponse DRF (paginée ou non)
// // // //   const toList = (data) => {
// // // //     if (Array.isArray(data))   return data;
// // // //     if (data?.results)         return data.results;
// // // //     return [];
// // // //   };

// // // //   // ─────────────────────────────────────────────────────────
// // // //   // HANDLERS UI
// // // //   // ---------------------------------------------------------

// // // //   const handleSearch = ({ query }) => {
// // // //     setMode('nlp');
// // // //     setActiveFilters({});
// // // //     navigate(`/search?query=${encodeURIComponent(query)}`, { replace: true });
// // // //     doNlp(query, userLocation);
// // // //   };

// // // //   const handleVoiceTranscript = (transcript) => {
// // // //     setMode('voice');
// // // //     setActiveFilters({});
// // // //     doNlp(transcript, userLocation);
// // // //   };

// // // //   // ⚠️ Pas de navigate ici → évite de redéclencher useEffect → pas de double-appel
// // // //   const handleFilters = (newFilters) => {
// // // //     setActiveFilters(newFilters);
// // // //     setMode('filters');
// // // //     setNlpSummary('');
// // // //     doFilters(newFilters);
// // // //   };

// // // //   const handleNearby = (coords) => {
// // // //     setUserLocation(coords);
// // // //     setMode('nearby');
// // // //     setActiveFilters({});
// // // //     doNearby(coords);
// // // //   };

// // // //   const handleSuggestion = (text) => {
// // // //     setMode('nlp');
// // // //     doNlp(text, null);
// // // //   };

// // // //   const handleClearNLP = () => {
// // // //     setNlpSummary('');
// // // //     setActiveFilters({});
// // // //     setMode('default');
// // // //     setUserLocation(null);
// // // //     navigate('/search', { replace: true });
// // // //     doDefault();
// // // //   };

// // // //   const handleReset = () => {
// // // //     setActiveFilters({});
// // // //     setNlpSummary('');
// // // //     setUserLocation(null);
// // // //     setMode('default');
// // // //     setSuggestions([]);
// // // //     navigate('/search', { replace: true });
// // // //     doDefault();
// // // //   };

// // // //   // ─────────────────────────────────────────────────────────
// // // //   const filterCount  = Object.values(activeFilters).filter(v => v !== '' && v != null).length;
// // // //   const isNlpMode    = mode === 'nlp' || mode === 'voice';

// // // //   return (
// // // //     <div className="search-page">

// // // //       {/* ══ EN-TÊTE ══════════════════════════════════════════ */}
// // // //       <div className="sp-header">
// // // //         <div className="container">
// // // //           <div className="sp-header-text">
// // // //             <h1 className="sp-title">{t.title}</h1>
// // // //             <p className="sp-subtitle">{t.subtitle}</p>
// // // //           </div>

// // // //           <div className="sp-controls">
// // // //             <SearchBar
// // // //               onSearch={handleSearch}
// // // //               loading={loading}
// // // //               criteriaSummary={nlpSummary}
// // // //               onClearNLP={handleClearNLP}
// // // //               language={language}
// // // //             />
// // // //             <div className="sp-actions">
// // // //               <VoiceSearch
// // // //                 onTranscript={handleVoiceTranscript}
// // // //                 onError={(msg) => setError(msg)}
// // // //                 language={language}
// // // //               />
// // // //               <NearMeButton
// // // //                 onLocationFound={handleNearby}
// // // //                 onError={(msg) => setError(msg)}
// // // //                 language={language}
// // // //               />
// // // //               <FilterPanel
// // // //                 onApplyFilters={handleFilters}
// // // //                 initialFilters={activeFilters}
// // // //                 language={language}
// // // //               />
// // // //             </div>
// // // //           </div>

// // // //           {mode !== 'default' && (
// // // //             <div className="sp-badges">
// // // //               {mode === 'nearby' && (
// // // //                 <span className="sp-badge sp-badge--nearby">
// // // //                   <MapPin size={12} /> {t.b_nearby}
// // // //                 </span>
// // // //               )}
// // // //               {isNlpMode && (
// // // //                 <span className="sp-badge sp-badge--nlp">
// // // //                   <Sparkles size={12} />
// // // //                   {mode === 'voice' ? t.b_voice : t.b_nlp}
// // // //                 </span>
// // // //               )}
// // // //               {mode === 'filters' && filterCount > 0 && (
// // // //                 <span className="sp-badge sp-badge--filters">
// // // //                   {filterCount} {t.b_filters}
// // // //                 </span>
// // // //               )}
// // // //             </div>
// // // //           )}
// // // //         </div>
// // // //       </div>

// // // //       {/* ══ CONTENU ══════════════════════════════════════════ */}
// // // //       <div className="container sp-content">

// // // //         {!loading && count !== null && (
// // // //           <div className="sp-toolbar">
// // // //             <span className="sp-count">
// // // //               <strong>{count}</strong> {t.results}
// // // //             </span>
// // // //           </div>
// // // //         )}

// // // //         {loading && (
// // // //           <div className="sp-loading">
// // // //             <Loader className="sp-spinner" size={36} />
// // // //             <p>{t.loading}</p>
// // // //           </div>
// // // //         )}

// // // //         {!loading && error && (
// // // //           <div className="sp-error">
// // // //             <p>{error}</p>
// // // //             <button className="sp-retry" onClick={handleReset}>{t.retry}</button>
// // // //           </div>
// // // //         )}

// // // //         {!loading && !error && housings.length > 0 && (
// // // //           <HousingList housings={housings} />
// // // //         )}

// // // //         {!loading && !error && housings.length === 0 && count !== null && (
// // // //           <div className="sp-empty">
// // // //             <TrendingUp size={48} className="sp-empty-icon" />
// // // //             <h3>{t.no_result}</h3>
// // // //             <p>{t.no_sub}</p>

// // // //             {suggestions.length > 0 && (
// // // //               <div className="sp-suggestions">
// // // //                 <p>{t.suggestions}</p>
// // // //                 <div className="sp-chips">
// // // //                   {suggestions.map((s, i) => (
// // // //                     <button key={i} className="sp-chip" onClick={() => handleSuggestion(s)}>
// // // //                       {s}
// // // //                     </button>
// // // //                   ))}
// // // //                 </div>
// // // //               </div>
// // // //             )}

// // // //             <button className="sp-reset" onClick={handleReset}>{t.reset}</button>
// // // //           </div>
// // // //         )}
// // // //       </div>
// // // //     </div>
// // // //   );
// // // // };

// // // // export default SearchPage;




// // // // src/pages/SearchPage.jsx — VERSION FUSIONNÉE
// // // // ============================================================
// // // // Fusionne :
// // // //   • Votre SearchPage (NLP, filtres, vocal, near me) ← inchangé
// // // //   • SearchMapPage   (carte Leaflet, itinéraire, comparaison)
// // // //
// // // // npm install leaflet react-leaflet leaflet.markercluster
// // // //
// // // // Dans main.jsx / index.css (une seule fois) :
// // // //   import 'leaflet/dist/leaflet.css';
// // // //   import 'leaflet.markercluster/dist/MarkerCluster.css';
// // // //   import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
// // // // ============================================================

// // // import { useState, useEffect, useRef, useCallback } from 'react';
// // // import { useLocation, useNavigate }  from 'react-router-dom';
// // // import { Loader, MapPin, TrendingUp, Sparkles, Map, List, Columns } from 'lucide-react';
// // // import { MapContainer, TileLayer, useMap } from 'react-leaflet';
// // // import L from 'leaflet';
// // // import 'leaflet.markercluster';

// // // import { useTheme }       from '../contexts/ThemeContext';
// // // import searchService      from '../services/searchService';
// // // import api                from '../services/api';

// // // import SearchBar    from '../components/Search/SearchBar';
// // // import FilterPanel  from '../components/Search/FilterPanel';
// // // import NearMeButton from '../components/Search/NearMeButton';
// // // import VoiceSearch  from '../components/Search/VoiceSearch';
// // // import HousingList  from '../components/housing/HousingList';

// // // import './SearchPage.css';
// // // import './SearchPageMap.css';  // ← nouveau fichier CSS carte

// // // // ─── TRADUCTIONS ─────────────────────────────────────────────
// // // const T = {
// // //   fr: {
// // //     title:       'Rechercher un logement',
// // //     subtitle:    'Trouvez le logement idéal au Cameroun',
// // //     results:     'résultat(s)',
// // //     loading:     'Recherche en cours…',
// // //     retry:       'Réessayer',
// // //     no_result:   'Aucun résultat',
// // //     no_sub:      "Essayez d'ajuster vos critères",
// // //     reset:       'Réinitialiser',
// // //     b_nearby:    'Autour de votre position',
// // //     b_nlp:       'Recherche intelligente',
// // //     b_voice:     'Recherche vocale',
// // //     b_filters:   'filtre(s) actif(s)',
// // //     suggestions: 'Suggestions :',
// // //     error:       'Erreur de recherche. Veuillez réessayer.',
// // //     view_list:   'Liste',
// // //     view_map:    'Carte',
// // //     view_split:  'Mixte',
// // //     on_map:      'logement(s) sur la carte',
// // //     avg_price:   'Prix moyen',
// // //     min_price:   'À partir de',
// // //     detail_title: 'Détails du logement',
// // //     feat_labels: {
// // //       wifi:'WiFi', parking:'Parking', gardien:'Gardien',
// // //       climatisation:'Climatisation', eau:'Eau 24h', electricite:'Électricité',
// // //       piscine:'Piscine', jardin:'Jardin', balcon:'Balcon/Terrasse',
// // //       cuisine:'Cuisine équipée', ascenseur:'Ascenseur', vue:'Vue panoramique',
// // //     },
// // //     itin_title:  'Itinéraire',
// // //     itin_start:  "Détection de votre position…",
// // //     itin_calc:   "Calcul de l'itinéraire…",
// // //     itin_ok:     'Itinéraire calculé vers',
// // //     itin_approx: "Distance à vol d'oiseau utilisée",
// // //     itin_denied: 'Position approx. utilisée (accès refusé)',
// // //     transport:   ['Voiture','Pied','Vélo'],
// // //     distance:    'Distance',
// // //     duration:    'Durée estimée',
// // //     destination: 'Destination',
// // //     compare:     'Comparer',
// // //     compare_max: 'Maximum 3 logements à comparer',
// // //     fav_add:     'Ajouté aux favoris',
// // //     fav_rm:      'Retiré des favoris',
// // //     plan_visit:  'Planifier une visite',
// // //     contact:     'Contacter',
// // //     cmp_launch:  'Comparer',
// // //     cmp_title:   'Comparaison',
// // //     close:       'Fermer',
// // //   },
// // //   en: {
// // //     title:       'Find housing',
// // //     subtitle:    'Find your ideal home in Cameroon',
// // //     results:     'result(s)',
// // //     loading:     'Searching…',
// // //     retry:       'Retry',
// // //     no_result:   'No results found',
// // //     no_sub:      'Try adjusting your criteria',
// // //     reset:       'Reset',
// // //     b_nearby:    'Near your location',
// // //     b_nlp:       'Smart search',
// // //     b_voice:     'Voice search',
// // //     b_filters:   'active filter(s)',
// // //     suggestions: 'Suggestions:',
// // //     error:       'Search error. Please try again.',
// // //     view_list:   'List',
// // //     view_map:    'Map',
// // //     view_split:  'Split',
// // //     on_map:      'listing(s) on map',
// // //     avg_price:   'Avg price',
// // //     min_price:   'From',
// // //     detail_title: 'Property details',
// // //     feat_labels: {
// // //       wifi:'WiFi', parking:'Parking', gardien:'Security',
// // //       climatisation:'A/C', eau:'Water 24h', electricite:'Electricity',
// // //       piscine:'Pool', jardin:'Garden', balcon:'Balcony/Terrace',
// // //       cuisine:'Fitted kitchen', ascenseur:'Elevator', vue:'Panoramic view',
// // //     },
// // //     itin_title:  'Itinerary',
// // //     itin_start:  'Detecting your location…',
// // //     itin_calc:   'Calculating itinerary…',
// // //     itin_ok:     'Itinerary calculated to',
// // //     itin_approx: 'Straight-line distance used',
// // //     itin_denied: 'Approx. location used (access denied)',
// // //     transport:   ['Car','Walking','Cycling'],
// // //     distance:    'Distance',
// // //     duration:    'Est. time',
// // //     destination: 'Destination',
// // //     compare:     'Compare',
// // //     compare_max: 'Max 3 properties to compare',
// // //     fav_add:     'Added to favourites',
// // //     fav_rm:      'Removed from favourites',
// // //     plan_visit:  'Schedule visit',
// // //     contact:     'Contact',
// // //     cmp_launch:  'Compare',
// // //     cmp_title:   'Comparison',
// // //     close:       'Close',
// // //   },
// // // };

// // // // ─── UTILS ───────────────────────────────────────────────────
// // // function haversine(la1, lo1, la2, lo2) {
// // //   const R = 6371, d2r = Math.PI / 180;
// // //   const dLa = (la2 - la1) * d2r, dLo = (lo2 - lo1) * d2r;
// // //   const a = Math.sin(dLa/2)**2 + Math.cos(la1*d2r)*Math.cos(la2*d2r)*Math.sin(dLo/2)**2;
// // //   return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
// // // }

// // // function fmtPrice(p) {
// // //   return p >= 1_000_000 ? (p/1_000_000).toFixed(1)+'M' : Math.round(p/1000)+'k';
// // // }

// // // // ─── STATUS HELPERS ───────────────────────────────────────────
// // // const STATUS_MAP = {
// // //   disponible: { cls: 'sp-badge-dispo', label: { fr: 'Disponible', en: 'Available' } },
// // //   reserve:    { cls: 'sp-badge-res',   label: { fr: 'Réservé',    en: 'Reserved'  } },
// // //   occupe:     { cls: 'sp-badge-occ',   label: { fr: 'Occupé',     en: 'Occupied'  } },
// // // };

// // // // ════════════════════════════════════════════════════════════
// // // // MapController — interne, gère markers/clusters/route
// // // // ════════════════════════════════════════════════════════════
// // // function MapController({ housings, selectedId, onSelect, userLoc, route }) {
// // //   const map         = useMap();
// // //   const clusterRef  = useRef(null);
// // //   const routeRef    = useRef(null);
// // //   const userMkRef   = useRef(null);

// // //   // Cluster group (une seule fois)
// // //   useEffect(() => {
// // //     const cluster = L.markerClusterGroup({
// // //       maxClusterRadius: 60,
// // //       iconCreateFunction: c => L.divIcon({
// // //         html: `<div class="sp-mk-cluster">${c.getChildCount()}</div>`,
// // //         className: '', iconSize: [36, 36],
// // //       }),
// // //     });
// // //     map.addLayer(cluster);
// // //     clusterRef.current = cluster;
// // //     return () => map.removeLayer(cluster);
// // //   }, [map]);

// // //   // Markers
// // //   useEffect(() => {
// // //     if (!clusterRef.current) return;
// // //     clusterRef.current.clearLayers();
// // //     housings.forEach(h => {
// // //       if (!h.latitude || !h.longitude) return;
// // //       const sel  = h.id === selectedId;
// // //       const icon = L.divIcon({
// // //         html: `<div class="sp-mk${sel ? ' sp-mk--sel' : ''}">${fmtPrice(h.price)} FCFA</div>`,
// // //         className: '', iconSize: null, iconAnchor: [44, 14],
// // //       });
// // //       const m = L.marker([h.latitude, h.longitude], { icon });
// // //       m.on('click', () => onSelect(h));
// // //       clusterRef.current.addLayer(m);
// // //     });
// // //   }, [housings, selectedId, onSelect]);

// // //   // Route
// // //   useEffect(() => {
// // //     if (routeRef.current) { map.removeLayer(routeRef.current); routeRef.current = null; }
// // //     if (!route?.length) return;
// // //     const poly = L.polyline(route, { color: '#F59E0B', weight: 5, opacity: .85, dashArray: '10,5' });
// // //     poly.addTo(map); routeRef.current = poly;
// // //     map.fitBounds(poly.getBounds(), { padding: [60, 60] });
// // //   }, [route, map]);

// // //   // User marker
// // //   useEffect(() => {
// // //     if (userMkRef.current) { map.removeLayer(userMkRef.current); userMkRef.current = null; }
// // //     if (!userLoc) return;
// // //     userMkRef.current = L.marker([userLoc.lat, userLoc.lng], {
// // //       icon: L.divIcon({ html: '<div class="sp-user-dot"></div>', className: '', iconSize: [14, 14] }),
// // //     }).addTo(map).bindTooltip('📍 Vous êtes ici');
// // //   }, [userLoc, map]);

// // //   return null;
// // // }

// // // // ════════════════════════════════════════════════════════════
// // // // DetailPanel
// // // // ════════════════════════════════════════════════════════════
// // // // function DetailPanel({ h, t, lang, onClose, onItin, isFav, onFav, inCmp, onCmp, onVisit }) {
// // // //   const st   = STATUS_MAP[h.status] || STATUS_MAP.disponible;
// // // //   const img  = h.images?.find(i => i.is_main) || h.images?.[0];
// // // //   const init = (h.owner_name || '?').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

// // // //   return (
// // // //     <div className="sp-dp">
// // // //       <div className="sp-dp-head">
// // // //         <span className="sp-dp-label"><i className="fas fa-house-chimney" /> {t.detail_title}</span>
// // // //         <button className="sp-dp-close" onClick={onClose} title={t.close}><i className="fas fa-xmark" /></button>
// // // //       </div>
// // // //       <div className="sp-dp-body">
// // // //         {/* Image */}
// // // //         <div className="sp-dp-img">
// // // //           {img
// // // //             ? <img src={img.image} alt={h.title} />
// // // //             : <span className="sp-dp-emoji">{h.category === 'Villa' ? '🏡' : h.category === 'Studio' ? '🏠' : '🏢'}</span>
// // // //           }
// // // //           <div className="sp-dp-img-ov" />
// // // //           <div className="sp-dp-price">{h.price?.toLocaleString('fr-FR')} FCFA<span>/mois</span></div>
// // // //           <span className={`sp-mk-status ${st.cls}`}>{st.label[lang]}</span>
// // // //         </div>

// // // //         <div className="sp-dp-info">
// // // //           <h2 className="sp-dp-h1">{h.title}</h2>
// // // //           <p className="sp-dp-loc"><i className="fas fa-location-dot" /> {h.district_name}, {h.city_name}</p>

// // // //           <div className="sp-dp-stats">
// // // //             {[{v:h.rooms,l:'Chambres'},{v:h.bathrooms,l:'Salles de bain'},{v:`${h.area}m²`,l:'Surface'}].map(({v,l})=>(
// // // //               <div key={l} className="sp-dp-stat"><div className="sp-dp-stat-v">{v}</div><div className="sp-dp-stat-l">{l}</div></div>
// // // //             ))}
// // // //           </div>

// // // //           {(h.features||[]).length > 0 && (
// // // //             <>
// // // //               <span className="sp-dp-sect">Équipements</span>
// // // //               <div className="sp-dp-feats">
// // // //                 {(h.features||[]).map(f=>(
// // // //                   <span key={f} className="sp-dp-feat"><i className={`fas ${FEAT_ICON[f]||'fa-check'}`}/>{t.feat_labels[f]||f}</span>
// // // //                 ))}
// // // //               </div>
// // // //             </>
// // // //           )}

// // // //           {h.description && (
// // // //             <>
// // // //               <span className="sp-dp-sect">Description</span>
// // // //               <p className="sp-dp-desc">{h.description}</p>
// // // //             </>
// // // //           )}

// // // //           <div className="sp-dp-meta">
// // // //             <span><i className="fas fa-eye"/> {h.views_count||0}</span>
// // // //             <span><i className="fas fa-heart" style={{color:'#F85149'}}/> {h.likes_count||0}</span>
// // // //             <span style={{marginLeft:'auto'}}>{h.created_at?.slice(0,10)}</span>
// // // //           </div>
// // // //         </div>

// // // //         {/* Owner */}
// // // //         {h.owner_name && (
// // // //           <div className="sp-dp-owner">
// // // //             <div className="sp-dp-av">{init}</div>
// // // //             <div>
// // // //               <div className="sp-dp-owner-n">{h.owner_name}</div>
// // // //               {h.owner_phone && <div className="sp-dp-owner-r"><i className="fas fa-phone"/> {h.owner_phone}</div>}
// // // //             </div>
// // // //           </div>
// // // //         )}

// // // //         {/* Actions */}
// // // //         <div className="sp-dp-actions">
// // // //           <button className={`sp-dp-btn${isFav?' sp-dp-btn--active':''}`} onClick={()=>onFav(h.id)}>
// // // //             <i className="fas fa-heart" style={{color:'#F85149'}}/> {isFav ? 'Retiré' : 'Favoris'}
// // // //           </button>
// // // //           <button className={`sp-dp-btn${inCmp?' sp-dp-btn--active':''}`} onClick={()=>onCmp(h)}>
// // // //             <i className="fas fa-scale-balanced" style={{color:'#58A6FF'}}/> {t.compare}
// // // //           </button>
// // // //           <button className="sp-dp-btn sp-dp-btn--itin" onClick={()=>onItin(h)}>
// // // //             <i className="fas fa-route"/> Calculer l'itinéraire
// // // //           </button>
// // // //           <button className="sp-dp-btn sp-dp-btn--primary" onClick={()=>onVisit(h)}>
// // // //             <i className="fas fa-calendar-plus"/> {t.plan_visit}
// // // //           </button>
// // // //         </div>
// // // //       </div>
// // // //     </div>
// // // //   );
// // // // }








// // // // ============================================================
// // // // PATCH SearchPage.jsx — Remplacer UNIQUEMENT le composant DetailPanel
// // // // ============================================================
// // // // Trouvez le composant "function DetailPanel" dans SearchPage.jsx
// // // // et remplacez-le ENTIÈREMENT par le code ci-dessous.
// // // //
// // // // Le reste de SearchPage.jsx ne change pas.
// // // // ============================================================

// // // // ─── AJOUTER cet import en haut de SearchPage.jsx ────────────
// // // // (si useNavigate n'est pas déjà importé depuis react-router-dom)
// // // // import { useLocation, useNavigate } from 'react-router-dom';
// // // // → il est déjà importé dans votre fichier ✅

// // // // ════════════════════════════════════════════════════════════
// // // // DetailPanel — Aperçu carte → bouton "Voir les détails complets"
// // // // ════════════════════════════════════════════════════════════
// // // function DetailPanel({ h, t, lang, onClose, onItin, isFav, onFav, inCmp, onCmp }) {
// // //   // useNavigate est disponible car SearchPage.jsx l'importe déjà
// // //   const navigate = useNavigate();   // ← déjà disponible dans le fichier

// // //   const st  = STATUS_MAP[h.status] || STATUS_MAP.disponible;
// // //   const img = h.images?.find(i => i.is_main) || h.images?.[0];
// // //   const init = (h.owner_name || '?').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

// // //   // Naviguer vers la page détail complète
// // //   const goToDetail = () => navigate(`/housings/${h.id}`);

// // //   // Planifier une visite → ouvre la page détail avec modal pré-ouvert
// // //   const goToVisit  = () => navigate(`/housings/${h.id}?action=visit`);

// // //   return (
// // //     <div className="sp-dp">
// // //       {/* ── En-tête ── */}
// // //       <div className="sp-dp-head">
// // //         <span className="sp-dp-label">
// // //           <i className="fas fa-house-chimney" /> Aperçu
// // //         </span>
// // //         <div style={{ display: 'flex', gap: 6 }}>
// // //           {/* Bouton "Voir les détails complets" dans le header */}
// // //           <button
// // //             className="sp-dp-see-more"
// // //             onClick={goToDetail}
// // //             title="Voir la page détail complète"
// // //           >
// // //             <i className="fas fa-arrow-up-right-from-square" /> Voir plus
// // //           </button>
// // //           <button className="sp-dp-close" onClick={onClose} title="Fermer">
// // //             <i className="fas fa-xmark" />
// // //           </button>
// // //         </div>
// // //       </div>

// // //       <div className="sp-dp-body">

// // //         {/* ── Image principale ── */}
// // //         <div
// // //           className="sp-dp-img"
// // //           style={{ cursor: 'pointer' }}
// // //           onClick={goToDetail}
// // //           title="Voir les détails"
// // //         >
// // //           {img
// // //             ? <img src={img.image} alt={h.title} />
// // //             : <span className="sp-dp-emoji">
// // //                 {h.category === 'Villa' ? '🏡' : h.category === 'Studio' ? '🏠' : '🏢'}
// // //               </span>
// // //           }
// // //           <div className="sp-dp-img-ov" />
// // //           <div className="sp-dp-price">
// // //             {h.price?.toLocaleString('fr-FR')} FCFA<span>/mois</span>
// // //           </div>
// // //           <span className={`sp-mk-status ${st.cls}`}>{st.label[lang]}</span>
// // //           {/* Indicateur cliquable */}
// // //           <div className="sp-dp-click-hint">
// // //             <i className="fas fa-expand-alt" /> Voir les détails
// // //           </div>
// // //         </div>

// // //         <div className="sp-dp-info">

// // //           {/* ── Titre & localisation ── */}
// // //           <h2 className="sp-dp-h1" onClick={goToDetail} style={{ cursor: 'pointer' }}>
// // //             {h.title}
// // //           </h2>
// // //           <p className="sp-dp-loc">
// // //             <i className="fas fa-location-dot" />
// // //             {h.district_name || '—'}, {h.city_name || '—'}
// // //           </p>

// // //           {/* ── Stats rapides ── */}
// // //           <div className="sp-dp-stats">
// // //             {[
// // //               { v: h.rooms,      l: 'Chambres'       },
// // //               { v: h.bathrooms,  l: 'Salles de bain' },
// // //               { v: `${h.area}m²`, l: 'Surface'       },
// // //             ].map(({ v, l }) => (
// // //               <div key={l} className="sp-dp-stat">
// // //                 <div className="sp-dp-stat-v">{v}</div>
// // //                 <div className="sp-dp-stat-l">{l}</div>
// // //               </div>
// // //             ))}
// // //           </div>

// // //           {/* ── Équipements (max 4) ── */}
// // //           {(h.features || []).length > 0 && (
// // //             <div className="sp-dp-feats" style={{ marginBottom: 14 }}>
// // //               {(h.features || []).slice(0, 4).map(f => (
// // //                 <span key={f} className="sp-dp-feat">
// // //                   <i className={`fas ${FEAT_ICON[f] || 'fa-check'}`} />
// // //                   {t.feat_labels?.[f] || f}
// // //                 </span>
// // //               ))}
// // //               {(h.features || []).length > 4 && (
// // //                 <span className="sp-dp-feat" style={{ color: 'var(--sp-acc)', cursor: 'pointer' }} onClick={goToDetail}>
// // //                   +{(h.features || []).length - 4} autres
// // //                 </span>
// // //               )}
// // //             </div>
// // //           )}

// // //           {/* ── Propriétaire ── */}
// // //           {h.owner_name && (
// // //             <div className="sp-dp-owner" style={{ margin: '0 0 14px' }}>
// // //               <div className="sp-dp-av">{init}</div>
// // //               <div>
// // //                 <div className="sp-dp-owner-n">{h.owner_name}</div>
// // //                 {h.owner_phone && (
// // //                   <div className="sp-dp-owner-r">
// // //                     <i className="fas fa-phone" /> {h.owner_phone}
// // //                   </div>
// // //                 )}
// // //               </div>
// // //             </div>
// // //           )}

// // //           {/* ── Vues & likes ── */}
// // //           <div className="sp-dp-meta" style={{ marginBottom: 14 }}>
// // //             <span><i className="fas fa-eye" /> {h.views_count || 0}</span>
// // //             <span><i className="fas fa-heart" style={{ color: '#F85149' }} /> {h.likes_count || 0}</span>
// // //             <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--sp-t3)' }}>
// // //               {h.created_at?.slice(0, 10)}
// // //             </span>
// // //           </div>
// // //         </div>

// // //         {/* ── Boutons d'action ── */}
// // //         <div className="sp-dp-actions">

// // //           {/* Favoris */}
// // //           <button
// // //             className={`sp-dp-btn${isFav ? ' sp-dp-btn--active' : ''}`}
// // //             onClick={() => onFav(h.id)}
// // //           >
// // //             <i className="fas fa-heart" style={{ color: '#F85149' }} />
// // //             {isFav ? 'Retiré' : 'Favoris'}
// // //           </button>

// // //           {/* Comparer */}
// // //           <button
// // //             className={`sp-dp-btn${inCmp ? ' sp-dp-btn--active' : ''}`}
// // //             onClick={() => onCmp(h)}
// // //           >
// // //             <i className="fas fa-scale-balanced" style={{ color: '#58A6FF' }} />
// // //             Comparer
// // //           </button>

// // //           {/* Itinéraire */}
// // //           <button className="sp-dp-btn sp-dp-btn--itin" onClick={() => onItin(h)}>
// // //             <i className="fas fa-route" /> Calculer l'itinéraire
// // //           </button>

// // //           {/* Voir les détails complets */}
// // //           <button className="sp-dp-btn sp-dp-btn--details" onClick={goToDetail}>
// // //             <i className="fas fa-arrow-up-right-from-square" /> Voir les détails
// // //           </button>

// // //           {/* Planifier une visite */}
// // //           <button className="sp-dp-btn sp-dp-btn--primary" onClick={goToVisit}>
// // //             <i className="fas fa-calendar-plus" /> Planifier une visite
// // //           </button>

// // //         </div>
// // //       </div>
// // //     </div>
// // //   );
// // // }








// // // const FEAT_ICON = {
// // //   wifi:'fa-wifi', parking:'fa-car', gardien:'fa-shield-halved',
// // //   climatisation:'fa-snowflake', eau:'fa-droplet', electricite:'fa-bolt',
// // //   piscine:'fa-person-swimming', jardin:'fa-leaf', balcon:'fa-door-open',
// // //   cuisine:'fa-utensils', ascenseur:'fa-elevator', vue:'fa-binoculars',
// // // };

// // // // ════════════════════════════════════════════════════════════
// // // // ItineraryPanel
// // // // ════════════════════════════════════════════════════════════
// // // function ItineraryPanel({ t, lang, status, dist, time, dest, progress, transport, onTransport, onClose }) {
// // //   const modes = [
// // //     { k:'driving', ico:'fa-car',            lbl: t.transport[0] },
// // //     { k:'foot',    ico:'fa-person-walking', lbl: t.transport[1] },
// // //     { k:'bike',    ico:'fa-bicycle',        lbl: t.transport[2] },
// // //   ];
// // //   return (
// // //     <div className="sp-itin">
// // //       <div className="sp-itin-inner">
// // //         <div className="sp-itin-hd">
// // //           <span className="sp-itin-title"><i className="fas fa-route"/> {t.itin_title}</span>
// // //           <button className="sp-dp-close" onClick={onClose}><i className="fas fa-xmark"/></button>
// // //         </div>
// // //         <div className="sp-itin-modes">
// // //           {modes.map(m=>(
// // //             <button key={m.k} className={`sp-itin-mode${transport===m.k?' sp-itin-mode--active':''}`} onClick={()=>onTransport(m.k)}>
// // //               <i className={`fas ${m.ico}`}/> {m.lbl}
// // //             </button>
// // //           ))}
// // //         </div>
// // //         <div className="sp-itin-bar"><div className="sp-itin-bar-fill" style={{width:`${progress}%`}}/></div>
// // //         {dist && (
// // //           <div className="sp-itin-stats">
// // //             {[{ico:'fa-road',v:dist,l:t.distance},{ico:'fa-clock',v:time,l:t.duration},{ico:'fa-location-dot',v:dest,l:t.destination}].map(({ico,v,l})=>(
// // //               <div key={l} className="sp-itin-s">
// // //                 <div className="sp-itin-ico"><i className={`fas ${ico}`}/></div>
// // //                 <div><div className="sp-itin-sv">{v}</div><div className="sp-itin-sl">{l}</div></div>
// // //               </div>
// // //             ))}
// // //           </div>
// // //         )}
// // //         <p className="sp-itin-status" dangerouslySetInnerHTML={{__html:status}}/>
// // //       </div>
// // //     </div>
// // //   );
// // // }

// // // // ════════════════════════════════════════════════════════════
// // // // CompareModal
// // // // ════════════════════════════════════════════════════════════
// // // function CompareModal({ list, t, lang, onClose, onRemove }) {
// // //   const rows = [
// // //     { label:'Prix/mois',   fmt:h=>h.price?.toLocaleString('fr-FR')+' FCFA', valFn:h=>h.price, lowBest:true },
// // //     { label:'Catégorie',   fmt:h=>h.category_name||h.category||'—' },
// // //     { label:'Ville',       fmt:h=>`${h.city_name} · ${h.district_name}` },
// // //     { label:'Chambres',    fmt:h=>String(h.rooms||'—'),    valFn:h=>h.rooms||0 },
// // //     { label:'SDB',         fmt:h=>String(h.bathrooms||'—'),valFn:h=>h.bathrooms||0 },
// // //     { label:'Surface',     fmt:h=>(h.area||0)+'m²',        valFn:h=>h.area||0 },
// // //     { label:'Statut',      fmt:h=>STATUS_MAP[h.status]?.label[lang]||h.status },
// // //     { label:'Vues',        fmt:h=>(h.views_count||0).toLocaleString(), valFn:h=>h.views_count||0 },
// // //   ];
// // //   return (
// // //     <div className="sp-cmp-modal" onClick={e=>e.target===e.currentTarget&&onClose()}>
// // //       <div className="sp-cmp-box">
// // //         <div className="sp-cmp-hd">
// // //           <h2><i className="fas fa-scale-balanced" style={{color:'#58A6FF',marginRight:8}}/>{t.cmp_title}</h2>
// // //           <button className="sp-dp-close" onClick={onClose}><i className="fas fa-xmark"/></button>
// // //         </div>
// // //         <div className="sp-cmp-table">
// // //           <div className="sp-cmp-row sp-cmp-head-row">
// // //             <div/>
// // //             {list.map(h=>(
// // //               <div key={h.id} className="sp-cmp-th">
// // //                 <span>{h.title}</span>
// // //                 <button onClick={()=>onRemove(h.id)}><i className="fas fa-xmark"/> Retirer</button>
// // //               </div>
// // //             ))}
// // //           </div>
// // //           {rows.map(({label,fmt,valFn,lowBest})=>{
// // //             let bestIdx=-1;
// // //             if(valFn){const vals=list.map(valFn);const best=lowBest?Math.min(...vals):Math.max(...vals);bestIdx=vals.indexOf(best);}
// // //             return (
// // //               <div key={label} className="sp-cmp-row">
// // //                 <div className="sp-cmp-lbl">{label}</div>
// // //                 {list.map((h,i)=>(
// // //                   <div key={h.id} className={`sp-cmp-val${i===bestIdx?' sp-cmp-val--best':''}`}>{fmt(h)}</div>
// // //                 ))}
// // //               </div>
// // //             );
// // //           })}
// // //         </div>
// // //       </div>
// // //     </div>
// // //   );
// // // }

// // // // ════════════════════════════════════════════════════════════
// // // // Mini HousingCard pour vue Mixte (split)
// // // // ════════════════════════════════════════════════════════════
// // // function MiniCard({ h, selected, onSelect, isFav, onFav, lang }) {
// // //   const st  = STATUS_MAP[h.status] || STATUS_MAP.disponible;
// // //   const img = h.images?.find(i=>i.is_main)||h.images?.[0];
// // //   return (
// // //     <div className={`sp-mini-card${selected?' sp-mini-card--sel':''}`} onClick={()=>onSelect(h)}>
// // //       <div className="sp-mini-img">
// // //         {img ? <img src={img.image} alt={h.title}/> : <span>{h.category==='Villa'?'🏡':'🏢'}</span>}
// // //         <span className={`sp-mk-status ${st.cls}`}>{st.label[lang]}</span>
// // //         <button className={`sp-mini-fav${isFav?' sp-mini-fav--liked':''}`} onClick={e=>{e.stopPropagation();onFav(h.id);}}>
// // //           <i className="fas fa-heart"/>
// // //         </button>
// // //       </div>
// // //       <div className="sp-mini-body">
// // //         <div className="sp-mini-price">{h.price?.toLocaleString('fr-FR')} <span>FCFA</span></div>
// // //         <div className="sp-mini-title">{h.title}</div>
// // //         <div className="sp-mini-loc"><i className="fas fa-location-dot"/>{h.district_name}, {h.city_name}</div>
// // //         <div className="sp-mini-meta">
// // //           <span><i className="fas fa-bed"/>{h.rooms}</span>
// // //           <span><i className="fas fa-bath"/>{h.bathrooms}</span>
// // //           <span><i className="fas fa-ruler-combined"/>{h.area}m²</span>
// // //         </div>
// // //       </div>
// // //     </div>
// // //   );
// // // }

// // // // ════════════════════════════════════════════════════════════
// // // // MAIN PAGE — SearchPage fusionnée
// // // // ════════════════════════════════════════════════════════════
// // // const SearchPage = () => {
// // //   const location     = useLocation();
// // //   const navigate     = useNavigate();
// // //   const { language } = useTheme();
// // //   const t            = T[language] || T.fr;

// // //   // ── Données & états existants ─────────────────────────────
// // //   const [housings,      setHousings]      = useState([]);
// // //   const [loading,       setLoading]       = useState(false);
// // //   const [error,         setError]         = useState(null);
// // //   const [count,         setCount]         = useState(null);
// // //   const [suggestions,   setSuggestions]   = useState([]);
// // //   const [nlpSummary,    setNlpSummary]    = useState('');
// // //   const [mode,          setMode]          = useState('default');
// // //   const [userLocation,  setUserLocation]  = useState(null);
// // //   const [activeFilters, setActiveFilters] = useState({});

// // //   // ── Vue : 'list' | 'map' | 'split' ───────────────────────
// // //   const [viewMode, setViewMode] = useState('list');

// // //   // ── Carte ─────────────────────────────────────────────────
// // //   const [selectedHousing, setSelectedHousing] = useState(null);
// // //   const [route,           setRoute]           = useState(null);
// // //   const [favorites,       setFavorites]       = useState(new Set());
// // //   const [compareList,     setCompareList]     = useState([]);
// // //   const [showCompare,     setShowCompare]     = useState(false);

// // //   // ── Itinéraire ────────────────────────────────────────────
// // //   const [itinOpen,   setItinOpen]   = useState(false);
// // //   const [itinStatus, setItinStatus] = useState('');
// // //   const [itinDist,   setItinDist]   = useState('');
// // //   const [itinTime,   setItinTime]   = useState('');
// // //   const [itinDest,   setItinDest]   = useState('');
// // //   const [itinProg,   setItinProg]   = useState(0);
// // //   const [transport,  setTransport]  = useState('driving');

// // //   // ── Toast ─────────────────────────────────────────────────
// // //   const [toasts, setToasts] = useState([]);
// // //   const addToast = useCallback((msg, type='inf') => {
// // //     const id = Date.now();
// // //     setToasts(p => [...p, {id, msg, type}]);
// // //     setTimeout(() => setToasts(p => p.filter(x=>x.id!==id)), 3500);
// // //   }, []);

// // //   // ── Stats carte ───────────────────────────────────────────
// // //   const mapHousings = housings.filter(h => h.latitude && h.longitude);
// // //   const avg = mapHousings.length ? Math.round(mapHousings.reduce((s,h)=>s+h.price,0)/mapHousings.length) : 0;
// // //   const min = mapHousings.length ? Math.min(...mapHousings.map(h=>h.price)) : 0;

// // //   // ════════════════════════════════════════════════════════
// // //   // LOGIQUE DE RECHERCHE (inchangée depuis votre SearchPage)
// // //   // ════════════════════════════════════════════════════════

// // //   useEffect(() => {
// // //     const params = new URLSearchParams(location.search);
// // //     const query  = params.get('query');
// // //     if (query) { setMode('nlp'); doNlp(query, null); }
// // //     else        { doDefault(); }
// // //   // eslint-disable-next-line react-hooks/exhaustive-deps
// // //   }, [language]);

// // //   const startSearch = () => { setLoading(true); setError(null); setSuggestions([]); };
// // //   const setResults  = (list, total) => { setHousings(list); setCount(total!==undefined?total:list.length); };
// // //   const onSearchErr = e => { console.error(e); setError(t.error); setHousings([]); setCount(0); };
// // //   const toList      = d => Array.isArray(d)?d:(d?.results||[]);

// // //   const doDefault = async () => {
// // //     startSearch(); setNlpSummary('');
// // //     try {
// // //       const res = await api.get('/housings/', { params: { status:'disponible', ordering:'-created_at' } });
// // //       setResults(toList(res.data), res.data?.count);
// // //     } catch(e) { onSearchErr(e); }
// // //     finally { setLoading(false); }
// // //   };

// // //   const doNlp = async (query, coords) => {
// // //     if (!query?.trim()) { doDefault(); return; }
// // //     startSearch();
// // //     try {
// // //       const payload = { query: query.trim(), language };
// // //       if (coords) { payload.user_lat=coords.lat; payload.user_lng=coords.lng; }
// // //       const data = await searchService.nlpSearch(payload);
// // //       setResults(data.results||[], data.count);
// // //       setNlpSummary(data.criteria_summary||'');
// // //       setSuggestions(data.suggestions||[]);
// // //     } catch(e) { onSearchErr(e); }
// // //     finally { setLoading(false); }
// // //   };

// // //   const doFilters = async (filters) => {
// // //     startSearch(); setNlpSummary('');
// // //     try {
// // //       const params = {};
// // //       Object.entries(filters).forEach(([k,v])=>{ if(v!==''&&v!=null) params[k]=v; });
// // //       if (!params.status) params.status='disponible';
// // //       const res = await api.get('/housings/', { params });
// // //       setResults(toList(res.data), res.data?.count);
// // //     } catch(e) { onSearchErr(e); }
// // //     finally { setLoading(false); }
// // //   };

// // //   const doNearby = async (coords) => {
// // //     startSearch(); setNlpSummary('');
// // //     try {
// // //       const data = await searchService.nlpSearch({
// // //         query: language==='fr' ? 'logement disponible' : 'available housing',
// // //         language, user_lat: coords.lat, user_lng: coords.lng,
// // //       });
// // //       setResults(data.results||[], data.count);
// // //     } catch(e) { onSearchErr(e); }
// // //     finally { setLoading(false); }
// // //   };

// // //   // ── Handlers UI (inchangés) ───────────────────────────────
// // //   const handleSearch = ({ query }) => {
// // //     setMode('nlp'); setActiveFilters({});
// // //     navigate(`/search?query=${encodeURIComponent(query)}`, { replace:true });
// // //     doNlp(query, userLocation);
// // //   };

// // //   const handleVoiceTranscript = (transcript) => {
// // //     setMode('voice'); setActiveFilters({});
// // //     doNlp(transcript, userLocation);
// // //   };

// // //   const handleFilters = (newFilters) => {
// // //     setActiveFilters(newFilters); setMode('filters'); setNlpSummary('');
// // //     doFilters(newFilters);
// // //   };

// // //   const handleNearby = (coords) => {
// // //     setUserLocation(coords); setMode('nearby'); setActiveFilters({});
// // //     doNearby(coords);
// // //     if(viewMode==='list') setViewMode('map'); // auto-switch carte si près de moi
// // //   };

// // //   const handleSuggestion = (text) => { setMode('nlp'); doNlp(text, null); };

// // //   const handleClearNLP = () => {
// // //     setNlpSummary(''); setActiveFilters({}); setMode('default');
// // //     setUserLocation(null); navigate('/search', { replace:true }); doDefault();
// // //   };

// // //   const handleReset = () => {
// // //     setActiveFilters({}); setNlpSummary(''); setUserLocation(null);
// // //     setMode('default'); setSuggestions([]);
// // //     navigate('/search', { replace:true }); doDefault();
// // //   };

// // //   // ════════════════════════════════════════════════════════
// // //   // LOGIQUE CARTE
// // //   // ════════════════════════════════════════════════════════

// // //   // ── Sélection sur carte ───────────────────────────────────
// // //   const handleSelectOnMap = useCallback((h) => {
// // //     setSelectedHousing(h);
// // //   }, []);

// // //   // ── Favoris ───────────────────────────────────────────────
// // //   const toggleFav = (id) => {
// // //     setFavorites(prev => {
// // //       const next = new Set(prev);
// // //       if(next.has(id)){ next.delete(id); addToast(t.fav_rm,'inf'); }
// // //       else            { next.add(id);    addToast('❤️ '+t.fav_add,'ok'); }
// // //       return next;
// // //     });
// // //   };

// // //   // ── Comparaison ───────────────────────────────────────────
// // //   const toggleCompare = (h) => {
// // //     setCompareList(prev => {
// // //       if(prev.find(x=>x.id===h.id)) return prev.filter(x=>x.id!==h.id);
// // //       if(prev.length>=3){ addToast(t.compare_max,'err'); return prev; }
// // //       addToast('📊 '+h.title,'ok');
// // //       return [...prev, h];
// // //     });
// // //   };

// // //   // ── Itinéraire ────────────────────────────────────────────
// // //   const startItin = useCallback(async (h) => {
// // //     setItinOpen(true); setItinDist(''); setItinTime(''); setItinDest(''); setItinProg(0);
// // //     setItinStatus(`<i class="fas fa-location-crosshairs fa-spin"></i> ${t.itin_start}`);

// // //     const calcRoute = async (loc) => {
// // //       setItinProg(55);
// // //       setItinStatus(`<i class="fas fa-route fa-spin"></i> ${t.itin_calc}`);
// // //       try {
// // //         const url = `https://router.project-osrm.org/route/v1/driving/${loc.lng},${loc.lat};${h.longitude},${h.latitude}?overview=full&geometries=geojson`;
// // //         const resp = await fetch(url);
// // //         const data = await resp.json();
// // //         if(data.routes?.[0]){
// // //           const rt = data.routes[0];
// // //           setRoute(rt.geometry.coordinates.map(([ln,lt])=>[lt,ln]));
// // //           const km   = (rt.distance/1000).toFixed(1);
// // //           const mins = Math.round(rt.duration/60);
// // //           setItinDist(km+' km');
// // //           setItinTime(mins<60 ? mins+' min' : Math.floor(mins/60)+'h '+(mins%60)+'min');
// // //           setItinDest(`${h.district_name}, ${h.city_name}`);
// // //           setItinProg(100);
// // //           setItinStatus(`<i class="fas fa-check-circle" style="color:#10B981"></i> ${t.itin_ok} <b>${h.district_name}, ${h.city_name}</b>`);
// // //         } else throw new Error('no route');
// // //       } catch {
// // //         setRoute([[loc.lat,loc.lng],[h.latitude,h.longitude]]);
// // //         const d = haversine(loc.lat,loc.lng,h.latitude,h.longitude);
// // //         setItinDist(d.toFixed(1)+' km'); setItinTime(Math.round((d/40)*60)+' min');
// // //         setItinDest(`${h.district_name}, ${h.city_name}`);
// // //         setItinProg(100);
// // //         setItinStatus(`<i class="fas fa-triangle-exclamation" style="color:#F59E0B"></i> ${t.itin_approx}`);
// // //       }
// // //     };

// // //     if(userLocation){ calcRoute(userLocation); return; }

// // //     navigator.geolocation.getCurrentPosition(
// // //       async pos => {
// // //         const loc = { lat:pos.coords.latitude, lng:pos.coords.longitude };
// // //         setUserLocation(loc); setItinProg(35); calcRoute(loc);
// // //       },
// // //       () => {
// // //         const loc = { lat:3.848, lng:11.502 };
// // //         setUserLocation(loc);
// // //         setItinStatus(`<i class="fas fa-circle-info" style="color:#58A6FF"></i> ${t.itin_denied}`);
// // //         setItinProg(30); calcRoute(loc);
// // //       }
// // //     );
// // //   }, [userLocation, t]);

// // //   const closeItin = () => { setItinOpen(false); setRoute(null); setItinProg(0); };

// // //   // ── Planifier visite (redirige vers la page visite) ───────
// // //   const handleVisit = (h) => {
// // //     navigate(`/housings/${h.id}?action=visit`);
// // //   };

// // //   // ────────────────────────────────────────────────────────
// // //   const filterCount = Object.values(activeFilters).filter(v=>v!==''&&v!=null).length;
// // //   const isNlpMode   = mode==='nlp'||mode==='voice';

// // //   return (
// // //     <div className="search-page">

// // //       {/* ══ EN-TÊTE ══════════════════════════════════════════ */}
// // //       <div className="sp-header">
// // //         <div className="container">
// // //           <div className="sp-header-text">
// // //             <h1 className="sp-title">{t.title}</h1>
// // //             <p className="sp-subtitle">{t.subtitle}</p>
// // //           </div>

// // //           <div className="sp-controls">
// // //             <SearchBar
// // //               onSearch={handleSearch}
// // //               loading={loading}
// // //               criteriaSummary={nlpSummary}
// // //               onClearNLP={handleClearNLP}
// // //               language={language}
// // //             />
// // //             <div className="sp-actions">
// // //               <VoiceSearch
// // //                 onTranscript={handleVoiceTranscript}
// // //                 onError={msg=>setError(msg)}
// // //                 language={language}
// // //               />
// // //               <NearMeButton
// // //                 onLocationFound={handleNearby}
// // //                 onError={msg=>setError(msg)}
// // //                 language={language}
// // //               />
// // //               <FilterPanel
// // //                 onApplyFilters={handleFilters}
// // //                 initialFilters={activeFilters}
// // //                 language={language}
// // //               />
// // //             </div>
// // //           </div>

// // //           {/* Badges mode */}
// // //           {mode!=='default' && (
// // //             <div className="sp-badges">
// // //               {mode==='nearby'  && <span className="sp-badge sp-badge--nearby"><MapPin size={12}/> {t.b_nearby}</span>}
// // //               {isNlpMode        && <span className="sp-badge sp-badge--nlp"><Sparkles size={12}/>{mode==='voice'?t.b_voice:t.b_nlp}</span>}
// // //               {mode==='filters' && filterCount>0 && <span className="sp-badge sp-badge--filters">{filterCount} {t.b_filters}</span>}
// // //             </div>
// // //           )}

// // //           {/* ── Toggle vue Liste / Carte / Mixte ── */}
// // //           <div className="sp-view-toggle">
// // //             {[
// // //               { k:'list',  ico:<List  size={14}/>, lbl:t.view_list  },
// // //               { k:'map',   ico:<Map   size={14}/>, lbl:t.view_map   },
// // //               { k:'split', ico:<Columns size={14}/>, lbl:t.view_split },
// // //             ].map(({k,ico,lbl})=>(
// // //               <button
// // //                 key={k}
// // //                 className={`sp-view-btn${viewMode===k?' sp-view-btn--active':''}`}
// // //                 onClick={()=>setViewMode(k)}
// // //               >
// // //                 {ico} {lbl}
// // //               </button>
// // //             ))}
// // //           </div>
// // //         </div>
// // //       </div>

// // //       {/* ══ VUE LISTE ════════════════════════════════════════ */}
// // //       {viewMode==='list' && (
// // //         <div className="container sp-content">
// // //           {!loading && count!==null && (
// // //             <div className="sp-toolbar">
// // //               <span className="sp-count"><strong>{count}</strong> {t.results}</span>
// // //             </div>
// // //           )}
// // //           {loading && <div className="sp-loading"><Loader className="sp-spinner" size={36}/><p>{t.loading}</p></div>}
// // //           {!loading && error  && <div className="sp-error"><p>{error}</p><button className="sp-retry" onClick={handleReset}>{t.retry}</button></div>}
// // //           {!loading && !error && housings.length>0 && <HousingList housings={housings}/>}
// // //           {!loading && !error && housings.length===0 && count!==null && (
// // //             <div className="sp-empty">
// // //               <TrendingUp size={48} className="sp-empty-icon"/>
// // //               <h3>{t.no_result}</h3><p>{t.no_sub}</p>
// // //               {suggestions.length>0 && (
// // //                 <div className="sp-suggestions">
// // //                   <p>{t.suggestions}</p>
// // //                   <div className="sp-chips">{suggestions.map((s,i)=><button key={i} className="sp-chip" onClick={()=>handleSuggestion(s)}>{s}</button>)}</div>
// // //                 </div>
// // //               )}
// // //               <button className="sp-reset" onClick={handleReset}>{t.reset}</button>
// // //             </div>
// // //           )}
// // //         </div>
// // //       )}

// // //       {/* ══ VUE CARTE / MIXTE ════════════════════════════════ */}
// // //       {viewMode!=='list' && (
// // //         <div className={`sp-map-layout${viewMode==='split'?' sp-map-layout--split':''}`}>

// // //           {/* Colonne liste (mode split uniquement) */}
// // //           {viewMode==='split' && (
// // //             <div className="sp-map-list-col">
// // //               {loading && <div className="sp-map-loading"><Loader className="sp-spinner" size={28}/></div>}
// // //               {!loading && mapHousings.length===0 && (
// // //                 <div className="sp-map-empty"><TrendingUp size={32}/><p>{t.no_result}</p></div>
// // //               )}
// // //               {!loading && mapHousings.map(h=>(
// // //                 <MiniCard
// // //                   key={h.id} h={h}
// // //                   selected={selectedHousing?.id===h.id}
// // //                   onSelect={setSelectedHousing}
// // //                   isFav={favorites.has(h.id)}
// // //                   onFav={toggleFav}
// // //                   lang={language}
// // //                 />
// // //               ))}
// // //             </div>
// // //           )}

// // //           {/* Zone carte */}
// // //           <div className="sp-map-col">

// // //             {/* Barre stats */}
// // //             <div className="sp-map-stats">
// // //               <div><div className="sp-map-stat-n">{mapHousings.length}</div><div className="sp-map-stat-l">{t.on_map}</div></div>
// // //               <div className="sp-map-stat-sep"/>
// // //               <div><div className="sp-map-stat-v">{avg.toLocaleString('fr-FR')}</div><div className="sp-map-stat-l">{t.avg_price}</div></div>
// // //               <div className="sp-map-stat-sep"/>
// // //               <div><div className="sp-map-stat-v" style={{color:'#F59E0B'}}>{min.toLocaleString('fr-FR')}</div><div className="sp-map-stat-l">{t.min_price}</div></div>
// // //             </div>

// // //             {/* Bouton ma position */}
// // //             <button className="sp-map-locate-btn" title="Ma position" onClick={()=>{
// // //               navigator.geolocation.getCurrentPosition(pos=>{
// // //                 const loc={lat:pos.coords.latitude,lng:pos.coords.longitude};
// // //                 setUserLocation(loc); addToast('📍 Position détectée','ok');
// // //               }, ()=>addToast('Position non accessible','err'));
// // //             }}>
// // //               <i className="fas fa-location-crosshairs"/>
// // //             </button>

// // //             {/* Leaflet Map */}
// // //             <MapContainer
// // //               center={[3.848, 11.502]}
// // //               zoom={13}
// // //               style={{ width:'100%', height:'100%' }}
// // //               zoomControl={false}
// // //               attributionControl
// // //             >
// // //               <TileLayer
// // //                 url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
// // //                 attribution='© <a href="https://www.openstreetmap.org/copyright">OSM</a> © <a href="https://carto.com/">CARTO</a>'
// // //                 subdomains="abcd"
// // //                 maxZoom={20}
// // //               />
// // //               <MapController
// // //                 housings={mapHousings}
// // //                 selectedId={selectedHousing?.id}
// // //                 onSelect={handleSelectOnMap}
// // //                 userLoc={userLocation}
// // //                 route={route}
// // //               />
// // //             </MapContainer>

// // //             {/* Detail panel */}
// // //             {selectedHousing && (
// // //               <DetailPanel
// // //                 h={selectedHousing}
// // //                 t={t}
// // //                 lang={language}
// // //                 onClose={()=>setSelectedHousing(null)}
// // //                 onItin={startItin}
// // //                 isFav={favorites.has(selectedHousing.id)}
// // //                 onFav={toggleFav}
// // //                 inCmp={compareList.some(x=>x.id===selectedHousing.id)}
// // //                 onCmp={toggleCompare}
// // //                 onVisit={handleVisit}
// // //               />
// // //             )}

// // //             {/* Itinéraire panel */}
// // //             {itinOpen && (
// // //               <ItineraryPanel
// // //                 t={t} lang={language}
// // //                 status={itinStatus} dist={itinDist} time={itinTime} dest={itinDest}
// // //                 progress={itinProg} transport={transport}
// // //                 onTransport={setTransport}
// // //                 onClose={closeItin}
// // //               />
// // //             )}

// // //             {/* Compare strip */}
// // //             {compareList.length>0 && (
// // //               <div className="sp-cmp-strip">
// // //                 <i className="fas fa-scale-balanced" style={{color:'#58A6FF',flexShrink:0}}/>
// // //                 <div className="sp-cmp-strip-items">
// // //                   {compareList.map(h=>(
// // //                     <div key={h.id} className="sp-cmp-strip-item">
// // //                       <span>{h.title}</span>
// // //                       <button onClick={()=>toggleCompare(h)}><i className="fas fa-xmark"/></button>
// // //                     </div>
// // //                   ))}
// // //                 </div>
// // //                 <button className="sp-cmp-strip-btn" onClick={()=>setShowCompare(true)}>
// // //                   <i className="fas fa-chart-bar"/> {t.cmp_launch}
// // //                 </button>
// // //               </div>
// // //             )}
// // //           </div>
// // //         </div>
// // //       )}

// // //       {/* Compare modal */}
// // //       {showCompare && (
// // //         <CompareModal
// // //           list={compareList} t={t} lang={language}
// // //           onClose={()=>setShowCompare(false)}
// // //           onRemove={id=>setCompareList(p=>p.filter(x=>x.id!==id))}
// // //         />
// // //       )}

// // //       {/* Toasts */}
// // //       <div className="sp-toast-wrap">
// // //         {toasts.map(({id,msg,type})=>(
// // //           <div key={id} className={`sp-toast sp-toast--${type}`}>
// // //             <i className={`fas ${type==='ok'?'fa-circle-check':type==='err'?'fa-circle-exclamation':'fa-circle-info'}`}/>
// // //             <span>{msg}</span>
// // //           </div>
// // //         ))}
// // //       </div>
// // //     </div>
// // //   );
// // // };

// // // export default SearchPage;







// // // src/pages/SearchPage.jsx — VERSION FUSIONNÉE
// // // ============================================================
// // // Fusionne :
// // //   • Votre SearchPage (NLP, filtres, vocal, near me) ← inchangé
// // //   • SearchMapPage   (carte Leaflet, itinéraire, comparaison)
// // //
// // // npm install leaflet react-leaflet leaflet.markercluster
// // //
// // // Dans main.jsx / index.css (une seule fois) :
// // //   import 'leaflet/dist/leaflet.css';
// // //   import 'leaflet.markercluster/dist/MarkerCluster.css';
// // //   import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
// // // ============================================================

// // import { useState, useEffect, useRef, useCallback } from 'react';
// // import { useLocation, useNavigate }  from 'react-router-dom';
// // import { Loader, MapPin, TrendingUp, Sparkles, Map, List, Columns } from 'lucide-react';
// // import { MapContainer, TileLayer, useMap } from 'react-leaflet';
// // import L from 'leaflet';
// // import 'leaflet.markercluster';

// // import { useTheme }       from '../contexts/ThemeContext';
// // import searchService      from '../services/searchService';
// // import api                from '../services/api';

// // import SearchBar    from '../components/Search/SearchBar';
// // import FilterPanel  from '../components/Search/FilterPanel';
// // import NearMeButton from '../components/Search/NearMeButton';
// // import VoiceSearch  from '../components/Search/VoiceSearch';
// // import HousingList  from '../components/housing/HousingList';
// // import HousingCard  from '../components/housing/HousingCard';

// // import './SearchPage.css';
// // import './SearchPageMap.css';  // ← nouveau fichier CSS carte

// // // ─── Helper URL images (relative → absolue) ──────────────
// // const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api')
// //   .replace(/\/api\/?$/, '');

// // function imgUrl(path) {
// //   if (!path) return null;
// //   if (path.startsWith('http') || path.startsWith('blob:') || path.startsWith('data:')) return path;
// //   return `${API_BASE}${path.startsWith('/') ? '' : '/'}${path}`;
// // }

// // // ─── Couleurs de fond par catégorie (fallback sans image) ─
// // const CAT_COLORS = {
// //   'Studio':      ['#1B4332','#2D6A4F'],
// //   'Chambre':     ['#4A1942','#7B2D8B'],
// //   'Appartement': ['#1E3A5F','#2E5F9E'],
// //   'Maison':      ['#2D3A1E','#3D5028'],
// //   'Villa':       ['#78350F','#92400E'],
// // };
// // function catBg(cat) {
// //   const [c1, c2] = CAT_COLORS[cat] || ['#1C2128','#2D333B'];
// //   return `linear-gradient(135deg,${c1},${c2})`;
// // }

// // // ─── Adaptateur : données API → format HousingCard ────────
// // // HousingCard attend : main_image, display_name, district_name,
// // //   city_name, is_liked, is_saved, likes_count, views_count
// // function toCardFormat(h) {
// //   const mainImg = h.images?.find(i => i.is_main) || h.images?.[0];
// //   return {
// //     ...h,
// //     main_image:    imgUrl(mainImg?.image) || null,
// //     display_name:  h.display_name || h.title,
// //     district_name: h.district_name || (typeof h.district === 'object' ? h.district?.name : null) || '',
// //     city_name:     h.city_name     || (typeof h.city     === 'object' ? h.city?.name     : null) || '',
// //     is_liked:      h.is_liked  || false,
// //     is_saved:      h.is_saved  || false,
// //     likes_count:   h.likes_count || 0,
// //     views_count:   h.views_count || 0,
// //   };
// // }

// // // ─── TRADUCTIONS ─────────────────────────────────────────────
// // const T = {
// //   fr: {
// //     title:       'Rechercher un logement',
// //     subtitle:    'Trouvez le logement idéal au Cameroun',
// //     results:     'résultat(s)',
// //     loading:     'Recherche en cours…',
// //     retry:       'Réessayer',
// //     no_result:   'Aucun résultat',
// //     no_sub:      "Essayez d'ajuster vos critères",
// //     reset:       'Réinitialiser',
// //     b_nearby:    'Autour de votre position',
// //     b_nlp:       'Recherche intelligente',
// //     b_voice:     'Recherche vocale',
// //     b_filters:   'filtre(s) actif(s)',
// //     suggestions: 'Suggestions :',
// //     error:       'Erreur de recherche. Veuillez réessayer.',
// //     view_list:   'Liste',
// //     view_map:    'Carte',
// //     view_split:  'Mixte',
// //     on_map:      'logement(s) sur la carte',
// //     avg_price:   'Prix moyen',
// //     min_price:   'À partir de',
// //     detail_title: 'Détails du logement',
// //     feat_labels: {
// //       wifi:'WiFi', parking:'Parking', gardien:'Gardien',
// //       climatisation:'Climatisation', eau:'Eau 24h', electricite:'Électricité',
// //       piscine:'Piscine', jardin:'Jardin', balcon:'Balcon/Terrasse',
// //       cuisine:'Cuisine équipée', ascenseur:'Ascenseur', vue:'Vue panoramique',
// //     },
// //     itin_title:  'Itinéraire',
// //     itin_start:  "Détection de votre position…",
// //     itin_calc:   "Calcul de l'itinéraire…",
// //     itin_ok:     'Itinéraire calculé vers',
// //     itin_approx: "Distance à vol d'oiseau utilisée",
// //     itin_denied: 'Position approx. utilisée (accès refusé)',
// //     transport:   ['Voiture','Pied','Vélo'],
// //     distance:    'Distance',
// //     duration:    'Durée estimée',
// //     destination: 'Destination',
// //     compare:     'Comparer',
// //     compare_max: 'Maximum 3 logements à comparer',
// //     fav_add:     'Ajouté aux favoris',
// //     fav_rm:      'Retiré des favoris',
// //     plan_visit:  'Planifier une visite',
// //     contact:     'Contacter',
// //     cmp_launch:  'Comparer',
// //     cmp_title:   'Comparaison',
// //     close:       'Fermer',
// //   },
// //   en: {
// //     title:       'Find housing',
// //     subtitle:    'Find your ideal home in Cameroon',
// //     results:     'result(s)',
// //     loading:     'Searching…',
// //     retry:       'Retry',
// //     no_result:   'No results found',
// //     no_sub:      'Try adjusting your criteria',
// //     reset:       'Reset',
// //     b_nearby:    'Near your location',
// //     b_nlp:       'Smart search',
// //     b_voice:     'Voice search',
// //     b_filters:   'active filter(s)',
// //     suggestions: 'Suggestions:',
// //     error:       'Search error. Please try again.',
// //     view_list:   'List',
// //     view_map:    'Map',
// //     view_split:  'Split',
// //     on_map:      'listing(s) on map',
// //     avg_price:   'Avg price',
// //     min_price:   'From',
// //     detail_title: 'Property details',
// //     feat_labels: {
// //       wifi:'WiFi', parking:'Parking', gardien:'Security',
// //       climatisation:'A/C', eau:'Water 24h', electricite:'Electricity',
// //       piscine:'Pool', jardin:'Garden', balcon:'Balcony/Terrace',
// //       cuisine:'Fitted kitchen', ascenseur:'Elevator', vue:'Panoramic view',
// //     },
// //     itin_title:  'Itinerary',
// //     itin_start:  'Detecting your location…',
// //     itin_calc:   'Calculating itinerary…',
// //     itin_ok:     'Itinerary calculated to',
// //     itin_approx: 'Straight-line distance used',
// //     itin_denied: 'Approx. location used (access denied)',
// //     transport:   ['Car','Walking','Cycling'],
// //     distance:    'Distance',
// //     duration:    'Est. time',
// //     destination: 'Destination',
// //     compare:     'Compare',
// //     compare_max: 'Max 3 properties to compare',
// //     fav_add:     'Added to favourites',
// //     fav_rm:      'Removed from favourites',
// //     plan_visit:  'Schedule visit',
// //     contact:     'Contact',
// //     cmp_launch:  'Compare',
// //     cmp_title:   'Comparison',
// //     close:       'Close',
// //   },
// // };

// // // ─── UTILS ───────────────────────────────────────────────────
// // function haversine(la1, lo1, la2, lo2) {
// //   const R = 6371, d2r = Math.PI / 180;
// //   const dLa = (la2 - la1) * d2r, dLo = (lo2 - lo1) * d2r;
// //   const a = Math.sin(dLa/2)**2 + Math.cos(la1*d2r)*Math.cos(la2*d2r)*Math.sin(dLo/2)**2;
// //   return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
// // }

// // function fmtPrice(p) {
// //   return p >= 1_000_000 ? (p/1_000_000).toFixed(1)+'M' : Math.round(p/1000)+'k';
// // }

// // // ─── STATUS HELPERS ───────────────────────────────────────────
// // const STATUS_MAP = {
// //   disponible: { cls: 'sp-badge-dispo', label: { fr: 'Disponible', en: 'Available' } },
// //   reserve:    { cls: 'sp-badge-res',   label: { fr: 'Réservé',    en: 'Reserved'  } },
// //   occupe:     { cls: 'sp-badge-occ',   label: { fr: 'Occupé',     en: 'Occupied'  } },
// // };

// // // ════════════════════════════════════════════════════════════
// // // MapController — interne, gère markers/clusters/route
// // // ════════════════════════════════════════════════════════════
// // function MapController({ housings, selectedId, onSelect, userLoc, route }) {
// //   const map         = useMap();
// //   const clusterRef  = useRef(null);
// //   const routeRef    = useRef(null);
// //   const userMkRef   = useRef(null);

// //   // Cluster group (une seule fois)
// //   useEffect(() => {
// //     const cluster = L.markerClusterGroup({
// //       maxClusterRadius: 60,
// //       iconCreateFunction: c => L.divIcon({
// //         html: `<div class="sp-mk-cluster">${c.getChildCount()}</div>`,
// //         className: '', iconSize: [36, 36],
// //       }),
// //     });
// //     map.addLayer(cluster);
// //     clusterRef.current = cluster;
// //     return () => map.removeLayer(cluster);
// //   }, [map]);

// //   // Markers
// //   useEffect(() => {
// //     if (!clusterRef.current) return;
// //     clusterRef.current.clearLayers();
// //     housings.forEach(h => {
// //       if (!h.latitude || !h.longitude) return;
// //       const sel  = h.id === selectedId;
// //       const icon = L.divIcon({
// //         html: `<div class="sp-mk${sel ? ' sp-mk--sel' : ''}">${fmtPrice(h.price)} FCFA</div>`,
// //         className: '', iconSize: null, iconAnchor: [44, 14],
// //       });
// //       const m = L.marker([h.latitude, h.longitude], { icon });
// //       m.on('click', () => onSelect(h));
// //       clusterRef.current.addLayer(m);
// //     });
// //   }, [housings, selectedId, onSelect]);

// //   // Route
// //   useEffect(() => {
// //     if (routeRef.current) { map.removeLayer(routeRef.current); routeRef.current = null; }
// //     if (!route?.length) return;
// //     const poly = L.polyline(route, { color: '#F59E0B', weight: 5, opacity: .85, dashArray: '10,5' });
// //     poly.addTo(map); routeRef.current = poly;
// //     map.fitBounds(poly.getBounds(), { padding: [60, 60] });
// //   }, [route, map]);

// //   // User marker
// //   useEffect(() => {
// //     if (userMkRef.current) { map.removeLayer(userMkRef.current); userMkRef.current = null; }
// //     if (!userLoc) return;
// //     userMkRef.current = L.marker([userLoc.lat, userLoc.lng], {
// //       icon: L.divIcon({ html: '<div class="sp-user-dot"></div>', className: '', iconSize: [14, 14] }),
// //     }).addTo(map).bindTooltip('📍 Vous êtes ici');
// //   }, [userLoc, map]);

// //   return null;
// // }

// // // ════════════════════════════════════════════════════════════
// // // ════════════════════════════════════════════════════════════
// // // MapCardOverlay — remplace DetailPanel + MiniCard
// // // Affiche le HousingCard standard quand on clique sur un marker
// // // ════════════════════════════════════════════════════════════
// // function MapCardOverlay({ h, onClose, onItin }) {
// //   const navigate = useNavigate();
// //   return (
// //     <div className="sp-map-overlay">

// //       {/* ── En-tête ── */}
// //       <div className="sp-map-overlay-head">
// //         <span className="sp-map-overlay-title">
// //           <i className="fas fa-location-dot" style={{color:'#10B981',marginRight:6}}/>
// //           Aperçu du logement
// //         </span>
// //         <button
// //           className="sp-map-overlay-close"
// //           onClick={onClose}
// //           title="Fermer"
// //           aria-label="Fermer l'aperçu"
// //         >
// //           <i className="fas fa-xmark"/>
// //         </button>
// //       </div>

// //       {/* ── Carte logement (identique à la vue Liste) ── */}
// //       <div className="sp-map-overlay-card">
// //         <HousingCard
// //           housing={toCardFormat(h)}
// //           showActions={true}
// //         />
// //       </div>

// //       {/* ── Boutons extra (itinéraire + visite) ── */}
// //       <div className="sp-map-overlay-actions">
// //         <button
// //           className="sp-ov-btn sp-ov-btn--itin"
// //           onClick={() => onItin(h)}
// //         >
// //           <i className="fas fa-route"/> Calculer l'itinéraire
// //         </button>
// //         <button
// //           className="sp-ov-btn sp-ov-btn--visit"
// //           onClick={() => navigate(`/housing/${h.id}?action=visit`)}
// //         >
// //           <i className="fas fa-calendar-plus"/> Planifier une visite
// //         </button>
// //       </div>
// //     </div>
// //   );
// // }

// // const FEAT_ICON = {
// //   wifi:'fa-wifi', parking:'fa-car', gardien:'fa-shield-halved',
// //   climatisation:'fa-snowflake', eau:'fa-droplet', electricite:'fa-bolt',
// //   piscine:'fa-person-swimming', jardin:'fa-leaf', balcon:'fa-door-open',
// //   cuisine:'fa-utensils', ascenseur:'fa-elevator', vue:'fa-binoculars',
// // };

// // // ════════════════════════════════════════════════════════════
// // // ItineraryPanel
// // // ════════════════════════════════════════════════════════════
// // function ItineraryPanel({ t, lang, status, dist, time, dest, progress, transport, onTransport, onClose }) {
// //   const modes = [
// //     { k:'driving', ico:'fa-car',            lbl: t.transport[0] },
// //     { k:'foot',    ico:'fa-person-walking', lbl: t.transport[1] },
// //     { k:'bike',    ico:'fa-bicycle',        lbl: t.transport[2] },
// //   ];
// //   return (
// //     <div className="sp-itin">
// //       <div className="sp-itin-inner">
// //         <div className="sp-itin-hd">
// //           <span className="sp-itin-title"><i className="fas fa-route"/> {t.itin_title}</span>
// //           <button className="sp-dp-close" onClick={onClose}><i className="fas fa-xmark"/></button>
// //         </div>
// //         <div className="sp-itin-modes">
// //           {modes.map(m=>(
// //             <button key={m.k} className={`sp-itin-mode${transport===m.k?' sp-itin-mode--active':''}`} onClick={()=>onTransport(m.k)}>
// //               <i className={`fas ${m.ico}`}/> {m.lbl}
// //             </button>
// //           ))}
// //         </div>
// //         <div className="sp-itin-bar"><div className="sp-itin-bar-fill" style={{width:`${progress}%`}}/></div>
// //         {dist && (
// //           <div className="sp-itin-stats">
// //             {[{ico:'fa-road',v:dist,l:t.distance},{ico:'fa-clock',v:time,l:t.duration},{ico:'fa-location-dot',v:dest,l:t.destination}].map(({ico,v,l})=>(
// //               <div key={l} className="sp-itin-s">
// //                 <div className="sp-itin-ico"><i className={`fas ${ico}`}/></div>
// //                 <div><div className="sp-itin-sv">{v}</div><div className="sp-itin-sl">{l}</div></div>
// //               </div>
// //             ))}
// //           </div>
// //         )}
// //         <p className="sp-itin-status" dangerouslySetInnerHTML={{__html:status}}/>
// //       </div>
// //     </div>
// //   );
// // }

// // // ════════════════════════════════════════════════════════════
// // // CompareModal
// // // ════════════════════════════════════════════════════════════
// // function CompareModal({ list, t, lang, onClose, onRemove }) {
// //   const rows = [
// //     { label:'Prix/mois',   fmt:h=>h.price?.toLocaleString('fr-FR')+' FCFA', valFn:h=>h.price, lowBest:true },
// //     { label:'Catégorie',   fmt:h=>h.category_name||h.category||'—' },
// //     { label:'Ville',       fmt:h=>`${h.city_name} · ${h.district_name}` },
// //     { label:'Chambres',    fmt:h=>String(h.rooms||'—'),    valFn:h=>h.rooms||0 },
// //     { label:'SDB',         fmt:h=>String(h.bathrooms||'—'),valFn:h=>h.bathrooms||0 },
// //     { label:'Surface',     fmt:h=>(h.area||0)+'m²',        valFn:h=>h.area||0 },
// //     { label:'Statut',      fmt:h=>STATUS_MAP[h.status]?.label[lang]||h.status },
// //     { label:'Vues',        fmt:h=>(h.views_count||0).toLocaleString(), valFn:h=>h.views_count||0 },
// //   ];
// //   return (
// //     <div className="sp-cmp-modal" onClick={e=>e.target===e.currentTarget&&onClose()}>
// //       <div className="sp-cmp-box">
// //         <div className="sp-cmp-hd">
// //           <h2><i className="fas fa-scale-balanced" style={{color:'#58A6FF',marginRight:8}}/>{t.cmp_title}</h2>
// //           <button className="sp-dp-close" onClick={onClose}><i className="fas fa-xmark"/></button>
// //         </div>
// //         <div className="sp-cmp-table">
// //           <div className="sp-cmp-row sp-cmp-head-row">
// //             <div/>
// //             {list.map(h=>(
// //               <div key={h.id} className="sp-cmp-th">
// //                 <span>{h.title}</span>
// //                 <button onClick={()=>onRemove(h.id)}><i className="fas fa-xmark"/> Retirer</button>
// //               </div>
// //             ))}
// //           </div>
// //           {rows.map(({label,fmt,valFn,lowBest})=>{
// //             let bestIdx=-1;
// //             if(valFn){const vals=list.map(valFn);const best=lowBest?Math.min(...vals):Math.max(...vals);bestIdx=vals.indexOf(best);}
// //             return (
// //               <div key={label} className="sp-cmp-row">
// //                 <div className="sp-cmp-lbl">{label}</div>
// //                 {list.map((h,i)=>(
// //                   <div key={h.id} className={`sp-cmp-val${i===bestIdx?' sp-cmp-val--best':''}`}>{fmt(h)}</div>
// //                 ))}
// //               </div>
// //             );
// //           })}
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }

// // // ════════════════════════════════════════════════════════════
// // // MAIN PAGE — SearchPage fusionnée
// // // ════════════════════════════════════════════════════════════
// // const SearchPage = () => {
// //   const location     = useLocation();
// //   const navigate     = useNavigate();
// //   const { language } = useTheme();
// //   const t            = T[language] || T.fr;

// //   // ── Données & états existants ─────────────────────────────
// //   const [housings,      setHousings]      = useState([]);
// //   const [loading,       setLoading]       = useState(false);
// //   const [error,         setError]         = useState(null);
// //   const [count,         setCount]         = useState(null);
// //   const [suggestions,   setSuggestions]   = useState([]);
// //   const [nlpSummary,    setNlpSummary]    = useState('');
// //   const [mode,          setMode]          = useState('default');
// //   const [userLocation,  setUserLocation]  = useState(null);
// //   const [activeFilters, setActiveFilters] = useState({});

// //   // ── Vue : 'list' | 'map' | 'split' ───────────────────────
// //   const [viewMode, setViewMode] = useState('list');

// //   // ── Carte ─────────────────────────────────────────────────
// //   const [selectedHousing, setSelectedHousing] = useState(null);
// //   const [route,           setRoute]           = useState(null);
// //   const [favorites,       setFavorites]       = useState(new Set());
// //   const [compareList,     setCompareList]     = useState([]);
// //   const [showCompare,     setShowCompare]     = useState(false);

// //   // ── Itinéraire ────────────────────────────────────────────
// //   const [itinOpen,   setItinOpen]   = useState(false);
// //   const [itinStatus, setItinStatus] = useState('');
// //   const [itinDist,   setItinDist]   = useState('');
// //   const [itinTime,   setItinTime]   = useState('');
// //   const [itinDest,   setItinDest]   = useState('');
// //   const [itinProg,   setItinProg]   = useState(0);
// //   const [transport,  setTransport]  = useState('driving');

// //   // ── Toast ─────────────────────────────────────────────────
// //   const [toasts, setToasts] = useState([]);
// //   const addToast = useCallback((msg, type='inf') => {
// //     const id = Date.now();
// //     setToasts(p => [...p, {id, msg, type}]);
// //     setTimeout(() => setToasts(p => p.filter(x=>x.id!==id)), 3500);
// //   }, []);

// //   // ── Stats carte ───────────────────────────────────────────
// //   const mapHousings = housings.filter(h => h.latitude && h.longitude);
// //   const avg = mapHousings.length ? Math.round(mapHousings.reduce((s,h)=>s+h.price,0)/mapHousings.length) : 0;
// //   const min = mapHousings.length ? Math.min(...mapHousings.map(h=>h.price)) : 0;

// //   // ════════════════════════════════════════════════════════
// //   // LOGIQUE DE RECHERCHE (inchangée depuis votre SearchPage)
// //   // ════════════════════════════════════════════════════════

// //   useEffect(() => {
// //     const params = new URLSearchParams(location.search);
// //     const query  = params.get('query');
// //     if (query) { setMode('nlp'); doNlp(query, null); }
// //     else        { doDefault(); }
// //   // eslint-disable-next-line react-hooks/exhaustive-deps
// //   }, [language]);

// //   const startSearch = () => { setLoading(true); setError(null); setSuggestions([]); };
// //   const setResults  = (list, total) => { setHousings(list); setCount(total!==undefined?total:list.length); };
// //   const onSearchErr = e => { console.error(e); setError(t.error); setHousings([]); setCount(0); };
// //   const toList      = d => Array.isArray(d)?d:(d?.results||[]);

// //   const doDefault = async () => {
// //     startSearch(); setNlpSummary('');
// //     try {
// //       const res = await api.get('/housings/', { params: { status:'disponible', ordering:'-created_at' } });
// //       setResults(toList(res.data), res.data?.count);
// //     } catch(e) { onSearchErr(e); }
// //     finally { setLoading(false); }
// //   };

// //   const doNlp = async (query, coords) => {
// //     if (!query?.trim()) { doDefault(); return; }
// //     startSearch();
// //     try {
// //       const payload = { query: query.trim(), language };
// //       if (coords) { payload.user_lat=coords.lat; payload.user_lng=coords.lng; }
// //       const data = await searchService.nlpSearch(payload);
// //       setResults(data.results||[], data.count);
// //       setNlpSummary(data.criteria_summary||'');
// //       setSuggestions(data.suggestions||[]);
// //     } catch(e) { onSearchErr(e); }
// //     finally { setLoading(false); }
// //   };

// //   const doFilters = async (filters) => {
// //     startSearch(); setNlpSummary('');
// //     try {
// //       const params = {};
// //       Object.entries(filters).forEach(([k,v])=>{ if(v!==''&&v!=null) params[k]=v; });
// //       if (!params.status) params.status='disponible';
// //       const res = await api.get('/housings/', { params });
// //       setResults(toList(res.data), res.data?.count);
// //     } catch(e) { onSearchErr(e); }
// //     finally { setLoading(false); }
// //   };

// //   const doNearby = async (coords) => {
// //     startSearch(); setNlpSummary('');
// //     try {
// //       const data = await searchService.nlpSearch({
// //         query: language==='fr' ? 'logement disponible' : 'available housing',
// //         language, user_lat: coords.lat, user_lng: coords.lng,
// //       });
// //       setResults(data.results||[], data.count);
// //     } catch(e) { onSearchErr(e); }
// //     finally { setLoading(false); }
// //   };

// //   // ── Handlers UI (inchangés) ───────────────────────────────
// //   const handleSearch = ({ query }) => {
// //     setMode('nlp'); setActiveFilters({});
// //     navigate(`/search?query=${encodeURIComponent(query)}`, { replace:true });
// //     doNlp(query, userLocation);
// //   };

// //   const handleVoiceTranscript = (transcript) => {
// //     setMode('voice'); setActiveFilters({});
// //     doNlp(transcript, userLocation);
// //   };

// //   const handleFilters = (newFilters) => {
// //     setActiveFilters(newFilters); setMode('filters'); setNlpSummary('');
// //     doFilters(newFilters);
// //   };

// //   const handleNearby = (coords) => {
// //     setUserLocation(coords); setMode('nearby'); setActiveFilters({});
// //     doNearby(coords);
// //     if(viewMode==='list') setViewMode('map'); // auto-switch carte si près de moi
// //   };

// //   const handleSuggestion = (text) => { setMode('nlp'); doNlp(text, null); };

// //   const handleClearNLP = () => {
// //     setNlpSummary(''); setActiveFilters({}); setMode('default');
// //     setUserLocation(null); navigate('/search', { replace:true }); doDefault();
// //   };

// //   const handleReset = () => {
// //     setActiveFilters({}); setNlpSummary(''); setUserLocation(null);
// //     setMode('default'); setSuggestions([]);
// //     navigate('/search', { replace:true }); doDefault();
// //   };

// //   // ════════════════════════════════════════════════════════
// //   // LOGIQUE CARTE
// //   // ════════════════════════════════════════════════════════

// //   // ── Sélection sur carte ───────────────────────────────────
// //   const handleSelectOnMap = useCallback((h) => {
// //     setSelectedHousing(h);
// //   }, []);

// //   // ── Favoris ───────────────────────────────────────────────
// //   const toggleFav = (id) => {
// //     setFavorites(prev => {
// //       const next = new Set(prev);
// //       if(next.has(id)){ next.delete(id); addToast(t.fav_rm,'inf'); }
// //       else            { next.add(id);    addToast('❤️ '+t.fav_add,'ok'); }
// //       return next;
// //     });
// //   };

// //   // ── Comparaison ───────────────────────────────────────────
// //   const toggleCompare = (h) => {
// //     setCompareList(prev => {
// //       if(prev.find(x=>x.id===h.id)) return prev.filter(x=>x.id!==h.id);
// //       if(prev.length>=3){ addToast(t.compare_max,'err'); return prev; }
// //       addToast('📊 '+h.title,'ok');
// //       return [...prev, h];
// //     });
// //   };

// //   // ── Itinéraire ────────────────────────────────────────────
// //   const startItin = useCallback(async (h) => {
// //     setItinOpen(true); setItinDist(''); setItinTime(''); setItinDest(''); setItinProg(0);
// //     setItinStatus(`<i class="fas fa-location-crosshairs fa-spin"></i> ${t.itin_start}`);

// //     const calcRoute = async (loc) => {
// //       setItinProg(55);
// //       setItinStatus(`<i class="fas fa-route fa-spin"></i> ${t.itin_calc}`);
// //       try {
// //         const url = `https://router.project-osrm.org/route/v1/driving/${loc.lng},${loc.lat};${h.longitude},${h.latitude}?overview=full&geometries=geojson`;
// //         const resp = await fetch(url);
// //         const data = await resp.json();
// //         if(data.routes?.[0]){
// //           const rt = data.routes[0];
// //           setRoute(rt.geometry.coordinates.map(([ln,lt])=>[lt,ln]));
// //           const km   = (rt.distance/1000).toFixed(1);
// //           const mins = Math.round(rt.duration/60);
// //           setItinDist(km+' km');
// //           setItinTime(mins<60 ? mins+' min' : Math.floor(mins/60)+'h '+(mins%60)+'min');
// //           setItinDest(`${h.district_name}, ${h.city_name}`);
// //           setItinProg(100);
// //           setItinStatus(`<i class="fas fa-check-circle" style="color:#10B981"></i> ${t.itin_ok} <b>${h.district_name}, ${h.city_name}</b>`);
// //         } else throw new Error('no route');
// //       } catch {
// //         setRoute([[loc.lat,loc.lng],[h.latitude,h.longitude]]);
// //         const d = haversine(loc.lat,loc.lng,h.latitude,h.longitude);
// //         setItinDist(d.toFixed(1)+' km'); setItinTime(Math.round((d/40)*60)+' min');
// //         setItinDest(`${h.district_name}, ${h.city_name}`);
// //         setItinProg(100);
// //         setItinStatus(`<i class="fas fa-triangle-exclamation" style="color:#F59E0B"></i> ${t.itin_approx}`);
// //       }
// //     };

// //     if(userLocation){ calcRoute(userLocation); return; }

// //     navigator.geolocation.getCurrentPosition(
// //       async pos => {
// //         const loc = { lat:pos.coords.latitude, lng:pos.coords.longitude };
// //         setUserLocation(loc); setItinProg(35); calcRoute(loc);
// //       },
// //       () => {
// //         const loc = { lat:3.848, lng:11.502 };
// //         setUserLocation(loc);
// //         setItinStatus(`<i class="fas fa-circle-info" style="color:#58A6FF"></i> ${t.itin_denied}`);
// //         setItinProg(30); calcRoute(loc);
// //       }
// //     );
// //   }, [userLocation, t]);

// //   const closeItin = () => { setItinOpen(false); setRoute(null); setItinProg(0); };

// //   // ── Planifier visite (redirige vers la page visite) ───────
// //   const handleVisit = (h) => {
// //     navigate(`/housings/${h.id}?action=visit`);
// //   };

// //   // ────────────────────────────────────────────────────────
// //   const filterCount = Object.values(activeFilters).filter(v=>v!==''&&v!=null).length;
// //   const isNlpMode   = mode==='nlp'||mode==='voice';

// //   return (
// //     <div className="search-page">

// //       {/* ══ EN-TÊTE ══════════════════════════════════════════ */}
// //       <div className="sp-header">
// //         <div className="container">
// //           <div className="sp-header-text">
// //             <h1 className="sp-title">{t.title}</h1>
// //             <p className="sp-subtitle">{t.subtitle}</p>
// //           </div>

// //           <div className="sp-controls">
// //             <SearchBar
// //               onSearch={handleSearch}
// //               loading={loading}
// //               criteriaSummary={nlpSummary}
// //               onClearNLP={handleClearNLP}
// //               language={language}
// //             />
// //             <div className="sp-actions">
// //               <VoiceSearch
// //                 onTranscript={handleVoiceTranscript}
// //                 onError={msg=>setError(msg)}
// //                 language={language}
// //               />
// //               <NearMeButton
// //                 onLocationFound={handleNearby}
// //                 onError={msg=>setError(msg)}
// //                 language={language}
// //               />
// //               <FilterPanel
// //                 onApplyFilters={handleFilters}
// //                 initialFilters={activeFilters}
// //                 language={language}
// //               />
// //             </div>
// //           </div>

// //           {/* Badges mode */}
// //           {mode!=='default' && (
// //             <div className="sp-badges">
// //               {mode==='nearby'  && <span className="sp-badge sp-badge--nearby"><MapPin size={12}/> {t.b_nearby}</span>}
// //               {isNlpMode        && <span className="sp-badge sp-badge--nlp"><Sparkles size={12}/>{mode==='voice'?t.b_voice:t.b_nlp}</span>}
// //               {mode==='filters' && filterCount>0 && <span className="sp-badge sp-badge--filters">{filterCount} {t.b_filters}</span>}
// //             </div>
// //           )}

// //           {/* ── Toggle vue Liste / Carte / Mixte ── */}
// //           <div className="sp-view-toggle">
// //             {[
// //               { k:'list',  ico:<List  size={14}/>, lbl:t.view_list  },
// //               { k:'map',   ico:<Map   size={14}/>, lbl:t.view_map   },
// //               { k:'split', ico:<Columns size={14}/>, lbl:t.view_split },
// //             ].map(({k,ico,lbl})=>(
// //               <button
// //                 key={k}
// //                 className={`sp-view-btn${viewMode===k?' sp-view-btn--active':''}`}
// //                 onClick={()=>setViewMode(k)}
// //               >
// //                 {ico} {lbl}
// //               </button>
// //             ))}
// //           </div>
// //         </div>
// //       </div>

// //       {/* ══ VUE LISTE ════════════════════════════════════════ */}
// //       {viewMode==='list' && (
// //         <div className="container sp-content">
// //           {!loading && count!==null && (
// //             <div className="sp-toolbar">
// //               <span className="sp-count"><strong>{count}</strong> {t.results}</span>
// //             </div>
// //           )}
// //           {loading && <div className="sp-loading"><Loader className="sp-spinner" size={36}/><p>{t.loading}</p></div>}
// //           {!loading && error  && <div className="sp-error"><p>{error}</p><button className="sp-retry" onClick={handleReset}>{t.retry}</button></div>}
// //           {!loading && !error && housings.length>0 && <HousingList housings={housings}/>}
// //           {!loading && !error && housings.length===0 && count!==null && (
// //             <div className="sp-empty">
// //               <TrendingUp size={48} className="sp-empty-icon"/>
// //               <h3>{t.no_result}</h3><p>{t.no_sub}</p>
// //               {suggestions.length>0 && (
// //                 <div className="sp-suggestions">
// //                   <p>{t.suggestions}</p>
// //                   <div className="sp-chips">{suggestions.map((s,i)=><button key={i} className="sp-chip" onClick={()=>handleSuggestion(s)}>{s}</button>)}</div>
// //                 </div>
// //               )}
// //               <button className="sp-reset" onClick={handleReset}>{t.reset}</button>
// //             </div>
// //           )}
// //         </div>
// //       )}

// //       {/* ══ VUE CARTE / MIXTE ════════════════════════════════ */}
// //       {viewMode!=='list' && (
// //         <div className={`sp-map-layout${viewMode==='split'?' sp-map-layout--split':''}`}>

// //           {/* ── Colonne liste (mode split = HousingCard standard) ── */}
// //           {viewMode==='split' && (
// //             <div className="sp-map-list-col">
// //               {loading && (
// //                 <div className="sp-map-loading">
// //                   <Loader className="sp-spinner" size={28}/>
// //                 </div>
// //               )}
// //               {!loading && mapHousings.length===0 && (
// //                 <div className="sp-map-empty">
// //                   <TrendingUp size={32}/><p>{t.no_result}</p>
// //                 </div>
// //               )}
// //               {!loading && mapHousings.map(h => (
// //                 <div
// //                   key={h.id}
// //                   className={`sp-split-card-wrap${selectedHousing?.id===h.id?' sp-split-card-wrap--sel':''}`}
// //                   onClick={()=>setSelectedHousing(h)}
// //                 >
// //                   <HousingCard housing={toCardFormat(h)} showActions />
// //                 </div>
// //               ))}
// //             </div>
// //           )}

// //           {/* ── Zone carte ── */}
// //           <div className="sp-map-col">

// //             {/* Barre stats */}
// //             <div className="sp-map-stats">
// //               <div>
// //                 <div className="sp-map-stat-n">{mapHousings.length}</div>
// //                 <div className="sp-map-stat-l">{t.on_map}</div>
// //               </div>
// //               <div className="sp-map-stat-sep"/>
// //               <div>
// //                 <div className="sp-map-stat-v">{avg.toLocaleString('fr-FR')}</div>
// //                 <div className="sp-map-stat-l">{t.avg_price}</div>
// //               </div>
// //               <div className="sp-map-stat-sep"/>
// //               <div>
// //                 <div className="sp-map-stat-v" style={{color:'#F59E0B'}}>{min.toLocaleString('fr-FR')}</div>
// //                 <div className="sp-map-stat-l">{t.min_price}</div>
// //               </div>
// //             </div>

// //             {/* Bouton ma position */}
// //             <button
// //               className="sp-map-locate-btn"
// //               title="Ma position"
// //               onClick={()=>{
// //                 navigator.geolocation.getCurrentPosition(
// //                   pos=>{
// //                     const loc={lat:pos.coords.latitude,lng:pos.coords.longitude};
// //                     setUserLocation(loc); addToast('📍 Position détectée','ok');
// //                   },
// //                   ()=>addToast('Position non accessible','err')
// //                 );
// //               }}
// //             >
// //               <i className="fas fa-location-crosshairs"/>
// //             </button>

// //             {/* Leaflet Map */}
// //             <MapContainer
// //               center={[3.848, 11.502]}
// //               zoom={13}
// //               style={{ width:'100%', height:'100%' }}
// //               zoomControl={false}
// //               attributionControl
// //             >
// //               <TileLayer
// //                 url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
// //                 attribution='© <a href="https://www.openstreetmap.org/copyright">OSM</a> © <a href="https://carto.com/">CARTO</a>'
// //                 subdomains="abcd"
// //                 maxZoom={20}
// //               />
// //               <MapController
// //                 housings={mapHousings}
// //                 selectedId={selectedHousing?.id}
// //                 onSelect={handleSelectOnMap}
// //                 userLoc={userLocation}
// //                 route={route}
// //               />
// //             </MapContainer>

// //             {/* ── Overlay aperçu (HousingCard standard) ── */}
// //             {selectedHousing && (
// //               <MapCardOverlay
// //                 h={selectedHousing}
// //                 onClose={()=>setSelectedHousing(null)}
// //                 onItin={startItin}
// //               />
// //             )}

// //             {/* ── Panel itinéraire ── */}
// //             {itinOpen && (
// //               <ItineraryPanel
// //                 t={t} lang={language}
// //                 status={itinStatus} dist={itinDist} time={itinTime} dest={itinDest}
// //                 progress={itinProg} transport={transport}
// //                 onTransport={setTransport}
// //                 onClose={closeItin}
// //               />
// //             )}

// //             {/* ── Compare strip ── */}
// //             {compareList.length>0 && (
// //               <div className="sp-cmp-strip">
// //                 <i className="fas fa-scale-balanced" style={{color:'#58A6FF',flexShrink:0}}/>
// //                 <div className="sp-cmp-strip-items">
// //                   {compareList.map(h=>(
// //                     <div key={h.id} className="sp-cmp-strip-item">
// //                       <span>{h.title}</span>
// //                       <button onClick={()=>toggleCompare(h)}><i className="fas fa-xmark"/></button>
// //                     </div>
// //                   ))}
// //                 </div>
// //                 <button className="sp-cmp-strip-btn" onClick={()=>setShowCompare(true)}>
// //                   <i className="fas fa-chart-bar"/> {t.cmp_launch}
// //                 </button>
// //               </div>
// //             )}
// //           </div>
// //         </div>
// //       )}

// //       {/* Compare modal */}
// //       {showCompare && (
// //         <CompareModal
// //           list={compareList} t={t} lang={language}
// //           onClose={()=>setShowCompare(false)}
// //           onRemove={id=>setCompareList(p=>p.filter(x=>x.id!==id))}
// //         />
// //       )}

// //       {/* Toasts */}
// //       <div className="sp-toast-wrap">
// //         {toasts.map(({id,msg,type})=>(
// //           <div key={id} className={`sp-toast sp-toast--${type}`}>
// //             <i className={`fas ${type==='ok'?'fa-circle-check':type==='err'?'fa-circle-exclamation':'fa-circle-info'}`}/>
// //             <span>{msg}</span>
// //           </div>
// //         ))}
// //       </div>
// //     </div>
// //   );
// // };

// // export default SearchPage;









// // src/pages/SearchPage.jsx — VERSION FUSIONNÉE
// // ============================================================
// // Fusionne :
// //   • Votre SearchPage (NLP, filtres, vocal, near me) ← inchangé
// //   • SearchMapPage   (carte Leaflet, itinéraire, comparaison)
// //
// // npm install leaflet react-leaflet leaflet.markercluster
// //
// // Dans main.jsx / index.css (une seule fois) :
// //   import 'leaflet/dist/leaflet.css';
// //   import 'leaflet.markercluster/dist/MarkerCluster.css';
// //   import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
// // ============================================================

// import { useState, useEffect, useRef, useCallback } from 'react';
// import { useLocation, useNavigate }  from 'react-router-dom';
// import { Loader, MapPin, TrendingUp, Sparkles, Map, List, Columns } from 'lucide-react';
// import { MapContainer, TileLayer, useMap } from 'react-leaflet';
// import L from 'leaflet';
// import 'leaflet.markercluster';

// import { useTheme }       from '../contexts/ThemeContext';
// import searchService      from '../services/searchService';
// import api                from '../services/api';

// import SearchBar    from '../components/Search/SearchBar';
// import FilterPanel  from '../components/Search/FilterPanel';
// import NearMeButton from '../components/Search/NearMeButton';
// import VoiceSearch  from '../components/Search/VoiceSearch';
// import HousingList  from '../components/housing/HousingList';
// import HousingCard  from '../components/housing/HousingCard';

// import './SearchPage.css';
// import './SearchPageMap.css';  // ← nouveau fichier CSS carte

// // ─── Helper URL images (relative → absolue) ──────────────
// const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api')
//   .replace(/\/api\/?$/, '');

// function imgUrl(path) {
//   if (!path || typeof path !== 'string') return null;
//   const p = path.trim();
//   if (!p) return null;
//   // URL déjà absolue → retourner telle quelle
//   if (p.startsWith('http') || p.startsWith('blob:') || p.startsWith('data:')) return p;
//   // URL relative → préfixer avec la base de l'API
//   return `${API_BASE}${p.startsWith('/') ? '' : '/'}${p}`;
// }

// // ─── Couleurs de fond par catégorie (fallback sans image) ─
// const CAT_COLORS = {
//   'Studio':      ['#1B4332','#2D6A4F'],
//   'Chambre':     ['#4A1942','#7B2D8B'],
//   'Appartement': ['#1E3A5F','#2E5F9E'],
//   'Maison':      ['#2D3A1E','#3D5028'],
//   'Villa':       ['#78350F','#92400E'],
// };
// function catBg(cat) {
//   const [c1, c2] = CAT_COLORS[cat] || ['#1C2128','#2D333B'];
//   return `linear-gradient(135deg,${c1},${c2})`;
// }

// // ─── Adaptateur : données API → format HousingCard ────────
// // HousingCard attend : main_image (URL absolue), display_name,
// //   district_name, city_name, is_liked, is_saved, likes_count
// function toCardFormat(h) {
//   // Stratégie multi-source pour l'image principale :
//   //  1. h.main_image  → champ calculé par Django (absolu ou relatif)
//   //  2. h.images[]    → tableau retourné par HousingDetailSerializer
//   //  3. null          → pas d'image disponible
//   const fromMain   = h.main_image ? imgUrl(h.main_image) : null;
//   const imgObj     = h.images?.find(i => i.is_main) || h.images?.[0];
//   const fromImages = imgObj?.image ? imgUrl(imgObj.image) : null;

//   return {
//     ...h,
//     main_image:    fromMain || fromImages || null,
//     display_name:  h.display_name || h.title,
//     district_name: h.district_name
//                    || (typeof h.district === 'object' ? h.district?.name : null)
//                    || '',
//     city_name:     h.city_name
//                    || (typeof h.city === 'object' ? h.city?.name : null)
//                    || '',
//     is_liked:    h.is_liked    || false,
//     is_saved:    h.is_saved    || false,
//     likes_count: h.likes_count || 0,
//     views_count: h.views_count || 0,
//   };
// }

// // ─── TRADUCTIONS ─────────────────────────────────────────────
// const T = {
//   fr: {
//     title:       'Rechercher un logement',
//     subtitle:    'Trouvez le logement idéal au Cameroun',
//     results:     'résultat(s)',
//     loading:     'Recherche en cours…',
//     retry:       'Réessayer',
//     no_result:   'Aucun résultat',
//     no_sub:      "Essayez d'ajuster vos critères",
//     reset:       'Réinitialiser',
//     b_nearby:    'Autour de votre position',
//     b_nlp:       'Recherche intelligente',
//     b_voice:     'Recherche vocale',
//     b_filters:   'filtre(s) actif(s)',
//     suggestions: 'Suggestions :',
//     error:       'Erreur de recherche. Veuillez réessayer.',
//     view_list:   'Liste',
//     view_map:    'Carte',
//     view_split:  'Mixte',
//     on_map:      'logement(s) sur la carte',
//     avg_price:   'Prix moyen',
//     min_price:   'À partir de',
//     detail_title: 'Détails du logement',
//     feat_labels: {
//       wifi:'WiFi', parking:'Parking', gardien:'Gardien',
//       climatisation:'Climatisation', eau:'Eau 24h', electricite:'Électricité',
//       piscine:'Piscine', jardin:'Jardin', balcon:'Balcon/Terrasse',
//       cuisine:'Cuisine équipée', ascenseur:'Ascenseur', vue:'Vue panoramique',
//     },
//     itin_title:  'Itinéraire',
//     itin_start:  "Détection de votre position…",
//     itin_calc:   "Calcul de l'itinéraire…",
//     itin_ok:     'Itinéraire calculé vers',
//     itin_approx: "Distance à vol d'oiseau utilisée",
//     itin_denied: 'Position approx. utilisée (accès refusé)',
//     transport:   ['Voiture','Pied','Vélo'],
//     distance:    'Distance',
//     duration:    'Durée estimée',
//     destination: 'Destination',
//     compare:     'Comparer',
//     compare_max: 'Maximum 3 logements à comparer',
//     fav_add:     'Ajouté aux favoris',
//     fav_rm:      'Retiré des favoris',
//     plan_visit:  'Planifier une visite',
//     contact:     'Contacter',
//     cmp_launch:  'Comparer',
//     cmp_title:   'Comparaison',
//     close:       'Fermer',
//   },
//   en: {
//     title:       'Find housing',
//     subtitle:    'Find your ideal home in Cameroon',
//     results:     'result(s)',
//     loading:     'Searching…',
//     retry:       'Retry',
//     no_result:   'No results found',
//     no_sub:      'Try adjusting your criteria',
//     reset:       'Reset',
//     b_nearby:    'Near your location',
//     b_nlp:       'Smart search',
//     b_voice:     'Voice search',
//     b_filters:   'active filter(s)',
//     suggestions: 'Suggestions:',
//     error:       'Search error. Please try again.',
//     view_list:   'List',
//     view_map:    'Map',
//     view_split:  'Split',
//     on_map:      'listing(s) on map',
//     avg_price:   'Avg price',
//     min_price:   'From',
//     detail_title: 'Property details',
//     feat_labels: {
//       wifi:'WiFi', parking:'Parking', gardien:'Security',
//       climatisation:'A/C', eau:'Water 24h', electricite:'Electricity',
//       piscine:'Pool', jardin:'Garden', balcon:'Balcony/Terrace',
//       cuisine:'Fitted kitchen', ascenseur:'Elevator', vue:'Panoramic view',
//     },
//     itin_title:  'Itinerary',
//     itin_start:  'Detecting your location…',
//     itin_calc:   'Calculating itinerary…',
//     itin_ok:     'Itinerary calculated to',
//     itin_approx: 'Straight-line distance used',
//     itin_denied: 'Approx. location used (access denied)',
//     transport:   ['Car','Walking','Cycling'],
//     distance:    'Distance',
//     duration:    'Est. time',
//     destination: 'Destination',
//     compare:     'Compare',
//     compare_max: 'Max 3 properties to compare',
//     fav_add:     'Added to favourites',
//     fav_rm:      'Removed from favourites',
//     plan_visit:  'Schedule visit',
//     contact:     'Contact',
//     cmp_launch:  'Compare',
//     cmp_title:   'Comparison',
//     close:       'Close',
//   },
// };

// // ─── UTILS ───────────────────────────────────────────────────
// function haversine(la1, lo1, la2, lo2) {
//   const R = 6371, d2r = Math.PI / 180;
//   const dLa = (la2 - la1) * d2r, dLo = (lo2 - lo1) * d2r;
//   const a = Math.sin(dLa/2)**2 + Math.cos(la1*d2r)*Math.cos(la2*d2r)*Math.sin(dLo/2)**2;
//   return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
// }

// function fmtPrice(p) {
//   return p >= 1_000_000 ? (p/1_000_000).toFixed(1)+'M' : Math.round(p/1000)+'k';
// }

// // ─── STATUS HELPERS ───────────────────────────────────────────
// const STATUS_MAP = {
//   disponible: { cls: 'sp-badge-dispo', label: { fr: 'Disponible', en: 'Available' } },
//   reserve:    { cls: 'sp-badge-res',   label: { fr: 'Réservé',    en: 'Reserved'  } },
//   occupe:     { cls: 'sp-badge-occ',   label: { fr: 'Occupé',     en: 'Occupied'  } },
// };

// // ════════════════════════════════════════════════════════════
// // MapController — interne, gère markers/clusters/route
// // ════════════════════════════════════════════════════════════
// function MapController({ housings, selectedId, onSelect, userLoc, route }) {
//   const map         = useMap();
//   const clusterRef  = useRef(null);
//   const routeRef    = useRef(null);
//   const userMkRef   = useRef(null);

//   // Cluster group (une seule fois)
//   useEffect(() => {
//     const cluster = L.markerClusterGroup({
//       maxClusterRadius: 60,
//       iconCreateFunction: c => L.divIcon({
//         html: `<div class="sp-mk-cluster">${c.getChildCount()}</div>`,
//         className: '', iconSize: [36, 36],
//       }),
//     });
//     map.addLayer(cluster);
//     clusterRef.current = cluster;
//     return () => map.removeLayer(cluster);
//   }, [map]);

//   // Markers
//   useEffect(() => {
//     if (!clusterRef.current) return;
//     clusterRef.current.clearLayers();
//     housings.forEach(h => {
//       if (!h.latitude || !h.longitude) return;
//       const sel  = h.id === selectedId;
//       const icon = L.divIcon({
//         html: `<div class="sp-mk${sel ? ' sp-mk--sel' : ''}">${fmtPrice(h.price)} FCFA</div>`,
//         className: '', iconSize: null, iconAnchor: [44, 14],
//       });
//       const m = L.marker([h.latitude, h.longitude], { icon });
//       m.on('click', () => onSelect(h));
//       clusterRef.current.addLayer(m);
//     });
//   }, [housings, selectedId, onSelect]);

//   // Route
//   useEffect(() => {
//     if (routeRef.current) { map.removeLayer(routeRef.current); routeRef.current = null; }
//     if (!route?.length) return;
//     const poly = L.polyline(route, { color: '#F59E0B', weight: 5, opacity: .85, dashArray: '10,5' });
//     poly.addTo(map); routeRef.current = poly;
//     map.fitBounds(poly.getBounds(), { padding: [60, 60] });
//   }, [route, map]);

//   // User marker
//   useEffect(() => {
//     if (userMkRef.current) { map.removeLayer(userMkRef.current); userMkRef.current = null; }
//     if (!userLoc) return;
//     userMkRef.current = L.marker([userLoc.lat, userLoc.lng], {
//       icon: L.divIcon({ html: '<div class="sp-user-dot"></div>', className: '', iconSize: [14, 14] }),
//     }).addTo(map).bindTooltip('📍 Vous êtes ici');
//   }, [userLoc, map]);

//   return null;
// }

// // ════════════════════════════════════════════════════════════
// // ════════════════════════════════════════════════════════════
// // MapCardOverlay — remplace DetailPanel + MiniCard
// // Affiche le HousingCard standard quand on clique sur un marker
// // ════════════════════════════════════════════════════════════
// function MapCardOverlay({ h, onClose, onItin }) {
//   const navigate = useNavigate();
//   return (
//     <div className="sp-map-overlay">

//       {/* ── En-tête ── */}
//       <div className="sp-map-overlay-head">
//         <span className="sp-map-overlay-title">
//           <i className="fas fa-location-dot" style={{color:'#10B981',marginRight:6}}/>
//           Aperçu du logement
//         </span>
//         <button
//           className="sp-map-overlay-close"
//           onClick={onClose}
//           title="Fermer"
//           aria-label="Fermer l'aperçu"
//         >
//           <i className="fas fa-xmark"/>
//         </button>
//       </div>

//       {/* ── Carte logement (identique à la vue Liste) ── */}
//       <div className="sp-map-overlay-card">
//         <HousingCard
//           housing={toCardFormat(h)}
//           showActions={true}
//         />
//       </div>

//       {/* ── Boutons extra (itinéraire + visite) ── */}
//       <div className="sp-map-overlay-actions">
//         <button
//           className="sp-ov-btn sp-ov-btn--itin"
//           onClick={() => onItin(h)}
//         >
//           <i className="fas fa-route"/> Calculer l'itinéraire
//         </button>
//         <button
//           className="sp-ov-btn sp-ov-btn--visit"
//           onClick={() => navigate(`/housing/${h.id}?action=visit`)}
//         >
//           <i className="fas fa-calendar-plus"/> Planifier une visite
//         </button>
//       </div>
//     </div>
//   );
// }

// const FEAT_ICON = {
//   wifi:'fa-wifi', parking:'fa-car', gardien:'fa-shield-halved',
//   climatisation:'fa-snowflake', eau:'fa-droplet', electricite:'fa-bolt',
//   piscine:'fa-person-swimming', jardin:'fa-leaf', balcon:'fa-door-open',
//   cuisine:'fa-utensils', ascenseur:'fa-elevator', vue:'fa-binoculars',
// };

// // ════════════════════════════════════════════════════════════
// // ItineraryPanel
// // ════════════════════════════════════════════════════════════
// function ItineraryPanel({ t, lang, status, dist, time, dest, progress, transport, onTransport, onClose }) {
//   const modes = [
//     { k:'driving', ico:'fa-car',            lbl: t.transport[0] },
//     { k:'foot',    ico:'fa-person-walking', lbl: t.transport[1] },
//     { k:'bike',    ico:'fa-bicycle',        lbl: t.transport[2] },
//   ];
//   return (
//     <div className="sp-itin">
//       <div className="sp-itin-inner">
//         <div className="sp-itin-hd">
//           <span className="sp-itin-title"><i className="fas fa-route"/> {t.itin_title}</span>
//           <button className="sp-dp-close" onClick={onClose}><i className="fas fa-xmark"/></button>
//         </div>
//         <div className="sp-itin-modes">
//           {modes.map(m=>(
//             <button key={m.k} className={`sp-itin-mode${transport===m.k?' sp-itin-mode--active':''}`} onClick={()=>onTransport(m.k)}>
//               <i className={`fas ${m.ico}`}/> {m.lbl}
//             </button>
//           ))}
//         </div>
//         <div className="sp-itin-bar"><div className="sp-itin-bar-fill" style={{width:`${progress}%`}}/></div>
//         {dist && (
//           <div className="sp-itin-stats">
//             {[{ico:'fa-road',v:dist,l:t.distance},{ico:'fa-clock',v:time,l:t.duration},{ico:'fa-location-dot',v:dest,l:t.destination}].map(({ico,v,l})=>(
//               <div key={l} className="sp-itin-s">
//                 <div className="sp-itin-ico"><i className={`fas ${ico}`}/></div>
//                 <div><div className="sp-itin-sv">{v}</div><div className="sp-itin-sl">{l}</div></div>
//               </div>
//             ))}
//           </div>
//         )}
//         <p className="sp-itin-status" dangerouslySetInnerHTML={{__html:status}}/>
//       </div>
//     </div>
//   );
// }

// // ════════════════════════════════════════════════════════════
// // CompareModal
// // ════════════════════════════════════════════════════════════
// function CompareModal({ list, t, lang, onClose, onRemove }) {
//   const rows = [
//     { label:'Prix/mois',   fmt:h=>h.price?.toLocaleString('fr-FR')+' FCFA', valFn:h=>h.price, lowBest:true },
//     { label:'Catégorie',   fmt:h=>h.category_name||h.category||'—' },
//     { label:'Ville',       fmt:h=>`${h.city_name} · ${h.district_name}` },
//     { label:'Chambres',    fmt:h=>String(h.rooms||'—'),    valFn:h=>h.rooms||0 },
//     { label:'SDB',         fmt:h=>String(h.bathrooms||'—'),valFn:h=>h.bathrooms||0 },
//     { label:'Surface',     fmt:h=>(h.area||0)+'m²',        valFn:h=>h.area||0 },
//     { label:'Statut',      fmt:h=>STATUS_MAP[h.status]?.label[lang]||h.status },
//     { label:'Vues',        fmt:h=>(h.views_count||0).toLocaleString(), valFn:h=>h.views_count||0 },
//   ];
//   return (
//     <div className="sp-cmp-modal" onClick={e=>e.target===e.currentTarget&&onClose()}>
//       <div className="sp-cmp-box">
//         <div className="sp-cmp-hd">
//           <h2><i className="fas fa-scale-balanced" style={{color:'#58A6FF',marginRight:8}}/>{t.cmp_title}</h2>
//           <button className="sp-dp-close" onClick={onClose}><i className="fas fa-xmark"/></button>
//         </div>
//         <div className="sp-cmp-table">
//           <div className="sp-cmp-row sp-cmp-head-row">
//             <div/>
//             {list.map(h=>(
//               <div key={h.id} className="sp-cmp-th">
//                 <span>{h.title}</span>
//                 <button onClick={()=>onRemove(h.id)}><i className="fas fa-xmark"/> Retirer</button>
//               </div>
//             ))}
//           </div>
//           {rows.map(({label,fmt,valFn,lowBest})=>{
//             let bestIdx=-1;
//             if(valFn){const vals=list.map(valFn);const best=lowBest?Math.min(...vals):Math.max(...vals);bestIdx=vals.indexOf(best);}
//             return (
//               <div key={label} className="sp-cmp-row">
//                 <div className="sp-cmp-lbl">{label}</div>
//                 {list.map((h,i)=>(
//                   <div key={h.id} className={`sp-cmp-val${i===bestIdx?' sp-cmp-val--best':''}`}>{fmt(h)}</div>
//                 ))}
//               </div>
//             );
//           })}
//         </div>
//       </div>
//     </div>
//   );
// }

// // ════════════════════════════════════════════════════════════
// // MAIN PAGE — SearchPage fusionnée
// // ════════════════════════════════════════════════════════════
// const SearchPage = () => {
//   const location     = useLocation();
//   const navigate     = useNavigate();
//   const { language } = useTheme();
//   const t            = T[language] || T.fr;

//   // ── Données & états existants ─────────────────────────────
//   const [housings,      setHousings]      = useState([]);
//   const [loading,       setLoading]       = useState(false);
//   const [error,         setError]         = useState(null);
//   const [count,         setCount]         = useState(null);
//   const [suggestions,   setSuggestions]   = useState([]);
//   const [nlpSummary,    setNlpSummary]    = useState('');
//   const [mode,          setMode]          = useState('default');
//   const [userLocation,  setUserLocation]  = useState(null);
//   const [activeFilters, setActiveFilters] = useState({});

//   // ── Vue : 'list' | 'map' | 'split' ───────────────────────
//   const [viewMode, setViewMode] = useState('list');

//   // ── Carte ─────────────────────────────────────────────────
//   const [selectedHousing, setSelectedHousing] = useState(null);
//   const [route,           setRoute]           = useState(null);
//   const [favorites,       setFavorites]       = useState(new Set());
//   const [compareList,     setCompareList]     = useState([]);
//   const [showCompare,     setShowCompare]     = useState(false);

//   // ── Itinéraire ────────────────────────────────────────────
//   const [itinOpen,   setItinOpen]   = useState(false);
//   const [itinStatus, setItinStatus] = useState('');
//   const [itinDist,   setItinDist]   = useState('');
//   const [itinTime,   setItinTime]   = useState('');
//   const [itinDest,   setItinDest]   = useState('');
//   const [itinProg,   setItinProg]   = useState(0);
//   const [transport,  setTransport]  = useState('driving');

//   // ── Toast ─────────────────────────────────────────────────
//   const [toasts, setToasts] = useState([]);
//   const addToast = useCallback((msg, type='inf') => {
//     const id = Date.now();
//     setToasts(p => [...p, {id, msg, type}]);
//     setTimeout(() => setToasts(p => p.filter(x=>x.id!==id)), 3500);
//   }, []);

//   // ── Stats carte ───────────────────────────────────────────
//   const mapHousings = housings.filter(h => h.latitude && h.longitude);
//   const avg = mapHousings.length ? Math.round(mapHousings.reduce((s,h)=>s+h.price,0)/mapHousings.length) : 0;
//   const min = mapHousings.length ? Math.min(...mapHousings.map(h=>h.price)) : 0;

//   // ════════════════════════════════════════════════════════
//   // LOGIQUE DE RECHERCHE (inchangée depuis votre SearchPage)
//   // ════════════════════════════════════════════════════════

//   useEffect(() => {
//     const params = new URLSearchParams(location.search);
//     const query  = params.get('query');
//     if (query) { setMode('nlp'); doNlp(query, null); }
//     else        { doDefault(); }
//   // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [language]);

//   const startSearch = () => { setLoading(true); setError(null); setSuggestions([]); };
//   const setResults  = (list, total) => { setHousings(list); setCount(total!==undefined?total:list.length); };
//   const onSearchErr = e => { console.error(e); setError(t.error); setHousings([]); setCount(0); };
//   const toList      = d => Array.isArray(d)?d:(d?.results||[]);

//   const doDefault = async () => {
//     startSearch(); setNlpSummary('');
//     try {
//       const res = await api.get('/housings/', { params: { status:'disponible', ordering:'-created_at' } });
//       setResults(toList(res.data), res.data?.count);
//     } catch(e) { onSearchErr(e); }
//     finally { setLoading(false); }
//   };

//   const doNlp = async (query, coords) => {
//     if (!query?.trim()) { doDefault(); return; }
//     startSearch();
//     try {
//       const payload = { query: query.trim(), language };
//       if (coords) { payload.user_lat=coords.lat; payload.user_lng=coords.lng; }
//       const data = await searchService.nlpSearch(payload);
//       setResults(data.results||[], data.count);
//       setNlpSummary(data.criteria_summary||'');
//       setSuggestions(data.suggestions||[]);
//     } catch(e) { onSearchErr(e); }
//     finally { setLoading(false); }
//   };

//   const doFilters = async (filters) => {
//     startSearch(); setNlpSummary('');
//     try {
//       const params = {};
//       Object.entries(filters).forEach(([k,v])=>{ if(v!==''&&v!=null) params[k]=v; });
//       if (!params.status) params.status='disponible';
//       const res = await api.get('/housings/', { params });
//       setResults(toList(res.data), res.data?.count);
//     } catch(e) { onSearchErr(e); }
//     finally { setLoading(false); }
//   };

//   const doNearby = async (coords) => {
//     startSearch(); setNlpSummary('');
//     try {
//       const data = await searchService.nlpSearch({
//         query: language==='fr' ? 'logement disponible' : 'available housing',
//         language, user_lat: coords.lat, user_lng: coords.lng,
//       });
//       setResults(data.results||[], data.count);
//     } catch(e) { onSearchErr(e); }
//     finally { setLoading(false); }
//   };

//   // ── Handlers UI (inchangés) ───────────────────────────────
//   const handleSearch = ({ query }) => {
//     setMode('nlp'); setActiveFilters({});
//     navigate(`/search?query=${encodeURIComponent(query)}`, { replace:true });
//     doNlp(query, userLocation);
//   };

//   const handleVoiceTranscript = (transcript) => {
//     setMode('voice'); setActiveFilters({});
//     doNlp(transcript, userLocation);
//   };

//   const handleFilters = (newFilters) => {
//     setActiveFilters(newFilters); setMode('filters'); setNlpSummary('');
//     doFilters(newFilters);
//   };

//   const handleNearby = (coords) => {
//     setUserLocation(coords); setMode('nearby'); setActiveFilters({});
//     doNearby(coords);
//     if(viewMode==='list') setViewMode('map'); // auto-switch carte si près de moi
//   };

//   const handleSuggestion = (text) => { setMode('nlp'); doNlp(text, null); };

//   const handleClearNLP = () => {
//     setNlpSummary(''); setActiveFilters({}); setMode('default');
//     setUserLocation(null); navigate('/search', { replace:true }); doDefault();
//   };

//   const handleReset = () => {
//     setActiveFilters({}); setNlpSummary(''); setUserLocation(null);
//     setMode('default'); setSuggestions([]);
//     navigate('/search', { replace:true }); doDefault();
//   };

//   // ════════════════════════════════════════════════════════
//   // LOGIQUE CARTE
//   // ════════════════════════════════════════════════════════

//   // ── Sélection sur carte ───────────────────────────────────
//   const handleSelectOnMap = useCallback((h) => {
//     setSelectedHousing(h);
//   }, []);

//   // ── Favoris ───────────────────────────────────────────────
//   const toggleFav = (id) => {
//     setFavorites(prev => {
//       const next = new Set(prev);
//       if(next.has(id)){ next.delete(id); addToast(t.fav_rm,'inf'); }
//       else            { next.add(id);    addToast('❤️ '+t.fav_add,'ok'); }
//       return next;
//     });
//   };

//   // ── Comparaison ───────────────────────────────────────────
//   const toggleCompare = (h) => {
//     setCompareList(prev => {
//       if(prev.find(x=>x.id===h.id)) return prev.filter(x=>x.id!==h.id);
//       if(prev.length>=3){ addToast(t.compare_max,'err'); return prev; }
//       addToast('📊 '+h.title,'ok');
//       return [...prev, h];
//     });
//   };

//   // ── Itinéraire ────────────────────────────────────────────
//   const startItin = useCallback(async (h) => {
//     setItinOpen(true); setItinDist(''); setItinTime(''); setItinDest(''); setItinProg(0);
//     setItinStatus(`<i class="fas fa-location-crosshairs fa-spin"></i> ${t.itin_start}`);

//     const calcRoute = async (loc) => {
//       setItinProg(55);
//       setItinStatus(`<i class="fas fa-route fa-spin"></i> ${t.itin_calc}`);
//       try {
//         const url = `https://router.project-osrm.org/route/v1/driving/${loc.lng},${loc.lat};${h.longitude},${h.latitude}?overview=full&geometries=geojson`;
//         const resp = await fetch(url);
//         const data = await resp.json();
//         if(data.routes?.[0]){
//           const rt = data.routes[0];
//           setRoute(rt.geometry.coordinates.map(([ln,lt])=>[lt,ln]));
//           const km   = (rt.distance/1000).toFixed(1);
//           const mins = Math.round(rt.duration/60);
//           setItinDist(km+' km');
//           setItinTime(mins<60 ? mins+' min' : Math.floor(mins/60)+'h '+(mins%60)+'min');
//           setItinDest(`${h.district_name}, ${h.city_name}`);
//           setItinProg(100);
//           setItinStatus(`<i class="fas fa-check-circle" style="color:#10B981"></i> ${t.itin_ok} <b>${h.district_name}, ${h.city_name}</b>`);
//         } else throw new Error('no route');
//       } catch {
//         setRoute([[loc.lat,loc.lng],[h.latitude,h.longitude]]);
//         const d = haversine(loc.lat,loc.lng,h.latitude,h.longitude);
//         setItinDist(d.toFixed(1)+' km'); setItinTime(Math.round((d/40)*60)+' min');
//         setItinDest(`${h.district_name}, ${h.city_name}`);
//         setItinProg(100);
//         setItinStatus(`<i class="fas fa-triangle-exclamation" style="color:#F59E0B"></i> ${t.itin_approx}`);
//       }
//     };

//     if(userLocation){ calcRoute(userLocation); return; }

//     navigator.geolocation.getCurrentPosition(
//       async pos => {
//         const loc = { lat:pos.coords.latitude, lng:pos.coords.longitude };
//         setUserLocation(loc); setItinProg(35); calcRoute(loc);
//       },
//       () => {
//         const loc = { lat:3.848, lng:11.502 };
//         setUserLocation(loc);
//         setItinStatus(`<i class="fas fa-circle-info" style="color:#58A6FF"></i> ${t.itin_denied}`);
//         setItinProg(30); calcRoute(loc);
//       }
//     );
//   }, [userLocation, t]);

//   const closeItin = () => { setItinOpen(false); setRoute(null); setItinProg(0); };

//   // ── Planifier visite (redirige vers la page visite) ───────
//   const handleVisit = (h) => {
//     navigate(`/housings/${h.id}?action=visit`);
//   };

//   // ────────────────────────────────────────────────────────
//   const filterCount = Object.values(activeFilters).filter(v=>v!==''&&v!=null).length;
//   const isNlpMode   = mode==='nlp'||mode==='voice';

//   return (
//     <div className="search-page">

//       {/* ══ EN-TÊTE ══════════════════════════════════════════ */}
//       <div className="sp-header">
//         <div className="container">
//           <div className="sp-header-text">
//             <h1 className="sp-title">{t.title}</h1>
//             <p className="sp-subtitle">{t.subtitle}</p>
//           </div>

//           <div className="sp-controls">
//             <SearchBar
//               onSearch={handleSearch}
//               loading={loading}
//               criteriaSummary={nlpSummary}
//               onClearNLP={handleClearNLP}
//               language={language}
//             />
//             <div className="sp-actions">
//               <VoiceSearch
//                 onTranscript={handleVoiceTranscript}
//                 onError={msg=>setError(msg)}
//                 language={language}
//               />
//               <NearMeButton
//                 onLocationFound={handleNearby}
//                 onError={msg=>setError(msg)}
//                 language={language}
//               />
//               <FilterPanel
//                 onApplyFilters={handleFilters}
//                 initialFilters={activeFilters}
//                 language={language}
//               />
//             </div>
//           </div>

//           {/* Badges mode */}
//           {mode!=='default' && (
//             <div className="sp-badges">
//               {mode==='nearby'  && <span className="sp-badge sp-badge--nearby"><MapPin size={12}/> {t.b_nearby}</span>}
//               {isNlpMode        && <span className="sp-badge sp-badge--nlp"><Sparkles size={12}/>{mode==='voice'?t.b_voice:t.b_nlp}</span>}
//               {mode==='filters' && filterCount>0 && <span className="sp-badge sp-badge--filters">{filterCount} {t.b_filters}</span>}
//             </div>
//           )}

//           {/* ── Toggle vue Liste / Carte / Mixte ── */}
//           <div className="sp-view-toggle">
//             {[
//               { k:'list',  ico:<List  size={14}/>, lbl:t.view_list  },
//               { k:'map',   ico:<Map   size={14}/>, lbl:t.view_map   },
//               { k:'split', ico:<Columns size={14}/>, lbl:t.view_split },
//             ].map(({k,ico,lbl})=>(
//               <button
//                 key={k}
//                 className={`sp-view-btn${viewMode===k?' sp-view-btn--active':''}`}
//                 onClick={()=>setViewMode(k)}
//               >
//                 {ico} {lbl}
//               </button>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* ══ VUE LISTE ════════════════════════════════════════ */}
//       {viewMode==='list' && (
//         <div className="container sp-content">
//           {!loading && count!==null && (
//             <div className="sp-toolbar">
//               <span className="sp-count"><strong>{count}</strong> {t.results}</span>
//             </div>
//           )}
//           {loading && <div className="sp-loading"><Loader className="sp-spinner" size={36}/><p>{t.loading}</p></div>}
//           {!loading && error  && <div className="sp-error"><p>{error}</p><button className="sp-retry" onClick={handleReset}>{t.retry}</button></div>}
//           {!loading && !error && housings.length>0 && <HousingList housings={housings}/>}
//           {!loading && !error && housings.length===0 && count!==null && (
//             <div className="sp-empty">
//               <TrendingUp size={48} className="sp-empty-icon"/>
//               <h3>{t.no_result}</h3><p>{t.no_sub}</p>
//               {suggestions.length>0 && (
//                 <div className="sp-suggestions">
//                   <p>{t.suggestions}</p>
//                   <div className="sp-chips">{suggestions.map((s,i)=><button key={i} className="sp-chip" onClick={()=>handleSuggestion(s)}>{s}</button>)}</div>
//                 </div>
//               )}
//               <button className="sp-reset" onClick={handleReset}>{t.reset}</button>
//             </div>
//           )}
//         </div>
//       )}

//       {/* ══ VUE CARTE / MIXTE ════════════════════════════════ */}
//       {viewMode!=='list' && (
//         <div className={`sp-map-layout${viewMode==='split'?' sp-map-layout--split':''}`}>

//           {/* ── Colonne liste (mode split = HousingCard standard) ── */}
//           {viewMode==='split' && (
//             <div className="sp-map-list-col">
//               {loading && (
//                 <div className="sp-map-loading">
//                   <Loader className="sp-spinner" size={28}/>
//                 </div>
//               )}
//               {!loading && mapHousings.length===0 && (
//                 <div className="sp-map-empty">
//                   <TrendingUp size={32}/><p>{t.no_result}</p>
//                 </div>
//               )}
//               {!loading && mapHousings.map(h => (
//                 <div
//                   key={h.id}
//                   className={`sp-split-card-wrap${selectedHousing?.id===h.id?' sp-split-card-wrap--sel':''}`}
//                   onClick={()=>setSelectedHousing(h)}
//                 >
//                   <HousingCard housing={toCardFormat(h)} showActions />
//                 </div>
//               ))}
//             </div>
//           )}

//           {/* ── Zone carte ── */}
//           <div className="sp-map-col">

//             {/* Barre stats */}
//             <div className="sp-map-stats">
//               <div>
//                 <div className="sp-map-stat-n">{mapHousings.length}</div>
//                 <div className="sp-map-stat-l">{t.on_map}</div>
//               </div>
//               <div className="sp-map-stat-sep"/>
//               <div>
//                 <div className="sp-map-stat-v">{avg.toLocaleString('fr-FR')}</div>
//                 <div className="sp-map-stat-l">{t.avg_price}</div>
//               </div>
//               <div className="sp-map-stat-sep"/>
//               <div>
//                 <div className="sp-map-stat-v" style={{color:'#F59E0B'}}>{min.toLocaleString('fr-FR')}</div>
//                 <div className="sp-map-stat-l">{t.min_price}</div>
//               </div>
//             </div>

//             {/* Bouton ma position */}
//             <button
//               className="sp-map-locate-btn"
//               title="Ma position"
//               onClick={()=>{
//                 navigator.geolocation.getCurrentPosition(
//                   pos=>{
//                     const loc={lat:pos.coords.latitude,lng:pos.coords.longitude};
//                     setUserLocation(loc); addToast('📍 Position détectée','ok');
//                   },
//                   ()=>addToast('Position non accessible','err')
//                 );
//               }}
//             >
//               <i className="fas fa-location-crosshairs"/>
//             </button>

//             {/* Leaflet Map */}
//             <MapContainer
//               center={[3.848, 11.502]}
//               zoom={13}
//               style={{ width:'100%', height:'100%' }}
//               zoomControl={false}
//               attributionControl
//             >
//               <TileLayer
//                 url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
//                 attribution='© <a href="https://www.openstreetmap.org/copyright">OSM</a> © <a href="https://carto.com/">CARTO</a>'
//                 subdomains="abcd"
//                 maxZoom={20}
//               />
//               <MapController
//                 housings={mapHousings}
//                 selectedId={selectedHousing?.id}
//                 onSelect={handleSelectOnMap}
//                 userLoc={userLocation}
//                 route={route}
//               />
//             </MapContainer>

//             {/* ── Overlay aperçu (HousingCard standard) ── */}
//             {selectedHousing && (
//               <MapCardOverlay
//                 h={selectedHousing}
//                 onClose={()=>setSelectedHousing(null)}
//                 onItin={startItin}
//               />
//             )}

//             {/* ── Panel itinéraire ── */}
//             {itinOpen && (
//               <ItineraryPanel
//                 t={t} lang={language}
//                 status={itinStatus} dist={itinDist} time={itinTime} dest={itinDest}
//                 progress={itinProg} transport={transport}
//                 onTransport={setTransport}
//                 onClose={closeItin}
//               />
//             )}

//             {/* ── Compare strip ── */}
//             {compareList.length>0 && (
//               <div className="sp-cmp-strip">
//                 <i className="fas fa-scale-balanced" style={{color:'#58A6FF',flexShrink:0}}/>
//                 <div className="sp-cmp-strip-items">
//                   {compareList.map(h=>(
//                     <div key={h.id} className="sp-cmp-strip-item">
//                       <span>{h.title}</span>
//                       <button onClick={()=>toggleCompare(h)}><i className="fas fa-xmark"/></button>
//                     </div>
//                   ))}
//                 </div>
//                 <button className="sp-cmp-strip-btn" onClick={()=>setShowCompare(true)}>
//                   <i className="fas fa-chart-bar"/> {t.cmp_launch}
//                 </button>
//               </div>
//             )}
//           </div>
//         </div>
//       )}

//       {/* Compare modal */}
//       {showCompare && (
//         <CompareModal
//           list={compareList} t={t} lang={language}
//           onClose={()=>setShowCompare(false)}
//           onRemove={id=>setCompareList(p=>p.filter(x=>x.id!==id))}
//         />
//       )}

//       {/* Toasts */}
//       <div className="sp-toast-wrap">
//         {toasts.map(({id,msg,type})=>(
//           <div key={id} className={`sp-toast sp-toast--${type}`}>
//             <i className={`fas ${type==='ok'?'fa-circle-check':type==='err'?'fa-circle-exclamation':'fa-circle-info'}`}/>
//             <span>{msg}</span>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default SearchPage;



// src/pages/SearchPage.jsx — REDESIGN maquette sidebar + grille
import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Loader, MapPin, Sparkles, Map, List, Columns, TrendingUp, SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.markercluster';

import { useTheme }      from '../contexts/ThemeContext';
import searchService     from '../services/searchService';
import api               from '../services/api';
import { housingService } from '../services/housingService';

import SearchBar    from '../components/Search/SearchBar';
import NearMeButton from '../components/Search/NearMeButton';
import VoiceSearch  from '../components/Search/VoiceSearch';
import HousingCard  from '../components/housing/HousingCard';

import './SearchPage.css';
import './SearchPageMap.css';

// ─── Helper URL images ──────────────────────────────────────
const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace(/\/api\/?$/, '');
function imgUrl(path) {
  if (!path) return null;
  if (path.startsWith('http') || path.startsWith('blob:') || path.startsWith('data:')) return path;
  return `${API_BASE}${path.startsWith('/') ? '' : '/'}${path}`;
}

function toCardFormat(h) {
  // L'API renvoie déjà `main_image` en URL absolue sur le endpoint liste.
  // On ne retombe sur `images[]` que si `main_image` est absent.
  const mainImg = h.images?.find(i => i.is_main) || h.images?.[0];
  const resolvedImage = h.main_image || imgUrl(mainImg?.image) || null;
  return {
    ...h,
    main_image:    resolvedImage,
    display_name:  h.display_name || h.title,
    district_name: h.district_name || (typeof h.district === 'object' ? h.district?.name : null) || '',
    city_name:     h.city_name     || (typeof h.city     === 'object' ? h.city?.name     : null) || '',
    is_liked: h.is_liked || false,
    is_saved: h.is_saved || false,
    likes_count: h.likes_count || 0,
    views_count: h.views_count || 0,
  };
}

const T = {
  fr: {
    title:'Rechercher un logement', subtitle:'Trouvez le logement idéal au Cameroun',
    results:'logements trouvés', loading:'Recherche en cours…', retry:'Réessayer',
    no_result:'Aucun résultat', no_sub:"Essayez d'ajuster vos critères", reset:'Réinitialiser',
    b_nearby:'Autour de moi', b_nlp:'Recherche intelligente', b_voice:'Voix',
    suggestions:'Suggestions :', error:'Erreur. Veuillez réessayer.',
    view_list:'Liste', view_map:'Carte', view_split:'Mixte',
    on_map:'sur la carte', avg_price:'Prix moyen', min_price:'À partir de',
    filters:'Filtres', reinit:'Réinitialiser', apply:'Appliquer les filtres',
    category:'Catégorie', all_cat:'Tous les types',
    type:'Type de logement', all_types:'Tous les types',
    price:'Prix (FCFA)', price_min:'Min', price_max:'Max',
    surface:'Surface (m²)', surf_min:'min', surf_max:'500+',
    rooms:'Chambres', bathrooms:'Douches',
    region:'Région', all_regions:'Toutes',
    city:'Ville', all_cities:'Toutes',
    district:'Quartier', all_dist:'Tous', no_dist:'Aucun quartier disponible',
    status:'Statut', all_status:'Tous',
    available:'Disponible', reserved:'Réservé', occupied:'Occupé',
    sort_by:'Trier par', sort_recent:'Plus récents', sort_price_asc:'Prix ↑', sort_price_dsc:'Prix ↓',
    details:'Détails', sorted_by:'Trié par algorithme génétique',
    itin_title:'Itinéraire', itin_start:'Détection position…', itin_calc:"Calcul itinéraire…",
    itin_ok:'Itinéraire vers', itin_approx:"Distance à vol d'oiseau", itin_denied:'Position approx. utilisée',
    transport:['Voiture','Pied','Vélo'], distance:'Distance', duration:'Durée', destination:'Destination',
  },
  en: {
    title:'Find housing', subtitle:'Find your ideal home in Cameroon',
    results:'listings found', loading:'Searching…', retry:'Retry',
    no_result:'No results', no_sub:'Try adjusting your criteria', reset:'Reset',
    b_nearby:'Near me', b_nlp:'Smart search', b_voice:'Voice',
    suggestions:'Suggestions:', error:'Error. Please try again.',
    view_list:'List', view_map:'Map', view_split:'Split',
    on_map:'on map', avg_price:'Avg price', min_price:'From',
    filters:'Filters', reinit:'Reset', apply:'Apply filters',
    category:'Category', all_cat:'All types',
    type:'Housing type', all_types:'All types',
    price:'Price (FCFA)', price_min:'Min', price_max:'Max',
    surface:'Surface (m²)', surf_min:'min', surf_max:'500+',
    rooms:'Bedrooms', bathrooms:'Bathrooms',
    region:'Region', all_regions:'All',
    city:'City', all_cities:'All',
    district:'Neighborhood', all_dist:'All', no_dist:'No neighborhoods available',
    status:'Status', all_status:'All',
    available:'Available', reserved:'Reserved', occupied:'Occupied',
    sort_by:'Sort by', sort_recent:'Most recent', sort_price_asc:'Price ↑', sort_price_dsc:'Price ↓',
    details:'Details', sorted_by:'Sorted by genetic algorithm',
    itin_title:'Itinerary', itin_start:'Detecting location…', itin_calc:'Calculating route…',
    itin_ok:'Route to', itin_approx:'Straight-line distance', itin_denied:'Approx. location used',
    transport:['Car','Walking','Cycling'], distance:'Distance', duration:'Duration', destination:'Destination',
  },
};

function haversine(la1,lo1,la2,lo2){const R=6371,d2r=Math.PI/180;const dLa=(la2-la1)*d2r,dLo=(lo2-lo1)*d2r;const a=Math.sin(dLa/2)**2+Math.cos(la1*d2r)*Math.cos(la2*d2r)*Math.sin(dLo/2)**2;return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));}
function fmtPrice(p){return p>=1_000_000?(p/1_000_000).toFixed(1)+'M':Math.round(p/1000)+'k';}

// ════════════════════════════════════════════════════════════
// Sidebar Filtres intégrée (pas de popup)
// ════════════════════════════════════════════════════════════
function SidebarFilters({ t, onApply, onReset, filters, setFilters }) {
  const [categories,   setCategories]   = useState([]);
  const [housingTypes, setHousingTypes] = useState([]);
  const [regions,      setRegions]      = useState([]);
  const [cities,       setCities]       = useState([]);
  const [districts,    setDistricts]    = useState([]);
  const [loading,      setLoading]      = useState(true);

  // Chargement initial — catégories, types, régions, villes
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [cats, types, regs, cts] = await Promise.all([
          housingService.getCategories(),
          housingService.getHousingTypes(),
          housingService.getRegions(),
          housingService.getCities(),
        ]);
        setCategories(Array.isArray(cats)  ? cats  : []);
        setHousingTypes(Array.isArray(types) ? types : []);
        setRegions(Array.isArray(regs)     ? regs  : []);
        setCities(Array.isArray(cts)       ? cts   : []);
      } catch(e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  // Villes selon région sélectionnée
  useEffect(() => {
    if (!filters.region) { housingService.getCities().then(d => setCities(Array.isArray(d)?d:[])).catch(()=>{}); return; }
    housingService.getCities(filters.region).then(d => {
      setCities(Array.isArray(d) ? d : []);
      setFilters(p => ({ ...p, city: '', district: '' }));
      setDistricts([]);
    }).catch(()=>{});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.region]);

  // Quartiers selon ville sélectionnée
  useEffect(() => {
    if (!filters.city) { setDistricts([]); return; }
    housingService.getDistricts(filters.city).then(d => setDistricts(Array.isArray(d) ? d : [])).catch(()=>{});
  }, [filters.city]);

  const set = (k, v) => setFilters(p => ({ ...p, [k]: v }));

  const counterBtn = (key) => (
    <div className="sf-counter">
      <button type="button" onClick={() => set(key, Math.max(0, (Number(filters[key])||0) - 1))}>−</button>
      <span>{filters[key] || 0}+</span>
      <button type="button" onClick={() => set(key, (Number(filters[key])||0) + 1)}>+</button>
    </div>
  );

  // Compte de filtres actifs (hors status=disponible par défaut)
  const activeCount = Object.entries(filters).filter(
    ([k, v]) => v !== '' && v != null && v !== 0 && !(k === 'status' && v === 'disponible')
  ).length;

  return (
    <aside className="sp-sidebar">
      <div className="sp-sidebar-head">
        <span className="sp-sidebar-title">
          <SlidersHorizontal size={15}/> {t.filters}
          {activeCount > 0 && <span className="sf-active-count">{activeCount}</span>}
        </span>
        <button className="sp-sidebar-reinit" onClick={onReset}>{t.reinit}</button>
      </div>

      {loading ? (
        <div className="sf-loading"><Loader size={18} className="sp-spinner"/></div>
      ) : (
        <div className="sf-body">

          {/* ── Catégorie ── */}
          <div className="sf-group">
            <label className="sf-label">{t.category}</label>
            <select className="sf-select" value={filters.category||''} onChange={e=>set('category', e.target.value)}>
              <option value="">{t.all_cat}</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          {/* ── Type de logement ── */}
          {housingTypes.length > 0 && (
            <div className="sf-group">
              <label className="sf-label">{t.type}</label>
              <select className="sf-select" value={filters.housing_type||''} onChange={e=>set('housing_type', e.target.value)}>
                <option value="">{t.all_types}</option>
                {housingTypes.map(tp => <option key={tp.id} value={tp.id}>{tp.name}</option>)}
              </select>
            </div>
          )}

          {/* ── Prix (deux inputs numériques, précis) ── */}
          <div className="sf-group">
            <div className="sf-label-row">
              <label className="sf-label">{t.price}</label>
              <span className="sf-range-val">
                {filters.min_price ? Number(filters.min_price).toLocaleString('fr-FR') : '0'} – {filters.max_price ? Number(filters.max_price).toLocaleString('fr-FR') : '5M+'}
              </span>
            </div>
            <div className="sf-price-row">
              <input type="number" className="sf-input sf-input--half" placeholder="0" min="0" step="5000"
                value={filters.min_price||''} onChange={e=>set('min_price', e.target.value)}/>
              <span className="sf-price-sep">–</span>
              <input type="number" className="sf-input sf-input--half" placeholder="Max" min="0" step="5000"
                value={filters.max_price||''} onChange={e=>set('max_price', e.target.value)}/>
            </div>
          </div>

          {/* ── Surface ── */}
          <div className="sf-group">
            <div className="sf-label-row">
              <label className="sf-label">{t.surface}</label>
              <span className="sf-range-val">{filters.min_area||0} m² {t.surf_min}</span>
            </div>
            <input type="number" className="sf-input" placeholder="0" min="0" step="5"
              value={filters.min_area||''} onChange={e=>set('min_area', e.target.value)}/>
          </div>

          {/* ── Chambres ── */}
          <div className="sf-group">
            <label className="sf-label">{t.rooms}</label>
            {counterBtn('rooms__gte')}
          </div>

          {/* ── Douches ── */}
          <div className="sf-group">
            <label className="sf-label">{t.bathrooms}</label>
            {counterBtn('bathrooms__gte')}
          </div>

          {/* ── Région ── (SELECT avec ID) */}
          <div className="sf-group">
            <label className="sf-label">{t.region}</label>
            <select className="sf-select" value={filters.region||''} onChange={e=>set('region', e.target.value)}>
              <option value="">{t.all_regions}</option>
              {regions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>

          {/* ── Ville ── (SELECT avec ID, filtré par région) */}
          <div className="sf-group">
            <label className="sf-label">{t.city}</label>
            <select className="sf-select" value={filters.city||''} onChange={e=>set('city', e.target.value)}>
              <option value="">{t.all_cities}</option>
              {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          {/* ── Quartier ── (SELECT avec ID, filtré par ville) */}
          {filters.city && (
            <div className="sf-group">
              <label className="sf-label">{t.district}</label>
              <select className="sf-select" value={filters.district||''} onChange={e=>set('district', e.target.value)}>
                <option value="">{t.all_dist}</option>
                {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
              {districts.length === 0 && <small className="sf-hint">{t.no_dist}</small>}
            </div>
          )}

          {/* ── Statut ── */}
          <div className="sf-group">
            <label className="sf-label">{t.status}</label>
            <div className="sf-status-btns">
              {[['', t.all_status],['disponible', t.available],['reserve', t.reserved],['occupe', t.occupied]].map(([v, l]) => (
                <button key={v} type="button"
                  className={`sf-status-btn${(filters.status||'') === v ? ' sf-status-btn--active' : ''}`}
                  onClick={() => set('status', v)}>{l}</button>
              ))}
            </div>
          </div>

        </div>
      )}

      <button className="sf-apply-btn" onClick={onApply}>{t.apply}</button>
    </aside>
  );
}

// ════════════════════════════════════════════════════════════
// MapController
// ════════════════════════════════════════════════════════════
function MapController({ housings, selectedId, hoveredId, onSelect, onHover, userLoc, route }) {
  const map = useMap();
  const clusterRef = useRef(null);
  const routeRef   = useRef(null);
  const userMkRef  = useRef(null);

  useEffect(() => {
    const cluster = L.markerClusterGroup({ maxClusterRadius:60,
      iconCreateFunction: c => L.divIcon({ html:`<div class="sp-mk-cluster">${c.getChildCount()}</div>`, className:'', iconSize:[36,36] }),
    });
    map.addLayer(cluster); clusterRef.current = cluster;
    return () => map.removeLayer(cluster);
  }, [map]);

  useEffect(() => {
    if (!clusterRef.current) return;
    clusterRef.current.clearLayers();
    housings.forEach(h => {
      if (!h.latitude || !h.longitude) return;
      const sel = h.id === selectedId, hov = h.id === hoveredId;
      const icon = L.divIcon({
        html:`<div class="sp-mk${sel?' sp-mk--sel':''}${hov?' sp-mk--hover':''}">${fmtPrice(h.price)} FCFA</div>`,
        className:'', iconSize:null, iconAnchor:[44,14],
      });
      const m = L.marker([h.latitude, h.longitude], { icon });
      m.on('click',     () => onSelect(h));
      m.on('mouseover', () => onHover(h.id));
      m.on('mouseout',  () => onHover(null));
      clusterRef.current.addLayer(m);
    });
  }, [housings, selectedId, hoveredId, onSelect, onHover]);

  useEffect(() => {
    if (routeRef.current) { map.removeLayer(routeRef.current); routeRef.current = null; }
    if (!route?.length) return;
    const poly = L.polyline(route, { color:'#C0480A', weight:5, opacity:.85, dashArray:'10,5' });
    poly.addTo(map); routeRef.current = poly;
    map.fitBounds(poly.getBounds(), { padding:[60,60] });
  }, [route, map]);

  useEffect(() => {
    if (userMkRef.current) { map.removeLayer(userMkRef.current); userMkRef.current = null; }
    if (!userLoc) return;
    userMkRef.current = L.marker([userLoc.lat, userLoc.lng], {
      icon: L.divIcon({ html:'<div class="sp-user-dot"></div>', className:'', iconSize:[14,14] }),
    }).addTo(map).bindTooltip('📍 Vous');
  }, [userLoc, map]);

  return null;
}

// ════════════════════════════════════════════════════════════
// MAIN PAGE
// ════════════════════════════════════════════════════════════
const EMPTY_FILTERS = {
  category:     '',   // NumberFilter → category__id
  housing_type: '',   // FK exact     → housing_type
  region:       '',   // FK exact     → region
  city:         '',   // FK exact     → city
  district:     '',   // FK exact     → district
  min_price:    '',   // NumberFilter → price__gte
  max_price:    '',   // NumberFilter → price__lte
  'rooms__gte': '',   // Meta gte     → rooms__gte
  'bathrooms__gte': '',
  min_area:     '',   // NumberFilter → area__gte
  status:       'disponible',
};

const SearchPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { language } = useTheme();
  const t = T[language] || T.fr;

  const [housings,     setHousings]     = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState(null);
  const [count,        setCount]        = useState(null);
  const [suggestions,  setSuggestions]  = useState([]);
  const [nlpSummary,   setNlpSummary]   = useState('');
  const [mode,         setMode]         = useState('default');
  const [userLocation, setUserLocation] = useState(null);
  const [viewMode,     setViewMode]     = useState('list');
  const [sortBy,       setSortBy]       = useState('recent');
  const [filters,      setFilters]      = useState({...EMPTY_FILTERS});

  // carte
  const [selectedHousing, setSelectedHousing] = useState(null);
  const [hoveredId,        setHoveredId]       = useState(null);
  const [route,            setRoute]           = useState(null);
  const [showOverlay,      setShowOverlay]     = useState(true); // aperçu visible par défaut, masquable

  const mapHousings = housings.filter(h => h.latitude && h.longitude);

  // ── Recherche ─────────────────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query  = params.get('query');
    if (query) { setMode('nlp'); doNlp(query, null); }
    else        { doDefault(); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  const startSearch = () => { setLoading(true); setError(null); setSuggestions([]); };
  const toList  = d => Array.isArray(d)?d:(d?.results||[]);
  const onErr   = e => { console.error(e); setError(t.error); setHousings([]); setCount(0); };

  const doDefault = async () => {
    startSearch(); setNlpSummary('');
    try {
      const res = await api.get('/housings/', { params:{ status:'disponible', ordering:'-created_at' } });
      setHousings(toList(res.data)); setCount(res.data?.count ?? toList(res.data).length);
    } catch(e) { onErr(e); } finally { setLoading(false); }
  };

  const doNlp = async (query, coords) => {
    if (!query?.trim()) { doDefault(); return; }
    startSearch();
    try {
      const payload = { query:query.trim(), language };
      if (coords) { payload.user_lat=coords.lat; payload.user_lng=coords.lng; }
      const data = await searchService.nlpSearch(payload);
      setHousings(data.results||[]); setCount(data.count);
      setNlpSummary(data.criteria_summary||''); setSuggestions(data.suggestions||[]);
    } catch(e) { onErr(e); } finally { setLoading(false); }
  };

  const doFilters = async (f) => {
    startSearch(); setNlpSummary('');
    try {
      // Nettoyage identique à l'ancienne FilterPanel.handleApply :
      // — on exclut les vides, null, undefined
      // — on exclut rooms__gte/bathrooms__gte à 0 (pas de contrainte)
      // — on exclut min_area à 0 (pas de contrainte)
      const params = Object.fromEntries(
        Object.entries(f).filter(([k, v]) => {
          if (v === '' || v === null || v === undefined) return false;
          if ((k === 'rooms__gte' || k === 'bathrooms__gte') && Number(v) === 0) return false;
          if (k === 'min_area' && Number(v) === 0) return false;
          return true;
        })
      );
      if (!params.status) params.status = 'disponible';
      console.log('✅ Filtres envoyés au backend:', params);
      const res = await api.get('/housings/', { params });
      setHousings(toList(res.data)); setCount(res.data?.count ?? toList(res.data).length);
    } catch(e) { onErr(e); } finally { setLoading(false); }
  };

  // handleApply : nettoie d'abord les filtres comme l'ancienne FilterPanel,
  // puis appelle doFilters avec les valeurs propres
  const handleApply = () => {
    setMode('filters');
    doFilters(filters);
  };

  const handleSearch = ({ query }) => {
    setMode('nlp'); navigate(`/search?query=${encodeURIComponent(query)}`, { replace:true });
    doNlp(query, userLocation);
  };
  const handleNearby  = (coords) => { setUserLocation(coords); setMode('nearby'); doNlp('logement disponible', coords); if(viewMode==='list') setViewMode('map'); };
  const handleVoice   = (t) => { setMode('voice'); doNlp(t, userLocation); };
  const handleReset   = () => { setFilters({...EMPTY_FILTERS}); setNlpSummary(''); setMode('default'); navigate('/search',{replace:true}); doDefault(); };

  // Tri local
  const sortedHousings = [...housings].sort((a,b) => {
    if (sortBy==='price_asc')  return a.price-b.price;
    if (sortBy==='price_desc') return b.price-a.price;
    return new Date(b.created_at)-new Date(a.created_at);
  });

  // Carte hover
  const handleSelectOnMap = useCallback((h) => { setSelectedHousing(h); setShowOverlay(true); }, []);
  const handleHoverOnMap  = useCallback((id) => setHoveredId(id), []);

  const listColRef = useRef(null);
  useEffect(() => {
    if (!hoveredId || !listColRef.current) return;
    const el = listColRef.current.querySelector(`[data-housing-id="${hoveredId}"]`);
    if (el) el.scrollIntoView({ behavior:'smooth', block:'nearest' });
  }, [hoveredId]);

  return (
    <div className="search-page sp2">

      {/* ══ HEADER compact ══════════════════════════════════ */}
      <div className="sp2-header">
        <div className="sp2-header-inner">
          <div className="sp2-search-row">
            <SearchBar onSearch={handleSearch} loading={loading} criteriaSummary={nlpSummary} onClearNLP={handleReset} language={language}/>
            <VoiceSearch onTranscript={handleVoice} onError={e=>setError(e)} language={language}/>
            <NearMeButton onLocationFound={handleNearby} onError={e=>setError(e)} language={language}/>
          </div>

          <div className="sp2-toolbar">
            {/* Compteur + badges */}
            <div className="sp2-count-area">
              {count!==null && !loading && (
                <>
                  <h2 className="sp2-count">{count.toLocaleString('fr-FR')} {t.results}</h2>
                  {nlpSummary && <p className="sp2-nlp-summary">{nlpSummary}</p>}
                </>
              )}
              {mode==='nearby'  && <span className="sp-badge sp-badge--nearby"><MapPin size={11}/>{t.b_nearby}</span>}
              {(mode==='nlp'||mode==='voice') && <span className="sp-badge sp-badge--nlp"><Sparkles size={11}/>{mode==='voice'?t.b_voice:t.b_nlp}</span>}
            </div>

            {/* Tri + vue toggle */}
            <div className="sp2-right-ctrl">
              {/* Bouton algorithme génétique (déco) */}
              {(mode==='nlp'||mode==='default') && (
                <button className="sp2-algo-badge">
                  <SlidersHorizontal size={13}/> {t.sorted_by}
                </button>
              )}

              {/* Tri */}
              <div className="sp2-sort">
                <select className="sp2-sort-sel" value={sortBy} onChange={e=>setSortBy(e.target.value)}>
                  <option value="recent">{t.sort_recent}</option>
                  <option value="price_asc">{t.sort_price_asc}</option>
                  <option value="price_desc">{t.sort_price_dsc}</option>
                </select>
              </div>

              {/* Vue toggle */}
              <div className="sp2-view-toggle">
                <button className={`sp2-vbtn${viewMode==='list'?' sp2-vbtn--act':''}`} onClick={()=>setViewMode('list')} title={t.view_list}>
                  <i className="fas fa-grid-2"/>
                </button>
                <button className={`sp2-vbtn${viewMode==='map'?' sp2-vbtn--act':''}`} onClick={()=>setViewMode('map')} title={t.view_map}>
                  <Map size={14}/>
                </button>
                <button className={`sp2-vbtn${viewMode==='split'?' sp2-vbtn--act':''}`} onClick={()=>setViewMode('split')} title={t.view_split}>
                  <Columns size={14}/>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══ CORPS ═══════════════════════════════════════════ */}
      <div className="sp2-body">

        {/* ── Sidebar Filtres ── */}
        <SidebarFilters t={t} filters={filters} setFilters={setFilters} onApply={handleApply} onReset={handleReset}/>

        {/* ── Zone principale ── */}
        <main className="sp2-main">

          {/* VUE LISTE */}
          {viewMode==='list' && (
            <>
              {loading && (
                <div className="sp2-loading">
                  <Loader className="sp-spinner" size={32}/>
                  <p>{t.loading}</p>
                </div>
              )}

              {!loading && error && (
                <div className="sp2-error">
                  <p>{error}</p>
                  <button className="sp2-retry-btn" onClick={handleReset}>{t.retry}</button>
                </div>
              )}

              {!loading && !error && sortedHousings.length === 0 && count !== null && (
                <div className="sp2-empty">
                  <TrendingUp size={44}/>
                  <h3>{t.no_result}</h3>
                  <p>{t.no_sub}</p>
                  {suggestions.length>0 && (
                    <div className="sp-chips">
                      {suggestions.map((s,i)=><button key={i} className="sp-chip" onClick={()=>{setMode('nlp');doNlp(s,null);}}>{s}</button>)}
                    </div>
                  )}
                  <button className="sp2-retry-btn" onClick={handleReset}>{t.reset}</button>
                </div>
              )}

              {!loading && !error && sortedHousings.length > 0 && (
                <div className="sp2-grid">
                  {sortedHousings.map(h => (
                    <div key={h.id} className="sp2-grid-item"
                      onClick={() => navigate(`/housing/${h.id}`)}>
                      <HousingCard housing={toCardFormat(h)} showActions={false}/>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination simple */}
              {!loading && sortedHousings.length > 0 && (
                <div className="sp2-pagination">
                  <button className="sp2-pg-btn sp2-pg-btn--prev">‹</button>
                  <button className="sp2-pg-btn sp2-pg-btn--active">1</button>
                  <button className="sp2-pg-btn">2</button>
                  <button className="sp2-pg-btn">3</button>
                  <span className="sp2-pg-dots">…</span>
                  <button className="sp2-pg-btn">12</button>
                  <button className="sp2-pg-btn sp2-pg-btn--next">›</button>
                </div>
              )}
            </>
          )}

          {/* VUE CARTE / MIXTE */}
          {viewMode !== 'list' && (
            <div className={`sp-map-layout${viewMode==='split'?' sp-map-layout--split':''}`}>
              {viewMode==='split' && (
                <div className="sp-map-list-col" ref={listColRef}>
                  {loading && <div className="sp-map-loading"><Loader className="sp-spinner" size={28}/></div>}
                  {!loading && mapHousings.map(h=>(
                    <div key={h.id} data-housing-id={h.id}
                      className={`sp-split-card-wrap${selectedHousing?.id===h.id?' sp-split-card-wrap--sel':''}${hoveredId===h.id?' sp-split-card-wrap--hovered':''}`}
                      onMouseEnter={()=>setHoveredId(h.id)} onMouseLeave={()=>setHoveredId(null)}
                      onClick={()=>navigate(`/housing/${h.id}`)}>
                      <HousingCard housing={toCardFormat(h)} showActions/>
                    </div>
                  ))}
                </div>
              )}
              <div className="sp-map-col">
                <div className="sp-map-stats">
                  <div><div className="sp-map-stat-n">{mapHousings.length}</div><div className="sp-map-stat-l">{t.on_map}</div></div>
                </div>
                <MapContainer center={[3.848,11.502]} zoom={13} style={{width:'100%',height:'100%'}} zoomControl={false} attributionControl>
                  <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                    attribution='© OSM © CARTO' subdomains="abcd" maxZoom={20}/>
                  <MapController housings={mapHousings} selectedId={selectedHousing?.id} hoveredId={hoveredId}
                    onSelect={handleSelectOnMap} onHover={handleHoverOnMap} userLoc={userLocation} route={route}/>
                </MapContainer>
                {selectedHousing && showOverlay && (
                  <div className="sp-map-overlay">
                    <div className="sp-map-overlay-head">
                      <span className="sp-map-overlay-title">Aperçu</span>
                      <div className="sp-map-overlay-head-actions">
                        <button className="sp-map-overlay-hide" onClick={()=>setShowOverlay(false)} title="Masquer l'aperçu, garder la carte pleine largeur">
                          <i className="fas fa-arrow-right-to-bracket"/> Masquer
                        </button>
                        <button className="sp-map-overlay-close" onClick={()=>setSelectedHousing(null)} title="Fermer l'aperçu"><i className="fas fa-xmark"/></button>
                      </div>
                    </div>
                    <div className="sp-map-overlay-card"><HousingCard housing={toCardFormat(selectedHousing)} showActions/></div>
                    <div className="sp-map-overlay-actions">
                      <button className="sp-ov-btn sp-ov-btn--visit" onClick={()=>navigate(`/housing/${selectedHousing.id}`)}>
                        <i className="fas fa-eye"/> Voir les détails
                      </button>
                    </div>
                  </div>
                )}

                {/* Bouton flottant pour ré-afficher l'aperçu masqué */}
                {selectedHousing && !showOverlay && (
                  <button className="sp-map-overlay-reopen" onClick={()=>setShowOverlay(true)} title="Afficher l'aperçu du logement">
                    <i className="fas fa-arrow-left-to-bracket"/> Aperçu
                  </button>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default SearchPage;
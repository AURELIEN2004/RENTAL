

// // // src/pages/SearchPage.jsx
// // // ============================================================

// // // ============================================================

// // import { useState, useEffect, useCallback, useRef } from 'react';
// // import { useLocation, useNavigate }                 from 'react-router-dom';
// // import { Loader, MapPin, TrendingUp, Sparkles }     from 'lucide-react';

// // import { useTheme }       from '../contexts/ThemeContext';
// // import { housingService } from '../services/housingService';
// // import searchService      from '../services/searchService';

// // import SearchBar    from '../components/Search/SearchBar';
// // import FilterPanel  from '../components/Search/FilterPanel';
// // import NearMeButton from '../components/Search/NearMeButton';
// // import VoiceSearch  from '../components/Search/VoiceSearch';
// // import HousingList  from '../components/housing/HousingList';

// // import './SearchPage.css';

// // // ── Dictionnaire bilingue ────────────────────────────────────
// // const T = {
// //   fr: {
// //     title:        'Rechercher un logement',
// //     subtitle:     'Trouvez le logement idéal au Cameroun',
// //     sort_by:      'Trier par :',
// //     sort_recent:  'Plus récents',
// //     sort_asc:     'Prix croissant',
// //     sort_desc:    'Prix décroissant',
// //     sort_area:    'Surface (grande → petite)',
// //     sort_popular: 'Popularité',
// //     sort_score:   'Pertinence',
// //     results:      'résultat(s)',
// //     loading:      'Recherche en cours…',
// //     retry:        'Réessayer',
// //     no_result:    'Aucun résultat',
// //     no_result_sub:'Essayez d\'ajuster vos critères de recherche',
// //     reset:        'Réinitialiser',
// //     badge_nearby: 'Autour de votre position',
// //     badge_nlp:    'Recherche intelligente',
// //     badge_voice:  'Recherche vocale',
// //     suggestions:  'Suggestions :',
// //     error:        'Erreur lors de la recherche. Veuillez réessayer.',
// //   },
// //   en: {
// //     title:        'Find housing',
// //     subtitle:     'Find your ideal home in Cameroon',
// //     sort_by:      'Sort by:',
// //     sort_recent:  'Most recent',
// //     sort_asc:     'Price (low to high)',
// //     sort_desc:    'Price (high to low)',
// //     sort_area:    'Area (largest first)',
// //     sort_popular: 'Popularity',
// //     sort_score:   'Relevance',
// //     results:      'result(s)',
// //     loading:      'Searching…',
// //     retry:        'Retry',
// //     no_result:    'No results found',
// //     no_result_sub:'Try adjusting your search criteria',
// //     reset:        'Reset search',
// //     badge_nearby: 'Near your location',
// //     badge_nlp:    'Smart search',
// //     badge_voice:  'Voice search',
// //     suggestions:  'Suggestions:',
// //     error:        'Search error. Please try again.',
// //   },
// // };

// // // ── Tri local côté client ────────────────────────────────────
// // const SORTERS = {
// //   recent:     (a, b) => new Date(b.created_at) - new Date(a.created_at),
// //   price_asc:  (a, b) => a.price - b.price,
// //   price_desc: (a, b) => b.price - a.price,
// //   area_desc:  (a, b) => b.area - a.area,
// //   popular:    (a, b) => ((b.likes_count || 0) + (b.views_count || 0))
// //                        - ((a.likes_count || 0) + (a.views_count || 0)),
// // };

// // // ── Paramètres de tri pour housingService ────────────────────
// // const ORDERING = {
// //   recent:     '-created_at',
// //   price_asc:  'price',
// //   price_desc: '-price',
// //   area_desc:  '-area',
// //   popular:    'popularity',
// // };

// // // ────────────────────────────────────────────────────────────
// // const SearchPage = () => {
// //   const location       = useLocation();
// //   const navigate       = useNavigate();
// //   const { language }   = useTheme();
// //   const t              = T[language] || T.fr;

// //   // ── États ────────────────────────────────────────────────
// //   const [housings,     setHousings]     = useState([]);
// //   const [loading,      setLoading]      = useState(false);
// //   const [error,        setError]        = useState(null);
// //   const [count,        setCount]        = useState(null);
// //   const [suggestions,  setSuggestions]  = useState([]);
// //   const [nlpSummary,   setNlpSummary]   = useState('');
// //   const [mode,         setMode]         = useState('default'); // 'default'|'nlp'|'voice'|'nearby'|'filters'
// //   const [userLocation, setUserLocation] = useState(null);
// //   const [activeFilters,setActiveFilters]= useState({});
// //   const [sortBy,       setSortBy]       = useState('recent');

// //   // Ref pour garder la dernière version des callbacks sans recréer les effets
// //   const stateRef = useRef({});
// //   stateRef.current = { language, sortBy, activeFilters, userLocation };

// //   // ── Init depuis URL + rechargement si langue change ──────
// //   useEffect(() => {
// //     const params  = new URLSearchParams(location.search);
// //     const initial = {};
// //     params.forEach((v, k) => { initial[k] = v; });

// //     if (initial.query) {
// //       doNlpSearch(initial.query, null);
// //     } else if (Object.keys(initial).length > 0) {
// //       const { query: _q, ...filtersOnly } = initial;
// //       setActiveFilters(filtersOnly);
// //       doFiltersSearch(filtersOnly);
// //     } else {
// //       doDefault();
// //     }
// //   // eslint-disable-next-line react-hooks/exhaustive-deps
// //   }, [location.search, language]);

// //   // ────────────────────────────────────────────────────────
// //   // Moteurs de recherche
// //   // ────────────────────────────────────────────────────────

// //   // ── NLP (texte + vocal) ──────────────────────────────────
// //   const doNlpSearch = useCallback(async (query, coords) => {
// //     if (!query?.trim()) { doDefault(); return; }
// //     setLoading(true);
// //     setError(null);
// //     setSuggestions([]);
// //     try {
// //       const payload = { query: query.trim(), language: stateRef.current.language };
// //       if (coords?.lat) { payload.user_lat = coords.lat; payload.user_lng = coords.lng; }

// //       const data = await searchService.nlpSearch(payload);
// //       setHousings(data.results || []);
// //       setCount(data.count ?? (data.results?.length ?? 0));
// //       setNlpSummary(data.criteria_summary || '');
// //       setSuggestions(data.suggestions || []);
// //     } catch (err) {
// //       console.error('NLP search error:', err);
// //       setError(t.error);
// //       setHousings([]);
// //     } finally {
// //       setLoading(false);
// //     }
// //   // eslint-disable-next-line react-hooks/exhaustive-deps
// //   }, []);

// //   // ── Près de moi (NLP + GPS) ──────────────────────────────
// //   const doNearbySearch = useCallback(async (coords) => {
// //     setLoading(true);
// //     setError(null);
// //     setSuggestions([]);
// //     setNlpSummary('');
// //     const { language: lang } = stateRef.current;
// //     try {
// //       const data = await searchService.nlpSearch({
// //         query:    lang === 'fr' ? 'logement disponible' : 'available housing',
// //         language: lang,
// //         user_lat: coords.lat,
// //         user_lng: coords.lng,
// //       });
// //       setHousings(data.results || []);
// //       setCount(data.count ?? (data.results?.length ?? 0));
// //     } catch (err) {
// //       console.error('Nearby search error:', err);
// //       setError(t.error);
// //       setHousings([]);
// //     } finally {
// //       setLoading(false);
// //     }
// //   // eslint-disable-next-line react-hooks/exhaustive-deps
// //   }, []);

// //   // ── Filtres structurés → housingService ─────────────────
// //   const doFiltersSearch = useCallback(async (filters) => {
// //     setLoading(true);
// //     setError(null);
// //     setSuggestions([]);
// //     setNlpSummary('');
// //     const { sortBy: sort } = stateRef.current;
// //     try {
// //       const params = {
// //         status: 'disponible',
// //         ...filters,
// //         ordering: ORDERING[sort] || '-created_at',
// //       };
// //       // Supprimer valeurs vides
// //       Object.keys(params).forEach(k => {
// //         if (params[k] === '' || params[k] == null) delete params[k];
// //       });

// //       const data = await housingService.getHousings(params);
// //       const list = Array.isArray(data) ? data : (data.results || []);
// //       setHousings(list);
// //       setCount(list.length);
// //     } catch (err) {
// //       console.error('Filters search error:', err);
// //       setError(t.error);
// //       setHousings([]);
// //     } finally {
// //       setLoading(false);
// //     }
// //   // eslint-disable-next-line react-hooks/exhaustive-deps
// //   }, []);

// //   // ── Recherche par défaut ─────────────────────────────────
// //   const doDefault = useCallback(async () => {
// //     setLoading(true);
// //     setError(null);
// //     setSuggestions([]);
// //     setNlpSummary('');
// //     try {
// //       const data = await housingService.getHousings({
// //         status: 'disponible',
// //         ordering: '-created_at',
// //       });
// //       const list = Array.isArray(data) ? data : (data.results || []);
// //       setHousings(list);
// //       setCount(list.length);
// //     } catch (err) {
// //       setError(t.error);
// //       setHousings([]);
// //     } finally {
// //       setLoading(false);
// //     }
// //   // eslint-disable-next-line react-hooks/exhaustive-deps
// //   }, []);

// //   // ────────────────────────────────────────────────────────
// //   // Handlers
// //   // ────────────────────────────────────────────────────────
// //   const syncURL = (params) => {
// //     const p = new URLSearchParams();
// //     Object.entries(params).forEach(([k, v]) => {
// //       if (v !== '' && v != null) p.set(k, String(v));
// //     });
// //     const next = `/search?${p.toString()}`;
// //     if (location.pathname + location.search !== next) {
// //       navigate(next, { replace: true });
// //     }
// //   };

// //   // SearchBar → classique ou NLP (les deux vont vers NLP côté backend)
// //   const handleSearch = ({ query, isNLP }) => {
// //     setMode(isNLP ? 'nlp' : 'nlp'); // toujours NLP, backend NLP gère les 2
// //     setActiveFilters({});
// //     syncURL({ query });
// //     doNlpSearch(query, userLocation);
// //   };

// //   // VoiceSearch → NLP
// //   const handleVoiceTranscript = (transcript) => {
// //     setMode('voice');
// //     setActiveFilters({});
// //     syncURL({ query: transcript });
// //     doNlpSearch(transcript, userLocation);
// //   };

// //   // NearMeButton
// //   const handleNearby = (coords) => {
// //     setUserLocation(coords);
// //     setMode('nearby');
// //     setActiveFilters({});
// //     setNlpSummary('');
// //     syncURL({ lat: coords.lat, lng: coords.lng });
// //     doNearbySearch(coords);
// //   };

// //   // FilterPanel
// //   const handleFilters = (newFilters) => {
// //     setActiveFilters(newFilters);
// //     setMode('filters');
// //     setNlpSummary('');
// //     syncURL(newFilters);
// //     doFiltersSearch(newFilters);
// //   };

// //   // Tri
// //   const handleSort = (newSort) => {
// //     setSortBy(newSort);
// //     if (mode === 'filters') {
// //       // Relancer la recherche avec le nouveau tri
// //       doFiltersSearch(activeFilters);
// //     } else {
// //       // Tri local pour les résultats NLP
// //       const sorter = SORTERS[newSort];
// //       if (sorter) setHousings(prev => [...prev].sort(sorter));
// //     }
// //   };

// //   // Effacer NLP summary
// //   const handleClearNLP = () => {
// //     setNlpSummary('');
// //     setActiveFilters({});
// //     setMode('default');
// //     setUserLocation(null);
// //     navigate('/search', { replace: true });
// //     doDefault();
// //   };

// //   // Cliquer sur une suggestion NLP
// //   const handleSuggestion = (text) => {
// //     setMode('nlp');
// //     syncURL({ query: text });
// //     doNlpSearch(text, null);
// //   };

// //   // Réinitialiser tout
// //   const handleReset = () => {
// //     setActiveFilters({});
// //     setNlpSummary('');
// //     setUserLocation(null);
// //     setMode('default');
// //     setSuggestions([]);
// //     setSortBy('recent');
// //     navigate('/search', { replace: true });
// //     doDefault();
// //   };

// //   // ── Rendu ─────────────────────────────────────────────────
// //   const showNlpMode = mode === 'nlp' || mode === 'voice';
// //   const filterCount = Object.values(activeFilters).filter(v => v !== '' && v != null).length;

// //   return (
// //     <div className="search-page">

// //       {/* ══ En-tête ══════════════════════════════════════════ */}
// //       <div className="sp-header">
// //         <div className="container">
// //           <div className="sp-header-text">
// //             <h1 className="sp-title">{t.title}</h1>
// //             <p className="sp-subtitle">{t.subtitle}</p>
// //           </div>

// //           {/* ── Contrôles de recherche ── */}
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
// //                 onError={(msg) => setError(msg)}
// //                 language={language}
// //               />
// //               <NearMeButton
// //                 onLocationFound={handleNearby}
// //                 onError={(msg) => setError(msg)}
// //                 language={language}
// //               />
// //               <FilterPanel
// //                 onApplyFilters={handleFilters}
// //                 initialFilters={activeFilters}
// //                 language={language}
// //               />
// //             </div>
// //           </div>

// //           {/* ── Badges contexte ── */}
// //           {(mode !== 'default' || nlpSummary) && (
// //             <div className="sp-badges">
// //               {mode === 'nearby' && (
// //                 <span className="sp-badge sp-badge--nearby">
// //                   <MapPin size={12} /> {t.badge_nearby}
// //                 </span>
// //               )}
// //               {showNlpMode && (
// //                 <span className="sp-badge sp-badge--nlp">
// //                   <Sparkles size={12} />
// //                   {mode === 'voice' ? t.badge_voice : t.badge_nlp}
// //                 </span>
// //               )}
// //               {mode === 'filters' && filterCount > 0 && (
// //                 <span className="sp-badge sp-badge--filters">
// //                   {filterCount} filtre{filterCount > 1 ? 's' : ''} actif{filterCount > 1 ? 's' : ''}
// //                 </span>
// //               )}
// //             </div>
// //           )}
// //         </div>
// //       </div>

// //       {/* ══ Contenu principal ════════════════════════════════ */}
// //       <div className="container sp-content">

// //         {/* ── Barre résultats + tri ── */}
// //         {!loading && count !== null && (
// //           <div className="sp-toolbar">
// //             <span className="sp-count">
// //               <strong>{count}</strong> {t.results}
// //             </span>

            
// //           </div>
// //         )}

// //         {/* ── Chargement ── */}
// //         {loading && (
// //           <div className="sp-loading">
// //             <Loader className="sp-spinner" size={36} />
// //             <p>{t.loading}</p>
// //           </div>
// //         )}

// //         {/* ── Erreur ── */}
// //         {!loading && error && (
// //           <div className="sp-error">
// //             <p>{error}</p>
// //             <button className="sp-retry" onClick={handleReset}>
// //               {t.retry}
// //             </button>
// //           </div>
// //         )}

// //         {/* ── Résultats ── */}
// //         {!loading && !error && housings.length > 0 && (
// //           <HousingList housings={housings} />
// //         )}

// //         {/* ── État vide ── */}
// //         {!loading && !error && housings.length === 0 && count !== null && (
// //           <div className="sp-empty">
// //             <TrendingUp size={48} className="sp-empty-icon" />
// //             <h3>{t.no_result}</h3>
// //             <p>{t.no_result_sub}</p>

// //             {suggestions.length > 0 && (
// //               <div className="sp-suggestions">
// //                 <p>{t.suggestions}</p>
// //                 <div className="sp-chips">
// //                   {suggestions.map((s, i) => (
// //                     <button
// //                       key={i}
// //                       className="sp-chip"
// //                       onClick={() => handleSuggestion(s)}
// //                     >
// //                       {s}
// //                     </button>
// //                   ))}
// //                 </div>
// //               </div>
// //             )}

// //             <button className="sp-reset" onClick={handleReset}>
// //               {t.reset}
// //             </button>
// //           </div>
// //         )}
// //       </div>
// //     </div>
// //   );
// // };

// // export default SearchPage;


// // src/pages/SearchPage.jsx
// // ============================================================
// // Page de recherche — VERSION FINALE
// //
// // Moteurs actifs :
// //   • Texte (classique ou NLP) → POST /api/recherche/nlp/
// //   • Vocal                    → POST /api/recherche/nlp/
// //   • Près de moi              → POST /api/recherche/nlp/ + GPS
// //   • Filtres structurés       → housingService.getHousings()
// //
// // Supprimé : ChatbotButton, assistant, searchService.searchHousings()
// // ============================================================

// import { useState, useEffect, useCallback, useRef } from 'react';
// import { useLocation, useNavigate }                 from 'react-router-dom';
// import { Loader, MapPin, TrendingUp, Sparkles }     from 'lucide-react';

// import { useTheme }       from '../contexts/ThemeContext';
// import { housingService } from '../services/housingService';
// import searchService      from '../services/searchService';

// import SearchBar    from '../components/Search/SearchBar';
// import FilterPanel  from '../components/Search/FilterPanel';
// import NearMeButton from '../components/Search/NearMeButton';
// import VoiceSearch  from '../components/Search/VoiceSearch';
// import HousingList  from '../components/housing/HousingList';

// import './SearchPage.css';

// // ── Dictionnaire bilingue ────────────────────────────────────
// const T = {
//   fr: {
//     title:        'Rechercher un logement',
//     subtitle:     'Trouvez le logement idéal au Cameroun',
//     sort_by:      'Trier par :',
//     sort_recent:  'Plus récents',
//     sort_asc:     'Prix croissant',
//     sort_desc:    'Prix décroissant',
//     sort_area:    'Surface (grande → petite)',
//     sort_popular: 'Popularité',
//     sort_score:   'Pertinence',
//     results:      'résultat(s)',
//     loading:      'Recherche en cours…',
//     retry:        'Réessayer',
//     no_result:    'Aucun résultat',
//     no_result_sub:'Essayez d\'ajuster vos critères de recherche',
//     reset:        'Réinitialiser',
//     badge_nearby: 'Autour de votre position',
//     badge_nlp:    'Recherche intelligente',
//     badge_voice:  'Recherche vocale',
//     suggestions:  'Suggestions :',
//     error:        'Erreur lors de la recherche. Veuillez réessayer.',
//   },
//   en: {
//     title:        'Find housing',
//     subtitle:     'Find your ideal home in Cameroon',
//     sort_by:      'Sort by:',
//     sort_recent:  'Most recent',
//     sort_asc:     'Price (low to high)',
//     sort_desc:    'Price (high to low)',
//     sort_area:    'Area (largest first)',
//     sort_popular: 'Popularity',
//     sort_score:   'Relevance',
//     results:      'result(s)',
//     loading:      'Searching…',
//     retry:        'Retry',
//     no_result:    'No results found',
//     no_result_sub:'Try adjusting your search criteria',
//     reset:        'Reset search',
//     badge_nearby: 'Near your location',
//     badge_nlp:    'Smart search',
//     badge_voice:  'Voice search',
//     suggestions:  'Suggestions:',
//     error:        'Search error. Please try again.',
//   },
// };

// // ── Tri local côté client ────────────────────────────────────
// const SORTERS = {
//   recent:     (a, b) => new Date(b.created_at) - new Date(a.created_at),
//   price_asc:  (a, b) => a.price - b.price,
//   price_desc: (a, b) => b.price - a.price,
//   area_desc:  (a, b) => b.area - a.area,
//   popular:    (a, b) => ((b.likes_count || 0) + (b.views_count || 0))
//                        - ((a.likes_count || 0) + (a.views_count || 0)),
// };

// // ── Paramètres de tri pour housingService ────────────────────
// const ORDERING = {
//   recent:     '-created_at',
//   price_asc:  'price',
//   price_desc: '-price',
//   area_desc:  '-area',
//   popular:    '-views_count',   // ordering_fields = ['views_count', ...]
// };

// // ────────────────────────────────────────────────────────────
// const SearchPage = () => {
//   const location       = useLocation();
//   const navigate       = useNavigate();
//   const { language }   = useTheme();
//   const t              = T[language] || T.fr;

//   // ── États ────────────────────────────────────────────────
//   const [housings,     setHousings]     = useState([]);
//   const [loading,      setLoading]      = useState(false);
//   const [error,        setError]        = useState(null);
//   const [count,        setCount]        = useState(null);
//   const [suggestions,  setSuggestions]  = useState([]);
//   const [nlpSummary,   setNlpSummary]   = useState('');
//   const [mode,         setMode]         = useState('default'); // 'default'|'nlp'|'voice'|'nearby'|'filters'
//   const [userLocation, setUserLocation] = useState(null);
//   const [activeFilters,setActiveFilters]= useState({});
//   const [sortBy,       setSortBy]       = useState('recent');

//   // Ref pour garder la dernière version des callbacks sans recréer les effets
//   const stateRef = useRef({});
//   stateRef.current = { language, sortBy, activeFilters, userLocation };

//   // ── Init depuis URL + rechargement si langue change ──────
//   useEffect(() => {
//     const params  = new URLSearchParams(location.search);
//     const initial = {};
//     params.forEach((v, k) => { initial[k] = v; });

//     if (initial.query) {
//       doNlpSearch(initial.query, null);
//     } else if (Object.keys(initial).length > 0) {
//       const { query: _q, ...filtersOnly } = initial;
//       setActiveFilters(filtersOnly);
//       doFiltersSearch(filtersOnly);
//     } else {
//       doDefault();
//     }
//   // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [location.search, language]);

//   // ────────────────────────────────────────────────────────
//   // Moteurs de recherche
//   // ────────────────────────────────────────────────────────

//   // ── NLP (texte + vocal) ──────────────────────────────────
//   const doNlpSearch = useCallback(async (query, coords) => {
//     if (!query?.trim()) { doDefault(); return; }
//     setLoading(true);
//     setError(null);
//     setSuggestions([]);
//     try {
//       const payload = { query: query.trim(), language: stateRef.current.language };
//       if (coords?.lat) { payload.user_lat = coords.lat; payload.user_lng = coords.lng; }

//       const data = await searchService.nlpSearch(payload);
//       setHousings(data.results || []);
//       setCount(data.count ?? (data.results?.length ?? 0));
//       setNlpSummary(data.criteria_summary || '');
//       setSuggestions(data.suggestions || []);
//     } catch (err) {
//       console.error('NLP search error:', err);
//       setError(t.error);
//       setHousings([]);
//     } finally {
//       setLoading(false);
//     }
//   // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   // ── Près de moi (NLP + GPS) ──────────────────────────────
//   const doNearbySearch = useCallback(async (coords) => {
//     setLoading(true);
//     setError(null);
//     setSuggestions([]);
//     setNlpSummary('');
//     const { language: lang } = stateRef.current;
//     try {
//       const data = await searchService.nlpSearch({
//         query:    lang === 'fr' ? 'logement disponible' : 'available housing',
//         language: lang,
//         user_lat: coords.lat,
//         user_lng: coords.lng,
//       });
//       setHousings(data.results || []);
//       setCount(data.count ?? (data.results?.length ?? 0));
//     } catch (err) {
//       console.error('Nearby search error:', err);
//       setError(t.error);
//       setHousings([]);
//     } finally {
//       setLoading(false);
//     }
//   // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   // ── Filtres structurés → housingService ─────────────────
//   const doFiltersSearch = useCallback(async (filters) => {
//     setLoading(true);
//     setError(null);
//     setSuggestions([]);
//     setNlpSummary('');
//     const { sortBy: sort } = stateRef.current;
//     try {
//       const params = {
//         status: 'disponible',
//         ...filters,
//         ordering: ORDERING[sort] || '-created_at',
//       };
//       // Supprimer valeurs vides
//       Object.keys(params).forEach(k => {
//         if (params[k] === '' || params[k] == null) delete params[k];
//       });

//       const data = await housingService.getHousings(params);
//       const list = Array.isArray(data) ? data : (data.results || []);
//       setHousings(list);
//       setCount(list.length);
//     } catch (err) {
//       console.error('Filters search error:', err);
//       setError(t.error);
//       setHousings([]);
//     } finally {
//       setLoading(false);
//     }
//   // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   // ── Recherche par défaut ─────────────────────────────────
//   const doDefault = useCallback(async () => {
//     setLoading(true);
//     setError(null);
//     setSuggestions([]);
//     setNlpSummary('');
//     try {
//       const data = await housingService.getHousings({
//         status: 'disponible',
//         ordering: '-created_at',
//       });
//       const list = Array.isArray(data) ? data : (data.results || []);
//       setHousings(list);
//       setCount(list.length);
//     } catch (err) {
//       setError(t.error);
//       setHousings([]);
//     } finally {
//       setLoading(false);
//     }
//   // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   // ────────────────────────────────────────────────────────
//   // Handlers
//   // ────────────────────────────────────────────────────────
//   const syncURL = (params) => {
//     const p = new URLSearchParams();
//     Object.entries(params).forEach(([k, v]) => {
//       if (v !== '' && v != null) p.set(k, String(v));
//     });
//     const next = `/search?${p.toString()}`;
//     if (location.pathname + location.search !== next) {
//       navigate(next, { replace: true });
//     }
//   };

//   // SearchBar → classique ou NLP (les deux vont vers NLP côté backend)
//   const handleSearch = ({ query, isNLP }) => {
//     setMode(isNLP ? 'nlp' : 'nlp'); // toujours NLP, backend NLP gère les 2
//     setActiveFilters({});
//     syncURL({ query });
//     doNlpSearch(query, userLocation);
//   };

//   // VoiceSearch → NLP
//   const handleVoiceTranscript = (transcript) => {
//     setMode('voice');
//     setActiveFilters({});
//     syncURL({ query: transcript });
//     doNlpSearch(transcript, userLocation);
//   };

//   // NearMeButton
//   const handleNearby = (coords) => {
//     setUserLocation(coords);
//     setMode('nearby');
//     setActiveFilters({});
//     setNlpSummary('');
//     syncURL({ lat: coords.lat, lng: coords.lng });
//     doNearbySearch(coords);
//   };

//   // FilterPanel
//   const handleFilters = (newFilters) => {
//     setActiveFilters(newFilters);
//     setMode('filters');
//     setNlpSummary('');
//     syncURL(newFilters);
//     doFiltersSearch(newFilters);
//   };

//   // Tri
//   const handleSort = (newSort) => {
//     setSortBy(newSort);
//     if (mode === 'filters') {
//       // Relancer la recherche avec le nouveau tri
//       doFiltersSearch(activeFilters);
//     } else {
//       // Tri local pour les résultats NLP
//       const sorter = SORTERS[newSort];
//       if (sorter) setHousings(prev => [...prev].sort(sorter));
//     }
//   };

//   // Effacer NLP summary
//   const handleClearNLP = () => {
//     setNlpSummary('');
//     setActiveFilters({});
//     setMode('default');
//     setUserLocation(null);
//     navigate('/search', { replace: true });
//     doDefault();
//   };

//   // Cliquer sur une suggestion NLP
//   const handleSuggestion = (text) => {
//     setMode('nlp');
//     syncURL({ query: text });
//     doNlpSearch(text, null);
//   };

//   // Réinitialiser tout
//   const handleReset = () => {
//     setActiveFilters({});
//     setNlpSummary('');
//     setUserLocation(null);
//     setMode('default');
//     setSuggestions([]);
//     setSortBy('recent');
//     navigate('/search', { replace: true });
//     doDefault();
//   };

//   // ── Rendu ─────────────────────────────────────────────────
//   const showNlpMode = mode === 'nlp' || mode === 'voice';
//   const filterCount = Object.values(activeFilters).filter(v => v !== '' && v != null).length;

//   return (
//     <div className="search-page">

//       {/* ══ En-tête ══════════════════════════════════════════ */}
//       <div className="sp-header">
//         <div className="container">
//           <div className="sp-header-text">
//             <h1 className="sp-title">{t.title}</h1>
//             <p className="sp-subtitle">{t.subtitle}</p>
//           </div>

//           {/* ── Contrôles de recherche ── */}
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
//                 onError={(msg) => setError(msg)}
//                 language={language}
//               />
//               <NearMeButton
//                 onLocationFound={handleNearby}
//                 onError={(msg) => setError(msg)}
//                 language={language}
//               />
//               <FilterPanel
//                 onApplyFilters={handleFilters}
//                 initialFilters={activeFilters}
//                 language={language}
//               />
//             </div>
//           </div>

//           {/* ── Badges contexte ── */}
//           {(mode !== 'default' || nlpSummary) && (
//             <div className="sp-badges">
//               {mode === 'nearby' && (
//                 <span className="sp-badge sp-badge--nearby">
//                   <MapPin size={12} /> {t.badge_nearby}
//                 </span>
//               )}
//               {showNlpMode && (
//                 <span className="sp-badge sp-badge--nlp">
//                   <Sparkles size={12} />
//                   {mode === 'voice' ? t.badge_voice : t.badge_nlp}
//                 </span>
//               )}
//               {mode === 'filters' && filterCount > 0 && (
//                 <span className="sp-badge sp-badge--filters">
//                   {filterCount} filtre{filterCount > 1 ? 's' : ''} actif{filterCount > 1 ? 's' : ''}
//                 </span>
//               )}
//             </div>
//           )}
//         </div>
//       </div>

//       {/* ══ Contenu principal ════════════════════════════════ */}
//       <div className="container sp-content">

//         {/* ── Barre résultats + tri ── */}
//         {!loading && count !== null && (
//           <div className="sp-toolbar">
//             <span className="sp-count">
//               <strong>{count}</strong> {t.results}
//             </span>

//             {housings.length > 1 && (
//               <div className="sp-sort">
//                 <label htmlFor="sort-select">{t.sort_by}</label>
//                 <select
//                   id="sort-select"
//                   value={sortBy}
//                   onChange={(e) => handleSort(e.target.value)}
//                 >
//                   <option value="recent">{t.sort_recent}</option>
//                   <option value="price_asc">{t.sort_asc}</option>
//                   <option value="price_desc">{t.sort_desc}</option>
//                   <option value="area_desc">{t.sort_area}</option>
//                   <option value="popular">{t.sort_popular}</option>
//                   {showNlpMode && (
//                     <option value="score">{t.sort_score}</option>
//                   )}
//                 </select>
//               </div>
//             )}
//           </div>
//         )}

//         {/* ── Chargement ── */}
//         {loading && (
//           <div className="sp-loading">
//             <Loader className="sp-spinner" size={36} />
//             <p>{t.loading}</p>
//           </div>
//         )}

//         {/* ── Erreur ── */}
//         {!loading && error && (
//           <div className="sp-error">
//             <p>{error}</p>
//             <button className="sp-retry" onClick={handleReset}>
//               {t.retry}
//             </button>
//           </div>
//         )}

//         {/* ── Résultats ── */}
//         {!loading && !error && housings.length > 0 && (
//           <HousingList housings={housings} />
//         )}

//         {/* ── État vide ── */}
//         {!loading && !error && housings.length === 0 && count !== null && (
//           <div className="sp-empty">
//             <TrendingUp size={48} className="sp-empty-icon" />
//             <h3>{t.no_result}</h3>
//             <p>{t.no_result_sub}</p>

//             {suggestions.length > 0 && (
//               <div className="sp-suggestions">
//                 <p>{t.suggestions}</p>
//                 <div className="sp-chips">
//                   {suggestions.map((s, i) => (
//                     <button
//                       key={i}
//                       className="sp-chip"
//                       onClick={() => handleSuggestion(s)}
//                     >
//                       {s}
//                     </button>
//                   ))}
//                 </div>
//               </div>
//             )}

//             <button className="sp-reset" onClick={handleReset}>
//               {t.reset}
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default SearchPage;


// src/pages/SearchPage.jsx — VERSION FINALE SIMPLE
// ============================================================
// Architecture claire et directe :
//  • Filtre  → api.get('/housings/', { params })  (directo)
//  • Texte   → searchService.nlpSearch()
//  • Vocal   → searchService.nlpSearch()
//  • GPS     → searchService.nlpSearch() + coords
//
// Problème corrigé : 
//  • Plus de double-appel (handleFilters ne fait PAS navigate)
//  • Plus de useCallback/stateRef complexe
//  • api importé directement pour bypasser toute abstraction
// ============================================================

import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Loader, MapPin, TrendingUp, Sparkles } from 'lucide-react';

import { useTheme }       from '../contexts/ThemeContext';
import searchService      from '../services/searchService';
import api                from '../services/api';

import SearchBar    from '../components/Search/SearchBar';
import FilterPanel  from '../components/Search/FilterPanel';
import NearMeButton from '../components/Search/NearMeButton';
import VoiceSearch  from '../components/Search/VoiceSearch';
import HousingList  from '../components/housing/HousingList';

import './SearchPage.css';

const T = {
  fr: {
    title:        'Rechercher un logement',
    subtitle:     'Trouvez le logement idéal au Cameroun',
    results:      'résultat(s)',
    loading:      'Recherche en cours…',
    retry:        'Réessayer',
    no_result:    'Aucun résultat',
    no_sub:       'Essayez d\'ajuster vos critères',
    reset:        'Réinitialiser',
    b_nearby:     'Autour de votre position',
    b_nlp:        'Recherche intelligente',
    b_voice:      'Recherche vocale',
    b_filters:    'filtre(s) actif(s)',
    suggestions:  'Suggestions :',
    error:        'Erreur de recherche. Veuillez réessayer.',
  },
  en: {
    title:        'Find housing',
    subtitle:     'Find your ideal home in Cameroon',
    results:      'result(s)',
    loading:      'Searching…',
    retry:        'Retry',
    no_result:    'No results found',
    no_sub:       'Try adjusting your criteria',
    reset:        'Reset',
    b_nearby:     'Near your location',
    b_nlp:        'Smart search',
    b_voice:      'Voice search',
    b_filters:    'active filter(s)',
    suggestions:  'Suggestions:',
    error:        'Search error. Please try again.',
  },
};

// ────────────────────────────────────────────────────────────
const SearchPage = () => {
  const location     = useLocation();
  const navigate     = useNavigate();
  const { language } = useTheme();
  const t            = T[language] || T.fr;

  const [housings,      setHousings]      = useState([]);
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState(null);
  const [count,         setCount]         = useState(null);
  const [suggestions,   setSuggestions]   = useState([]);
  const [nlpSummary,    setNlpSummary]    = useState('');
  const [mode,          setMode]          = useState('default');
  const [userLocation,  setUserLocation]  = useState(null);
  const [activeFilters, setActiveFilters] = useState({});

  // ── Init + rechargement auto sur changement de langue ────
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query  = params.get('query');
    if (query) {
      setMode('nlp');
      doNlp(query, null);
    } else {
      doDefault();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  // ─────────────────────────────────────────────────────────
  // FONCTIONS DE RECHERCHE
  // ---------------------------------------------------------

  const startSearch = () => {
    setLoading(true);
    setError(null);
    setSuggestions([]);
  };

  const setResults = (list, total) => {
    setHousings(list);
    setCount(total !== undefined ? total : list.length);
  };

  const onError = (e) => {
    console.error('Search error:', e);
    setError(t.error);
    setHousings([]);
    setCount(0);
  };

  // 1 ─ Default : tous les logements disponibles
  const doDefault = async () => {
    startSearch();
    setNlpSummary('');
    try {
      const res = await api.get('/housings/', {
        params: { status: 'disponible', ordering: '-created_at' },
      });
      const list = toList(res.data);
      setResults(list, res.data?.count);
    } catch (e) { onError(e); }
    finally { setLoading(false); }
  };

  // 2 ─ NLP / vocal
  const doNlp = async (query, coords) => {
    if (!query?.trim()) { doDefault(); return; }
    startSearch();
    try {
      const payload = { query: query.trim(), language };
      if (coords) { payload.user_lat = coords.lat; payload.user_lng = coords.lng; }
      const data = await searchService.nlpSearch(payload);
      setResults(data.results || [], data.count);
      setNlpSummary(data.criteria_summary || '');
      setSuggestions(data.suggestions || []);
    } catch (e) { onError(e); }
    finally { setLoading(false); }
  };

  // 3 ─ Filtres structurés → GET /housings/ directement
  const doFilters = async (filters) => {
    startSearch();
    setNlpSummary('');
    try {
      // Construire les params — garder uniquement les valeurs non-vides
      const params = {};
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== '' && v !== null && v !== undefined) {
          params[k] = v;
        }
      });
      if (!params.status) params.status = 'disponible';

      console.log('🔍 Filtres → /housings/ :', params);

      const res = await api.get('/housings/', { params });
      const list = toList(res.data);
      setResults(list, res.data?.count);
    } catch (e) { onError(e); }
    finally { setLoading(false); }
  };

  // 4 ─ Près de moi
  const doNearby = async (coords) => {
    startSearch();
    setNlpSummary('');
    try {
      const data = await searchService.nlpSearch({
        query:    language === 'fr' ? 'logement disponible' : 'available housing',
        language,
        user_lat: coords.lat,
        user_lng: coords.lng,
      });
      setResults(data.results || [], data.count);
    } catch (e) { onError(e); }
    finally { setLoading(false); }
  };

  // Extraire la liste depuis la réponse DRF (paginée ou non)
  const toList = (data) => {
    if (Array.isArray(data))   return data;
    if (data?.results)         return data.results;
    return [];
  };

  // ─────────────────────────────────────────────────────────
  // HANDLERS UI
  // ---------------------------------------------------------

  const handleSearch = ({ query }) => {
    setMode('nlp');
    setActiveFilters({});
    navigate(`/search?query=${encodeURIComponent(query)}`, { replace: true });
    doNlp(query, userLocation);
  };

  const handleVoiceTranscript = (transcript) => {
    setMode('voice');
    setActiveFilters({});
    doNlp(transcript, userLocation);
  };

  // ⚠️ Pas de navigate ici → évite de redéclencher useEffect → pas de double-appel
  const handleFilters = (newFilters) => {
    setActiveFilters(newFilters);
    setMode('filters');
    setNlpSummary('');
    doFilters(newFilters);
  };

  const handleNearby = (coords) => {
    setUserLocation(coords);
    setMode('nearby');
    setActiveFilters({});
    doNearby(coords);
  };

  const handleSuggestion = (text) => {
    setMode('nlp');
    doNlp(text, null);
  };

  const handleClearNLP = () => {
    setNlpSummary('');
    setActiveFilters({});
    setMode('default');
    setUserLocation(null);
    navigate('/search', { replace: true });
    doDefault();
  };

  const handleReset = () => {
    setActiveFilters({});
    setNlpSummary('');
    setUserLocation(null);
    setMode('default');
    setSuggestions([]);
    navigate('/search', { replace: true });
    doDefault();
  };

  // ─────────────────────────────────────────────────────────
  const filterCount  = Object.values(activeFilters).filter(v => v !== '' && v != null).length;
  const isNlpMode    = mode === 'nlp' || mode === 'voice';

  return (
    <div className="search-page">

      {/* ══ EN-TÊTE ══════════════════════════════════════════ */}
      <div className="sp-header">
        <div className="container">
          <div className="sp-header-text">
            <h1 className="sp-title">{t.title}</h1>
            <p className="sp-subtitle">{t.subtitle}</p>
          </div>

          <div className="sp-controls">
            <SearchBar
              onSearch={handleSearch}
              loading={loading}
              criteriaSummary={nlpSummary}
              onClearNLP={handleClearNLP}
              language={language}
            />
            <div className="sp-actions">
              <VoiceSearch
                onTranscript={handleVoiceTranscript}
                onError={(msg) => setError(msg)}
                language={language}
              />
              <NearMeButton
                onLocationFound={handleNearby}
                onError={(msg) => setError(msg)}
                language={language}
              />
              <FilterPanel
                onApplyFilters={handleFilters}
                initialFilters={activeFilters}
                language={language}
              />
            </div>
          </div>

          {mode !== 'default' && (
            <div className="sp-badges">
              {mode === 'nearby' && (
                <span className="sp-badge sp-badge--nearby">
                  <MapPin size={12} /> {t.b_nearby}
                </span>
              )}
              {isNlpMode && (
                <span className="sp-badge sp-badge--nlp">
                  <Sparkles size={12} />
                  {mode === 'voice' ? t.b_voice : t.b_nlp}
                </span>
              )}
              {mode === 'filters' && filterCount > 0 && (
                <span className="sp-badge sp-badge--filters">
                  {filterCount} {t.b_filters}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ══ CONTENU ══════════════════════════════════════════ */}
      <div className="container sp-content">

        {!loading && count !== null && (
          <div className="sp-toolbar">
            <span className="sp-count">
              <strong>{count}</strong> {t.results}
            </span>
          </div>
        )}

        {loading && (
          <div className="sp-loading">
            <Loader className="sp-spinner" size={36} />
            <p>{t.loading}</p>
          </div>
        )}

        {!loading && error && (
          <div className="sp-error">
            <p>{error}</p>
            <button className="sp-retry" onClick={handleReset}>{t.retry}</button>
          </div>
        )}

        {!loading && !error && housings.length > 0 && (
          <HousingList housings={housings} />
        )}

        {!loading && !error && housings.length === 0 && count !== null && (
          <div className="sp-empty">
            <TrendingUp size={48} className="sp-empty-icon" />
            <h3>{t.no_result}</h3>
            <p>{t.no_sub}</p>

            {suggestions.length > 0 && (
              <div className="sp-suggestions">
                <p>{t.suggestions}</p>
                <div className="sp-chips">
                  {suggestions.map((s, i) => (
                    <button key={i} className="sp-chip" onClick={() => handleSuggestion(s)}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button className="sp-reset" onClick={handleReset}>{t.reset}</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
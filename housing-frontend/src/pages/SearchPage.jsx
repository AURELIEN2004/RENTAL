
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
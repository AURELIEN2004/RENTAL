

import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Loader, MapPin, TrendingUp, Sparkles } from 'lucide-react';

import SearchBar    from '../components/Search/SearchBar';
import FilterPanel  from '../components/Search/FilterPanel';
import NearMeButton from '../components/Search/NearMeButton';
import VoiceSearch  from '../components/Search/VoiceSearch';
import HousingList  from '../components/housing/HousingList';
import searchService from '../services/searchService';
import './SearchPage.css';
import { useTheme } from '../contexts/ThemeContext';
// ---------------------------------------------------------------------------
const LABELS = {
  fr: {
    title:        'Rechercher un logement',
    placeholder:  'Rechercher par titre, ville, quartier…',
    sortBy:       'Trier par :',
    sortRecent:   'Plus récents',
    sortPriceAsc: 'Prix croissant',
    sortPriceDsc: 'Prix décroissant',
    sortArea:     'Surface (grande → petite)',
    sortPopular:  'Popularité',
    sortScore:    'Pertinence',
    results:      'Résultats',
    avgPrice:     'Prix moyen',
    range:        'Fourchette',
    fcfa:         'FCFA',
    loading:      'Recherche en cours…',
    retry:        'Réessayer',
    noResult:     'Aucun résultat',
    noResultSub:  "Essayez d'ajuster vos critères",
    reset:        'Réinitialiser',
    nearby:       'Recherche autour de vous',
    smart:        'Recherche intelligente',
    error:        'Erreur lors de la recherche. Veuillez réessayer.',
  },
  en: {
    title:        'Find housing',
    placeholder:  'Search by title, city, district…',
    sortBy:       'Sort by:',
    sortRecent:   'Most recent',
    sortPriceAsc: 'Price ascending',
    sortPriceDsc: 'Price descending',
    sortArea:     'Area (large → small)',
    sortPopular:  'Popularity',
    sortScore:    'Relevance',
    results:      'Results',
    avgPrice:     'Avg. price',
    range:        'Range',
    fcfa:         'FCFA',
    loading:      'Searching…',
    retry:        'Retry',
    noResult:     'No results',
    noResultSub:  'Try adjusting your criteria',
    reset:        'Reset',
    nearby:       'Searching near you',
    smart:        'Smart search',
    error:        'Search error. Please try again.',
  },
};

// ---------------------------------------------------------------------------

const SearchPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // const language = (localStorage.getItem('i18nextLng') || 'fr').startsWith('en') ? 'en' : 'fr';
  // const t        = LABELS[language];

  const [loading,      setLoading]      = useState(false);
  const [housings,     setHousings]     = useState([]);
  const [stats,        setStats]        = useState(null);
  const [filters,      setFilters]      = useState({});
  const [searchType,   setSearchType]   = useState('classic'); // 'classic' | 'nlp' | 'nearby'
  const [userLocation, setUserLocation] = useState(null);
  const [error,        setError]        = useState(null);
  const [nlpSummary,   setNlpSummary]   = useState('');
const { t, language, theme } = useTheme();  // language déclaré après
  // ── Init depuis URL params ──
  useEffect(() => {
    const params   = new URLSearchParams(location.search);
    const initial  = {};
    params.forEach((v, k) => { initial[k] = v; });

    if (Object.keys(initial).length > 0) {
      setFilters(initial);
      const type = initial.searchType || 'classic';
      performSearch(initial, type);
    } else {
      performSearch({}, 'classic');
    }
  }, [location.search, language]); // eslint-disable-line

  // ────────────────────────────────────────────────────────────────────────
  // Recherche principale
  // ────────────────────────────────────────────────────────────────────────
  const performSearch = async (searchFilters = {}, type = 'classic') => {
    setLoading(true);
    setError(null);

    try {
      let data;

      if (type === 'nlp') {
        setSearchType('nlp');
        data = await searchService.nlpSearch({
          query:    searchFilters.query || '',
          language,
          user_lat: searchFilters.lat,
          user_lng: searchFilters.lng,
        });
        setNlpSummary(data.criteria_summary || '');
        setHousings(data.results || []);
        setStats({ total_results: data.count || 0 });

      } else if (type === 'nearby' || (searchFilters.lat && searchFilters.lng)) {
        setSearchType('nearby');
        data = await searchService.searchNearby(
          parseFloat(searchFilters.lat),
          parseFloat(searchFilters.lng),
          parseFloat(searchFilters.radius || 5),
        );
        setNlpSummary('');
        setHousings(data.results || []);
        setStats({ total_results: data.count || 0 });

      } else {
        setSearchType('classic');
        data = await searchService.searchHousings(searchFilters);
        setNlpSummary('');
        setHousings(data.results || []);
        setStats(data.stats   || null);
      }

      updateURL({ ...searchFilters, searchType: type });
    } catch (err) {
      console.error('Erreur recherche:', err);
      setError(t.error);
      setHousings([]);
    } finally {
      setLoading(false);
    }
  };

  // ── URL ──
  // const updateURL = (f) => {
  //   const params = new URLSearchParams();
  //   Object.entries(f).forEach(([k, v]) => {
  //     if (v !== '' && v != null && v !== false && v !== undefined)
  //       params.set(k, String(v));
  //   });
  //   navigate(`/search?${params.toString()}`, { replace: true });
  // };
  const updateURL = (f) => {
  const params = new URLSearchParams();

  Object.entries(f).forEach(([k, v]) => {
    if (v !== '' && v != null && v !== false && v !== undefined) {
      params.set(k, String(v));
    }
  });

  const newUrl = `?${params.toString()}`;

  if (location.search !== newUrl) {
    navigate(`/search${newUrl}`, { replace: true });
  }
};

  // ── Depuis SearchBar (mode classique ou NLP) ──
  const handleSearch = ({ query, isNLP }) => {
    const newFilters = { ...filters, query };
    setFilters(newFilters);
    performSearch(newFilters, isNLP ? 'nlp' : 'classic');
  };

  // ── Depuis VoiceSearch (transcript validé) → toujours NLP ──
  const handleVoiceTranscript = (transcript) => {
    if (!transcript.trim()) return;
    const newFilters = { ...filters, query: transcript };
    setFilters(newFilters);
    performSearch(newFilters, 'nlp');
  };

  // ── Filtres avancés ──
  const handleApplyFilters = (newFilters) => {
    const merged = { ...filters, ...newFilters };
    setFilters(merged);
    performSearch(merged, 'classic');
  };

  // ── Géolocalisation ──
  const handleNearbySearch = (loc) => {
    setUserLocation(loc);
    const f = { ...filters, lat: loc.lat, lng: loc.lng, radius: 5 };
    setFilters(f);
    performSearch(f, 'nearby');
  };

  // ── Tri ──
  const handleSort = (sortBy) => {
    const f = { ...filters, sortBy };
    setFilters(f);
    performSearch(f, searchType);
  };

  // ── Effacer NLP ──
  const handleClearNLP = () => {
    setNlpSummary('');
    const f = { sortBy: filters.sortBy };
    setFilters(f);
    performSearch(f, 'classic');
  };

  // ────────────────────────────────────────────────────────────────────────
  return (
    <div className="search-page">

      {/* ── En-tête ── */}
      <div className="search-header">
        <div className="container">
          <h1>{t.title}</h1>

          <div className="search-controls">
            <SearchBar
              onSearch={handleSearch}
              loading={loading}
              placeholder={t.placeholder}
              criteriaSummary={nlpSummary}
              onClearNLP={handleClearNLP}
              language={language}
            />

            <div className="search-actions">
              {/* Vocal : passe la langue pour le bon moteur */}
              <VoiceSearch
                onTranscript={handleVoiceTranscript}
                onError={(msg) => setError(msg)}
                language={language}
              />

              <NearMeButton
                onLocationFound={handleNearbySearch}
                onError={(msg) => setError(msg)}
              />

              <FilterPanel
                onApplyFilters={handleApplyFilters}
                initialFilters={filters}
              />
            </div>
          </div>

          {/* Badge type de recherche */}
          {searchType === 'nearby' && (
            <div className="search-type-badge">
              <MapPin size={14} /> <span>{t.nearby}</span>
            </div>
          )}
          {searchType === 'nlp' && (
            <div className="search-type-badge search-type-badge--nlp">
              <Sparkles size={14} /> <span>{t.smart}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Contenu ── */}
      <div className="container search-content">

        {/* Stats */}
        {stats && (
          <div className="search-stats">
            <div className="stat-item">
              <span className="stat-label">{t.results}</span>
              <span className="stat-value">{stats.total_results}</span>
            </div>
            {stats.avg_price > 0 && (
              <>
                <div className="stat-item">
                  <span className="stat-label">{t.avgPrice}</span>
                  <span className="stat-value">
                    {Math.round(stats.avg_price).toLocaleString()} {t.fcfa}
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">{t.range}</span>
                  <span className="stat-value">
                    {stats.min_price?.toLocaleString()} – {stats.max_price?.toLocaleString()} {t.fcfa}
                  </span>
                </div>
              </>
            )}
          </div>
        )}

        {/* Tri */}
        {housings.length > 0 && (
          <div className="sort-controls">
            <label>{t.sortBy}</label>
            <select
              value={filters.sortBy || 'recent'}
              onChange={(e) => handleSort(e.target.value)}
            >
              <option value="recent">{t.sortRecent}</option>
              <option value="price_asc">{t.sortPriceAsc}</option>
              <option value="price_desc">{t.sortPriceDsc}</option>
              <option value="area_desc">{t.sortArea}</option>
              <option value="popular">{t.sortPopular}</option>
              {searchType === 'nlp' && (
                <option value="score">{t.sortScore}</option>
              )}
            </select>
          </div>
        )}

        {/* Chargement */}
        {loading && (
          <div className="loading-state">
            <Loader className="spinner" size={40} />
            <p>{t.loading}</p>
          </div>
        )}

        {/* Erreur */}
        {!loading && error && (
          <div className="error-state">
            <p>{error}</p>
            <button onClick={() => performSearch(filters, searchType)}>
              {t.retry}
            </button>
          </div>
        )}

        {/* Résultats */}
        {!loading && !error && (
          housings.length > 0 ? (
            <HousingList housings={housings} />
          ) : (
            <div className="empty-state">
              <TrendingUp size={48} />
              <h3>{t.noResult}</h3>
              <p>{t.noResultSub}</p>
              <button onClick={handleClearNLP}>{t.reset}</button>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default SearchPage;
// // ============================================
// // 📁 src/components/Search/SearchBar.jsx  — VERSION AMÉLIORÉE
// //


import { useState, useRef } from 'react';
import { Search, Loader, X, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import './SearchBar.css';

const T = {
  fr: {
    classic:       'Classique',
    nlp:           'Langage naturel',
    ph_classic:    'Rechercher par titre, ville, quartier…',
    ph_nlp:        'Ex : Studio meublé à Yaoundé pour 50 000 FCFA',
    btn:           'Rechercher',
    clear:         'Effacer',
    aria:          'Champ de recherche',
  },
  en: {
    classic:       'Classic',
    nlp:           'Natural language',
    ph_classic:    'Search by title, city, neighborhood…',
    ph_nlp:        'Ex: Furnished studio in Yaoundé for 50,000 FCFA',
    btn:           'Search',
    clear:         'Clear',
    aria:          'Search field',
  },
};

const SearchBar = ({
  onSearch,
  loading         = false,
  criteriaSummary = '',
  onClearNLP      = null,
  language: langProp,
}) => {
  const { language: langCtx } = useTheme();
  const lang = langProp || langCtx || 'fr';
  const t    = T[lang] || T.fr;

  const [query, setQuery] = useState('');
  const [mode,  setMode]  = useState('classic'); // 'classic' | 'nlp'
  const inputRef          = useRef(null);

  const placeholder = mode === 'nlp' ? t.ph_nlp : t.ph_classic;

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed || loading) return;
    onSearch({ query: trimmed, isNLP: mode === 'nlp' });
  };

  const handleClear = () => {
    setQuery('');
    onClearNLP?.();
    inputRef.current?.focus();
  };

  return (
    <div className="sb-wrapper">

      {/* ── Sélecteur de mode ── */}
      <div className="sb-mode-toggle" role="group">
        <button
          type="button"
          className={`sb-mode-btn ${mode === 'classic' ? 'sb-mode-btn--active' : ''}`}
          onClick={() => setMode('classic')}
        >
          <Search size={13} aria-hidden="true" />
          {t.classic}
        </button>
        <button
          type="button"
          className={`sb-mode-btn ${mode === 'nlp' ? 'sb-mode-btn--active' : ''}`}
          onClick={() => setMode('nlp')}
        >
          <Sparkles size={13} aria-hidden="true" />
          {t.nlp}
        </button>
      </div>

      {/* ── Formulaire ── */}
      <form onSubmit={handleSubmit} className="sb-form" role="search">
        <div className="sb-input-row">

          <span className="sb-icon-left" aria-hidden="true">
            {loading
              ? <Loader className="sb-spin" size={18} />
              : <Search size={18} />
            }
          </span>

          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="sb-input"
            disabled={loading}
            aria-label={t.aria}
            autoComplete="off"
          />

          {(query || criteriaSummary) && (
            <button
              type="button"
              className="sb-clear"
              onClick={handleClear}
              aria-label={t.clear}
            >
              <X size={15} />
            </button>
          )}

          <button
            type="submit"
            className="sb-submit"
            disabled={loading || !query.trim()}
          >
            {t.btn}
          </button>
        </div>

        {/* ── Badge résumé NLP ── */}
        {criteriaSummary && (
          <div className="sb-nlp-badge">
            <Sparkles size={12} aria-hidden="true" />
            <span>{criteriaSummary}</span>
            {onClearNLP && (
              <button
                type="button"
                className="sb-nlp-clear"
                onClick={onClearNLP}
                aria-label={t.clear}
              >
                <X size={12} />
              </button>
            )}
          </div>
        )}
      </form>
    </div>
  );
};

export default SearchBar;




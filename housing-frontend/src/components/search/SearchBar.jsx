// ============================================
// 📁 src/components/Search/SearchBar.jsx  — VERSION AMÉLIORÉE
//
// Mode NLP intégré :
//   - L'utilisateur tape une requête libre
//   - Après soumission, le backend NLP analyse et retourne les critères compris
//   - Un badge résumé est affiché ("Recherche : Studio meublé à Yaoundé…")
//   - Ce badge est cliquable pour effacer/réinitialiser
// ============================================

import { useState, useRef } from 'react';
import { Search, Loader, X, Sparkles } from 'lucide-react';
import './SearchBar.css';

/**
 * Barre de recherche principale.
 *
 * Props:
 *   onSearch        {function}  appelé avec { query, isNLP: bool }
 *   loading         {boolean}
 *   placeholder     {string}
 *   criteriaSummary {string}    résumé des critères NLP (venant du parent)
 *   onClearNLP      {function}  appelé quand l'utilisateur efface le résumé NLP
 *   language        {string}    'fr' | 'en'
 *
 * Usage dans SearchPage :
 *   <SearchBar
 *     onSearch={handleSearch}
 *     loading={loading}
 *     placeholder="Rechercher par titre, ville, quartier..."
 *     criteriaSummary={nlpSummary}
 *     onClearNLP={handleClearNLP}
 *   />
 */
const SearchBar = ({
  onSearch,
  loading          = false,
  placeholder      = 'Rechercher par titre, ville, quartier…',
  criteriaSummary  = '',
  onClearNLP       = null,
  language         = 'fr',
}) => {
  const [query, setQuery]     = useState('');
  const [mode, setMode]       = useState('classic'); // 'classic' | 'nlp'
  const inputRef              = useRef(null);

  const labels = {
    fr: {
      classic:  'Classique',
      nlp:      'Langage naturel',
      search:   'Rechercher',
      nlp_tip:  'Ex : Studio meublé à Yaoundé pour 50 000 FCFA',
      clear:    'Effacer',
    },
    en: {
      classic:  'Classic',
      nlp:      'Natural language',
      search:   'Search',
      nlp_tip:  'Ex: Furnished studio in Yaoundé for 50,000 FCFA',
      clear:    'Clear',
    },
  }[language] || {};

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    onSearch({ query: trimmed, isNLP: mode === 'nlp' });
  };

  const handleClear = () => {
    setQuery('');
    if (onClearNLP) onClearNLP();
    inputRef.current?.focus();
  };

  // Quand VoiceSearch pousse une transcription validée → remplir le champ + lancer
  // (géré depuis le parent via handleVoiceTranscript, pas besoin ici)

  return (
    <div className="search-bar-wrapper">
      {/* ── Sélecteur de mode ── */}
      <div className="search-mode-toggle">
        <button
          type="button"
          className={`mode-btn ${mode === 'classic' ? 'active' : ''}`}
          onClick={() => setMode('classic')}
        >
          <Search size={13} />
          {labels.classic}
        </button>
        <button
          type="button"
          className={`mode-btn ${mode === 'nlp' ? 'active' : ''}`}
          onClick={() => setMode('nlp')}
        >
          <Sparkles size={13} />
          {labels.nlp}
        </button>
      </div>

      {/* ── Formulaire ── */}
      <form onSubmit={handleSubmit} className="search-bar">
        <div className="search-input-wrapper">
          {loading
            ? <Loader className="search-icon spinning" size={20} />
            : <Search className="search-icon" size={20} />
          }

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={mode === 'nlp' ? labels.nlp_tip : placeholder}
            className="search-input"
            disabled={loading}
            aria-label="Champ de recherche"
          />

          {/* Effacer */}
          {(query || criteriaSummary) && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={handleClear}
              title={labels.clear}
              aria-label={labels.clear}
            >
              <X size={16} />
            </button>
          )}

          <button
            type="submit"
            className="search-button"
            disabled={loading || !query.trim()}
          >
            {labels.search}
          </button>
        </div>

        {/* ── Badge résumé NLP ── */}
        {criteriaSummary && (
          <div className="search-nlp-summary">
            <Sparkles size={14} className="summary-icon" />
            <span className="summary-text">{criteriaSummary}</span>
            {onClearNLP && (
              <button
                type="button"
                className="summary-clear"
                onClick={onClearNLP}
                title={labels.clear}
                aria-label={labels.clear}
              >
                <X size={13} />
              </button>
            )}
          </div>
        )}
      </form>
    </div>
  );
};

export default SearchBar;
// ============================================
// 📁 src/components/Search/SearchBar.jsx
// Barre de recherche principale avec vocal
// ============================================

import React, { useState } from 'react';
import { Search, Mic, MicOff, Loader } from 'lucide-react';
import { useVoiceRecording } from '../../hooks/useVoiceRecording';
import searchService from '../../services/searchService';
import './SearchBar.css';

const SearchBar = ({ onSearch, onVoiceSearch, language = 'fr' }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);

  const {
    isRecording,
    recordingTime,
    audioBlob,
    startRecording,
    stopRecording,
    cancelRecording,
    clearAudio,
  } = useVoiceRecording();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      await onSearch(searchQuery);
    } finally {
      setIsSearching(false);
    }
  };

  const handleVoiceToggle = async () => {
    if (isRecording) {
      // Arrêter l'enregistrement
      stopRecording();
    } else {
      // Démarrer l'enregistrement
      try {
        await startRecording();
      } catch (error) {
        alert(
          language === 'fr'
            ? 'Erreur: Impossible d\'accéder au microphone'
            : 'Error: Cannot access microphone'
        );
      }
    }
  };

  // Traiter l'audio quand l'enregistrement est terminé
  React.useEffect(() => {
    if (audioBlob && !isRecording) {
      handleVoiceSearch();
    }
  }, [audioBlob, isRecording]);

  const handleVoiceSearch = async () => {
    if (!audioBlob) return;

    setIsProcessingVoice(true);
    try {
      const result = await searchService.voiceSearch(audioBlob, language);
      
      if (result.success) {
        // Mettre à jour la barre de recherche avec la transcription
        setSearchQuery(result.transcription);
        
        // Notifier le parent avec les résultats
        if (onVoiceSearch) {
          onVoiceSearch(result);
        }
      } else {
        alert(
          language === 'fr'
            ? 'Erreur: Impossible de comprendre l\'audio'
            : 'Error: Could not understand audio'
        );
      }
    } catch (error) {
      console.error('Voice search error:', error);
      alert(
        language === 'fr'
          ? 'Erreur lors de la recherche vocale'
          : 'Voice search error'
      );
    } finally {
      setIsProcessingVoice(false);
      clearAudio();
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const placeholderText = language === 'fr'
    ? 'Rechercher un logement... (ex: appartement 2 chambres à Yaoundé)'
    : 'Search housing... (ex: 2 bedroom apartment in Yaounde)';

  return (
    <div className="search-bar-container">
      <form onSubmit={handleSearch} className="search-bar-form">
        <div className="search-input-wrapper">
          <Search className="search-icon" size={20} />
          
          <input
            type="text"
            className="search-input"
            placeholder={placeholderText}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={isRecording || isProcessingVoice}
          />

          <button
            type="button"
            className={`voice-button ${isRecording ? 'recording' : ''}`}
            onClick={handleVoiceToggle}
            disabled={isProcessingVoice}
            title={
              language === 'fr'
                ? 'Recherche vocale'
                : 'Voice search'
            }
          >
            {isRecording ? (
              <MicOff size={20} className="pulse" />
            ) : (
              <Mic size={20} />
            )}
          </button>

          <button
            type="submit"
            className="search-button"
            disabled={!searchQuery.trim() || isSearching || isRecording}
          >
            {isSearching ? (
              <Loader className="spinner" size={20} />
            ) : (
              language === 'fr' ? 'Rechercher' : 'Search'
            )}
          </button>
        </div>

        {isRecording && (
          <div className="recording-indicator">
            <span className="recording-dot"></span>
            <span className="recording-text">
              {language === 'fr' ? 'Enregistrement' : 'Recording'}
              {' '}{formatTime(recordingTime)}
            </span>
            <button
              type="button"
              className="cancel-recording"
              onClick={cancelRecording}
            >
              {language === 'fr' ? 'Annuler' : 'Cancel'}
            </button>
          </div>
        )}

        {isProcessingVoice && (
          <div className="processing-indicator">
            <Loader className="spinner" size={16} />
            <span>
              {language === 'fr'
                ? 'Traitement de l\'audio...'
                : 'Processing audio...'}
            </span>
          </div>
        )}
      </form>
    </div>
  );
};

export default SearchBar;
// ============================================
// 📁 src/components/Search/VoiceSearch.jsx
// ============================================

import { useEffect } from 'react';
import { Mic, MicOff, Loader } from 'lucide-react';
import useSpeechRecognition from '../../hooks/useSpeechRecognition';

/**
 * Composant de recherche vocale
 */
const VoiceSearch = ({ onTranscript, onError }) => {
  const {
    isListening,
    transcript,
    error,
    isSupported,
    startListening,
    stopListening,
    resetTranscript
  } = useSpeechRecognition();

  // Envoyer le transcript quand disponible
  useEffect(() => {
    if (transcript && !isListening) {
      onTranscript(transcript);
      // Reset après envoi
      setTimeout(() => resetTranscript(), 1000);
    }
  }, [transcript, isListening, onTranscript, resetTranscript]);

  // Gérer les erreurs
  useEffect(() => {
    if (error && onError) {
      const errorMessages = {
        'no-speech': 'Aucun son détecté. Parlez plus fort.',
        'audio-capture': 'Microphone non accessible.',
        'not-allowed': 'Autorisez l\'accès au microphone.',
        'network': 'Erreur réseau.',
        'aborted': 'Reconnaissance annulée.',
        'already-started': 'Déjà en écoute.'
      };
      onError(errorMessages[error] || 'Erreur de reconnaissance vocale');
    }
  }, [error, onError]);

  if (!isSupported) {
    return (
      <div className="voice-search-unsupported">
        <MicOff size={20} />
        <span>Non supporté</span>
      </div>
    );
  }

  const handleClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className="voice-search">
      <button
        onClick={handleClick}
        className={`voice-button ${isListening ? 'listening' : ''}`}
        title={isListening ? 'Arrêter l\'écoute' : 'Recherche vocale'}
      >
        {isListening ? (
          <>
            <div className="pulse-ring"></div>
            <Mic size={20} className="mic-icon" />
          </>
        ) : (
          <Mic size={20} />
        )}
      </button>

      {isListening && (
        <div className="listening-indicator">
          <Loader className="spinner" size={16} />
          <span>J'écoute...</span>
        </div>
      )}

      {transcript && !isListening && (
        <div className="transcript-preview">
          "{transcript}"
        </div>
      )}
    </div>
  );
};

export default VoiceSearch;
// // ============================================
// // 📁 src/components/Search/VoiceSearch.jsx
// // ============================================

// import { useEffect } from 'react';
// import { Mic, MicOff, Loader } from 'lucide-react';
// import useSpeechRecognition from '../../hooks/useSpeechRecognition';

// /**
//  * Composant de recherche vocale
//  */
// const VoiceSearch = ({ onTranscript, onError }) => {
//   const {
//     isListening,
//     transcript,
//     error,
//     isSupported,
//     startListening,
//     stopListening,
//     resetTranscript
//   } = useSpeechRecognition();

//   // Envoyer le transcript quand disponible
//   useEffect(() => {
//     if (transcript && !isListening) {
//       onTranscript(transcript);
//       // Reset après envoi
//       setTimeout(() => resetTranscript(), 1000);
//     }
//   }, [transcript, isListening, onTranscript, resetTranscript]);

//   // Gérer les erreurs
//   useEffect(() => {
//     if (error && onError) {
//       const errorMessages = {
//         'no-speech': 'Aucun son détecté. Parlez plus fort.',
//         'audio-capture': 'Microphone non accessible.',
//         'not-allowed': 'Autorisez l\'accès au microphone.',
//         'network': 'Erreur réseau.',
//         'aborted': 'Reconnaissance annulée.',
//         'already-started': 'Déjà en écoute.'
//       };
//       onError(errorMessages[error] || 'Erreur de reconnaissance vocale');
//     }
//   }, [error, onError]);

//   if (!isSupported) {
//     return (
//       <div className="voice-search-unsupported">
//         <MicOff size={20} />
//         <span>Non supporté</span>
//       </div>
//     );
//   }

//   const handleClick = () => {
//     if (isListening) {
//       stopListening();
//     } else {
//       startListening();
//     }
//   };

//   return (
//     <div className="voice-search">
//       <button
//         onClick={handleClick}
//         className={`voice-button ${isListening ? 'listening' : ''}`}
//         title={isListening ? 'Arrêter l\'écoute' : 'Recherche vocale'}
//       >
//         {isListening ? (
//           <>
//             <div className="pulse-ring"></div>
//             <Mic size={20} className="mic-icon" />
//           </>
//         ) : (
//           <Mic size={20} />
//         )}
//       </button>

//       {isListening && (
//         <div className="listening-indicator">
//           <Loader className="spinner" size={16} />
//           <span>J'écoute...</span>
//         </div>
//       )}

//       {transcript && !isListening && (
//         <div className="transcript-preview">
//           "{transcript}"
//         </div>
//       )}
//     </div>
//   );
// };

// export default VoiceSearch;

// ============================================
// 📁 src/components/Search/VoiceSearch.jsx  — VERSION CORRIGÉE
//
// Bugs corrigés :
//  - langue passée au hook useSpeechRecognition
//  - useEffect écoute [transcript] seulement quand !isListening
//  - le modal de validation s'ouvre uniquement si transcript non vide
//  - resetTranscript appelé APRÈS fermeture du modal (pas avant)
// ============================================

import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Check, X, Edit3 } from 'lucide-react';
import useSpeechRecognition from '../../hooks/useSpeechRecognition';

import './VoiceSearch.css';

const LABELS = {
  fr: {
    title:       'Vérifiez la transcription',
    subtitle:    'Modifiez si besoin puis lancez la recherche',
    placeholder: 'Ce que vous avez dit…',
    confirm:     'Rechercher',
    cancel:      'Annuler',
    listening:   "J'écoute…",
    tip:         'Recherche vocale',
    noSupport:   'Non supporté',
    errors: {
      'no-speech':     'Aucun son détecté. Parlez plus fort.',
      'audio-capture': 'Microphone inaccessible.',
      'not-allowed':   "Autorisez l'accès au microphone.",
      'network':       'Erreur réseau.',
      'aborted':       'Reconnaissance annulée.',
      'already-started': 'Déjà en cours.',
    },
  },
  en: {
    title:       'Review your transcript',
    subtitle:    'Edit if needed then search',
    placeholder: 'What you said…',
    confirm:     'Search',
    cancel:      'Cancel',
    listening:   'Listening…',
    tip:         'Voice search',
    noSupport:   'Not supported',
    errors: {
      'no-speech':     'No sound detected. Speak louder.',
      'audio-capture': 'Microphone not accessible.',
      'not-allowed':   'Allow microphone access.',
      'network':       'Network error.',
      'aborted':       'Recognition cancelled.',
      'already-started': 'Already running.',
    },
  },
};

const VoiceSearch = ({ onTranscript, onError, language = 'fr' }) => {
  const lbl = LABELS[language] || LABELS.fr;

  const {
    isListening,
    transcript,
    error,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition(language);   // ← langue passée au hook

  const [showModal, setShowModal]   = useState(false);
  const [editedText, setEditedText] = useState('');
  const inputRef                    = useRef(null);

  // ── Quand la reconnaissance s'arrête avec un résultat → modal ──
  useEffect(() => {
    // On ouvre le modal seulement si on a un transcript ET qu'on a arrêté
    if (transcript && !isListening) {
      setEditedText(transcript.trim());
      setShowModal(true);
      setTimeout(() => inputRef.current?.focus(), 120);
    }
  }, [transcript, isListening]);

  // ── Erreurs ──────────────────────────────────────────────────────
  useEffect(() => {
    if (error && onError) {
      const msg = lbl.errors[error] || 'Erreur de reconnaissance vocale';
      onError(msg);
    }
  }, [error]); // eslint-disable-line

  // ── Bouton micro ─────────────────────────────────────────────────
  const handleToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      resetTranscript();
      startListening();
    }
  };

  // ── Validation du modal ──────────────────────────────────────────
  const handleConfirm = () => {
    const text = editedText.trim();
    if (text) onTranscript(text);
    closeModal();
  };

  const closeModal = () => {
    setShowModal(false);
    setEditedText('');
    resetTranscript();         // nettoyage APRÈS fermeture
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleConfirm(); }
    if (e.key === 'Escape') closeModal();
  };

  // ────────────────────────────────────────────────────────────────
  if (!isSupported) {
    return (
      <div className="voice-search-unsupported" title={lbl.noSupport}>
        <MicOff size={20} />
      </div>
    );
  }

  return (
    <>
      {/* ── Bouton micro ── */}
      <div className="voice-search">
        <button
          type="button"
          onClick={handleToggle}
          className={`voice-button ${isListening ? 'listening' : ''}`}
          title={lbl.tip}
          aria-label={lbl.tip}
        >
          {isListening && <span className="pulse-ring" />}
          <Mic size={20} className="mic-icon" />
        </button>
        {isListening && (
          <span className="listening-label">{lbl.listening}</span>
        )}
      </div>

      {/* ── Modal de validation ── */}
      {showModal && (
        <div
          className="voice-modal-overlay"
          role="dialog"
          aria-modal="true"
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div className="voice-modal">
            {/* Header */}
            <div className="voice-modal-header">
              <div className="voice-modal-icon"><Mic size={22} /></div>
              <div>
                <h3 className="voice-modal-title">{lbl.title}</h3>
                <p className="voice-modal-subtitle">{lbl.subtitle}</p>
              </div>
            </div>

            {/* Champ éditable */}
            <div className="voice-modal-body">
              <div className="voice-edit-wrapper">
                <Edit3 size={15} className="voice-edit-icon" />
                <textarea
                  ref={inputRef}
                  className="voice-transcript-input"
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={lbl.placeholder}
                  rows={3}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="voice-modal-actions">
              <button
                type="button"
                className="voice-modal-btn voice-modal-btn--cancel"
                onClick={closeModal}
              >
                <X size={15} /> {lbl.cancel}
              </button>
              <button
                type="button"
                className="voice-modal-btn voice-modal-btn--confirm"
                onClick={handleConfirm}
                disabled={!editedText.trim()}
              >
                <Check size={15} /> {lbl.confirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default VoiceSearch;
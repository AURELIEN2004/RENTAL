// // // ============================================
// // // 📁 src/components/Search/VoiceSearch.jsx
// // // ============================================

import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Check, X, Edit3 } from 'lucide-react';
import useSpeechRecognition from '../../hooks/useSpeechRecognition';
import { useTheme } from '../../contexts/ThemeContext';
import './VoiceSearch.css';

const T = {
  fr: {
    tip:       'Recherche vocale',
    listening: "J'écoute…",
    no_sup:    'Reconnaissance vocale non supportée',
    m_title:   'Vérifiez la transcription',
    m_sub:     'Corrigez si besoin, puis confirmez',
    m_ph:      'Ce que vous avez dit…',
    confirm:   'Rechercher',
    cancel:    'Annuler',
    errors: {
      'no-speech':       'Aucun son détecté. Parlez plus fort.',
      'audio-capture':   'Microphone inaccessible.',
      'not-allowed':     "Autorisez l'accès au microphone.",
      'network':         'Erreur réseau.',
      'aborted':         'Écoute annulée.',
      'already-started': 'Reconnaissance déjà active.',
      'default':         'Erreur de reconnaissance vocale.',
    },
  },
  en: {
    tip:       'Voice search',
    listening: 'Listening…',
    no_sup:    'Voice recognition not supported',
    m_title:   'Review your transcript',
    m_sub:     'Edit if needed, then confirm',
    m_ph:      'What you said…',
    confirm:   'Search',
    cancel:    'Cancel',
    errors: {
      'no-speech':       'No sound detected. Speak louder.',
      'audio-capture':   'Microphone not accessible.',
      'not-allowed':     'Allow microphone access.',
      'network':         'Network error.',
      'aborted':         'Recognition cancelled.',
      'already-started': 'Already running.',
      'default':         'Voice recognition error.',
    },
  },
};

const VoiceSearch = ({ onTranscript, onError, language: langProp }) => {
  const { language: langCtx } = useTheme();
  const lang = langProp || langCtx || 'fr';
  const t    = T[lang] || T.fr;

  const {
    isListening,
    transcript,
    error,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition(lang);

  const [showModal,  setShowModal]  = useState(false);
  const [editedText, setEditedText] = useState('');
  const textareaRef                 = useRef(null);

  // ── Ouvrir modal quand transcription prête ───────────────
  useEffect(() => {
    if (transcript && !isListening) {
      setEditedText(transcript.trim());
      setShowModal(true);
      setTimeout(() => textareaRef.current?.focus(), 150);
    }
  }, [transcript, isListening]);

  // ── Propager les erreurs ─────────────────────────────────
  useEffect(() => {
    if (error && onError) {
      onError(t.errors[error] || t.errors.default);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  // ── Handlers ─────────────────────────────────────────────
  const handleToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      resetTranscript();
      startListening();
    }
  };

  const handleConfirm = () => {
    const text = editedText.trim();
    if (text) onTranscript(text);
    closeModal();
  };

  const closeModal = () => {
    setShowModal(false);
    setEditedText('');
    resetTranscript();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleConfirm(); }
    if (e.key === 'Escape') closeModal();
  };

  // ── Non supporté ─────────────────────────────────────────
  if (!isSupported) {
    return (
      <button
        type="button"
        className="vs-btn vs-btn--unsupported"
        title={t.no_sup}
        disabled
        aria-label={t.no_sup}
      >
        <MicOff size={20} aria-hidden="true" />
      </button>
    );
  }

  return (
    <>
      {/* ── Bouton micro ── */}
      <div className="vs-root">
        <button
          type="button"
          className={`vs-btn ${isListening ? 'vs-btn--listening' : ''}`}
          onClick={handleToggle}
          title={t.tip}
          aria-label={isListening ? t.listening : t.tip}
          aria-pressed={isListening}
        >
          {isListening && <span className="vs-pulse" aria-hidden="true" />}
          <Mic size={20} aria-hidden="true" />
        </button>

        {isListening && (
          <span className="vs-status" aria-live="polite">
            {t.listening}
          </span>
        )}
      </div>

      {/* ── Modal de validation ── */}
      {showModal && (
        <div
          className="vs-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="vs-modal-title"
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div className="vs-modal">

            {/* Header */}
            <div className="vs-modal-header">
              <span className="vs-modal-mic" aria-hidden="true">
                <Mic size={20} />
              </span>
              <div className="vs-modal-titles">
                <h3 id="vs-modal-title" className="vs-modal-title">
                  {t.m_title}
                </h3>
                <p className="vs-modal-sub">{t.m_sub}</p>
              </div>
              <button
                type="button"
                className="vs-modal-close"
                onClick={closeModal}
                aria-label={t.cancel}
              >
                <X size={16} />
              </button>
            </div>

            {/* Corps — textarea éditable */}
            <div className="vs-modal-body">
              <div className="vs-edit-row">
                <Edit3 size={14} className="vs-edit-icon" aria-hidden="true" />
                <textarea
                  ref={textareaRef}
                  className="vs-textarea"
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t.m_ph}
                  rows={3}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="vs-modal-footer">
              <button
                type="button"
                className="vs-modal-btn vs-modal-btn--cancel"
                onClick={closeModal}
              >
                <X size={14} aria-hidden="true" /> {t.cancel}
              </button>
              <button
                type="button"
                className="vs-modal-btn vs-modal-btn--confirm"
                onClick={handleConfirm}
                disabled={!editedText.trim()}
              >
                <Check size={14} aria-hidden="true" /> {t.confirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default VoiceSearch;
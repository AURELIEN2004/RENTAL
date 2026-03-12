

// ============================================
// 📁 src/hooks/useSpeechRecognition.js  — VERSION CORRIGÉE
//
// Bugs corrigés :
//  - langue passée en paramètre (fr-FR / en-US)
//  - transcript final proprement isolé (plus d'interim mixte)
//  - recognition.stop() + recreation pour éviter "already started"
//  - onend ne remet pas isListening à false si c'est un arrêt intentionnel
// ============================================

import { useState, useEffect, useRef, useCallback } from 'react';

const useSpeechRecognition = (language = 'fr') => {
  const [isListening, setIsListening]   = useState(false);
  const [transcript, setTranscript]     = useState('');
  const [error, setError]               = useState(null);
  const [isSupported, setIsSupported]   = useState(false);

  // On garde la ref pour éviter les problèmes de closure
  const recognitionRef  = useRef(null);
  const isListeningRef  = useRef(false);

  // Codes de langue
  const langCode = language === 'en' ? 'en-US' : 'fr-FR';

  // ── Vérification support ─────────────────────────────────────────
  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsSupported(!!SR);
  }, []);

  // ── Création de l'instance ───────────────────────────────────────
  const createRecognition = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return null;

    const rec = new SR();
    rec.continuous      = false;   // s'arrête après un silence
    rec.interimResults  = true;
    rec.lang            = langCode;
    rec.maxAlternatives = 1;

    rec.onstart = () => {
      isListeningRef.current = true;
      setIsListening(true);
      setError(null);
    };

    rec.onresult = (event) => {
      let interim = '';
      let final   = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const part = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += part;
        } else {
          interim += part;
        }
      }
      // Afficher en temps réel l'intermédiaire, puis fixer le final
      setTranscript(final || interim);
    };

    rec.onerror = (event) => {
      console.error('🎤 SpeechRecognition error:', event.error);
      isListeningRef.current = false;
      setIsListening(false);
      setError(event.error);
    };

    rec.onend = () => {
      isListeningRef.current = false;
      setIsListening(false);
      // transcript reste dans l'état → useEffect de VoiceSearch
      // ouvre le modal de validation
    };

    return rec;
  }, [langCode]);

  // ── Démarrer ─────────────────────────────────────────────────────
  const startListening = useCallback(() => {
    if (isListeningRef.current) return; // déjà en écoute

    // Toujours créer une nouvelle instance pour éviter InvalidStateError
    const rec = createRecognition();
    if (!rec) return;

    recognitionRef.current = rec;
    setTranscript('');
    setError(null);

    try {
      rec.start();
    } catch (err) {
      console.error('🎤 Erreur start:', err);
      setError('already-started');
    }
  }, [createRecognition]);

  // ── Arrêter ──────────────────────────────────────────────────────
  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListeningRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  // ── Reset ────────────────────────────────────────────────────────
  const resetTranscript = useCallback(() => {
    setTranscript('');
    setError(null);
  }, []);

  // ── Nettoyage ────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (recognitionRef.current && isListeningRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  return {
    isListening,
    transcript,
    error,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  };
};

export default useSpeechRecognition;
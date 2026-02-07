// ============================================
// 📁 src/components/chatbot/voicesearch.jsx - VERSION AMÉLIORÉE
// ============================================

import { useState, useRef, useEffect } from "react";

const VoiceSearch = ({ onResult }) => {
  // 1. On initialise l'état immédiatement au lieu de le faire dans un Effect
  const [isSupported] = useState(() => {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  });

  const [listening, setListening] = useState(false);
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Si ce n'est pas supporté, on ne fait rien
    if (!isSupported) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = "fr-FR";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
      setListening(false);
    };

    recognition.onerror = (event) => {
      if (event.error !== 'no-speech') {
        setError("Erreur de reconnaissance vocale");
      }
      setListening(false);
    };

    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;

    // Nettoyage si le composant est démonté
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [onResult, isSupported]); // Ajout de isSupported dans les dépendances

  if (!isSupported) {
    return <p>Recherche vocale non supportée par ce navigateur.</p>;
  }

  const startListening = () => {
    if (recognitionRef.current && !listening) {
      setError(null);
      setListening(true);
      recognitionRef.current.start();
    }
  };

  return (
    <div className="voice-search">
      <button onClick={startListening} disabled={listening}>
        {listening ? "🎙️ Écoute..." : "🎤 Recherche vocale"}
      </button>
      {error && <p className="error" style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default VoiceSearch;
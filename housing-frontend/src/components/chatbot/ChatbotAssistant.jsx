
// ============================================
// 📁 components/chatbot/ChatbotAssistant.jsx - VERSION AMÉLIORÉE
// ============================================

import { useState, useRef, useEffect } from "react";
import './ChatbotAssistant.css'; // Assurez-vous de créer ce fichier pour les styles

const ChatbotAssistant = ({ onResults }) => {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState(null);
  const [voiceSupported, setVoiceSupported] = useState(false);
  
  const recognitionRef = useRef(null);
  const inputRef = useRef(null);

  // 🎤 Initialisation de la reconnaissance vocale
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setVoiceSupported(true);
      
      const recognition = new SpeechRecognition();
      recognition.lang = "fr-FR";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setListening(true);
        setError(null);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setMessage(transcript); // ✅ Affiche la transcription
        setListening(false);
        
        // Auto-lancement de la recherche après transcription
        setTimeout(() => {
          handleSearch(transcript);
        }, 500);
      };

      recognition.onerror = (event) => {
        console.error("Erreur reconnaissance vocale:", event.error);
        
        if (event.error === 'no-speech') {
          setError("Aucune parole détectée. Veuillez réessayer.");
        } else if (event.error === 'not-allowed') {
          setError("Microphone non autorisé. Vérifiez les permissions.");
        } else {
          setError("Erreur de reconnaissance vocale.");
        }
        
        setListening(false);
      };

      recognition.onend = () => {
        setListening(false);
      };

      recognitionRef.current = recognition;

      // Nettoyage
      return () => {
        if (recognitionRef.current) {
          recognitionRef.current.abort();
        }
      };
    }
  }, []);

  // 🔍 Lancement de la recherche
  const handleSearch = async (text = message) => {
    if (!text.trim()) {
      setError("Veuillez saisir ou dicter votre recherche");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onResults(text.trim());
      // Message sera conservé pour que l'utilisateur voie ce qu'il a cherché
    } catch (err) {
      console.error("Erreur recherche:", err);
      setError("Erreur lors de la recherche. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  // 🎤 Démarrage de l'écoute vocale
  const startListening = () => {
    if (!voiceSupported) {
      setError("Recherche vocale non supportée par votre navigateur");
      return;
    }

    if (recognitionRef.current && !listening) {
      setMessage(""); // Réinitialise le champ
      setError(null);
      
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error("Erreur démarrage reconnaissance:", err);
        setError("Impossible de démarrer le microphone");
      }
    }
  };

  // 🛑 Arrêt de l'écoute
  const stopListening = () => {
    if (recognitionRef.current && listening) {
      recognitionRef.current.stop();
    }
  };

  // ⌨️ Gestion du Enter
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <div className="chatbot-assistant">
      <div className="chatbot-input-container">
        {/* 📝 Zone de saisie */}
        <textarea
          ref={inputRef}
          className="chatbot-input"
          placeholder="Ex: Je cherche un studio meublé à Yaoundé moins de 80000 FCFA"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={listening || loading}
          rows={3}
        />

        {/* 🎤 Boutons d'action */}
        <div className="chatbot-actions">
          {voiceSupported && (
            <button
              className={`voice-button ${listening ? 'listening' : ''}`}
              onClick={listening ? stopListening : startListening}
              disabled={loading}
              title={listening ? "Arrêter l'écoute" : "Recherche vocale"}
            >
              {listening ? '🔴 Arrêter' : '🎤 Vocal'}
            </button>
          )}

          <button
            className="search-button"
            onClick={() => handleSearch()}
            disabled={loading || listening || !message.trim()}
          >
            {loading ? '⏳ Analyse...' : '🔍 Rechercher'}
          </button>
        </div>
      </div>

      {/* 🎤 Indicateur d'écoute */}
      {listening && (
        <div className="listening-indicator">
          <span className="pulse"></span>
          <span>🎤 En écoute... Parlez maintenant</span>
        </div>
      )}

      {/* ⚠️ Messages d'erreur */}
      {error && (
        <div className="chatbot-error">
          ⚠️ {error}
        </div>
      )}

      {/* 💡 Exemples de requêtes */}
      {!message && !loading && !listening && (
        <div className="chatbot-examples">
          <p><strong>💡 Exemples de recherches :</strong></p>
          <ul>
            <li onClick={() => setMessage("Studio meublé à Yaoundé")}>
              Studio meublé à Yaoundé
            </li>
            <li onClick={() => setMessage("Appartement 2 chambres à Douala moins de 150000")}>
              Appartement 2 chambres à Douala moins de 150000
            </li>
            <li onClick={() => setMessage("Maison à Bastos avec jardin")}>
              Maison à Bastos avec jardin
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default ChatbotAssistant;


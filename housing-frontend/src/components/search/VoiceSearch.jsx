// src/components/search/VoiceSearch.jsx
import React, { useState, useEffect, useRef } from 'react';
import { FaMicrophone, FaMicrophoneSlash, FaGlobe } from 'react-icons/fa';
import { toast } from 'react-toastify';
import './VoiceSearch.css';

const VoiceSearch = ({ onSearchResult, onLanguageChange }) => {
  const [isListening, setIsListening] = useState(false);
  const [language, setLanguage] = useState('fr-FR'); // fr-FR ou en-US
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Vérifier la compatibilité du navigateur
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error('Votre navigateur ne supporte pas la reconnaissance vocale');
      return;
    }

    // Initialiser la reconnaissance vocale
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = language;

    recognitionRef.current.onstart = () => {
      console.log('Écoute démarrée');
      setIsListening(true);
    };

    recognitionRef.current.onresult = (event) => {
      let interimText = '';
      let finalText = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptPart = event.results[i][0].transcript;
        
        if (event.results[i].isFinal) {
          finalText += transcriptPart + ' ';
        } else {
          interimText += transcriptPart;
        }
      }

      setInterimTranscript(interimText);
      
      if (finalText) {
        setTranscript(prev => prev + finalText);
        processVoiceCommand(finalText.trim());
      }
    };

    recognitionRef.current.onerror = (event) => {
      console.error('Erreur reconnaissance vocale:', event.error);
      setIsListening(false);
      
      if (event.error === 'no-speech') {
        toast.warning('Aucune parole détectée. Réessayez.');
      } else if (event.error === 'not-allowed') {
        toast.error('Veuillez autoriser l\'accès au microphone');
      }
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [language]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast.error('Reconnaissance vocale non disponible');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      setInterimTranscript('');
      recognitionRef.current.start();
    }
  };

  const toggleLanguage = () => {
    const newLang = language === 'fr-FR' ? 'en-US' : 'fr-FR';
    setLanguage(newLang);
    
    if (recognitionRef.current) {
      recognitionRef.current.lang = newLang;
    }
    
    if (onLanguageChange) {
      onLanguageChange(newLang);
    }
    
    toast.info(`Langue changée: ${newLang === 'fr-FR' ? 'Français' : 'English'}`);
  };

  const processVoiceCommand = async (command) => {
    try {
      // Envoyer la commande vocale au backend pour traitement
    //   const response = await fetch('/api/voice-search/', {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //       'Authorization': `Bearer ${localStorage.getItem('access_token')}`
    //     },
    //     body: JSON.stringify({
    //       query: command,
    //       language: language
    //     })
    //   });
    //  Ligne 112 - APRÈS (✅ correct)
const response = await api.post('/voice-search/', {
  query: command,
  language: language
});

      const data = await response.json();
      
      if (data.filters || data.results) {
        onSearchResult(data);
        toast.success('Recherche vocale effectuée');
      }
    } catch (error) {
      console.error('Erreur traitement vocal:', error);
      toast.error('Erreur lors du traitement de la recherche vocale');
    }
  };

  return (
    <div className="voice-search-container">
      <div className="voice-controls">
        <button
          className={`voice-btn ${isListening ? 'listening' : ''}`}
          onClick={toggleListening}
          title={isListening ? 'Arrêter l\'écoute' : 'Démarrer la recherche vocale'}
        >
          {isListening ? <FaMicrophoneSlash /> : <FaMicrophone />}
          {isListening && <span className="pulse-ring"></span>}
        </button>

        <button
          className="language-toggle-btn"
          onClick={toggleLanguage}
          title="Changer de langue"
        >
          <FaGlobe />
          <span>{language === 'fr-FR' ? 'FR' : 'EN'}</span>
        </button>
      </div>

      {(transcript || interimTranscript) && (
        <div className="voice-transcript">
          <div className="transcript-content">
            <span className="final-text">{transcript}</span>
            <span className="interim-text">{interimTranscript}</span>
          </div>
          {isListening && (
            <div className="listening-indicator">
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </div>
          )}
        </div>
      )}

      {isListening && (
        <div className="voice-hints">
          <p>💡 Exemples de commandes:</p>
          <ul>
            <li>"Je cherche un studio meublé à Bastos"</li>
            <li>"Appartement près du centre commercial"</li>
            <li>"Maison avec jardin moins de 100000 FCFA"</li>
            <li>"Logement proche de l'école internationale"</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default VoiceSearch;
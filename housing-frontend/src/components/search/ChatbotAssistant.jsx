// ============================================
// 📁 src/components/Search/ChatbotAssistant.jsx
// ============================================

import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, Send, Mic, MicOff, X, Minimize2, 
  Maximize2, Loader, Globe, ExternalLink 
} from 'lucide-react';
import { useVoiceRecording } from '../../hooks/useVoiceRecording';
import chatbotService from '../../services/chatbotService';
// import './ChatbotAssistant.css';
// import './Search.css';

const ChatbotAssistant = ({ onHousingClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const [language, setLanguage] = useState('fr');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const {
    isRecording,
    recordingTime,
    audioBlob,
    startRecording,
    stopRecording,
    cancelRecording,
    clearAudio,
  } = useVoiceRecording();

  // Auto-scroll vers le bas
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Message de bienvenue
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      addWelcomeMessage();
    }
  }, [isOpen, language]);

  // Traiter l'audio vocal
  useEffect(() => {
    if (audioBlob && !isRecording) {
      handleVoiceMessage();
    }
  }, [audioBlob, isRecording]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const addWelcomeMessage = () => {
    const welcomeText = language === 'fr'
      ? "Bonjour ! 👋 Je suis votre assistant virtuel pour la recherche de logements. Comment puis-je vous aider ?"
      : "Hello! 👋 I'm your virtual assistant for housing search. How can I help you?";

    setMessages([{
      id: Date.now(),
      role: 'assistant',
      content: welcomeText,
      timestamp: new Date(),
    }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    await sendMessage(inputMessage);
    setInputMessage('');
  };

  const sendMessage = async (text) => {
    // Ajouter message utilisateur
    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);

    setIsLoading(true);

    try {
      const result = await chatbotService.sendChatMessage(text, messages);

      // Sauvegarder session ID
      if (result.session_id && !sessionId) {
        setSessionId(result.session_id);
      }

      // Ajouter réponse assistant
      const assistantMessage = {
        id: result.message_id || Date.now() + 1,
        role: 'assistant',
        content: result.response || result.message,
        housings: result.housings || [],
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error('Chatbot error:', error);
      
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: language === 'fr'
          ? "Désolé, une erreur s'est produite. Veuillez réessayer."
          : "Sorry, an error occurred. Please try again.",
        isError: true,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceToggle = async () => {
    if (isRecording) {
      stopRecording();
    } else {
      try {
        await startRecording();
      } catch (error) {
        alert(
          language === 'fr'
            ? 'Impossible d\'accéder au microphone'
            : 'Cannot access microphone'
        );
      }
    }
  };

  const handleVoiceMessage = async () => {
    if (!audioBlob) return;

    setIsProcessingVoice(true);

    // Ajouter indicateur vocal
    const voiceIndicator = {
      id: Date.now(),
      role: 'user',
      content: language === 'fr' ? '🎤 Message vocal...' : '🎤 Voice message...',
      isVoice: true,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, voiceIndicator]);

    try {
      const result = await chatbotService.sendVoiceMessage(audioBlob, messages);

      if (result.success || result.transcription) {
        // Remplacer indicateur par transcription
        setMessages(prev => prev.map(msg => 
          msg.id === voiceIndicator.id
            ? { ...msg, content: result.transcription || result.text, isVoice: true }
            : msg
        ));

        // Sauvegarder session
        if (result.session_id && !sessionId) {
          setSessionId(result.session_id);
        }

        // Ajouter réponse
        const assistantMessage = {
          id: result.message_id || Date.now() + 1,
          role: 'assistant',
          content: result.response || result.message,
          housings: result.housings || [],
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        // Supprimer l'indicateur si échec
        setMessages(prev => prev.filter(msg => msg.id !== voiceIndicator.id));
        alert(
          language === 'fr'
            ? 'Impossible de comprendre l\'audio'
            : 'Could not understand audio'
        );
      }
    } catch (error) {
      console.error('Voice message error:', error);
      setMessages(prev => prev.filter(msg => msg.id !== voiceIndicator.id));
      
      // Message d'erreur pour feature non disponible
      const errorMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        content: language === 'fr'
          ? 'La fonctionnalité vocale sera bientôt disponible. Veuillez utiliser le chat texte.'
          : 'Voice feature coming soon. Please use text chat.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsProcessingVoice(false);
      clearAudio();
    }
  };

  const quickSuggestions = language === 'fr' ? [
    "Appartement 2 chambres à Yaoundé",
    "Studio près de l'université",
    "Maison avec jardin à Douala",
  ] : [
    "2 bedroom apartment in Yaounde",
    "Studio near university",
    "House with garden in Douala",
  ];

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleLanguage = () => {
    const newLang = language === 'fr' ? 'en' : 'fr';
    setLanguage(newLang);
    localStorage.setItem('chatbot_language', newLang);
  };

  if (!isOpen) {
    return (
      <button
        className="chatbot-trigger"
        onClick={() => setIsOpen(true)}
        title={language === 'fr' ? 'Ouvrir l\'assistant' : 'Open assistant'}
      >
        <MessageCircle size={24} />
        <span className="notification-dot"></span>
      </button>
    );
  }

  return (
    <div className={`chatbot-container ${isMinimized ? 'minimized' : ''}`}>
      {/* Header */}
      <div className="chatbot-header">
        <div className="header-left">
          <MessageCircle size={20} />
          <span className="header-title">
            {language === 'fr' ? 'Assistant Recherche' : 'Search Assistant'}
          </span>
        </div>

        <div className="header-right">
          <button
            className="header-btn language-btn"
            onClick={toggleLanguage}
            title={language === 'fr' ? 'Changer langue' : 'Change language'}
          >
            <Globe size={16} />
            <span>{language.toUpperCase()}</span>
          </button>

          <button
            className="header-btn"
            onClick={() => setIsMinimized(!isMinimized)}
            title={language === 'fr' ? 'Réduire' : 'Minimize'}
          >
            {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
          </button>

          <button
            className="header-btn close-btn"
            onClick={() => setIsOpen(false)}
            title={language === 'fr' ? 'Fermer' : 'Close'}
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Messages */}
      {!isMinimized && (
        <>
          <div className="chatbot-messages">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`message ${msg.role} ${msg.isError ? 'error' : ''}`}
              >
                <div className="message-content">
                  {msg.isVoice && (
                    <div className="voice-tag">
                      🎤 {language === 'fr' ? 'Vocal' : 'Voice'}
                    </div>
                  )}

                  <p className="message-text">{msg.content}</p>

                  {/* Logements recommandés */}
                  {msg.housings && msg.housings.length > 0 && (
                    <div className="recommended-housings">
                      <h4 className="recommendations-title">
                        {language === 'fr' 
                          ? `${msg.housings.length} logement(s) trouvé(s):` 
                          : `${msg.housings.length} housing(s) found:`}
                      </h4>

                      <div className="housing-cards">
                        {msg.housings.slice(0, 3).map(housing => (
                          <div 
                            key={housing.id} 
                            className="housing-card"
                            onClick={() => onHousingClick && onHousingClick(housing.id)}
                          >
                            {housing.main_image && (
                              <img 
                                src={housing.main_image} 
                                alt={housing.title}
                                className="housing-image"
                              />
                            )}
                            <div className="housing-info">
                              <h5 className="housing-title">{housing.title}</h5>
                              <p className="housing-price">
                                {housing.price?.toLocaleString()} FCFA
                              </p>
                              <p className="housing-location">
                                {housing.district_name}, {housing.city_name}
                              </p>
                              <div className="housing-features">
                                {housing.rooms && (
                                  <span>🛏️ {housing.rooms}</span>
                                )}
                                {housing.area && (
                                  <span>📏 {housing.area}m²</span>
                                )}
                              </div>
                              <button className="view-btn">
                                <ExternalLink size={14} />
                                {language === 'fr' ? 'Voir' : 'View'}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {msg.housings.length > 3 && (
                        <button className="view-all-btn">
                          {language === 'fr' 
                            ? `Voir tous les ${msg.housings.length} résultats` 
                            : `View all ${msg.housings.length} results`}
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div className="message-timestamp">
                  {msg.timestamp.toLocaleTimeString(
                    language === 'fr' ? 'fr-FR' : 'en-US',
                    { hour: '2-digit', minute: '2-digit' }
                  )}
                </div>
              </div>
            ))}

            {/* Indicateur de saisie */}
            {isLoading && (
              <div className="message assistant typing">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions rapides */}
          {messages.length <= 1 && (
            <div className="quick-suggestions">
              <p className="suggestions-title">
                {language === 'fr' ? 'Suggestions:' : 'Suggestions:'}
              </p>
              {quickSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  className="suggestion-btn"
                  onClick={() => sendMessage(suggestion)}
                  disabled={isLoading}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="chatbot-input">
            {isRecording && (
              <div className="recording-bar">
                <span className="recording-dot pulsing"></span>
                <span className="recording-text">
                  {language === 'fr' ? 'Enregistrement' : 'Recording'}
                  {' '}{formatTime(recordingTime)}
                </span>
                <button
                  className="cancel-btn"
                  onClick={cancelRecording}
                >
                  {language === 'fr' ? 'Annuler' : 'Cancel'}
                </button>
              </div>
            )}

            {isProcessingVoice && (
              <div className="processing-bar">
                <Loader className="spinner" size={16} />
                <span>
                  {language === 'fr' 
                    ? 'Traitement audio...' 
                    : 'Processing audio...'}
                </span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="input-form">
              <input
                ref={inputRef}
                type="text"
                className="message-input"
                placeholder={
                  language === 'fr'
                    ? 'Posez votre question...'
                    : 'Ask your question...'
                }
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                disabled={isLoading || isRecording || isProcessingVoice}
              />

              <button
                type="button"
                className={`voice-btn ${isRecording ? 'recording' : ''}`}
                onClick={handleVoiceToggle}
                disabled={isLoading || isProcessingVoice}
                title={language === 'fr' ? 'Message vocal' : 'Voice message'}
              >
                {isRecording ? (
                  <MicOff size={20} />
                ) : (
                  <Mic size={20} />
                )}
              </button>

              <button
                type="submit"
                className="send-btn"
                disabled={!inputMessage.trim() || isLoading || isRecording}
                title={language === 'fr' ? 'Envoyer' : 'Send'}
              >
                <Send size={20} />
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatbotAssistant;
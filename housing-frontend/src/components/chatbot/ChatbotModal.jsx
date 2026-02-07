// ============================================
// 📁 src/components/chatbot/ChatbotModal.jsx - VERSION AMÉLIORÉE
// ============================================

import { useState, useRef, useEffect } from "react";
import { chatbotSearch } from "../../services/chatbotService";
import "./ChatbotModal.css";

const ChatbotModal = ({ onClose, onResults }) => {
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      text: "👋 Bonjour ! Je suis votre assistant de recherche de logements. Comment puis-je vous aider ?",
      time: new Date()
    }
  ]);
  
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  
  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Auto-scroll vers le bas
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 🎤 Initialisation reconnaissance vocale
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = "fr-FR";
      recognition.interimResults = false;

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        setListening(false);
        
        // Auto-lancement
        setTimeout(() => {
          handleSendMessage(transcript);
        }, 500);
      };

      recognition.onerror = () => {
        setListening(false);
      };

      recognition.onend = () => {
        setListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  // 📤 Envoi de message
  const handleSendMessage = async (text = inputMessage) => {
    if (!text.trim()) return;

    const userMessage = {
      type: 'user',
      text: text.trim(),
      time: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setLoading(true);

    try {
      // ✅ Appel au nouveau backend intelligent
      const response = await chatbotSearch(
        text.trim(),
        conversationId,
        null // userId - peut être ajouté si user connecté
      );

      // Sauvegarder l'ID de conversation
      if (!conversationId && response.data.conversation_id) {
        setConversationId(response.data.conversation_id);
      }

      // Ajouter la réponse du bot
      const botMessage = {
        type: 'bot',
        text: response.data.bot_response,
        time: new Date(),
        filters: response.data.filters_detected,
        searchType: response.data.search_type,
        resultsCount: response.data.count
      };

      setMessages(prev => [...prev, botMessage]);

      // Sauvegarder les suggestions
      if (response.data.suggestions) {
        setSuggestions(response.data.suggestions);
      }

      // Envoyer les résultats au parent
      if (onResults && response.data.results) {
        onResults({
          results: response.data.results,
          count: response.data.count,
          filters: response.data.filters_detected,
          searchType: response.data.search_type,
          message: text.trim()
        });
      }

    } catch (error) {
      console.error("Erreur chatbot:", error);
      
      const errorMessage = {
        type: 'bot',
        text: "😕 Désolé, j'ai rencontré une erreur. Pouvez-vous reformuler votre demande ?",
        time: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  // 🎤 Démarrage vocal
  const startListening = () => {
    if (recognitionRef.current && !listening) {
      setInputMessage("");
      try {
        recognitionRef.current.start();
        setListening(true);
      } catch (err) {
        console.error("Erreur microphone:", err);
      }
    }
  };

  // ⌨️ Enter pour envoyer
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // 📌 Utiliser une suggestion
  const handleSuggestionClick = (suggestion) => {
    setInputMessage(suggestion);
    setSuggestions([]);
  };

  return (
    <div className="chatbot-modal-overlay" onClick={onClose}>
      <div className="chatbot-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="chatbot-header">
          <div className="chatbot-header-info">
            <span className="chatbot-icon">🤖</span>
            <div>
              <h3>Assistant de Recherche</h3>
              <p className="chatbot-status">
                {listening ? "🎤 En écoute..." : "En ligne"}
              </p>
            </div>
          </div>
          <button className="chatbot-close" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Messages */}
        <div className="chatbot-messages">
          {messages.map((msg, index) => (
            <div key={index} className={`message message-${msg.type}`}>
              <div className="message-bubble">
                <p>{msg.text}</p>
                
                {/* Afficher les filtres détectés */}
                {msg.filters && Object.keys(msg.filters).length > 0 && (
                  <div className="message-filters">
                    <small>🔍 Filtres détectés :</small>
                    {msg.filters.category && <span className="filter-tag">📦 {msg.filters.category}</span>}
                    {msg.filters.city && <span className="filter-tag">📍 {msg.filters.city}</span>}
                    {msg.filters.max_price && <span className="filter-tag">💰 Max {msg.filters.max_price} FCFA</span>}
                  </div>
                )}
                
                {/* Nombre de résultats */}
                {msg.resultsCount !== undefined && (
                  <small className="message-results">
                    ✨ {msg.resultsCount} résultat{msg.resultsCount > 1 ? 's' : ''} trouvé{msg.resultsCount > 1 ? 's' : ''}
                  </small>
                )}
              </div>
              <small className="message-time">
                {msg.time.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </small>
            </div>
          ))}

          {loading && (
            <div className="message message-bot">
              <div className="message-bubble">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestions */}
        {suggestions.length > 0 && !loading && (
          <div className="chatbot-suggestions">
            <small>💡 Suggestions :</small>
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                className="suggestion-btn"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="chatbot-input-container">
          <textarea
            className="chatbot-input"
            placeholder="Ex: Studio meublé à Yaoundé moins de 80000 FCFA"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={listening || loading}
            rows={2}
          />

          <div className="chatbot-actions">
            {recognitionRef.current && (
              <button
                className={`btn-voice ${listening ? 'listening' : ''}`}
                onClick={startListening}
                disabled={loading}
                title="Recherche vocale"
              >
                {listening ? '🔴' : '🎤'}
              </button>
            )}

            <button
              className="btn-send"
              onClick={() => handleSendMessage()}
              disabled={loading || listening || !inputMessage.trim()}
            >
              {loading ? '⏳' : '📤'}
            </button>
          </div>
        </div>

        {/* Exemples */}
        {messages.length === 1 && !loading && (
          <div className="chatbot-examples">
            <small>💡 Exemples de recherches :</small>
            <div className="examples-grid">
              <button onClick={() => setInputMessage("Studio meublé à Yaoundé")}>
                Studio meublé à Yaoundé
              </button>
              <button onClick={() => setInputMessage("Appartement 2 chambres à Douala moins de 150000")}>
                Appartement 2 chambres à Douala
              </button>
              <button onClick={() => setInputMessage("Logement près de l'université YaoundÉ 1")}>
                Près de l'université
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatbotModal;
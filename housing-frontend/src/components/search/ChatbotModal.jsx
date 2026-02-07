// ============================================
// 📁 src/components/Search/ChatbotModal.jsx
// ============================================

import { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Loader, MapPin, Lightbulb } from 'lucide-react';
import chatbotService from '../../services/chatbotService';
import searchService from '../../services/searchService';
import HousingCard from '../housing/HousingCard';
import './ChatbotModal.css'

/**
 * Modal Chatbot IA
 */
const ChatbotModal = ({ isOpen, onClose, onResultsFound }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const messagesEndRef = useRef(null);

  // Message de bienvenue
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        type: 'bot',
        text: "👋 Bonjour ! Je suis votre assistant de recherche. Décrivez-moi le logement que vous cherchez.",
        timestamp: new Date()
      }]);
      loadSuggestions();
    }
  }, [isOpen]);

  // Auto-scroll
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Charger suggestions
  const loadSuggestions = async () => {
    const sug = await chatbotService.getSuggestions();
    setSuggestions(sug.slice(0, 4));
  };

  // Obtenir position
  const getUserLocation = async () => {
    try {
      const location = await searchService.getUserLocation();
      setUserLocation(location);
      return location;
    } catch (error) {
      console.error('Erreur géolocalisation:', error);
      return null;
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (messageText = null) => {
    const text = messageText || input.trim();
    if (!text || loading) return;

    // Ajouter message utilisateur
    const userMessage = {
      type: 'user',
      text,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Obtenir coordonnées si disponibles
      let location = userLocation;
      if (!location) {
        location = await getUserLocation();
      }

      // Envoyer au chatbot
      const response = await chatbotService.sendMessage(text, {
        method: 'simple',
        lat: location?.lat,
        lng: location?.lng
      });

      // Ajouter réponse bot
      const botMessage = {
        type: 'bot',
        text: response.bot_response,
        criteria: response.criteria,
        results: response.results,
        count: response.count,
        suggestions: response.suggestions,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);

      // Notifier parent si résultats
      if (response.results && response.results.length > 0 && onResultsFound) {
        onResultsFound(response.results, response.criteria);
      }

    } catch (error) {
      const errorMessage = {
        type: 'bot',
        text: "Désolé, une erreur s'est produite. Pouvez-vous reformuler ?",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestionClick = (suggestion) => {
    handleSend(suggestion);
  };

  if (!isOpen) return null;

  return (
    <div className="chatbot-modal-overlay">
      <div className="chatbot-modal">
        {/* Header */}
        <div className="chatbot-header">
          <div className="chatbot-title">
            <MessageSquare size={24} />
            <h3>Assistant IA</h3>
          </div>
          <button onClick={onClose} className="close-button">
            <X size={24} />
          </button>
        </div>

        {/* Messages */}
        <div className="chatbot-messages">
          {messages.map((msg, index) => (
            <div key={index} className={`message message-${msg.type}`}>
              <div className="message-content">
                <p>{msg.text}</p>
                
                {/* Critères extraits */}
                {msg.criteria && (
                  <div className="criteria-badge">
                    {chatbotService.formatCriteria(msg.criteria)}
                  </div>
                )}

                {/* Résultats */}
                {msg.results && msg.results.length > 0 && (
                  <div className="results-preview">
                    <p className="results-count">
                      {msg.count} logement{msg.count > 1 ? 's' : ''} trouvé{msg.count > 1 ? 's' : ''}
                    </p>
                    <div className="results-list">
                      {msg.results.slice(0, 3).map((housing) => (
                        <div key={housing.id} className="mini-housing-card">
                          <img 
                            src={housing.main_image || '/placeholder.jpg'} 
                            alt={housing.title}
                          />
                          <div className="mini-card-info">
                            <h4>{housing.title}</h4>
                            <p className="price">{housing.price.toLocaleString()} FCFA/mois</p>
                            <p className="location">{housing.city_name}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    {msg.count > 3 && (
                      <p className="more-results">+{msg.count - 3} autres logements</p>
                    )}
                  </div>
                )}

                {/* Suggestions alternatives */}
                {msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="alternatives">
                    <p className="alternatives-title">
                      <Lightbulb size={16} />
                      Essayez aussi :
                    </p>
                    {msg.suggestions.map((sug, i) => (
                      <button
                        key={i}
                        onClick={() => handleSend(sug.text)}
                        className="alternative-button"
                      >
                        {sug.text}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <span className="message-time">
                {msg.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}

          {loading && (
            <div className="message message-bot">
              <div className="message-content">
                <Loader className="spinner" size={20} />
                <span>Recherche en cours...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestions rapides */}
        {messages.length === 1 && suggestions.length > 0 && (
          <div className="quick-suggestions">
            <p className="suggestions-title">Suggestions :</p>
            <div className="suggestions-grid">
              {suggestions.map((sug, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(sug)}
                  className="suggestion-chip"
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="chatbot-input">
          {userLocation && (
            <div className="location-indicator">
              <MapPin size={14} />
              <span>Géolocalisé</span>
            </div>
          )}
          <div className="input-wrapper">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ex: Studio meublé à Yaoundé pour 50 000 FCFA"
              rows="2"
              disabled={loading}
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || loading}
              className="send-button"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatbotModal;
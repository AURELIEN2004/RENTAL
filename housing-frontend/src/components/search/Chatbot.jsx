// ============================================
// src/components/search/Chatbot.jsx
// ============================================

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Chatbot.css';

const Chatbot = ({ onSearch }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      text: 'Bonjour! 👋 Je suis votre assistant de recherche. Comment puis-je vous aider à trouver le logement idéal?',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const parseUserIntent = (message) => {
    const lowerMessage = message.toLowerCase();
    
    const categories = {
      studio: ['studio', 'studiot'],
      chambre: ['chambre', 'room'],
      appartement: ['appartement', 'appart', 'apartment'],
      maison: ['maison', 'villa', 'house']
    };
    
    const types = {
      moderne: ['moderne', 'modern'],
      meuble: ['meublé', 'meuble', 'furnished'],
      simple: ['simple', 'basic']
    };
    
    const villes = ['yaoundé', 'yaounde', 'douala', 'bafoussam', 'bamenda'];
    const quartiers = ['bastos', 'odza', 'ngousso', 'essos', 'melen'];
    
    let category = null;
    let type = null;
    let city = null;
    let district = null;
    let priceMax = null;
    
    for (let [key, keywords] of Object.entries(categories)) {
      if (keywords.some(kw => lowerMessage.includes(kw))) {
        category = key;
        break;
      }
    }
    
    for (let [key, keywords] of Object.entries(types)) {
      if (keywords.some(kw => lowerMessage.includes(kw))) {
        type = key;
        break;
      }
    }
    
    villes.forEach(v => {
      if (lowerMessage.includes(v)) {
        city = v;
      }
    });
    
    quartiers.forEach(q => {
      if (lowerMessage.includes(q)) {
        district = q;
      }
    });
    
    const priceMatches = lowerMessage.match(/(\d+)\s*(k|000|fcfa)?/);
    if (priceMatches) {
      priceMax = parseInt(priceMatches[1]) * (priceMatches[2] === 'k' ? 1000 : 1);
    }
    
    return { category, type, city, district, priceMax };
  };

  const generateResponse = (intent) => {
    const { category, type, city, district, priceMax } = intent;
    
    let response = "J'ai bien compris votre recherche : ";
    const parts = [];
    
    if (category) parts.push(`${category}`);
    if (type) parts.push(`de type ${type}`);
    if (district) parts.push(`à ${district}`);
    else if (city) parts.push(`à ${city}`);
    if (priceMax) parts.push(`avec un budget max de ${priceMax.toLocaleString()} FCFA`);
    
    if (parts.length > 0) {
      response += parts.join(', ') + '.';
      response += '\n\n🔍 Je lance la recherche pour vous...';
      return { response, hasResults: true, intent };
    } else {
      return {
        response: "Je n'ai pas bien compris votre demande. Pouvez-vous préciser ? Par exemple : 'Je cherche un studio meublé à Bastos' ou 'Appartement moderne à Yaoundé'",
        hasResults: false
      };
    }
  };

  const getSuggestions = () => {
    return [
      "Studio meublé à Bastos",
      "Appartement moderne à Yaoundé",
      "Chambre pas chère",
      "Maison avec jardin",
      "Logement près de l'université"
    ];
  };

  const handleSend = async () => {
    if (!inputValue.trim()) return;
    
    const userMessage = {
      type: 'user',
      text: inputValue,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const intent = parseUserIntent(inputValue);
    const { response, hasResults, intent: searchIntent } = generateResponse(intent);
    
    const botMessage = {
      type: 'bot',
      text: response,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, botMessage]);
    setIsTyping(false);
    
    if (hasResults && onSearch) {
      setTimeout(() => {
        onSearch(searchIntent);
        setIsOpen(false);
      }, 1500);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const resetChat = () => {
    setMessages([
      {
        type: 'bot',
        text: 'Conversation réinitialisée. Comment puis-je vous aider?',
        timestamp: new Date()
      }
    ]);
  };

  return (
    <div className={`chatbot-container ${isOpen ? 'open' : ''}`}>
      <button 
        className="chatbot-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Ouvrir l'assistant"
      >
        {isOpen ? '✕' : '💬'}
      </button>
      
      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <div className="header-info">
              <div className="bot-avatar">🤖</div>
              <div>
                <h3>Assistant de Recherche</h3>
                <span className="status">En ligne</span>
              </div>
            </div>
            <button className="reset-btn" onClick={resetChat} title="Réinitialiser">
              🔄
            </button>
          </div>
          
          <div className="chatbot-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`message ${msg.type}`}>
                {msg.type === 'bot' && <div className="message-avatar">🤖</div>}
                <div className="message-content">
                  <div className="message-text">{msg.text}</div>
                  <div className="message-time">
                    {msg.timestamp.toLocaleTimeString('fr-FR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
                {msg.type === 'user' && <div className="message-avatar user">👤</div>}
              </div>
            ))}
            
            {isTyping && (
              <div className="message bot">
                <div className="message-avatar">🤖</div>
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
          
          {messages.length <= 2 && (
            <div className="quick-suggestions">
              <p>Suggestions:</p>
              <div className="suggestions-list">
                {getSuggestions().map((suggestion, idx) => (
                  <button
                    key={idx}
                    className="suggestion-btn"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          <div className="chatbot-input">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Décrivez le logement que vous recherchez..."
              rows="2"
            />
            <button 
              className="send-btn"
              onClick={handleSend}
              disabled={!inputValue.trim()}
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
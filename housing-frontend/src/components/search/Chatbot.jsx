// ============================================
// src/components/search/chatbot.jsx
// ============================================

import React, { useState, useRef, useEffect } from 'react';
import { FaTimes, FaRobot, FaPaperPlane } from 'react-icons/fa';

const IntelligentChatbot = ({ onSearch }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      text: "👋 Bonjour ! Je suis votre assistant de recherche. Décrivez-moi le logement que vous recherchez. Par exemple : 'Je cherche un studio meublé à Bastos pour 50000 FCFA'",
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

  // 🧠 Intelligence du Chatbot
  const parseUserIntent = (message) => {
    const lowerMessage = message.toLowerCase();
    const filters = {};

    // Catégories
    const categoryMap = {
      'studio': 1,
      'chambre': 2,
      'appartement': 3,
      'maison': 4
    };

    for (const [keyword, id] of Object.entries(categoryMap)) {
      if (lowerMessage.includes(keyword)) {
        filters.category = id;
        break;
      }
    }

    // Types
    const typeMap = {
      'simple': 1,
      'moderne': 2,
      'meublé': 3,
      'meuble': 3
    };

    for (const [keyword, id] of Object.entries(typeMap)) {
      if (lowerMessage.includes(keyword)) {
        filters.housingType = id;
        break;
      }
    }

    // Villes
    const cityMap = {
      'yaoundé': 1,
      'yaounde': 1,
      'douala': 2,
      'bafoussam': 3
    };

    for (const [keyword, id] of Object.entries(cityMap)) {
      if (lowerMessage.includes(keyword)) {
        filters.city = id;
        break;
      }
    }

    // Quartiers (Yaoundé)
    const districtMap = {
      'bastos': 1,
      'odza': 2,
      'melen': 3,
      'essos': 4,
      'ngousso': 5
    };

    for (const [keyword, id] of Object.entries(districtMap)) {
      if (lowerMessage.includes(keyword)) {
        filters.district = id;
        break;
      }
    }

    // Prix
    const priceMatches = lowerMessage.match(/(\d+)\s*(k|000|fcfa)?/g);
    if (priceMatches) {
      const prices = priceMatches.map(p => {
        const num = parseInt(p.replace(/[^\d]/g, ''));
        return p.includes('k') ? num * 1000 : num;
      });

      if (prices.length === 1) {
        filters.maxPrice = prices[0];
      } else if (prices.length >= 2) {
        filters.minPrice = Math.min(...prices);
        filters.maxPrice = Math.max(...prices);
      }
    }

    // Chambres
    const roomsMatch = lowerMessage.match(/(\d+)\s*(chambre|room|piece)/);
    if (roomsMatch) {
      filters.rooms = parseInt(roomsMatch[1]);
    }

    // Douches
    const bathroomsMatch = lowerMessage.match(/(\d+)\s*(douche|salle de bain|bathroom)/);
    if (bathroomsMatch) {
      filters.bathrooms = parseInt(bathroomsMatch[1]);
    }

    // Superficie
    const areaMatch = lowerMessage.match(/(\d+)\s*m[²2]/);
    if (areaMatch) {
      filters.minArea = parseInt(areaMatch[1]);
    }

    // Mots-clés de tri
    if (lowerMessage.includes('pas cher') || lowerMessage.includes('moins cher')) {
      filters.sortBy = 'price_asc';
    } else if (lowerMessage.includes('grand') || lowerMessage.includes('spacieux')) {
      filters.sortBy = 'area_desc';
    } else if (lowerMessage.includes('récent') || lowerMessage.includes('nouveau')) {
      filters.sortBy = 'recent';
    }

    return filters;
  };

  const generateResponse = (filters) => {
    const parts = [];
    
    // Catégorie
    if (filters.category) {
      const categories = ['', 'studio', 'chambre', 'appartement', 'maison'];
      parts.push(categories[filters.category]);
    }

    // Type
    if (filters.housingType) {
      const types = ['', 'simple', 'moderne', 'meublé'];
      parts.push(types[filters.housingType]);
    }

    // Localisation
    if (filters.district) {
      const districts = ['', 'Bastos', 'Odza', 'Melen', 'Essos', 'Ngousso'];
      parts.push(`à ${districts[filters.district]}`);
    } else if (filters.city) {
      const cities = ['', 'Yaoundé', 'Douala', 'Bafoussam'];
      parts.push(`à ${cities[filters.city]}`);
    }

    // Prix
    if (filters.minPrice && filters.maxPrice) {
      parts.push(`entre ${filters.minPrice.toLocaleString()} et ${filters.maxPrice.toLocaleString()} FCFA`);
    } else if (filters.maxPrice) {
      parts.push(`jusqu'à ${filters.maxPrice.toLocaleString()} FCFA`);
    }

    // Chambres/Douches
    if (filters.rooms) {
      parts.push(`${filters.rooms} chambre${filters.rooms > 1 ? 's' : ''}`);
    }
    if (filters.bathrooms) {
      parts.push(`${filters.bathrooms} douche${filters.bathrooms > 1 ? 's' : ''}`);
    }

    if (parts.length === 0) {
      return {
        response: "Je n'ai pas bien compris votre recherche. Pouvez-vous préciser ? Par exemple : 'Studio meublé à Bastos' ou 'Appartement moderne moins de 100000 FCFA'",
        hasResults: false
      };
    }

    return {
      response: `✓ Parfait ! Je recherche : ${parts.join(', ')}.\n\n🔍 Lancement de la recherche...`,
      hasResults: true,
      filters
    };
  };

  const getSuggestions = () => [
    "Studio meublé à Bastos",
    "Appartement moderne à Yaoundé moins de 100000 FCFA",
    "Chambre pas chère près de l'université",
    "Maison avec jardin à Douala",
    "Studio récent à Odza"
  ];

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    // Message utilisateur
    const userMessage = {
      type: 'user',
      text: inputValue,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simuler délai de traitement
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Parser l'intention
    const filters = parseUserIntent(inputValue);
    const { response, hasResults, filters: searchFilters } = generateResponse(filters);

    // Réponse du bot
    const botMessage = {
      type: 'bot',
      text: response,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, botMessage]);
    setIsTyping(false);

    // Lancer la recherche si résultats trouvés
    if (hasResults && onSearch) {
      setTimeout(() => {
        onSearch(searchFilters);
        setIsOpen(false);
      }, 1500);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 1000
    }}>
      {/* Bouton d'ouverture */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px',
            transition: 'all 0.3s',
            animation: 'pulse 2s infinite'
          }}
          onMouseOver={(e) => e.target.style.transform = 'scale(1.1)'}
          onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
        >
          <FaRobot />
        </button>
      )}

      {/* Fenêtre du chatbot */}
      {isOpen && (
        <div style={{
          width: '380px',
          height: '600px',
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{
            padding: '20px',
            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px'
              }}>
                🤖
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>
                  Assistant RentAL
                </h3>
                <p style={{ margin: 0, fontSize: '12px', opacity: 0.9 }}>
                  En ligne
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255,255,255,0.2)',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <FaTimes />
            </button>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1,
            padding: '20px',
            overflowY: 'auto',
            backgroundColor: '#f9fafb'
          }}>
            {messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: msg.type === 'user' ? 'flex-end' : 'flex-start',
                  marginBottom: '16px'
                }}
              >
                {msg.type === 'bot' && (
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: '#2563eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '8px',
                    fontSize: '16px'
                  }}>
                    🤖
                  </div>
                )}
                
                <div style={{
                  maxWidth: '75%',
                  padding: '12px 16px',
                  borderRadius: '16px',
                  backgroundColor: msg.type === 'user' ? '#2563eb' : 'white',
                  color: msg.type === 'user' ? 'white' : '#374151',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  fontSize: '14px',
                  lineHeight: '1.5',
                  whiteSpace: 'pre-wrap'
                }}>
                  {msg.text}
                  <div style={{
                    fontSize: '11px',
                    marginTop: '4px',
                    opacity: 0.7
                  }}>
                    {formatTime(msg.timestamp)}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#2563eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px'
                }}>
                  🤖
                </div>
                <div style={{
                  padding: '12px 16px',
                  borderRadius: '16px',
                  backgroundColor: 'white',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {[0, 1, 2].map(i => (
                      <div
                        key={i}
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: '#9ca3af',
                          animation: `bounce 1.4s infinite ease-in-out`,
                          animationDelay: `${i * 0.16}s`
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions */}
          {messages.length <= 2 && (
            <div style={{ padding: '12px 20px', backgroundColor: '#f3f4f6' }}>
              <p style={{
                margin: '0 0 8px 0',
                fontSize: '12px',
                fontWeight: '500',
                color: '#6b7280'
              }}>
                Suggestions :
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {getSuggestions().map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => setInputValue(suggestion)}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '13px',
                      color: '#374151',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => e.target.style.borderColor = '#2563eb'}
                    onMouseOut={(e) => e.target.style.borderColor = '#e5e7eb'}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div style={{
            padding: '16px',
            borderTop: '1px solid #e5e7eb',
            backgroundColor: 'white'
          }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Décrivez votre recherche..."
                rows="1"
                style={{
                  flex: 1,
                  padding: '12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '14px',
                  resize: 'none',
                  outline: 'none',
                  fontFamily: 'inherit'
                }}
                onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
              <button
                onClick={handleSend}
                disabled={!inputValue.trim()}
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  backgroundColor: inputValue.trim() ? '#2563eb' : '#e5e7eb',
                  color: 'white',
                  border: 'none',
                  cursor: inputValue.trim() ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  transition: 'all 0.2s'
                }}
              >
                <FaPaperPlane />
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
          }
          50% {
            box-shadow: 0 4px 20px rgba(37, 99, 235, 0.6);
          }
        }

        @keyframes bounce {
          0%, 80%, 100% {
            transform: scale(0);
          }
          40% {
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default IntelligentChatbot;
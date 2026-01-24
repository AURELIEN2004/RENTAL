import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, X, Volume2, Globe, MapPin, Home as HomeIcon } from 'lucide-react';

const IntelligentChatbot = ({ onSearch }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      text: "👋 Bonjour ! Je suis votre assistant de recherche intelligent. Vous pouvez me parler en français ou en anglais pour trouver le logement parfait. Essayez : 'Je cherche un studio meublé près d'une école' ou 'Apartment near supermarket'",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [language, setLanguage] = useState('fr-FR');
  const [transcript, setTranscript] = useState('');
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = language;

      recognitionRef.current.onstart = () => setIsListening(true);
      recognitionRef.current.onend = () => setIsListening(false);

      recognitionRef.current.onresult = (event) => {
        let interimText = '';
        let finalText = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptPart = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalText += transcriptPart;
          } else {
            interimText += transcriptPart;
          }
        }

        setTranscript(interimText);
        
        if (finalText) {
          setInputValue(finalText);
          handleSend(finalText);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [language]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      addMessage('bot', "❌ Désolé, votre navigateur ne supporte pas la reconnaissance vocale.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.lang = language;
      recognitionRef.current.start();
    }
  };

  const toggleLanguage = () => {
    const newLang = language === 'fr-FR' ? 'en-US' : 'fr-FR';
    setLanguage(newLang);
    if (recognitionRef.current) {
      recognitionRef.current.lang = newLang;
    }
    addMessage('bot', `🌍 Langue changée : ${newLang === 'fr-FR' ? 'Français' : 'English'}`);
  };

  const addMessage = (type, text) => {
    setMessages(prev => [...prev, {
      type,
      text,
      timestamp: new Date()
    }]);
  };

  const parseUserIntent = (message) => {
    const lowerMessage = message.toLowerCase();
    const filters = {};

    // Categories (bilingue)
    const categoryMap = {
      'studio': 1, 'studios': 1,
      'chambre': 2, 'chambres': 2, 'room': 2, 'bedroom': 2,
      'appartement': 3, 'appartements': 3, 'apartment': 3, 'flat': 3,
      'maison': 4, 'maisons': 4, 'house': 4, 'villa': 4
    };

    for (const [keyword, id] of Object.entries(categoryMap)) {
      if (lowerMessage.includes(keyword)) {
        filters.category = id;
        break;
      }
    }

    // Types (bilingue)
    const typeMap = {
      'simple': 1, 'basic': 1,
      'moderne': 2, 'modern': 2, 'contemporary': 2,
      'meublé': 3, 'meuble': 3, 'furnished': 3, 'equipped': 3
    };

    for (const [keyword, id] of Object.entries(typeMap)) {
      if (lowerMessage.includes(keyword)) {
        filters.housing_type = id;
        break;
      }
    }

    // Cities (bilingue)
    const cityMap = {
      'yaoundé': 1, 'yaounde': 1,
      'douala': 2,
      'bafoussam': 3
    };

    for (const [keyword, id] of Object.entries(cityMap)) {
      if (lowerMessage.includes(keyword)) {
        filters.city = id;
        break;
      }
    }

    // Points of Interest (POI) - bilingue
    const poiPatterns = {
      'école': /(?:près|proche|autour|around|near|close to).*(?:école|school|university|université|campus)/i,
      'marché': /(?:près|proche|autour|around|near|close to).*(?:marché|market|supermarket|supermarch[ée]|mall|shopping)/i,
      'hôpital': /(?:près|proche|autour|around|near|close to).*(?:hôpital|hospital|clinic|clinique|medical center)/i,
      'centre': /(?:près|proche|autour|around|near|close to).*(?:centre|center|downtown|city center)/i
    };

    for (const [poi, pattern] of Object.entries(poiPatterns)) {
      if (pattern.test(lowerMessage)) {
        filters.poi = poi;
        break;
      }
    }

    // Prix (bilingue)
    const priceMatches = lowerMessage.match(/(\d+)\s*(k|000|fcfa)?/g);
    if (priceMatches) {
      const prices = priceMatches.map(p => {
        const num = parseInt(p.replace(/[^\d]/g, ''));
        return p.includes('k') ? num * 1000 : num;
      });

      if (prices.length === 1) {
        if (lowerMessage.match(/(moins|max|maximum|under|less)/)) {
          filters.max_price = prices[0];
        } else if (lowerMessage.match(/(plus|min|minimum|above|more)/)) {
          filters.min_price = prices[0];
        } else {
          filters.max_price = prices[0];
        }
      } else if (prices.length >= 2) {
        filters.min_price = Math.min(...prices);
        filters.max_price = Math.max(...prices);
      }
    }

    // Chambres/Rooms
    const roomsMatch = lowerMessage.match(/(\d+)\s*(chambre|room|bedroom)/i);
    if (roomsMatch) {
      filters.rooms = parseInt(roomsMatch[1]);
    }

    return filters;
  };

  const generateResponse = (filters) => {
    const parts = [];
    
    if (filters.category) {
      const categories = ['', 'studio', 'chambre', 'appartement', 'maison'];
      parts.push(categories[filters.category]);
    }

    if (filters.housing_type) {
      const types = ['', 'simple', 'moderne', 'meublé'];
      parts.push(types[filters.housing_type]);
    }

    if (filters.poi) {
      parts.push(`près d'${filters.poi === 'école' ? 'une école' : 'un ' + filters.poi}`);
    }

    if (filters.city) {
      const cities = ['', 'Yaoundé', 'Douala', 'Bafoussam'];
      parts.push(`à ${cities[filters.city]}`);
    }

    if (filters.min_price && filters.max_price) {
      parts.push(`entre ${filters.min_price.toLocaleString()} et ${filters.max_price.toLocaleString()} FCFA`);
    } else if (filters.max_price) {
      parts.push(`jusqu'à ${filters.max_price.toLocaleString()} FCFA`);
    } else if (filters.min_price) {
      parts.push(`à partir de ${filters.min_price.toLocaleString()} FCFA`);
    }

    if (filters.rooms) {
      parts.push(`${filters.rooms} chambre${filters.rooms > 1 ? 's' : ''}`);
    }

    if (parts.length === 0) {
      return {
        response: language === 'fr-FR'
          ? "Je n'ai pas bien compris. Pouvez-vous préciser ? Ex: 'Studio meublé près d'une école'"
          : "I didn't understand. Can you clarify? Ex: 'Furnished studio near a school'",
        hasResults: false
      };
    }

    return {
      response: `✓ ${language === 'fr-FR' ? 'Parfait ! Je recherche' : 'Perfect! Searching for'} : ${parts.join(', ')}.\n\n🔍 ${language === 'fr-FR' ? 'Lancement de la recherche...' : 'Starting search...'}`,
      hasResults: true,
      filters
    };
  };

  const getSuggestions = () => {
    return language === 'fr-FR' ? [
      "Studio meublé près d'une école",
      "Appartement moderne près du centre commercial",
      "Chambre pas chère près de l'université",
      "Maison avec jardin à Douala"
    ] : [
      "Furnished studio near school",
      "Modern apartment near shopping center",
      "Cheap room near university",
      "House with garden in Douala"
    ];
  };

  const handleSend = async (text = inputValue) => {
    if (!text.trim()) return;

    const userMessage = text;
    addMessage('user', userMessage);
    setInputValue('');
    setTranscript('');
    setIsTyping(true);

    await new Promise(resolve => setTimeout(resolve, 1000));

    const filters = parseUserIntent(userMessage);
    const { response, hasResults, filters: searchFilters } = generateResponse(filters);

    addMessage('bot', response);
    setIsTyping(false);

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
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
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
          🤖
        </button>
      )}

      {isOpen && (
        <div style={{
          width: '400px',
          height: '650px',
          backgroundColor: 'white',
          borderRadius: '20px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{
            padding: '20px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
                  🎤 {language === 'fr-FR' ? 'Français' : 'English'}
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={toggleLanguage}
                style={{
                  width: '36px',
                  height: '36px',
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
                <Globe size={18} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  width: '36px',
                  height: '36px',
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
                <X size={18} />
              </button>
            </div>
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
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '8px',
                    fontSize: '16px',
                    flexShrink: 0
                  }}>
                    🤖
                  </div>
                )}
                
                <div style={{
                  maxWidth: '75%',
                  padding: '12px 16px',
                  borderRadius: '16px',
                  backgroundColor: msg.type === 'user' 
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                    : 'white',
                  color: msg.type === 'user' ? 'white' : '#374151',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  fontSize: '14px',
                  lineHeight: '1.5',
                  whiteSpace: 'pre-wrap',
                  background: msg.type === 'user' 
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                    : 'white'
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
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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

            {isListening && transcript && (
              <div style={{
                padding: '12px',
                backgroundColor: '#fef3c7',
                borderRadius: '8px',
                marginTop: '8px',
                fontSize: '14px'
              }}>
                🎤 {transcript}
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
                💡 Suggestions :
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
                    onMouseOver={(e) => e.target.style.borderColor = '#667eea'}
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
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button
                onClick={toggleVoiceInput}
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: isListening ? '#ef4444' : '#667eea',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s',
                  animation: isListening ? 'pulse 1s infinite' : 'none'
                }}
              >
                {isListening ? <MicOff size={20} /> : <Mic size={20} />}
              </button>
              
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={language === 'fr-FR' ? "Décrivez votre recherche..." : "Describe your search..."}
                style={{
                  flex: 1,
                  padding: '12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '14px',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
              
              <button
                onClick={() => handleSend()}
                disabled={!inputValue.trim()}
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: inputValue.trim() 
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                    : '#e5e7eb',
                  color: 'white',
                  border: 'none',
                  cursor: inputValue.trim() ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s'
                }}
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
          }
          50% {
            box-shadow: 0 8px 32px rgba(102, 126, 234, 0.6);
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
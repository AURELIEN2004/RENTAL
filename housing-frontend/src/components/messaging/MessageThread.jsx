// ============================================
// src/components/messaging/MessageThread.jsx
// ============================================


import React, { useState, useEffect, useRef, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { getMessages, markAsRead } from '../../services/api';
import MessageInput from './MessageInput';
import Loading from '../common/Loading';
import './MessageThread.css';

const MessageThread = ({ conversation }) => {
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  useEffect(() => {
    if (conversation) {
      fetchMessages();
      markConversationAsRead();
    }
  }, [conversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const data = await getMessages(conversation.id);
      setMessages(data);
    } catch (error) {
      console.error('Erreur chargement messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const markConversationAsRead = async () => {
    try {
      await markAsRead(conversation.id);
    } catch (error) {
      console.error('Erreur marquage lu:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (newMessage) => {
    setMessages(prev => [...prev, newMessage]);
  };

  const getOtherParticipant = () => {
    return conversation.participants.find(p => p.id !== user.id);
  };

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatMessageDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Aujourd'hui";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Hier';
    } else {
      return date.toLocaleDateString('fr-FR', { 
        day: 'numeric', 
        month: 'long',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const shouldShowDateSeparator = (currentMsg, prevMsg) => {
    if (!prevMsg) return true;
    const currentDate = new Date(currentMsg.created_at).toDateString();
    const prevDate = new Date(prevMsg.created_at).toDateString();
    return currentDate !== prevDate;
  };

  const otherUser = getOtherParticipant();

  if (!conversation) {
    return (
      <div className="message-thread empty">
        <div className="empty-thread">
          <div className="empty-icon">💬</div>
          <h3>Sélectionnez une conversation</h3>
          <p>Choisissez une conversation dans la liste pour commencer à échanger</p>
        </div>
      </div>
    );
  }

  return (
    <div className="message-thread">
      <div className="thread-header">
        <div className="header-user-info">
          <img 
            src={otherUser?.photo || '/default-avatar.png'} 
            alt={otherUser?.username}
            className="header-avatar"
          />
          <div>
            <h3>{otherUser?.username}</h3>
            {conversation.housing && (
              <div className="header-housing">
                🏠 {conversation.housing.title}
              </div>
            )}
          </div>
        </div>
        <div className="header-actions">
          <button 
            className="action-icon-btn"
            onClick={() => window.open(`/logement/${conversation.housing?.id}`, '_blank')}
            title="Voir le logement"
          >
            🏠
          </button>
          <button 
            className="action-icon-btn"
            onClick={() => window.open(`tel:${otherUser?.phone}`, '_blank')}
            title="Appeler"
          >
            📞
          </button>
        </div>
      </div>

      {conversation.housing && (
        <div className="housing-context">
          <div className="context-image">
            <img 
              src={conversation.housing.images?.[0]?.image || '/placeholder.png'} 
              alt={conversation.housing.title}
            />
          </div>
          <div className="context-info">
            <h4>{conversation.housing.title}</h4>
            <p className="context-category">
              {conversation.housing.category?.name} • {conversation.housing.housing_type?.name}
            </p>
            <p className="context-price">
              {conversation.housing.price.toLocaleString()} FCFA/mois
            </p>
            <a 
              href={`/logement/${conversation.housing.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="view-details-btn"
            >
              Voir les détails →
            </a>
          </div>
        </div>
      )}

      <div className="messages-container" ref={messagesContainerRef}>
        {loading ? (
          <Loading message="Chargement des messages..." />
        ) : (
          <>
            {messages.map((message, index) => {
              const showDate = shouldShowDateSeparator(message, messages[index - 1]);
              const isMine = message.sender.id === user.id;

              return (
                <React.Fragment key={message.id}>
                  {showDate && (
                    <div className="date-separator">
                      <span>{formatMessageDate(message.created_at)}</span>
                    </div>
                  )}
                  
                  <div className={`message-bubble ${isMine ? 'mine' : 'theirs'}`}>
                    {!isMine && (
                      <img 
                        src={message.sender.photo || '/default-avatar.png'}
                        alt={message.sender.username}
                        className="message-avatar"
                      />
                    )}
                    
                    <div className="bubble-content">
                      {message.image && (
                        <div className="message-image">
                          <img 
                            src={message.image} 
                            alt="Message" 
                            onClick={() => window.open(message.image, '_blank')}
                          />
                        </div>
                      )}
                      
                      {message.video && (
                        <div className="message-video">
                          <video controls>
                            <source src={message.video} type="video/mp4" />
                          </video>
                        </div>
                      )}
                      
                      {message.content && (
                        <div className="bubble-text">
                          {message.content}
                        </div>
                      )}
                      
                      <div className="bubble-time">
                        {formatMessageTime(message.created_at)}
                        {isMine && (
                          <span className="read-status">
                            {message.is_read ? '✓✓' : '✓'}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {isMine && (
                      <img 
                        src={user.photo || '/default-avatar.png'}
                        alt="Vous"
                        className="message-avatar"
                      />
                    )}
                  </div>
                </React.Fragment>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <MessageInput 
        conversationId={conversation.id} 
        onSendMessage={handleSendMessage}
      />
    </div>
  );
};

export default MessageThread;
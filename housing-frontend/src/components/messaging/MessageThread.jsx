
// src/components/messaging/MessageThread.jsx - VERSION AMÉLIORÉE

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { housingService } from '../../services/housingService';
import MessageInput from './MessageInput';
import { FaPhone, FaVideo, FaEllipsisV, FaHome,FaArrowLeft } from 'react-icons/fa';
import { toast } from 'react-toastify';
import './MessageThread.css';
import { useTheme } from '../../contexts/ThemeContext';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

const MessageThread = ({ conversation, onNewMessage,onBack }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
//  const [showContext, setShowContext] = useState(false); // Fermé par défaut sur mobile pour gagner de la place
const [showContext, setShowContext] = useState(window.innerWidth > 768);
  const { t, language, theme } = useTheme();

  useEffect(() => {
    if (conversation) {
      loadMessages();
      // Marquer comme lu
      markAsRead();
    }
  }, [conversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const data = await housingService.getMessages(conversation.id);
      const msgs = Array.isArray(data) ? data : data.results || [];
      setMessages(msgs);
    } catch (error) {
      console.error('Erreur chargement messages:', error);
      toast.error('Erreur lors du chargement des messages');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async () => {
    try {
      // Endpoint à implémenter côté backend si nécessaire
      // await housingService.markConversationAsRead(conversation.id);
    } catch (error) {
      console.error('Erreur marquage lu:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (newMessage) => {
    setMessages(prev => [...prev, newMessage]);
    if (onNewMessage) {
      onNewMessage();
    }
  };

  const getOtherParticipant = () => {
    return conversation.participants?.find(p => p.id !== user.id) || {};
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

  return (
    <div className="message-thread">
      {/* Header */}
      <div className="thread-header">
        <div className="header-user-info">
          {/* BOUTON RETOUR : Visible uniquement sur mobile via CSS */}
    <button className="mobile-back-btn" onClick={onBack}>
      <FaArrowLeft />
    </button>
          <img 
            src={otherUser?.photo || '/default-avatar.png'} 
            // alt={otherUser?.username || 'Utilisateur'}
            alt={otherUser?.username || t("messages_user_default")}
            className="header-avatar"
            onError={(e) => e.target.src = '/default-avatar.png'}
          />
          <div>
            <h3>{otherUser?.username || 'Utilisateur'}</h3>
            {conversation.housing && (
              <div className="header-housing">
                        <FaHome className="context-home-icon" />
 {conversation.housing.title}
              </div>
            )}
          </div>
        </div>
        <div className="header-actions">
          {conversation.housing && (
            <button 
              className="action-icon-btn"
              onClick={() => window.open(`/housing/${conversation.housing.id}`, '_blank')}
              title={t("messages_view_housing")}
            >
              <FaHome />
            </button>
          )}
          {otherUser?.phone && (
            <button 
              className="action-icon-btn"
              onClick={() => window.open(`tel:${otherUser.phone}`)}
              title={t("messages_call")}
            >
              <FaPhone />
            </button>
          )}
          <button 
            className="action-icon-btn"
            title={t("messages_more_options")}
          >
            <FaEllipsisV />
          </button>
        </div>
      </div>

      {/* Contexte logement
      {conversation.housing && (
        <div className="housing-context">
          <div className="context-image">
            <img 
              src={conversation.housing.main_image || '/placeholder.jpg'} 
              alt={conversation.housing.title}
              onError={(e) => e.target.src = '/placeholder.jpg'}
            />
          </div>
          <div className="context-info">
            <h4>{conversation.housing.title}</h4>
            <p className="context-category">
              {conversation.housing.category_name} • {conversation.housing.type_name}
            </p>
            <p className="context-price">
              {conversation.housing.price?.toLocaleString()} FCFA/mois
            </p>
            <a 
              href={`/housing/${conversation.housing.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="view-details-btn"
            >
              {t("messages_housing_details")} →
            </a>
          </div>
        </div>
      )}
 */}
{/* Contexte logement optimisé */}
      {/* {conversation.housing && (
        <div className={`housing-context ${showContext ? 'expanded' : 'collapsed'}`}>
          <div className="context-toggle" onClick={() => setShowContext(!showContext)}>
            <span>🏠 {conversation.housing.title}</span>
            {showContext ? <FaChevronUp /> : <FaChevronDown />}
          </div>
          
          {showContext && (
            <div className="context-details-mobile">
              <div className="context-image">
                <img src={conversation.housing.main_image || '/placeholder.jpg'} alt="" />
              </div>
              <div className="context-info">
                <p className="context-price">{conversation.housing.price?.toLocaleString()} FCFA/mois</p>
                <a href={`/housing/${conversation.housing.id}`} className="view-details-btn">
                  {t("messages_housing_details")} →
                </a>
              </div>
            </div>
          )}
        </div>
      )} */}

      {/* Contexte logement optimisé */}
{conversation.housing && (
  <div className={`housing-context ${showContext ? 'expanded' : 'collapsed'}`}>
    
    {/* Bandeau de contrôle Universel (Web + Mobile) */}
    <div className="context-header-toggle" onClick={() => setShowContext(!showContext)}>
      <div className="toggle-title">
        <FaHome className="context-home-icon" />
        <span>{conversation.housing.title}</span>
      </div>
      <div className="toggle-icon">
        {showContext ? <FaChevronUp /> : <FaChevronDown />}
      </div>
    </div>
    
    {/* Contenu qui se plie et se déplie */}
    <div className="context-content-wrapper">
      <div className="context-image">
        <img 
          src={conversation.housing.main_image || '/placeholder.jpg'} 
          alt={conversation.housing.title}
          onError={(e) => e.target.src = '/placeholder.jpg'}
        />
      </div>
      <div className="context-info">
        <h4>{conversation.housing.title}</h4>
        <p className="context-category">
          {conversation.housing.category_name} • {conversation.housing.type_name}
        </p>
        <p className="context-price">
          {conversation.housing.price?.toLocaleString()} FCFA/mois
        </p>
        <a 
          href={`/housing/${conversation.housing.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="view-details-btn"
        >
          {t("messages_housing_details")} →
        </a>
      </div>
    </div>
  </div>
)}


      {/* Messages */}
      <div className="messages-container">
        {loading ? (
          <div className="messages-loading">
            <div className="spinner"></div>
            <p>{t("messages_loading_messages")}</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="no-messages">
            <div className="empty-icon">💬</div>
            {/* <p>Aucun message pour le moment</p> */}
            <p>{t("messages_no_messages")}</p>

<p className="text-muted">
{t("messages_start_conversation")}
</p>          </div>
        ) : (
          <>
            {messages.map((message, index) => {
              const showDate = shouldShowDateSeparator(message, messages[index - 1]);
              const isMine = message.sender === user.id || message.sender?.id === user.id;

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
                        src={otherUser?.photo || '/default-avatar.png'}
                        alt={otherUser?.username || 'Utilisateur'}
                        className="message-avatar"
                        onError={(e) => e.target.src = '/default-avatar.png'}
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
                        alt={t("messages_you_prefix")}
                        className="message-avatar"
                        onError={(e) => e.target.src = '/default-avatar.png'}
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

      {/* Input */}
      <MessageInput 
        conversationId={conversation.id} 
        onSendMessage={handleSendMessage}
      />
    </div>
  );
};

export default MessageThread;

// src/components/messaging/ConversationList.jsx - VERSION AMÉLIORÉE

import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { FaSearch, FaCircle } from 'react-icons/fa';
import './ConversationList.css';

const ConversationList = ({ 
  conversations = [], 
  onSelectConversation, 
  selectedConversationId,
  unreadCount = 0 
}) => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  const getOtherParticipant = (conversation) => {
    return conversation.participants?.find(p => p.id !== user.id) || {};
  };

  const formatLastMessageTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "À l'instant";
    if (diffMins < 60) return `${diffMins}min`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}j`;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  const truncateMessage = (text, maxLength = 50) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const filteredConversations = conversations.filter(conv => {
    if (!searchTerm) return true;
    const otherUser = getOtherParticipant(conv);
    const housingTitle = conv.housing?.title || '';
    return (
      otherUser?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      housingTitle.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="conversation-list">
      <div className="conversations-header">
        <h2>💬 Messages</h2>
        {unreadCount > 0 && (
          <span className="unread-badge">{unreadCount}</span>
        )}
      </div>

      <div className="search-conversations">
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="🔍 Rechercher une conversation..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="conversations-scroll">
        {filteredConversations.length === 0 ? (
          <div className="empty-conversations">
            <div className="empty-icon">💬</div>
            <p>
              {searchTerm 
                ? 'Aucune conversation trouvée' 
                : 'Vous n\'avez pas encore de conversations'}
            </p>
          </div>
        ) : (
          filteredConversations.map(conversation => {
            const otherUser = getOtherParticipant(conversation);
            const isSelected = conversation.id === selectedConversationId;
            const hasUnread = (conversation.unread_count || 0) > 0;
            
            return (
              <div
                key={conversation.id}
                className={`conversation-item ${isSelected ? 'selected' : ''} ${hasUnread ? 'unread' : ''}`}
                onClick={() => onSelectConversation(conversation)}
              >
                {/* Avatar */}
                <div className="conv-avatar">
                  <img 
                    src={otherUser?.photo || '/default-avatar.png'} 
                    alt={otherUser?.username || 'Utilisateur'}
                    onError={(e) => e.target.src = '/default-avatar.png'}
                  />
                  {conversation.is_online && (
                    <FaCircle className="online-indicator" />
                  )}
                </div>

                {/* Contenu */}
                <div className="conv-content">
                  <div className="conv-header">
                    <h3 className="conv-name">{otherUser?.username || 'Utilisateur'}</h3>
                    <span className="conv-time">
                      {formatLastMessageTime(conversation.updated_at)}
                    </span>
                  </div>

                  {/* Référence au logement */}
                  {conversation.housing && (
                    <div className="conv-housing">
                      <span className="housing-tag">🏠</span>
                      <span className="housing-title">
                        {truncateMessage(conversation.housing.title, 30)}
                      </span>
                    </div>
                  )}

                  {/* Dernier message */}
                  <div className="conv-last-message">
                    {conversation.last_message?.sender === user.id && (
                      <span className="you-prefix">Vous: </span>
                    )}
                    {conversation.last_message?.content ? (
                      truncateMessage(conversation.last_message.content)
                    ) : conversation.last_message?.image ? (
                      <span className="media-indicator">📷 Photo</span>
                    ) : conversation.last_message?.video ? (
                      <span className="media-indicator">🎥 Vidéo</span>
                    ) : (
                      <span className="no-message">Commencer la conversation</span>
                    )}
                  </div>
                </div>

                {/* Badge non lus */}
                {hasUnread && (
                  <div className="unread-count-badge">
                    {conversation.unread_count}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ConversationList;
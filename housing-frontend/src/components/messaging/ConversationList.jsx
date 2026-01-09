import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { getConversations } from '../../services/api';
import Loading from '../common/Loading';
import './ConversationList.css';

const ConversationList = ({ onSelectConversation, selectedConversationId }) => {
  const { user } = useContext(AuthContext);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const data = await getConversations();
      setConversations(data);
    } catch (error) {
      console.error('Erreur chargement conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getOtherParticipant = (conversation) => {
    return conversation.participants.find(p => p.id !== user.id);
  };

  const formatLastMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins}min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
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
      otherUser?.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      housingTitle.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  if (loading) {
    return (
      <div className="conversation-list">
        <Loading message="Chargement des conversations..." />
      </div>
    );
  }

  return (
    <div className="conversation-list">
      <div className="conversations-header">
        <h2>💬 Messages</h2>
        <span className="conv-count">{conversations.length}</span>
      </div>

      <div className="search-conversations">
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
            
            return (
              <div
                key={conversation.id}
                className={`conversation-item ${isSelected ? 'selected' : ''} ${conversation.unread_count > 0 ? 'unread' : ''}`}
                onClick={() => onSelectConversation(conversation)}
              >
                {/* Avatar */}
                <div className="conv-avatar">
                  <img 
                    src={otherUser?.photo || '/default-avatar.png'} 
                    alt={otherUser?.username}
                  />
                  {conversation.is_online && (
                    <span className="online-indicator"></span>
                  )}
                </div>

                {/* Contenu */}
                <div className="conv-content">
                  <div className="conv-header">
                    <h3 className="conv-name">{otherUser?.username}</h3>
                    <span className="conv-time">
                      {formatLastMessageTime(conversation.last_message_at)}
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
                    {conversation.last_message?.sender_id === user.id && (
                      <span className="you-prefix">Vous: </span>
                    )}
                    {conversation.last_message?.content ? (
                      truncateMessage(conversation.last_message.content)
                    ) : (
                      <span className="no-message">Pas de messages</span>
                    )}
                  </div>
                </div>

                {/* Badge non lus */}
                {conversation.unread_count > 0 && (
                  <div className="unread-badge">
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

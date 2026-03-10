// // src/components/messaging/MessagingPage.jsx 

import React, { useState, useEffect } from 'react';
import { housingService } from '../../services/housingService';
import { useAuth } from '../../contexts/AuthContext';
import ConversationList from './ConversationList';
import MessageThread from './MessageThread';
import { toast } from 'react-toastify';
import './MessagingPage.css';
import { useTheme } from '../../contexts/ThemeContext';

const MessagingPage = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const { t, language, theme } = useTheme();

  useEffect(() => {
    loadConversations();
    
    // Rafraîchir toutes les 30 secondes
    const interval = setInterval(loadConversations, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const data = await housingService.getConversations();
      const convs = Array.isArray(data) ? data : data.results || [];
      setConversations(convs);
      
      // Calculer les non lus
      const unread = convs.reduce((sum, c) => sum + (c.unread_count || 0), 0);
      setUnreadCount(unread);
    } catch (error) {
      console.error('Erreur chargement conversations:', error);
      toast.error('Erreur lors du chargement des conversations');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
  };

  const handleNewMessage = () => {
    // Rafraîchir la liste des conversations
    loadConversations();
  };

  if (loading) {
    return (
      <div className="messaging-loading">
        <div className="spinner"></div>
       <p>{t("messages_loading")}</p>
      </div>
    );
  }

  return (
    <div className="messaging-page">
      <div className="messaging-container">
        {/* Sidebar gauche - Liste conversations */}
        <aside className="conversations-sidebar">
          <ConversationList
            conversations={conversations}
            onSelectConversation={handleSelectConversation}
            selectedConversationId={selectedConversation?.id}
            unreadCount={unreadCount}
          />
        </aside>

        {/* Panel droit - Thread messages */}
        <main className="messages-panel">
          {selectedConversation ? (
            <MessageThread
              conversation={selectedConversation}
              onNewMessage={handleNewMessage}
            />
          ) : (
            <div className="no-conversation-selected">
              <div className="empty-icon">💬</div>
              <h3>{t("messages_select_conversation")}</h3>
              <p>{t("messages_choose_conversation")}</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default MessagingPage;
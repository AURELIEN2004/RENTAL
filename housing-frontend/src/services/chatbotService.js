// // ============================================
// // 📁 src/services/chatbotService.js
// // ============================================


import API_URL from '../config/api';

class ChatbotService {
  // Envoyer un message texte au chatbot
  async sendChatMessage(message, conversationHistory = []) {
    try {
      const response = await fetch(`${API_URL}/chatbot/chat/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          history: conversationHistory
        }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de l\'envoi du message');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Chat message error:', error);
      throw error;
    }
  }

  // Envoyer un message vocal au chatbot
  async sendVoiceMessage(audioBlob, conversationHistory = []) {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'voice_message.webm');
      formData.append('history', JSON.stringify(conversationHistory));
      
      const response = await fetch(`${API_URL}/chatbot/voice/`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de l\'envoi du message vocal');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Voice message error:', error);
      throw error;
    }
  }

  // Récupérer l'historique de conversation
  async getConversationHistory() {
    try {
      const response = await fetch(`${API_URL}/chatbot/history/`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération de l\'historique');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Get conversation history error:', error);
      return [];
    }
  }

  // Effacer l'historique de conversation
  async clearConversationHistory() {
    try {
      const response = await fetch(`${API_URL}/chatbot/clear-history/`, {
        method: 'POST',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de l\'effacement de l\'historique');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Clear conversation history error:', error);
      throw error;
    }
  }

  // Obtenir des suggestions de questions
  async getSuggestions() {
    try {
      const response = await fetch(`${API_URL}/chatbot/suggestions/`);
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des suggestions');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Get suggestions error:', error);
      return [
        "Quels sont les logements disponibles à Yaoundé?",
        "Je cherche un appartement meublé",
        "Montrez-moi des maisons avec piscine",
        "Quel est le prix moyen d'un studio?"
      ];
    }
  }
}

export default new ChatbotService();
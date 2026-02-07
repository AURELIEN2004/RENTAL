// ============================================
// 📁 src/components/Search/ChatbotButton.jsx
// ============================================

import { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import ChatbotModal from './ChatbotModal';

/**
 * Bouton flottant pour ouvrir le chatbot
 */
const ChatbotButton = ({ onResultsFound }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="chatbot-float-button"
        title="Assistant IA"
      >
        <MessageSquare size={24} />
        <span className="badge">IA</span>
      </button>

      <ChatbotModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onResultsFound={onResultsFound}
      />
    </>
  );
};

export default ChatbotButton;
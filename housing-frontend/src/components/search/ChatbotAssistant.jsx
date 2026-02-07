
import React, { useState } from 'react';
import { Sun, Moon, Languages, Send } from 'lucide-react';

const ChatbotAssistant = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('fr');

  const content = {
    fr: {
      title: "Assistant Logement",
      welcome: "Bonjour ! Comment puis-je vous aider dans votre recherche de location ?",
      placeholder: "Écrivez votre message...",
      toggleTheme: "Changer le mode"
    },
    en: {
      title: "Housing Assistant",
      welcome: "Hello! How can I help you with your rental search?",
      placeholder: "Type your message...",
      toggleTheme: "Toggle theme"
    }
  };

  const t = content[language];

  return (
    <div className={`${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} min-h-screen transition-colors duration-300`}>
      {/* Header / Navbar */}
      <header className={`p-4 flex justify-between items-center ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
            CA
          </div>
          <h1 className="text-xl font-bold italic">ChatbotAssistant</h1>
        </div>

        <div className="flex gap-4 items-center">
          {/* Language Toggle */}
          <button 
            onClick={() => setLanguage(language === 'fr' ? 'en' : 'fr')}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <Languages size={20} />
          </button>
          
          {/* Theme Toggle */}
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </header>

      {/* Chat Area */}
      <main className="max-w-2xl mx-auto mt-10 p-4">
        <div className={`rounded-xl shadow-lg h-[500px] flex flex-col ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          {/* Messages container */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className={`max-w-[80%] p-3 rounded-lg ${darkMode ? 'bg-blue-900' : 'bg-blue-100'}`}>
              <p className="text-sm font-semibold mb-1">ChatbotAssistant</p>
              <p>{t.welcome}</p>
            </div>
          </div>

          {/* Input Area */}
          <div className={`p-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder={t.placeholder}
                className={`flex-1 p-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300'}`}
              />
              <button className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors">
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChatbotAssistant;
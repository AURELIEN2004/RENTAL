
// ============================================
// src/contexts/ThemeContext.jsx
// ============================================

import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  const [language, setLanguage] = useState('fr');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    const savedLang = localStorage.getItem('language') || 'fr';
    setTheme(savedTheme);
    setLanguage(savedLang);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const toggleLanguage = () => {
    const newLang = language === 'fr' ? 'en' : 'fr';
    setLanguage(newLang);
    localStorage.setItem('language', newLang);
  };

  const t = (key) => {
    // Fonction de traduction simple (peut être améliorée avec i18n)
    const translations = {
      fr: {
        home: 'Accueil',
        search: 'Rechercher',
        about: 'À propos',
        services: 'Services',
        contact: 'Contact',
        login: 'Connexion',
        register: 'Inscription',
        logout: 'Déconnexion',
        dashboard: 'Tableau de bord',
        // ... autres traductions
      },
      en: {
        home: 'Home',
        search: 'Search',
        about: 'About',
        services: 'Services',
        contact: 'Contact',
        login: 'Login',
        register: 'Register',
        logout: 'Logout',
        dashboard: 'Dashboard',
        // ... autres traductions
      },
    };

    return translations[language][key] || key;
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, language, toggleLanguage, t }}>
      {children}
    </ThemeContext.Provider>
  );
};

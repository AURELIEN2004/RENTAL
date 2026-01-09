// ============================================
// src/components/common/ThemeToggle.jsx
// ============================================


import React, { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

/**
 * ThemeToggle
 * -------------
 * - Bascule entre thème clair et sombre
 * - Persistance via localStorage
 * - Compatible Tailwind (classe `dark` sur <html>)
 */
const ThemeToggle = () => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  useEffect(() => {
    const root = document.documentElement;

    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="flex items-center justify-center p-2 rounded-full
                 bg-gray-200 dark:bg-gray-700
                 hover:bg-gray-300 dark:hover:bg-gray-600
                 transition-colors"
    >
      {theme === 'dark' ? (
        <Sun size={18} className="text-yellow-400" />
      ) : (
        <Moon size={18} className="text-gray-800" />
      )}
    </button>
  );
};

export default ThemeToggle;

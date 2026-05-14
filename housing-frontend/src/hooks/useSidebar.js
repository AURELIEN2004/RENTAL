// src/hooks/useSidebar.js
// ============================================================
// Hook réutilisable pour gérer la sidebar drawer (style ChatGPT)
// Ferme automatiquement sur resize desktop et sur changement d'onglet
// ============================================================

import { useState, useEffect, useCallback } from 'react';

const DESKTOP_BREAKPOINT = 768;

export const useSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(
    () => window.innerWidth <= DESKTOP_BREAKPOINT
  );

  // Détection mobile/desktop au resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= DESKTOP_BREAKPOINT;
      setIsMobile(mobile);
      if (!mobile) {
        setIsOpen(false); // reset état sur desktop (sidebar toujours visible)
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Bloquer le scroll du body quand le drawer est ouvert (mobile)
  useEffect(() => {
    if (isMobile && isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMobile, isOpen]);

  const open  = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);

  // Ferme le drawer si l'utilisateur change d'onglet (navigation)
  const closeOnTabChange = useCallback(() => {
    if (isMobile) setIsOpen(false);
  }, [isMobile]);

  return { isOpen, isMobile, open, close, toggle, closeOnTabChange };
};

export default useSidebar;
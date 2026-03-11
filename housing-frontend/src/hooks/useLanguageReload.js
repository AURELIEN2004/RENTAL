// src/hooks/useLanguageReload.js
// ============================================================
// Hook utilitaire : déclenche un rechargement des données
// à chaque fois que la langue change.
//
// Utilisation dans n'importe quel composant :
//
//   const { language } = useTheme();
//   useEffect(() => { loadMyData(); }, [language]);
//
// Ou avec ce hook :
//   const reload = useLanguageReload(loadMyData);
// ============================================================

import { useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';

/**
 * Appelle `fetchFn` immédiatement et à chaque changement de langue.
 * @param {Function} fetchFn  - fonction async qui charge les données
 * @param {Array}    deps     - dépendances supplémentaires (optionnel)
 */
const useLanguageReload = (fetchFn, deps = []) => {
  const { language } = useTheme();
  const fetchRef = useRef(fetchFn);
  fetchRef.current = fetchFn;

  useEffect(() => {
    fetchRef.current();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, ...deps]);
};

export default useLanguageReload;
// // ============================================
// // 📁 src/components/Search/NearMeButton.jsx
// // ============================================


import { useState } from 'react';
import { MapPin, Loader } from 'lucide-react';
import searchService from '../../services/searchService';
import { useTheme } from '../../contexts/ThemeContext';
import './NearMeButton.css';

const T = {
  fr: {
    btn:      'Près de moi',
    loading:  'Localisation…',
    tip:      'Rechercher les logements autour de vous',
    errors: {
      1: "Accès à la localisation refusé. Vérifiez les permissions du navigateur.",
      2: "Position indisponible. Réessayez.",
      3: "Délai dépassé. Réessayez.",
      0: "Géolocalisation non supportée sur cet appareil.",
    },
  },
  en: {
    btn:      'Near me',
    loading:  'Locating…',
    tip:      'Search housing near your location',
    errors: {
      1: "Location access denied. Check your browser permissions.",
      2: "Position unavailable. Please try again.",
      3: "Request timed out. Please try again.",
      0: "Geolocation is not supported on this device.",
    },
  },
};

const NearMeButton = ({ onLocationFound, onError, language: langProp }) => {
  const { language: langCtx } = useTheme();
  const lang = langProp || langCtx || 'fr';
  const t    = T[lang] || T.fr;

  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      const location = await searchService.getUserLocation();
      onLocationFound?.(location);
    } catch (err) {
      const code = err?.code ?? 0;
      const msg  = t.errors[code] || (lang === 'fr' ? 'Erreur de géolocalisation.' : 'Geolocation error.');
      if (onError) {
        onError(msg);
      } else {
        alert(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      className="nmb-btn"
      onClick={handleClick}
      disabled={loading}
      title={t.tip}
      aria-label={loading ? t.loading : t.btn}
    >
      {loading ? (
        <>
          <Loader className="nmb-spin" size={18} aria-hidden="true" />
          <span>{t.loading}</span>
        </>
      ) : (
        <>
          <MapPin size={18} aria-hidden="true" />
          <span>{t.btn}</span>
        </>
      )}
    </button>
  );
};

export default NearMeButton;
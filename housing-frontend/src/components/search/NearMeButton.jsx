// ============================================
// 📁 src/components/Search/NearMeButton.jsx
// ============================================

import { useState } from 'react';
import { MapPin, Loader } from 'lucide-react';
import searchService from '../../services/searchService';

/**
 * Bouton "Près de moi" avec géolocalisation
 */
const NearMeButton = ({ onLocationFound, onError }) => {
  const [loading, setLoading] = useState(false);

  const handleNearbySearch = async () => {
    setLoading(true);
    try {
      // Obtenir position GPS
      const location = await searchService.getUserLocation();
      
      if (onLocationFound) {
        onLocationFound(location);
      }
    } catch (error) {
      console.error('Erreur géolocalisation:', error);
      
      const errorMessage = 
        error.code === 1 ? 'Veuillez autoriser la géolocalisation' :
        error.code === 2 ? 'Position indisponible' :
        error.code === 3 ? 'Délai dépassé' :
        'Erreur de géolocalisation';
      
      if (onError) {
        onError(errorMessage);
      } else {
        alert(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleNearbySearch}
      disabled={loading}
      className="near-me-button"
      title="Rechercher près de moi"
    >
      {loading ? (
        <>
          <Loader className="icon-spin" size={20} />
          <span>Localisation...</span>
        </>
      ) : (
        <>
          <MapPin size={20} />
          <span>Près de moi</span>
        </>
      )}
    </button>
  );
};

export default NearMeButton;
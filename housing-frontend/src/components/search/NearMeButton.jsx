// import { getNearbyHousing } from "../../services/locationService";

// const NearMeButton = ({ onResults }) => {
//   const handleClick = () => {
//     if (!navigator.geolocation) {
//       alert("Géolocalisation non supportée");
//       return;
//     }

//     navigator.geolocation.getCurrentPosition(
//       async (position) => {
//         const { latitude, longitude } = position.coords;
//         const res = await getNearbyHousing(latitude, longitude, 5);
//         onResults(res.data);
//       },
//       () => alert("Permission refusée")
//     );
//   };

//   return (
//     <button onClick={handleClick}>
//       📍 Logements près de moi
//     </button>
//   );
// };

// export default NearMeButton;


// ============================================
// 📁 components/search/NearMeButton.jsx - VERSION MODERNE
// ============================================

import { useState } from "react";
import { getNearbyHousing } from "../../services/locationService";

const NearMeButton = ({ onResults }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleClick = () => {
    if (!navigator.geolocation) {
      alert("Géolocalisation non supportée par votre navigateur");
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await getNearbyHousing(latitude, longitude, 5);
          onResults(res.data);
        } catch (err) {
          console.error("Erreur recherche à proximité:", err);
          setError("Erreur lors de la recherche");
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        console.error("Erreur géolocalisation:", err);
        setError("Permission refusée");
        setLoading(false);
      }
    );
  };

  return (
    <button 
      className="btn-action btn-nearby"
      onClick={handleClick}
      disabled={loading}
      title="Trouver des logements près de moi"
    >
      <span className="btn-icon">📍</span>
      <span>{loading ? "Localisation..." : "Près de moi"}</span>
    </button>
  );
};

export default NearMeButton;
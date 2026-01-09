
// // ============================================
// // src/components/housing/HousingCard.jsx
// // ============================================

// import React from 'react';
// import { Link } from 'react-router-dom';
// import { FaHeart, FaRegHeart, FaEye, FaBed, FaBath, FaMapMarkerAlt } from 'react-icons/fa';
// import { formatPrice, formatRelativeTime, getStatusColor } from '../../utils/helpers';
// import { housingService } from '../../services/housingService';
// import { toast } from 'react-toastify';
// import './HousingCard.css';

// const HousingCard = ({ housing, onLikeToggle }) => {
//   const [isLiked, setIsLiked] = React.useState(false);
//   const [likesCount, setLikesCount] = React.useState(housing.likes_count);

//   const handleLike = async (e) => {
//     e.preventDefault();
//     e.stopPropagation();

//     try {
//       const result = await housingService.toggleLike(housing.id);
//       setIsLiked(result.liked);
//       setLikesCount(result.likes_count);
      
//       if (onLikeToggle) {
//         onLikeToggle(housing.id, result.liked);
//       }
//     } catch (error) {
//       toast.error('Vous devez être connecté pour liker');
//     }
//   };

//   return (
//     <Link to={`/housing/${housing.id}`} className="housing-card">
//       {/* Image */}
//       <div className="housing-card-image">
//         <img 
//           src={housing.main_image || '/placeholder.jpg'} 
//           alt={housing.title}
//         />
        
//         {/* Badge statut */}
//         <span className={`status-badge status-${housing.status}`}>
//           {housing.status}
//         </span>

//         {/* Bouton Like */}
//         <button 
//           className={`like-btn ${isLiked ? 'liked' : ''}`}
//           onClick={handleLike}
//         >
//           {isLiked ? <FaHeart /> : <FaRegHeart />}
//         </button>
//       </div>

//       {/* Contenu */}
//       <div className="housing-card-content">
//         {/* Prix */}
//         <div className="housing-price">{formatPrice(housing.price)}/mois</div>

//         {/* Titre */}
//         <h3 className="housing-title">{housing.display_name}</h3>

//         {/* Localisation */}
//         <p className="housing-location">
//           <FaMapMarkerAlt /> {housing.district_name}, {housing.city_name}
//         </p>

//         {/* Caractéristiques */}
//         <div className="housing-features">
//           <span><FaBed /> {housing.rooms} ch.</span>
//           <span><FaBath /> {housing.bathrooms} db.</span>
//           <span>{housing.area} m²</span>
//         </div>

//         {/* Footer */}
//         <div className="housing-card-footer">
//           <div className="housing-stats">
//             <span><FaEye /> {housing.views_count}</span>
//             <span><FaHeart /> {likesCount}</span>
//           </div>
//           <span className="housing-date">{formatRelativeTime(housing.created_at)}</span>
//         </div>
//       </div>
//     </Link>
//   );
// };

// export default HousingCard;


// ============================================
// src/components/housing/HousingCard.jsx - AMÃ‰LIORÃ‰
// ============================================

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaHeart, FaRegHeart, FaBookmark, FaRegBookmark, FaEye, FaBed, FaBath, FaMapMarkerAlt } from 'react-icons/fa';
import { formatPrice, formatRelativeTime } from '../../utils/helpers';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import './HousingCard.css';

const HousingCard = ({ housing, onLikeToggle, onSaveToggle, showActions = true }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(housing.is_liked || false);
  const [isSaved, setIsSaved] = useState(housing.is_saved || false);
  const [likesCount, setLikesCount] = useState(housing.likes_count || 0);

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error('Connectez-vous pour liker');
      navigate('/login');
      return;
    }

    try {
      const result = await api.post(`/housings/${housing.id}/toggle_like/`);
      setIsLiked(result.data.liked);
      setLikesCount(result.data.likes_count);
      
      if (onLikeToggle) {
        onLikeToggle(housing.id, result.data.liked);
      }

      toast.success(result.data.liked ? 'AjoutÃ© aux favoris' : 'RetirÃ© des favoris');
    } catch (error) {
      toast.error('Erreur lors du like');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error('Connectez-vous pour enregistrer');
      navigate('/login');
      return;
    }

    try {
      const result = await api.post(`/housings/${housing.id}/toggle_save/`);
      setIsSaved(result.data.saved);
      
      if (onSaveToggle) {
        onSaveToggle(housing.id, result.data.saved);
      }

      toast.success(result.data.saved ? 'Logement enregistrÃ©' : 'Logement retiré');
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  return (
    <Link to={`/housing/${housing.id}`} className="housing-card">
      {/* Image */}
      <div className="housing-card-image">
        <img 
          src={housing.main_image || '/placeholder.jpg'} 
          alt={housing.title}
          onError={(e) => {
            e.target.src = '/placeholder.jpg';
          }}
        />
        
        {/* Badge statut */}
        <span className={`status-badge status-${housing.status}`}>
          {housing.status}
        </span>

        {/* Action buttons */}
        {showActions && (
          <div className="card-actions">
            <button 
              className={`action-btn ${isLiked ? 'liked' : ''}`}
              onClick={handleLike}
              title={isLiked ? 'RetirÃ© des favoris' : 'Ajouter aux favoris'}
            >
              {isLiked ? <FaHeart /> : <FaRegHeart />}
            </button>
            
            <button 
              className={`action-btn ${isSaved ? 'saved' : ''}`}
              onClick={handleSave}
              title={isSaved ? 'DÃ©senregistrer' : 'Enregistrer'}
            >
              {isSaved ? <FaBookmark /> : <FaRegBookmark />}
            </button>
          </div>
        )}
      </div>

      {/* Contenu */}
      <div className="housing-card-content">
        {/* Prix */}
        <div className="housing-price">{formatPrice(housing.price)}/mois</div>

        {/* Titre */}
        <h3 className="housing-title">{housing.display_name || housing.title}</h3>

        {/* Localisation */}
        <p className="housing-location">
          <FaMapMarkerAlt /> {housing.district_name}, {housing.city_name}
        </p>

        {/* CaractÃ©ristiques */}
        <div className="housing-features">
          <span><FaBed /> {housing.rooms} ch.</span>
          <span><FaBath /> {housing.bathrooms} db.</span>
          <span>{housing.area} mÂ²</span>
        </div>

        {/* Footer */}
        <div className="housing-card-footer">
          <div className="housing-stats">
            <span><FaEye /> {housing.views_count}</span>
            <span><FaHeart /> {likesCount}</span>
          </div>
          <span className="housing-date">{formatRelativeTime(housing.created_at)}</span>
        </div>
      </div>
    </Link>
  );
};

export default HousingCard;
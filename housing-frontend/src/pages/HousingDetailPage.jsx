
// ============================================
// src/pages/HousingDetailPage.jsx - Détail logement
// ============================================

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { housingService } from '../services/housingService';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { 
  FaBed, FaBath, FaRuler, FaMapMarkerAlt, FaHeart, FaRegHeart,
  FaWhatsapp, FaPhone, FaEnvelope, FaCalendarAlt, FaVideo, FaEye
} from 'react-icons/fa';
import { formatPrice, formatDate, getStatusColor } from '../utils/helpers';
import { toast } from 'react-toastify';
import './HousingDetailPage.css';

const HousingDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [housing, setHousing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [visitDate, setVisitDate] = useState('');
  const [visitTime, setVisitTime] = useState('');

  useEffect(() => {
    loadHousingDetail();
  }, [id]);

  const loadHousingDetail = async () => {
    try {
      const data = await housingService.getHousing(id);
      setHousing(data);
      
      // Incrémenter le compteur de vues
      await housingService.incrementViews(id);
    } catch (error) {
      console.error('Error loading housing:', error);
      toast.error('Logement introuvable');
      navigate('/search');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!user) {
      toast.error('Connectez-vous pour ajouter aux favoris');
      navigate('/login');
      return;
    }

    try {
      const result = await housingService.toggleLike(id);
      toast.success(result.liked ? 'Ajouté aux favoris' : 'Retiré des favoris');
      loadHousingDetail();
    } catch (error) {
      toast.error('Erreur lors de l\'ajout aux favoris');
    }
  };

  const handleContactOwner = async () => {
    if (!user) {
      toast.error('Connectez-vous pour contacter le propriétaire');
      navigate('/login');
      return;
    }

    try {
      await housingService.startConversation(id);
      navigate('/dashboard/messages');
      toast.success('Conversation démarrée');
    } catch (error) {
      toast.error('Erreur lors de la création de la conversation');
    }
  };

  const handlePlanVisit = async (e) => {
    e.preventDefault();

    if (!user) {
      toast.error('Connectez-vous pour planifier une visite');
      navigate('/login');
      return;
    }

    try {
      await housingService.createVisit({
        housing: id,
        date: visitDate,
        time: visitTime,
        locataire: user.id, // AJOUTEZ CETTE LIGNE (vérifiez si c'est user.id ou user.pk)
      });

      toast.success('Demande de visite envoyée');
      setShowVisitModal(false);
      setVisitDate('');
      setVisitTime('');
    } catch (error) {
// Affichez l'erreur détaillée du serveur dans la console pour déboguer
    console.error("Détails erreur 400:", error.response?.data);
    toast.error('Erreur lors de la planification')    }
  };

  if (loading) {
    return <div className="loading-page">Chargement...</div>;
  }

  if (!housing) {
    return <div className="error-page">Logement non trouvé</div>;
  }

  const mapCenter = {
    lat: housing.latitude || 3.848,
    lng: housing.longitude || 11.502,
  };


          {/* Bouton de retour */}
  const handleBack = () => {
  if (window.history.state && window.history.state.idx > 0) {
    navigate(-1);
  } else {
    navigate('/'); // Fallback vers l'accueil si aucune page précédente
  }
};
       {/* FIN BOUTTON DE RETOUR */}


  return (
    <div className="housing-detail-page">
      
        {/* Bouton de retour */}
        <div className="detail-back">
            <button className="btn btn-secondary back-btn" onClick={handleBack}>
              ← Retour
            </button>
          </div>
       {/* FIN BOUTTON DE RETOUR */}

      <div className="container">
        {/* Breadcrumb */}
        <nav className="breadcrumb">
          <a href="/">Accueil</a> / 
          <a href="/search">Recherche</a> / 
          <span>{housing.title}</span>
        </nav>

        {/* Images Gallery */}
        <div className="gallery-section">
          <div className="main-image">
            <img
              src={housing.images?.[selectedImage]?.image || '/placeholder.jpg'}
              alt={housing.title}
            />
            
            {/* Badge statut */}
            <span className={`status-badge status-${housing.status}`}>
              {housing.status}
            </span>
          </div>

          <div className="thumbnail-grid">
            {housing.images?.map((img, index) => (
              <img
                key={index}
                src={img.image}
                alt={`${housing.title} ${index + 1}`}
                className={selectedImage === index ? 'active' : ''}
                onClick={() => setSelectedImage(index)}
              />
            ))}
          </div>
        </div>

        <div className="detail-content">
          {/* Info principale */}
          <div className="main-info">
            <div className="title-section">
              <h1>{housing.display_name}</h1>
              <div className="price-tag">{formatPrice(housing.price)}/mois</div>
            </div>

            <div className="location">
              <FaMapMarkerAlt /> {housing.district?.name}, {housing.city?.name}, {housing.region?.name}
            </div>

            <div className="features-bar">
              <div className="feature">
                <FaBed /> {housing.rooms} chambres
              </div>
              <div className="feature">
                <FaBath /> {housing.bathrooms} douches
              </div>
              <div className="feature">
                <FaRuler /> {housing.area} m²
              </div>
              <div className="feature">
                <FaEye /> {housing.views_count} vues
              </div>
            </div>

            <div className="action-buttons">
              <button className="btn btn-outline" onClick={handleLike}>
                {housing.is_liked ? <FaHeart /> : <FaRegHeart />}
                Favoris
              </button>

              <button className="btn btn-primary" onClick={() => setShowVisitModal(true)}>
                <FaCalendarAlt /> Planifier une visite
              </button>
            </div>

            {/* Description */}
            <div className="description-section">
              <h2>Description</h2>
              <p>{housing.description}</p>

              {housing.additional_features && (
                <>
                  <h3>Caractéristiques supplémentaires</h3>
                  <p>{housing.additional_features}</p>
                </>
              )}
            </div>

            {/* Vidéo / Visite 360 */}
            {(housing.video || housing.virtual_360) && (
              <div className="media-section">
                <h2>Visite Virtuelle</h2>
                
                {housing.video && (
                  <video controls className="housing-video">
                    <source src={housing.video} type="video/mp4" />
                  </video>
                )}

                {housing.virtual_360 && (
                  <a href={housing.virtual_360} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
                    <FaVideo /> Visite 360°
                  </a>
                )}
              </div>
            )}

            {/* Map */}
            {housing.latitude && housing.longitude && (
              <div className="map-section">
                <h2>Localisation</h2>
                <LoadScript googleMapsApiKey={import.meta.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
                  <GoogleMap
                    mapContainerStyle={{ width: '100%', height: '400px' }}
                    center={mapCenter}
                    zoom={15}
                  >
                    <Marker position={mapCenter} />
                  </GoogleMap>
                </LoadScript>
                
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${housing.latitude},${housing.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline mt-3"
                >
                  Tracer l'itinéraire
                </a>
              </div>
            )}
          </div>

          {/* Sidebar Contact */}
          <aside className="contact-sidebar">
            <div className="owner-card">
              <img
                src={housing.owner?.photo || '/default-avatar.png'}
                alt={housing.owner?.username}
                className="owner-avatar"
              />
              <h3>{housing.owner?.username}</h3>
              <p>Propriétaire</p>
            </div>

            <div className="contact-methods">
              <button className="contact-btn whatsapp" onClick={() => window.open(`https://wa.me/${housing.owner?.phone}`)}>
                <FaWhatsapp /> WhatsApp
              </button>

              <button className="contact-btn phone" onClick={() => window.location.href = `tel:${housing.owner?.phone}`}>
                <FaPhone /> Appeler
              </button>

              <button className="contact-btn email" onClick={handleContactOwner}>
                <FaEnvelope /> Message
              </button>
            </div>

            <div className="info-box">
              <h4>Informations</h4>
              <p><strong>Publié le:</strong> {formatDate(housing.created_at)}</p>
              <p><strong>Type:</strong> {housing.housing_type?.name}</p>
              <p><strong>Catégorie:</strong> {housing.category?.name}</p>
            </div>
          </aside>
        </div>
      </div>

      {/* Modal Planification Visite */}
      {showVisitModal && (
        <div className="modal-overlay" onClick={() => setShowVisitModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Planifier une visite</h2>
            <form onSubmit={handlePlanVisit}>
              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  value={visitDate}
                  onChange={(e) => setVisitDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div className="form-group">
                <label>Heure</label>
                <input
                  type="time"
                  value={visitTime}
                  onChange={(e) => setVisitTime(e.target.value)}
                  required
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowVisitModal(false)}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary">
                  Confirmer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HousingDetailPage;


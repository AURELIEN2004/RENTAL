

// src/components/housing/HousingDetail.jsx


import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { getHousingDetail, housingService, likeHousing, saveHousing } from '../../services/housingService';
import { createConversation } from '../../services/api';
import Loading from '../common/Loading';
import './HousingDetail.css';
import VisitFormModal from '../components/visits/VisitFormModal';

const HousingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [showVisitModal, setShowVisitModal] = useState(false);

  const [housing, setHousing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showVisitForm, setShowVisitForm] = useState(false);
  const [visitDate, setVisitDate] = useState('');
  const [visitTime, setVisitTime] = useState('');

  useEffect(() => {
    fetchHousingDetail();
  }, [id]);

  const fetchHousingDetail = async () => {
    try {
      setLoading(true);
      const data = await getHousingDetail(id);
      setHousing(data);
      setIsLiked(data.is_liked_by_user);
      setIsSaved(data.is_saved_by_user);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      await likeHousing(id);
      setIsLiked(!isLiked);
      setHousing(prev => ({
        ...prev,
        likes_count: isLiked ? prev.likes_count - 1 : prev.likes_count + 1
      }));
    } catch (error) {
      console.error('Erreur like:', error);
    }
  };

  const handleSave = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      await saveHousing(id);
      setIsSaved(!isSaved);
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
    }
  };

  const handleContact = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      const conversation = await createConversation(id);
      navigate(`/messages/${conversation.id}`);
    } catch (error) {
      console.error('Erreur création conversation:', error);
    }
  };

  const handleWhatsApp = () => {
    if (housing?.owner?.phone) {
      const message = `Bonjour, je suis intéressé(e) par votre logement: ${housing.title}`;
      window.open(`https://wa.me/${housing.owner.phone}?text=${encodeURIComponent(message)}`, '_blank');
    }
  };

  // const handlePlanVisit = async (e) => {
  //   e.preventDefault();
  //   if (!user) {
  //     navigate('/login');
  //     return;
  //   }
  //   try {
  //     // Appel API pour créer la visite
  //     console.log('Planifier visite:', { housingId: id, date: visitDate, time: visitTime });
  //     alert('Demande de visite envoyée avec succès!');
  //     setShowVisitForm(false);
  //   } catch (error) {
  //     console.error('Erreur planification visite:', error);
  //   }
  // };
  const handlePlanVisit = async (e) => {
  e.preventDefault();
  if (!user) return navigate('/login');
  try {
    const visitData = { housing: id, date: visitDate, time: visitTime };
    await housingService.createVisit(visitData);
    alert('Demande de visite envoyée avec succès!');
    setShowVisitForm(false);
  } catch (error) {
    console.error('Erreur planification visite:', error);
  }
};


  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === housing.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? housing.images.length - 1 : prev - 1
    );
  };

  if (loading) return <Loading fullScreen message="Chargement du logement..." />;
  if (!housing) return <div className="error-message">Logement introuvable</div>;

  return (
    <div className="housing-detail">
      {/* Galerie d'images */}
      <div className="image-gallery">
        {housing.images && housing.images.length > 0 && (
          <>
            <img 
              src={housing.images[currentImageIndex].image} 
              alt={housing.title}
              className="main-image"
            />
            {housing.images.length > 1 && (
              <>
                <button className="gallery-btn prev" onClick={prevImage}>❮</button>
                <button className="gallery-btn next" onClick={nextImage}>❯</button>
                <div className="image-indicators">
                  {housing.images.map((_, idx) => (
                    <span 
                      key={idx}
                      className={`indicator ${idx === currentImageIndex ? 'active' : ''}`}
                      onClick={() => setCurrentImageIndex(idx)}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* Informations principales */}
      <div className="detail-content">
        <div className="detail-header">
          <div>
            <h1>{housing.title}</h1>
            <p className="location">
              📍 {housing.city?.name}, {housing.district?.name}
            </p>
          </div>
          <div className="price-tag">{housing.price.toLocaleString()} FCFA/mois</div>
        </div>

        {/* Caractéristiques */}
        <div className="characteristics">
          <div className="char-item">
            <span className="char-icon">📐</span>
            <span>{housing.area} m²</span>
          </div>
          <div className="char-item">
            <span className="char-icon">🛏️</span>
            <span>{housing.rooms} chambres</span>
          </div>
          <div className="char-item">
            <span className="char-icon">🚿</span>
            <span>{housing.bathrooms} douches</span>
          </div>
          <div className="char-item">
            <span className="char-icon">👁️</span>
            <span>{housing.views_count} vues</span>
          </div>
          <div className="char-item">
            <span className="char-icon">❤️</span>
            <span>{housing.likes_count} likes</span>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="action-buttons">
          <button 
            className={`action-btn ${isLiked ? 'liked' : ''}`}
            onClick={handleLike}
          >
            ❤️ {isLiked ? 'Retiré des favoris' : 'Ajouter aux favoris'}
          </button>
          <button 
            className={`action-btn ${isSaved ? 'saved' : ''}`}
            onClick={handleSave}
          >
            💾 {isSaved ? 'Enregistré' : 'Enregistrer'}
          </button>
          {/* <button 
            className="action-btn primary"
            onClick={() => setShowVisitForm(!showVisitForm)}
          >
            📅 Planifier une visite
          </button> */}
           {/* Bouton Planifier une visite */}
      <div className="action-buttons">
        <button 
          className="btn btn-primary"
          onClick={() => setShowVisitModal(true)}
        >
          📅 Planifier une visite
        </button>
      </div>
        </div>

        {/* Formulaire de visite
        {showVisitForm && (
          <form className="visit-form" onSubmit={handlePlanVisit}>
            <h3>Planifier une visite</h3>
            <div className="form-row">
              <input
                type="date"
                value={visitDate}
                onChange={(e) => setVisitDate(e.target.value)}
                required
                min={new Date().toISOString().split('T')[0]}
              />
              <input
                type="time"
                value={visitTime}
                onChange={(e) => setVisitTime(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="submit-visit-btn">Envoyer la demande</button>
          </form>
        )} */}

         {/* Modal de planification */}
      {showVisitModal && (
        <VisitFormModal
          housing={housing}
          onClose={() => setShowVisitModal(false)}
          onSuccess={() => {
            alert('Demande de visite envoyée avec succès !');
            // Optionnel : rediriger vers les visites
            // navigate('/dashboard/visites');
          }}
        />
      )}

        {/* Description */}
        <div className="description-section">
          <h2>Description</h2>
          <p>{housing.description}</p>
        </div>

        {/* Contact propriétaire */}
        <div className="owner-section">
          <h2>Contacter le propriétaire</h2>
          <div className="owner-info">
            <img 
              src={housing.owner?.photo || '/default-avatar.png'} 
              alt={housing.owner?.username}
              className="owner-avatar"
            />
            <div>
              <p className="owner-name">{housing.owner?.username}</p>
              <p className="owner-phone">📱 {housing.owner?.phone}</p>
            </div>
          </div>
          <div className="contact-buttons">
            <button className="contact-btn primary" onClick={handleContact}>
              💬 Messagerie
            </button>
            <button className="contact-btn whatsapp" onClick={handleWhatsApp}>
              📱 WhatsApp
            </button>
            <a href={`tel:${housing.owner?.phone}`} className="contact-btn phone">
              ☎️ Appeler
            </a>
          </div>
        </div>

        {/* Carte Google Maps */}
        {housing.latitude && housing.longitude && (
          <div className="map-section">
            <h2>Localisation</h2>
            <div className="map-container">
              <iframe
                title="map"
                width="100%"
                height="400"
                frameBorder="0"
                src={`https://www.google.com/maps?q=${housing.latitude},${housing.longitude}&output=embed`}
                allowFullScreen
              />
            </div>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${housing.latitude},${housing.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="directions-btn"
            >
              🧭 Tracer l'itinéraire
            </a>
          </div>
        )}

        {/* Vidéo/Visite 360 */}
        {housing.video && (
          <div className="media-section">
            <h2>Vidéo de présentation</h2>
            <video controls className="housing-video">
              <source src={housing.video} type="video/mp4" />
            </video>
          </div>
        )}

        {housing.virtual_360 && (
          <div className="media-section">
            <h2>Visite virtuelle 360°</h2>
            <iframe
              title="virtual-tour"
              src={housing.virtual_360}
              width="100%"
              height="500"
              frameBorder="0"
              allowFullScreen
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default HousingDetail;

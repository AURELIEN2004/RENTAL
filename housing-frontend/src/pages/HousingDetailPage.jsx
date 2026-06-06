
// // ============================================
// // src/pages/HousingDetailPage.jsx - Détail logement
// // ============================================

// import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { useAuth } from '../contexts/AuthContext';
// import { housingService } from '../services/housingService';
// import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
// import { 
//   FaBed, FaBath, FaRuler, FaMapMarkerAlt, FaHeart, FaRegHeart,
//   FaWhatsapp, FaPhone, FaEnvelope, FaCalendarAlt, FaVideo, FaEye
// } from 'react-icons/fa';
// import { formatPrice, formatDate, getStatusColor } from '../utils/helpers';
// import { toast } from 'react-toastify';
// import './HousingDetailPage.css';
// import { useTheme } from '../contexts/ThemeContext';

// const HousingDetailPage = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const { user } = useAuth();
//   const [housing, setHousing] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [selectedImage, setSelectedImage] = useState(0);
//   const [showVisitModal, setShowVisitModal] = useState(false);
//   const [visitDate, setVisitDate] = useState('');
//   const [visitTime, setVisitTime] = useState('');
// const { t, language, theme } = useTheme();

//   useEffect(() => {
//     loadHousingDetail();
//   }, [id, language]);



//   const loadHousingDetail = async () => {
//     try {
//       const data = await housingService.getHousing(id);
//       setHousing(data);
      
//       // Incrémenter le compteur de vues
//       await housingService.incrementViews(id);
//     } catch (error) {
//       console.error('Error loading housing:', error);
//       toast.error('Logement introuvable');
//       navigate('/search');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleLike = async () => {
//     if (!user) {
//       toast.error('Connectez-vous pour ajouter aux favoris');
//       navigate('/login');
//       return;
//     }

//     try {
//       const result = await housingService.toggleLike(id);
//       toast.success(result.liked ? 'Ajouté aux favoris' : 'Retiré des favoris');
//       loadHousingDetail();
//     } catch (error) {
//       toast.error('Erreur lors de l\'ajout aux favoris');
//     }
//   };

//   const handleContactOwner = async () => {
//     if (!user) {
//       toast.error('Connectez-vous pour contacter le propriétaire');
//       navigate('/login');
//       return;
//     }

//     try {
//       await housingService.startConversation(id);
//       navigate('/dashboard/messages');
//       toast.success('Conversation démarrée');
//     } catch (error) {
//       toast.error('Erreur lors de la création de la conversation');
//     }
//   };

//   const handlePlanVisit = async (e) => {
//     e.preventDefault();

//     if (!user) {
//       toast.error('Connectez-vous pour planifier une visite');
//       navigate('/login');
//       return;
//     }

//     try {
//       await housingService.createVisit({
//         housing: id,
//         date: visitDate,
//         time: visitTime,
//         locataire: user.id, // AJOUTEZ CETTE LIGNE (vérifiez si c'est user.id ou user.pk)
//       });

//       toast.success('Demande de visite envoyée');
//       setShowVisitModal(false);
//       setVisitDate('');
//       setVisitTime('');
//     } catch (error) {
// // Affichez l'erreur détaillée du serveur dans la console pour déboguer
//     console.error("Détails erreur 400:", error.response?.data);
//     toast.error('Erreur lors de la planification')    }
//   };

//   if (loading) {
//     return <div className="loading-page">{t('loading')}</div>;
//   }

//   if (!housing) {
//     return <div className="error-page">{t('notFound')}</div>;
//   }

//   const mapCenter = {
//     lat: housing.latitude || 3.848,
//     lng: housing.longitude || 11.502,
//   };


//   const getStatusLabel = (status) => {
//   const map = {
//     disponible: t('status_available'),
//     reserve: t('status_reserved'),
//     occupe: t('status_occupied'),
//   };

//   return map[status] || status;
// };
//           {/* Bouton de retour */}
//   const handleBack = () => {
//   if (window.history.state && window.history.state.idx > 0) {
//     navigate(-1);
//   } else {
//     navigate('/'); // Fallback vers l'accueil si aucune page précédente
//   }
// };
//        {/* FIN BOUTTON DE RETOUR */}


//   return (
//     <div className="housing-detail-page">
      
//         {/* Bouton de retour */}
//         <div className="detail-back">
//             <button className="btn btn-secondary back-btn" onClick={handleBack}>
//               ←{t("back")}
//             </button>
//           </div>
//        {/* FIN BOUTTON DE RETOUR */}

//       <div className="container">
//         {/* Breadcrumb */}
//         <nav className="breadcrumb">
//           <a href="/">{t('home')}</a> / 
//           <a href="/search">{t('search')}</a> / 
//           <span>{housing.title}</span>
//         </nav>

//         {/* Images Gallery */}
//         <div className="gallery-section">
//           <div className="main-image">
//             <img
//               src={housing.images?.[selectedImage]?.image || '/placeholder.jpg'}
//               alt={housing.title}
//             />
            
//              {/* Badge statut */}
//         <span className={`status-badge status-${housing.status}`}>
//   {getStatusLabel(housing.status)}
// </span>
//           </div>

//           <div className="thumbnail-grid">
//             {housing.images?.map((img, index) => (
//               <img
//                 key={index}
//                 src={img.image}
//                 alt={`${housing.title} ${index + 1}`}
//                 className={selectedImage === index ? 'active' : ''}
//                 onClick={() => setSelectedImage(index)}
//               />
//             ))}
//           </div>
//         </div>

//         <div className="detail-content">
//           {/* Info principale */}
//           <div className="main-info">
//             <div className="title-section">
//               <h1>{housing.display_name}</h1>
//               <div className="price-tag">{formatPrice(housing.price)}/mois</div>
//             </div>

//             <div className="location">
//               <FaMapMarkerAlt /> {housing.district?.name}, {housing.city?.name}, {housing.region?.name}
//             </div>

//             <div className="features-bar">
//               <div className="feature">
//                 <FaBed /> {housing.rooms} {t('rooms')}
//               </div>
//               <div className="feature">
//                 <FaBath /> {housing.bathrooms} {t('baths')}
//               </div>
//               <div className="feature">
//                 <FaRuler /> {housing.area} m²
//               </div>
//               <div className="feature">
//                 <FaEye /> {housing.views_count} {t('views')}
//               </div>
//             </div>

//             <div className="action-buttons">
//               <button className="btn btn-outline" onClick={handleLike}>
//                 {housing.is_liked ? <FaHeart /> : <FaRegHeart />}
//                 {t('favorites')}
//               </button>

//               <button className="btn btn-primary" onClick={() => setShowVisitModal(true)}>
//                 <FaCalendarAlt /> {t('planVisit')}
//               </button>
//             </div>

//             {/* Description */}
//             <div className="description-section">
//               <h2>{t('description')}</h2>
//               <p>{housing.description}</p>

//               {housing.additional_features && (
//                 <>
//                   <h3>{t('additionalFeatures')}</h3>
//                   <p>{housing.additional_features}</p>
//                 </>
//               )}
//             </div>

//             {/* Vidéo / Visite 360 */}
//             {(housing.video || housing.virtual_360) && (
//               <div className="media-section">
//               <h2>{t('virtualVisit')}</h2>                
//                 {housing.video && (
//                   <video controls className="housing-video">
//                     <source src={housing.video} type="video/mp4" />
//                   </video>
//                 )}

//                 {housing.virtual_360 && (
//                   <a href={housing.virtual_360} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
//                     <FaVideo />{t('tour')}
//                   </a>
//                 )}
//               </div>
//             )}

//             {/* Map */}
//             {housing.latitude && housing.longitude && (
//               <div className="map-section">
//                 <h2>{t('location')}</h2>
//                 <LoadScript googleMapsApiKey={import.meta.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
//                   <GoogleMap
//                     mapContainerStyle={{ width: '100%', height: '400px' }}
//                     center={mapCenter}
//                     zoom={15}
//                   >
//                     <Marker position={mapCenter} />
//                   </GoogleMap>
//                 </LoadScript>
                
//                 <a
//                   href={`https://www.google.com/maps/dir/?api=1&destination=${housing.latitude},${housing.longitude}`}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="btn btn-outline mt-3"
//                 >
//                   {t('route')}
//                 </a>
//               </div>
//             )}
//           </div>

//           {/* Sidebar Contact */}
//           <aside className="contact-sidebar">
//             <div className="owner-card">
//               <img
//                 src={housing.owner?.photo || '/default-avatar.png'}
//                 alt={housing.owner?.username}
//                 className="owner-avatar"
//               />
//               <h3>{housing.owner?.username}</h3>
//               <p>{t('owner')}</p>
//             </div>

//             <div className="contact-methods">
//               <button className="contact-btn whatsapp" onClick={() => window.open(`https://wa.me/${housing.owner?.phone}`)}>
//                 <FaWhatsapp /> WhatsApp
//               </button>

//               <button className="contact-btn phone" onClick={() => window.location.href = `tel:${housing.owner?.phone}`}>
//                 <FaPhone /> {t('call')}
//               </button>

//               <button className="contact-btn email" onClick={handleContactOwner}>
//                 <FaEnvelope /> {t('message')}
//               </button>
//             </div>

//             <div className="info-box">
//               <h4>{t('info')}</h4>
// <p><strong>{t('published')}:</strong> {formatDate(housing.created_at)}</p>
// <p><strong>{t('type')}:</strong> {housing.housing_type?.name}</p>
// <p><strong>{t('category')}:</strong> {housing.category?.name}</p>
//             </div>
//           </aside>
//         </div>
//       </div>

//       {/* Modal Planification Visite */}
//       {showVisitModal && (
//         <div className="modal-overlay" onClick={() => setShowVisitModal(false)}>
//           <div className="modal-content" onClick={(e) => e.stopPropagation()}>
//             <h2>{t('planVisit')}</h2>
//             <form onSubmit={handlePlanVisit}>
//               <div className="form-group">
//                 <label>{t('date')}</label>
//                 <input
//                   type="date"
//                   value={visitDate}
//                   onChange={(e) => setVisitDate(e.target.value)}
//                   min={new Date().toISOString().split('T')[0]}
//                   required
//                 />
//               </div>

//               <div className="form-group">
//                 <label>{t('time')}</label>
//                 <input
//                   type="time"
//                   value={visitTime}
//                   onChange={(e) => setVisitTime(e.target.value)}
//                   required
//                 />
//               </div>

//               <div className="modal-actions">
//                 <button type="button" className="btn btn-outline" onClick={() => setShowVisitModal(false)}>
//                   {t('cancel')}
//                 </button>
//                 <button type="submit" className="btn btn-primary">
//                   {t('confirm')}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default HousingDetailPage;







// ============================================================
// src/pages/HousingDetailPage.jsx — VERSION MISE À JOUR
// Changements vs votre version :
//   1. ✅ ?action=visit → ouvre automatiquement le modal visite
//   2. ✅ ?action=contact → démarre la conversation directement
//   3. ✅ Google Maps remplacé par Leaflet (gratuit, déjà installé)
//   4. ✅ Itinéraire OSRM intégré (même moteur que la carte de recherche)
//   5. ✅ Meilleur affichage des images (galerie améliorée)
//   6. ✅ Compatibilité complète avec votre code existant
// ============================================================

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useAuth }          from '../contexts/AuthContext';
import { housingService }   from '../services/housingService';
import { useTheme }         from '../contexts/ThemeContext';
import {
  FaBed, FaBath, FaRuler, FaMapMarkerAlt, FaHeart, FaRegHeart,
  FaWhatsapp, FaPhone, FaEnvelope, FaCalendarAlt, FaVideo, FaEye,
  FaRoute, FaArrowLeft, FaExpand, FaCheck, FaTimes,
} from 'react-icons/fa';
import { formatPrice, formatDate } from '../utils/helpers';
import { toast } from 'react-toastify';
import 'leaflet/dist/leaflet.css';
import './HousingDetailPage.css';

// ─── Fix icône Leaflet manquante ────────────────────────────
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// ─── Haversine ───────────────────────────────────────────────
function haversine(la1, lo1, la2, lo2) {
  const R = 6371, d2r = Math.PI / 180;
  const dLa = (la2-la1)*d2r, dLo = (lo2-lo1)*d2r;
  const a = Math.sin(dLa/2)**2 + Math.cos(la1*d2r)*Math.cos(la2*d2r)*Math.sin(dLo/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

// ─── Composant interne : itinéraire sur la mini-carte ────────
function ItinLayer({ userLoc, housing }) {
  const map      = useMap();
  const lineRef  = useRef(null);
  const userRef  = useRef(null);

  useEffect(() => {
    if (!userLoc) return;
    // Marqueur utilisateur
    if (userRef.current) map.removeLayer(userRef.current);
    userRef.current = L.circleMarker([userLoc.lat, userLoc.lng], {
      radius: 8, fillColor: '#3B82F6', color: '#fff',
      weight: 3, fillOpacity: 1,
    }).addTo(map).bindTooltip('📍 Votre position');

    // Route OSRM
    const url = `https://router.project-osrm.org/route/v1/driving/${userLoc.lng},${userLoc.lat};${housing.longitude},${housing.latitude}?overview=full&geometries=geojson`;
    fetch(url)
      .then(r => r.json())
      .then(d => {
        if (d.routes?.[0]) {
          const coords = d.routes[0].geometry.coordinates.map(([ln,lt]) => [lt, ln]);
          if (lineRef.current) map.removeLayer(lineRef.current);
          lineRef.current = L.polyline(coords, {
            color: '#F59E0B', weight: 4, opacity: .85, dashArray: '10,5',
          }).addTo(map);
          map.fitBounds(lineRef.current.getBounds(), { padding: [40,40] });
        }
      })
      .catch(() => {
        // Fallback ligne droite
        if (lineRef.current) map.removeLayer(lineRef.current);
        lineRef.current = L.polyline([[userLoc.lat, userLoc.lng],[housing.latitude, housing.longitude]], {
          color: '#F59E0B', weight: 3, dashArray: '8,6',
        }).addTo(map);
        map.fitBounds(lineRef.current.getBounds(), { padding: [40,40] });
      });

    return () => {
      if (lineRef.current) map.removeLayer(lineRef.current);
      if (userRef.current) map.removeLayer(userRef.current);
    };
  }, [userLoc, housing, map]);

  return null;
}

// ════════════════════════════════════════════════════════════
// PAGE PRINCIPALE
// ════════════════════════════════════════════════════════════
const HousingDetailPage = () => {
  const { id }              = useParams();
  const navigate            = useNavigate();
  const [searchParams]      = useSearchParams();   // ← NOUVEAU
  const { user }            = useAuth();
  const { t, language, theme } = useTheme();

  // ── Data ──────────────────────────────────────────────────
  const [housing,       setHousing]       = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  // ── Visit modal ────────────────────────────────────────────
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [visitDate,      setVisitDate]      = useState('');
  const [visitTime,      setVisitTime]      = useState('');
  const [visitLoading,   setVisitLoading]   = useState(false);

  // ── Itinéraire ────────────────────────────────────────────
  const [userLoc,       setUserLoc]       = useState(null);
  const [itinLoading,   setItinLoading]   = useState(false);
  const [itinInfo,      setItinInfo]      = useState(null); // { dist, time }

  // ── Galerie ───────────────────────────────────────────────
  const [lightbox,      setLightbox]      = useState(false);

  // ── Chargement ────────────────────────────────────────────
  useEffect(() => {
    loadHousingDetail();
  }, [id, language]); // eslint-disable-line

  // ── NOUVEAU : Gérer ?action= dans l'URL ───────────────────
  useEffect(() => {
    const action = searchParams.get('action');
    if (!housing) return;            // attendre que le logement soit chargé
    if (action === 'visit')   { setShowVisitModal(true); }
    if (action === 'contact') { handleContactOwner(); }
    if (action === 'itin')    { startItinerary(); }
  }, [housing, searchParams]); // eslint-disable-line

  const loadHousingDetail = async () => {
    setLoading(true);
    try {
      const data = await housingService.getHousing(id);
      setHousing(data);
      await housingService.incrementViews(id);
    } catch (err) {
      console.error(err);
      toast.error(t('notFound') || 'Logement introuvable');
      navigate('/search');
    } finally {
      setLoading(false);
    }
  };

  // ── Like ──────────────────────────────────────────────────
  const handleLike = async () => {
    if (!user) { toast.error(t('loginRequired') || 'Connectez-vous'); navigate('/login'); return; }
    try {
      const result = await housingService.toggleLike(id);
      toast.success(result.liked ? t('addedFavorites') || 'Ajouté aux favoris' : t('removedFavorites') || 'Retiré des favoris');
      loadHousingDetail();
    } catch { toast.error('Erreur'); }
  };

  // ── Contact ───────────────────────────────────────────────
  const handleContactOwner = async () => {
    if (!user) { toast.error(t('loginRequired') || 'Connectez-vous'); navigate('/login'); return; }
    try {
      await housingService.startConversation(id);
      navigate('/dashboard/messages');
      toast.success(t('conversationStarted') || 'Conversation démarrée');
    } catch { toast.error('Erreur'); }
  };

  // ── Visite ────────────────────────────────────────────────
  const handlePlanVisit = async (e) => {
    e.preventDefault();
    if (!user) { toast.error(t('loginRequired') || 'Connectez-vous'); navigate('/login'); return; }
    setVisitLoading(true);
    try {
      await housingService.createVisit({
        housing:   id,
        date:      visitDate,
        time:      visitTime,
        locataire: user.id,
      });
      toast.success(t('visitRequested') || 'Demande de visite envoyée');
      setShowVisitModal(false);
      setVisitDate('');
      setVisitTime('');
      // Retirer ?action=visit de l'URL sans recharger la page
      navigate(`/housings/${id}`, { replace: true });
    } catch (err) {
      console.error('Erreur 400:', err.response?.data);
      toast.error(t('visitError') || 'Erreur lors de la planification');
    } finally {
      setVisitLoading(false);
    }
  };

  // ── Itinéraire ────────────────────────────────────────────
  const startItinerary = () => {
    if (!housing?.latitude || !housing?.longitude) {
      toast.error('Coordonnées GPS non disponibles pour ce logement');
      return;
    }
    setItinLoading(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLoc(loc);
        const dist  = haversine(loc.lat, loc.lng, housing.latitude, housing.longitude);
        const speed = 40; // km/h en voiture
        const mins  = Math.round((dist / speed) * 60);
        setItinInfo({ dist: dist.toFixed(1), time: mins < 60 ? `${mins} min` : `${Math.floor(mins/60)}h${mins%60}min` });
        setItinLoading(false);
        // Scroll vers la carte
        document.getElementById('map-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        toast.success('📍 Position détectée — itinéraire tracé sur la carte');
      },
      () => {
        toast.error('Impossible d\'accéder à votre position. Autorisez la géolocalisation.');
        setItinLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // ── Navigation back ───────────────────────────────────────
  const handleBack = () => {
    if (window.history.state?.idx > 0) navigate(-1);
    else navigate('/search');
  };

  // ── Status label ──────────────────────────────────────────
  const getStatusLabel = (status) => ({
    disponible: t('status_available') || 'Disponible',
    reserve:    t('status_reserved')  || 'Réservé',
    occupe:     t('status_occupied')  || 'Occupé',
  }[status] || status);

  // ─────────────────────────────────────────────────────────
  if (loading) return (
    <div className="hdp-loading">
      <div className="hdp-spinner" />
      <p>{t('loading') || 'Chargement…'}</p>
    </div>
  );

  if (!housing) return (
    <div className="hdp-error"><p>{t('notFound') || 'Logement introuvable'}</p></div>
  );

  const mapCenter = { lat: parseFloat(housing.latitude) || 3.848, lng: parseFloat(housing.longitude) || 11.502 };
  const hasMap    = housing.latitude && housing.longitude;

  return (
    <div className="housing-detail-page">

      {/* ── Bouton retour ── */}
      <div className="detail-back">
        <button className="btn btn-secondary back-btn" onClick={handleBack}>
          <FaArrowLeft /> {t('back') || 'Retour'}
        </button>
      </div>

      <div className="container">

        {/* ── Breadcrumb ── */}
        <nav className="breadcrumb">
          <a href="/">{t('home') || 'Accueil'}</a> /
          <a href="/search">{t('search') || 'Recherche'}</a> /
          <span>{housing.title}</span>
        </nav>

        {/* ── Galerie images ── */}
        <div className="gallery-section">
          <div className="main-image" style={{ position: 'relative', cursor: 'zoom-in' }} onClick={() => setLightbox(true)}>
            <img
              src={housing.images?.[selectedImage]?.image || '/placeholder.jpg'}
              alt={housing.title}
            />
            <span className={`status-badge status-${housing.status}`}>
              {getStatusLabel(housing.status)}
            </span>
            {housing.images?.length > 1 && (
              <div className="hdp-img-count">
                <FaExpand size={11} /> {selectedImage + 1} / {housing.images.length}
              </div>
            )}
          </div>

          {housing.images?.length > 1 && (
            <div className="thumbnail-grid">
              {housing.images.map((img, i) => (
                <img
                  key={i}
                  src={img.image}
                  alt={`${housing.title} ${i + 1}`}
                  className={selectedImage === i ? 'active' : ''}
                  onClick={() => setSelectedImage(i)}
                />
              ))}
            </div>
          )}
        </div>

        <div className="detail-content">

          {/* ════ COLONNE PRINCIPALE ════ */}
          <div className="main-info">

            {/* Titre + prix */}
            <div className="title-section">
              <h1>{housing.display_name || housing.title}</h1>
              <div className="price-tag">{formatPrice(housing.price)}/mois</div>
            </div>

            {/* Localisation */}
            <div className="location">
              <FaMapMarkerAlt />
              {[housing.district?.name, housing.city?.name, housing.region?.name].filter(Boolean).join(', ')}
            </div>

            {/* Stats */}
            <div className="features-bar">
              <div className="feature"><FaBed />   {housing.rooms}      {t('rooms')    || 'ch.'}</div>
              <div className="feature"><FaBath />  {housing.bathrooms}  {t('baths')    || 'sdb'}</div>
              <div className="feature"><FaRuler /> {housing.area} m²</div>
              <div className="feature"><FaEye />   {housing.views_count || 0} {t('views') || 'vues'}</div>
            </div>

            {/* Boutons principaux */}
            <div className="action-buttons">
              <button className="btn btn-outline" onClick={handleLike}>
                {housing.is_liked ? <FaHeart /> : <FaRegHeart />}
                {t('favorites') || 'Favoris'}
              </button>

              <button
                className="btn btn-outline"
                onClick={startItinerary}
                disabled={itinLoading || !hasMap}
                title={!hasMap ? 'Coordonnées GPS manquantes' : ''}
              >
                {itinLoading
                  ? <><span className="hdp-spin-sm" /> Localisation…</>
                  : <><FaRoute /> {t('route') || 'Itinéraire'}</>
                }
              </button>

              <button className="btn btn-primary" onClick={() => setShowVisitModal(true)}>
                <FaCalendarAlt /> {t('planVisit') || 'Planifier une visite'}
              </button>
            </div>

            {/* Info itinéraire (après calcul) */}
            {itinInfo && (
              <div className="hdp-itin-info">
                <span><FaRoute style={{ color: '#F59E0B' }} /> {itinInfo.dist} km</span>
                <span>⏱ {itinInfo.time} en voiture</span>
                <button className="hdp-itin-clear" onClick={() => { setUserLoc(null); setItinInfo(null); }}>
                  <FaTimes size={11} /> Effacer
                </button>
              </div>
            )}

            {/* Description */}
            <div className="description-section">
              <h2>{t('description') || 'Description'}</h2>
              <p>{housing.description}</p>
              {housing.additional_features && (
                <>
                  <h3>{t('additionalFeatures') || 'Équipements supplémentaires'}</h3>
                  <p>{housing.additional_features}</p>
                </>
              )}
            </div>

            {/* Vidéo / 360 */}
            {(housing.video || housing.virtual_360) && (
              <div className="media-section">
                <h2>{t('virtualVisit') || 'Visite virtuelle'}</h2>
                {housing.video && (
                  <video controls className="housing-video">
                    <source src={housing.video} type="video/mp4" />
                  </video>
                )}
                {housing.virtual_360 && (
                  <a href={housing.virtual_360} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
                    <FaVideo /> {t('tour') || 'Visite 360°'}
                  </a>
                )}
              </div>
            )}

            {/* ════ CARTE LEAFLET ════ */}
            {hasMap && (
              <div className="map-section" id="map-section">
                <h2>{t('location') || 'Localisation'}</h2>

                {/* Info itinéraire sur la carte */}
                {itinInfo && (
                  <div className="hdp-map-itin-badge">
                    <FaRoute /> {itinInfo.dist} km · {itinInfo.time}
                    <span style={{ color: 'var(--sp-t3)', marginLeft: 6 }}>(voiture)</span>
                  </div>
                )}

                <MapContainer
                  center={[mapCenter.lat, mapCenter.lng]}
                  zoom={15}
                  style={{ width: '100%', height: 380, borderRadius: 12, overflow: 'hidden' }}
                  zoomControl
                >
                  <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                    attribution='© <a href="https://www.openstreetmap.org/copyright">OSM</a> © <a href="https://carto.com/">CARTO</a>'
                    subdomains="abcd"
                    maxZoom={20}
                  />
                  {/* Marqueur du logement */}
                  <Marker position={[mapCenter.lat, mapCenter.lng]} />
                  {/* Itinéraire (si position utilisateur disponible) */}
                  {userLoc && <ItinLayer userLoc={userLoc} housing={housing} />}
                </MapContainer>

                {/* Boutons sous la carte */}
                <div className="hdp-map-actions">
                  <button
                    className="btn btn-outline"
                    onClick={startItinerary}
                    disabled={itinLoading}
                  >
                    {itinLoading
                      ? <><span className="hdp-spin-sm" /> Localisation…</>
                      : <><FaRoute /> {userLoc ? 'Recalculer' : 'Calculer l\'itinéraire'}</>
                    }
                  </button>

                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${housing.latitude},${housing.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline"
                  >
                    <FaMapMarkerAlt /> Google Maps
                  </a>

                  <a
                    href={`https://www.waze.com/ul?ll=${housing.latitude},${housing.longitude}&navigate=yes`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline"
                  >
                    🚗 Waze
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* ════ SIDEBAR CONTACT ════ */}
          <aside className="contact-sidebar">
            <div className="owner-card">
              <img
                src={housing.owner?.photo || '/default-avatar.png'}
                alt={housing.owner?.username}
                className="owner-avatar"
              />
              <h3>{housing.owner?.username}</h3>
              <p>{t('owner') || 'Propriétaire'}</p>
            </div>

            <div className="contact-methods">
              {housing.owner?.phone && (
                <>
                  <button
                    className="contact-btn whatsapp"
                    onClick={() => window.open(`https://wa.me/${housing.owner.phone.replace(/\s/g, '')}`)}
                  >
                    <FaWhatsapp /> WhatsApp
                  </button>
                  <button
                    className="contact-btn phone"
                    onClick={() => window.location.href = `tel:${housing.owner.phone}`}
                  >
                    <FaPhone /> {t('call') || 'Appeler'}
                  </button>
                </>
              )}
              <button className="contact-btn email" onClick={handleContactOwner}>
                <FaEnvelope /> {t('message') || 'Message'}
              </button>
            </div>

            <div className="info-box">
              <h4>{t('info') || 'Informations'}</h4>
              <p><strong>{t('published') || 'Publié le'} :</strong> {formatDate(housing.created_at)}</p>
              <p><strong>{t('type')     || 'Type'}       :</strong> {housing.housing_type?.name}</p>
              <p><strong>{t('category') || 'Catégorie'}  :</strong> {housing.category?.name}</p>
              {housing.area && (
                <p><strong>Surface :</strong> {housing.area} m²</p>
              )}
            </div>

            {/* Bouton planifier depuis la sidebar */}
            <button
              className="btn btn-primary"
              style={{ width: '100%', marginTop: 12 }}
              onClick={() => setShowVisitModal(true)}
            >
              <FaCalendarAlt /> {t('planVisit') || 'Planifier une visite'}
            </button>
          </aside>
        </div>
      </div>

      {/* ════ LIGHTBOX ════ */}
      {lightbox && (
        <div
          className="hdp-lightbox"
          onClick={() => setLightbox(false)}
        >
          <button className="hdp-lightbox-close" onClick={() => setLightbox(false)}>
            <FaTimes />
          </button>
          <img
            src={housing.images?.[selectedImage]?.image}
            alt={housing.title}
            onClick={e => e.stopPropagation()}
          />
          {housing.images?.length > 1 && (
            <div className="hdp-lightbox-nav">
              <button
                onClick={e => { e.stopPropagation(); setSelectedImage(i => (i - 1 + housing.images.length) % housing.images.length); }}
              >‹</button>
              <span>{selectedImage + 1} / {housing.images.length}</span>
              <button
                onClick={e => { e.stopPropagation(); setSelectedImage(i => (i + 1) % housing.images.length); }}
              >›</button>
            </div>
          )}
        </div>
      )}

      {/* ════ MODAL VISITE ════ */}
      {showVisitModal && (
        <div className="modal-overlay" onClick={() => { setShowVisitModal(false); navigate(`/housings/${id}`, { replace: true }); }}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="hdp-modal-head">
              <h2><FaCalendarAlt style={{ marginRight: 8, color: '#10B981' }} />{t('planVisit') || 'Planifier une visite'}</h2>
              <button
                className="hdp-modal-close"
                onClick={() => { setShowVisitModal(false); navigate(`/housings/${id}`, { replace: true }); }}
              >
                <FaTimes />
              </button>
            </div>

            {/* Rappel du logement */}
            <div className="hdp-modal-housing-recap">
              <img
                src={housing.images?.[0]?.image || '/placeholder.jpg'}
                alt={housing.title}
              />
              <div>
                <strong>{housing.title}</strong>
                <p><FaMapMarkerAlt style={{ fontSize: 10, marginRight: 4 }} />{housing.district?.name}, {housing.city?.name}</p>
                <p style={{ color: '#F59E0B', fontWeight: 700 }}>{formatPrice(housing.price)}/mois</p>
              </div>
            </div>

            <form onSubmit={handlePlanVisit}>
              <div className="form-group">
                <label>{t('date') || 'Date de visite'}</label>
                <input
                  type="date"
                  value={visitDate}
                  onChange={e => setVisitDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              <div className="form-group">
                <label>{t('time') || 'Heure de visite'}</label>
                <input
                  type="time"
                  value={visitTime}
                  onChange={e => setVisitTime(e.target.value)}
                  required
                />
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => { setShowVisitModal(false); navigate(`/housings/${id}`, { replace: true }); }}
                  disabled={visitLoading}
                >
                  {t('cancel') || 'Annuler'}
                </button>
                <button type="submit" className="btn btn-primary" disabled={visitLoading}>
                  {visitLoading
                    ? <><span className="hdp-spin-sm" /> Envoi…</>
                    : <><FaCheck /> {t('confirm') || 'Confirmer'}</>
                  }
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
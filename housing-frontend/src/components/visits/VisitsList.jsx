// // src/components/visits/VisitsList.jsx

// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import './VisitsList.css';

// // API Helpers
// const fetchVisits = async () => {
//   const token = localStorage.getItem('access_token');
//   const response = await fetch('http://localhost:8000/api/visits/', {
//     headers: { 'Authorization': `Bearer ${token}` }
//   });
//   if (!response.ok) throw new Error('Erreur chargement visites');
//   return response.json();
// };

// const createVisit = async (data) => {
//   const token = localStorage.getItem('access_token');
//   const response = await fetch('http://localhost:8000/api/visits/', {
//     method: 'POST',
//     headers: {
//       'Authorization': `Bearer ${token}`,
//       'Content-Type': 'application/json'
//     },
//     body: JSON.stringify(data)
//   });
//   if (!response.ok) {
//     const error = await response.json();
//     throw error;
//   }
//   return response.json();
// };

// const confirmVisit = async (id) => {
//   const token = localStorage.getItem('access_token');
//   const response = await fetch(`http://localhost:8000/api/visits/${id}/confirm/`, {
//     method: 'POST',
//     headers: { 'Authorization': `Bearer ${token}` }
//   });
//   if (!response.ok) throw new Error('Erreur confirmation');
//   return response.json();
// };

// const refuseVisit = async (id, message = '') => {
//   const token = localStorage.getItem('access_token');
//   const response = await fetch(`http://localhost:8000/api/visits/${id}/refuse/`, {
//     method: 'POST',
//     headers: {
//       'Authorization': `Bearer ${token}`,
//       'Content-Type': 'application/json'
//     },
//     body: JSON.stringify({ message })
//   });
//   if (!response.ok) throw new Error('Erreur refus');
//   return response.json();
// };

// const cancelVisit = async (id) => {
//   const token = localStorage.getItem('access_token');
//   const response = await fetch(`http://localhost:8000/api/visits/${id}/`, {
//     method: 'DELETE',
//     headers: { 'Authorization': `Bearer ${token}` }
//   });
//   if (!response.ok) throw new Error('Erreur annulation');
// };

// const VisitsList = ({ userRole = 'locataire' }) => {
//   const [visits, setVisits] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [filter, setFilter] = useState('all'); // all, upcoming, past
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');
//   const [showRefuseModal, setShowRefuseModal] = useState(false);
//   const [selectedVisit, setSelectedVisit] = useState(null);
//   const [refuseMessage, setRefuseMessage] = useState('');
//   const navigate = useNavigate();

//   useEffect(() => {
//     loadVisits();
//   }, []);

//   const loadVisits = async () => {
//     try {
//       setLoading(true);
//       setError('');
//       const data = await fetchVisits();
//       setVisits(Array.isArray(data) ? data : data.results || []);
//     } catch (err) {
//       setError('Erreur lors du chargement des visites');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleConfirm = async (id) => {
//     try {
//       setError('');
//       await confirmVisit(id);
//       setSuccess('Visite confirmée avec succès');
//       setTimeout(() => setSuccess(''), 3000);
//       loadVisits();
//     } catch (err) {
//       setError('Erreur lors de la confirmation');
//     }
//   };

//   const handleRefuseClick = (visit) => {
//     setSelectedVisit(visit);
//     setShowRefuseModal(true);
//   };

//   const handleRefuseSubmit = async () => {
//     try {
//       setError('');
//       await refuseVisit(selectedVisit.id, refuseMessage);
//       setSuccess('Visite refusée');
//       setTimeout(() => setSuccess(''), 3000);
//       setShowRefuseModal(false);
//       setRefuseMessage('');
//       loadVisits();
//     } catch (err) {
//       setError('Erreur lors du refus');
//     }
//   };

//   const handleCancel = async (id) => {
//     if (!window.confirm('Êtes-vous sûr de vouloir annuler cette visite ?')) return;
    
//     try {
//       setError('');
//       await cancelVisit(id);
//       setSuccess('Visite annulée');
//       setTimeout(() => setSuccess(''), 3000);
//       loadVisits();
//     } catch (err) {
//       setError('Erreur lors de l\'annulation');
//     }
//   };

//   const getStatusBadge = (status) => {
//     const badges = {
//       attente: { text: 'En attente', class: 'status-waiting' },
//       confirme: { text: 'Confirmée', class: 'status-confirmed' },
//       refuse: { text: 'Refusée', class: 'status-refused' },
//       annule: { text: 'Annulée', class: 'status-cancelled' }
//     };
//     return badges[status] || badges.attente;
//   };

//   const isUpcoming = (visit) => {
//     const visitDate = new Date(`${visit.date}T${visit.time}`);
//     return visitDate > new Date() && visit.status === 'confirme';
//   };

//   const isPast = (visit) => {
//     const visitDate = new Date(`${visit.date}T${visit.time}`);
//     return visitDate < new Date();
//   };

//   const filteredVisits = visits.filter(visit => {
//     if (filter === 'upcoming') return isUpcoming(visit);
//     if (filter === 'past') return isPast(visit);
//     return true;
//   });

//   const stats = {
//     total: visits.length,
//     waiting: visits.filter(v => v.status === 'attente').length,
//     confirmed: visits.filter(v => v.status === 'confirme').length,
//     upcoming: visits.filter(v => isUpcoming(v)).length
//   };

//   if (loading) {
//     return (
//       <div className="visits-loading">
//         <div className="spinner"></div>
//         <p>Chargement des visites...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="visits-container">
//       <div className="visits-header">
//         <h2>
//           {userRole === 'proprietaire' ? 'Demandes de Visites' : 'Mes Visites'}
//         </h2>
//       </div>

//       {/* Stats */}
//       <div className="visits-stats">
//         <div className="stat-card" onClick={() => setFilter('all')}>
//           <div className="stat-number">{stats.total}</div>
//           <div className="stat-label">Total</div>
//         </div>
        
//         {userRole === 'proprietaire' ? (
//           <div className="stat-card orange" onClick={() => setFilter('all')}>
//             <div className="stat-number">{stats.waiting}</div>
//             <div className="stat-label">En attente</div>
//           </div>
//         ) : null}
        
//         <div className="stat-card green" onClick={() => setFilter('all')}>
//           <div className="stat-number">{stats.confirmed}</div>
//           <div className="stat-label">Confirmées</div>
//         </div>
        
//         <div className="stat-card blue" onClick={() => setFilter('upcoming')}>
//           <div className="stat-number">{stats.upcoming}</div>
//           <div className="stat-label">À venir</div>
//         </div>
//       </div>

//       {/* Filters */}
//       <div className="visits-filters">
//         <button
//           className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
//           onClick={() => setFilter('all')}
//         >
//           Toutes
//         </button>
//         <button
//           className={`filter-btn ${filter === 'upcoming' ? 'active' : ''}`}
//           onClick={() => setFilter('upcoming')}
//         >
//           À venir
//         </button>
//         <button
//           className={`filter-btn ${filter === 'past' ? 'active' : ''}`}
//           onClick={() => setFilter('past')}
//         >
//           Passées
//         </button>
//       </div>

//       {/* Alerts */}
//       {error && <div className="alert alert-error">{error}</div>}
//       {success && <div className="alert alert-success">{success}</div>}

//       {/* Visits List */}
//       <div className="visits-list">
//         {filteredVisits.length === 0 ? (
//           <div className="empty-visits">
//             <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
//               <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
//               <line x1="16" y1="2" x2="16" y2="6"></line>
//               <line x1="8" y1="2" x2="8" y2="6"></line>
//               <line x1="3" y1="10" x2="21" y2="10"></line>
//             </svg>
//             <p>Aucune visite</p>
//           </div>
//         ) : (
//           filteredVisits.map(visit => (
//             <div key={visit.id} className="visit-card">
//               <div className="visit-image">
//                 <img
//                   src={visit.housing_image || '/placeholder.jpg'}
//                   alt={visit.housing_title}
//                   onError={(e) => e.target.src = '/placeholder.jpg'}
//                 />
//                 <span className={`visit-status-badge ${getStatusBadge(visit.status).class}`}>
//                   {getStatusBadge(visit.status).text}
//                 </span>
//               </div>

//               <div className="visit-content">
//                 <div className="visit-header">
//                   <h3>{visit.housing_title}</h3>
//                   {userRole === 'proprietaire' && (
//                     <p className="visitor-name">Par: {visit.locataire_name}</p>
//                   )}
//                   {userRole === 'locataire' && (
//                     <p className="owner-name">Propriétaire: {visit.owner_name}</p>
//                   )}
//                 </div>

//                 <div className="visit-info">
//                   <div className="info-item">
//                     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                       <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
//                       <line x1="16" y1="2" x2="16" y2="6"></line>
//                       <line x1="8" y1="2" x2="8" y2="6"></line>
//                       <line x1="3" y1="10" x2="21" y2="10"></line>
//                     </svg>
//                     <span>{new Date(visit.date).toLocaleDateString('fr-FR', {
//                       weekday: 'long',
//                       year: 'numeric',
//                       month: 'long',
//                       day: 'numeric'
//                     })}</span>
//                   </div>

//                   <div className="info-item">
//                     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                       <circle cx="12" cy="12" r="10"></circle>
//                       <polyline points="12 6 12 12 16 14"></polyline>
//                     </svg>
//                     <span>{visit.time}</span>
//                   </div>
//                 </div>

//                 {visit.message && (
//                   <div className="visit-message">
//                     <strong>Message:</strong>
//                     <p>{visit.message}</p>
//                   </div>
//                 )}

//                 {visit.response_message && (
//                   <div className="visit-response">
//                     <strong>Réponse:</strong>
//                     <p>{visit.response_message}</p>
//                   </div>
//                 )}

//                 <div className="visit-actions">
//                   {userRole === 'proprietaire' && visit.status === 'attente' && (
//                     <>
//                       <button 
//                         className="btn btn-success btn-sm"
//                         onClick={() => handleConfirm(visit.id)}
//                       >
//                         ✓ Confirmer
//                       </button>
//                       <button 
//                         className="btn btn-danger btn-sm"
//                         onClick={() => handleRefuseClick(visit)}
//                       >
//                         ✕ Refuser
//                       </button>
//                     </>
//                   )}

//                   {userRole === 'locataire' && visit.status === 'attente' && (
//                     <button 
//                       className="btn btn-outline btn-sm"
//                       onClick={() => handleCancel(visit.id)}
//                     >
//                       Annuler
//                     </button>
//                   )}

//                   <button 
//                     className="btn btn-outline btn-sm"
//                     onClick={() => navigate(`/housing/${visit.housing}`)}
//                   >
//                     Voir le logement
//                   </button>
//                 </div>
//               </div>
//             </div>
//           ))
//         )}
//       </div>

//       {/* Refuse Modal */}
//       {showRefuseModal && (
//         <div className="modal-overlay" onClick={() => setShowRefuseModal(false)}>
//           <div className="modal-content" onClick={e => e.stopPropagation()}>
//             <div className="modal-header">
//               <h3>Refuser la visite</h3>
//               <button 
//                 className="close-btn"
//                 onClick={() => setShowRefuseModal(false)}
//               >
//                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                   <line x1="18" y1="6" x2="6" y2="18"></line>
//                   <line x1="6" y1="6" x2="18" y2="18"></line>
//                 </svg>
//               </button>
//             </div>

//             <div className="modal-body">
//               <p>Logement: <strong>{selectedVisit?.housing_title}</strong></p>
//               <p>Demandeur: <strong>{selectedVisit?.locataire_name}</strong></p>
              
//               <div className="form-group">
//                 <label>Message (optionnel)</label>
//                 <textarea
//                   value={refuseMessage}
//                   onChange={(e) => setRefuseMessage(e.target.value)}
//                   placeholder="Expliquez pourquoi vous refusez cette visite..."
//                   rows="4"
//                 />
//               </div>
//             </div>

//             <div className="modal-actions">
//               <button 
//                 className="btn btn-outline"
//                 onClick={() => setShowRefuseModal(false)}
//               >
//                 Annuler
//               </button>
//               <button 
//                 className="btn btn-danger"
//                 onClick={handleRefuseSubmit}
//               >
//                 Refuser la visite
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default VisitsList;


import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./VisitsList.css";
import { useTheme } from '../../contexts/ThemeContext';

/* ================= API ================= */

const fetchVisits = async () => {
  const token = localStorage.getItem("access_token");

  const response = await fetch("http://localhost:8000/api/visits/", {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!response.ok) throw new Error("Erreur chargement visites");

  return response.json();
};
const confirmVisit = async (id) => {
  const token = localStorage.getItem("access_token");

  const response = await fetch(
    `http://localhost:8000/api/visits/${id}/confirm/`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` }
    }
  );

  if (!response.ok) throw new Error("Erreur confirmation");

  return response.json();
};

const refuseVisit = async (id, message = "") => {
  const token = localStorage.getItem("access_token");

  const response = await fetch(
    `http://localhost:8000/api/visits/${id}/refuse/`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message })
    }
  );

  if (!response.ok) throw new Error("Erreur refus");

  return response.json();
};

const cancelVisit = async (id) => {
  const token = localStorage.getItem("access_token");

  const response = await fetch(
    `http://localhost:8000/api/visits/${id}/`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    }
  );

  if (!response.ok) throw new Error("Erreur annulation");
};

/* ================= COMPONENT ================= */

const VisitsList = ({ userRole = "locataire" }) => {

  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filter, setFilter] = useState("all");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showRefuseModal, setShowRefuseModal] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [refuseMessage, setRefuseMessage] = useState("");
  const { t, language, theme } = useTheme();

  const navigate = useNavigate();

  /* ================= LOAD VISITS ================= */

  useEffect(() => {
    loadVisits();
  }, []);

  const loadVisits = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await fetchVisits();

      setVisits(Array.isArray(data) ? data : data.results || []);

    } catch {
      setError("Erreur chargement visites");
    } finally {
      setLoading(false);
    }
  };

  /* ================= ACTIONS ================= */

  const handleConfirm = async (id) => {
    try {
      await confirmVisit(id);
      setSuccess("Visite confirmée");
      loadVisits();
    } catch {
      setError("Erreur confirmation");
    }
  };

  const handleCancel = async (id) => {

    if (!window.confirm("Annuler cette visite ?")) return;

    try {
      await cancelVisit(id);
      setSuccess("Visite annulée");
      loadVisits();
    } catch {
      setError("Erreur annulation");
    }
  };

  const handleRefuseClick = (visit) => {
    setSelectedVisit(visit);
    setShowRefuseModal(true);
  };

  const handleRefuseSubmit = async () => {

    try {
      await refuseVisit(selectedVisit.id, refuseMessage);

      setShowRefuseModal(false);
      setRefuseMessage("");

      setSuccess("Visite refusée");

      loadVisits();

    } catch {
      setError("Erreur refus");
    }
  };

  /* ================= STATUS ================= */

  const getStatusBadge = (status) => {

    const badges = {
      attente: { text: "En attente", class: "status-waiting" },
      confirme: { text: "Confirmée", class: "status-confirmed" },
      refuse: { text: "Refusée", class: "status-refused" },
      annule: { text: "Annulée", class: "status-cancelled" }
    };

    return badges[status] || badges.attente;
  };

  /* ================= DATES ================= */

  const isUpcoming = (visit) => {
    const visitDate = new Date(`${visit.date}T${visit.time}`);
    return visitDate > new Date();
  };

  const isPast = (visit) => {
    const visitDate = new Date(`${visit.date}T${visit.time}`);
    return visitDate < new Date();
  };

  /* ================= FILTER ================= */

  const filteredVisits = visits.filter((visit) => {

    if (filter === "waiting") return visit.status === "attente";

    if (filter === "confirmed") return visit.status === "confirme";

    if (filter === "refused") return visit.status === "refuse";

    if (filter === "cancelled") return visit.status === "annule";

    if (filter === "upcoming") return isUpcoming(visit);

    if (filter === "past") return isPast(visit);

    return true;
  });

  /* ================= STATS ================= */

  const stats = {

    total: visits.length,

    waiting: visits.filter(v => v.status === "attente").length,

    confirmed: visits.filter(v => v.status === "confirme").length,

    refused: visits.filter(v => v.status === "refuse").length,

    cancelled: visits.filter(v => v.status === "annule").length,

    upcoming: visits.filter(v => isUpcoming(v)).length,

    past: visits.filter(v => isPast(v)).length
  };

  /* ================= LOADING ================= */

  if (loading) {

    return (
      <div className="visits-loading">
        <div className="spinner"></div>
        <p>{t('visits_loading')}</p>
      </div>
    );
  }

  /* ================= RENDER ================= */

  return (

    <div className="visits-container">

      <div className="visits-header">

        {/* <h2>
          {userRole === "proprietaire"
            ? "Demandes de Visites"
            : "Mes Visites"}
        </h2> */}
        <h2>
  {userRole === "proprietaire" ? t('visits_title_owner') : t("visits_title_tenant")}
</h2>

      </div>

      {/* ================= STATS ================= */}

      <div className="visits-stats">

        <div className="stat-card" onClick={() => setFilter("all")}>
          <div className="stat-number">{stats.total}</div>
<div className="stat-label">{t("visits_stats_total")}</div>
        </div>

        <div className="stat-card orange" onClick={() => setFilter("waiting")}>
          <div className="stat-number">{stats.waiting}</div>
<div className="stat-label">{t("visits_stats_waiting")}</div>
        </div>

        <div className="stat-card green" onClick={() => setFilter("confirmed")}>
          <div className="stat-number">{stats.confirmed}</div>
<div className="stat-label">{t("visits_stats_confirmed")}</div>
        </div>

        <div className="stat-card red" onClick={() => setFilter("refused")}>
          <div className="stat-number">{stats.refused}</div>
<div className="stat-label">{t("visits_stats_refused")}</div>
        </div>

        <div className="stat-card gray" onClick={() => setFilter("cancelled")}>
          <div className="stat-number">{stats.cancelled}</div>
<div className="stat-label">{t("visits_stats_cancelled")}</div>
        </div>

        <div className="stat-card blue" onClick={() => setFilter("upcoming")}>
          <div className="stat-number">{stats.upcoming}</div>
<div className="stat-label">{t("visits_stats_upcoming")}</div>        </div>

      </div>

      {/* ================= FILTERS ================= */}

      <div className="visits-filters">

        <button
          className={`filter-btn ${filter === "all" ? "active" : ""}`}
          onClick={() => setFilter("all")}
        >
          {t("visits_filter_all")}
        </button>

        <button
          className={`filter-btn ${filter === "waiting" ? "active" : ""}`}
          onClick={() => setFilter("waiting")}
        >
          {t("visits_filter_waiting")} 
        </button>

        <button
          className={`filter-btn ${filter === "confirmed" ? "active" : ""}`}
          onClick={() => setFilter("confirmed")}
        >
          {t("visits_filter_confirmed")}
        </button>

        <button
          className={`filter-btn ${filter === "refused" ? "active" : ""}`}
          onClick={() => setFilter("refused")}
        >
          {t("visits_filter_refused")}
        </button>

        <button
          className={`filter-btn ${filter === "cancelled" ? "active" : ""}`}
          onClick={() => setFilter("cancelled")}
        >
          {t("visits_filter_cancelled")}
        </button>

        <button
          className={`filter-btn ${filter === "upcoming" ? "active" : ""}`}
          onClick={() => setFilter("upcoming")}
        >
        {t("visits_filter_upcoming")}
        </button>

        <button
          className={`filter-btn ${filter === "past" ? "active" : ""}`}
          onClick={() => setFilter("past")}
        >
          {t("visits_filter_past")}
        </button>

      </div>

      {/* ================= ALERTS ================= */}

      {error && <div className="alert alert-error">{error}</div>}

      {success && <div className="alert alert-success">{success}</div>}

      {/* ================= LIST ================= */}

      <div className="visits-list">

        {filteredVisits.length === 0 ? (

          <div className="empty-visits">
            <p>{t("visits_empty")}</p>
          </div>

        ) : (

          filteredVisits.map((visit) => (

            <div key={visit.id} className="visit-card">

              <div className="visit-image">

                <img
                  src={visit.housing_image || "/placeholder.jpg"}
                  alt={visit.housing_title}
                />

                <span
                  className={`visit-status-badge ${getStatusBadge(visit.status).class}`}
                >
                  {getStatusBadge(visit.status).text}
                </span>

              </div>

              <div className="visit-content">

                <h3>{visit.housing_title}</h3>

                <p>
                  {userRole === "locataire"
                    ? `${t("visits_label_owner")}: ${visit.owner_name}`
                    : `${t("visits_label_tenant")}: ${visit.locataire_name}`}
                </p>



                <p> <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                       <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
//                       <line x1="16" y1="2" x2="16" y2="6"></line>
//                       <line x1="8" y1="2" x2="8" y2="6"></line>
//                       <line x1="3" y1="10" x2="21" y2="10"></line>
//                     </svg>{new Date(visit.date).toLocaleDateString("fr-FR")}</p>

                <p>  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                       <circle cx="12" cy="12" r="10"></circle>
//                       <polyline points="12 6 12 12 16 14"></polyline>
//                     </svg>{visit.time}</p>



                <div className="visit-actions">

                  {userRole === "proprietaire" &&
                    visit.status === "attente" && (
                      <>
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => handleConfirm(visit.id)}
                        >
                          {t("visits_label_confirm")}
                        </button>

                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleRefuseClick(visit)}
                        >
                          {t("visits_label_refuse")}
                        </button>
                      </>
                    )}

                  {userRole === "locataire" &&
                    visit.status === "attente" && (
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => handleCancel(visit.id)}
                      >
                        {t("visits_label_cancel")}
                      </button>
                    )}

                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => navigate(`/housing/${visit.housing}`)}
                  >
                    {t("visits_label_view_housing")}
                  </button>

                </div>

              </div>

            </div>

          ))
        )}

      </div>

      {/* ================= MODAL REFUS ================= */}

      {showRefuseModal && (

        <div className="modal-overlay">

          <div className="modal-content">

            <h3>{t("visits_modal_title")}</h3>

            <textarea
              value={refuseMessage}
              onChange={(e) => setRefuseMessage(e.target.value)}
              placeholder={t("visits_modal_placeholder")}
            />

            <button onClick={handleRefuseSubmit}>
              {t("visits_modal_submit")}
            </button>

            <button onClick={() => setShowRefuseModal(false)}>
              {t("visits_modal_cancel")}
            </button>

          </div>

        </div>

      )}

    </div>
  );
};

export default VisitsList;
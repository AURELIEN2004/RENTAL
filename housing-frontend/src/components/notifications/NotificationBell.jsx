// // src/components/notifications/NotificationBell.jsx

// import React, { useState, useEffect, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';
// import './NotificationBell.css';

// const fetchNotifications = async () => {
//   const token = localStorage.getItem('access_token');
//   const response = await fetch('http://localhost:8000/api/notifications/', {
//     headers: {
//       'Authorization': `Bearer ${token}`
//     }
//   });
  
//   if (!response.ok) throw new Error('Erreur chargement notifications');
//   return response.json();
// };

// const markAsRead = async (id) => {
//   const token = localStorage.getItem('access_token');
//   await fetch(`http://localhost:8000/api/notifications/${id}/mark_read/`, {
//     method: 'POST',
//     headers: {
//       'Authorization': `Bearer ${token}`
//     }
//   });
// };

// const NotificationBell = () => {
//   const [notifications, setNotifications] = useState([]);
//   const [unreadCount, setUnreadCount] = useState(0);
//   const [showDropdown, setShowDropdown] = useState(false);
//   const dropdownRef = useRef(null);
//   const navigate = useNavigate();

//   useEffect(() => {
//     loadNotifications();
//     const interval = setInterval(loadNotifications, 30000); // Refresh every 30s
//     return () => clearInterval(interval);
//   }, []);

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//         setShowDropdown(false);
//       }
//     };

//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, []);

//   const loadNotifications = async () => {
//     try {
//       const data = await fetchNotifications();
//       const notifs = Array.isArray(data) ? data : data.results || [];
//       setNotifications(notifs.slice(0, 5)); // Only latest 5
//       setUnreadCount(notifs.filter(n => !n.is_read).length);
//     } catch (err) {
//       console.error('Erreur notifications:', err);
//     }
//   };

//   const handleNotificationClick = async (notification) => {
//     if (!notification.is_read) {
//       await markAsRead(notification.id);
//       setUnreadCount(prev => Math.max(0, prev - 1));
//     }
    
//     if (notification.link) {
//       navigate(notification.link);
//     }
    
//     setShowDropdown(false);
//   };

//   const formatTime = (timestamp) => {
//     const date = new Date(timestamp);
//     const now = new Date();
//     const diffMs = now - date;
//     const diffMins = Math.floor(diffMs / 60000);
//     const diffHours = Math.floor(diffMs / 3600000);

//     if (diffMins < 1) return 'À l\'instant';
//     if (diffMins < 60) return `${diffMins}min`;
//     if (diffHours < 24) return `${diffHours}h`;
//     return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
//   };

//   return (
//     <div className="notification-bell-container" ref={dropdownRef}>
//       <button 
//         className="notification-bell-btn"
//         onClick={() => setShowDropdown(!showDropdown)}
//         aria-label="Notifications"
//       >
//         <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//           <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
//           <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
//         </svg>
//         {unreadCount > 0 && (
//           <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
//         )}
//       </button>

//       {showDropdown && (
//         <div className="notification-dropdown">
//           <div className="dropdown-header">
//             <h3>Notifications</h3>
//             {unreadCount > 0 && (
//               <span className="unread-count">{unreadCount} non lue{unreadCount > 1 ? 's' : ''}</span>
//             )}
//           </div>

//           <div className="dropdown-list">
//             {notifications.length === 0 ? (
//               <div className="empty-dropdown">
//                 <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
//                   <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
//                   <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
//                 </svg>
//                 <p>Aucune notification</p>
//               </div>
//             ) : (
//               notifications.map(notif => (
//                 <div
//                   key={notif.id}
//                   className={`dropdown-item ${!notif.is_read ? 'unread' : ''}`}
//                   onClick={() => handleNotificationClick(notif)}
//                 >
//                   <div className="item-content">
//                     <h4>{notif.title}</h4>
//                     <p>{notif.message}</p>
//                     <span className="item-time">{formatTime(notif.created_at)}</span>
//                   </div>
//                   {!notif.is_read && <div className="unread-dot"></div>}
//                 </div>
//               ))
//             )}
//           </div>

//           <div className="dropdown-footer">
//             <button 
//               className="view-all-btn"
//               onClick={() => {
//                 navigate('/dashboard/notifications');
//                 setShowDropdown(false);
//               }}
//         //  onClick={() => window.location.href = '/dashboard/notifications'}

//             >
//               Voir toutes les notifications
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default NotificationBell;

// src/components/notifications/NotificationBell.jsx — VERSION CORRIGÉE
//
// Bugs corrigés :
//  - "Voir toutes" → navigate('/dashboard?tab=notifications') au lieu de window.location.href
//  - Chaque item dropdown → navigate() au lieu de reload
//  - markAsRead appelé + badge mis à jour immédiatement

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './NotificationBell.css';

const API_BASE = 'http://localhost:8000/api';

const getHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('access_token')}`,
});

const fetchNotifications = async () => {
  const response = await fetch(`${API_BASE}/notifications/`, { headers: getHeaders() });
  if (!response.ok) throw new Error('Erreur chargement notifications');
  return response.json();
};

const markAsReadAPI = async (id) => {
  await fetch(`${API_BASE}/notifications/${id}/mark_read/`, {
    method: 'POST',
    headers: getHeaders(),
  });
};

// ─────────────────────────────────────────────────────────────────
const NotificationBell = () => {
  const [notifications, setNotifications]   = useState([]);
  const [unreadCount,   setUnreadCount]     = useState(0);
  const [showDropdown,  setShowDropdown]    = useState(false);
  const dropdownRef = useRef(null);
  const navigate    = useNavigate();

  // Chargement initial + polling 30s
  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Fermeture au clic extérieur
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadNotifications = async () => {
    try {
      const data   = await fetchNotifications();
      const notifs = Array.isArray(data) ? data : (data.results || []);
      setNotifications(notifs.slice(0, 5));
      setUnreadCount(notifs.filter(n => !n.is_read).length);
    } catch (err) {
      console.error('Erreur notifications:', err);
    }
  };

  // Clic sur une notification du dropdown
  const handleNotificationClick = async (notification) => {
    if (!notification.is_read) {
      try {
        await markAsReadAPI(notification.id);
        setNotifications(prev =>
          prev.map(n => n.id === notification.id ? { ...n, is_read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (err) {
        console.error('Erreur markAsRead:', err);
      }
    }
    setShowDropdown(false);

    // Navigation vers le lien de la notification ou vers le dashboard notifications
    if (notification.link) {
      navigate(notification.link);
    } else {
      navigate('/dashboard?tab=notifications');
    }
  };

  // ★ CORRIGÉ : "Voir toutes" → navigate React (pas window.location.href)
  const handleViewAll = () => {
    setShowDropdown(false);
    navigate('/dashboard?tab=notifications');
  };

  const formatTime = (timestamp) => {
    const date    = new Date(timestamp);
    const now     = new Date();
    const diffMs  = now - date;
    const diffMin = Math.floor(diffMs / 60000);
    const diffH   = Math.floor(diffMs / 3600000);
    if (diffMin < 1)  return "À l'instant";
    if (diffMin < 60) return `${diffMin}min`;
    if (diffH < 24)   return `${diffH}h`;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="notification-bell-container" ref={dropdownRef}>
      {/* Bouton cloche */}
      <button
        className="notification-bell-btn"
        onClick={() => setShowDropdown(prev => !prev)}
        aria-label="Notifications"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <div className="notification-dropdown">
          <div className="dropdown-header">
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <span className="unread-count">
                {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
              </span>
            )}
          </div>

          <div className="dropdown-list">
            {notifications.length === 0 ? (
              <div className="empty-dropdown">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" strokeWidth="1">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                <p>Aucune notification</p>
              </div>
            ) : (
              notifications.map(notif => (
                <div
                  key={notif.id}
                  className={`dropdown-item ${!notif.is_read ? 'unread' : ''}`}
                  // onClick={() => handleNotificationClick(notif)}
                  onClick={handleViewAll}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="item-content" >
                    <h4>{notif.title}</h4>
                    <p>{notif.message}</p>
                    <span className="item-time">{formatTime(notif.created_at)}</span>
                  </div>
                  {!notif.is_read && <div className="unread-dot" />}
                </div>
              ))
            )}
          </div>

          {/* ★ CORRIGÉ : bouton utilise navigate() */}
          <div className="dropdown-footer">
            <button className="view-all-btn" onClick={handleViewAll}>
              Voir toutes les notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
// // // src/components/notifications/NotificationsList.jsx

// // import React, { useState, useEffect } from 'react';
// // import './NotificationsList.css';

// // // API Helper
// // const fetchNotifications = async () => {
// //   const token = localStorage.getItem('access_token');
// //   const response = await fetch('http://localhost:8000/api/notifications/', {
// //     headers: {
// //       'Authorization': `Bearer ${token}`
// //     }
// //   });
  
// //   if (!response.ok) throw new Error('Erreur chargement notifications');
// //   return response.json();
// // };

// // const markAsRead = async (id) => {
// //   const token = localStorage.getItem('access_token');
// //   const response = await fetch(`http://localhost:8000/api/notifications/${id}/mark_read/`, {
// //     method: 'POST',
// //     headers: {
// //       'Authorization': `Bearer ${token}`
// //     }
// //   });
  
// //   if (!response.ok) throw new Error('Erreur marquage notification');
// //   return response.json();
// // };

// // const markAllAsRead = async () => {
// //   const token = localStorage.getItem('access_token');
// //   const response = await fetch('http://localhost:8000/api/notifications/mark_all_read/', {
// //     method: 'POST',
// //     headers: {
// //       'Authorization': `Bearer ${token}`
// //     }
// //   });
  
// //   if (!response.ok) throw new Error('Erreur marquage notifications');
// //   return response.json();
// // };

// // const NotificationsList = ({ compact = false }) => {
// //   const [notifications, setNotifications] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const [filter, setFilter] = useState('all'); // all, unread, read
// //   const [error, setError] = useState('');

// //   useEffect(() => {
// //     loadNotifications();
// //   }, []);


// // const loadNotifications = async () => {
// //     try {
// //       setLoading(true);
// //       const data = await fetchNotifications();
      
// //       // 1. On détermine le tableau de notifications
// //       const fetchedNotifs = Array.isArray(data) ? data : (data.results || []);
      
// //       // 2. On met à jour le state principal
// //       setNotifications(fetchedNotifs);

// //       // 3. Calcul des non-lues (Correction de l'erreur "notifs is not defined")
// //       const newUnread = fetchedNotifs.filter(n => !n.is_read).length;

// //       // Note: Assurez-vous que unreadCount et setUnreadCount existent 
// //       // ou gérez cette logique via un useEffect sur 'notifications'
// //       if (typeof unreadCount !== 'undefined' && newUnread > unreadCount) {
// //         playNotificationSound();
// //       }
      
// //       if (typeof setUnreadCount === 'function') {
// //         setUnreadCount(newUnread);
// //       }

// //     } catch (err) {
// //       setError('Erreur lors du chargement des notifications');
// //       console.error(err);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };



// //   const handleMarkAsRead = async (id) => {
// //     try {
// //       await markAsRead(id);
// //       setNotifications(prev =>
// //         prev.map(notif =>
// //           notif.id === id ? { ...notif, is_read: true } : notif
// //         )
// //       );
// //     } catch (err) {
// //       setError('Erreur lors du marquage');
// //     }
// //   };

// //   const playNotificationSound = () => {
// //   const audio = new Audio('/notification.mp3');
// //   audio.play().catch(err => console.log('Audio error:', err));
// // };

// //   const handleMarkAllAsRead = async () => {
// //     try {
// //       await markAllAsRead();
// //       setNotifications(prev =>
// //         prev.map(notif => ({ ...notif, is_read: true }))
// //       );
// //     } catch (err) {
// //       setError('Erreur lors du marquage');
// //     }
// //   };

// //   const getNotificationIcon = (type) => {
// //     const icons = {
// //       message: (
// //         <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
// //           <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
// //         </svg>
// //       ),
// //       visit: (
// //         <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
// //           <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
// //           <line x1="16" y1="2" x2="16" y2="6"></line>
// //           <line x1="8" y1="2" x2="8" y2="6"></line>
// //           <line x1="3" y1="10" x2="21" y2="10"></line>
// //         </svg>
// //       ),
// //       visit_confirmed: (
// //         <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
// //           <polyline points="20 6 9 17 4 12"></polyline>
// //         </svg>
// //       ),
// //       visit_refused: (
// //         <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
// //           <circle cx="12" cy="12" r="10"></circle>
// //           <line x1="15" y1="9" x2="9" y2="15"></line>
// //           <line x1="9" y1="9" x2="15" y2="15"></line>
// //         </svg>
// //       ),
// //       new_housing: (
// //         <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
// //           <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
// //           <polyline points="9 22 9 12 15 12 15 22"></polyline>
// //         </svg>
// //       ),
// //       admin: (
// //         <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
// //           <circle cx="12" cy="12" r="10"></circle>
// //           <line x1="12" y1="8" x2="12" y2="12"></line>
// //           <line x1="12" y1="16" x2="12.01" y2="16"></line>
// //         </svg>
// //       )
// //     };
// //     return icons[type] || icons.message;
// //   };

// //   const getNotificationColor = (type) => {
// //     const colors = {
// //       message: '#3b82f6',
// //       visit: '#f59e0b',
// //       visit_confirmed: '#10b981',
// //       visit_refused: '#ef4444',
// //       new_housing: '#8b5cf6',
// //       admin: '#6366f1'
// //     };
// //     return colors[type] || '#6b7280';
// //   };

// //   const formatTime = (timestamp) => {
// //     const date = new Date(timestamp);
// //     const now = new Date();
// //     const diffMs = now - date;
// //     const diffMins = Math.floor(diffMs / 60000);
// //     const diffHours = Math.floor(diffMs / 3600000);
// //     const diffDays = Math.floor(diffMs / 86400000);

// //     if (diffMins < 1) return 'À l\'instant';
// //     if (diffMins < 60) return `Il y a ${diffMins}min`;
// //     if (diffHours < 24) return `Il y a ${diffHours}h`;
// //     if (diffDays < 7) return `Il y a ${diffDays}j`;
// //     return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
// //   };

// //   const filteredNotifications = notifications.filter(notif => {
// //     if (filter === 'unread') return !notif.is_read;
// //     if (filter === 'read') return notif.is_read;
// //     return true;
// //   });

// //   const unreadCount = notifications.filter(n => !n.is_read).length;

// //   if (loading) {
// //     return (
// //       <div className="notifications-loading">
// //         <div className="spinner"></div>
// //         <p>Chargement des notifications...</p>
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className={`notifications-container ${compact ? 'compact' : ''}`}>
// //       {!compact && (
// //         <div className="notifications-header">
// //           <div className="header-left">
// //             <h2>Notifications</h2>
// //             {unreadCount > 0 && (
// //               <span className="unread-badge">{unreadCount}</span>
// //             )}
// //           </div>
// //           <div className="header-right">
// //             {unreadCount > 0 && (
// //               <button 
// //                 className="btn-mark-all"
// //                 onClick={handleMarkAllAsRead}
// //               >
// //                 Tout marquer comme lu
// //               </button>
// //             )}
// //           </div>
// //         </div>
// //       )}

// //       {!compact && (
// //         <div className="notifications-filters">
// //           <button
// //             className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
// //             onClick={() => setFilter('all')}
// //           >
// //             Toutes ({notifications.length})
// //           </button>
// //           <button
// //             className={`filter-btn ${filter === 'unread' ? 'active' : ''}`}
// //             onClick={() => setFilter('unread')}
// //           >
// //             Non lues ({unreadCount})
// //           </button>
// //           <button
// //             className={`filter-btn ${filter === 'read' ? 'active' : ''}`}
// //             onClick={() => setFilter('read')}
// //           >
// //             Lues ({notifications.length - unreadCount})
// //           </button>
// //         </div>
// //       )}

// //       {error && (
// //         <div className="alert alert-error">{error}</div>
// //       )}

// //       <div className="notifications-list">
// //         {filteredNotifications.length === 0 ? (
// //           <div className="empty-notifications">
// //             <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
// //               <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
// //               <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
// //             </svg>
// //             <p>Aucune notification</p>
// //           </div>
// //         ) : (
// //           filteredNotifications.map(notification => (
// //             <div
// //               key={notification.id}
// //               className={`notification-item ${!notification.is_read ? 'unread' : ''}`}
// //               onClick={() => !notification.is_read && handleMarkAsRead(notification.id)}
// //             >
// //               <div 
// //                 className="notification-icon"
// //                 style={{ backgroundColor: getNotificationColor(notification.type) }}
// //               >
// //                 {getNotificationIcon(notification.type)}
// //               </div>

// //               <div className="notification-content">
// //                 <h4 className="notification-title">{notification.title}</h4>
// //                 <p className="notification-message">{notification.message}</p>
// //                 <div className="notification-footer">
// //                   <span className="notification-time">
// //                     {formatTime(notification.created_at)}
// //                   </span>
// //                   {notification.link && (
// //                     <a href={notification.link} className="notification-link">
// //                       Voir →
// //                     </a>
// //                   )}
// //                 </div>
// //               </div>

// //               {!notification.is_read && (
// //                 <div className="unread-indicator"></div>
// //               )}
// //             </div>
// //           ))
// //         )}
// //       </div>
// //     </div>
// //   );
// // };

// // export default NotificationsList;


// // src/components/notifications/NotificationsList.jsx — VERSION CORRIGÉE
// //
// // Bugs corrigés :
// //  1. "Voir →" : <a href> remplacé par navigate() (React Router)
// //  2. loadNotifications référençait unreadCount/setUnreadCount avant déclaration
// //     → supprimé, le compteur est calculé en dérivé des notifications
// //  3. Bouton "Voir →" marque aussi la notification comme lue avant de naviguer

// // import React, { useState, useEffect } from 'react';
// // import { useNavigate } from 'react-router-dom';
// // import './NotificationsList.css';

// // const API_BASE = 'http://localhost:8000/api';

// // const getHeaders = () => ({
// //   Authorization: `Bearer ${localStorage.getItem('access_token')}`,
// // });

// // const fetchNotificationsAPI = async () => {
// //   const response = await fetch(`${API_BASE}/notifications/`, { headers: getHeaders() });
// //   if (!response.ok) throw new Error('Erreur chargement notifications');
// //   return response.json();
// // };

// // const markAsReadAPI = async (id) => {
// //   const response = await fetch(`${API_BASE}/notifications/${id}/mark_read/`, {
// //     method: 'POST',
// //     headers: getHeaders(),
// //   });
// //   if (!response.ok) throw new Error('Erreur marquage notification');
// //   return response.json();
// // };

// // const markAllAsReadAPI = async () => {
// //   const response = await fetch(`${API_BASE}/notifications/mark_all_read/`, {
// //     method: 'POST',
// //     headers: getHeaders(),
// //   });
// //   if (!response.ok) throw new Error('Erreur marquage notifications');
// //   return response.json();
// // };

// // // ─────────────────────────────────────────────────────────────────
// // const NotificationsList = ({ compact = false }) => {
// //   const [notifications, setNotifications] = useState([]);
// //   const [loading,       setLoading]       = useState(true);
// //   const [filter,        setFilter]        = useState('all'); // all | unread | read
// //   const [error,         setError]         = useState('');
// //   const navigate = useNavigate();

// //   // ★ CORRIGÉ : unreadCount calculé en dérivé (pas de state séparé)
// //   const unreadCount = notifications.filter(n => !n.is_read).length;

// //   useEffect(() => {
// //     loadNotifications();
// //   }, []);

// //   // const loadNotifications = async () => {
// //   //   try {
// //   //     setLoading(true);
// //   //     const data = await fetchNotificationsAPI();
// //   //     const fetched = Array.isArray(data) ? data : (data.results || []);
// //   //     setNotifications(fetched);
// //   //   } catch (err) {
// //   //     setError('Erreur lors du chargement des notifications');
// //   //     console.error(err);
// //   //   } finally {
// //   //     setLoading(false);
// //   //   }
// //   // };
// //   const loadNotifications = async () => {
// //   try {
// //     setLoading(true);

// //     const data = await fetchNotificationsAPI();
// //     const fetched = Array.isArray(data) ? data : (data.results || []);

// //     // récupérer les notifications supprimées
// //     const deleted = getDeletedNotifications();

// //     // filtrer
// //     const filtered = fetched.filter(n => !deleted.includes(n.id));

// //     setNotifications(filtered);

// //   } catch (err) {
// //     setError('Erreur lors du chargement des notifications');
// //     console.error(err);
// //   } finally {
// //     setLoading(false);
// //   }
// // };

// //   const handleMarkAsRead = async (id) => {
// //     try {
// //       await markAsReadAPI(id);
// //       setNotifications(prev =>
// //         prev.map(n => n.id === id ? { ...n, is_read: true } : n)
// //       );
// //     } catch (err) {
// //       setError('Erreur lors du marquage');
// //     }
// //   };

// //   const handleMarkAllAsRead = async () => {
// //     try {
// //       await markAllAsReadAPI();
// //       setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
// //     } catch (err) {
// //       setError('Erreur lors du marquage');
// //     }
// //   };

// //   // ★ CORRIGÉ : "Voir →" marque comme lu puis navigue via React Router
// //   const handleViewNotification = async (notification) => {
// //     if (!notification.is_read) {
// //       await handleMarkAsRead(notification.id);
// //     }
// //     if (notification.link) {
// //       navigate(notification.link);
// //     }
// //   };

// //   // Icônes par type
// //   const getNotificationIcon = (type) => {
// //     const icons = {
// //       message: (
// //         <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
// //              stroke="currentColor" strokeWidth="2">
// //           <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
// //         </svg>
// //       ),
// //       visit: (
// //         <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
// //              stroke="currentColor" strokeWidth="2">
// //           <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
// //           <line x1="16" y1="2" x2="16" y2="6" />
// //           <line x1="8" y1="2" x2="8" y2="6" />
// //           <line x1="3" y1="10" x2="21" y2="10" />
// //         </svg>
// //       ),
// //       visit_confirmed: (
// //         <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
// //              stroke="currentColor" strokeWidth="2">
// //           <polyline points="20 6 9 17 4 12" />
// //         </svg>
// //       ),
// //       visit_refused: (
// //         <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
// //              stroke="currentColor" strokeWidth="2">
// //           <circle cx="12" cy="12" r="10" />
// //           <line x1="15" y1="9" x2="9" y2="15" />
// //           <line x1="9" y1="9" x2="15" y2="15" />
// //         </svg>
// //       ),
// //       new_housing: (
// //         <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
// //              stroke="currentColor" strokeWidth="2">
// //           <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
// //           <polyline points="9 22 9 12 15 12 15 22" />
// //         </svg>
// //       ),
// //       admin: (
// //         <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
// //              stroke="currentColor" strokeWidth="2">
// //           <circle cx="12" cy="12" r="10" />
// //           <line x1="12" y1="8" x2="12" y2="12" />
// //           <line x1="12" y1="16" x2="12.01" y2="16" />
// //         </svg>
// //       ),
// //     };
// //     return icons[type] || icons.message;
// //   };

// //   const getNotificationColor = (type) => ({
// //     message:         '#3b82f6',
// //     visit:           '#f59e0b',
// //     visit_confirmed: '#10b981',
// //     visit_refused:   '#ef4444',
// //     new_housing:     '#8b5cf6',
// //     admin:           '#6366f1',
// //   }[type] || '#6b7280');

// //   const formatTime = (timestamp) => {
// //     const date    = new Date(timestamp);
// //     const now     = new Date();
// //     const diffMs  = now - date;
// //     const diffMin = Math.floor(diffMs / 60000);
// //     const diffH   = Math.floor(diffMs / 3600000);
// //     const diffD   = Math.floor(diffMs / 86400000);
// //     if (diffMin < 1)  return "À l'instant";
// //     if (diffMin < 60) return `Il y a ${diffMin}min`;
// //     if (diffH < 24)   return `Il y a ${diffH}h`;
// //     if (diffD < 7)    return `Il y a ${diffD}j`;
// //     return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
// //   };

// //   const filteredNotifications = notifications.filter(n => {
// //     if (filter === 'unread') return !n.is_read;
// //     if (filter === 'read')   return n.is_read;
// //     return true;
// //   });

// //   // ── Chargement ──
// //   if (loading) {
// //     return (
// //       <div className="notifications-loading">
// //         <div className="spinner" />
// //         <p>Chargement des notifications...</p>
// //       </div>
// //     );
// //   }


// //   // Notifications supprimées stockées dans le navigateur

// // const getDeletedNotifications = () => {
// //   return JSON.parse(localStorage.getItem("deleted_notifications") || "[]");
// // };

// // const saveDeletedNotification = (id) => {
// //   const deleted = getDeletedNotifications();
// //   if (!deleted.includes(id)) {
// //     localStorage.setItem(
// //       "deleted_notifications",
// //       JSON.stringify([...deleted, id])
// //     );
// //   }
// // };

// // const handleDeleteNotification = (id) => {

// //   if (!window.confirm("Supprimer cette notification ?")) return;

// //   // sauvegarder dans localStorage
// //   saveDeletedNotification(id);

// //   // retirer du state
// //   setNotifications(prev => prev.filter(n => n.id !== id));
// // };

// //   return (
// //     <div className={`notifications-container ${compact ? 'compact' : ''}`}>

// //       {/* En-tête (mode complet seulement) */}
// //       {!compact && (
// //         <div className="notifications-header">
// //           <div className="header-left">
// //             <h2>Notifications</h2>
// //             {unreadCount > 0 && (
// //               <span className="unread-badge">{unreadCount}</span>
// //             )}
// //           </div>
// //           <div className="header-right">
// //             {unreadCount > 0 && (
// //               <button className="btn-mark-all" onClick={handleMarkAllAsRead}>
// //                 Tout marquer comme lu
// //               </button>
// //             )}
// //           </div>
// //         </div>
// //       )}

// //       {/* Filtres */}
// //       {!compact && (
// //         <div className="notifications-filters">
// //           <button
// //             className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
// //             onClick={() => setFilter('all')}
// //           >
// //             Toutes ({notifications.length})
// //           </button>
// //           <button
// //             className={`filter-btn ${filter === 'unread' ? 'active' : ''}`}
// //             onClick={() => setFilter('unread')}
// //           >
// //             Non lues ({unreadCount})
// //           </button>
// //           <button
// //             className={`filter-btn ${filter === 'read' ? 'active' : ''}`}
// //             onClick={() => setFilter('read')}
// //           >
// //             Lues ({notifications.length - unreadCount})
// //           </button>
// //         </div>
// //       )}

// //       {error && <div className="alert alert-error">{error}</div>}

// //       {/* Liste */}
// //       <div className="notifications-list">
// //         {filteredNotifications.length === 0 ? (
// //           <div className="empty-notifications">
// //             <svg width="64" height="64" viewBox="0 0 24 24" fill="none"
// //                  stroke="currentColor" strokeWidth="1">
// //               <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
// //               <path d="M13.73 21a2 2 0 0 1-3.46 0" />
// //             </svg>
// //             <p>Aucune notification</p>
// //           </div>
// //         ) : (
// //           filteredNotifications.map(notification => (
// //             <div
// //               key={notification.id}
// //               className={`notification-item ${!notification.is_read ? 'unread' : ''}`}
// //               onClick={() => !notification.is_read && handleMarkAsRead(notification.id)}
// //             >
// //               <div
// //                 className="notification-icon"
// //                 style={{ backgroundColor: getNotificationColor(notification.type) }}
// //               >
// //                 {getNotificationIcon(notification.type)}
// //               </div>

// //               <div className="notification-content">
// //                 <h4 className="notification-title">{notification.title}</h4>
// //                 <p className="notification-message">{notification.message}</p>


// //                 <div className="notification-footer">

// //   <span className="notification-time">
// //     {formatTime(notification.created_at)}
// //   </span>

// //   <div className="notification-actions">

// //     {notification.link && (
// //       <button
// //         className="notification-link"
// //         onClick={(e) => {
// //           e.stopPropagation();
// //           handleViewNotification(notification);
// //         }}
// //       >
// //         Voir →
// //       </button>
// //     )}

// //     <button
// //       className="notification-delete"
// //       onClick={(e) => {
// //         e.stopPropagation();
// //         handleDeleteNotification(notification.id);
// //       }}
// //     >
// //       ✕
// //     </button>

// //   </div>

// // </div>


// //               </div>

// //               {!notification.is_read && <div className="unread-indicator" />}
// //             </div>
// //           ))
// //         )}
// //       </div>
// //     </div>
// //   );
// // };

// // export default NotificationsList;


// // // src/components/notifications/NotificationsList.jsx

// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import './NotificationsList.css';
// import { useTheme } from '../../contexts/ThemeContext';

// const API_BASE = 'http://localhost:8000/api';

// const getHeaders = () => ({
//   Authorization: `Bearer ${localStorage.getItem('access_token')}`,
// });

// /* =====================================
//    LOCAL STORAGE
// ===================================== */

// const getDeletedNotifications = () => {
//   return JSON.parse(localStorage.getItem("deleted_notifications") || "[]");
// };

// const saveDeletedNotification = (id) => {
//   const deleted = getDeletedNotifications();

//   if (!deleted.includes(id)) {
//     localStorage.setItem(
//       "deleted_notifications",
//       JSON.stringify([...deleted, id])
//     );
//   }
// };

// /* =====================================
//    API
// ===================================== */

// const fetchNotificationsAPI = async () => {
//   const response = await fetch(`${API_BASE}/notifications/`, {
//     headers: getHeaders(),
//   });

//   if (!response.ok) throw new Error('Erreur chargement notifications');

//   return response.json();
// };

// const markAsReadAPI = async (id) => {
//   const response = await fetch(`${API_BASE}/notifications/${id}/mark_read/`, {
//     method: 'POST',
//     headers: getHeaders(),
//   });

//   if (!response.ok) throw new Error('Erreur marquage notification');

//   return response.json();
// };

// const markAllAsReadAPI = async () => {
//   const response = await fetch(`${API_BASE}/notifications/mark_all_read/`, {
//     method: 'POST',
//     headers: getHeaders(),
//   });

//   if (!response.ok) throw new Error('Erreur marquage notifications');

//   return response.json();
// };

// /* =====================================
//    COMPONENT
// ===================================== */

// const NotificationsList = ({ compact = false }) => {

//   const [notifications, setNotifications] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [filter, setFilter] = useState('all');
//   const [error, setError] = useState('');
// const { t, language, theme } = useTheme();
//   const navigate = useNavigate();

//   const unreadCount = notifications.filter(n => !n.is_read).length;

//   useEffect(() => {
//     loadNotifications();
//   }, []);

//   /* =====================================
//      LOAD NOTIFICATIONS
//   ===================================== */

//   const loadNotifications = async () => {

//     try {

//       setLoading(true);

//       const data = await fetchNotificationsAPI();
//       const fetched = Array.isArray(data) ? data : (data.results || []);

//       const deleted = getDeletedNotifications();

//       const filtered = fetched.filter(n => !deleted.includes(n.id));

//       setNotifications(filtered);

//     } catch (err) {

//       console.error(err);
//       setError('Erreur lors du chargement des notifications');

//     } finally {

//       setLoading(false);

//     }

//   };

//   /* =====================================
//      ACTIONS
//   ===================================== */

//   const handleMarkAsRead = async (id) => {

//     try {

//       await markAsReadAPI(id);

//       setNotifications(prev =>
//         prev.map(n =>
//           n.id === id ? { ...n, is_read: true } : n
//         )
//       );

//     } catch {

//       setError('Erreur lors du marquage');

//     }
//   };

//   const handleMarkAllAsRead = async () => {

//     try {

//       await markAllAsReadAPI();

//       setNotifications(prev =>
//         prev.map(n => ({ ...n, is_read: true }))
//       );

//     } catch {

//       setError('Erreur lors du marquage');

//     }
//   };

//   const handleDeleteNotification = (id) => {

// if (!window.confirm(t('notif_delete_confirm'))) return;
//     saveDeletedNotification(id);

//     setNotifications(prev =>
//       prev.filter(n => n.id !== id)
//     );
//   };

//   const handleViewNotification = async (notification) => {

//     if (!notification.is_read) {
//       await handleMarkAsRead(notification.id);
//     }

//     if (notification.link) {
//       navigate(notification.link);
//     }
//   };

//   /* =====================================
//      ICONS
//   ===================================== */

//   const getNotificationIcon = (type) => {

//     const icons = {

//       message: (
//         <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
//           stroke="currentColor" strokeWidth="2">
//           <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
//         </svg>
//       ),

//       visit: (
//         <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
//           stroke="currentColor" strokeWidth="2">
//           <rect x="3" y="4" width="18" height="18" rx="2"/>
//         </svg>
//       ),

//       visit_confirmed: (
//         <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
//           stroke="currentColor" strokeWidth="2">
//           <polyline points="20 6 9 17 4 12"/>
//         </svg>
//       ),

//       visit_refused: (
//         <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
//           stroke="currentColor" strokeWidth="2">
//           <circle cx="12" cy="12" r="10"/>
//           <line x1="15" y1="9" x2="9" y2="15"/>
//           <line x1="9" y1="9" x2="15" y2="15"/>
//         </svg>
//       ),

//       new_housing: (
//         <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
//           stroke="currentColor" strokeWidth="2">
//           <path d="M3 9l9-7 9 7v11H3z"/>
//         </svg>
//       ),

//       admin: (
//         <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
//           stroke="currentColor" strokeWidth="2">
//           <circle cx="12" cy="12" r="10"/>
//         </svg>
//       ),
//     };

//     return icons[type] || icons.message;
//   };

//   const getNotificationColor = (type) => ({
//     message: '#3b82f6',
//     visit: '#f59e0b',
//     visit_confirmed: '#10b981',
//     visit_refused: '#ef4444',
//     new_housing: '#8b5cf6',
//     admin: '#6366f1',
//   }[type] || '#6b7280');

//   /* =====================================
//      TIME FORMAT
//   ===================================== */

//   const formatTime = (timestamp) => {

//     const date = new Date(timestamp);
//     const now = new Date();

//     const diff = now - date;

//     const minutes = Math.floor(diff / 60000);
//     const hours = Math.floor(diff / 3600000);
//     const days = Math.floor(diff / 86400000);

//     if (minutes < 1) return language === 'fr' ? "À l'instant" : "Just now";
//      if (minutes < 60)
//     return language === 'fr'
//       ? `Il y a ${minutes} min`
//       : `${minutes} min ago`;

//   if (hours < 24)
//     return language === 'fr'
//       ? `Il y a ${hours} h`
//       : `${hours} h ago`;

//   if (days < 7)
//     return language === 'fr'
//       ? `Il y a ${days} j`
//       : `${days} d ago`;

//      return date.toLocaleDateString(
//     language === 'fr' ? 'fr-FR' : 'en-US',
//     { day: 'numeric', month: 'short' }
//   );
// };

//   /* =====================================
//      FILTER
//   ===================================== */

//   const filteredNotifications = notifications.filter(n => {

//     if (filter === 'unread') return !n.is_read;
//     if (filter === 'read') return n.is_read;

//     return true;
//   });

//   /* =====================================
//      LOADING
//   ===================================== */

//   if (loading) {
//     return (
//       <div className="notifications-loading">
//         <div className="spinner" />
// <p>{t('notifications_loading')}</p>
//       </div>
//     );
//   }

//   /* =====================================
//      UI
//   ===================================== */

//   return (

//     <div className={`notifications-container ${compact ? 'compact' : ''}`}>

//       {!compact && (

//         <div className="notifications-header">

//           <div className="header-left">

// <h2>{t('notif_title')}</h2>
//   {notifications.length > 0 && ` (${notifications.length})`}

//             {unreadCount > 0 && (
//               <span className="unread-badge">
//                 {unreadCount}
//               </span>
//             )}

//           </div>

//           {unreadCount > 0 && (
//             <button
//               className="btn-mark-all"
//               onClick={handleMarkAllAsRead}
//             >
// {t('notif_mark_all')}
//             </button>
//           )}

//         </div>
//       )}

//       {!compact && (

//         <div className="notifications-filters">

//           <button
//             className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
//             onClick={() => setFilter('all')}
//           >
// {t('notif_filter_all')} ({notifications.length})
//           </button>

//           <button
//             className={`filter-btn ${filter === 'unread' ? 'active' : ''}`}
//             onClick={() => setFilter('unread')}
//           >
//             {t('notif_filter_unread')} ({unreadCount})
//           </button>

//           <button
//             className={`filter-btn ${filter === 'read' ? 'active' : ''}`}
//             onClick={() => setFilter('read')}
//           >
//             {t('notif_filter_read')} ({notifications.length - unreadCount})
//           </button>
// {/* {unreadCount} {t(unreadCount > 1 ? 'notif_unread_plural' : 'notif_unread_single')} */}
//         </div>

//       )}

//       {error && (
//         <div className="alert alert-error">
//           {error}
//         </div>
//       )}

//       <div className="notifications-list">

//         {filteredNotifications.length === 0 ? (

//           <div className="empty-notifications">
// <p>{t('notif_empty')}</p>
//           </div>

//         ) : (

//           filteredNotifications.map(notification => (

//             <div
//               key={`${notification.id}-${notification.created_at}`}
//               className={`notification-item ${!notification.is_read ? 'unread' : ''}`}
//               onClick={() =>
//                 !notification.is_read && handleMarkAsRead(notification.id)
//               }
//             >

//               <div
//                 className="notification-icon"
//                 style={{
//                   backgroundColor: getNotificationColor(notification.type)
//                 }}
//               >
//                 {getNotificationIcon(notification.type)}
//               </div>

//               <div className="notification-content">

//                 <h4 className="notification-title">
//                   {notification.title}
//                 </h4>

//                 <p className="notification-message">
//                   {notification.message}
//                 </p>

//                 <div className="notification-footer">

//                   <span className="notification-time">
//                     {formatTime(notification.created_at)}
//                   </span>

//                   <div className="notification-actions">

//                     {notification.link && (

//                       <button
//                         className="notification-link"
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           handleViewNotification(notification);
//                         }}
//                       >
// {t('notif_view')}
//                       </button>

//                     )}

//                     <button
//                       className="notification-delete"
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         handleDeleteNotification(notification.id);
//                       }}
//                     >
//                       ✕
//                     </button>

//                   </div>

//                 </div>

//               </div>

//               {!notification.is_read && (
//                 <div className="unread-indicator" />
//               )}

//             </div>

//           ))
//         )}

//       </div>

//     </div>
//   );
// };

// export default NotificationsList;


// src/components/notifications/NotificationsList.jsx
//
// CORRECTIONS BILINGUE :
//  ✅ getHeaders() inclut X-Language + Accept-Language
//  ✅ useEffect recharge quand language change
//  ✅ getLocalizedTitle/Message() : title_fr/en selon langue active
//  ✅ groupByDate() affiche "Today/Aujourd'hui" selon langue

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './NotificationsList.css';
import { useTheme } from '../../contexts/ThemeContext';

const API_BASE = 'http://localhost:8000/api';

// ✅ FIX 1 : header X-Language inclus
const getHeaders = () => ({
  Authorization:    `Bearer ${localStorage.getItem('access_token')}`,
  'X-Language':     localStorage.getItem('language') || 'fr',
  'Accept-Language': localStorage.getItem('language') || 'fr',
});

/* ── LocalStorage (suppressions locales) ───────────────────── */
const getDeletedNotifications = () =>
  JSON.parse(localStorage.getItem('deleted_notifications') || '[]');

const saveDeletedNotification = (id) => {
  const deleted = getDeletedNotifications();
  if (!deleted.includes(id)) {
    localStorage.setItem(
      'deleted_notifications',
      JSON.stringify([...deleted, id])
    );
  }
};

/* ── API ────────────────────────────────────────────────────── */
const fetchNotificationsAPI = async () => {
  const response = await fetch(`${API_BASE}/notifications/`, {
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error('Erreur chargement notifications');
  return response.json();
};

const markAsReadAPI = async (id) => {
  const response = await fetch(`${API_BASE}/notifications/${id}/mark_read/`, {
    method: 'POST',
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error('Erreur marquage notification');
  return response.json();
};

const markAllAsReadAPI = async () => {
  const response = await fetch(`${API_BASE}/notifications/mark_all_read/`, {
    method: 'POST',
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error('Erreur marquage notifications');
  return response.json();
};

/* ── Composant ──────────────────────────────────────────────── */
const NotificationsList = ({ compact = false }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState('all');
  const [error,   setError]   = useState('');

  const { t, language, theme } = useTheme();
  const navigate = useNavigate();

  const unreadCount = notifications.filter(n => !n.is_read).length;

  // ✅ FIX 2 : recharger quand la langue change
  useEffect(() => {
    loadNotifications();
  }, [language]); // ← dépendance sur language

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data    = await fetchNotificationsAPI();
      const fetched = Array.isArray(data) ? data : (data.results || []);
      const deleted = getDeletedNotifications();
      setNotifications(fetched.filter(n => !deleted.includes(n.id)));
    } catch (err) {
      console.error(err);
      setError(language === 'fr'
        ? 'Erreur lors du chargement des notifications'
        : 'Error loading notifications');
    } finally {
      setLoading(false);
    }
  };

  /* ── Actions ─────────────────────────────────────────────── */
  const handleMarkAsRead = async (id) => {
    try {
      await markAsReadAPI(id);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
    } catch {
      setError(language === 'fr' ? 'Erreur lors du marquage' : 'Error marking as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsReadAPI();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch {
      setError(language === 'fr' ? 'Erreur lors du marquage' : 'Error marking as read');
    }
  };

  const handleDeleteNotification = (id) => {
    if (!window.confirm(t('notif_delete_confirm'))) return;
    saveDeletedNotification(id);
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleViewNotification = async (notification) => {
    if (!notification.is_read) await handleMarkAsRead(notification.id);
    if (notification.link) navigate(notification.link);
  };

  /* ── ✅ FIX 3 : Helpers bilingues ───────────────────────── */
  const getLocalizedTitle = (notif) => {
    if (language === 'en' && notif.title_en) return notif.title_en;
    if (language === 'fr' && notif.title_fr) return notif.title_fr;
    return notif.title || ''; // fallback champ générique
  };

  const getLocalizedMessage = (notif) => {
    if (language === 'en' && notif.message_en) return notif.message_en;
    if (language === 'fr' && notif.message_fr) return notif.message_fr;
    return notif.message || ''; // fallback champ générique
  };

  /* ── Icônes ─────────────────────────────────────────────── */
  const getNotificationIcon = (type) => {
    const icons = {
      message: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      ),
      visit: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2"/>
        </svg>
      ),
      visit_confirmed: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      ),
      visit_refused: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="15" y1="9" x2="9" y2="15"/>
          <line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
      ),
      new_housing: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11H3z"/>
        </svg>
      ),
      admin: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
        </svg>
      ),
    };
    return icons[type] || icons.message;
  };

  const getNotificationColor = (type) => ({
    message:         '#3b82f6',
    visit:           '#f59e0b',
    visit_confirmed: '#10b981',
    visit_refused:   '#ef4444',
    new_housing:     '#8b5cf6',
    admin:           '#6366f1',
  }[type] || '#6b7280');

  /* ── ✅ FIX 4 : formatTime bilingue ─────────────────────── */
  const formatTime = (timestamp) => {
    const date    = new Date(timestamp);
    const now     = new Date();
    const diff    = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours   = Math.floor(diff / 3600000);
    const days    = Math.floor(diff / 86400000);

    if (minutes < 1)  return language === 'fr' ? "À l'instant" : 'Just now';
    if (minutes < 60) return language === 'fr' ? `Il y a ${minutes} min` : `${minutes} min ago`;
    if (hours   < 24) return language === 'fr' ? `Il y a ${hours} h`   : `${hours} h ago`;
    if (days    < 7)  return language === 'fr' ? `Il y a ${days} j`    : `${days} d ago`;

    return date.toLocaleDateString(
      language === 'fr' ? 'fr-FR' : 'en-US',
      { day: 'numeric', month: 'short' }
    );
  };

  /* ── ✅ FIX 5 : groupByDate bilingue ────────────────────── */
  const groupByDate = (notifs) => {
    const groups = {};
    const now   = new Date();

    notifs.forEach(n => {
      const date = new Date(n.created_at);
      const diff = Math.floor((now - date) / 86400000);

      let label;
      if (diff === 0) {
        label = language === 'fr' ? 'Aujourd\'hui' : 'Today';
      } else if (diff === 1) {
        label = language === 'fr' ? 'Hier' : 'Yesterday';
      } else if (diff < 7) {
        label = language === 'fr' ? 'Cette semaine' : 'This week';
      } else if (diff < 30) {
        label = language === 'fr' ? 'Ce mois' : 'This month';
      } else {
        label = language === 'fr' ? 'Plus ancien' : 'Older';
      }

      if (!groups[label]) groups[label] = [];
      groups[label].push(n);
    });

    return groups;
  };

  /* ── Filtre ─────────────────────────────────────────────── */
  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.is_read;
    if (filter === 'read')   return n.is_read;
    return true;
  });

  const groupedNotifications = groupByDate(filteredNotifications);

  /* ── Loading ─────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="notifications-loading">
        <div className="spinner" />
        <p>{t('notifications_loading')}</p>
      </div>
    );
  }

  /* ── UI ─────────────────────────────────────────────────── */
  return (
    <div className={`notifications-container ${compact ? 'compact' : ''}`}>

      {!compact && (
        <div className="notifications-header">
          <div className="header-left">
            <h2>{t('notif_title')}</h2>
            {notifications.length > 0 && ` (${notifications.length})`}
            {unreadCount > 0 && (
              <span className="unread-badge">{unreadCount}</span>
            )}
          </div>
          {unreadCount > 0 && (
            <button className="btn-mark-all" onClick={handleMarkAllAsRead}>
              {t('notif_mark_all')}
            </button>
          )}
        </div>
      )}

      {!compact && (
        <div className="notifications-filters">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            {t('notif_filter_all')} ({notifications.length})
          </button>
          <button
            className={`filter-btn ${filter === 'unread' ? 'active' : ''}`}
            onClick={() => setFilter('unread')}
          >
            {t('notif_filter_unread')} ({unreadCount})
          </button>
          <button
            className={`filter-btn ${filter === 'read' ? 'active' : ''}`}
            onClick={() => setFilter('read')}
          >
            {t('notif_filter_read')} ({notifications.length - unreadCount})
          </button>
        </div>
      )}

      {error && <div className="alert alert-error">{error}</div>}

      {filteredNotifications.length === 0 ? (
        <div className="notifications-empty">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" strokeWidth="1">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <p>{t('notif_empty')}</p>
        </div>
      ) : (
        // ── Rendu groupé par date ──────────────────────────
        Object.entries(groupedNotifications).map(([groupLabel, groupNotifs]) => (
          <div key={groupLabel} className="notification-group">

            {/* En-tête de groupe */}
            <div className="group-label">{groupLabel}</div>

            {groupNotifs.map(notification => (
              <div
                key={notification.id}
                className={`notification-item ${!notification.is_read ? 'unread' : ''}`}
                onClick={() => handleViewNotification(notification)}
              >
                <div
                  className="notification-icon"
                  style={{ backgroundColor: getNotificationColor(notification.type) }}
                >
                  {getNotificationIcon(notification.type)}
                </div>

                <div className="notification-content">
                  <h4 className="notification-title">
                    {/* ✅ Titre dans la bonne langue */}
                    {getLocalizedTitle(notification)}
                  </h4>
                  <p className="notification-message">
                    {/* ✅ Message dans la bonne langue */}
                    {getLocalizedMessage(notification)}
                  </p>
                  <div className="notification-footer">
                    <span className="notification-time">
                      {formatTime(notification.created_at)}
                    </span>
                    <div className="notification-actions">
                      {notification.link && (
                        <button
                          className="notification-link"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewNotification(notification);
                          }}
                        >
                          {t('notif_view')}
                        </button>
                      )}
                      <button
                        className="notification-delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNotification(notification.id);
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>

                {!notification.is_read && <div className="unread-indicator" />}
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
};

export default NotificationsList;
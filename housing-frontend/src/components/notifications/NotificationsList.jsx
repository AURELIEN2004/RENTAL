// src/components/notifications/NotificationsList.jsx

import React, { useState, useEffect } from 'react';
import './NotificationsList.css';

// API Helper
const fetchNotifications = async () => {
  const token = localStorage.getItem('access_token');
  const response = await fetch('http://localhost:8000/api/notifications/', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) throw new Error('Erreur chargement notifications');
  return response.json();
};

const markAsRead = async (id) => {
  const token = localStorage.getItem('access_token');
  const response = await fetch(`http://localhost:8000/api/notifications/${id}/mark_read/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) throw new Error('Erreur marquage notification');
  return response.json();
};

const markAllAsRead = async () => {
  const token = localStorage.getItem('access_token');
  const response = await fetch('http://localhost:8000/api/notifications/mark_all_read/', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) throw new Error('Erreur marquage notifications');
  return response.json();
};

const NotificationsList = ({ compact = false }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [error, setError] = useState('');

  useEffect(() => {
    loadNotifications();
  }, []);


const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await fetchNotifications();
      
      // 1. On détermine le tableau de notifications
      const fetchedNotifs = Array.isArray(data) ? data : (data.results || []);
      
      // 2. On met à jour le state principal
      setNotifications(fetchedNotifs);

      // 3. Calcul des non-lues (Correction de l'erreur "notifs is not defined")
      const newUnread = fetchedNotifs.filter(n => !n.is_read).length;

      // Note: Assurez-vous que unreadCount et setUnreadCount existent 
      // ou gérez cette logique via un useEffect sur 'notifications'
      if (typeof unreadCount !== 'undefined' && newUnread > unreadCount) {
        playNotificationSound();
      }
      
      if (typeof setUnreadCount === 'function') {
        setUnreadCount(newUnread);
      }

    } catch (err) {
      setError('Erreur lors du chargement des notifications');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };



  const handleMarkAsRead = async (id) => {
    try {
      await markAsRead(id);
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === id ? { ...notif, is_read: true } : notif
        )
      );
    } catch (err) {
      setError('Erreur lors du marquage');
    }
  };

  const playNotificationSound = () => {
  const audio = new Audio('/notification.mp3');
  audio.play().catch(err => console.log('Audio error:', err));
};

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, is_read: true }))
      );
    } catch (err) {
      setError('Erreur lors du marquage');
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      message: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      ),
      visit: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
      ),
      visit_confirmed: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      ),
      visit_refused: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="15" y1="9" x2="9" y2="15"></line>
          <line x1="9" y1="9" x2="15" y2="15"></line>
        </svg>
      ),
      new_housing: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
      ),
      admin: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      )
    };
    return icons[type] || icons.message;
  };

  const getNotificationColor = (type) => {
    const colors = {
      message: '#3b82f6',
      visit: '#f59e0b',
      visit_confirmed: '#10b981',
      visit_refused: '#ef4444',
      new_housing: '#8b5cf6',
      admin: '#6366f1'
    };
    return colors[type] || '#6b7280';
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins}min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'unread') return !notif.is_read;
    if (filter === 'read') return notif.is_read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (loading) {
    return (
      <div className="notifications-loading">
        <div className="spinner"></div>
        <p>Chargement des notifications...</p>
      </div>
    );
  }

  return (
    <div className={`notifications-container ${compact ? 'compact' : ''}`}>
      {!compact && (
        <div className="notifications-header">
          <div className="header-left">
            <h2>Notifications</h2>
            {unreadCount > 0 && (
              <span className="unread-badge">{unreadCount}</span>
            )}
          </div>
          <div className="header-right">
            {unreadCount > 0 && (
              <button 
                className="btn-mark-all"
                onClick={handleMarkAllAsRead}
              >
                Tout marquer comme lu
              </button>
            )}
          </div>
        </div>
      )}

      {!compact && (
        <div className="notifications-filters">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Toutes ({notifications.length})
          </button>
          <button
            className={`filter-btn ${filter === 'unread' ? 'active' : ''}`}
            onClick={() => setFilter('unread')}
          >
            Non lues ({unreadCount})
          </button>
          <button
            className={`filter-btn ${filter === 'read' ? 'active' : ''}`}
            onClick={() => setFilter('read')}
          >
            Lues ({notifications.length - unreadCount})
          </button>
        </div>
      )}

      {error && (
        <div className="alert alert-error">{error}</div>
      )}

      <div className="notifications-list">
        {filteredNotifications.length === 0 ? (
          <div className="empty-notifications">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            <p>Aucune notification</p>
          </div>
        ) : (
          filteredNotifications.map(notification => (
            <div
              key={notification.id}
              className={`notification-item ${!notification.is_read ? 'unread' : ''}`}
              onClick={() => !notification.is_read && handleMarkAsRead(notification.id)}
            >
              <div 
                className="notification-icon"
                style={{ backgroundColor: getNotificationColor(notification.type) }}
              >
                {getNotificationIcon(notification.type)}
              </div>

              <div className="notification-content">
                <h4 className="notification-title">{notification.title}</h4>
                <p className="notification-message">{notification.message}</p>
                <div className="notification-footer">
                  <span className="notification-time">
                    {formatTime(notification.created_at)}
                  </span>
                  {notification.link && (
                    <a href={notification.link} className="notification-link">
                      Voir →
                    </a>
                  )}
                </div>
              </div>

              {!notification.is_read && (
                <div className="unread-indicator"></div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationsList;
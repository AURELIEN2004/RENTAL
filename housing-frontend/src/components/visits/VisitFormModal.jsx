// src/components/visits/VisitFormModal.jsx

import React, { useState } from 'react';
import './VisitFormModal.css';

const createVisit = async (data) => {
  const token = localStorage.getItem('access_token');
  const response = await fetch('http://localhost:8000/api/visits/', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw error;
  }
  
  return response.json();
};

const VisitFormModal = ({ housing, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Get minimum date (today)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Get available time slots
  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00',
    '14:00', '15:00', '16:00', '17:00', '18:00'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const validateForm = () => {
    if (!formData.date) {
      setError('Veuillez sélectionner une date');
      return false;
    }

    if (!formData.time) {
      setError('Veuillez sélectionner une heure');
      return false;
    }

    const selectedDate = new Date(`${formData.date}T${formData.time}`);
    const now = new Date();

    if (selectedDate <= now) {
      setError('La date et l\'heure doivent être dans le futur');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      await createVisit({
        housing: housing.id,
        date: formData.date,
        time: formData.time,
        message: formData.message
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      const errorMsg = err.detail || 
                       err.non_field_errors?.[0] ||
                       'Erreur lors de la planification de la visite';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content visit-form-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Planifier une visite</h2>
          <button className="close-btn" onClick={onClose} aria-label="Fermer">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Housing Info */}
        <div className="housing-info">
          <img 
            src={housing.main_image || '/placeholder.jpg'} 
            alt={housing.title}
            onError={(e) => e.target.src = '/placeholder.jpg'}
          />
          <div className="housing-details">
            <h3>{housing.title}</h3>
            <p className="housing-location">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              {housing.district_name}, {housing.city_name}
            </p>
            <p className="housing-price">{housing.price?.toLocaleString()} FCFA/mois</p>
          </div>
        </div>

        {error && (
          <div className="alert alert-error">{error}</div>
        )}

        {/* Form */}
        <div className="visit-form">
          <div className="form-row">
            <div className="form-group">
              <label>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                Date de visite *
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                min={getMinDate()}
                required
              />
            </div>

            <div className="form-group">
              <label>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                Heure *
              </label>
              <select
                name="time"
                value={formData.time}
                onChange={handleChange}
                required
              >
                <option value="">Sélectionner une heure</option>
                {timeSlots.map(slot => (
                  <option key={slot} value={slot}>{slot}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Message (optionnel)</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Ajoutez un message pour le propriétaire..."
              rows="4"
            />
            <small className="form-hint">
              Présentez-vous brièvement et expliquez votre intérêt pour ce logement
            </small>
          </div>

          <div className="form-info">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            <div>
              <strong>Important :</strong>
              <p>Votre demande sera envoyée au propriétaire qui la confirmera ou la refusera. Vous recevrez une notification de sa réponse.</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="modal-actions">
          <button 
            type="button" 
            className="btn btn-outline"
            onClick={onClose}
          >
            Annuler
          </button>
          <button 
            type="button"
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={loading || !formData.date || !formData.time}
          >
            {loading ? 'Envoi...' : 'Envoyer la demande'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VisitFormModal;
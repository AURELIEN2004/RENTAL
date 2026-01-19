// src/components/common/SupportContactButton.jsx

import React, { useState } from 'react';
import { FaQuestionCircle, FaTimes, FaEnvelope, FaPhone, FaWhatsapp, FaComment } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './SupportContactButton.css';

/**
 * Bouton flottant pour contacter le support
 * Options: WhatsApp, Email, Appel, Messagerie intégrée
 */
const SupportContactButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const SUPPORT_INFO = {
    phone: '+237659887452',
    email: 'feudjioaurelien24@gmail.com',
    whatsapp: '+237659887452'
  };

  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      `Bonjour, j'ai besoin d'aide concernant la plateforme Housing.`
    );
    window.open(`https://wa.me/${SUPPORT_INFO.whatsapp}?text=${message}`, '_blank');
    setIsOpen(false);
  };

  const handleEmail = () => {
    window.location.href = `mailto:${SUPPORT_INFO.email}?subject=Demande de support`;
    setIsOpen(false);
  };

  const handleCall = () => {
    window.location.href = `tel:${SUPPORT_INFO.phone}`;
    setIsOpen(false);
  };

  const handleMessaging = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    // Rediriger vers la messagerie intégrée du dashboard
    navigate('/dashboard?tab=messages');
    setIsOpen(false);
  };

  return (
    <>
      {/* Bouton principal */}
      <button
        className={`support-button ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Support"
      >
        {isOpen ? <FaTimes /> : <FaQuestionCircle />}
      </button>

      {/* Menu des options */}
      {isOpen && (
        <div className="support-menu">
          <div className="support-menu-header">
            <h3>Besoin d'aide ?</h3>
            <p>Choisissez votre mode de contact</p>
          </div>

          <div className="support-options">
            {/* WhatsApp */}
            <button 
              className="support-option whatsapp"
              onClick={handleWhatsApp}
            >
              <div className="option-icon">
                <FaWhatsapp />
              </div>
              <div className="option-content">
                <h4>WhatsApp</h4>
                <p>Réponse rapide</p>
              </div>
            </button>

            {/* Email */}
            <button 
              className="support-option email"
              onClick={handleEmail}
            >
              <div className="option-icon">
                <FaEnvelope />
              </div>
              <div className="option-content">
                <h4>Email</h4>
                <p>{SUPPORT_INFO.email}</p>
              </div>
            </button>

            {/* Appel */}
            <button 
              className="support-option phone"
              onClick={handleCall}
            >
              <div className="option-icon">
                <FaPhone />
              </div>
              <div className="option-content">
                <h4>Appel</h4>
                <p>{SUPPORT_INFO.phone}</p>
              </div>
            </button>

            {/* Messagerie intégrée */}
            <button 
              className="support-option messaging"
              onClick={handleMessaging}
            >
              <div className="option-icon">
                <FaComment />
              </div>
              <div className="option-content">
                <h4>Messagerie</h4>
                <p>{user ? 'Chat en direct' : 'Connexion requise'}</p>
              </div>
            </button>
          </div>

          <div className="support-menu-footer">
            <p>Disponible 24/7</p>
          </div>
        </div>
      )}

      {/* Overlay pour fermer */}
      {isOpen && (
        <div 
          className="support-overlay"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default SupportContactButton;
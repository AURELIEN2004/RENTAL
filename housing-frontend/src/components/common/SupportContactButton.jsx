// src/components/common/SupportContactButton.jsx

import React, { useState } from 'react';
import { FaQuestionCircle, FaTimes, FaEnvelope, FaPhone, FaWhatsapp, FaComment } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import './SupportContactButton.css';

const SupportContactButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCreatingChat, setIsCreatingChat] = useState(false);
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

const handleMessaging = async () => {
  if (!user) {
    toast.info('Veuillez vous connecter pour accéder au chat en direct');
    navigate('/login');
    setIsOpen(false);
    return;
  }

  try {
    setIsCreatingChat(true);
    
    // ✅ CORRECTION : URL sans le préfixe /users/
    const response = await api.post('/create-support-conversation/');
    
    // Rediriger vers le dashboard messages
    navigate(`/dashboard?tab=messages&conversation=${response.data.conversation_id}`);
    
    toast.success('Chat avec le support ouvert !');
    setIsOpen(false);
    
  } catch (error) {
    console.error('Erreur création conversation:', error);
    console.error('Détails:', error.response?.data); // ✅ Plus de détails
    
    const errorMsg = error.response?.data?.error || 
                     error.response?.data?.detail ||
                     'Impossible d\'ouvrir le chat. Réessayez plus tard.';
    toast.error(errorMsg);
  } finally {
    setIsCreatingChat(false);
  }
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
            {/* Messagerie intégrée - EN PREMIER */}
            <button 
              className="support-option messaging"
              onClick={handleMessaging}
              disabled={isCreatingChat}
            >
              <div className="option-icon">
                <FaComment />
              </div>
              <div className="option-content">
                <h4>Chat en direct</h4>
                <p>
                  {isCreatingChat 
                    ? 'Ouverture...' 
                    : user 
                      ? 'Réponse instantanée' 
                      : 'Connexion requise'
                  }
                </p>
              </div>
            </button>

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
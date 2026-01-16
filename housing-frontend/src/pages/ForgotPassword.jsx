// src/pages/ForgotPassword.jsx

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaEnvelope, FaArrowLeft } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../services/api';
import './Auth.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/password-reset/request/', { email });
      setEmailSent(true);
      toast.success('Email de réinitialisation envoyé');
    } catch (error) {
      const errorMsg = error.response?.data?.email?.[0] || 
                       error.response?.data?.detail ||
                       'Erreur lors de l\'envoi de l\'email';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-card">
            <div className="success-message">
              <div className="success-icon">✓</div>
              <h1>Email envoyé !</h1>
              <p>
                Un lien de réinitialisation a été envoyé à <strong>{email}</strong>
              </p>
              <p className="info-text">
                Vérifiez votre boîte de réception et cliquez sur le lien pour réinitialiser votre mot de passe.
              </p>
              <p className="info-text">
                <small>Le lien est valide pendant 1 heure.</small>
              </p>
              <Link to="/login" className="btn btn-primary btn-block">
                <FaArrowLeft /> Retour à la connexion
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <h1>Mot de passe oublié ?</h1>
          <p className="auth-subtitle">
            Entrez votre adresse email pour recevoir un lien de réinitialisation
          </p>

          <div className="form-container">
            <div className="form-group">
              <label>
                <FaEnvelope /> Adresse email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                required
              />
            </div>

            <button
              type="button"
              className="btn btn-primary btn-block"
              onClick={handleSubmit}
              disabled={loading || !email}
            >
              {loading ? 'Envoi en cours...' : 'Envoyer le lien de réinitialisation'}
            </button>
          </div>

          <div className="auth-footer">
            <Link to="/login" className="back-link">
              <FaArrowLeft /> Retour à la connexion
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
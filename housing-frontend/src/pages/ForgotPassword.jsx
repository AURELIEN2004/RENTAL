// src/pages/ForgotPassword.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaEnvelope, FaArrowLeft, FaCheckCircle } from 'react-icons/fa';
import api from '../services/api';
import './ForgotPassword.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error('Veuillez entrer votre email');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/password-reset/request/', { email });
      
      setEmailSent(true);
      toast.success('Email envoyé avec succès !');
    } catch (error) {
      console.error('Error:', error);
      
      if (error.response?.data?.email) {
        toast.error(error.response.data.email[0]);
      } else if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error('Erreur lors de l\'envoi de l\'email');
      }
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="forgot-password-page">
        <div className="forgot-password-container">
          <div className="success-card">
            <div className="success-icon">
              <FaCheckCircle />
            </div>
            
            <h1>Email envoyé !</h1>
            
            <p className="success-message">
              Nous avons envoyé un lien de réinitialisation à :
            </p>
            <p className="email-sent">{email}</p>
            
            <div className="instructions">
              <h3>Étapes suivantes :</h3>
              <ol>
                <li>Vérifiez votre boîte de réception</li>
                <li>Cliquez sur le lien dans l'email</li>
                <li>Choisissez un nouveau mot de passe</li>
              </ol>
            </div>
            
            <div className="help-text">
              <p>
                <strong>Vous n'avez pas reçu l'email ?</strong>
              </p>
              <ul>
                <li>Vérifiez votre dossier spam</li>
                <li>Assurez-vous d'avoir entré le bon email</li>
                <li>Le lien est valide pendant 1 heure</li>
              </ul>
            </div>
            
            <div className="actions">
              <button 
                className="btn btn-outline"
                onClick={() => {
                  setEmailSent(false);
                  setEmail('');
                }}
              >
                Renvoyer l'email
              </button>
              
              <Link to="/login" className="btn btn-primary">
                Retour à la connexion
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-container">
        <div className="forgot-password-card">
          <Link to="/login" className="back-link">
            <FaArrowLeft /> Retour à la connexion
          </Link>
          
          <div className="header-icon">
            <FaEnvelope />
          </div>
          
          <h1>Mot de passe oublié ?</h1>
          <p className="subtitle">
            Pas de problème ! Entrez votre email et nous vous enverrons 
            un lien pour réinitialiser votre mot de passe.
          </p>

          <form onSubmit={handleSubmit} className="forgot-password-form">
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
                autoFocus
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={loading}
            >
              {loading ? 'Envoi en cours...' : 'Envoyer le lien'}
            </button>
          </form>

          <div className="help-section">
            <p className="help-title">Besoin d'aide ?</p>
            <p>
              Contactez-nous :
              <br />
              📧 feudjioaurelien24@gmail.com
              <br />
              📱 +237 659887452
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
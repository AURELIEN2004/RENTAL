// src/pages/ResetPassword.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../services/api';
import './Auth.css';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    new_password: '',
    new_password_confirm: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    new: false,
    confirm: false
  });
  const [loading, setLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState(null);

  useEffect(() => {
    verifyToken();
  }, [token]);

  const verifyToken = async () => {
    try {
      await api.post('/password-reset/verify/', { token });
      setTokenValid(true);
    } catch (error) {
      setTokenValid(false);
      toast.error('Lien de réinitialisation invalide ou expiré');
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validatePassword = () => {
    if (formData.new_password.length < 8) {
      toast.error('Le mot de passe doit contenir au moins 8 caractères');
      return false;
    }

    if (formData.new_password !== formData.new_password_confirm) {
      toast.error('Les mots de passe ne correspondent pas');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validatePassword()) return;

    setLoading(true);

    try {
      await api.post('/password-reset/confirm/', {
        token,
        new_password: formData.new_password,
        new_password_confirm: formData.new_password_confirm
      });

      toast.success('Mot de passe réinitialisé avec succès');
      navigate('/login');
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 
                       'Erreur lors de la réinitialisation';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (tokenValid === null) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-card">
            <div className="loading">Vérification du lien...</div>
          </div>
        </div>
      </div>
    );
  }

  if (tokenValid === false) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-card">
            <div className="error-message">
              <div className="error-icon">✕</div>
              <h1>Lien invalide</h1>
              <p>Ce lien de réinitialisation a expiré ou est invalide.</p>
              <Link to="/forgot-password" className="btn btn-primary btn-block">
                Demander un nouveau lien
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
          <h1>Nouveau mot de passe</h1>
          <p className="auth-subtitle">
            Choisissez un nouveau mot de passe sécurisé
          </p>

          <div className="form-container">
            <div className="form-group">
              <label>
                <FaLock /> Nouveau mot de passe
              </label>
              <div className="password-input-wrapper">
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  name="new_password"
                  value={formData.new_password}
                  onChange={handleChange}
                  placeholder="Minimum 8 caractères"
                  required
                />
                <button
                  type="button"
                  className="toggle-password-btn"
                  onClick={() => togglePasswordVisibility('new')}
                >
                  {showPasswords.new ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>Confirmer le mot de passe</label>
              <div className="password-input-wrapper">
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  name="new_password_confirm"
                  value={formData.new_password_confirm}
                  onChange={handleChange}
                  placeholder="Répétez le mot de passe"
                  required
                />
                <button
                  type="button"
                  className="toggle-password-btn"
                  onClick={() => togglePasswordVisibility('confirm')}
                >
                  {showPasswords.confirm ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div className="password-requirements">
              <h4>Exigences :</h4>
              <ul>
                <li className={formData.new_password.length >= 8 ? 'valid' : ''}>
                  Au moins 8 caractères
                </li>
                <li className={/[A-Z]/.test(formData.new_password) ? 'valid' : ''}>
                  Au moins une majuscule
                </li>
                <li className={/[0-9]/.test(formData.new_password) ? 'valid' : ''}>
                  Au moins un chiffre
                </li>
                <li className={formData.new_password === formData.new_password_confirm && formData.new_password.length > 0 ? 'valid' : ''}>
                  Les mots de passe correspondent
                </li>
              </ul>
            </div>

            <button
              type="button"
              className="btn btn-primary btn-block"
              onClick={handleSubmit}
              disabled={loading || !formData.new_password || !formData.new_password_confirm}
            >
              {loading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
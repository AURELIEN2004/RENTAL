// src/pages/ResetPassword.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaLock, FaEye, FaEyeSlash, FaCheckCircle } from 'react-icons/fa';
import api from '../services/api';
import './ResetPassword.css';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  
  const [showPasswords, setShowPasswords] = useState({
    new: false,
    confirm: false
  });
  
  const [formData, setFormData] = useState({
    new_password: '',
    new_password_confirm: ''
  });
  
  const [errors, setErrors] = useState({});

  useEffect(() => {
    verifyToken();
  }, [token]);

  const verifyToken = async () => {
    try {
      const response = await api.post('/password-reset/verify/', { token });
      setTokenValid(true);
      setUserEmail(response.data.email);
    } catch (error) {
      console.error('Token verification error:', error);
      setTokenValid(false);
      
      const errorMsg = error.response?.data?.message || 'Lien invalide ou expiré';
      toast.error(errorMsg);
    } finally {
      setVerifying(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const toggleShowPassword = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.new_password) {
      newErrors.new_password = 'Le mot de passe est requis';
    } else if (formData.new_password.length < 8) {
      newErrors.new_password = 'Le mot de passe doit contenir au moins 8 caractères';
    }

    if (!formData.new_password_confirm) {
      newErrors.new_password_confirm = 'Veuillez confirmer le mot de passe';
    } else if (formData.new_password !== formData.new_password_confirm) {
      newErrors.new_password_confirm = 'Les mots de passe ne correspondent pas';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await api.post('/password-reset/confirm/', {
        token,
        ...formData
      });
      
      setResetSuccess(true);
      toast.success('Mot de passe réinitialisé avec succès !');
      
      // Rediriger vers login après 3 secondes
      setTimeout(() => {
        navigate('/login');
      }, 3000);
      
    } catch (error) {
      console.error('Reset error:', error);
      
      if (error.response?.data?.new_password) {
        setErrors(prev => ({
          ...prev,
          new_password: Array.isArray(error.response.data.new_password)
            ? error.response.data.new_password.join(' ')
            : error.response.data.new_password
        }));
      } else if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error('Erreur lors de la réinitialisation');
      }
    } finally {
      setLoading(false);
    }
  };

  // État de vérification
  if (verifying) {
    return (
      <div className="reset-password-page">
        <div className="reset-password-container">
          <div className="loading-card">
            <div className="spinner"></div>
            <p>Vérification du lien...</p>
          </div>
        </div>
      </div>
    );
  }

  // Token invalide
  if (!tokenValid) {
    return (
      <div className="reset-password-page">
        <div className="reset-password-container">
          <div className="error-card">
            <div className="error-icon">⚠️</div>
            <h1>Lien invalide ou expiré</h1>
            <p>
              Ce lien de réinitialisation n'est plus valide. 
              Il a peut-être expiré ou a déjà été utilisé.
            </p>
            <div className="actions">
              <Link to="/forgot-password" className="btn btn-primary">
                Demander un nouveau lien
              </Link>
              <Link to="/login" className="btn btn-outline">
                Retour à la connexion
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Succès
  if (resetSuccess) {
    return (
      <div className="reset-password-page">
        <div className="reset-password-container">
          <div className="success-card">
            <div className="success-icon">
              <FaCheckCircle />
            </div>
            <h1>Mot de passe réinitialisé !</h1>
            <p>
              Votre mot de passe a été modifié avec succès.
              <br />
              Vous allez être redirigé vers la page de connexion...
            </p>
            <Link to="/login" className="btn btn-primary">
              Se connecter maintenant
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Formulaire de réinitialisation
  return (
    <div className="reset-password-page">
      <div className="reset-password-container">
        <div className="reset-password-card">
          <div className="header-icon">
            <FaLock />
          </div>
          
          <h1>Nouveau mot de passe</h1>
          <p className="subtitle">
            Choisissez un nouveau mot de passe pour votre compte
            <br />
            <strong>{userEmail}</strong>
          </p>

          <form onSubmit={handleSubmit} className="reset-password-form">
            {/* Nouveau mot de passe */}
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
                  className={errors.new_password ? 'error' : ''}
                />
                <button
                  type="button"
                  className="toggle-password-btn"
                  onClick={() => toggleShowPassword('new')}
                >
                  {showPasswords.new ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.new_password && (
                <span className="error-message">{errors.new_password}</span>
              )}
            </div>

            {/* Confirmer mot de passe */}
            <div className="form-group">
              <label>
                <FaLock /> Confirmer le mot de passe
              </label>
              <div className="password-input-wrapper">
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  name="new_password_confirm"
                  value={formData.new_password_confirm}
                  onChange={handleChange}
                  placeholder="Répétez le mot de passe"
                  className={errors.new_password_confirm ? 'error' : ''}
                />
                <button
                  type="button"
                  className="toggle-password-btn"
                  onClick={() => toggleShowPassword('confirm')}
                >
                  {showPasswords.confirm ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.new_password_confirm && (
                <span className="error-message">{errors.new_password_confirm}</span>
              )}
            </div>

            {/* Conseils */}
            <div className="password-tips">
              <h4>Votre mot de passe doit contenir :</h4>
              <ul>
                <li className={formData.new_password.length >= 8 ? 'valid' : ''}>
                  ✓ Au moins 8 caractères
                </li>
                <li className={/[A-Z]/.test(formData.new_password) ? 'valid' : ''}>
                  ✓ Une lettre majuscule
                </li>
                <li className={/[a-z]/.test(formData.new_password) ? 'valid' : ''}>
                  ✓ Une lettre minuscule
                </li>
                <li className={/[0-9]/.test(formData.new_password) ? 'valid' : ''}>
                  ✓ Un chiffre
                </li>
              </ul>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={loading}
            >
              {loading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
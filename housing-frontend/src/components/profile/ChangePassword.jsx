// src/components/profile/ChangePassword.jsx
import React, { useState } from 'react';
import { authService } from '../../services/authService';
import { toast } from 'react-toastify';
import { FaLock, FaEye, FaEyeSlash, FaSave, FaTimes } from 'react-icons/fa';
import './ChangePassword.css';

const ChangePassword = ({ onClose }) => {
  const [loading, setLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false
  });
  
  const [formData, setFormData] = useState({
    old_password: '',
    new_password: '',
    new_password_confirm: ''
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Effacer l'erreur du champ modifié
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

    if (!formData.old_password) {
      newErrors.old_password = 'L\'ancien mot de passe est requis';
    }

    if (!formData.new_password) {
      newErrors.new_password = 'Le nouveau mot de passe est requis';
    } else if (formData.new_password.length < 8) {
      newErrors.new_password = 'Le mot de passe doit contenir au moins 8 caractères';
    }

    if (!formData.new_password_confirm) {
      newErrors.new_password_confirm = 'Veuillez confirmer le nouveau mot de passe';
    } else if (formData.new_password !== formData.new_password_confirm) {
      newErrors.new_password_confirm = 'Les mots de passe ne correspondent pas';
    }

    if (formData.old_password === formData.new_password) {
      newErrors.new_password = 'Le nouveau mot de passe doit être différent de l\'ancien';
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
      await authService.changePassword(
        formData.old_password,
        formData.new_password,
        formData.new_password_confirm
      );
      
      toast.success('Mot de passe modifié avec succès !');
      
      // Réinitialiser le formulaire
      setFormData({
        old_password: '',
        new_password: '',
        new_password_confirm: ''
      });
      
      if (onClose) {
        setTimeout(() => onClose(), 1500);
      }
    } catch (error) {
      console.error('Error changing password:', error);
      
      // Gérer les erreurs spécifiques
      if (error.response?.data?.old_password) {
        setErrors(prev => ({
          ...prev,
          old_password: error.response.data.old_password[0]
        }));
      } else if (error.response?.data?.new_password) {
        setErrors(prev => ({
          ...prev,
          new_password: Array.isArray(error.response.data.new_password) 
            ? error.response.data.new_password.join(' ')
            : error.response.data.new_password
        }));
      } else {
        toast.error('Erreur lors du changement de mot de passe');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="change-password-overlay">
      <div className="change-password-modal">
        <div className="modal-header">
          <h2>Changer le mot de passe</h2>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="change-password-form">
          {/* Ancien mot de passe */}
          <div className="form-group">
            <label>
              <FaLock /> Ancien mot de passe
            </label>
            <div className="password-input-wrapper">
              <input
                type={showPasswords.old ? 'text' : 'password'}
                name="old_password"
                value={formData.old_password}
                onChange={handleChange}
                placeholder="Entrez votre ancien mot de passe"
                className={errors.old_password ? 'error' : ''}
              />
              <button
                type="button"
                className="toggle-password-btn"
                onClick={() => toggleShowPassword('old')}
              >
                {showPasswords.old ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.old_password && (
              <span className="error-message">{errors.old_password}</span>
            )}
          </div>

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

          {/* Confirmer nouveau mot de passe */}
          <div className="form-group">
            <label>
              <FaLock /> Confirmer le nouveau mot de passe
            </label>
            <div className="password-input-wrapper">
              <input
                type={showPasswords.confirm ? 'text' : 'password'}
                name="new_password_confirm"
                value={formData.new_password_confirm}
                onChange={handleChange}
                placeholder="Répétez le nouveau mot de passe"
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

          {/* Conseils de sécurité */}
          <div className="password-tips">
            <h4>Conseils pour un mot de passe sécurisé :</h4>
            <ul>
              <li>Au moins 8 caractères</li>
              <li>Combiner lettres majuscules et minuscules</li>
              <li>Inclure des chiffres et des caractères spéciaux</li>
              <li>Ne pas utiliser d'informations personnelles</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="form-actions">
            <button 
              type="button" 
              className="btn btn-outline"
              onClick={onClose}
              disabled={loading}
            >
              Annuler
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              <FaSave /> {loading ? 'Modification...' : 'Modifier'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
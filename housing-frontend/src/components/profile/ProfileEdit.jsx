// src/components/profile/ProfileEdit.jsx
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/authService';
import { toast } from 'react-toastify';
import { FaUser, FaEnvelope, FaPhone, FaCamera, FaSave, FaTimes } from 'react-icons/fa';
import './ProfileEdit.css';
import { useTheme } from '../../contexts/ThemeContext';

const ProfileEdit = ({ onClose, onUpdate }) => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(user?.photo || null);
  const { t, language, theme } = useTheme();
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    photo: null,
    preferred_max_price: user?.preferred_max_price || '',
    preferred_location_lat: user?.preferred_location_lat || '',
    preferred_location_lng: user?.preferred_location_lng || '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('La photo ne doit pas dépasser 5MB');
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        photo: file
      }));
      
      // Créer l'aperçu
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setFormData(prev => ({
      ...prev,
      photo: null
    }));
    setPhotoPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await authService.updateProfile(formData);
      updateUser(result.user);
      toast.success('Profil mis à jour avec succès !');
      if (onUpdate) onUpdate(result.user);
      if (onClose) onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
      const errorMsg = error.response?.data?.email?.[0] || 
                      error.response?.data?.message || 
                      'Erreur lors de la mise à jour';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

 return (
  <div className="profile-edit-overlay">
    <div className="profile-edit-modal">

      <div className="modal-header">
        <h2>{t('profile_edit_title')}</h2>

        <button className="close-btn" onClick={onClose}>
          <FaTimes />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="profile-edit-form">

        {/* PHOTO */}
        <div className="photo-section">

          <div className="photo-preview">
            <img 
              src={photoPreview || '/default-avatar.png'} 
              alt="Profile"
            />

            <label className="photo-upload-btn">
              <FaCamera />

              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                hidden
              />

            </label>
          </div>

          {photoPreview && (
            <button
              type="button"
              className="remove-photo-btn"
              onClick={handleRemovePhoto}
            >
              {t('profile_remove_photo')}
            </button>
          )}

        </div>


        {/* INFOS PERSONNELLES */}
        <div className="form-section">

          <h3>{t('profile_personal_info')}</h3>

          <div className="form-row">

            <div className="form-group">
              <label>
                <FaUser /> {t('profile_first_name')}
              </label>

              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                placeholder={t('profile_first_name_placeholder')}
              />
            </div>


            <div className="form-group">
              <label>{t('profile_last_name')}</label>

              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                placeholder={t('profile_last_name_placeholder')}
              />
            </div>

          </div>


          <div className="form-group">

            <label>
              <FaEnvelope /> {t('profile_email')}
            </label>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder={t('profile_email_placeholder')}
              required
            />

          </div>


          <div className="form-group">

            <label>
              <FaPhone /> {t('profile_phone')}
            </label>

            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder={t('profile_phone_placeholder')}
            />

          </div>

        </div>


        {/* PRÉFÉRENCES */}
        <div className="form-section">

          <h3>{t('profile_search_preferences')}</h3>

          <div className="form-group">

            <label>
              {t('profile_max_budget')}
            </label>

            <input
              type="number"
              name="preferred_max_price"
              value={formData.preferred_max_price}
              onChange={handleChange}
              placeholder={t('profile_budget_placeholder')}
              min="0"
            />

          </div>

        </div>


        {/* ACTIONS */}
        <div className="form-actions">

          <button
            type="button"
            className="btn btn-outline"
            onClick={onClose}
            disabled={loading}
          >
            {t('cancel')}
          </button>


          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            <FaSave />

            {loading
              ? t('profile_saving')
              : t('save')
            }

          </button>

        </div>

      </form>
    </div>
  </div>
);
};

export default ProfileEdit;
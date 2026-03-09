// src/components/housing/HousingEditModal.jsx - VERSION COMPLÈTE

import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import './HousingEditModal.css';
import { useTheme } from '../../contexts/ThemeContext';

const HousingEditModal = ({ housing, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    title: housing.title || '',
    description: housing.description || '',
    category: housing.category?.id || '',
    housing_type: housing.housing_type?.id || '',
    price: housing.price || '',
    area: housing.area || '',
    rooms: housing.rooms || 1,
    bathrooms: housing.bathrooms || 1,
    status: housing.status || 'disponible',
    additional_features: housing.additional_features || '',
    // ✅ LOCALISATION COMPLÈTE
    region: housing.region?.id || '',
    city: housing.city?.id || '',
    district: housing.district?.id || '',
    latitude: housing.latitude || '',
    longitude: housing.longitude || '',
    // ✅ MÉDIAS
    virtual_360: housing.virtual_360 || '',
    video: null, // Fichier vidéo
    images: [] // Nouvelles images
  });

  const [options, setOptions] = useState({
    categories: [],
    types: [],
    regions: [],
    cities: [],
    districts: []
  });

  const { t, language, theme } = useTheme();

  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState(housing.images?.map(img => img.image) || []);
  const [loading, setLoading] = useState(false);
  const [useGPS, setUseGPS] = useState(false);

  useEffect(() => {
    loadFormOptions();
  }, []);

  useEffect(() => {
    if (formData.region) loadCities(formData.region);
  }, [formData.region]);

  useEffect(() => {
    if (formData.city) loadDistricts(formData.city);
  }, [formData.city]);

  const loadFormOptions = async () => {
    try {
      const [catRes, typRes, regRes] = await Promise.all([
        api.get('/categories/'),
        api.get('/types/'),
        api.get('/regions/')
      ]);

      setOptions(prev => ({
        ...prev,
        categories: catRes.data.results || catRes.data || [],
        types: typRes.data.results || typRes.data || [],
        regions: regRes.data.results || regRes.data || []
      }));

      // Charger villes et quartiers existants
      if (housing.region?.id) {
        const cities = await api.get(`/cities/?region=${housing.region.id}`);
        setOptions(prev => ({ ...prev, cities: cities.data.results || cities.data || [] }));
      }
      
      if (housing.city?.id) {
        const districts = await api.get(`/districts/?city=${housing.city.id}`);
        setOptions(prev => ({ ...prev, districts: districts.data.results || districts.data || [] }));
      }
    } catch (error) {
      toast.error('Erreur chargement options');
    }
  };

  const loadCities = async (regionId) => {
    try {
      const res = await api.get(`/cities/?region=${regionId}`);
      setOptions(prev => ({ ...prev, cities: res.data.results || res.data || [] }));
    } catch (e) {
      toast.error('Erreur chargement villes');
    }
  };

  const loadDistricts = async (cityId) => {
    try {
      const res = await api.get(`/districts/?city=${cityId}`);
      setOptions(prev => ({ ...prev, districts: res.data.results || res.data || [] }));
    } catch (e) {
      toast.error('Erreur chargement quartiers');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRegionChange = (e) => {
    const id = e.target.value;
    setFormData(prev => ({ ...prev, region: id, city: '', district: '' }));
  };

  const handleCityChange = (e) => {
    const id = e.target.value;
    setFormData(prev => ({ ...prev, city: id, district: '' }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(files);
    setImagePreviews(files.map(f => URL.createObjectURL(f)));
  };

  const handleGPSClick = () => {
    if (!navigator.geolocation) {
      toast.error('GPS non supporté');
      return;
    }
    
    setUseGPS(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData(prev => ({
          ...prev,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude
        }));
        setUseGPS(false);
        toast.success('Position capturée');
      },
      () => {
        setUseGPS(false);
        toast.error('Erreur GPS');
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = new FormData();
      
      // ✅ Ajouter tous les champs texte/nombre
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== '' && key !== 'video' && key !== 'images') {
          submitData.append(key, formData[key]);
        }
      });

      // ✅ Ajouter vidéo si présente
      if (formData.video) {
        submitData.append('video', formData.video);
      }

      // ✅ Ajouter nouvelles images
      imageFiles.forEach(file => {
        submitData.append('images', file);
      });

      await onUpdate(submitData);
      onClose();
    } catch (error) {
      toast.error('Erreur modification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content housing-edit-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{t('edit_housing')} : {housing.title}</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="edit-form">
          {/* 1️⃣ INFOS DE BASE */}
          <div className="form-section">
            <h3>📝 {t('basic_information')}</h3>
            <div className="form-group">
              <label>{t('title')} *</label>
              <input type="text" name="title" value={formData.title} onChange={handleChange} required />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>{t('category')}</label>
                <select name="category" value={formData.category} onChange={handleChange}>
                  <option value="">{t('choose_option')}</option>
                  {options.categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>{t('housing_type')}</label>
                <select name="housing_type" value={formData.housing_type} onChange={handleChange}>
                  <option value="">{t('choose_option')}</option>
                  {options.types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>{t('description')} *</label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows="4" required />
            </div>
          </div>

          {/* 2️⃣ CARACTÉRISTIQUES */}
          <div className="form-section">
            <h3>📊 {t('features')}</h3>
            <div className="form-row">
              <div className="form-group">
                <label>{t('price')} (FCFA) *</label>
                <input type="number" name="price" value={formData.price} onChange={handleChange} min="0" required />
              </div>
              <div className="form-group">
                <label>{t('area_label')} (m²) *</label>
                <input type="number" name="area" value={formData.area} onChange={handleChange} min="1" required />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>{t('rooms_label')} *</label>
                <input type="number" name="rooms" value={formData.rooms} onChange={handleChange} min="1" required />
              </div>
              <div className="form-group">
                <label>{t('bathrooms_label')} *</label>
                <input type="number" name="bathrooms" value={formData.bathrooms} onChange={handleChange} min="1" required />
              </div>
            </div>
            <div className="form-group">
              <label>{t('status')}</label>
              <select name="status" value={formData.status} onChange={handleChange}>
                <option value="disponible">{t('available')}</option>
                <option value="reserve">{t('reserved')}</option>
                <option value="occupe">{t('occupied')}</option>
              </select>
            </div>
            <div className="form-group">
              <label>{t('additional_features')}</label>
              <textarea name="additional_features" value={formData.additional_features} onChange={handleChange} rows="3" />
            </div>
          </div>

          {/* 3️⃣ LOCALISATION */}
          <div className="form-section">
            <h3>📍 {t('location')}</h3>
            <div className="form-group">
              <label>{t('region')}</label>
              <select name="region" value={formData.region} onChange={handleRegionChange}>
                <option value="">{t('choose_option')}</option>
                {options.regions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>{t('city')}</label>
                <select name="city" value={formData.city} onChange={handleCityChange} disabled={!formData.region}>
                  <option value="">{t('choose_option')}</option>
                  {options.cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>{t('district')}</label>
                <select name="district" value={formData.district} onChange={handleChange} disabled={!formData.city}>
                  <option value="">{t('choose_option')}</option>
                  {options.districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
            </div>
            <button type="button" className="gps-btn" onClick={handleGPSClick} disabled={useGPS}>
  {useGPS ? `📍 ${t('gps_location')}` : `📍 ${t('update_gps')}`}
            </button>
            {formData.latitude && formData.longitude && (
              <p className="gps-coords">✅ {formData.latitude}, {formData.longitude}</p>
            )}
          </div>

          {/* 4️⃣ MÉDIAS */}
          <div className="form-section">
            <h3>📸 {t('media')}</h3>
            <div className="form-group">
              <label>{t('new_photos')}</label>
              <input type="file" multiple accept="image/*" onChange={handleImageChange} />
              {imagePreviews.length > 0 && (
                <div className="image-preview-grid">
                  {imagePreviews.slice(0, 4).map((p, i) => <img key={i} src={p} alt={`Preview ${i}`} />)}
                </div>
              )}
            </div>
            <div className="form-group">
              <label>{t('video')}</label>
              <input type="file" accept="video/*" onChange={(e) => setFormData({...formData, video: e.target.files[0]})} />
            </div>
            <div className="form-group">
              <label>{t('virtual_visit_url')}</label>
              <input type="url" name="virtual_360" value={formData.virtual_360} onChange={handleChange} placeholder="https://..." />
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-outline" onClick={onClose}>{t('cancel')}</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? t('saving') : t('update')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HousingEditModal;
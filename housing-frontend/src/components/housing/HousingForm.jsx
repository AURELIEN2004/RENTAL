
// ============================================
// src/components/housing/HousingForm.jsx - CORRECTION
// ============================================

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import Loading from '../common/Loading';
import { toast } from 'react-toastify';
// import './HousingForm.css';

const HousingForm = ({ isEdit = false }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [housingTypes, setHousingTypes] = useState([]);
  const [regions, setRegions] = useState([]);
  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    housing_type: '',
    price: '',
    area: '',
    rooms: 1,
    bathrooms: 1,
    region: '',
    city: '',
    district: '',
    latitude: '',
    longitude: '',
    video: null,
    virtual_360: '',
    additional_features: '',
    status: 'disponible'
  });
  
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [useGPS, setUseGPS] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchFormData();
    if (isEdit && id) {
      fetchHousingData();
    }
  }, [isEdit, id]);

  
    const fetchFormData = async () => {
        try {
          const [categoriesRes, typesRes, regionsRes] = await Promise.all([
            api.get('/categories/'),
            api.get('/types/'),
            api.get('/regions/')
          ]);

          setCategories(categoriesRes.data.results || []);
          setHousingTypes(typesRes.data.results || []);
          setRegions(regionsRes.data.results || []);
        } catch (error) {
          toast.error('Erreur chargement des données');
        }
      };


  const fetchHousingData = async () => {
      setLoading(true);
      try {
      const response = await api.get(`/housings/${id}/`);
      const data = response.data;
      
      setFormData({
        title: data.title,
        description: data.description,
        category: data.category?.id || '',
        housing_type: data.housing_type?.id || '',
        price: data.price,
        area: data.area,
        rooms: data.rooms,
        bathrooms: data.bathrooms,
        region: data.region?.id || '',
        city: data.city?.id || '',
        district: data.district?.id || '',
        latitude: data.latitude || '',
        longitude: data.longitude || '',
        virtual_360: data.virtual_360 || '',
        additional_features: data.additional_features || '',
        status: data.status || 'disponible',
        video: null
      });
      
      if (data.region?.id) {
        const citiesRes = await api.get(`/cities/?region=${data.region.id}`);
        setCities(citiesRes.data);
        
        if (data.city?.id) {
          const districtsRes = await api.get(`/districts/?city=${data.city.id}`);
          setDistricts(districtsRes.data);
        }
      }
      
      if (data.images) {
        setImagePreviews(data.images.map(img => img.image));
      }
    } catch (error) {
      toast.error('Erreur chargement du logement');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleRegionChange = async (e) => {
    const regionId = e.target.value;
    setFormData(prev => ({
      ...prev,
      region: regionId,
      city: '',
      district: ''
    }));
    
    if (regionId) {
    try {
      const response = await api.get(`/cities/?region=${regionId}`);
      // 🛡️ Protection : on vérifie si results existe, sinon on prend data, sinon tableau vide
      const data = response.data.results || response.data || [];
      setCities(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error('Erreur chargement des villes');
      setCities([]);
    }
  }
};

  const handleCityChange = async (e) => {
    const cityId = e.target.value;
    setFormData(prev => ({
      ...prev,
      city: cityId,
      district: ''
    }));
    
   if (cityId) {
      try {
        const response = await api.get(`/districts/?city=${cityId}`);
        // 🛡️ Sécurité : on prend results si présent, sinon data, sinon tableau vide
        const data = response.data.results || response.data || [];
        setDistricts(Array.isArray(data) ? data : []);
      } catch (error) {
        toast.error('Erreur chargement des quartiers');
        setDistricts([]); // On remet à vide pour ne pas faire planter le .map()
      }
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length > 10) {
      toast.error('Maximum 10 images autorisÃ©es');
      return;
    }
    
    setImageFiles(files);
    
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 50 * 1024 * 1024) {
      toast.error('VidÃ©o trop volumineuse (max 50MB)');
      return;
    }
    setFormData(prev => ({ ...prev, video: file }));
  };

  const handleGPSClick = () => {
    if (!navigator.geolocation) {
      toast.error('GÃ©olocalisation non supportÃ©e');
      return;
    }
    
    setUseGPS(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          latitude: position.coords.latitude.toString(),
          longitude: position.coords.longitude.toString()
        }));
        setUseGPS(false);
        toast.success('Position GPS capturÃ©e');
      },
      (error) => {
        setUseGPS(false);
        toast.error('Erreur GPS: ' + error.message);
      }
    );
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) newErrors.title = 'Titre requis';
    if (!formData.description.trim()) newErrors.description = 'Description requise';
    if (!formData.category) newErrors.category = 'CatÃ©gorie requise';
    if (!formData.housing_type) newErrors.housing_type = 'Type requis';
    if (!formData.price || formData.price <= 0) newErrors.price = 'Prix invalide';
    if (!formData.area || formData.area <= 0) newErrors.area = 'Superficie invalide';
    if (!formData.region) newErrors.region = 'RÃ©gion requise';
    if (!formData.city) newErrors.city = 'Ville requise';
    if (!formData.district) newErrors.district = 'Quartier requis';
    
    if (!isEdit && imageFiles.length < 3) {
      newErrors.images = 'Minimum 3 images requises';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Veuillez corriger les erreurs');
      return;
    }

    try {
      setLoading(true);
      
      const submitData = new FormData();
      
      // Ajouter tous les champs
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== '' && key !== 'video') {
          submitData.append(key, formData[key]);
        }
      });
      
      // Ajouter la vidÃ©o si prÃ©sente
      if (formData.video) {
        submitData.append('video', formData.video);
      }
      
      // Ajouter les images
      imageFiles.forEach((file, index) => {
        submitData.append('images', file);
        if (index === 0) {
          submitData.append('main_image_index', '0');
        }
      });

      if (isEdit) {
        await api.patch(`/housings/${id}/`, submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Logement modifiÃ© avec succÃ¨s');
      } else {
        await api.post('/housings/', submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Logement publiÃ© avec succÃ¨s');
      }
      
      navigate('/dashboard');
    } catch (error) {
      console.error('Erreur:', error.response?.data);
      toast.error(error.response?.data?.detail || 'Erreur lors de la soumission');
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEdit) {
    return <Loading fullScreen message="Chargement..." />;
  }

  return (
    <div className="housing-form-container">
      <h1>{isEdit ? 'Modifier le logement' : 'Ajouter un logement'}</h1>
      
      <form onSubmit={handleSubmit} className="housing-form">
        {/* Section 1 */}
        <div className="form-section">
          <h2>1. Informations GÃ©nÃ©rales</h2>
          
          <div className="form-group">
            <label>Titre *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Ex: Studio moderne Ã  Bastos"
              className={errors.title ? 'error' : ''}
            />
            {errors.title && <span className="error-text">{errors.title}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>CatÃ©gorie *</label>
              <select 
                name="category" 
                value={formData.category} 
                onChange={handleChange}
                className={errors.category ? 'error' : ''}
              >
                <option value="">SÃ©lectionner</option>
                {categories?.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              {errors.category && <span className="error-text">{errors.category}</span>}
            </div>

            <div className="form-group">
              <label>Type *</label>
              <select 
                name="housing_type" 
                value={formData.housing_type} 
                onChange={handleChange}
                className={errors.housing_type ? 'error' : ''}
              >
                <option value="">SÃ©lectionner</option>
                {housingTypes.map(type => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
              {errors.housing_type && <span className="error-text">{errors.housing_type}</span>}
            </div>
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="5"
              placeholder="DÃ©crivez votre logement..."
              className={errors.description ? 'error' : ''}
            />
            {errors.description && <span className="error-text">{errors.description}</span>}
          </div>
        </div>

        {/* Section 2 */}
        <div className="form-section">
          <h2>2. CaractÃ©ristiques</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label>Prix mensuel (FCFA) *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                min="0"
                className={errors.price ? 'error' : ''}
              />
              {errors.price && <span className="error-text">{errors.price}</span>}
            </div>

            <div className="form-group">
              <label>Superficie (mÂ²) *</label>
              <input
                type="number"
                name="area"
                value={formData.area}
                onChange={handleChange}
                min="1"
                className={errors.area ? 'error' : ''}
              />
              {errors.area && <span className="error-text">{errors.area}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Chambres *</label>
              <input
                type="number"
                name="rooms"
                value={formData.rooms}
                onChange={handleChange}
                min="1"
              />
            </div>

            <div className="form-group">
              <label>Douches *</label>
              <input
                type="number"
                name="bathrooms"
                value={formData.bathrooms}
                onChange={handleChange}
                min="1"
              />
            </div>
          </div>

          <div className="form-group">
            <label>CaractÃ©ristiques supplÃ©mentaires</label>
            <textarea
              name="additional_features"
              value={formData.additional_features}
              onChange={handleChange}
              rows="3"
              placeholder="Ex: Parking, Jardin, ProximitÃ© Ã©coles..."
            />
          </div>
        </div>

        {/* Section 3 */}
        <div className="form-section">
          <h2>3. Localisation</h2>
          
          <div className="form-group">
            <label>RÃ©gion *</label>
            <select 
              name="region" 
              value={formData.region} 
              onChange={handleRegionChange}
              className={errors.region ? 'error' : ''}
            >
              <option value="">SÃ©lectionner</option>
              {regions.map(region => (
                <option key={region.id} value={region.id}>{region.name}</option>
              ))}
            </select>
            {errors.region && <span className="error-text">{errors.region}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Ville *</label>
              <select 
                name="city" 
                value={formData.city} 
                onChange={handleCityChange}
                disabled={!formData.region}
                className={errors.city ? 'error' : ''}
              >
                <option value="">Selectionner</option>
                {cities?.map(city => (
                  <option key={city.id} value={city.id}>{city.name}</option>
                ))}
              </select>
              {errors.city && <span className="error-text">{errors.city}</span>}
            </div>

            <div className="form-group">
              <label>Quartier *</label>
              <select 
                name="district" 
                value={formData.district} 
                onChange={handleChange}
                disabled={!formData.city}
                className={errors.district ? 'error' : ''}
              >
                <option value="">Selectionner</option>
                {districts?.map(district => (
                  <option key={district.id} value={district.id}>{district.name}</option>
                ))}
              </select>
              {errors.district && <span className="error-text">{errors.district}</span>}
            </div>
          </div>

          <div className="gps-section">
            <button 
              type="button" 
              className="btn btn-outline" 
              onClick={handleGPSClick} 
              disabled={useGPS}
            >
              {useGPS ? 'ðŸ" Capture...' : 'ðŸ" Activer GPS'}
            </button>
            {formData.latitude && formData.longitude && (
              <p className="gps-coords">
                â†' {parseFloat(formData.latitude).toFixed(6)}, {parseFloat(formData.longitude).toFixed(6)}
              </p>
            )}
          </div>
        </div>

        {/* Section 4 */}
        <div className="form-section">
          <h2>4. Médias</h2>
          
          <div className="form-group">
            <label>Photos * (min. 3)</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className={errors.images ? 'error' : ''}
            />
            {errors.images && <span className="error-text">{errors.images}</span>}
          </div>

          {imagePreviews.length > 0 && (
            <div className="image-preview-grid">
              {imagePreviews.map((preview, idx) => (
                <img key={idx} src={preview} alt={`Preview ${idx + 1}`} />
              ))}
            </div>
          )}

          <div className="form-group">
            <label>VidÃ©o (optionnel)</label>
            <input type="file" accept="video/*" onChange={handleVideoChange} />
          </div>

          <div className="form-group">
            <label>Visite 360Â° URL (optionnel)</label>
            <input
              type="url"
              name="virtual_360"
              value={formData.virtual_360}
              onChange={handleChange}
              placeholder="https://..."
            />
          </div>
        </div>

        {/* Actions */}
        <div className="form-actions">
          <button 
            type="button" 
            className="btn btn-outline" 
            onClick={() => navigate('/dashboard')}
          >
            Annuler
          </button>
          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading}
          >
            {loading ? 'En cours...' : (isEdit ? 'Modifier' : 'Publier')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default HousingForm;
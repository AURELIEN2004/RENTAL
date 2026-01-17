// src/components/housing/HousingEditModal.jsx - NOUVEAU FICHIER

import React, { useState, useEffect } from 'react';
import { housingService } from '../../services/housingService';
import api from '../../services/api';
import { toast } from 'react-toastify';
import './HousingEditModal.css';

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
  });

  const [categories, setCategories] = useState([]);
  const [housingTypes, setHousingTypes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadOptions();
  }, []);

  const loadOptions = async () => {
    try {
      const [categoriesRes, typesRes] = await Promise.all([
        api.get('/categories/'),
        api.get('/types/')
      ]);

      setCategories(categoriesRes.data.results || categoriesRes.data || []);
      setHousingTypes(typesRes.data.results || typesRes.data || []);
    } catch (error) {
      toast.error('Erreur chargement options');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onUpdate(formData);
    } catch (error) {
      toast.error('Erreur lors de la modification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content housing-edit-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Modifier le logement</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="edit-form">
          <div className="form-section">
            <h3>Informations de base</h3>
            
            <div className="form-group">
              <label>Titre *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Catégorie *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  <option value="">Sélectionner</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Type *</label>
                <select
                  name="housing_type"
                  value={formData.housing_type}
                  onChange={handleChange}
                  required
                >
                  <option value="">Sélectionner</option>
                  {housingTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                required
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Caractéristiques</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label>Prix (FCFA) *</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  min="0"
                  required
                />
              </div>

              <div className="form-group">
                <label>Superficie (m²) *</label>
                <input
                  type="number"
                  name="area"
                  value={formData.area}
                  onChange={handleChange}
                  min="1"
                  required
                />
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
                  required
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
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Statut</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="disponible">Disponible</option>
                <option value="reserve">Réservé</option>
                <option value="occupe">Occupé</option>
              </select>
            </div>

            <div className="form-group">
              <label>Caractéristiques supplémentaires</label>
              <textarea
                name="additional_features"
                value={formData.additional_features}
                onChange={handleChange}
                rows="3"
                placeholder="Ex: Parking, Jardin..."
              />
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Annuler
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Modification...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HousingEditModal;
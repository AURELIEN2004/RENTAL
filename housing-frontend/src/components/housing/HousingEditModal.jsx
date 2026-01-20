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





// import React, { useState, useEffect } from 'react';
// import api from '../../services/api';
// import { toast } from 'react-toastify';
// import './HousingEditModal.css';

// const HousingEditModal = ({ housing, onClose, onUpdate }) => {
//   const [formData, setFormData] = useState({
//     title: housing.title || '',
//     description: housing.description || '',
//     category: housing.category?.id || '',
//     housing_type: housing.housing_type?.id || '',
//     price: housing.price || '',
//     area: housing.area || '',
//     rooms: housing.rooms || 1,
//     bathrooms: housing.bathrooms || 1,
//     status: housing.status || 'disponible',
//     additional_features: housing.additional_features || '',
//     // Nouveaux champs ajoutés
//     region: housing.region?.id || '',
//     city: housing.city?.id || '',
//     district: housing.district?.id || '',
//     latitude: housing.latitude || '',
//     longitude: housing.longitude || '',
//     virtual_360: housing.virtual_360 || '',
//     video: null
//   });

//   const [options, setOptions] = useState({
//     categories: [],
//     types: [],
//     regions: [],
//     cities: [],
//     districts: []
//   });

//   const [imageFiles, setImageFiles] = useState([]);
//   const [imagePreviews, setImagePreviews] = useState(housing.images?.map(img => img.image) || []);
//   const [loading, setLoading] = useState(false);
//   const [useGPS, setUseGPS] = useState(false);

//   // Chargement initial des données de base
//   useEffect(() => {
//     const initData = async () => {
//       try {
//         const [catRes, typRes, regRes] = await Promise.all([
//           api.get('/categories/'),
//           api.get('/types/'),
//           api.get('/regions/')
//         ]);

//         setOptions(prev => ({
//           ...prev,
//           categories: catRes.data.results || catRes.data || [],
//           types: typRes.data.results || typRes.data || [],
//           regions: regRes.data.results || regRes.data || []
//         }));

//         // Charger les villes et quartiers si le logement en a déjà
//         if (housing.region?.id) loadCities(housing.region.id);
//         if (housing.city?.id) loadDistricts(housing.city.id);

//       } catch (error) {
//         toast.error('Erreur de chargement des listes');
//       }
//     };
//     initData();
//   }, [housing]);

//   // Fonctions de chargement géographique
//   const loadCities = async (regionId) => {
//     try {
//       const res = await api.get(`/cities/?region=${regionId}`);
//       setOptions(prev => ({ ...prev, cities: res.data.results || res.data || [] }));
//     } catch (e) { toast.error('Erreur villes'); }
//   };

//   const loadDistricts = async (cityId) => {
//     try {
//       const res = await api.get(`/districts/?city=${cityId}`);
//       setOptions(prev => ({ ...prev, districts: res.data.results || res.data || [] }));
//     } catch (e) { toast.error('Erreur quartiers'); }
//   };

//   // Handlers
//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//   };

//   const handleRegionChange = (e) => {
//     const id = e.target.value;
//     setFormData(prev => ({ ...prev, region: id, city: '', district: '' }));
//     if (id) loadCities(id);
//   };

//   const handleCityChange = (e) => {
//     const id = e.target.value;
//     setFormData(prev => ({ ...prev, city: id, district: '' }));
//     if (id) loadDistricts(id);
//   };

//   const handleGPSClick = () => {
//     if (!navigator.geolocation) return toast.error('GPS non supporté');
//     setUseGPS(true);
//     navigator.geolocation.getCurrentPosition(
//       (pos) => {
//         setFormData(prev => ({ ...prev, latitude: pos.coords.latitude, longitude: pos.coords.longitude }));
//         setUseGPS(false);
//         toast.success('Position capturée');
//       },
//       () => { setUseGPS(false); toast.error('Erreur GPS'); }
//     );
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       const submitData = new FormData();
//       // On ajoute tous les champs textes/nombres
//       Object.keys(formData).forEach(key => {
//         if (formData[key] !== null && key !== 'video') {
//           submitData.append(key, formData[key]);
//         }
//       });

//       // Ajout des fichiers
//       if (formData.video) submitData.append('video', formData.video);
//       imageFiles.forEach(file => submitData.append('images', file));

//       // Note: on utilise PATCH pour ne modifier que ce qui est envoyé
//       await onUpdate(submitData); 
//       onClose();
//     } catch (error) {
//       toast.error('Erreur lors de la modification');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="modal-overlay" onClick={onClose}>
//       <div className="modal-content housing-edit-modal" onClick={e => e.stopPropagation()}>
//         <div className="modal-header">
//           <h2>Modifier : {housing.title}</h2>
//           <button className="close-btn" onClick={onClose}>✕</button>
//         </div>

//         <form onSubmit={handleSubmit} className="edit-form">
//           {/* 1. INFOS DE BASE */}
//           <div className="form-section">
//             <h3>Informations de base</h3>
//             <div className="form-group">
//               <label>Titre *</label>
//               <input type="text" name="title" value={formData.title} onChange={handleChange} required />
//             </div>
//             <div className="form-row">
//               <div className="form-group">
//                 <label>Catégorie</label>
//                 <select name="category" value={formData.category} onChange={handleChange}>
//                   {options.categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
//                 </select>
//               </div>
//               <div className="form-group">
//                 <label>Statut</label>
//                 <select name="status" value={formData.status} onChange={handleChange}>
//                   <option value="disponible">Disponible</option>
//                   <option value="reserve">Réservé</option>
//                   <option value="occupe">Occupé</option>
//                 </select>
//               </div>
//             </div>
//           </div>

//           {/* 2. LOCALISATION ET GPS */}
//           <div className="form-section">
//             <h3>Localisation</h3>
//             <div className="form-row">
//               <div className="form-group">
//                 <label>Région</label>
//                 <select name="region" value={formData.region} onChange={handleRegionChange}>
//                   <option value="">Sélectionner</option>
//                   {options.regions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
//                 </select>
//               </div>
//               <div className="form-group">
//                 <label>Ville</label>
//                 <select name="city" value={formData.city} onChange={handleCityChange} disabled={!formData.region}>
//                   <option value="">Sélectionner</option>
//                   {options.cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
//                 </select>
//               </div>
//             </div>
//             <div className="form-group">
//                 <label>Quartier</label>
//                 <select name="district" value={formData.district} onChange={handleChange} disabled={!formData.city}>
//                   <option value="">Sélectionner</option>
//                   {options.districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
//                 </select>
//             </div>
//             <button type="button" className="gps-btn" onClick={handleGPSClick}>
//               {useGPS ? 'Localisation...' : '📍 Mettre à jour position GPS'}
//             </button>
//           </div>

//           {/* 3. MÉDIAS */}
//           <div className="form-section">
//             <h3>Médias</h3>
//             <div className="form-group">
//               <label>Nouvelles Photos (remplace les anciennes si fourni)</label>
//               <input type="file" multiple accept="image/*" 
//                 onChange={(e) => {
//                   const files = Array.from(e.target.files);
//                   setImageFiles(files);
//                   setImagePreviews(files.map(f => URL.createObjectURL(f)));
//                 }} 
//               />
//               <div className="edit-preview-grid">
//                 {imagePreviews.slice(0, 4).map((p, i) => <img key={i} src={p} alt="preview" />)}
//               </div>
//             </div>
//             <div className="form-group">
//               <label>Vidéo</label>
//               <input type="file" accept="video/*" onChange={(e) => setFormData({...formData, video: e.target.files[0]})} />
//             </div>
//             <div className="form-group">
//               <label>URL Visite Virtuelle</label>
//               <input type="url" name="virtual_360" value={formData.virtual_360} onChange={handleChange} placeholder="https://..." />
//             </div>
//           </div>

//           <div className="modal-actions">
//             <button type="button" className="btn btn-outline" onClick={onClose}>Annuler</button>
//             <button type="submit" className="btn btn-primary" disabled={loading}>
//               {loading ? 'Enregistrement...' : 'Mettre à jour le logement'}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default HousingEditModal;
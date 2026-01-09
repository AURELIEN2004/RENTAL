

// src/pages/Contact.jsx
// ============================================

import React, { useState } from 'react';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaWhatsapp } from 'react-icons/fa';
import { toast } from 'react-toastify';
import './Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulation d'envoi (à remplacer par un vrai appel API)
    setTimeout(() => {
      toast.success('Message envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="contact-page">
      <div className="container">
        {/* Hero */}
        <section className="contact-hero">
          <h1>Contactez-nous</h1>
          <p>Une question ? Une suggestion ? Nous sommes là pour vous aider !</p>
        </section>

        <div className="contact-content">
          {/* Formulaire */}
          <div className="contact-form-section">
            <h2>Envoyez-nous un message</h2>
            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-group">
                <label>Nom complet *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Votre nom"
                />
              </div>

              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="votre@email.com"
                />
              </div>

              <div className="form-group">
                <label>Sujet *</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  placeholder="Sujet de votre message"
                />
              </div>

              <div className="form-group">
                <label>Message *</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="6"
                  placeholder="Écrivez votre message ici..."
                ></textarea>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary btn-block"
                disabled={loading}
              >
                {loading ? 'Envoi en cours...' : 'Envoyer le message'}
              </button>
            </form>
          </div>

          {/* Informations de contact */}
          <div className="contact-info-section">
            <h2>Nos Coordonnées</h2>

            <div className="contact-info-card">
              <div className="info-icon">
                <FaPhone />
              </div>
              <div className="info-content">
                <h3>Téléphone</h3>
                <p>+237 659887452</p>
                <a href="tel:+237659887452" className="btn btn-sm btn-outline">
                  Appeler
                </a>
              </div>
            </div>

            <div className="contact-info-card">
              <div className="info-icon">
                <FaWhatsapp />
              </div>
              <div className="info-content">
                <h3>WhatsApp</h3>
                <p>+237 659887452</p>
                <a 
                  href="https://wa.me/237659887452" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn btn-sm btn-outline"
                >
                  Discuter
                </a>
              </div>
            </div>

            <div className="contact-info-card">
              <div className="info-icon">
                <FaEnvelope />
              </div>
              <div className="info-content">
                <h3>Email</h3>
                <p>feudjioaurelien24@gmail.com</p>
                <a 
                  href="mailto:feudjioaurelien24@gmail.com" 
                  className="btn btn-sm btn-outline"
                >
                  Envoyer un email
                </a>
              </div>
            </div>

            <div className="contact-info-card">
              <div className="info-icon">
                <FaMapMarkerAlt />
              </div>
              <div className="info-content">
                <h3>Adresse</h3>
                <p>Yaoundé, Cameroun</p>
              </div>
            </div>

            {/* Horaires */}
            <div className="opening-hours">
              <h3>Horaires de disponibilité</h3>
              <p><strong>Lundi - Vendredi:</strong> 8h00 - 18h00</p>
              <p><strong>Samedi:</strong> 9h00 - 14h00</p>
              <p><strong>Dimanche:</strong> Fermé</p>
            </div>
          </div>
        </div>

        {/* FAQ rapide */}
        <section className="contact-faq">
          <h2>Questions Fréquentes</h2>
          <div className="faq-grid">
            <div className="faq-item">
              <h3>Combien coûte l'utilisation de la plateforme ?</h3>
              <p>L'utilisation est totalement gratuite pour les locataires. Les propriétaires peuvent publier gratuitement.</p>
            </div>
            <div className="faq-item">
              <h3>Comment puis-je publier un logement ?</h3>
              <p>Créez un compte propriétaire, accédez à votre dashboard et cliquez sur "Ajouter un logement".</p>
            </div>
            <div className="faq-item">
              <h3>Les logements sont-ils vérifiés ?</h3>
              <p>Oui, notre équipe vérifie tous les logements avant leur publication pour garantir leur authenticité.</p>
            </div>
            <div className="faq-item">
              <h3>Puis-je contacter les propriétaires ?</h3>
              <p>Oui, vous pouvez les contacter via notre messagerie intégrée, WhatsApp ou par téléphone.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Contact;
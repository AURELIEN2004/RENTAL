
// src/pages/Testimonials.jsx
// ============================================

import React, { useState, useEffect } from 'react';
import { FaStar } from 'react-icons/fa';
import api from '../services/api';
import { toast } from 'react-toastify';
import './Testimonials.css';

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTestimonials();
  }, []);

  const loadTestimonials = async () => {
    try {
      const response = await api.get('/testimonials/');
      setTestimonials(response.data);
    } catch (error) {
      toast.error('Erreur lors du chargement des témoignages');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <FaStar
        key={index}
        className={index < rating ? 'star filled' : 'star'}
      />
    ));
  };

  return (
    <div className="testimonials-page">
      <div className="container">
        {/* Hero */}
        <section className="testimonials-hero">
          <h1>Témoignages</h1>
          <p>Ce que nos utilisateurs disent de nous</p>
        </section>

        {/* Stats */}
        <section className="testimonials-stats">
          <div className="stat-item">
            <div className="stat-number">1500+</div>
            <div className="stat-label">Utilisateurs Satisfaits</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">4.8/5</div>
            <div className="stat-label">Note Moyenne</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">95%</div>
            <div className="stat-label">Recommandent</div>
          </div>
        </section>

        {/* Testimonials Grid */}
        <section className="testimonials-section">
          {loading ? (
            <div className="loading">Chargement des témoignages...</div>
          ) : testimonials.length === 0 ? (
            <p className="no-testimonials">Aucun témoignage pour le moment</p>
          ) : (
            <div className="testimonials-grid">
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="testimonial-card">
                  <div className="testimonial-header">
                    <img
                      src={testimonial.user_photo || '/default-avatar.png'}
                      alt={testimonial.user_name}
                      className="testimonial-avatar"
                    />
                    <div className="testimonial-info">
                      <h3>{testimonial.user_name}</h3>
                      <div className="testimonial-rating">
                        {renderStars(testimonial.rating)}
                      </div>
                    </div>
                  </div>
                  <p className="testimonial-content">{testimonial.content}</p>
                  <div className="testimonial-date">
                    {new Date(testimonial.created_at).toLocaleDateString('fr-FR')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* CTA */}
        <section className="testimonials-cta">
          <h2>Vous aussi, trouvez votre logement idéal</h2>
          <a href="/register" className="btn btn-primary btn-lg">
            Commencer maintenant
          </a>
        </section>
      </div>
    </div>
  );
};

export default Testimonials;
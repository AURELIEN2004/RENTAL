// ============================================
// src/pages/Home.jsx - Page d'accueil
// ============================================

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { housingService } from '../services/housingService';
import HousingCard from '../components/housing/HousingCard';
import { FaHome, FaUsers, FaCity, FaStar } from 'react-icons/fa';
import './Home.css';

const Home = () => {
  const [featuredHousings, setFeaturedHousings] = useState([]);
  const [stats, setStats] = useState({
    totalHousings: 0,
    totalCities: 0,
    satisfiedClients: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      // Charger les logements recommandés
      const housings = await housingService.getRecommendedHousings();
      setFeaturedHousings(housings.slice(0, 6));

      // Charger les statistiques (à implémenter côté API)
      setStats({
        totalHousings: 250,
        totalCities: 12,
        satisfiedClients: 1500,
      });
    } catch (error) {
      console.error('Error loading home data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (searchData) => {
    // Rediriger vers la page de recherche avec les paramètres
    const params = new URLSearchParams(searchData).toString();
    window.location.href = `/search?${params}`;
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <video autoPlay loop muted className="hero-video">
          <source src="/video-hero.mp4" type="video/mp4" />
        </video>
        
        <div className="hero-content">
          <h1 className="hero-title">
            Trouvez Votre Logement Idéal
          </h1>
          <p className="hero-subtitle">
            Plateforme intelligente de location de logements au Cameroun
          </p>
          
          {/* <SearchBar onSearch={handleSearch} showFilters={false} /> */}
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">
                <FaHome />
              </div>
              <h3 className="stat-number">{stats.totalHousings}+</h3>
              <p className="stat-label">Logements disponibles</p>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <FaCity />
              </div>
              <h3 className="stat-number">{stats.totalCities}+</h3>
              <p className="stat-label">Villes couvertes</p>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <FaStar />
              </div>
              <h3 className="stat-number">{stats.satisfiedClients}+</h3>
              <p className="stat-label">Clients satisfaits</p>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <FaUsers />
              </div>
              <h3 className="stat-number">24/7</h3>
              <p className="stat-label">Support disponible</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Housings */}
      <section className="featured-section">
        <div className="container">
          <div className="section-header">
            <h2>Logements en Vedette</h2>
            <p>Sélectionnés par notre algorithme intelligent</p>
          </div>

          {loading ? (
            <div className="loading">Chargement...</div>
          ) : (
            <div className="housing-grid">
              {featuredHousings.map(housing => (
                <HousingCard key={housing.id} housing={housing} />
              ))}
            </div>
          )}

          <div className="section-footer">
            <Link to="/search" className="btn btn-primary btn-lg">
              Voir tous les logements
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <div className="container">
          <h2>Comment Ça Marche ?</h2>
          
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <h3>Recherchez</h3>
              <p>Utilisez notre barre de recherche ou notre chatbot intelligent</p>
            </div>

            <div className="step-card">
              <div className="step-number">2</div>
              <h3>Comparez</h3>
              <p>Consultez les détails, photos et localisation</p>
            </div>

            <div className="step-card">
              <div className="step-number">3</div>
              <h3>Contactez</h3>
              <p>Discutez directement avec le propriétaire</p>
            </div>

            <div className="step-card">
              <div className="step-number">4</div>
              <h3>Visitez</h3>
              <p>Planifiez une visite et trouvez votre logement</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <h2>Vous êtes propriétaire ?</h2>
          <p>Publiez vos logements gratuitement et touchez des milliers de locataires</p>
          <Link to="/register" className="btn btn-white btn-lg">
            Commencer Maintenant
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;


// src/pages/Services.jsx
// ============================================

import React from 'react';
import { 
  FaSearch, FaMapMarkedAlt, FaComments, FaCalendarCheck,
  FaChartLine, FaBell, FaVideo, FaMobileAlt 
} from 'react-icons/fa';
import './Services.css';

const Services = () => {
  const locataireServices = [
    {
      icon: <FaSearch />,
      title: 'Recherche Intelligente',
      description: 'Trouvez rapidement le logement idéal grâce à notre algorithme de recommandation basé sur vos préférences.'
    },
    {
      icon: <FaMapMarkedAlt />,
      title: 'Géolocalisation',
      description: 'Visualisez les logements sur une carte interactive et calculez les itinéraires vers vos destinations importantes.'
    },
    {
      icon: <FaComments />,
      title: 'Messagerie Sécurisée',
      description: 'Communiquez directement avec les propriétaires via notre système de messagerie intégré avec traduction automatique.'
    },
    {
      icon: <FaCalendarCheck />,
      title: 'Planification de Visites',
      description: 'Planifiez vos visites en ligne et recevez des confirmations instantanées des propriétaires.'
    },
    {
      icon: <FaVideo />,
      title: 'Visites Virtuelles',
      description: 'Découvrez les logements à distance grâce aux vidéos et aux visites virtuelles 360°.'
    },
    {
      icon: <FaBell />,
      title: 'Notifications',
      description: 'Recevez des alertes instantanées pour les nouveaux logements correspondant à vos critères.'
    }
  ];

  const proprietaireServices = [
    {
      icon: <FaChartLine />,
      title: 'Gestion Complète',
      description: 'Dashboard intuitif pour gérer tous vos logements, visites et réservations en un seul endroit.'
    },
    {
      icon: <FaChartLine />,
      title: 'Statistiques Détaillées',
      description: 'Suivez les performances de vos annonces : nombre de vues, de likes, et taux de conversion.'
    },
    {
      icon: <FaComments />,
      title: 'Communication Facilitée',
      description: 'Répondez rapidement aux demandes des locataires via notre messagerie intégrée.'
    },
    {
      icon: <FaVideo />,
      title: 'Médias Enrichis',
      description: 'Ajoutez des photos, vidéos et visites virtuelles pour mettre en valeur vos logements.'
    },
    {
      icon: <FaBell />,
      title: 'Alertes en Temps Réel',
      description: 'Recevez des notifications pour chaque nouvelle demande de visite ou message.'
    },
    {
      icon: <FaMobileAlt />,
      title: 'Gestion Mobile',
      description: 'Gérez vos logements depuis votre smartphone avec notre application mobile.'
    }
  ];

  return (
    <div className="services-page">
      <div className="container">
        {/* Hero */}
        <section className="services-hero">
          <h1>Nos Services</h1>
          <p>Des solutions complètes pour locataires et propriétaires</p>
        </section>

        {/* Services Locataires */}
        <section className="services-section">
          <div className="section-header">
            <h2>Pour les Locataires</h2>
            <p>Trouvez votre logement idéal en toute simplicité</p>
          </div>
          <div className="services-grid">
            {locataireServices.map((service, index) => (
              <div key={index} className="service-card">
                <div className="service-icon">{service.icon}</div>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Services Propriétaires */}
        <section className="services-section">
          <div className="section-header">
            <h2>Pour les Propriétaires</h2>
            <p>Louez vos logements rapidement et efficacement</p>
          </div>
          <div className="services-grid">
            {proprietaireServices.map((service, index) => (
              <div key={index} className="service-card">
                <div className="service-icon">{service.icon}</div>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Process */}
        <section className="services-section process-section">
          <h2>Comment ça marche ?</h2>
          <div className="process-steps">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Inscription</h3>
              <p>Créez votre compte gratuitement en quelques clics</p>
            </div>
            <div className="step-arrow">→</div>
            <div className="step">
              <div className="step-number">2</div>
              <h3>Recherche</h3>
              <p>Parcourez ou publiez des logements</p>
            </div>
            <div className="step-arrow">→</div>
            <div className="step">
              <div className="step-number">3</div>
              <h3>Contact</h3>
              <p>Échangez via notre messagerie sécurisée</p>
            </div>
            <div className="step-arrow">→</div>
            <div className="step">
              <div className="step-number">4</div>
              <h3>Visite</h3>
              <p>Planifiez et effectuez une visite</p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="services-cta">
          <h2>Prêt à commencer ?</h2>
          <p>Rejoignez des milliers d'utilisateurs satisfaits</p>
          <div className="cta-buttons">
            <a href="/register" className="btn btn-primary btn-lg">
              Créer un compte
            </a>
            <a href="/search" className="btn btn-outline btn-lg">
              Voir les logements
            </a>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Services;
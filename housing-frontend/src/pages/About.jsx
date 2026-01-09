
// src/pages/About.jsx
// ============================================

import React from 'react';
import './About.css';

const About = () => {
  return (
    <div className="about-page">
      <div className="container">
        {/* Hero Section */}
        <section className="about-hero">
          <h1>À Propos de Housing Platform</h1>
          <p className="subtitle">
            Votre partenaire de confiance pour trouver le logement idéal au Cameroun
          </p>
        </section>

        {/* Mission */}
        <section className="about-section">
          <h2>Notre Mission</h2>
          <p>
            Housing Platform a pour mission de faciliter la recherche et la location de logements 
            au Cameroun en utilisant les technologies les plus innovantes. Nous croyons que trouver 
            un logement ne devrait pas être compliqué, et c'est pourquoi nous avons développé une 
            plateforme intelligente qui comprend vos besoins.
          </p>
        </section>

        {/* Innovation */}
        <section className="about-section">
          <h2>Notre Innovation</h2>
          <div className="innovation-grid">
            <div className="innovation-card">
              <div className="icon">🧬</div>
              <h3>Algorithme Génétique</h3>
              <p>
                Notre système utilise un algorithme génétique avancé pour vous recommander 
                les logements les plus pertinents selon vos préférences et votre budget.
              </p>
            </div>
            <div className="innovation-card">
              <div className="icon">🗺️</div>
              <h3>Géolocalisation</h3>
              <p>
                Visualisez les logements sur une carte interactive et trouvez ceux qui sont 
                proches de vos lieux d'intérêt (travail, écoles, commerces).
              </p>
            </div>
            <div className="innovation-card">
              <div className="icon">💬</div>
              <h3>Messagerie Intégrée</h3>
              <p>
                Communiquez directement avec les propriétaires via notre messagerie sécurisée 
                avec traduction automatique français-anglais.
              </p>
            </div>
            <div className="innovation-card">
              <div className="icon">📱</div>
              <h3>Multiplateforme</h3>
              <p>
                Accédez à nos services sur le web et via notre application mobile disponible 
                sur iOS et Android.
              </p>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="about-section values-section">
          <h2>Nos Valeurs</h2>
          <div className="values-grid">
            <div className="value-item">
              <h3>🎯 Transparence</h3>
              <p>
                Toutes les informations sur les logements sont vérifiées et transparentes. 
                Pas de surprises, pas de frais cachés.
              </p>
            </div>
            <div className="value-item">
              <h3>🤝 Confiance</h3>
              <p>
                Nous vérifions l'identité de tous nos propriétaires et modérons activement 
                les annonces pour garantir votre sécurité.
              </p>
            </div>
            <div className="value-item">
              <h3>⚡ Rapidité</h3>
              <p>
                Notre plateforme vous permet de trouver et contacter des propriétaires 
                en quelques clics seulement.
              </p>
            </div>
            <div className="value-item">
              <h3>🌍 Accessibilité</h3>
              <p>
                Service gratuit pour les locataires, interface multilingue et support 
                disponible 24/7.
              </p>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="about-section stats-section">
          <h2>Housing Platform en Chiffres</h2>
          <div className="stats-grid">
            <div className="stat-box">
              <div className="stat-number">250+</div>
              <div className="stat-label">Logements disponibles</div>
            </div>
            <div className="stat-box">
              <div className="stat-number">12</div>
              <div className="stat-label">Villes couvertes</div>
            </div>
            <div className="stat-box">
              <div className="stat-number">1500+</div>
              <div className="stat-label">Utilisateurs actifs</div>
            </div>
            <div className="stat-box">
              <div className="stat-number">95%</div>
              <div className="stat-label">Taux de satisfaction</div>
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="about-section">
          <h2>Notre Équipe</h2>
          <p className="text-center">
            Housing Platform est développé par une équipe passionnée de développeurs 
            et de professionnels de l'immobilier basés à Yaoundé, Cameroun.
          </p>
        </section>

        {/* CTA */}
        <section className="about-cta">
          <h2>Prêt à trouver votre logement idéal ?</h2>
          <div className="cta-buttons">
            <a href="/register" className="btn btn-primary btn-lg">
              Créer un compte gratuitement
            </a>
            <a href="/search" className="btn btn-outline btn-lg">
              Parcourir les logements
            </a>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;

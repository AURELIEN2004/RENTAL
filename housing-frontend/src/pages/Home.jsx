// // ============================================
// // src/pages/Home.jsx - Page d'accueil
// // ============================================

// import React, { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';
// import { housingService } from '../services/housingService';
// import HousingCard from '../components/housing/HousingCard';
// import { FaHome, FaUsers, FaCity, FaStar } from 'react-icons/fa';
// import './Home.css';
// // import SearchBar from '../components/Search/SearchBar';

// const Home = () => {
//   const [featuredHousings, setFeaturedHousings] = useState([]);
//   const [stats, setStats] = useState({
//     totalHousings: 0,
//     totalCities: 0,
//     satisfiedClients: 0,
//   });
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     loadHomeData();
//   }, []);

//   const loadHomeData = async () => {
//     try {
//       // Charger les logements recommandés
//       const housings = await housingService.getRecommendedHousings();
//       setFeaturedHousings(housings.slice(0, 6));

//       // Charger les statistiques (à implémenter côté API)
//       setStats({
//         totalHousings: 250,
//         totalCities: 12,
//         satisfiedClients: 1500,
//       });
//     } catch (error) {
//       console.error('Error loading home data:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSearch = (searchData) => {
//     // Rediriger vers la page de recherche avec les paramètres
//     const params = new URLSearchParams(searchData).toString();
//     window.location.href = `/search?${params}`;
//   };
  

//   return (
//     <div className="home-page">
//   {/* Hero Section */}
//       <section className="hero-section">
//         <div className="hero-overlay"></div>
//         {/* <video autoPlay loop muted className="hero-video">
//           <source src="/video-hero.mp4" type="video/mp4" />
          
//         </video> */}
//         {/* <img src="assets/scene_1.png"/> */}
        
//         <div className="hero-content">
//           <h1 className="hero-title">
//             Trouvez Votre Logement Idéal
//           </h1>
//           <p className="hero-subtitle">
//             Plateforme intelligente de location de logements au Cameroun
//           </p>
//           <Link to="/search" className="btn btn-white btn-lg">
//             Rechercher Logement
//           </Link>
//         </div>
//       </section>

//       {/* Stats Section */}
//       <section className="stats-section">
//         <div className="container">
//           <div className="stats-grid">
//             <div className="stat-card">
//               <div className="stat-icon">
//                 <FaHome />
//               </div>
//               <h3 className="stat-number">{stats.totalHousings}+</h3>
//               <p className="stat-label">Logements disponibles</p>
//             </div>

//             <div className="stat-card">
//               <div className="stat-icon">
//                 <FaCity />
//               </div>
//               <h3 className="stat-number">{stats.totalCities}+</h3>
//               <p className="stat-label">Villes couvertes</p>
//             </div>

//             <div className="stat-card">
//               <div className="stat-icon">
//                 <FaStar />
//               </div>
//               <h3 className="stat-number">{stats.satisfiedClients}+</h3>
//               <p className="stat-label">Clients satisfaits</p>
//             </div>

//             <div className="stat-card">
//               <div className="stat-icon">
//                 <FaUsers />
//               </div>
//               <h3 className="stat-number">24/7</h3>
//               <p className="stat-label">Support disponible</p>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Featured Housings */}
//       <section className="featured-section">
//         <div className="container">
//           <div className="section-header">
//             <h2>Logements en Vedette</h2>
//             <p>Sélectionnés par notre algorithme intelligent</p>
//           </div>

//           {loading ? (
//             <div className="loading">Chargement...</div>
//           ) : (
//             <div className="housing-grid">
//               {featuredHousings.map(housing => (
//                 <HousingCard key={housing.id} housing={housing} />
//               ))}
//             </div>
//           )}

//           <div className="section-footer">
//             <Link to="/search" className="btn btn-primary btn-lg">
//               Voir tous les logements
//             </Link>
//           </div>
//         </div>
//       </section>

//       {/* How It Works */}
//       <section className="how-it-works">
//         <div className="container">
//           <h2>Comment Ça Marche ?</h2>
          
//           <div className="steps-grid">
//             <div className="step-card">
//               <div className="step-number">1</div>
//               <h3>Recherchez</h3>
//               <p>Utilisez notre barre de recherche ou notre chatbot intelligent</p>
//             </div>

//             <div className="step-card">
//               <div className="step-number">2</div>
//               <h3>Comparez</h3>
//               <p>Consultez les détails, photos et localisation</p>
//             </div>

//             <div className="step-card">
//               <div className="step-number">3</div>
//               <h3>Contactez</h3>
//               <p>Discutez directement avec le propriétaire</p>
//             </div>

//             <div className="step-card">
//               <div className="step-number">4</div>
//               <h3>Visitez</h3>
//               <p>Planifiez une visite et trouvez votre logement</p>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* CTA Section */}
//       <section className="cta-section">
//         <div className="container">
//           <h2>Vous êtes propriétaire ?</h2>
//           <p>Publiez vos logements gratuitement et touchez des milliers de locataires</p>
//           <Link to="/register" className="btn btn-white btn-lg">
//             Commencer Maintenant
//           </Link>
//         </div>
//       </section>
//     </div>
//   );
// };

// export default Home;



// src/pages/Home.jsx — VERSION CORRIGÉE
// Fix 1 : déduplication (un logement ne peut apparaître qu'une fois)
// Fix 2 : limite stricte à 3 suggestions
// Ajout  : quiz de préférences si utilisateur connecté et pas encore répondu

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { housingService } from '../services/housingService';
import HousingCard from '../components/housing/HousingCard';
import PreferenceQuiz from '../components/quiz/PreferenceQuiz';
import { useAuth } from '../contexts/AuthContext';
import { FaHome, FaUsers, FaCity, FaStar, FaBrain } from 'react-icons/fa';
import { Sparkles } from 'lucide-react';
import './Home.css';
import { useTheme } from '../contexts/ThemeContext';

const MAX_FEATURED = 3; // ← limite stricte

const Home = () => {
  const { user } = useAuth();
  const navigate  = useNavigate();
const { t, language, theme } = useTheme();
  const [featuredHousings, setFeaturedHousings] = useState([]);
  const [stats,   setStats]   = useState({ totalHousings: 0, totalCities: 0, satisfiedClients: 0 });
  const [loading, setLoading] = useState(true);
  const [showQuiz, setShowQuiz] = useState(false);

  
  useEffect(() => {
    loadHomeData();
  }, [language]);

  // Affiche le quiz automatiquement si l'utilisateur est connecté
  // et n'a pas encore renseigné ses préférences
  useEffect(() => {
    if (user) {
      const quizDone = localStorage.getItem(`quiz_done_${user.id || user.username}`);
      if (!quizDone) {
        // Délai de 1s pour laisser la page se charger
        const t = setTimeout(() => setShowQuiz(true), 1000);
        return () => clearTimeout(t);
      }
    }
  }, [user]);

  const loadHomeData = async () => {
    try {
      const raw = await housingService.getRecommendedHousings();
      const list = Array.isArray(raw) ? raw : (raw.results || []);

      // ── FIX 1 : déduplication par ID ──────────────────────────
      const seen = new Set();
      const unique = list.filter(h => {
        if (seen.has(h.id)) return false;
        seen.add(h.id);
        return true;
      });

      // ── FIX 2 : limite à 3 ────────────────────────────────────
      setFeaturedHousings(unique.slice(0, MAX_FEATURED));

      setStats({ totalHousings: 250, totalCities: 12, satisfiedClients: 1500 });
    } catch (err) {
      console.error('Erreur chargement home:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuizComplete = (preferences) => {
    // Marquer comme fait pour cet utilisateur
    if (user) {
      localStorage.setItem(`quiz_done_${user.id || user.username}`, '1');
    }
    setShowQuiz(false);
    // Recharger les recommandations avec les nouvelles préférences
    loadHomeData();
  };

  const handleQuizSkip = () => {
    if (user) {
      localStorage.setItem(`quiz_done_${user.id || user.username}`, 'skipped');
    }
    setShowQuiz(false);
  };

  return (
    <div className="home-page">

      {/* ── Quiz modal ── */}
      {showQuiz && (
        <PreferenceQuiz
          onComplete={handleQuizComplete}
          onSkip={handleQuizSkip}
        />
      )}

      {/* ── Hero ── */}
      <section className="hero-section">
        <div className="hero-overlay" />
        <video autoPlay loop muted className="hero-video">
          <source src="/video-hero.mp4" type="video/mp4" />
        </video>
        <div className="hero-content">
          <h1 className="hero-title">{t('home_hero_title')}</h1>
          <p className="hero-subtitle">
{t('home_hero_subtitle')}          </p>
          <div className="hero-actions">
            <Link to="/search" className="btn btn-white btn-lg">
              {t('search_housing')}
            </Link>
            {user && (
              <button
                className="btn btn-outline-white btn-lg"
                onClick={() => setShowQuiz(true)}
              >
                <FaBrain /> {t('refine_recommendations')}
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon"><FaHome /></div>
              <h3 className="stat-number">{stats.totalHousings}+</h3>
              <p className="stat-label">{t('available_housings')}</p>
            </div>
            <div className="stat-card">
              <div className="stat-icon"><FaCity /></div>
              <h3 className="stat-number">{stats.totalCities}+</h3>
              <p className="stat-label">{t('covered_cities')}</p>
            </div>
            <div className="stat-card">
              <div className="stat-icon"><FaStar /></div>
              <h3 className="stat-number">{stats.satisfiedClients}+</h3>
              <p className="stat-label">{t('satisfied_clients')}</p>
            </div>
            <div className="stat-card">
              <div className="stat-icon"><FaUsers /></div>
              <h3 className="stat-number">24/7</h3>
              <p className="stat-label">{t('support_available')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Logements en Vedette ── */}
      <section className="featured-section">
        <div className="container">
          <div className="section-header">
            <h2>{t('featured_housings')}</h2>
            <p>
              <Sparkles size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} />
{t('selected_by_algorithm')}              {user && (
                <button
                  className="quiz-hint-btn"
                  onClick={() => setShowQuiz(true)}
                  title={t('improve_suggestions')}
                >
                  · {t('refine_preferences')}
                </button>
              )}
            </p>
          </div>

          {loading ? (
            <div className="loading">{t('loading')}</div>
          ) : featuredHousings.length === 0 ? (
            <div className="no-featured">
              <p>{t('no_recommendations')}</p>
              <Link to="/search" className="btn btn-primary">{t('browse_housings')}</Link>
            </div>
          ) : (
            <div className="housing-grid housing-grid--featured">
              {featuredHousings.map(housing => (
                <HousingCard key={housing.id} housing={housing} />
              ))}
            </div>
          )}

          <div className="section-footer">
            <Link to="/search" className="btn btn-primary btn-lg">
              {t('view_all_housings')}
            </Link>
          </div>
        </div>
      </section>

      {/* ── Comment ça marche ── */}
      <section className="how-it-works">
        <div className="container">
          <h2>{t('how_it_works')}</h2>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <h3>{t('step_search')}</h3>
<p>{t('step_search_desc')}</p>
            </div>
            <div className="step-card">
              <div className="step-number">2</div>
              <h3>{t('step_compare')}</h3>
<p>{t('step_compare_desc')}</p>
            </div>
            <div className="step-card">
              <div className="step-number">3</div>
              <h3>{t('step_contact')}</h3>
<p>{t('step_contact_desc')}</p>
            </div>
            <div className="step-card">
              <div className="step-number">4</div>
              <h3>{t('step_visit')}</h3>
<p>{t('step_visit_desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta-section">
        <div className="container">
<h2>{t('cta_owner_title')}</h2>

<p>{t('cta_owner_desc')}</p>

<Link to="/register" className="btn btn-white btn-lg">
  {t('start_now')}
</Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
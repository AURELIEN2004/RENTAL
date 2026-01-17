
// ============================================
// src/components/common/Footer.jsx
// ============================================

import React from 'react';
import { Link } from 'react-router-dom';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Section 1: À propos */}
        <div className="footer-section">
          <h3>Housing Platform</h3>
          <p>
            Plateforme innovante de location de logements au Cameroun. 
            Trouvez le logement idéal grâce à notre algorithme intelligent.
          </p>
          <div className="social-links">
            <a href="#" aria-label="Facebook"><FaFacebook /></a>
            <a href="#" aria-label="Twitter"><FaTwitter /></a>
            <a href="#" aria-label="Instagram"><FaInstagram /></a>
          </div>
        </div>

        {/* Section 2: Liens rapides */}
        <div className="footer-section">
          <h4>Liens Rapides</h4>
          <ul>
            <li><Link to="/about">À propos</Link></li>
            <li><Link to="/services">Services</Link></li>
            <li><Link to="/search">Rechercher un logement</Link></li>
            <li><Link to="/testimonials">Témoignages</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </div>

        {/* Section 3: Contact */}
        <div className="footer-section">
          <h4>Contact</h4>
          <div className="contact-info">
            <p><FaPhone /> +237 659887452</p>
            <p><FaEnvelope /> feudjioaurelien24@gmail.com</p>
            <p><FaMapMarkerAlt /> Yaoundé, Cameroun</p>
          </div>
        </div>

        {/* Section 4: Télécharger l'app */}
        <div className="footer-section">
          <h4>Application Mobile</h4>
          <p>Téléchargez notre application</p>
          <div className="app-downloads">
            <a href="#" className="app-badge">
              <img src="/app-store.png" alt="App Store" />
            </a>
            <a href="#" className="app-badge">
              <img src="/play-store.png" alt="Play Store" />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <div className="footer-container">
          <p>&copy; 2025 Housing Platform. Tous droits réservés.</p>
          <div className="footer-links">
            <Link to="/privacy">Politique de confidentialité</Link>
            <Link to="/terms">Conditions d'utilisation</Link>
            <Link to="/legal">Mentions légales</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;


// import React from 'react';
// import { Link } from 'react-router-dom';
// import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa';
// import './Footer.css';

// const Footer = () => {
//   return (
//     <footer className="footer"></footer>
//   )
// }
// export default Footer;
   
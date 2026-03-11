
// src/components/common/Footer.jsx — VERSION BILINGUE
import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import {
  FaPhone, FaEnvelope, FaMapMarkerAlt,
  FaFacebook, FaTwitter, FaInstagram,
} from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
  const { t } = useTheme();

  return (
    <footer className="footer">
      <div className="footer-container">

        {/* À propos */}
        <div className="footer-section">
          <h3>RentAL</h3>
          <p>{t('footer_desc')}</p>
          <div className="social-links">
            <a href="#" aria-label="Facebook"><FaFacebook /></a>
            <a href="#" aria-label="Twitter"><FaTwitter /></a>
            <a href="#" aria-label="Instagram"><FaInstagram /></a>
          </div>
        </div>

        {/* Liens rapides */}
        <div className="footer-section">
          <h4>{t('footer_quick_links')}</h4>
          <ul>
            <li><Link to="/about">{t('about')}</Link></li>
            <li><Link to="/services">{t('services')}</Link></li>
            <li><Link to="/search">{t('search')}</Link></li>
            <li><Link to="/testimonials">{t('footer_testimonials')}</Link></li>
            <li><Link to="/contact">{t('contact')}</Link></li>
          </ul>
        </div>

        {/* Contact */}
        <div className="footer-section">
          <h4>{t('footer_contact')}</h4>
          <div className="contact-info">
            <p><FaPhone /> +237 659887452</p>
            <p><FaEnvelope /> feudjioaurelien24@gmail.com</p>
            <p><FaMapMarkerAlt /> {t('contact_location')}</p>
          </div>
        </div>

        {/* App mobile */}
        <div className="footer-section">
          <h4>{t('footer_mobile_app')}</h4>
          <p>{t('footer_mobile_desc')}</p>
          <div className="app-downloads">
            <a href="https://testflight.apple.com/join/XXXXX" target="_blank" rel="noopener noreferrer" className="app-badge">
              <img src="/assets/app-store.png" alt="App Store" />
            </a>
            <a href="https://play.google.com/apps/testing/com.ton.app" target="_blank" rel="noopener noreferrer" className="app-badge">
              <img src="/assets/play-store.png" alt="Play Store" />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="footer-bottom">
        <div className="footer-container">
          <p>&copy; 2025 RentAL. {t('footer_rights')}</p>
          <div className="footer-links">
            <Link to="/privacy">{t('footer_privacy')}</Link>
            <Link to="/terms">{t('footer_terms')}</Link>
            <Link to="/legal">{t('footer_legal')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
   
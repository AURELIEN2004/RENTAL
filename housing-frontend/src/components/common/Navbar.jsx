
// ============================================
// src/components/common/Navbar.jsx
// ============================================

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  FaSun, FaMoon, FaGlobe, FaBars, FaTimes, 
  FaUser, FaSignOutAlt, FaTachometerAlt 
} from 'react-icons/fa';
import './Navbar.css';
import NotificationBell from '../notifications/NotificationBell';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme, language, toggleLanguage, t } = useTheme();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setUserMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <img src="/logo.png" alt="Logo" className="logo-img" />
            <span className="logo-text">
              Rent<span className="accent">AL</span>
            </span>
          {/* <span className="logo-text">RentAL</span> */}
        </Link>

        {/* Desktop Menu */}
        <ul className={`navbar-menu ${mobileMenuOpen ? 'active' : ''}`}>
          <li><Link to="/" onClick={() => setMobileMenuOpen(false)}>{t('home')}</Link></li>
          <li><Link to="/search" onClick={() => setMobileMenuOpen(false)}>{t('search')}</Link></li>
          <li><Link to="/about" onClick={() => setMobileMenuOpen(false)}>{t('about')}</Link></li>
          <li><Link to="/services" onClick={() => setMobileMenuOpen(false)}>{t('services')}</Link></li>
          <li><Link to="/contact" onClick={() => setMobileMenuOpen(false)}>{t('contact')}</Link></li>
        </ul>

        {/* Actions */}
        <div className="navbar-actions">
          {/* Theme Toggle */}
          <button onClick={toggleTheme} className="icon-btn" title="Changer le thème">
            {theme === 'light' ? <FaMoon /> : <FaSun />}
          </button>

          {/* Language Toggle */}
          <button onClick={toggleLanguage} className="icon-btn" title="Changer la langue">
            <FaGlobe /> <span className="lang-text">{language.toUpperCase()}</span>
          </button>

         {user && <NotificationBell />}

          {/* User Menu */}
          {user ? (
            <div className="user-menu">
              <button 
                className="user-menu-btn" 
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                {user.photo ? (
                  <img src={user.photo} alt={user.username} className="user-avatar" />
                ) : (
                  <FaUser className="user-icon" />
                )}
                <span className="user-name">{user.username}</span>
              </button>

              {userMenuOpen && (
                <div className="user-dropdown">
                  <Link to="/dashboard" onClick={() => setUserMenuOpen(false)}>
                    <FaTachometerAlt /> {t('dashboard')}
                  </Link>
                  <button onClick={handleLogout}>
                    <FaSignOutAlt /> {t('logout')}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-outline">{t('login')}</Link>
              <Link to="/register" className="btn btn-primary">{t('register')}</Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
            {mobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

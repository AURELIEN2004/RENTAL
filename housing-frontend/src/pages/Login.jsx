// // ============================================
// // src/pages/Login.jsx
// // ============================================

// import React, { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { useAuth } from '../contexts/AuthContext';
// import { toast } from 'react-toastify';
// import { FaEnvelope, FaLock, FaGoogle, FaFacebook } from 'react-icons/fa';
// import './Auth.css';

// const Login = () => {
//   const navigate = useNavigate();
//   const { login } = useAuth();
//   const [formData, setFormData] = useState({
//     username: '',
//     password: '',
//   });
//   const [loading, setLoading] = useState(false);

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value,
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       await login(formData.username, formData.password);
//       toast.success('Connexion réussie !');
//       navigate('/dashboard');
//     } catch (error) {
//       toast.error('Identifiants incorrects');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="auth-page">
//       <div className="auth-container">
//         <div className="auth-card">
//           <h1>Connexion</h1>
//           <p className="auth-subtitle">Accédez à votre espace personnel</p>

//           <form onSubmit={handleSubmit} className="auth-form">
//             <div className="form-group">
//               <label>
//                 <FaEnvelope /> Nom d'utilisateur ou Email
//               </label>
//               <input
//                 type="text"
//                 name="username"
//                 value={formData.username}
//                 onChange={handleChange}
//                 placeholder="Entrez votre nom d'utilisateur"
//                 required
//               />
//             </div>

//             <div className="form-group">
//               <label>
//                 <FaLock /> Mot de passe
//               </label>
//               <input
//                 type="password"
//                 name="password"
//                 value={formData.password}
//                 onChange={handleChange}
//                 placeholder="Entrez votre mot de passe"
//                 required
//               />
//             </div>

//             <div className="form-options">
//               <label className="checkbox-label">
//                 <input type="checkbox" />
//                 Se souvenir de moi
//               </label>
//               <Link to="/forgot-password" className="forgot-link">
//                 Mot de passe oublié ?
//               </Link>
//             </div>

//             <button
//               type="submit"
//               className="btn btn-primary btn-block"
//               disabled={loading}
//             >
//               {loading ? 'Connexion...' : 'Se connecter'}
//             </button>
//           </form>

//           <div className="auth-divider">
//             <span>OU</span>
//           </div>

//           <div className="social-auth">
//             <button className="btn btn-google">
//               <FaGoogle /> Continuer avec Google
//             </button>
//             <button className="btn btn-facebook">
//               <FaFacebook /> Continuer avec Facebook
//             </button>
//           </div>

//           <p className="auth-footer">
//             Vous n'avez pas de compte ?{' '}
//             <Link to="/register">Inscrivez-vous</Link>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Login;


// src/pages/Login.jsx — VERSION BILINGUE + DARK MODE
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { toast } from 'react-toastify';
import { FaEnvelope, FaLock, FaGoogle, FaFacebook } from 'react-icons/fa';
import './Auth.css';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useTheme();

  const [formData, setFormData] = useState({ username: '', password: '' });
  const [loading,  setLoading]  = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(formData.username, formData.password);
      toast.success(t('language') === 'en' ? 'Login successful!' : 'Connexion réussie !');
      navigate('/dashboard');
    } catch {
      toast.error(t('error_generic'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <h1>{t('login_title')}</h1>
          <p className="auth-subtitle">{t('login_subtitle')}</p>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label><FaEnvelope /> {t('login_username')}</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder={t('login_username')}
                required
              />
            </div>

            <div className="form-group">
              <label><FaLock /> {t('login_password')}</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder={t('login_password')}
                required
              />
            </div>

            <div className="form-options">
              <label className="checkbox-label">
                <input type="checkbox" /> {t('login_remember')}
              </label>
              <Link to="/forgot-password" className="forgot-link">
                {t('login_forgot')}
              </Link>
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? t('login_loading') : t('login_btn')}
            </button>
          </form>

          <div className="auth-divider"><span>{t('login_or')}</span></div>

          <div className="social-auth">
            <button className="btn btn-google">
              <FaGoogle /> {t('login_google')}
            </button>
            <button className="btn btn-facebook">
              <FaFacebook /> {t('login_facebook')}
            </button>
          </div>

          <p className="auth-footer">
            {t('login_no_account')}{' '}
            <Link to="/register">{t('login_signup')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
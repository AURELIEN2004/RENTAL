// ============================================
// src/App.jsx - Application principale
// ============================================

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
// Pages
import Home from './pages/Home';
import Search from './pages/Search';
import HousingDetailPage from './pages/HousingDetailPage';
import Login from './pages/Login';
import Register from './pages/Register';
import About from './pages/About';
import Services from './pages/Services';
import Contact from './pages/Contact';
import Testimonials from './pages/Testimonials';
import Dashboard from './pages/Dashboard';
import HousingForm from './components/housing/HousingForm';
import VisibilityManagement from './pages/VisibilityManagement';


// Components
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';

// Styles
import './styles/global.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading-screen">Chargement...</div>;
  }

  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <div className="app">
            <Navbar />
            <main className="main-content">
              <Routes>
                {/* Routes publiques */}
                <Route path="/" element={<Home />} />
                <Route path="/search" element={<Search />} />
                <Route path="/housing/:id" element={<HousingDetailPage />} />
                <Route path="/about" element={<About />} />
                <Route path="/services" element={<Services />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/testimonials" element={<Testimonials />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                {/* <Route path="/HousingForm" element={<HousingForm />} /> */}
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />                {/* Routes protégées */}
                <Route
                  path="/dashboard/*"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route 
                      path="/HousingForm" 
                      element={
                        <ProtectedRoute>
                          <HousingForm />
                        </ProtectedRoute>
                      } 
                    />
                    
                <Route   path="/visibility"   element={ <ProtectedRoute> <VisibilityManagement />  </ProtectedRoute> } />

                {/* 404 */}
                <Route path="*" element={<div>Page non trouvée</div>} />
              </Routes>
            </main>
            <Footer />
            <ToastContainer position="top-right" autoClose={3000} />
          </div>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;

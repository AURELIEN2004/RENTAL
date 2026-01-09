// ============================================
// src/components/common/Loading.jsx
// ============================================

import React from 'react';
import './Loading.css';

const Loading = ({ message = "Chargement...", fullScreen = false }) => {
  const containerClass = fullScreen ? 'loading-container fullscreen' : 'loading-container';

  return (
    <div className={containerClass}>
      <div className="loading-content">
        <div className="spinner">
          <div className="double-bounce1"></div>
          <div className="double-bounce2"></div>
        </div>
        <p className="loading-message">{message}</p>
      </div>
    </div>
  );
};

export default Loading;

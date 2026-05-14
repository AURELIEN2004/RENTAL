// src/components/dashboard/DashboardShell.jsx
// ============================================================
// Wrapper réutilisable pour TOUS les dashboards
// Gère : sidebar fixe desktop + drawer overlay mobile (style ChatGPT)
//
// Usage :
//   <DashboardShell title="Tableau de bord" navItems={[...]} onTabChange={fn}>
//     {renderContent()}
//   </DashboardShell>
// ============================================================

import React from 'react';
import useSidebar from '../../hooks/useSidebar';
import '../../components/dashboard/DashboardLayout.css'; // ← le CSS partagé

/**
 * navItems : tableau d'objets
 *  { key: string, label: string, icon: ReactNode, active: boolean, onClick: fn }
 *
 * footerSlot : slot optionnel pour le bouton logout en bas
 */
const DashboardShell = ({ title = 'Dashboard', navItems = [], footerSlot, children }) => {
  const { isOpen, isMobile, toggle, close } = useSidebar();

  return (
    <div className="dashboard-layout">

      {/* ── Overlay (mobile) ────────────────────────────────── */}
      <div
        className={`sidebar-overlay ${isOpen ? 'overlay-visible' : ''}`}
        onClick={close}
        aria-hidden="true"
      />

      {/* ── Topbar mobile (hamburger) ────────────────────────── */}
      {isMobile && (
        <div className="mobile-topbar">
          <button
            className={`hamburger-btn ${isOpen ? 'open' : ''}`}
            onClick={toggle}
            aria-label={isOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={isOpen}
          >
            <span />
            <span />
            <span />
          </button>
          <span className="mobile-topbar-title">{title}</span>
        </div>
      )}

      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside
        className={`dashboard-sidebar ${isOpen ? 'sidebar-open' : ''}`}
        aria-label="Navigation principale"
      >
        <div className="sidebar-header">
          <h2>{title}</h2>
          {isMobile && (
            <button
              className="sidebar-close-btn"
              onClick={close}
              aria-label="Fermer la sidebar"
            >
              ✕
            </button>
          )}
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <button
              key={item.key}
              className={item.active ? 'active' : ''}
              onClick={() => {
                item.onClick();
                close(); // ferme le drawer sur mobile après sélection
              }}
              title={item.label}
            >
              {item.icon && <span className="nav-icon">{item.icon}</span>}
              {item.label}
            </button>
          ))}
        </nav>

        {/* Slot footer (ex: bouton logout) */}
        {footerSlot && (
          <div className="sidebar-footer">
            {footerSlot}
          </div>
        )}
      </aside>

      {/* ── Contenu principal ─────────────────────────────────── */}
      <main className="dashboard-main">
        {children}
      </main>

    </div>
  );
};

export default DashboardShell;
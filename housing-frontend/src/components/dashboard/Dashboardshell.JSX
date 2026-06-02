// src/components/dashboard/DashboardShell.jsx
// =================================================================
// ✅ DESKTOP : sidebar visible par défaut, bouton pour MASQUER
// ✅ MOBILE  : sidebar cachée par défaut, bouton pour AFFICHER
// ✅ Bouton flottant EN HAUT à gauche
// ✅ Toggle mode sombre / clair intégré
// ✅ 100% styles inline — zéro conflit CSS
// =================================================================

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FiSidebar } from 'react-icons/fi';
import { IoMdClose } from 'react-icons/io';
import { FiSun, FiMoon } from 'react-icons/fi';

const MOBILE_BP = 768;

// ─────────────────────────────────────────────────────────────────
// THÈMES
// -----------------------------------------------------------------
const THEMES = {
  dark: {
    sidebarBg:        '#16213e',
    sidebarBorder:    'rgba(99,102,241,0.3)',
    sidebarTitle:     '#ffffff',
    navBtnColor:      'rgba(255,255,255,0.65)',
    navBtnHoverBg:    'rgba(99,102,241,0.2)',
    navBtnHoverColor: '#ffffff',
    navBtnActiveBg:   '#6366f1',
    navBtnActiveColor:'#ffffff',
    dividerColor:     'rgba(99,102,241,0.2)',
    closeBtnColor:    'rgba(255,255,255,0.45)',
    floatBg:          '#6366f1',
    floatBorder:      '#818cf8',
    floatColor:       '#ffffff',
    floatHoverBg:     '#4f46e5',
    floatShadow:      '2px 4px 16px rgba(99,102,241,0.55)',
    mainBg:           'var(--bg-secondary, #0f172a)',
    themeBtnBg:       'rgba(255,255,255,0.07)',
    themeBtnColor:    '#fbbf24',
    themeBtnLabel:    'Mode clair',
    overlayBg:        'rgba(0,0,0,0.5)',
  },
  light: {
    sidebarBg:        '#1e1b4b',
    sidebarBorder:    'rgba(167,139,250,0.35)',
    sidebarTitle:     '#ffffff',
    navBtnColor:      'rgba(255,255,255,0.7)',
    navBtnHoverBg:    'rgba(255,255,255,0.13)',
    navBtnHoverColor: '#ffffff',
    navBtnActiveBg:   '#7c3aed',
    navBtnActiveColor:'#ffffff',
    dividerColor:     'rgba(255,255,255,0.12)',
    closeBtnColor:    'rgba(255,255,255,0.5)',
    floatBg:          '#7c3aed',
    floatBorder:      '#a78bfa',
    floatColor:       '#ffffff',
    floatHoverBg:     '#6d28d9',
    floatShadow:      '2px 4px 16px rgba(124,58,237,0.5)',
    mainBg:           'var(--bg-secondary, #f1f5f9)',
    themeBtnBg:       'rgba(255,255,255,0.1)',
    themeBtnColor:    '#c4b5fd',
    themeBtnLabel:    'Mode sombre',
    overlayBg:        'rgba(0,0,0,0.45)',
  },
};

// ─────────────────────────────────────────────────────────────────
const DashboardShell = ({
  title      = 'Dashboard',
  navItems   = [],
  footerSlot,
  children,
}) => {

  // ── Détection mobile/desktop ───────────────────────────────────
  const isMobile = () =>
    typeof window !== 'undefined' && window.innerWidth <= MOBILE_BP;

  // Sur desktop → sidebar OUVERTE par défaut
  // Sur mobile  → sidebar FERMÉE par défaut
  const [isOpen, setIsOpen] = useState(() => !isMobile());
  const [mobile, setMobile] = useState(() => isMobile());

  // Recalcule au resize
  useEffect(() => {
    const fn = () => {
      const mob = isMobile();
      setMobile(mob);
      // Quand on passe desktop→mobile : ferme
      // Quand on passe mobile→desktop : ouvre
      setIsOpen(!mob);
    };
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);

  // ── Thème ──────────────────────────────────────────────────────
  const detectTheme = () => {
    if (typeof document === 'undefined') return 'dark';
    return document.documentElement.classList.contains('light') ||
           document.documentElement.getAttribute('data-theme') === 'light' ||
           document.body.classList.contains('light')
      ? 'light' : 'dark';
  };
  const [themeKey, setThemeKey] = useState(detectTheme);
  const T = THEMES[themeKey];

  const toggleTheme = useCallback(() => {
    const next = themeKey === 'dark' ? 'light' : 'dark';
    setThemeKey(next);
    document.documentElement.classList.remove('dark', 'light');
    document.documentElement.classList.add(next);
    document.documentElement.setAttribute('data-theme', next);
    document.body.classList.remove('dark', 'light');
    document.body.classList.add(next);
  }, [themeKey]);

  const close  = useCallback(() => setIsOpen(false),   []);
  const toggle = useCallback(() => setIsOpen(v => !v), []);

  // Scroll lock uniquement sur mobile quand sidebar ouverte
  useEffect(() => {
    if (mobile && isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobile, isOpen]);

  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', fn);
    return () => document.removeEventListener('keydown', fn);
  }, [close]);

  const [hoverToggle, setHoverToggle] = useState(false);
  const [hoverClose,  setHoverClose]  = useState(false);
  const [hoverTheme,  setHoverTheme]  = useState(false);

  // ── Largeur sidebar ────────────────────────────────────────────
  const SIDEBAR_W = 260;

  // ── Sur desktop la sidebar pousse le contenu (pas overlay)
  // ── Sur mobile la sidebar est overlay au-dessus du contenu
  const isDesktop = !mobile;

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: 'calc(100vh - 70px)',
      overflow: 'hidden',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'row',   // ← ROW pour que sidebar pousse le contenu sur desktop
    }}>

      {/* ══════════════════════════════════════════════════════
          OVERLAY — uniquement sur mobile quand sidebar ouverte
          ══════════════════════════════════════════════════════ */}
      {mobile && isOpen && (
        <div
          onClick={close}
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: T.overlayBg,
            zIndex: 100,
            cursor: 'pointer',
            backdropFilter: 'blur(2px)',
          }}
        />
      )}

      {/* ══════════════════════════════════════════════════════
          SIDEBAR
          Desktop : static dans le flux (pousse le contenu)
          Mobile  : absolute (survole le contenu)
          ══════════════════════════════════════════════════════ */}
      <aside
        aria-label="Menu principal"
        style={{
          // Desktop : position dans le flux normal
          // Mobile  : position absolute pour overlay
          position: mobile ? 'absolute' : 'relative',
          top: 0,
          left: 0,
          zIndex: mobile ? 200 : 'auto',

          // Largeur : 260px si ouverte, 0 si fermée
          width: isOpen ? `${SIDEBAR_W}px` : '0px',
          minWidth: isOpen ? `${SIDEBAR_W}px` : '0px',
          height: '100%',

          backgroundColor: T.sidebarBg,
          borderRight: isOpen ? `1px solid ${T.sidebarBorder}` : 'none',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          flexShrink: 0,

          // Transition fluide
          transition: 'width 0.27s cubic-bezier(0.4,0,0.2,1), min-width 0.27s cubic-bezier(0.4,0,0.2,1)',
          boxShadow: isOpen
            ? (mobile ? '6px 0 32px rgba(0,0,0,0.45)' : '2px 0 16px rgba(0,0,0,0.2)')
            : 'none',
        }}
      >
        {/* Contenu sidebar (visible seulement si ouverte) */}
        {isOpen && (
          <>
            {/* Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '8px',
              padding: '16px 14px',
              borderBottom: `1px solid ${T.dividerColor}`,
              flexShrink: 0,
              background: 'rgba(0,0,0,0.15)',
              minWidth: `${SIDEBAR_W}px`,
            }}>
              <h2 style={{
                fontSize: '15px',
                fontWeight: 700,
                color: T.sidebarTitle,
                margin: 0,
                letterSpacing: '0.02em',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
                {title}
              </h2>
              {/* Bouton X — visible sur desktop ET mobile */}
              <button
                onClick={close}
                aria-label="Masquer le panneau"
                title="Masquer"
                onMouseEnter={() => setHoverClose(true)}
                onMouseLeave={() => setHoverClose(false)}
                style={{
                  width: '30px', height: '30px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: hoverClose ? 'rgba(255,255,255,0.1)' : 'transparent',
                  border: 'none', borderRadius: '6px', cursor: 'pointer',
                  color: hoverClose ? '#fff' : T.closeBtnColor,
                  padding: 0, flexShrink: 0,
                  transition: 'background 0.2s, color 0.2s',
                }}
              >
                <IoMdClose size={20} />
              </button>
            </div>

            {/* Navigation */}
            <nav style={{
              display: 'flex', flexDirection: 'column',
              gap: '3px', padding: '12px 8px', flex: 1,
              minWidth: `${SIDEBAR_W}px`,
            }}>
              {navItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => { item.onClick(); if (mobile) close(); }}
                  title={item.label}
                  aria-current={item.active ? 'page' : undefined}
                  onMouseEnter={e => {
                    if (!item.active) {
                      e.currentTarget.style.background = T.navBtnHoverBg;
                      e.currentTarget.style.color = T.navBtnHoverColor;
                    }
                  }}
                  onMouseLeave={e => {
                    if (!item.active) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = T.navBtnColor;
                    }
                  }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    width: '100%', padding: '10px 12px',
                    background: item.active ? T.navBtnActiveBg : 'transparent',
                    border: 'none', borderRadius: '8px',
                    color: item.active ? T.navBtnActiveColor : T.navBtnColor,
                    fontSize: '14px', fontWeight: item.active ? 600 : 400,
                    cursor: 'pointer', textAlign: 'left',
                    whiteSpace: 'nowrap', overflow: 'hidden',
                    textOverflow: 'ellipsis', lineHeight: '1.4',
                    boxSizing: 'border-box',
                    transition: 'background 0.2s, color 0.2s',
                    boxShadow: item.active
                      ? 'inset 3px 0 0 rgba(255,255,255,0.55)' : 'none',
                  }}
                >
                  {item.icon && (
                    <span style={{
                      flexShrink: 0, fontSize: '17px',
                      display: 'flex', alignItems: 'center',
                      width: '20px', height: '20px',
                      opacity: item.active ? 1 : 0.75,
                    }}>
                      {item.icon}
                    </span>
                  )}
                  {item.label}
                </button>
              ))}
            </nav>

            {/* Toggle thème */}
            <div style={{
              padding: '10px 8px',
              borderTop: `1px solid ${T.dividerColor}`,
              minWidth: `${SIDEBAR_W}px`,
            }}>
              <button
                onClick={toggleTheme}
                title={T.themeBtnLabel}
                onMouseEnter={() => setHoverTheme(true)}
                onMouseLeave={() => setHoverTheme(false)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  width: '100%', padding: '9px 12px',
                  background: hoverTheme ? 'rgba(255,255,255,0.14)' : T.themeBtnBg,
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: hoverTheme ? '#fff' : T.themeBtnColor,
                  fontSize: '13px', fontWeight: 500,
                  cursor: 'pointer', textAlign: 'left',
                  marginBottom: '4px',
                  transition: 'background 0.2s, color 0.2s',
                }}
              >
                {themeKey === 'dark'
                  ? <FiSun size={16} style={{ flexShrink: 0 }} />
                  : <FiMoon size={16} style={{ flexShrink: 0 }} />
                }
                {T.themeBtnLabel}
              </button>
            </div>

            {/* Footer (logout) */}
            {footerSlot && (
              <div style={{ padding: '8px 8px 12px', flexShrink: 0, minWidth: `${SIDEBAR_W}px` }}>
                {footerSlot}
              </div>
            )}
          </>
        )}
      </aside>

      {/* ══════════════════════════════════════════════════════
          ZONE DROITE = bouton flottant + contenu
          ══════════════════════════════════════════════════════ */}
      <div style={{
        position: 'relative',
        flex: 1,
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>

        {/* ── Bouton flottant EN HAUT à gauche du contenu ─── */}
        <button
          onClick={toggle}
          onMouseEnter={() => setHoverToggle(true)}
          onMouseLeave={() => setHoverToggle(false)}
          aria-label={isOpen ? 'Masquer le panneau' : 'Afficher le panneau'}
          aria-expanded={isOpen}
          title={isOpen ? 'Masquer le panneau' : 'Afficher le panneau'}
          style={{
            position: 'absolute',
            top: '14px',
            left: 0,
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: hoverToggle ? '32px' : '26px',
            height: '42px',
            backgroundColor: hoverToggle ? T.floatHoverBg : T.floatBg,
            border: `1px solid ${T.floatBorder}`,
            borderLeft: 'none',
            borderRadius: '0 10px 10px 0',
            cursor: 'pointer',
            color: T.floatColor,
            padding: 0,
            boxShadow: hoverToggle
              ? T.floatShadow
              : '2px 2px 10px rgba(0,0,0,0.25)',
            transition: 'width 0.2s, background 0.2s, box-shadow 0.2s',
          }}
        >
          {isOpen
            ? <IoMdClose size={14} />
            : <FiSidebar size={14} />
          }
        </button>

        {/* ── Contenu principal ─────────────────────────────── */}
        <main
          id="ds-main-content"
          style={{
            flex: 1,
            width: '100%',
            height: '100%',
            minWidth: 0,
            overflowY: 'auto',
            overflowX: 'hidden',
            boxSizing: 'border-box',
            padding: '24px 28px',
            backgroundColor: T.mainBg,
          }}
        >
          {children}
        </main>

      </div>
    </div>
  );
};

export default DashboardShell;
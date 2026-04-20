'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { GAMES, getGameBySlug } from '@/lib/games';

interface Settings {
  promoCode: string;
  siteName: string;
}

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settings, setSettings] = useState<Settings>({ promoCode: 'DVYS', siteName: 'DVYS Predictions' });
  const [enabledGames, setEnabledGames] = useState<string[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(data => {
        if (data?.promoCode) setSettings(prev => ({ ...prev, promoCode: data.promoCode }));
        if (data?.siteName) setSettings(prev => ({ ...prev, siteName: data.siteName }));
      })
      .catch(() => {});

    fetch('/api/settings')
      .then(r => r.json())
      .then(data => {
        if (data?.enabledGames) setEnabledGames(data.enabledGames);
      })
      .catch(() => {});
  }, []);

  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  const handleCardTilt = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -5;
    const rotateY = ((x - centerX) / centerX) * 5;
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
    card.style.setProperty('--mouse-x', `${(x / rect.width) * 100}%`);
    card.style.setProperty('--mouse-y', `${(y / rect.height) * 100}%`);
  }, []);

  const handleCardReset = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.transform = '';
  }, []);

  const visibleGames = enabledGames.length > 0
    ? GAMES.filter(g => enabledGames.includes(g.slug))
    : GAMES;

  return (
    <>
      {/* Loading Screen */}
      <div className={`loading-screen ${!loading ? 'hidden' : ''}`}>
        <div className="loader-ring" />
        <div className="loader-text">DVYS</div>
      </div>

      {/* App Container */}
      <div className="app-container">
        {/* Animated Background */}
        <div className="bg-mesh">
          <div className="floating-orb" />
          <div className="floating-orb" />
          <div className="floating-orb" />
          <div className="floating-orb" />
        </div>

        {/* Hero Section */}
        <div className="hero-section" style={{ opacity: loading ? 0 : 1, transition: 'opacity 0.5s ease 0.3s' }}>
          <div className="avatar-circle">
            {settings.promoCode.charAt(0)}
          </div>
          <div className="hero-info">
            <div className="brand-name">{settings.siteName.toUpperCase()}</div>
            <div className="hero-status">
              <span className="live-dot" />
              <span>En ligne</span>
            </div>
          </div>
          <button className="hamburger-btn" onClick={() => setSidebarOpen(true)} aria-label="Menu">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>

        {/* Stats Bar */}
        <div className="stats-bar" style={{ opacity: loading ? 0 : 1, transition: 'opacity 0.5s ease 0.4s' }}>
          <div className="stat-chip">
            <span className="dot" />
            {visibleGames.length} Jeux
          </div>
          <div className="stat-chip">
            <span className="dot dot-amber" />
            Actif
          </div>
          <div className="stat-chip">
            v2.0
          </div>
        </div>

        {/* Section Heading */}
        <div className="section-heading" style={{ opacity: loading ? 0 : 1, transition: 'opacity 0.5s ease 0.5s' }}>
          <h2>Jeux Disponibles</h2>
          <div className="line" />
        </div>

        {/* Game Grid */}
        <div className="game-grid" style={{ opacity: loading ? 0 : 1, transition: 'opacity 0.5s ease 0.5s' }}>
          {visibleGames.map((game, idx) => (
            <a
              key={game.slug}
              href={`/jeu/${game.slug}`}
              className="game-card slide-up"
              style={{ animationDelay: `${0.6 + idx * 0.1}s` }}
              onMouseMove={handleCardTilt}
              onMouseLeave={handleCardReset}
            >
              <span className={`badge ${game.badge === 'NEW' ? 'badge-new' : 'badge-hot'}`}>
                {game.badge}
              </span>
              <div className="game-icon game-icon-gradient" style={{ background: game.theme.cardBg, borderColor: game.theme.border }}>
                <span>{game.iconEmoji}</span>
              </div>
              <div className="game-name">{game.name}</div>
              <div className="game-desc">{game.description}</div>
              <button className="open-btn" style={{ background: `linear-gradient(135deg, ${game.theme.accent}, ${game.theme.accentDark})`, boxShadow: `0 4px 15px ${game.theme.accent}40` }}>
                OUVRIR
              </button>
            </a>
          ))}
        </div>

        {/* Promo Banner */}
        <div className="promo-banner" style={{ opacity: loading ? 0 : 1, transition: 'opacity 0.5s ease 0.8s' }}>
          <div className="promo-content">
            <div className="promo-label">Code Promo</div>
            <div className="promo-code">{settings.promoCode}</div>
          </div>
        </div>

        {/* Bottom spacer */}
        <div style={{ height: 40 }} />
      </div>

      {/* Sidebar Overlay */}
      <div className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`} onClick={closeSidebar} />

      {/* Sidebar */}
      <nav className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">{settings.siteName}</div>
          <button className="sidebar-close" onClick={closeSidebar} aria-label="Fermer">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="sidebar-nav">
          <a href="/" className="sidebar-link" onClick={closeSidebar}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            Accueil
          </a>
          {GAMES.map(game => (
            <a key={game.slug} href={`/jeu/${game.slug}`} className="sidebar-link" onClick={closeSidebar}>
              <span style={{ fontSize: 20 }}>{game.iconEmoji}</span>
              {game.name}
            </a>
          ))}
          <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '8px 0' }} />
          <a href="/admin" className="sidebar-link" onClick={closeSidebar}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
            </svg>
            Administration
          </a>
        </div>
        <div className="sidebar-footer">
          {settings.siteName} &copy; {new Date().getFullYear()}
        </div>
      </nav>
    </>
  );
}

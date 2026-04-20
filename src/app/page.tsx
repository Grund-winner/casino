'use client';

import { useState, useEffect, useRef } from 'react';

interface GameCard {
  slug: string;
  name: string;
  bannerUrl: string;
  description: string;
  color: string;
}

const GAMES: GameCard[] = [
  { slug: 'luckyjet', name: 'Lucky Jet', bannerUrl: '/banners/luckyjet.png', description: 'Prediction de crash', color: '#7c3aed' },
  { slug: 'tropicana', name: 'Tropicana', bannerUrl: '/banners/tropicana.png', description: 'Ocean tropical', color: '#0ea5e9' },
  { slug: 'rocketx', name: 'Rocket X', bannerUrl: '/banners/rocketx.png', description: 'Vers les etoiles', color: '#1e40af' },
  { slug: 'rocketqueen', name: 'Rocket Queen', bannerUrl: '/banners/rocketqueen.png', description: 'La reine des fusees', color: '#e11d48' },
  { slug: 'jobfox', name: 'JobFox', bannerUrl: '/banners/jobfox.png', description: 'Grille intelligente', color: '#16a34a' },
];

export default function Home() {
  const [loaded, setLoaded] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [siteName, setSiteName] = useState('DVYS');
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeBanner, setActiveBanner] = useState(0);
  const bannerTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchStartX = useRef(0);

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(data => {
        if (data.promoCode) setPromoCode(data.promoCode);
        if (data.siteName) setSiteName(data.siteName);
      })
      .catch(() => {});

    const timer = setTimeout(() => setLoaded(true), 300);
    return () => clearTimeout(timer);
  }, []);

  // Auto-rotate banners
  useEffect(() => {
    bannerTimerRef.current = setInterval(() => {
      setActiveBanner(prev => (prev + 1) % GAMES.length);
    }, 5000);
    return () => { if (bannerTimerRef.current) clearInterval(bannerTimerRef.current); };
  }, []);

  const goToBanner = (idx: number) => {
    setActiveBanner(idx);
    if (bannerTimerRef.current) clearInterval(bannerTimerRef.current);
    bannerTimerRef.current = setInterval(() => {
      setActiveBanner(prev => (prev + 1) % GAMES.length);
    }, 5000);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goToBanner((activeBanner + 1) % GAMES.length);
      else goToBanner((activeBanner - 1 + GAMES.length) % GAMES.length);
    }
  };

  return (
    <div className={`app${loaded ? ' ready' : ''}`}>
      {/* Header */}
      <header className="app-header">
        <div className="app-logo">
          <span className="logo-name">{siteName}</span>
          <span className="logo-tag">Predictions</span>
        </div>
        <button className="menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
          <span className={`menu-line${menuOpen ? ' open' : ''}`} />
          <span className={`menu-line${menuOpen ? ' open' : ''}`} />
          <span className={`menu-line${menuOpen ? ' open' : ''}`} />
        </button>
      </header>

      {/* Dropdown menu */}
      <div className={`dropdown-overlay${menuOpen ? ' visible' : ''}`} onClick={() => setMenuOpen(false)} />
      <nav className={`dropdown-menu${menuOpen ? ' open' : ''}`}>
        <a href="/" className="dd-item active" onClick={() => setMenuOpen(false)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          Accueil
        </a>
        {GAMES.map(g => (
          <a key={g.slug} href={`/jeu/${g.slug}`} className="dd-item" onClick={() => setMenuOpen(false)}>
            <div className="dd-dot" style={{ background: g.color }} />
            {g.name}
          </a>
        ))}
        <div className="dd-divider" />
        <a href="/admin" className="dd-item" onClick={() => setMenuOpen(false)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
          Administration
        </a>
      </nav>

      {/* Promo */}
      {promoCode && (
        <div className="promo-strip" style={{ opacity: loaded ? 1 : 0 }}>
          <span className="promo-label">Code Promo</span>
          <span className="promo-value">{promoCode}</span>
          <button
            className="promo-copy"
            onClick={() => navigator.clipboard.writeText(promoCode)}
          >
            Copier
          </button>
        </div>
      )}

      {/* Hero Banner Carousel */}
      <section className="hero-section" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        <div className="hero-track">
          {GAMES.map((game, i) => (
            <a
              key={game.slug}
              href={`/jeu/${game.slug}`}
              className={`hero-slide${i === activeBanner ? ' active' : ''}`}
              style={{ '--game-color': game.color } as React.CSSProperties}
            >
              <div className="hero-img-wrap">
                <img src={game.bannerUrl} alt={game.name} className="hero-img" />
                <div className="hero-gradient" />
              </div>
              <div className="hero-content">
                <span className="hero-badge">{game.description}</span>
                <h2 className="hero-title">{game.name}</h2>
                <div className="hero-cta">
                  <span>Jouer</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* Dots */}
        <div className="hero-dots">
          {GAMES.map((_, i) => (
            <button
              key={i}
              className={`hero-dot${i === activeBanner ? ' active' : ''}`}
              onClick={(e) => { e.stopPropagation(); goToBanner(i); }}
            />
          ))}
        </div>

        {/* Arrows */}
        <button className="hero-arrow hero-arrow-left" onClick={() => goToBanner((activeBanner - 1 + GAMES.length) % GAMES.length)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <button className="hero-arrow hero-arrow-right" onClick={() => goToBanner((activeBanner + 1) % GAMES.length)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
        </button>
      </section>

      {/* Games Grid - Album style */}
      <section className="games-section">
        <div className="section-head">
          <h2 className="section-title">Tous les jeux</h2>
          <span className="section-count">{GAMES.length} disponibles</span>
        </div>
        <div className="games-grid">
          {GAMES.map((game, i) => (
            <a
              key={game.slug}
              href={`/jeu/${game.slug}`}
              className="game-tile"
              style={{
                animationDelay: `${i * 0.08}s`,
                '--tile-color': game.color,
              } as React.CSSProperties}
            >
              <div className="tile-img-wrap">
                <img src={game.bannerUrl} alt={game.name} className="tile-img" />
                <div className="tile-overlay">
                  <div className="tile-play">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
                  </div>
                </div>
              </div>
              <div className="tile-info">
                <h3 className="tile-name">{game.name}</h3>
                <p className="tile-desc">{game.description}</p>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="features-section">
        <div className="section-head">
          <h2 className="section-title">DVYS Intelligence</h2>
        </div>
        <div className="features-grid">
          {[
            { icon: '01', label: 'Analyse', desc: '8 modules de prediction' },
            { icon: '02', label: 'Precision', desc: 'Algorithmes avances' },
            { icon: '03', label: 'Temps reel', desc: 'Donnees en direct' },
          ].map((f, i) => (
            <div key={i} className="feature-card" style={{ animationDelay: `${i * 0.1}s` }}>
              <span className="feature-num">{f.icon}</span>
              <div>
                <h4 className="feature-label">{f.label}</h4>
                <p className="feature-desc">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="app-footer">
        <span className="footer-text">{siteName} Predictions v2.0</span>
      </footer>
    </div>
  );
}

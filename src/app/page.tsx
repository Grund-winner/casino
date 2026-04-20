'use client';

import { useState, useEffect, useRef } from 'react';

interface GameCard {
  slug: string;
  name: string;
  iconUrl: string;
  description: string;
  badge?: string;
}

const GAMES: GameCard[] = [
  { slug: 'luckyjet', name: 'Lucky Jet', iconUrl: '/icons/lucky.avif', description: 'Prediction de crash', badge: 'HOT' },
  { slug: 'tropicana', name: 'Tropicana', iconUrl: '/icons/tropicana.avif', description: 'Ocean tropical', badge: 'HOT' },
  { slug: 'rocketx', name: 'Rocket X', iconUrl: '/icons/rocktx.avif', description: 'Vers les etoiles', badge: 'HOT' },
  { slug: 'rocketqueen', name: 'Rocket Queen', iconUrl: '/icons/rocky.avif', description: 'La reine des fusees', badge: 'NEW' },
  { slug: 'jobfox', name: 'JobFox', iconUrl: '/icons/fox.avif', description: 'Grille intelligente', badge: 'NEW' },
];

export default function Home() {
  const [loaded, setLoaded] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [siteName, setSiteName] = useState('DVYS');
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    // Fetch public settings
    fetch('/api/settings')
      .then(r => r.json())
      .then(data => {
        if (data.promoCode) setPromoCode(data.promoCode);
        if (data.siteName) setSiteName(data.siteName);
      })
      .catch(() => {});

    setTimeout(() => setLoaded(true), 600);
  }, []);

  useEffect(() => {
    checkScroll();
  }, [loaded]);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 5);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 5);
  };

  const scrollBy = (dir: number) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 280, behavior: 'smooth' });
    setTimeout(checkScroll, 350);
  };

  return (
    <div className={`home${loaded ? ' loaded' : ''}`}>
      {/* Background gradient */}
      <div className="home-bg" />

      {/* Header */}
      <header className="home-header">
        <div className="header-logo">
          <span className="logo-text">{siteName}</span>
          <span className="logo-sub">AI Predictions</span>
        </div>
        <div className="header-dots">
          <span className="dot active" />
          <span className="dot" />
          <span className="dot" />
        </div>
      </header>

      {/* Promo banner */}
      {promoCode && (
        <div className="promo-banner">
          <div className="promo-label">Code promo</div>
          <div className="promo-code">{promoCode}</div>
          <button
            className="promo-copy"
            onClick={() => {
              navigator.clipboard.writeText(promoCode);
            }}
          >
            Copier
          </button>
        </div>
      )}

      {/* Game carousel */}
      <section className="games-section">
        <div className="section-header">
          <h2 className="section-title">Jeux disponibles</h2>
          <span className="section-count">{GAMES.length} jeux</span>
        </div>

        <div className="carousel-wrapper">
          <button
            className={`carousel-arrow left${canScrollLeft ? '' : ' hidden'}`}
            onClick={() => scrollBy(-1)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>

          <div className="carousel-track" ref={scrollRef} onScroll={checkScroll}>
            {GAMES.map((game, i) => (
              <a
                key={game.slug}
                href={`/jeu/${game.slug}`}
                className="game-card"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="card-image-wrap">
                  <img src={game.iconUrl} alt={game.name} className="card-image" />
                  <div className="card-overlay" />
                </div>
                <div className="card-info">
                  <h3 className="card-name">{game.name}</h3>
                  <p className="card-desc">{game.description}</p>
                  <div className="card-footer">
                    <span className="card-badge">{game.badge}</span>
                    <span className="card-arrow">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>

          <button
            className={`carousel-arrow right${canScrollRight ? '' : ' hidden'}`}
            onClick={() => scrollBy(1)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </div>
      </section>

      {/* Bottom modules info */}
      <section className="modules-section">
        <div className="modules-title">L&apos;intelligence DVYS en action</div>
        <div className="modules-grid">
          {['Tendance', 'Series', 'Volatilite', 'Patterns', 'Markov', 'Mean Rev.', 'Cycles', 'Momentum'].map(m => (
            <span key={m} className="module-chip">{m}</span>
          ))}
        </div>
      </section>

      {/* Admin link */}
      <footer className="home-footer">
        <a href="/admin" className="admin-link">Administration</a>
        <span className="footer-version">v2.0</span>
      </footer>
    </div>
  );
}

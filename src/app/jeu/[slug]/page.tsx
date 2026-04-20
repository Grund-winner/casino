'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { use } from 'react';

interface PredictionResult {
  prediction: number;
  confidence: number;
  signals: string[];
  signalTypes: string[];
  category: string;
  rounds: number;
  avg: number;
  std: number;
  accuracy: number | null;
  lastResults?: number[];
  error?: string;
}

interface GameState {
  status: string;
  lastCoef?: number;
  waiting?: boolean;
  timer?: number;
}

export default function GamePage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  const [promoCode, setPromoCode] = useState('DVYS');
  const [gameName, setGameName] = useState(slug);
  const [theme, setTheme] = useState({
    accent: '#7100ff',
    accentLight: '#b388ff',
    accentDark: '#4a00b3',
    border: 'rgba(113,0,255,.25)',
    cardBg: 'linear-gradient(135deg, rgba(113,0,255,.08) 0%, rgba(60,20,120,.06) 100%)',
    promoAccent: '#b388ff',
    bg: '#0a0618',
    bgGradient: 'linear-gradient(135deg, #0a0618 0%, #1a0a2e 50%, #0a0618 100%)',
  });

  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [gameState, setGameState] = useState<GameState>({ status: 'init' });
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);
  const [authStatus, setAuthStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [isPolling] = useState(true);
  const [lastRoundCoef, setLastRoundCoef] = useState<number | null>(null);

  const getInitialMemory = (): { cat: string | null; count: number } => {
    if (typeof window === 'undefined') return { cat: null, count: 0 };
    try {
      const saved = localStorage.getItem(`dvys_${slug}_memory`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.cat !== undefined && parsed.count !== undefined) return parsed;
      }
    } catch {}
    return { cat: null, count: 0 };
  };

  const getInitialAccuracy = (): number | null => {
    if (typeof window === 'undefined') return null;
    try {
      const saved = localStorage.getItem(`dvys_${slug}_memory`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.accuracy === 'number') return parsed.accuracy;
      }
    } catch {}
    return null;
  };

  const [memory, setMemory] = useState(getInitialMemory);
  const [accuracy, setAccuracy] = useState(getInitialAccuracy);

  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const predictCalledRef = useRef(false);
  const lastStateRef = useRef<string>('');
  const lastCoefRef = useRef<number | undefined>(undefined);
  const memoryKey = `dvys_${slug}_memory`;
  const pollStateRef = useRef<() => void>(() => {});

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(data => {
        if (data?.promoCode) setPromoCode(data.promoCode);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch(`/api/game/${slug}/auth`, { method: 'POST' })
      .then(r => r.json())
      .then(data => {
        if (data.success && data.iframeUrl) {
          setIframeUrl(data.iframeUrl);
          setAuthStatus('ready');
        } else {
          setAuthStatus('error');
        }
      })
      .catch(() => setAuthStatus('error'));
  }, [slug]);

  const updateMemory = useCallback((newMemory: { cat: string | null; count: number }, newAccuracy?: number | null) => {
    setMemory(newMemory);
    if (typeof window !== 'undefined') {
      try {
        const toStore = { ...newMemory };
        if (newAccuracy !== undefined) toStore.accuracy = newAccuracy;
        localStorage.setItem(memoryKey, JSON.stringify(toStore));
      } catch {}
    }
  }, [memoryKey]);

  const fetchPrediction = useCallback(async () => {
    try {
      const res = await fetch(`/api/game/${slug}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memory, accuracy }),
      });
      const data = await res.json();
      if (!data.error) {
        setPrediction(data);

        const newCoef = data.lastResults && data.lastResults.length > 0
          ? data.lastResults[data.lastResults.length - 1]
          : undefined;

        if (newCoef !== undefined) {
          const cat = newCoef < 2 ? 'low' : newCoef < 10 ? 'mid' : 'high';
          if (cat === lastCoefRef.current) {
            const newCount = memory.count + 1;
            const updatedMemory = { cat, count: newCount };
            updateMemory(updatedMemory, data.accuracy);
          } else {
            const updatedMemory = { cat, count: 1 };
            updateMemory(updatedMemory, data.accuracy);
          }
          lastCoefRef.current = cat;
          setLastRoundCoef(newCoef);
        }
      }
    } catch {}
  }, [slug, memory, accuracy, updateMemory]);

  useEffect(() => {
    const pollState = async () => {
      if (!isPolling) return;

      try {
        const res = await fetch(`/api/game/${slug}/state`);
        const data = await res.json();

        if (data.error) {
          setGameState({ status: 'error' });
          pollRef.current = setTimeout(pollState, 5000);
          return;
        }

        const currentStatus = JSON.stringify(data);
        const stateChanged = currentStatus !== lastStateRef.current;
        lastStateRef.current = currentStatus;

        const waiting = data.waiting === true || data.status === 'waiting';
        const gameActive = data.status === 'playing' || data.status === 'active' || !waiting;

        setGameState({
          status: gameActive ? 'active' : 'waiting',
          lastCoef: data.lastCoef ?? data.coef ?? data.multiplier,
          waiting,
          timer: data.timer,
        });

        if (waiting && stateChanged && !predictCalledRef.current) {
          predictCalledRef.current = true;
          await fetchPrediction();
        }

        if (gameActive && stateChanged) {
          predictCalledRef.current = false;
          setPrediction(null);
        }
      } catch {
        setGameState({ status: 'error' });
      }

      pollRef.current = setTimeout(pollState, 3000);
    };

    pollStateRef.current = pollState;
    pollState();
  }, [slug, isPolling, fetchPrediction]);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearTimeout(pollRef.current);
    };
  }, []);

  const signalLabel = (s: string): string => {
    const map: Record<string, string> = {
      tendances_low: 'Tendance Basse',
      tendances_mid: 'Tendance Moyenne',
      tendances_high: 'Tendance Haute',
      rotation_securite: 'Rotation Securite',
      transition_bas_vers_mid: 'Transition Mid',
      donnees_insuffisantes: 'Donnees insuffisantes',
    };
    if (s.startsWith('serie_')) return `Serie ${s.replace('serie_', '').replace(/_/g, ' ')}`;
    if (s.startsWith('memoire_')) return `${s.replace('memoire_', '').replace('_', ' ')} tours`;
    if (s.startsWith('precision_')) return `Precision ${s.replace('precision_', '')}`;
    return map[s] || s;
  };

  return (
    <div
      className="game-page-container"
      style={{
        background: theme.bg,
      }}
    >
      {/* Background Orbs */}
      <div className="game-page-bg">
        <div className="bg-orb" style={{ width: 300, height: 300, background: `radial-gradient(circle, ${theme.accent}44, transparent 70%)`, top: -80, left: -60 }} />
        <div className="bg-orb" style={{ width: 250, height: 250, background: `radial-gradient(circle, ${theme.accentLight}33, transparent 70%)`, bottom: 100, right: -80, animationDelay: '-7s' }} />
      </div>

      {/* Top Bar */}
      <div className="game-top-bar">
        <a href="/" className="top-btn" aria-label="Retour">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </a>
        <div className="top-logo">{promoCode}</div>
        <div className="top-status">
          <span className="live-dot" />
          <span>Live</span>
        </div>
      </div>

      {/* Game Content */}
      <div className="game-iframe-wrapper">
        {authStatus === 'loading' && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: 16 }}>
            <div className="loader-ring" />
            <div className="loader-text">Connexion...</div>
          </div>
        )}
        {authStatus === 'error' && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: 40, opacity: 0.5 }}>⚠️</div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>Erreur de connexion au jeu</div>
          </div>
        )}
        {authStatus === 'ready' && iframeUrl && (
          <iframe
            src={iframeUrl}
            allow="fullscreen"
            allowFullScreen
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
            style={{
              borderTop: `2px solid ${theme.accent}33`,
            }}
          />
        )}
      </div>

      {/* Bottom Prediction Panel */}
      <div className="game-bottom-panel">
        {/* Status Bar */}
        <div className="status-bar">
          <span className={`status-dot ${gameState.status === 'active' ? 'green' : gameState.status === 'waiting' ? 'yellow' : 'red'}`} />
          <span>
            {gameState.status === 'active' ? 'En jeu' : gameState.status === 'waiting' ? 'En attente...' : 'Connexion...'}
          </span>
          {gameState.timer && gameState.timer > 0 && (
            <span style={{ marginLeft: 'auto', fontFamily: 'monospace', fontSize: 12, color: theme.accentLight }}>
              {gameState.timer}s
            </span>
          )}
          {lastRoundCoef !== null && (
            <span style={{ marginLeft: 'auto', fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
              Dernier: {lastRoundCoef.toFixed(2)}x
            </span>
          )}
        </div>

        {/* Prediction Card */}
        {prediction && (
          <div
            className="prediction-card prediction-themed"
            style={{
              '--theme-accent': theme.accentLight,
              '--theme-border': theme.border,
              '--theme-card-bg': theme.cardBg,
              '--theme-promo': theme.promoAccent,
            } as React.CSSProperties}
          >
            <div className="prediction-header">
              <span className="prediction-label">Prediction</span>
              <span className="prediction-confidence" style={{
                background: `${prediction.confidence >= 60 ? 'rgba(0,255,136,0.1)' : prediction.confidence >= 40 ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)'}`,
                color: prediction.confidence >= 60 ? '#00ff88' : prediction.confidence >= 40 ? '#f59e0b' : '#ef4444',
                borderColor: `${prediction.confidence >= 60 ? 'rgba(0,255,136,0.2)' : prediction.confidence >= 40 ? 'rgba(245,158,11,0.2)' : 'rgba(239,68,68,0.2)'}`,
              }}>
                {prediction.confidence}%
              </span>
            </div>

            <div className="prediction-value" style={{ color: theme.accentLight }}>
              {prediction.prediction.toFixed(2)}x
            </div>

            <div style={{ display: 'flex', gap: 12, fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
              <span>Tours: {prediction.rounds}</span>
              <span>Moy: {prediction.avg}x</span>
              <span>σ: {prediction.std}</span>
            </div>

            <div className="signals-container">
              {prediction.signals.map((signal, i) => (
                <span
                  key={signal}
                  className={`signal-tag ${prediction.signalTypes[i] === 'up' ? 'signal-up' : prediction.signalTypes[i] === 'down' ? 'signal-down' : 'signal-info'}`}
                >
                  {signalLabel(signal)}
                </span>
              ))}
            </div>
          </div>
        )}

        {!prediction && gameState.status !== 'init' && (
          <div className="prediction-card" style={{ textAlign: 'center', padding: '20px 16px' }}>
            <div className="loader-ring" style={{ width: 32, height: 32, borderWidth: 2, margin: '0 auto 12px' }} />
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Analyse en cours...</div>
          </div>
        )}

        {/* Promo */}
        <div className="game-promo" style={{ borderColor: `${theme.accent}20` }}>
          <div className="game-promo-label">Code Promo</div>
          <div className="game-promo-code" style={{ color: theme.promoAccent }}>
            {promoCode}
          </div>
        </div>
      </div>
    </div>
  );
}

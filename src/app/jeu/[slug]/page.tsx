'use client';

import { useRef, useState, useEffect, useCallback, use } from 'react';
import { getGameBySlug } from '@/lib/games';

/* ================================================================
   Types
   ================================================================ */
interface PredictionData {
  prediction: number;
  confidence: number;
  signals: string[];
  signalTypes: string[];
  category: string;
  last_rounds: number[];
  total_rounds: number;
  avg: number;
  std_dev: number;
  accuracy: number | null;
}

interface PredictionRecord {
  predicted: number;
  confidence: number;
  category: string;
  timestamp: number;
  validated?: boolean;
  actual?: number;
  hit?: boolean;
}

interface MemoryData {
  history: number[];
  predictions: PredictionRecord[];
  hits: number;
  total: number;
}

/* ================================================================
   Constants
   ================================================================ */
const POLL_MS = 800;

/* ================================================================
   LocalStorage helpers
   ================================================================ */
function loadMemory(memKey: string): MemoryData {
  try {
    if (typeof window === 'undefined') return { history: [], predictions: [], hits: 0, total: 0 };
    const raw = localStorage.getItem(memKey);
    if (!raw) return { history: [], predictions: [], hits: 0, total: 0 };
    const m = JSON.parse(raw);
    if (!m || !Array.isArray(m.history)) return { history: [], predictions: [], hits: 0, total: 0 };
    return m;
  } catch {
    return { history: [], predictions: [], hits: 0, total: 0 };
  }
}

function saveMemory(memKey: string, mem: MemoryData) {
  try {
    if (typeof window === 'undefined') return;
    localStorage.setItem(memKey, JSON.stringify(mem));
  } catch {
    // silently fail
  }
}

function recordPrediction(memKey: string, predicted: number, confidence: number, category: string) {
  const mem = loadMemory(memKey);
  mem.predictions.push({ predicted, confidence, category, timestamp: Date.now() });
  if (mem.predictions.length > 200) mem.predictions = mem.predictions.slice(-200);
  saveMemory(memKey, mem);
}

function validateLastPrediction(memKey: string, actual: number) {
  const mem = loadMemory(memKey);
  const preds = mem.predictions;
  if (!preds.length) return;
  const last = preds[preds.length - 1];
  if (last.validated) return;
  const actualCat = actual < 2 ? 'low' : actual < 10 ? 'mid' : 'high';
  const hit = last.category === actualCat;
  last.validated = true;
  last.actual = actual;
  last.hit = hit;
  mem.total = (mem.total || 0) + 1;
  if (hit) mem.hits = (mem.hits || 0) + 1;
  saveMemory(memKey, mem);
}

function getAccuracy(memKey: string): number | null {
  const mem = loadMemory(memKey);
  if (!mem.total || mem.total < 3) return null;
  return Math.round((mem.hits / mem.total) * 100);
}

function clearOldPredictions(memKey: string) {
  const mem = loadMemory(memKey);
  const cutoff = Date.now() - 3600000;
  mem.predictions = mem.predictions.filter(p => p.timestamp > cutoff);
  saveMemory(memKey, mem);
}

/* ================================================================
   State detection helpers
   ================================================================ */
function walkDeep(o: unknown, fn: (obj: Record<string, unknown>) => void) {
  const stack: unknown[] = [o];
  while (stack.length) {
    const x = stack.pop();
    if (x && typeof x === 'object') {
      fn(x as Record<string, unknown>);
      for (const k in x) {
        if (Object.prototype.hasOwnProperty.call(x, k)) {
          stack.push((x as Record<string, unknown>)[k]);
        }
      }
    }
  }
}

function detectState(d: unknown): string {
  let cs: string | null = null;
  let cb: boolean | null = null;
  let cn: number | null = null;
  walkDeep(d, obj => {
    for (const k in obj) {
      const key = k.toLowerCase();
      const val = obj[k];
      if (/(state|status|phase|mode)$/.test(key)) {
        if (typeof val === 'string' && !cs) cs = val.toLowerCase();
        if (typeof val === 'boolean' && cb === null) cb = val;
        if (typeof val === 'number' && cn === null) cn = val;
      }
      if (/(running|in_game|ingame|live)$/.test(key) && typeof val === 'boolean' && cb === null) {
        cb = val;
      }
    }
  });
  if (cb === true) return 'running';
  if (cb === false) return 'waiting';
  if (cs) {
    if ('running started start flying play playing live in_game'.indexOf(cs) !== -1) return 'running';
    if ('crashed crash ended end finished finish dead'.indexOf(cs) !== -1) return 'ended';
    if ('waiting wait starting betting idle prepare preparing ready countdown'.indexOf(cs) !== -1) return 'waiting';
  }
  if (cn === 1) return 'running';
  if (cn === 2) return 'ended';
  if (cn === 0) return 'waiting';
  return 'unknown';
}

function extractRoundId(d: unknown): string | null {
  let id: string | null = null;
  walkDeep(d, obj => {
    if (id) return;
    if (obj.round_id != null) id = String(obj.round_id);
    else if (obj.roundId != null) id = String(obj.roundId);
    else if (obj.id != null && typeof obj.id === 'string' && obj.id.indexOf('-') !== -1) id = obj.id;
  });
  return id;
}

/* ================================================================
   Component
   ================================================================ */
export default function GamePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const game = getGameBySlug(slug);

  // Refs
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastStateRef = useRef<string | null>(null);
  const currentRoundIdRef = useRef<string | null>(null);
  const predictedForRoundIdRef = useRef<string | null>(null);
  const pollingActiveRef = useRef(false);
  const isAuthenticatedRef = useRef(false);

  // State for UI
  const [liveDotClass, setLiveDotClass] = useState('warn');
  const [headerStatus, setHeaderStatus] = useState('Connexion...');
  const [roundNum, setRoundNum] = useState('#0');
  const [predVal, setPredVal] = useState('Chargement...');
  const [predValColor, setPredValColor] = useState('');
  const [predValShadow, setPredValShadow] = useState('');
  const [predLoading, setPredLoading] = useState(true);
  const [predConf, setPredConf] = useState('--%');
  const [dataInfo, setDataInfo] = useState('');
  const [signals, setSignals] = useState<Array<{ text: string; type: string }>>([]);
  const [toastMsg, setToastMsg] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [iframeUrl, setIframeUrl] = useState('');

  const memKey = game?.memKey || `dvys_${slug}_memory`;
  const theme = game?.theme;

  // Build CSS custom properties from theme
  const themeStyle: React.CSSProperties = {};
  if (theme) {
    for (const [key, value] of Object.entries(theme)) {
      if (key.startsWith('--')) {
        (themeStyle as Record<string, string>)[key] = value;
      }
    }
  }

  // --- Toast ---
  const showToast = useCallback((msg: string, ms = 3000) => {
    setToastMsg(msg);
    setToastVisible(true);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => {
      setToastVisible(false);
    }, ms);
  }, []);

  // --- Display prediction ---
  const displayPrediction = useCallback((data: PredictionData) => {
    const pred = parseFloat(String(data.prediction));
    if (isNaN(pred) || pred <= 0) {
      setPredVal('Erreur');
      setPredValColor('#ff4444');
      setPredValShadow('');
      setPredLoading(false);
      return;
    }

    setPredVal(pred.toFixed(2) + 'x');
    setPredLoading(false);

    if (pred >= 10.0) {
      setPredValColor(theme?.predHighColor || '#ff9800');
      setPredValShadow(theme?.predHighShadow || '');
    } else if (pred >= 2.0) {
      setPredValColor(theme?.predMidColor || '#b388ff');
      setPredValShadow(theme?.predMidShadow || '');
    } else {
      setPredValColor(theme?.predLowColor || '#64b5f6');
      setPredValShadow(theme?.predLowShadow || '');
    }

    setPredConf((data.confidence || 0) + '%');

    if (data.total_rounds) {
      setRoundNum('#' + data.total_rounds);
      setDataInfo('\u00b7 ' + data.total_rounds + ' tours');
    }

    if (data.signals && data.signals.length) {
      const types = data.signalTypes || [];
      const sigs = data.signals.slice(0, 6).map((s, idx) => ({
        text: s.replace(/_/g, ' '),
        type: types[idx] || 'info',
      }));
      setSignals(sigs);
    } else {
      setSignals([]);
    }
  }, [theme]);

  // --- Do prediction ---
  const doPredict = useCallback(async () => {
    if (!isAuthenticatedRef.current) return;
    setPredVal('Analyse...');
    setPredLoading(true);

    try {
      const mem = loadMemory(memKey);
      const predictions = mem.predictions.map(p => ({
        category: p.category,
        timestamp: p.timestamp,
      }));

      const body: Record<string, unknown> = {
        history: mem.history,
        predictions,
      };
      if (mem.hits !== undefined && mem.total !== undefined) {
        body.hits = mem.hits;
        body.total = mem.total;
      }

      const res = await fetch(`/api/game/${slug}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (data.status === 'ok') {
        if (data.last_rounds && data.last_rounds.length > 0) {
          validateLastPrediction(memKey, data.last_rounds[0]);
        }
        if (data.history) {
          const newMem = loadMemory(memKey);
          newMem.history = data.history;
          saveMemory(memKey, newMem);
        }
        clearOldPredictions(memKey);
        recordPrediction(memKey, data.prediction, data.confidence, data.category);
        displayPrediction(data);
      } else {
        setPredVal('Reconnexion...');
        setPredLoading(true);
        setTimeout(doPredict, 6000);
      }
    } catch {
      setPredVal('Reconnexion...');
      setPredLoading(true);
      setTimeout(doPredict, 6000);
    }
  }, [slug, memKey, displayPrediction]);

  // --- Trigger prediction for round ---
  const triggerPredictionFor = useCallback((roundId: string) => {
    if (!roundId || predictedForRoundIdRef.current === roundId) return;
    predictedForRoundIdRef.current = roundId;
    doPredict();
  }, [doPredict]);

  // --- Poll game state ---
  const poll = useCallback(async () => {
    if (!isAuthenticatedRef.current) {
      pollingActiveRef.current = false;
      return;
    }
    try {
      const res = await fetch(`/api/game/${slug}/state`);
      const data = await res.json();
      const stateNow = detectState(data);
      const rid = extractRoundId(data) || String(Date.now());

      const RUN = new Set(['running']);
      const END = new Set(['ended']);
      const WAIT = new Set(['waiting']);

      if (RUN.has(stateNow) && rid !== currentRoundIdRef.current) {
        currentRoundIdRef.current = rid;
      }
      if (lastStateRef.current && RUN.has(lastStateRef.current) && (END.has(stateNow) || WAIT.has(stateNow))) {
        triggerPredictionFor(rid);
      }
      if (WAIT.has(stateNow) && predictedForRoundIdRef.current !== rid) {
        triggerPredictionFor(rid);
      }

      if (RUN.has(stateNow)) setHeaderStatus('En vol');
      else if (WAIT.has(stateNow)) setHeaderStatus('Attente');
      else setHeaderStatus('Actif');

      lastStateRef.current = stateNow;
    } catch {
      // continue polling
    } finally {
      pollTimerRef.current = setTimeout(poll, POLL_MS);
    }
  }, [slug, triggerPredictionFor]);

  const startPolling = useCallback(() => {
    if (pollingActiveRef.current) return;
    pollingActiveRef.current = true;
    poll();
  }, [poll]);

  // --- Scroll blocking ---
  useEffect(() => {
    const gameArea = gameAreaRef.current;
    if (!gameArea) return;
    const preventTouch = (e: TouchEvent) => e.preventDefault();
    const preventWheel = (e: WheelEvent) => e.preventDefault();
    gameArea.addEventListener('touchmove', preventTouch, { passive: false });
    gameArea.addEventListener('wheel', preventWheel, { passive: false });
    const preventGlobalTouch = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.ov-bottom')) e.preventDefault();
    };
    document.addEventListener('touchmove', preventGlobalTouch, { passive: false });
    return () => {
      gameArea.removeEventListener('touchmove', preventTouch);
      gameArea.removeEventListener('wheel', preventWheel);
      document.removeEventListener('touchmove', preventGlobalTouch);
    };
  }, []);

  // --- Init ---
  useEffect(() => {
    setHeaderStatus('Auth...');
    const mem = loadMemory(memKey);
    if (mem.history.length > 0) {
      setDataInfo('\u00b7 ' + mem.history.length + ' tours');
    }

    const initApp = async () => {
      try {
        const acc = getAccuracy(memKey);
        const body: Record<string, unknown> = {};
        if (acc !== null) body.accuracy = acc;

        const res = await fetch(`/api/game/${slug}/auth`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: Object.keys(body).length ? JSON.stringify(body) : '{}',
        });

        const data = await res.json();

        if (data.authenticated) {
          isAuthenticatedRef.current = true;
          setLiveDotClass('');
          setHeaderStatus('Actif');
          if (data.iframeUrl) setIframeUrl(data.iframeUrl);
          const msg = 'DVYS connect\u00e9 - Predictions actives';
          showToast(acc !== null ? msg + ' (' + acc + '% precision)' : msg, 3500);
          doPredict();
          startPolling();
        } else {
          setHeaderStatus('Erreur');
          setLiveDotClass('off');
          setPredVal('--');
          setPredLoading(false);
          showToast('Auth \u00e9chou\u00e9e - R\u00e9essayer', 4000);
          setTimeout(initApp, 10000);
        }
      } catch {
        setHeaderStatus('Erreur');
        setLiveDotClass('off');
        setPredVal('--');
        setPredLoading(false);
        showToast('Erreur connexion', 4000);
        setTimeout(initApp, 10000);
      }
    };

    initApp();

    return () => {
      if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      pollingActiveRef.current = false;
    };
  }, []);

  // Set body theme
  useEffect(() => {
    if (theme) {
      document.body.style.background = theme['--theme-bg'];
      document.body.style.color = theme['--theme-text'];
    }
    return () => {
      document.body.style.background = '';
      document.body.style.color = '';
    };
  }, [theme]);

  if (!game || game.type !== 'crash') {
    return (
      <div className="game-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <a href="/" style={{ color: '#0f172a', fontWeight: 700 }}>Retour au menu</a>
      </div>
    );
  }

  return (
    <div className="game-page" style={themeStyle}>
      <div className="game-area" ref={gameAreaRef}>
        <iframe
          ref={iframeRef}
          src={iframeUrl || undefined}
          allow="autoplay; fullscreen; clipboard-write"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-modals allow-top-navigation-by-user-activation"
          scrolling="no"
        />

        {/* Top Overlay */}
        <div className="ov-top">
          <a className="back-btn" href="/">
            &#8592; Retour
          </a>
          <div className="header-center">
            <span className="logo">DVYS</span>
            <div className="status-row">
              <div className={`live-dot ${liveDotClass}`} />
              <span className="ov-status">{headerStatus}</span>
              <span className="ov-round">{roundNum}</span>
            </div>
          </div>
          {game.logoUrl && (
            <img className="ov-logo" src={game.logoUrl} alt={game.name} />
          )}
        </div>

        {/* Bottom Overlay */}
        <div className="ov-bottom">
          <div className="pred-section">
            <div className="pred-label-row">
              <span className="pred-tag">Prediction DVYS</span>
              <span className="pred-data">{dataInfo}</span>
              <span className="pred-conf">{predConf}</span>
            </div>
            <div
              className={`pred-multi ${predLoading ? 'loading' : ''}`}
              style={{
                color: predLoading ? undefined : predValColor,
                textShadow: predLoading ? undefined : predValShadow,
              }}
            >
              {predVal}
            </div>
            <div className="pred-subrow">
              {signals.map((sig, i) => (
                <span key={i} className={`sig ${sig.type}`}>{sig.text}</span>
              ))}
            </div>
          </div>

          <div className="promo-section">
            <div className="promo-box">
              <div className="promo-title">
                L&apos;intelligence <span>DVYS</span> en action 8 modules de prediction
              </div>
              <div className="promo-modules">
                <span className="promo-mod">Tendance</span>
                <span className="promo-mod">Series</span>
                <span className="promo-mod">Volatilite</span>
                <span className="promo-mod">Patterns</span>
                <span className="promo-mod">Markov</span>
                <span className="promo-mod">Mean Rev.</span>
                <span className="promo-mod">Cycles</span>
                <span className="promo-mod">Momentum</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={`toast ${toastVisible ? 'show' : ''}`}>
        {toastMsg}
      </div>
    </div>
  );
}

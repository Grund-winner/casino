// Game configurations - complete per-game settings
export interface GameTheme {
  // CSS custom properties for game page
  '--theme-bg': string;
  '--theme-bg-alt': string;
  '--theme-text': string;
  '--theme-text-dim': string;
  '--theme-accent': string;
  '--theme-accent-light': string;
  '--theme-accent-dark': string;
  '--theme-border': string;
  '--theme-conf': string;
  '--theme-sig-up-bg': string;
  '--theme-sig-up-color': string;
  '--theme-sig-up-border': string;
  '--theme-sig-down-bg': string;
  '--theme-sig-down-color': string;
  '--theme-sig-down-border': string;
  '--theme-sig-info-bg': string;
  '--theme-sig-info-color': string;
  '--theme-sig-info-border': string;
  '--theme-promo-bg': string;
  '--theme-promo-border': string;
  '--theme-promo-accent': string;
  '--theme-toast-bg': string;
  '--theme-line-color': string;
  // Pre-computed mixed colors (avoid color-mix CSS which Vercel doesn't support)
  '--theme-bg-alt-solid': string;
  '--theme-text-dim-solid': string;
  '--theme-accent-bg': string;
  '--theme-accent-light-bg': string;
  '--theme-accent-light-border': string;
  '--theme-accent-light-text': string;
  '--theme-border-subtle': string;
 '--theme-pred-bg-solid': string;
  '--theme-pred-bg-loading': string;
 '--theme-sig-up-solid': string;
  '--theme-sig-down-solid': string;
 '--theme-sig-info-solid': string;
  '--theme-line-bg': string;
  '--theme-line-bg-strong': string;
  // Prediction colors
  predHighColor: string;
  predHighShadow: string;
  predMidColor: string;
  predMidShadow: string;
  predLowColor: string;
  predLowShadow: string;
}

export interface GameConfig {
  slug: string;
  name: string;
  description: string;
  type: 'crash' | 'grid';
  memKey: string;
  logoUrl: string | null;
  iconUrl: string;
  theme: GameTheme;
  badge?: string;
}

const violetTheme: GameTheme = {
  '--theme-bg': '#0a0618',
  '--theme-bg-alt': '#0d0820',
  '--theme-text': '#ffffff',
  '--theme-text-dim': 'rgba(255,255,255,.5)',
  '--theme-accent': '#7100ff',
  '--theme-accent-light': '#b388ff',
  '--theme-accent-dark': '#4a00b3',
  '--theme-border': 'rgba(113,0,255,.25)',
  '--theme-conf': '#7100ff',
  '--theme-bg-alt-solid': '#0d0820',
  '--theme-text-dim-solid': '#808080',
  '--theme-accent-bg': 'rgba(113,0,255,.2)',
  '--theme-accent-light-bg': 'rgba(113,0,255,.2)',
  '--theme-accent-light-border': 'rgba(179,136,255,.35)',
  '--theme-accent-light-text': '#b388ff',
  '--theme-border-subtle': 'rgba(113,0,255,.25)',
  '--theme-pred-bg-solid': 'rgba(113,0,255,.12)',
  '--theme-pred-bg-loading': 'rgba(255,255,255,.2)',
  '--theme-sig-up-solid': 'rgba(0,178,75,.12)',
  '--theme-sig-down-solid': 'rgba(255,60,60,.12)',
 '--theme-sig-info-solid': 'rgba(113,0,255,.12)',
  '--theme-line-bg': 'rgba(113,0,255,.4)',
  '--theme-line-bg-strong': 'rgba(113,0,255,.5)',
  '--theme-sig-up-bg': 'rgba(0,178,75,.12)',
  '--theme-sig-up-color': '#00ff88',
  '--theme-sig-up-border': 'rgba(0,255,136,.15)',
  '--theme-sig-down-bg': 'rgba(255,60,60,.12)',
  '--theme-sig-down-color': '#ff6b6b',
  '--theme-sig-down-border': 'rgba(255,107,107,.15)',
  '--theme-sig-info-bg': 'rgba(113,0,255,.12)',
  '--theme-sig-info-color': '#b388ff',
  '--theme-sig-info-border': 'rgba(179,136,255,.15)',
  '--theme-promo-bg': 'linear-gradient(135deg, rgba(113,0,255,.08) 0%, rgba(60,20,120,.06) 100%)',
  '--theme-promo-border': 'rgba(113,0,255,.15)',
  '--theme-promo-accent': '#b388ff',
  '--theme-toast-bg': 'rgba(113,0,255,.92)',
  '--theme-line-color': 'rgba(113,0,255,.4)',
  predHighColor: '#ff9800',
  predHighShadow: '0 0 30px rgba(255,152,0,.5),0 0 60px rgba(255,152,0,.2)',
  predMidColor: '#b388ff',
  predMidShadow: '0 0 25px rgba(179,136,255,.5),0 0 50px rgba(179,136,255,.2)',
  predLowColor: '#64b5f6',
  predLowShadow: '0 0 25px rgba(100,181,246,.4),0 0 50px rgba(100,181,246,.15)',
};

const oceanTheme: GameTheme = {
  '--theme-bg': '#e0f4ff',
  '--theme-bg-alt': '#e0f4ff',
  '--theme-text': '#0f172a',
  '--theme-text-dim': 'rgba(15,23,42,.5)',
  '--theme-accent': '#0ea5e9',
  '--theme-accent-light': '#38bdf8',
  '--theme-accent-dark': '#0369a1',
  '--theme-border': 'rgba(14,165,233,.2)',
  '--theme-conf': '#0ea5e9',
  '--theme-bg-alt-solid': '#d9eef7',
  '--theme-text-dim-solid': '#7d9098',
  '--theme-accent-bg': 'rgba(14,165,233,.1)',
  '--theme-accent-light-bg': 'rgba(14,165,233,.1)',
  '--theme-accent-light-border': 'rgba(14,165,233,.25)',
  '--theme-accent-light-text': '#0369a1',
  '--theme-border-subtle': 'rgba(14,165,233,.2)',
  '--theme-pred-bg-solid': 'rgba(14,165,233,.05)',
  '--theme-pred-bg-loading': 'rgba(15,23,42,.15)',
  '--theme-sig-up-solid': 'rgba(20,184,166,.1)',
  '--theme-sig-down-solid': 'rgba(239,68,68,.08)',
  '--theme-sig-info-solid': 'rgba(14,165,233,.08)',
  '--theme-line-bg': 'rgba(14,165,233,.4)',
  '--theme-line-bg-strong': 'rgba(14,165,233,.5)',
  '--theme-sig-up-bg': 'rgba(20,184,166,.1)',
  '--theme-sig-up-color': '#0d9488',
  '--theme-sig-up-border': 'rgba(20,184,166,.15)',
  '--theme-sig-down-bg': 'rgba(239,68,68,.08)',
  '--theme-sig-down-color': '#dc2626',
  '--theme-sig-down-border': 'rgba(239,68,68,.12)',
  '--theme-sig-info-bg': 'rgba(14,165,233,.08)',
  '--theme-sig-info-color': '#0284c7',
  '--theme-sig-info-border': 'rgba(14,165,233,.12)',
  '--theme-promo-bg': 'linear-gradient(135deg, rgba(14,165,233,.05) 0%, rgba(20,184,166,.04) 100%)',
  '--theme-promo-border': 'rgba(14,165,233,.12)',
  '--theme-promo-accent': '#0ea5e9',
  '--theme-toast-bg': 'rgba(14,165,233,.92)',
  '--theme-line-color': 'rgba(14,165,233,.4)',
  predHighColor: '#f59e0b',
  predHighShadow: '0 0 30px rgba(245,158,11,.4),0 0 60px rgba(245,158,11,.15)',
  predMidColor: '#0ea5e9',
  predMidShadow: '0 0 25px rgba(14,165,233,.4),0 0 50px rgba(14,165,233,.15)',
  predLowColor: '#06b6d4',
  predLowShadow: '0 0 25px rgba(6,182,212,.35),0 0 50px rgba(6,182,212,.12)',
};

const navyTheme: GameTheme = {
  '--theme-bg': '#0a0f1a',
  '--theme-bg-alt': '#0d1525',
  '--theme-text': '#ffffff',
  '--theme-text-dim': 'rgba(255,255,255,.5)',
  '--theme-accent': '#1565c0',
  '--theme-accent-light': '#42a5f5',
  '--theme-accent-dark': '#0d47a1',
  '--theme-border': 'rgba(66,165,245,.25)',
  '--theme-conf': '#42a5f5',
  '--theme-bg-alt-solid': '#0d1525',
  '--theme-text-dim-solid': '#808080',
  '--theme-accent-bg': 'rgba(21,101,192,.2)',
  '--theme-accent-light-bg': 'rgba(66,165,245,.2)',
  '--theme-accent-light-border': 'rgba(66,165,245,.35)',
  '--theme-accent-light-text': '#42a5f5',
  '--theme-border-subtle': 'rgba(66,165,245,.25)',
  '--theme-pred-bg-solid': 'rgba(21,101,192,.12)',
  '--theme-pred-bg-loading': 'rgba(255,255,255,.2)',
  '--theme-sig-up-solid': 'rgba(0,255,136,.12)',
  '--theme-sig-down-solid': 'rgba(255,60,60,.12)',
  '--theme-sig-info-solid': 'rgba(66,165,245,.12)',
  '--theme-line-bg': 'rgba(66,165,245,.4)',
  '--theme-line-bg-strong': 'rgba(66,165,245,.5)',
  '--theme-sig-up-bg': 'rgba(0,255,136,.1)',
  '--theme-sig-up-color': '#00ff88',
  '--theme-sig-up-border': 'rgba(0,255,136,.2)',
  '--theme-sig-down-bg': 'rgba(255,60,60,.1)',
  '--theme-sig-down-color': '#ff6b6b',
  '--theme-sig-down-border': 'rgba(255,60,60,.2)',
  '--theme-sig-info-bg': 'rgba(66,165,245,.1)',
  '--theme-sig-info-color': '#42a5f5',
  '--theme-sig-info-border': 'rgba(66,165,245,.2)',
  '--theme-promo-bg': 'linear-gradient(135deg, rgba(21,101,192,.08) 0%, rgba(66,165,245,.04) 100%)',
  '--theme-promo-border': 'rgba(21,101,192,.15)',
  '--theme-promo-accent': '#42a5f5',
  '--theme-toast-bg': 'rgba(21,101,192,.92)',
  '--theme-line-color': 'rgba(66,165,245,.4)',
  predHighColor: '#ffa500',
  predHighShadow: '0 0 30px rgba(255,165,0,.4),0 0 60px rgba(255,165,0,.15)',
  predMidColor: '#b388ff',
  predMidShadow: '0 0 25px rgba(179,136,255,.4),0 0 50px rgba(179,136,255,.15)',
  predLowColor: '#64b5f6',
  predLowShadow: '0 0 25px rgba(100,181,246,.35),0 0 50px rgba(100,181,246,.12)',
};

const crimsonTheme: GameTheme = {
  '--theme-bg': '#0a0618',
  '--theme-bg-alt': '#0d0820',
  '--theme-text': '#ffffff',
  '--theme-text-dim': 'rgba(255,255,255,.5)',
  '--theme-accent': '#e91e63',
  '--theme-accent-light': '#f48fb1',
  '--theme-accent-dark': '#c2185b',
  '--theme-border': 'rgba(233,30,99,.25)',
  '--theme-conf': '#e91e63',
  '--theme-bg-alt-solid': '#0d0820',
  '--theme-text-dim-solid': '#808080',
  '--theme-accent-bg': 'rgba(233,30,99,.2)',
  '--theme-accent-light-bg': 'rgba(233,30,99,.2)',
  '--theme-accent-light-border': 'rgba(244,143,177,.35)',
  '--theme-accent-light-text': '#f48fb1',
  '--theme-border-subtle': 'rgba(233,30,99,.25)',
  '--theme-pred-bg-solid': 'rgba(233,30,99,.12)',
  '--theme-pred-bg-loading': 'rgba(255,255,255,.2)',
  '--theme-sig-up-solid': 'rgba(0,178,75,.12)',
  '--theme-sig-down-solid': 'rgba(255,60,60,.12)',
  '--theme-sig-info-solid': 'rgba(233,30,99,.12)',
  '--theme-line-bg': 'rgba(233,30,99,.4)',
  '--theme-line-bg-strong': 'rgba(233,30,99,.5)',
  '--theme-sig-up-bg': 'rgba(0,178,75,.12)',
  '--theme-sig-up-color': '#00ff88',
  '--theme-sig-up-border': 'rgba(0,255,136,.15)',
  '--theme-sig-down-bg': 'rgba(255,60,60,.12)',
  '--theme-sig-down-color': '#ff6b6b',
  '--theme-sig-down-border': 'rgba(255,107,107,.15)',
  '--theme-sig-info-bg': 'rgba(233,30,99,.12)',
  '--theme-sig-info-color': '#f48fb1',
  '--theme-sig-info-border': 'rgba(244,143,177,.15)',
  '--theme-promo-bg': 'linear-gradient(135deg, rgba(233,30,99,.08) 0%, rgba(120,10,60,.06) 100%)',
  '--theme-promo-border': 'rgba(233,30,99,.15)',
  '--theme-promo-accent': '#f48fb1',
  '--theme-toast-bg': 'rgba(233,30,99,.92)',
  '--theme-line-color': 'rgba(233,30,99,.4)',
  predHighColor: '#ff9800',
  predHighShadow: '0 0 30px rgba(255,152,0,.5),0 0 60px rgba(255,152,0,.2)',
  predMidColor: '#f48fb1',
  predMidShadow: '0 0 25px rgba(244,143,177,.5),0 0 50px rgba(244,143,177,.2)',
  predLowColor: '#64b5f6',
  predLowShadow: '0 0 25px rgba(100,181,246,.4),0 0 50px rgba(100,181,246,.15)',
};

export const GAMES: GameConfig[] = [
  {
    slug: 'luckyjet',
    name: 'Lucky Jet',
    description: 'Prediction de crash avec intelligence DVYS',
    type: 'crash',
    memKey: 'dvys_luckyjet_memory',
    logoUrl: 'https://1play.gamedev-tech.cc/lucky_grm/assets/media/3caa6b7c2d37c3ae0bd198c86b81bb13.svg',
    iconUrl: '/icons/lucky.avif',
    theme: violetTheme,
    badge: 'HOT',
  },
  {
    slug: 'tropicana',
    name: 'Tropicana',
    description: 'Previsions dans l\'ocean tropical',
    type: 'crash',
    memKey: 'dvys_tropicana_memory',
    logoUrl: 'https://100hp.app/tropicana_grm/vgs/assets/main-logo.webp',
    iconUrl: '/icons/tropicana.avif',
    theme: oceanTheme,
    badge: 'HOT',
  },
  {
    slug: 'rocketx',
    name: 'Rocket X',
    description: 'Decollage vers les etoiles',
    type: 'crash',
    memKey: 'dvys_rocketx_memory',
    logoUrl: null,
    iconUrl: '/icons/rocktx.avif',
    theme: navyTheme,
    badge: 'HOT',
  },
  {
    slug: 'rocketqueen',
    name: 'Rocket Queen',
    description: 'La reine des fusees',
    type: 'crash',
    memKey: 'dvys_rocketqueen_memory',
    logoUrl: 'https://1play.gamedev-tech.cc/queen_grm/assets/rq_logo.png',
    iconUrl: '/icons/rocky.avif',
    theme: crimsonTheme,
    badge: 'NEW',
  },
  {
    slug: 'jobfox',
    name: 'JobFox',
    description: 'Jeux intelligents avec JobFox',
    type: 'grid',
    memKey: '',
    logoUrl: null,
    iconUrl: '/icons/fox.avif',
    theme: violetTheme, // Not used for grid game
    badge: 'NEW',
  },
];

export function getGameBySlug(slug: string): GameConfig | undefined {
  return GAMES.find(g => g.slug === slug);
}

export function getGameEnvVars(slug: string) {
  const prefix = slug.toUpperCase().replace(/-/g, '');
  return {
    TOKEN_B: process.env[`${prefix}_TOKEN_B`],
    AUTH_URL: process.env[`${prefix}_AUTH_URL`],
    STATE_URL: process.env[`${prefix}_STATE_URL`],
    HIST_URL: process.env[`${prefix}_HIST_URL`],
    GAME_IFRAME_URL: process.env[`${prefix}_GAME_IFRAME_URL`],
    PARTNER_ID: process.env[`${prefix}_PARTNER_ID`],
    PARTNER_IK: process.env[`${prefix}_PARTNER_IK`],
  };
}

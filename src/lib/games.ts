// Game configurations - each game has its own theme and settings
export interface GameConfig {
  slug: string;
  name: string;
  description: string;
  theme: GameTheme;
  logoUrl: string;
  iconEmoji: string;
  badge: string;
}

export interface GameTheme {
  bg: string;
  bgGradient: string;
  cardBg: string;
  accent: string;
  accentLight: string;
  accentDark: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  promoAccent: string;
}

const themes: Record<string, GameTheme> = {
  violet: {
    bg: '#0a0618',
    bgGradient: 'linear-gradient(135deg, #0a0618 0%, #1a0a2e 50%, #0a0618 100%)',
    cardBg: 'linear-gradient(135deg, rgba(113,0,255,.08) 0%, rgba(60,20,120,.06) 100%)',
    accent: '#7100ff',
    accentLight: '#b388ff',
    accentDark: '#4a00b3',
    border: 'rgba(113,0,255,.25)',
    textPrimary: '#ffffff',
    textSecondary: 'rgba(255,255,255,.5)',
    promoAccent: '#b388ff',
  },
  ocean: {
    bg: '#e0f4ff',
    bgGradient: 'linear-gradient(135deg, #e0f4ff 0%, #bae6fd 50%, #e0f4ff 100%)',
    cardBg: 'linear-gradient(135deg, rgba(14,165,233,.06) 0%, rgba(20,184,166,.04) 100%)',
    accent: '#0ea5e9',
    accentLight: '#38bdf8',
    accentDark: '#0369a1',
    border: 'rgba(14,165,233,.2)',
    textPrimary: '#0f172a',
    textSecondary: 'rgba(15,23,42,.5)',
    promoAccent: '#0ea5e9',
  },
  navy: {
    bg: '#0a0f1a',
    bgGradient: 'linear-gradient(135deg, #0a0f1a 0%, #0f1a2e 50%, #0a0f1a 100%)',
    cardBg: 'linear-gradient(135deg, rgba(59,130,246,.08) 0%, rgba(30,58,138,.06) 100%)',
    accent: '#3b82f6',
    accentLight: '#60a5fa',
    accentDark: '#1d4ed8',
    border: 'rgba(59,130,246,.25)',
    textPrimary: '#ffffff',
    textSecondary: 'rgba(255,255,255,.5)',
    promoAccent: '#60a5fa',
  },
  crimson: {
    bg: '#0f0a0a',
    bgGradient: 'linear-gradient(135deg, #0f0a0a 0%, #1a0f0f 50%, #0f0a0a 100%)',
    cardBg: 'linear-gradient(135deg, rgba(239,68,68,.08) 0%, rgba(153,27,27,.06) 100%)',
    accent: '#ef4444',
    accentLight: '#f87171',
    accentDark: '#b91c1c',
    border: 'rgba(239,68,68,.25)',
    textPrimary: '#ffffff',
    textSecondary: 'rgba(255,255,255,.5)',
    promoAccent: '#f87171',
  },
  emerald: {
    bg: '#050f0a',
    bgGradient: 'linear-gradient(135deg, #050f0a 0%, #0d1f14 50%, #050f0a 100%)',
    cardBg: 'linear-gradient(135deg, rgba(16,185,129,.08) 0%, rgba(5,150,105,.06) 100%)',
    accent: '#10b981',
    accentLight: '#34d399',
    accentDark: '#047857',
    border: 'rgba(16,185,129,.25)',
    textPrimary: '#ffffff',
    textSecondary: 'rgba(255,255,255,.5)',
    promoAccent: '#34d399',
  },
  amber: {
    bg: '#0f0d05',
    bgGradient: 'linear-gradient(135deg, #0f0d05 0%, #1a160a 50%, #0f0d05 100%)',
    cardBg: 'linear-gradient(135deg, rgba(245,158,11,.08) 0%, rgba(180,83,9,.06) 100%)',
    accent: '#f59e0b',
    accentLight: '#fbbf24',
    accentDark: '#b45309',
    border: 'rgba(245,158,11,.25)',
    textPrimary: '#ffffff',
    textSecondary: 'rgba(255,255,255,.5)',
    promoAccent: '#fbbf24',
  },
};

export const GAMES: GameConfig[] = [
  {
    slug: 'luckyjet',
    name: 'Lucky Jet',
    description: 'Prediction de crash avec intelligence DVYS',
    theme: themes.violet,
    logoUrl: 'https://1play.gamedev-tech.cc/lucky_grm/assets/media/3caa6b7c2d37c3ae0bd198c86b81bb13.svg',
    iconEmoji: '\u{1F680}',
    badge: 'HOT',
  },
  {
    slug: 'tropicana',
    name: 'Tropicana',
    description: 'Previsions dans l\'ocean tropical',
    theme: themes.ocean,
    logoUrl: 'https://100hp.app/tropicana_grm/vgs/assets/main-logo.webp',
    iconEmoji: '\u{1F3DE}',
    badge: 'HOT',
  },
  {
    slug: 'rocketx',
    name: 'Rocket X',
    description: 'Decollage vers les etoiles',
    theme: themes.navy,
    logoUrl: 'https://100hp.app/rocketx_grm/assets/main-logo.webp',
    iconEmoji: '\u{1F680}',
    badge: 'HOT',
  },
  {
    slug: 'rocketqueen',
    name: 'Rocket Queen',
    description: 'La reine des fusées',
    theme: themes.crimson,
    logoUrl: '',
    iconEmoji: '\u{1F451}',
    badge: 'NEW',
  },
  {
    slug: 'jobfox',
    name: 'JobFox',
    description: 'Jeux intelligents avec JobFox',
    theme: themes.amber,
    logoUrl: '',
    iconEmoji: '\u{1F98A}',
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

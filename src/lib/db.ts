// JSON-based settings store using GitHub API
// No database needed - works on Vercel serverless!

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
const GITHUB_REPO = 'Grund-winner/casino';
const GITHUB_BRANCH = 'main';
const SETTINGS_PATH = 'data/settings.json';
const GAMES_PATH = 'data/games.json';

interface GameData {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  enabled: boolean;
  order: number;
  iconUrl: string | null;
  theme: string;
  logoUrl: string | null;
  badge: string;
}

const DEFAULT_SETTINGS: Record<string, string> = {
  promo_code: 'DVYS',
  site_name: 'DVYS Predictions',
  description: '',
};

const DEFAULT_GAMES: GameData[] = [
  { id: '1', slug: 'luckyjet', name: 'Lucky Jet', description: 'Prediction de crash avec intelligence DVYS', enabled: true, order: 1, iconUrl: '/icons/lucky.avif', theme: 'violet', logoUrl: '/icons/lucky.avif', badge: 'HOT' },
  { id: '2', slug: 'tropicana', name: 'Tropicana', description: 'Previsions dans l\'ocean tropical', enabled: true, order: 2, iconUrl: '/icons/tropicana.avif', theme: 'ocean', logoUrl: '/icons/tropicana.avif', badge: 'HOT' },
  { id: '3', slug: 'rocketx', name: 'Rocket X', description: 'Decollage vers les etoiles', enabled: true, order: 3, iconUrl: '/icons/rocktx.avif', theme: 'navy', logoUrl: '/icons/rocktx.avif', badge: 'HOT' },
  { id: '4', slug: 'rocketqueen', name: 'Rocket Queen', description: 'La reine des fusees', enabled: true, order: 4, iconUrl: '/icons/rocky.avif', theme: 'crimson', logoUrl: '/icons/rocky.avif', badge: 'NEW' },
  { id: '5', slug: 'jobfox', name: 'JobFox', description: 'Jeux intelligents avec JobFox', enabled: true, order: 5, iconUrl: '/icons/fox.avif', theme: 'amber', logoUrl: '/icons/fox.avif', badge: 'NEW' },
];

// Cache to avoid hammering GitHub API on every request
let settingsCache: { data: Record<string, string>; timestamp: number } | null = null;
let gamesCache: { data: GameData[]; timestamp: number } | null = null;
const CACHE_TTL = 30000; // 30 seconds

async function fetchGitHubFile(path: string): Promise<string | null> {
  if (!GITHUB_TOKEN) return null;
  try {
    const res = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/contents/${path}?ref=${GITHUB_BRANCH}`,
      {
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github.v3+json',
        },
        cache: 'no-store',
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.content ? Buffer.from(data.content, 'base64').toString('utf-8') : null;
  } catch {
    return null;
  }
}

async function updateGitHubFile(path: string, content: string): Promise<boolean> {
  if (!GITHUB_TOKEN) return false;
  try {
    // Get current SHA
    const res = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/contents/${path}?ref=${GITHUB_BRANCH}`,
      {
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github.v3+json',
        },
        cache: 'no-store',
      }
    );
    
    const body: Record<string, unknown> = {
      message: `Update ${path} from admin panel`,
      content: Buffer.from(content).toString('base64'),
      branch: GITHUB_BRANCH,
    };

    if (res.ok) {
      const data = await res.json();
      body.sha = data.sha;
    }

    const putRes = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/contents/${path}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github.v3+json',
        },
        body: JSON.stringify(body),
      }
    );
    return putRes.ok;
  } catch {
    return false;
  }
}

// === Public API ===

export async function getSettings(): Promise<Record<string, string>> {
  if (settingsCache && Date.now() - settingsCache.timestamp < CACHE_TTL) {
    return settingsCache.data;
  }

  try {
    const content = await fetchGitHubFile(SETTINGS_PATH);
    if (content) {
      const parsed = JSON.parse(content);
      settingsCache = { data: parsed, timestamp: Date.now() };
      return parsed;
    }
  } catch {}

  settingsCache = { data: { ...DEFAULT_SETTINGS }, timestamp: Date.now() };
  return { ...DEFAULT_SETTINGS };
}

export async function getGames(): Promise<GameData[]> {
  if (gamesCache && Date.now() - gamesCache.timestamp < CACHE_TTL) {
    return gamesCache.data;
  }

  try {
    const content = await fetchGitHubFile(GAMES_PATH);
    if (content) {
      const parsed = JSON.parse(content);
      gamesCache = { data: parsed, timestamp: Date.now() };
      return parsed;
    }
  } catch {}

  gamesCache = { data: [...DEFAULT_GAMES], timestamp: Date.now() };
  return [...DEFAULT_GAMES];
}

export async function updateSettings(settings: Record<string, string>): Promise<boolean> {
  const current = await getSettings();
  const merged = { ...current, ...settings };
  
  // Convert underscore keys to camelCase for JSON storage
  const toStore: Record<string, string> = {};
  for (const [key, value] of Object.entries(merged)) {
    toStore[key] = value;
  }
  
  const success = await updateGitHubFile(SETTINGS_PATH, JSON.stringify(toStore, null, 2));
  if (success) {
    settingsCache = { data: toStore, timestamp: Date.now() };
  }
  return success;
}

export async function updateGameEnabled(slug: string, enabled: boolean): Promise<boolean> {
  const games = await getGames();
  const updated = games.map(g => g.slug === slug ? { ...g, enabled } : g);
  
  const success = await updateGitHubFile(GAMES_PATH, JSON.stringify(updated, null, 2));
  if (success) {
    gamesCache = { data: updated, timestamp: Date.now() };
  }
  return success;
}

export async function updateGamesBulk(updates: { slug: string; enabled: boolean }[]): Promise<boolean> {
  const games = await getGames();
  for (const update of updates) {
    const idx = games.findIndex(g => g.slug === update.slug);
    if (idx >= 0) {
      games[idx].enabled = update.enabled;
    }
  }
  
  const success = await updateGitHubFile(GAMES_PATH, JSON.stringify(games, null, 2));
  if (success) {
    gamesCache = { data: games, timestamp: Date.now() };
  }
  return success;
}

export async function getPublicSettings() {
  const [settings, games] = await Promise.all([getSettings(), getGames()]);
  return {
    promoCode: settings.promo_code || 'DVYS',
    siteName: settings.site_name || 'DVYS Predictions',
    description: settings.description || '',
    enabledGames: games.filter(g => g.enabled).map(g => g.slug),
  };
}

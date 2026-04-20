// Dynamic session management - supports multiple games via slug
// Token NEVER exposed to client

interface GameEnvVars {
  TOKEN_B: string | undefined;
  AUTH_URL: string | undefined;
  STATE_URL: string | undefined;
  HIST_URL: string | undefined;
  GAME_IFRAME_URL: string | undefined;
  PARTNER_ID: string | undefined;
  PARTNER_IK: string | undefined;
}

interface SessionData {
  headers: Record<string, string>;
  createdAt: number;
}

const SESSION_TTL = 30 * 60 * 1000; // 30 minutes

// Per-game session cache
const sessionCaches = new Map<string, SessionData>();

function getGameCacheKey(slug: string): string {
  return `session_${slug}`;
}

function isExpired(session: SessionData): boolean {
  return Date.now() - session.createdAt > SESSION_TTL;
}

function getEnvVars(slug: string): GameEnvVars {
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

function getCachedSession(slug: string): SessionData | null {
  const key = getGameCacheKey(slug);
  const session = sessionCaches.get(key);
  if (!session || isExpired(session)) return null;
  return session;
}

function setCachedSession(slug: string, session: SessionData) {
  const key = getGameCacheKey(slug);
  sessionCaches.set(key, session);
}

export async function authenticate(slug: string): Promise<{
  success: boolean;
  sessionId?: string;
  customerId?: string;
  error?: string;
  iframeUrl?: string;
}> {
  const env = getEnvVars(slug);
  if (!env.TOKEN_B || !env.AUTH_URL) {
    return { success: false, error: `Missing env vars for game: ${slug}` };
  }

  try {
    const res = await fetch(env.AUTH_URL, {
      method: 'POST',
      headers: {
        'auth-token': env.TOKEN_B,
        'Content-Type': 'application/json',
      },
      body: '{}',
    });

    if (!res.ok) return { success: false, error: `Auth HTTP ${res.status}` };

    const data = await res.json();
    if (!data.sessionId || !data.customerId) return { success: false, error: 'No session data' };

    const session: SessionData = {
      headers: {
        'customer-id': String(data.customerId),
        'session-id': String(data.sessionId),
        'accept': 'application/json',
      },
      createdAt: Date.now(),
    };

    setCachedSession(slug, session);

    // Build iframe URL if available
    let iframeUrl: string | undefined;
    if (env.GAME_IFRAME_URL && env.PARTNER_ID && env.PARTNER_IK) {
      iframeUrl = `${env.GAME_IFRAME_URL}?b=${encodeURIComponent(env.TOKEN_B)}&language=en&pid=${encodeURIComponent(env.PARTNER_ID)}&pik=${encodeURIComponent(env.PARTNER_IK)}`;
    }

    return { success: true, sessionId: data.sessionId, customerId: data.customerId, iframeUrl };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown auth error';
    return { success: false, error: message };
  }
}

export async function getSession(slug: string): Promise<Record<string, string>> {
  const cached = getCachedSession(slug);
  if (cached) return cached.headers;

  const result = await authenticate(slug);
  if (!result.success) throw new Error(result.error || 'Authentication failed');

  const session = getCachedSession(slug);
  if (!session) throw new Error('Failed to create session');
  return session.headers;
}

export async function fetchHistory(slug: string): Promise<unknown> {
  const env = getEnvVars(slug);
  if (!env.HIST_URL) throw new Error(`Missing HIST_URL for ${slug}`);

  const headers = await getSession(slug);
  const res = await fetch(env.HIST_URL, {
    method: 'GET',
    headers: {
      'customer-id': headers['customer-id'],
      'session-id': headers['session-id'],
      'accept': 'application/json',
    },
  });

  if (!res.ok) throw new Error(`History HTTP ${res.status}`);
  return res.json();
}

export async function fetchState(slug: string): Promise<unknown> {
  const env = getEnvVars(slug);
  if (!env.STATE_URL) throw new Error(`Missing STATE_URL for ${slug}`);

  const headers = await getSession(slug);
  const res = await fetch(env.STATE_URL, {
    method: 'GET',
    headers: {
      'customer-id': headers['customer-id'],
      'session-id': headers['session-id'],
      'accept': 'application/json',
    },
  });

  if (!res.ok) throw new Error(`State HTTP ${res.status}`);
  return res.json();
}

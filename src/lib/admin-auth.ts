// Admin authentication - simple and reliable
import { cookies } from 'next/headers';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'dvys2024';
const COOKIE_NAME = 'dvys_admin_session';
const SESSION_MAX_AGE = 24 * 60 * 60; // 24 hours
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'dvys-admin-secret-2024';

export async function verifyAdminPassword(password: string): Promise<boolean> {
  return password === ADMIN_PASSWORD;
}

export function createAdminToken(): string {
  const payload = {
    exp: Date.now() + SESSION_MAX_AGE * 1000,
    secret: ADMIN_SECRET,
    t: Date.now(),
  };
  return Buffer.from(JSON.stringify(payload)).toString('base64url');
}

export function verifyAdminToken(token: string): boolean {
  try {
    const payload = JSON.parse(Buffer.from(token, 'base64url').toString());
    if (payload.secret !== ADMIN_SECRET) return false;
    if (Date.now() > payload.exp) return false;
    return true;
  } catch {
    return false;
  }
}

export async function getAdminSession(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return false;
    return verifyAdminToken(token);
  } catch {
    // In case cookies() fails (Edge runtime issues)
    return false;
  }
}

export async function createAdminSession(): Promise<string> {
  return createAdminToken();
}

export { COOKIE_NAME, SESSION_MAX_AGE };

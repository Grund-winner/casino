// Admin authentication helpers
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

const ADMIN_SECRET = process.env.ADMIN_SECRET || 'default-secret-change-me';
const COOKIE_NAME = 'dvys_admin_session';
const SESSION_MAX_AGE = 24 * 60 * 60; // 24 hours

export async function verifyAdminPassword(password: string): Promise<boolean> {
  const storedHash = process.env.ADMIN_PASSWORD;
  if (!storedHash) return false;

  // If stored hash starts with $2, it's a bcrypt hash
  if (storedHash.startsWith('$2')) {
    return bcrypt.compareSync(password, storedHash);
  }

  // Otherwise, plain text comparison (for initial setup)
  return password === storedHash;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export function createAdminToken(): string {
  const payload = {
    exp: Date.now() + SESSION_MAX_AGE * 1000,
    secret: ADMIN_SECRET,
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
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return false;
  return verifyAdminToken(token);
}

export async function createAdminSession(): Promise<string> {
  return createAdminToken();
}

export { COOKIE_NAME, SESSION_MAX_AGE };

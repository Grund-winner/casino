import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/session';
import { getGameEnvVars } from '@/lib/games';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!slug || typeof slug !== 'string') {
      return NextResponse.json({ status: 'error', error: 'Slug manquant' }, { status: 400 });
    }

    let clientAccuracy: number | null = null;
    try {
      const body = await request.json();
      clientAccuracy = body.accuracy ?? null;
    } catch {
      // No body needed for initial auth
    }

    const result = await authenticate(slug);

    // Build iframe URL from game env vars (same as individual repos)
    const env = getGameEnvVars(slug);
    let iframeUrl: string | undefined;
    if (env.GAME_IFRAME_URL && env.TOKEN_B && env.PARTNER_ID && env.PARTNER_IK) {
      iframeUrl = `${env.GAME_IFRAME_URL}?b=${encodeURIComponent(env.TOKEN_B)}&language=en&pid=${encodeURIComponent(env.PARTNER_ID)}&pik=${encodeURIComponent(env.PARTNER_IK)}`;
    }

    return NextResponse.json({
      status: result.success ? 'ok' : 'error',
      authenticated: result.success,
      error: result.error || null,
      accuracy: clientAccuracy,
      iframeUrl: iframeUrl || result.iframeUrl,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Auth endpoint error';
    return NextResponse.json({ status: 'error', error: message }, { status: 500 });
  }
}

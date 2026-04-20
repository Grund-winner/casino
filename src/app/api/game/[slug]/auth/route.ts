import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/session';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!slug || typeof slug !== 'string') {
      return NextResponse.json({ success: false, error: 'Slug manquant' }, { status: 400 });
    }

    const result = await authenticate(slug);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      sessionId: result.sessionId,
      customerId: result.customerId,
      iframeUrl: result.iframeUrl,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur serveur';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

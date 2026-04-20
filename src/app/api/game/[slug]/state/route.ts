import { NextResponse } from 'next/server';
import { fetchState } from '@/lib/session';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!slug || typeof slug !== 'string') {
      return NextResponse.json({ error: 'Slug manquant' }, { status: 400 });
    }

    const stateData = await fetchState(slug);
    return NextResponse.json(stateData);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur de connexion';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

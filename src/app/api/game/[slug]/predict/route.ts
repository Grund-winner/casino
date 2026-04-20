import { NextResponse } from 'next/server';
import { fetchHistory } from '@/lib/session';
import { predict, extractCoefs } from '@/lib/dvys-predictor';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!slug || typeof slug !== 'string') {
      return NextResponse.json({ error: 'Slug manquant' }, { status: 400 });
    }

    const body = await request.json();
    const memory: { cat: string | null; count: number } = body.memory || { cat: null, count: 0 };
    const accuracy: number | null = body.accuracy ?? null;

    const historyData = await fetchHistory(slug);
    const allCoefs = extractCoefs(historyData);

    if (allCoefs.length < 3) {
      return NextResponse.json({
        prediction: 1.50,
        confidence: 20,
        signals: ['donnees_insuffisantes'],
        signalTypes: ['info'],
        category: 'mid',
        rounds: allCoefs.length,
        avg: 0,
        std: 0,
        accuracy: null,
        lastResults: allCoefs.slice(-10),
      });
    }

    const result = predict(allCoefs, memory, accuracy);

    return NextResponse.json({
      ...result,
      lastResults: allCoefs.slice(-10),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur de prediction';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

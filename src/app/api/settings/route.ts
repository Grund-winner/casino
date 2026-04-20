import { NextResponse } from 'next/server';
import { getPublicSettings } from '@/lib/db';

export async function GET() {
  try {
    const data = await getPublicSettings();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({
      promoCode: 'DVYS',
      siteName: 'DVYS Predictions',
      description: '',
      enabledGames: [],
    });
  }
}

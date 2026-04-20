import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const [promoCode, siteName, description, games] = await Promise.all([
      db.setting.findUnique({ where: { key: 'promo_code' } }),
      db.setting.findUnique({ where: { key: 'site_name' } }),
      db.setting.findUnique({ where: { key: 'description' } }),
      db.game.findMany({ where: { enabled: true }, select: { slug: true } }),
    ]);

    return NextResponse.json({
      promoCode: promoCode?.value || 'DVYS',
      siteName: siteName?.value || 'DVYS Predictions',
      description: description?.value || '',
      enabledGames: games.map(g => g.slug),
    });
  } catch {
    return NextResponse.json({
      promoCode: 'DVYS',
      siteName: 'DVYS Predictions',
      description: '',
      enabledGames: [],
    });
  }
}

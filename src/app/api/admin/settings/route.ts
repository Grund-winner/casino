import { NextResponse } from 'next/server';
import { getSettings, getGames, updateSettings, updateGamesBulk } from '@/lib/db';
import { getAdminSession, COOKIE_NAME } from '@/lib/admin-auth';

export async function GET() {
  try {
    const isAdmin = await getAdminSession();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Non autorise' }, { status: 401 });
    }

    const [settings, games] = await Promise.all([getSettings(), getGames()]);

    return NextResponse.json({
      settings,
      games,
    });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const isAdmin = await getAdminSession();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Non autorise' }, { status: 401 });
    }

    const body = await request.json();
    const { settings, games } = body as {
      settings?: Record<string, string>;
      games?: { slug: string; enabled: boolean }[];
    };

    if (settings) {
      await updateSettings(settings);
    }

    if (games && Array.isArray(games)) {
      await updateGamesBulk(games);
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

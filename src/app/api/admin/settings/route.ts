import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAdminSession, COOKIE_NAME } from '@/lib/admin-auth';

export async function GET() {
  try {
    const isAdmin = await getAdminSession();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Non autorise' }, { status: 401 });
    }

    const settings = await db.setting.findMany();
    const games = await db.game.findMany({ orderBy: { order: 'asc' } });

    const settingsMap: Record<string, string> = {};
    for (const s of settings) {
      settingsMap[s.key] = s.value;
    }

    return NextResponse.json({
      settings: settingsMap,
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
      for (const [key, value] of Object.entries(settings)) {
        await db.setting.upsert({
          where: { key },
          update: { value },
          create: { key, value },
        });
      }
    }

    if (games && Array.isArray(games)) {
      for (const gameUpdate of games) {
        await db.game.updateMany({
          where: { slug: gameUpdate.slug },
          data: { enabled: gameUpdate.enabled },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

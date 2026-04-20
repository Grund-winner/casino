'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface AdminSettings {
  promo_code: string;
  site_name: string;
  description: string;
}

interface GameItem {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  enabled: boolean;
  order: number;
  iconUrl: string | null;
  theme: string;
  logoUrl: string | null;
  badge: string;
}

const DEFAULT_SETTINGS: AdminSettings = {
  promo_code: 'DVYS',
  site_name: 'DVYS Predictions',
  description: '',
};

const GAME_ICONS: Record<string, string> = {
  luckyjet: '/icons/lucky.avif',
  tropicana: '/icons/tropicana.avif',
  rocketx: '/icons/rocktx.avif',
  rocketqueen: '/icons/rocky.avif',
  jobfox: '/icons/fox.avif',
};

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<AdminSettings>(DEFAULT_SETTINGS);
  const [games, setGames] = useState<GameItem[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/settings');
      if (!res.ok) {
        router.push('/admin/login');
        return;
      }
      const data = await res.json();
      setSettings({
        promo_code: data.settings?.promo_code || DEFAULT_SETTINGS.promo_code,
        site_name: data.settings?.site_name || DEFAULT_SETTINGS.site_name,
        description: data.settings?.description || DEFAULT_SETTINGS.description,
      });
      setGames(data.games || []);
    } catch {
      router.push('/admin/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleLogout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    router.push('/admin/login');
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings,
          games: games.map(g => ({ slug: g.slug, enabled: g.enabled })),
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Parametres sauvegardes', 'success');
      } else {
        showToast('Erreur de sauvegarde', 'error');
      }
    } catch {
      showToast('Erreur serveur', 'error');
    } finally {
      setSaving(false);
    }
  };

  const toggleGame = (slug: string) => {
    setGames(prev => prev.map(g => g.slug === slug ? { ...g, enabled: !g.enabled } : g));
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
          <div className="loader-ring" />
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      {/* Background */}
      <div className="bg-mesh">
        <div className="floating-orb" />
        <div className="floating-orb" />
      </div>

      {/* Header */}
      <header className="admin-header">
        <h1>Panneau Admin</h1>
        <button className="admin-logout-btn" onClick={handleLogout}>
          Deconnexion
        </button>
      </header>

      <main className="admin-section">
        {/* Settings Section */}
        <div className="admin-section-title">Parametres Generaux</div>

        <div className="admin-field">
          <label>Code Promo</label>
          <input
            type="text"
            value={settings.promo_code}
            onChange={e => setSettings(prev => ({ ...prev, promo_code: e.target.value }))}
            placeholder="DVYS"
          />
        </div>

        <div className="admin-field">
          <label>Nom du Site</label>
          <input
            type="text"
            value={settings.site_name}
            onChange={e => setSettings(prev => ({ ...prev, site_name: e.target.value }))}
            placeholder="DVYS Predictions"
          />
        </div>

        <div className="admin-field">
          <label>Description</label>
          <textarea
            value={settings.description}
            onChange={e => setSettings(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Description du site..."
          />
        </div>

        <button
          className="admin-save-btn"
          onClick={handleSave}
          disabled={saving}
          style={{ marginTop: 8 }}
        >
          {saving ? 'Sauvegarde...' : 'Sauvegarder'}
        </button>
      </main>

      <section className="admin-section" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="admin-section-title">Gestion des Jeux</div>

        <div className="game-toggle-list">
          {games.map(game => (
            <div key={game.id} className="game-toggle-item">
              <div className="game-toggle-info">
                <img
                  src={GAME_ICONS[game.slug] || '/icons/lucky.avif'}
                  alt={game.name}
                  className="admin-game-icon"
                />
                <div>
                  <div className="game-toggle-name">{game.name}</div>
                  <div className="game-toggle-slug">{game.slug}</div>
                </div>
              </div>
              <div
                className={`toggle-switch ${game.enabled ? 'active' : ''}`}
                onClick={() => toggleGame(game.slug)}
                role="switch"
                aria-checked={game.enabled}
                tabIndex={0}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleGame(game.slug); }}}
              />
            </div>
          ))}
        </div>

        <button
          className="admin-save-btn"
          onClick={handleSave}
          disabled={saving}
          style={{ marginTop: 16 }}
        >
          {saving ? 'Sauvegarde...' : 'Sauvegarder les jeux'}
        </button>
      </section>

      <div style={{ height: 60 }} />

      {/* Toast */}
      <div className={`toast ${toast ? 'show' : ''} ${toast?.type === 'success' ? 'toast-success' : 'toast-error'}`}>
        {toast?.message}
      </div>
    </div>
  );
}

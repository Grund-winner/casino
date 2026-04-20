'use client';

import { useState, useEffect } from 'react';

interface Settings {
  promo_code: string;
  site_name: string;
  description: string;
}

interface GameEntry {
  id: string;
  slug: string;
  name: string;
  enabled: boolean;
  iconUrl: string;
  badge: string;
}

const ALL_GAMES = [
  { slug: 'luckyjet', name: 'Lucky Jet', icon: '/icons/lucky.avif' },
  { slug: 'tropicana', name: 'Tropicana', icon: '/icons/tropicana.avif' },
  { slug: 'rocketx', name: 'Rocket X', icon: '/icons/rocktx.avif' },
  { slug: 'rocketqueen', name: 'Rocket Queen', icon: '/icons/rocky.avif' },
  { slug: 'jobfox', name: 'JobFox', icon: '/icons/fox.avif' },
];

export default function AdminDashboard() {
  const [settings, setSettings] = useState<Settings>({ promo_code: 'DVYS', site_name: 'DVYS', description: '' });
  const [games, setGames] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      if (res.status === 401) {
        window.location.href = '/admin/login';
        return;
      }
      const data = await res.json();
      if (data.settings) {
        setSettings({
          promo_code: data.settings.promo_code || 'DVYS',
          site_name: data.settings.site_name || 'DVYS',
          description: data.settings.description || '',
        });
      }
      if (data.games && Array.isArray(data.games)) {
        const map: Record<string, boolean> = {};
        for (const g of data.games) {
          map[g.slug] = g.enabled;
        }
        setGames(map);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setStatus(null);
    try {
      const gamesArr = ALL_GAMES.map(g => ({ slug: g.slug, enabled: games[g.slug] !== false }));
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings, games: gamesArr }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus({ type: 'success', msg: 'Parametres sauvegardes' });
      } else {
        setStatus({ type: 'error', msg: data.error || 'Erreur' });
      }
    } catch {
      setStatus({ type: 'error', msg: 'Erreur de sauvegarde' });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    window.location.href = '/admin/login';
  };

  if (loading) {
    return <div className="admin-page"><p>Chargement...</p></div>;
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div className="admin-title">Administration</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="admin-btn admin-btn-danger" onClick={handleLogout}>Deconnexion</button>
        </div>
      </div>

      {status && (
        <div className={`admin-status ${status.type}`} style={{ marginBottom: 16 }}>
          {status.msg}
        </div>
      )}

      {/* Settings */}
      <div className="admin-card">
        <div className="admin-card-title">Parametres du site</div>
        <div className="admin-field">
          <label>Nom du site</label>
          <input
            value={settings.site_name}
            onChange={e => setSettings(s => ({ ...s, site_name: e.target.value }))}
            placeholder="DVYS"
          />
        </div>
        <div className="admin-field">
          <label>Code promo</label>
          <input
            value={settings.promo_code}
            onChange={e => setSettings(s => ({ ...s, promo_code: e.target.value }))}
            placeholder="DVYS"
          />
        </div>
        <div className="admin-field">
          <label>Description</label>
          <input
            value={settings.description}
            onChange={e => setSettings(s => ({ ...s, description: e.target.value }))}
            placeholder="Description optionnelle"
          />
        </div>
      </div>

      {/* Games */}
      <div className="admin-card">
        <div className="admin-card-title">Jeux actifs</div>
        {ALL_GAMES.map(game => (
          <div key={game.slug} className="game-toggle">
            <div className="game-toggle-info">
              <img className="game-toggle-icon" src={game.icon} alt={game.name} />
              <div className="game-toggle-name">{game.name}</div>
            </div>
            <div
              className={`toggle-switch${games[game.slug] !== false ? ' on' : ''}`}
              onClick={() => setGames(g => ({ ...g, [game.slug]: g[game.slug] === false ? true : false }))}
            />
          </div>
        ))}
      </div>

      <button className="admin-btn admin-btn-primary" onClick={handleSave} disabled={saving} style={{ width: '100%', padding: '14px', fontSize: '15px' }}>
        {saving ? 'Sauvegarde...' : 'Sauvegarder les modifications'}
      </button>

      <div style={{ marginTop: 16 }}>
        <a href="/" style={{ fontSize: 12, color: '#94a3b8', textDecoration: 'none' }}>Retour au site</a>
      </div>
    </div>
  );
}

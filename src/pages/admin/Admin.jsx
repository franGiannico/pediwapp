import { useCallback, useState } from 'react';
import { adminApi, getAdminToken, setAdminToken } from '../../api/client.js';
import coniferalLogo from '../../assets/coniferal-tienda-logo.png';
import Dashboard from './Dashboard.jsx';
import Prices from './Prices.jsx';

function AdminLogin({ onLogin }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!password) return;
    setError('');
    setLoading(true);
    try {
      const { token } = await adminApi.login(password);
      setAdminToken(token);
      onLogin();
    } catch (err) {
      setError(err.message || 'No se pudo ingresar');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-screen">
      <div className="login-card">
        <img className="login-logo" src={coniferalLogo} alt="Coniferal Tienda" />
        <h1>Administración</h1>
        <p>Ingresá la contraseña de administrador.</p>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            autoComplete="current-password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
          />
          <button type="submit" disabled={!password || loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        {error && <p className="error">{error}</p>}
      </div>
    </div>
  );
}

export default function Admin() {
  const [authed, setAuthed] = useState(() => Boolean(getAdminToken()));
  const [tab, setTab] = useState('dashboard');

  const logout = useCallback(() => {
    setAdminToken('');
    setAuthed(false);
  }, []);

  if (!authed) return <AdminLogin onLogin={() => setAuthed(true)} />;

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div className="brand-logo">
          <img src={coniferalLogo} alt="Coniferal Tienda" />
        </div>
        <span className="admin-title">Administración</span>
        <button type="button" className="admin-logout" onClick={logout}>
          Salir
        </button>
      </header>

      <nav className="admin-tabs" aria-label="Secciones">
        <button type="button" className={tab === 'dashboard' ? 'active' : ''} onClick={() => setTab('dashboard')}>
          Tablero
        </button>
        <button type="button" className={tab === 'prices' ? 'active' : ''} onClick={() => setTab('prices')}>
          Precios
        </button>
      </nav>

      <main className="admin-main">
        {tab === 'dashboard' ? <Dashboard onExpired={logout} /> : <Prices onExpired={logout} />}
      </main>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEmployee } from '../context/EmployeeContext.jsx';
import { api } from '../api/client.js';
import coniferalLogo from '../assets/coniferal-tienda-logo.png';

export default function Login() {
  const [legajo, setLegajo] = useState('');
  const [dni, setDni] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setEmployee } = useEmployee();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    const legajoTrim = legajo.trim();
    const dniTrim = dni.trim();
    if (!legajoTrim || !dniTrim) return;

    setError('');
    setLoading(true);
    try {
      const { employee } = await api.employeeLogin({ legajo: legajoTrim, dni: dniTrim });
      setEmployee(employee);
      navigate('/catalogo');
    } catch (err) {
      setError(err.message || 'No se pudo iniciar sesión');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-screen">
      <div className="login-card">
        <img className="login-logo" src={coniferalLogo} alt="Coniferal Tienda" />
        <h1>Pediwapp Coni</h1>
        <p>Ingresá tu número de legajo y tu DNI para empezar a armar tu pedido.</p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="off"
            placeholder="Número de legajo"
            value={legajo}
            onChange={(e) => setLegajo(e.target.value)}
            required
          />
          <input
            type="text"
            inputMode="numeric"
            autoComplete="off"
            placeholder="DNI (sin puntos)"
            value={dni}
            onChange={(e) => setDni(e.target.value)}
            required
          />
          <button type="submit" disabled={!legajo.trim() || !dni.trim() || loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        {error && <p className="error">{error}</p>}
      </div>
    </div>
  );
}

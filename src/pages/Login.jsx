import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';
import { useEmployee } from '../context/EmployeeContext.jsx';

export default function Login() {
  const [employees, setEmployees] = useState([]);
  const [selected, setSelected] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { setEmployee } = useEmployee();
  const navigate = useNavigate();

  useEffect(() => {
    api
      .getEmployees()
      .then((data) => setEmployees(data.employees || []))
      .catch(() => setError('No se pudo cargar la lista de empleados. Probá de nuevo en un momento.'))
      .finally(() => setLoading(false));
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    const emp = employees.find((e2) => e2._id === selected);
    if (!emp) return;
    setEmployee({ id: emp._id, name: emp.name, legajo: emp.legajo });
    navigate('/catalogo');
  }

  return (
    <div className="login-screen">
      <div className="login-card">
        <h1>Pedidos internos Coniferal</h1>
        <p>Elegí tu nombre para empezar a armar tu pedido.</p>

        {loading && <p className="empty-state">Cargando empleados...</p>}
        {error && <p className="error">{error}</p>}

        {!loading && !error && (
          <form onSubmit={handleSubmit}>
            <select value={selected} onChange={(e) => setSelected(e.target.value)} required>
              <option value="" disabled>
                Seleccioná tu nombre
              </option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.name}
                  {emp.legajo ? ` (${emp.legajo})` : ''}
                </option>
              ))}
            </select>
            <button type="submit" disabled={!selected}>
              Continuar
            </button>
          </form>
        )}

        {!loading && !error && employees.length === 0 && (
          <p className="empty-state">
            Todavía no hay empleados cargados. Pedile a un administrador que los agregue.
          </p>
        )}
      </div>
    </div>
  );
}

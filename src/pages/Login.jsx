import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEmployee } from '../context/EmployeeContext.jsx';
import coniferalLogo from '../assets/coniferal-tienda-logo.png';

export default function Login() {
  const [legajo, setLegajo] = useState('');
  const [dni, setDni] = useState('');
  const { setEmployee } = useEmployee();
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    const legajoTrim = legajo.trim();
    const dniTrim = dni.trim();
    if (!legajoTrim || !dniTrim) return;

    // Modo prueba: por ahora no se valida contra la base de empleados, cualquier
    // legajo/DNI deja entrar. Cuando se cargue la nómina real, este submit va a
    // llamar a un endpoint (ej. POST /api/employees/login) que valide legajo+dni
    // contra la tabla de empleados y devuelva el nombre real.
    setEmployee({ id: null, name: `Legajo ${legajoTrim}`, legajo: legajoTrim, dni: dniTrim });
    navigate('/catalogo');
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
          <button type="submit" disabled={!legajo.trim() || !dni.trim()}>
            Entrar
          </button>
        </form>

        <p className="test-mode-note">Modo prueba: por ahora cualquier legajo y DNI te deja entrar.</p>
      </div>
    </div>
  );
}

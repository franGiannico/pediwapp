import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEmployee } from '../context/EmployeeContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import coniferalLogo from '../assets/coniferal-tienda-logo.png';

export default function Header({ search, onSearchChange }) {
  const { employee, logout } = useEmployee();
  const { count } = useCart();
  const navigate = useNavigate();

  // Hace "rebotar" el botón del carrito cada vez que cambia la cantidad de
  // items, para que se note que algo se agregó (la primera carga no cuenta).
  const [bump, setBump] = useState(false);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setBump(true);
    const t = setTimeout(() => setBump(false), 400);
    return () => clearTimeout(t);
  }, [count]);

  return (
    <header className="app-header">
      <div className="app-header-top">
        <div className="brand-logo">
          <img src={coniferalLogo} alt="Coniferal Tienda" />
        </div>
        <button type="button" className="employee-badge" onClick={logout} title="Cambiar de empleado">
          {employee?.name}
        </button>
      </div>
      {onSearchChange && (
        <input
          className="search-bar"
          type="search"
          placeholder="Buscar productos..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      )}
      <button
        type="button"
        className={`cart-fab ${bump ? 'bump' : ''}`}
        onClick={() => navigate('/checkout')}
        aria-label="Ver carrito"
      >
        🛒
        {count > 0 && <span className="cart-badge">{count}</span>}
      </button>
    </header>
  );
}

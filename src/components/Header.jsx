import { useNavigate } from 'react-router-dom';
import { useEmployee } from '../context/EmployeeContext.jsx';
import { useCart } from '../context/CartContext.jsx';

export default function Header({ search, onSearchChange }) {
  const { employee, logout } = useEmployee();
  const { count } = useCart();
  const navigate = useNavigate();

  return (
    <header className="app-header">
      <div className="app-header-top">
        <div className="brand">Coniferal</div>
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
      <button type="button" className="cart-fab" onClick={() => navigate('/checkout')} aria-label="Ver carrito">
        🛒
        {count > 0 && <span className="cart-badge">{count}</span>}
      </button>
    </header>
  );
}

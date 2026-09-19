import { Navigate, Route, Routes } from 'react-router-dom';
import { useEmployee } from './context/EmployeeContext.jsx';
import Login from './pages/Login.jsx';
import Catalog from './pages/Catalog.jsx';
import Checkout from './pages/Checkout.jsx';

function RequireEmployee({ children }) {
  const { employee } = useEmployee();
  if (!employee) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route
        path="/catalogo"
        element={
          <RequireEmployee>
            <Catalog />
          </RequireEmployee>
        }
      />
      <Route
        path="/checkout"
        element={
          <RequireEmployee>
            <Checkout />
          </RequireEmployee>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

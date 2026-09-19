import { createContext, useContext, useEffect, useState } from 'react';

const EmployeeContext = createContext(null);
const STORAGE_KEY = 'Pediwapp_employee';

export function EmployeeProvider({ children }) {
  const [employee, setEmployeeState] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      if (employee) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(employee));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // localStorage no disponible (modo privado, etc.) - seguimos sin persistir
    }
  }, [employee]);

  const setEmployee = (emp) => setEmployeeState(emp);
  const logout = () => setEmployeeState(null);

  return (
    <EmployeeContext.Provider value={{ employee, setEmployee, logout }}>
      {children}
    </EmployeeContext.Provider>
  );
}

export function useEmployee() {
  const ctx = useContext(EmployeeContext);
  if (!ctx) throw new Error('useEmployee debe usarse dentro de <EmployeeProvider>');
  return ctx;
}

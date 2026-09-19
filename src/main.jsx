import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { EmployeeProvider } from './context/EmployeeContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <EmployeeProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </EmployeeProvider>
    </BrowserRouter>
  </React.StrictMode>
);

import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useEmployee } from '../context/EmployeeContext.jsx';
import { api } from '../api/client.js';

const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER;

// Recargo simple: 2.5% por cada mes de financiación (3 cuotas = 7.5%, 18 cuotas = 45%, etc).
const INTEREST_RATE_PER_MONTH = 0.025;
const INSTALLMENT_OPTIONS = [1, 3, 6, 9, 12, 18];

function computeInstallment(total, n) {
  if (n <= 1) {
    return { installments: 1, interestRate: 0, financingTotal: total, installmentAmount: total };
  }
  const interestRate = INTEREST_RATE_PER_MONTH * n;
  const financingTotal = total * (1 + interestRate);
  return { installments: n, interestRate, financingTotal, installmentAmount: financingTotal / n };
}

export default function Checkout() {
  const { items, total, updateQty, removeItem, clearCart } = useCart();
  const { employee } = useEmployee();
  const [notes, setNotes] = useState('');
  const [installments, setInstallments] = useState(1);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const plans = useMemo(() => INSTALLMENT_OPTIONS.map((n) => computeInstallment(total, n)), [total]);

  async function handleSendOrder() {
    if (!items.length || !WHATSAPP_NUMBER) return;
    setSending(true);
    setError('');
    try {
      const { whatsappMessage } = await api.createOrder({ employee, items, notes, installments });
      const encoded = encodeURIComponent(whatsappMessage);
      const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`;
      window.open(url, '_blank', 'noopener,noreferrer');
      clearCart();
      navigate('/catalogo');
    } catch (err) {
      setError(err.message || 'No se pudo enviar el pedido. Probá de nuevo.');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="checkout-screen">
      <header className="checkout-header">
        <button type="button" onClick={() => navigate('/catalogo')}>
          ← Seguir comprando
        </button>
        <h1>Tu pedido</h1>
      </header>

      {!items.length && <p className="empty-state">Tu carrito está vacío.</p>}

      <ul className="cart-list">
        {items.map((item) => (
          <li key={item.productId} className="cart-item">
            {item.imageUrl ? <img src={item.imageUrl} alt={item.name} /> : <div className="cart-item-noimg" />}
            <div className="cart-item-info">
              <span className="cart-item-name">{item.name}</span>
              <span className="cart-item-price">${item.price.toFixed(2)}</span>
            </div>
            <div className="qty-stepper">
              <button type="button" onClick={() => updateQty(item.productId, item.qty - 1)}>
                −
              </button>
              <span>{item.qty}</span>
              <button type="button" onClick={() => updateQty(item.productId, item.qty + 1)}>
                +
              </button>
            </div>
            <button
              type="button"
              className="remove-btn"
              onClick={() => removeItem(item.productId)}
              aria-label={`Quitar ${item.name}`}
            >
              🗑
            </button>
          </li>
        ))}
      </ul>

      {!!items.length && (
        <>
          <textarea
            placeholder="Notas para tu pedido (opcional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <div className="financing-section">
            <h2>Forma de pago</h2>
            <div className="financing-options">
              {plans.map((plan) => (
                <label
                  key={plan.installments}
                  className={`financing-option ${installments === plan.installments ? 'selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="installments"
                    value={plan.installments}
                    checked={installments === plan.installments}
                    onChange={() => setInstallments(plan.installments)}
                  />
                  <span className="financing-option-label">
                    {plan.installments === 1
                      ? 'Contado'
                      : `${plan.installments} cuotas de $${plan.installmentAmount.toFixed(2)}`}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="cart-total">Total: ${total.toFixed(2)}</div>
          {error && <p className="error">{error}</p>}
          {!WHATSAPP_NUMBER && <p className="error">Falta configurar VITE_WHATSAPP_NUMBER en el frontend.</p>}
          <button type="button" className="whatsapp-btn" onClick={handleSendOrder} disabled={sending}>
            {sending ? 'Enviando...' : 'Enviar pedido por WhatsApp'}
          </button>
        </>
      )}
    </div>
  );
}

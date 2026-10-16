import { useEffect, useState } from 'react';
import { adminApi } from '../../api/client.js';
import { formatMoney } from '../../utils/format.js';

const PERIODS = [
  { days: 7, label: '7 días' },
  { days: 30, label: '30 días' },
  { days: 90, label: '90 días' },
  { days: 0, label: 'Todo' },
];

const ROLE_LABEL = { empleado: 'Empleados', socio: 'Socios/as' };
const DELIVERY_LABEL = { sucursal: 'Retiro en punta de línea', domicilio: 'Envío a domicilio' };
const STATUS_LABEL = { pendiente: 'Pendientes', confirmado: 'Confirmados', entregado: 'Entregados', cancelado: 'Cancelados' };

function Kpi({ label, data }) {
  return (
    <div className="kpi">
      <span className="kpi-label">{label}</span>
      <span className="kpi-value">{data.count}</span>
      <span className="kpi-sub">{data.count === 1 ? 'pedido' : 'pedidos'} · ${formatMoney(data.amount)}</span>
    </div>
  );
}

function shortDate(iso) {
  const [, m, d] = iso.split('-');
  return `${d}/${m}`;
}

// Pedidos por día (últimos 30 días). Una sola serie, así que no lleva
// leyenda: el título dice qué es. Pasar el mouse (o tocar) una barra muestra
// el detalle del día; "Ver como tabla" muestra los mismos datos en texto.
function DailyChart({ daily }) {
  const [hover, setHover] = useState(null);
  const [asTable, setAsTable] = useState(false);
  const max = Math.max(1, ...daily.map((d) => d.count));
  const H = 150;
  const slot = 100 / daily.length;
  const active = hover !== null ? daily[hover] : null;

  return (
    <section className="admin-card">
      <div className="admin-card-head">
        <h2>Pedidos por día (últimos 30 días)</h2>
        <button type="button" className="link-btn" onClick={() => setAsTable((v) => !v)}>
          {asTable ? 'Ver gráfico' : 'Ver como tabla'}
        </button>
      </div>

      {asTable ? (
        <div className="table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Día</th>
                <th className="num">Pedidos</th>
                <th className="num">Total</th>
              </tr>
            </thead>
            <tbody>
              {[...daily].reverse().map((d) => (
                <tr key={d.date}>
                  <td>{shortDate(d.date)}</td>
                  <td className="num">{d.count}</td>
                  <td className="num">${formatMoney(d.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <>
          <p className="chart-readout" aria-live="polite">
            {active
              ? `${shortDate(active.date)} · ${active.count} ${active.count === 1 ? 'pedido' : 'pedidos'} · $${formatMoney(active.amount)}`
              : 'Pasá el mouse o tocá una barra para ver el detalle del día.'}
          </p>
          <svg className="bar-chart" viewBox={`0 0 100 ${H + 16}`} preserveAspectRatio="none" role="img" aria-label="Pedidos por día, últimos 30 días">
            {[0.5, 1].map((f) => (
              <line key={f} x1="0" x2="100" y1={H - H * f} y2={H - H * f} className="grid-line" />
            ))}
            {daily.map((d, i) => {
              const h = (d.count / max) * H;
              return (
                <g key={d.date} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} onClick={() => setHover(i)}>
                  <rect x={i * slot} y="0" width={slot} height={H} fill="transparent" />
                  {d.count > 0 && (
                    <rect
                      x={i * slot + slot * 0.18}
                      y={H - h}
                      width={slot * 0.64}
                      height={h}
                      rx="0.6"
                      className={hover === i ? 'bar bar-active' : 'bar'}
                    />
                  )}
                </g>
              );
            })}
            <line x1="0" x2="100" y1={H} y2={H} className="axis-line" />
          </svg>
          <div className="chart-axis">
            <span>{shortDate(daily[0].date)}</span>
            <span>máx. {max} por día</span>
            <span>{shortDate(daily[daily.length - 1].date)}</span>
          </div>
        </>
      )}
    </section>
  );
}

function Split({ title, rows, labels }) {
  const total = rows.reduce((s, r) => s + r.count, 0);
  return (
    <section className="admin-card">
      <h2>{title}</h2>
      {rows.length === 0 ? (
        <p className="muted">Sin datos en este período.</p>
      ) : (
        <ul className="split-list">
          {rows.map((r) => (
            <li key={r.key}>
              <span>{labels[r.key] || r.key}</span>
              <span className="split-num">
                {r.count} ({total ? Math.round((r.count / total) * 100) : 0}%)
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default function Dashboard({ onExpired }) {
  const [days, setDays] = useState(30);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    adminApi
      .stats(days)
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err.status === 401) onExpired();
        else setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [days, onExpired]);

  if (error) return <p className="admin-error">{error}</p>;
  if (!data) return <p className="muted">Cargando tablero...</p>;

  const k = data.kpis;
  const noOrders = k.all.count === 0;

  return (
    <div className={loading ? 'admin-loading' : ''}>
      <div className="kpi-row">
        <Kpi label="Hoy" data={k.today} />
        <Kpi label="Últimos 7 días" data={k.week} />
        <Kpi label="Últimos 30 días" data={k.month} />
        <Kpi label="Histórico" data={k.all} />
      </div>
      <p className="muted small">Los totales son en pesos de contado (sin el recargo de las cuotas). No incluyen pedidos cancelados.</p>

      {noOrders ? (
        <section className="admin-card">
          <p className="muted">Todavía no hay pedidos registrados.</p>
        </section>
      ) : (
        <>
          <DailyChart daily={data.daily} />

          <div className="period-bar">
            <span>Período para los rankings:</span>
            {PERIODS.map((p) => (
              <button key={p.days} type="button" className={days === p.days ? 'chip active' : 'chip'} onClick={() => setDays(p.days)}>
                {p.label}
              </button>
            ))}
          </div>

          <div className="admin-grid">
            <section className="admin-card">
              <h2>Productos más pedidos</h2>
              {data.topProducts.length === 0 ? (
                <p className="muted">Sin pedidos en este período.</p>
              ) : (
                <div className="table-scroll">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Producto</th>
                        <th className="num">Unid.</th>
                        <th className="num">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.topProducts.map((p) => (
                        <tr key={`${p.sku}-${p.name}`}>
                          <td>
                            {p.name}
                            {p.sku && <span className="sku"> · {p.sku}</span>}
                          </td>
                          <td className="num">{p.qty}</td>
                          <td className="num">${formatMoney(p.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <section className="admin-card">
              <h2>Quiénes más piden</h2>
              {data.topBuyers.length === 0 ? (
                <p className="muted">Sin pedidos en este período.</p>
              ) : (
                <div className="table-scroll">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Persona</th>
                        <th className="num">Pedidos</th>
                        <th className="num">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.topBuyers.map((b) => (
                        <tr key={`${b.name}-${b.role}`}>
                          <td>
                            {b.name}
                            {b.role === 'socio' && <span className="sku"> · Socio/a</span>}
                          </td>
                          <td className="num">{b.count}</td>
                          <td className="num">${formatMoney(b.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <Split title="Empleados y socios/as" rows={data.byRole.map((r) => ({ key: r.role, count: r.count }))} labels={ROLE_LABEL} />
            <Split title="Forma de entrega" rows={data.byDelivery.map((r) => ({ key: r.method, count: r.count }))} labels={DELIVERY_LABEL} />
            <Split title="Estado de los pedidos" rows={data.statuses.map((r) => ({ key: r.status, count: r.count }))} labels={STATUS_LABEL} />
          </div>
        </>
      )}
    </div>
  );
}

import { useCallback, useEffect, useRef, useState } from 'react';
import { adminApi } from '../../api/client.js';
import { formatMoney } from '../../utils/format.js';

function fmtDate(iso) {
  return new Date(iso).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' });
}

function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1] || '');
    reader.onerror = () => reject(new Error('No se pudo leer el archivo'));
    reader.readAsDataURL(file);
  });
}

function MissingList({ catalog }) {
  if (!catalog) return <p className="muted small">No se pudo consultar el catálogo de Tiendanube en este momento.</p>;
  if (catalog.count === 0) return <p className="ok-text">Todos los productos del catálogo tienen precio.</p>;
  return (
    <details className="missing">
      <summary>
        {catalog.count} {catalog.count === 1 ? 'producto de Tiendanube queda' : 'productos de Tiendanube quedan'} sin precio y oculto
        {catalog.count === 1 ? '' : 's'} en la app (de {catalog.catalogTotal})
      </summary>
      <ul>
        {catalog.sample.map((p) => (
          <li key={`${p.sku}-${p.name}`}>
            {p.name} <span className="sku">· SKU: {p.sku}</span>
          </li>
        ))}
        {catalog.count > catalog.sample.length && <li className="muted">…y {catalog.count - catalog.sample.length} más.</li>}
      </ul>
    </details>
  );
}

function Summary({ diff, applied }) {
  return (
    <div className="summary">
      <ul className="summary-grid">
        <li>
          <strong>{diff.rows}</strong> productos con precio en el Excel
        </li>
        <li>
          <strong>{diff.updated}</strong> cambian de precio
        </li>
        <li>
          <strong>{diff.created}</strong> nuevos
        </li>
        <li>
          <strong>{diff.unchanged}</strong> sin cambios
        </li>
        <li className={diff.removed ? 'warn' : ''}>
          <strong>{diff.removed}</strong> se quitan de la lista (no están en este Excel)
        </li>
      </ul>

      {diff.bigChangeCount > 0 && (
        <p className="admin-warning">
          Atención: {diff.bigChangeCount} {diff.bigChangeCount === 1 ? 'precio cambia' : 'precios cambian'} más de un 50%. Revisá la tabla de abajo antes de confirmar.
        </p>
      )}

      {diff.bigChanges.length > 0 && !applied && (
        <>
          <h3>Mayores cambios de precio</h3>
          <div className="table-scroll">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th className="num">Antes</th>
                  <th className="num">Ahora</th>
                  <th className="num">Variación</th>
                </tr>
              </thead>
              <tbody>
                {diff.bigChanges.map((c) => (
                  <tr key={c.sku}>
                    <td>
                      {c.name || c.sku}
                      <span className="sku"> · {c.sku}</span>
                    </td>
                    <td className="num">${formatMoney(c.from)}</td>
                    <td className="num">${formatMoney(c.to)}</td>
                    <td className={`num ${Math.abs(c.pct) > 50 ? 'warn-text' : ''}`}>
                      {c.pct > 0 ? '+' : ''}
                      {c.pct.toFixed(1).replace('.', ',')}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {diff.duplicateCount > 0 && (
        <details className="missing">
          <summary>
            {diff.duplicateCount} {diff.duplicateCount === 1 ? 'SKU repetido' : 'SKU repetidos'} en el Excel (se usó el primero de cada uno)
          </summary>
          <ul>
            {diff.duplicates.map((d) => (
              <li key={d.sku}>
                {d.sku}: se usó ${formatMoney(d.kept)}
                {d.differs ? ` (el otro tenía $${formatMoney(d.ignored)})` : ''}
              </li>
            ))}
          </ul>
        </details>
      )}

      {diff.invalidCount > 0 && (
        <details className="missing">
          <summary>
            {diff.invalidCount} {diff.invalidCount === 1 ? 'fila ignorada' : 'filas ignoradas'} por tener precio vacío o en 0
          </summary>
          <ul>
            {diff.invalid.map((r) => (
              <li key={`${r.row}-${r.sku}`}>
                Fila {r.row}: {r.name || r.sku} <span className="sku">· SKU: {r.sku}</span>
              </li>
            ))}
          </ul>
        </details>
      )}

      <MissingList catalog={diff.catalog} />
    </div>
  );
}

export default function Prices({ onExpired }) {
  const [status, setStatus] = useState(null);
  const [error, setError] = useState('');
  const [file, setFile] = useState(null); // { name, data }
  const [preview, setPreview] = useState(null);
  const [busy, setBusy] = useState(false);
  const [confirmShrink, setConfirmShrink] = useState(false);
  const [needsShrinkConfirm, setNeedsShrinkConfirm] = useState(false);
  const [done, setDone] = useState(null);
  const inputRef = useRef(null);

  const fail = useCallback(
    (err) => {
      if (err.status === 401) onExpired();
      else setError(err.message || 'Ocurrió un error');
    },
    [onExpired]
  );

  const loadStatus = useCallback(() => {
    adminApi.pricesStatus().then(setStatus).catch(fail);
  }, [fail]);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  function reset() {
    setFile(null);
    setPreview(null);
    setConfirmShrink(false);
    setNeedsShrinkConfirm(false);
    if (inputRef.current) inputRef.current.value = '';
  }

  async function handleFile(e) {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    setError('');
    setDone(null);
    setPreview(null);
    setNeedsShrinkConfirm(false);
    setConfirmShrink(false);
    setBusy(true);
    try {
      const data = await toBase64(f);
      setFile({ name: f.name, data });
      const res = await adminApi.pricesPreview({ fileName: f.name, data });
      setPreview(res.diff);
    } catch (err) {
      setFile(null);
      fail(err);
    } finally {
      setBusy(false);
    }
  }

  async function handleApply() {
    if (!file) return;
    setError('');
    setBusy(true);
    try {
      const res = await adminApi.pricesApply({ fileName: file.name, data: file.data, confirmShrink });
      setDone({ fileName: file.name, diff: res.diff });
      reset();
      loadStatus();
    } catch (err) {
      if (err.needsConfirm) setNeedsShrinkConfirm(true);
      fail(err);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <section className="admin-card">
        <h2>Lista de precios</h2>
        {!status ? (
          <p className="muted">Cargando...</p>
        ) : status.count === 0 ? (
          <p className="admin-warning">
            Todavía no se cargó ningún Excel. Mientras tanto la app usa los precios que ya venía calculando desde Tiendanube.
          </p>
        ) : (
          <>
            <p>
              <strong>{status.count}</strong> productos con precio.
              {status.lastUpload && (
                <>
                  {' '}
                  Última carga: {fmtDate(status.lastUpload.createdAt)} ({status.lastUpload.fileName || 'sin nombre'}).
                </>
              )}
            </p>
            <MissingList catalog={status.catalog} />
          </>
        )}
      </section>

      <section className="admin-card">
        <h2>Actualizar precios desde un Excel</h2>
        <p className="muted small">
          El Excel tiene que tener las columnas <strong>SKU</strong> y <strong>Precio</strong> (se usa esa, no “Precio Meli”). Se compara con la lista actual y
          podés revisar los cambios antes de confirmar. Las demás columnas (costos, stock, etc.) no se guardan.
        </p>
        <input ref={inputRef} type="file" accept=".xlsx" onChange={handleFile} disabled={busy} />

        {busy && <p className="muted">Procesando...</p>}
        {error && <p className="admin-error">{error}</p>}

        {preview && (
          <>
            <h3>Resumen de “{file && file.name}”</h3>
            <Summary diff={preview} />
            {needsShrinkConfirm && (
              <label className="confirm-row">
                <input type="checkbox" checked={confirmShrink} onChange={(e) => setConfirmShrink(e.target.checked)} />
                El archivo trae bastantes menos productos que la lista actual y es correcto.
              </label>
            )}
            <div className="admin-actions">
              <button type="button" className="admin-primary" onClick={handleApply} disabled={busy || (needsShrinkConfirm && !confirmShrink)}>
                Confirmar y actualizar precios
              </button>
              <button type="button" className="admin-secondary" onClick={reset} disabled={busy}>
                Cancelar
              </button>
            </div>
          </>
        )}

        {done && (
          <div className="admin-success">
            <strong>Precios actualizados</strong> con “{done.fileName}”: {done.diff.updated} cambiaron, {done.diff.created} nuevos, {done.diff.removed} quitados. Ya se ven en la app.
          </div>
        )}
      </section>
    </div>
  );
}

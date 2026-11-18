// Formato de moneda argentino: punto para miles, coma para decimales
// (ej: $1.000.000,00). Se usa en toda la app para que los importes se vean
// siempre igual, sin importar el navegador o el idioma del sistema del usuario.
export function formatMoney(amount) {
  const value = Number(amount) || 0;
  return value.toLocaleString('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// Stock para mostrar en la app. stock = número, o null/undefined si el
// producto no tiene control de stock (en ese caso no se muestra nada).
// Devuelve { soldOut, low, label }.
export const LOW_STOCK_THRESHOLD = 5;

export function stockInfo(stock) {
  if (stock === null || stock === undefined || !Number.isFinite(Number(stock))) {
    return { soldOut: false, low: false, label: '' };
  }
  const n = Number(stock);
  if (n <= 0) return { soldOut: true, low: false, label: 'Sin stock' };
  if (n <= LOW_STOCK_THRESHOLD) return { soldOut: false, low: true, label: n === 1 ? 'Queda 1' : `Quedan ${n}` };
  return { soldOut: false, low: false, label: '' };
}

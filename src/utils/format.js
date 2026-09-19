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

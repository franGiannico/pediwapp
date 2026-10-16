const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Error ${res.status}`);
  }

  return res.json();
}

// --- Administración (/admin) ---
// El token de admin se guarda solo mientras la pestaña esté abierta (sessionStorage).
const ADMIN_TOKEN_KEY = 'pediwapp_admin_token';

export function getAdminToken() {
  try {
    return sessionStorage.getItem(ADMIN_TOKEN_KEY) || '';
  } catch {
    return '';
  }
}

export function setAdminToken(token) {
  try {
    if (token) sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
    else sessionStorage.removeItem(ADMIN_TOKEN_KEY);
  } catch {
    // sin sessionStorage: la sesión dura solo hasta recargar
  }
}

async function adminRequest(path, options = {}) {
  const token = getAdminToken();
  const res = await fetch(`${API_URL}/admin${path}`, {
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    ...options,
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(body.error || `Error ${res.status}`);
    err.status = res.status;
    err.needsConfirm = body.needsConfirm;
    throw err;
  }
  return body;
}

export const adminApi = {
  login: (password) => adminRequest('/login', { method: 'POST', body: JSON.stringify({ password }) }),
  stats: (days) => adminRequest(`/stats?days=${days}`),
  pricesStatus: () => adminRequest('/prices/status'),
  pricesPreview: (payload) => adminRequest('/prices/preview', { method: 'POST', body: JSON.stringify(payload) }),
  pricesApply: (payload) => adminRequest('/prices/apply', { method: 'POST', body: JSON.stringify(payload) }),
};

export const api = {
  getProducts: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/products${qs ? `?${qs}` : ''}`);
  },
  getCategories: () => request('/products/categories'),
  getProduct: (id) => request(`/products/${id}`),
  employeeLogin: (payload) => request('/employees/login', { method: 'POST', body: JSON.stringify(payload) }),
  createOrder: (payload) => request('/orders', { method: 'POST', body: JSON.stringify(payload) }),
};

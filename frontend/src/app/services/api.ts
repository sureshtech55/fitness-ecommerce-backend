const API_BASE = 'http://localhost:3000';

function getToken(): string | null {
  return localStorage.getItem('auth_token');
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || `Request failed with status ${res.status}`);
  }

  return data;
}

// ── Product API ──────────────────────────────────────────
export const productApi = {
  getAll: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<any>(`/api/products${query}`);
  },
  getById: (id: string) => request<any>(`/api/products/${id}`),
  getBySlug: (slug: string) => request<any>(`/api/products/slug/${slug}`),
  getBestSellers: (limit = 8) =>
    request<any>(`/api/products/bestsellers?limit=${limit}`),
  getNewlyLaunched: (limit = 8) =>
    request<any>(`/api/products/newlylaunched?limit=${limit}`),
  getMegaOffers: (limit = 8) =>
    request<any>(`/api/products/megaoffers?limit=${limit}`),
  getByCategory: (categoryId: string, params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<any>(`/api/products/category/${categoryId}${query}`);
  },
  getRelated: (id: string, limit = 4) =>
    request<any>(`/api/products/${id}/related?limit=${limit}`),
  search: (q: string, limit = 10) =>
    request<any>(`/api/products/search?q=${encodeURIComponent(q)}&limit=${limit}`),
};

// ── Category API ─────────────────────────────────────────
export const categoryApi = {
  getAll: () => request<any>('/api/categories'),
  getActive: () => request<any>('/api/categories/active'),
  getById: (id: string) => request<any>(`/api/categories/${id}`),
  getBySlug: (slug: string) => request<any>(`/api/categories/slug/${slug}`),
};

// ── User / Auth API ──────────────────────────────────────
export const userApi = {
  login: (email: string, password?: string) =>
    request<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  register: (name: string, email: string, password?: string) =>
    request<any>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),
  sendOtp: (identifier: string, channel: 'email' | 'whatsapp' | 'sms') =>
    request<any>('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ identifier, channel }),
    }),
  verifyOtp: (identifier: string, otp: string) =>
    request<any>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ identifier, otp }),
    }),
  getProfile: (id: string) => request<any>(`/api/users/${id}`),
  updateProfile: (id: string, data: { name?: string; email?: string; phone?: string }) =>
    request<any>(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  changePassword: (id: string, newPassword: string) =>
    request<any>(`/api/users/${id}/password`, {
      method: 'PATCH',
      body: JSON.stringify({ newPassword }),
    }),
  // Address management
  addAddress: (id: string, data: any) =>
    request<any>(`/api/users/${id}/addressess`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateAddress: (id: string, addressId: string, data: any) =>
    request<any>(`/api/users/${id}/addressess/${addressId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteAddress: (id: string, addressId: string) =>
    request<any>(`/api/users/${id}/addressess/${addressId}`, { method: 'DELETE' }),
};

// ── Cart API ─────────────────────────────────────────────
export const cartApi = {
  get: () => request<any>('/api/cart'),
  add: (productId: string, quantity = 1) =>
    request<any>('/api/cart/add', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    }),
  remove: (productId: string) =>
    request<any>(`/api/cart/remove/${productId}`, { method: 'DELETE' }),
  clear: () => request<any>('/api/cart/clear', { method: 'DELETE' }),
};

// ── Wishlist API ─────────────────────────────────────────
export const wishlistApi = {
  get: () => request<any>('/api/wishlist'),
  add: (productId: string) =>
    request<any>('/api/wishlist', {
      method: 'POST',
      body: JSON.stringify({ productId }),
    }),
  remove: (productId: string) =>
    request<any>(`/api/wishlist/${productId}`, { method: 'DELETE' }),
  clear: () => request<any>('/api/wishlist', { method: 'DELETE' }),
};

// ── Order API ────────────────────────────────────────────
export const orderApi = {
  create: (orderData: any) =>
    request<any>('/api/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    }),
  getAll: () => request<any>('/api/orders'),
  getMyOrders: () => request<any>('/api/orders/my-orders'),
  getById: (id: string) => request<any>(`/api/orders/${id}`),
  cancel: (id: string) =>
    request<any>(`/api/orders/${id}/cancel`, { method: 'PATCH' }),
};

// ── Newsletter API ────────────────────────────────────────
export const newsletterApi = {
  subscribe: (email: string) =>
    request<any>('/api/newsletter/subscribe', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),
};


import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'remaz_mobile_token';
const API_URL_KEY = 'remaz_mobile_api_url';
const fallbackApiUrl = Platform.OS === 'android'
  ? 'http://10.0.2.2:8000/api'
  : 'http://127.0.0.1:8000/api';
export const API_URL = (process.env.EXPO_PUBLIC_API_URL || fallbackApiUrl).replace(/\/$/, '');

export type Customer = {
  id: number;
  name: string;
  email: string;
  cpf: string;
  nickname: string;
};

export type Inventory = {
  id: number;
  medicine_id: number;
  name: string;
  description: string;
  image: string;
  category: string;
  tarja: string;
  requires_prescription: boolean;
  pharmacy: { id: number; name: string; logo: string };
  stock: number;
  price: string;
  effective_price: string;
  promotion: { active: boolean; title: string; description: string };
};

export type CartItem = {
  id: number;
  quantity: number;
  subtotal: string;
  inventory: Inventory;
};

export type Cart = {
  items: CartItem[];
  total: string;
  requires_prescription: boolean;
};

export type CatalogCategory = {
  id: number;
  name: string;
};

export type Address = {
  id: number;
  label: string;
  recipient_name: string;
  phone: string;
  cep: string;
  state: string;
  city: string;
  neighborhood: string;
  street: string;
  number: string;
  complement: string;
  is_default: boolean;
  summary: string;
};

export type Order = {
  id: number;
  pharmacy: string;
  status: string;
  status_label: string;
  total: string;
  delivery_method: string;
  payment_method: string;
  requires_prescription: boolean;
  prescription_status: string;
  created_at: string;
  items: { name: string; quantity: number; price: string; subtotal: string }[];
  payment: null | {
    method: string;
    status: string;
    amount: string;
    qr_code: string;
    qr_code_base64: string;
    payment_url: string;
    error_message: string;
  };
};

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function storedToken() {
  if (Platform.OS === 'web') {
    return globalThis.localStorage?.getItem(TOKEN_KEY) ?? null;
  }
  return SecureStore.getItemAsync(TOKEN_KEY);
}

async function storedApiUrl() {
  if (Platform.OS === 'web') {
    return globalThis.localStorage?.getItem(API_URL_KEY) ?? null;
  }
  return SecureStore.getItemAsync(API_URL_KEY);
}

export function normalizeApiUrl(value: string) {
  const trimmed = value.trim().replace(/\/+$/, '');
  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    throw new ApiError('Informe uma URL valida para o servidor.', 0);
  }
  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new ApiError('Utilize uma URL HTTP ou HTTPS.', 0);
  }
  return `${trimmed}${/\/api$/i.test(trimmed) ? '' : '/api'}`;
}

export async function getApiUrl() {
  return (await storedApiUrl()) || API_URL;
}

async function saveApiUrl(url: string | null) {
  if (Platform.OS === 'web') {
    if (url) {
      globalThis.localStorage?.setItem(API_URL_KEY, url);
    } else {
      globalThis.localStorage?.removeItem(API_URL_KEY);
    }
    return;
  }
  if (url) {
    await SecureStore.setItemAsync(API_URL_KEY, url);
  } else {
    await SecureStore.deleteItemAsync(API_URL_KEY);
  }
}

export async function saveToken(token: string | null) {
  if (Platform.OS === 'web') {
    if (token) {
      globalThis.localStorage?.setItem(TOKEN_KEY, token);
    } else {
      globalThis.localStorage?.removeItem(TOKEN_KEY);
    }
    return;
  }
  if (token) {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  } else {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  authenticated = true,
  overrideApiUrl?: string,
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('Accept', 'application/json');
  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  if (authenticated) {
    const token = await storedToken();
    if (!token) {
      throw new ApiError('Entre para continuar.', 401);
    }
    headers.set('Authorization', `Bearer ${token}`);
  }

  let response: Response;
  try {
    const apiUrl = overrideApiUrl || await getApiUrl();
    response = await fetch(`${apiUrl}${path}`, { ...options, headers });
  } catch {
    throw new ApiError('Nao foi possivel acessar o servidor Remaz.', 0);
  }
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401 && authenticated) {
      await saveToken(null);
    }
    throw new ApiError(body.error || 'Erro ao processar solicitacao.', response.status);
  }
  return body as T;
}

export const api = {
  currentUrl: () => getApiUrl(),
  testAndUseUrl: async (value: string) => {
    const url = normalizeApiUrl(value);
    const result = await request<{ status: string; database: string }>('/health/', {}, false, url);
    await saveApiUrl(url);
    return { ...result, url };
  },
  health: () => request<{ status: string; database: string }>('/health/', {}, false),
  login: async (identifier: string, password: string) => {
    const result = await request<{ token: string; user: Customer }>(
      '/auth/login/',
      { method: 'POST', body: JSON.stringify({ identifier, password }) },
      false,
    );
    await saveToken(result.token);
    return result.user;
  },
  register: async (name: string, cpf: string, email: string, password: string) => {
    const result = await request<{ token: string; user: Customer }>(
      '/auth/register/',
      { method: 'POST', body: JSON.stringify({ name, cpf, email, password }) },
      false,
    );
    await saveToken(result.token);
    return result.user;
  },
  me: () => request<{ user: Customer }>('/me/'),
  logout: async () => {
    try {
      await request('/auth/logout/', { method: 'POST' });
    } finally {
      await saveToken(null);
    }
  },
  catalog: (query = '', categoryId?: number, tarja?: string) => {
    const params = [`q=${encodeURIComponent(query)}`];
    if (categoryId) {
      params.push(`category=${categoryId}`);
    }
    if (tarja) {
      params.push(`tarja=${encodeURIComponent(tarja)}`);
    }
    return request<{ results: Inventory[]; categories: CatalogCategory[] }>(`/catalog/?${params.join('&')}`);
  },
  cart: () => request<Cart>('/cart/'),
  addToCart: (inventoryId: number) => request<Cart>('/cart/items/', {
    method: 'POST',
    body: JSON.stringify({ inventory_id: inventoryId }),
  }),
  updateCartItem: (itemId: number, quantity: number) => request<Cart>(`/cart/items/${itemId}/`, {
    method: 'PATCH',
    body: JSON.stringify({ quantity }),
  }),
  removeCartItem: (itemId: number) => request<Cart>(`/cart/items/${itemId}/`, { method: 'DELETE' }),
  addresses: () => request<{ addresses: Address[] }>('/addresses/'),
  addAddress: (address: Omit<Address, 'id' | 'summary'>) => request<{ address: Address }>('/addresses/', {
    method: 'POST',
    body: JSON.stringify(address),
  }),
  setDefaultAddress: (addressId: number) => request<{ address: Address }>(`/addresses/${addressId}/`, {
    method: 'PATCH',
    body: JSON.stringify({ is_default: true }),
  }),
  deleteAddress: (addressId: number) => request(`/addresses/${addressId}/`, { method: 'DELETE' }),
  checkout: (formData: FormData) => request<{ orders: Order[] }>('/checkout/', {
    method: 'POST',
    body: formData,
  }),
  orders: () => request<{ orders: Order[] }>('/orders/'),
};

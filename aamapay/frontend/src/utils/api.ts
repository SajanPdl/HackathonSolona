const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface RequestOptions {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
  token?: string;
}

export async function apiRequest<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, headers = {}, token } = options;

  const authHeaders: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
  
  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  };

  const response = await fetch(`${API_URL}${endpoint}`, config);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
}

export const api = {
  auth: {
    register: (data: any) => apiRequest('/api/auth/register', { method: 'POST', body: data }),
    login: (data: any) => apiRequest('/api/auth/login', { method: 'POST', body: data }),
    me: (token: string) => apiRequest('/api/auth/me', { token }),
  },
  transactions: {
    create: (data: any, token: string) => apiRequest('/api/transactions', { method: 'POST', body: data, token }),
    get: (id: string, token: string) => apiRequest(`/api/transactions/${id}`, { token }),
    list: (params?: string, token?: string) => apiRequest(`/api/transactions?${params || ''}`, { token }),
  },
  claims: {
    verify: (data: any) => apiRequest('/api/claims/verify', { method: 'POST', body: data }),
    redeem: (data: any, token: string) => apiRequest('/api/claims/redeem', { method: 'POST', body: data, token }),
  },
  agents: {
    register: (data: any) => apiRequest('/api/agents/register', { method: 'POST', body: data }),
    login: (data: any) => apiRequest('/api/agents/login', { method: 'POST', body: data }),
    me: (token: string) => apiRequest('/api/agents/me', { token }),
    nearby: (params: string) => apiRequest(`/api/agents/nearby?${params}`),
    get: (id: string, token: string) => apiRequest(`/api/agents/${id}`, { token }),
  },
};
const API_BASE = '/api';

export interface AuthUser {
  userId: string;
  email: string;
  fullName: string;
  role: string;
  estateId?: string;
  estateName: string;
  token: string;
}

export const getAuthToken = (): string | null => {
  return localStorage.getItem('te_auth_token');
};

export const setAuthSession = (auth: AuthUser) => {
  localStorage.setItem('te_auth_token', auth.token);
  localStorage.setItem('te_user', JSON.stringify(auth));
};

export const getStoredUser = (): AuthUser | null => {
  const data = localStorage.getItem('te_user');
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
};

export const clearAuthSession = () => {
  localStorage.removeItem('te_auth_token');
  localStorage.removeItem('te_user');
};

async function fetchWithAuth<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = `HTTP Error ${response.status}`;
    try {
      const err = await response.json();
      if (err.message) errorMsg = err.message;
    } catch {
      // ignore
    }
    throw new Error(errorMsg);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export const api = {
  // Auth
  login: (email: string, password: string) =>
    fetchWithAuth<AuthUser>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  // Fields
  getFields: () => fetchWithAuth<any[]>('/fields'),
  createField: (data: { code: string; name: string; areaHectares: number; divisionId?: string; notes?: string }) =>
    fetchWithAuth<any>('/fields', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Pluckers
  getPluckers: () => fetchWithAuth<any[]>('/pluckers'),
  createPlucker: (data: { employeeCode: string; fullName: string; divisionId?: string }) =>
    fetchWithAuth<any>('/pluckers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Field Weights
  getFieldWeights: (params?: { fieldId?: string; date?: string; month?: number; year?: number }) => {
    const search = new URLSearchParams();
    if (params?.fieldId) search.append('fieldId', params.fieldId);
    if (params?.date) search.append('date', params.date);
    if (params?.month) search.append('month', params.month.toString());
    if (params?.year) search.append('year', params.year.toString());
    const query = search.toString() ? `?${search.toString()}` : '';
    return fetchWithAuth<any[]>(`/field-weights${query}`);
  },

  recordFieldWeight: (data: { fieldId: string; weightDate: string; weightKg: number; session?: string; notes?: string }) =>
    fetchWithAuth<any>('/field-weights', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getMtdSummary: (fieldId: string, cutoffDate?: string) => {
    const query = cutoffDate ? `?fieldId=${fieldId}&cutoffDate=${cutoffDate}` : `?fieldId=${fieldId}`;
    return fetchWithAuth<any>(`/field-weights/summary${query}`);
  },

  // Plucker Intakes
  getPluckerIntakes: (params?: { pluckerId?: string; fieldId?: string; date?: string }) => {
    const search = new URLSearchParams();
    if (params?.pluckerId) search.append('pluckerId', params.pluckerId);
    if (params?.fieldId) search.append('fieldId', params.fieldId);
    if (params?.date) search.append('date', params.date);
    const query = search.toString() ? `?${search.toString()}` : '';
    return fetchWithAuth<any[]>(`/plucker-intakes${query}`);
  },

  recordPluckerIntake: (data: { fieldId: string; pluckerId: string; intakeDate: string; weightKg: number; session?: string; notes?: string }) =>
    fetchWithAuth<any>('/plucker-intakes', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Reconciliation
  getReconciliation: (date?: string, fieldId?: string) => {
    const search = new URLSearchParams();
    if (date) search.append('date', date);
    if (fieldId) search.append('fieldId', fieldId);
    const query = search.toString() ? `?${search.toString()}` : '';
    return fetchWithAuth<any[]>(`/reconciliation${query}`);
  },
};

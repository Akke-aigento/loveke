// SellQo Storefront API Client

const SELLQO_API_BASE = import.meta.env.VITE_SELLQO_API_URL || 'https://sellqo.app.supabase.co/functions/v1/storefront-api';
const SELLQO_TENANT_ID = import.meta.env.VITE_SELLQO_TENANT_ID || 'loveke';
const SELLQO_API_KEY = import.meta.env.VITE_SELLQO_API_KEY || '';

let currentLocale = 'nl';

export function setSellqoLocale(locale: string) {
  currentLocale = locale;
}

export function getSellqoLocale(): string {
  return currentLocale;
}

export async function sellqoFetch<T = unknown>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${SELLQO_API_BASE}${endpoint}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Tenant-ID': SELLQO_TENANT_ID,
    'Accept-Language': currentLocale,
  };

  if (SELLQO_API_KEY) {
    headers['X-API-Key'] = SELLQO_API_KEY;
  }

  const res = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: `HTTP ${res.status}` }));
    throw new Error(error.message || `SellQo API error: ${res.status}`);
  }

  return res.json();
}

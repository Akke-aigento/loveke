// SellQo Storefront API Client - routes through proxy edge function

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://ncumndxdxjscghiytxsl.supabase.co';
const SELLQO_PROXY_BASE = `${SUPABASE_URL}/functions/v1/sellqo-proxy`;
const SELLQO_TENANT_ID = import.meta.env.VITE_SELLQO_TENANT_ID || 'loveke';

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
  const url = `${SELLQO_PROXY_BASE}${endpoint}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Tenant-ID': SELLQO_TENANT_ID,
    'Accept-Language': currentLocale,
    'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '',
  };

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

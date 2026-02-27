// SellQo Storefront API Client - routes through proxy edge function
// The API key is stored server-side and added by the proxy

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

/**
 * Safely extract an array from an API response that might be:
 * - An array directly
 * - { data: { products: [...] } } (SellQo paginated)
 * - { data: [...] } 
 * - An error object
 * - undefined/null
 */
export function extractArray<T>(response: unknown): T[] {
  if (Array.isArray(response)) return response;
  if (response && typeof response === 'object') {
    const r = response as Record<string, unknown>;
    // SellQo nested: { data: { products: [...] } }
    if (r.data && typeof r.data === 'object' && !Array.isArray(r.data)) {
      const inner = r.data as Record<string, unknown>;
      if (Array.isArray(inner.products)) return inner.products as T[];
      if (Array.isArray(inner.items)) return inner.items as T[];
      if (Array.isArray(inner.data)) return inner.data as T[];
    }
    if (Array.isArray(r.data)) return r.data as T[];
    if (Array.isArray(r.products)) return r.products as T[];
    if (Array.isArray(r.items)) return r.items as T[];
    if (Array.isArray(r.results)) return r.results as T[];
  }
  return [];
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
    console.error(`SellQo API error (${res.status}):`, error);
    throw new Error(error.message || error.error || `SellQo API error: ${res.status}`);
  }

  return res.json();
}

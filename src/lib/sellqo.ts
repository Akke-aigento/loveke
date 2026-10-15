const SELLQO_API_BASE = import.meta.env.VITE_SELLQO_API_URL || 'https://sellqo.app.supabase.co/functions/v1/storefront-api';
const SELLQO_TENANT_ID = import.meta.env.VITE_SELLQO_TENANT_ID || 'loveke';

let currentLocale = 'nl';

export function setSellqoLocale(locale: string) {
  currentLocale = locale;
}

export async function sellqoFetch<T = unknown>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${SELLQO_API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-Tenant-ID': SELLQO_TENANT_ID,
      'Accept-Language': currentLocale,
      ...options?.headers,
    },
  });
  if (!res.ok) throw new Error(`SellQo API error: ${res.status}`);
  return res.json();
}

// Type definitions for SellQo data
export interface Product {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: number;
  compare_at_price?: number;
  currency: string;
  images: string[];
  variants: ProductVariant[];
  collection?: string;
  tags?: string[];
  stock_status: 'in_stock' | 'low_stock' | 'out_of_stock';
}

export interface ProductVariant {
  id: string;
  title: string;
  size?: string;
  color?: string;
  price: number;
  stock_status: 'in_stock' | 'low_stock' | 'out_of_stock';
}

export interface Collection {
  id: string;
  slug: string;
  title: string;
  description?: string;
  image?: string;
}

export interface CartItem {
  id: string;
  product_id: string;
  variant_id: string;
  title: string;
  variant_title: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Cart {
  id: string;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  discount_code?: string;
}

export interface GiftCard {
  id: string;
  amount: number;
  currency: string;
}

// API service functions
export const sellqoAPI = {
  // Products
  getProducts: (params?: string) => sellqoFetch<{ products: Product[] }>(`/products${params ? `?${params}` : ''}`),
  getProduct: (slug: string) => sellqoFetch<{ product: Product }>(`/products/${slug}`),
  
  // Collections
  getCollections: () => sellqoFetch<{ collections: Collection[] }>('/collections'),
  getCollection: (slug: string) => sellqoFetch<{ collection: Collection; products: Product[] }>(`/collections/${slug}`),
  
  // Cart
  getCart: () => sellqoFetch<{ cart: Cart }>('/cart'),
  addToCart: (product_id: string, variant_id: string, quantity: number) =>
    sellqoFetch<{ cart: Cart }>('/cart', { method: 'POST', body: JSON.stringify({ product_id, variant_id, quantity }) }),
  updateCartItem: (item_id: string, quantity: number) =>
    sellqoFetch<{ cart: Cart }>(`/cart/items/${item_id}`, { method: 'PATCH', body: JSON.stringify({ quantity }) }),
  removeCartItem: (item_id: string) =>
    sellqoFetch<{ cart: Cart }>(`/cart/items/${item_id}`, { method: 'DELETE' }),
  applyDiscount: (code: string) =>
    sellqoFetch<{ cart: Cart }>('/cart/discount', { method: 'POST', body: JSON.stringify({ code }) }),
  
  // Checkout
  createCheckout: () => sellqoFetch<{ checkout_url: string }>('/checkout', { method: 'POST' }),
  
  // Gift Cards
  getGiftCards: () => sellqoFetch<{ gift_cards: GiftCard[] }>('/gift-cards'),
  purchaseGiftCard: (amount: number, recipient_email?: string) =>
    sellqoFetch('/gift-cards/purchase', { method: 'POST', body: JSON.stringify({ amount, recipient_email }) }),
  checkBalance: (code: string) =>
    sellqoFetch<{ balance: number }>('/gift-cards/balance', { method: 'POST', body: JSON.stringify({ code }) }),
  
  // Newsletter
  subscribe: (email: string, locale: string) =>
    sellqoFetch('/newsletter/subscribe', { method: 'POST', body: JSON.stringify({ email, locale }) }),
};

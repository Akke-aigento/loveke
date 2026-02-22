const SELLQO_API_BASE = import.meta.env.VITE_SELLQO_API_URL || 'https://api.sellqo.com/storefront/v1';
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

// Mock data for development (used when SellQo API is not available)
export const MOCK_PRODUCTS: Product[] = [
  {
    id: '1', slug: 'loveke-classic-tee', title: 'Loveke Classic Tee', description: 'De originele Loveke tee. 100% biologisch katoen, gedrukt met liefde in België.',
    price: 39.95, currency: 'EUR', images: [], collection: 'featured',
    variants: [
      { id: 'v1', title: 'S', size: 'S', price: 39.95, stock_status: 'in_stock' },
      { id: 'v2', title: 'M', size: 'M', price: 39.95, stock_status: 'in_stock' },
      { id: 'v3', title: 'L', size: 'L', price: 39.95, stock_status: 'in_stock' },
      { id: 'v4', title: 'XL', size: 'XL', price: 39.95, stock_status: 'low_stock' },
    ],
    tags: ['tee', 'classic'], stock_status: 'in_stock',
  },
  {
    id: '2', slug: 'loveke-hoodie-bratislava', title: 'Bratislava Hoodie', description: 'Oversized hoodie met het Bratislava verhaal. Warm, zacht, en vol liefde.',
    price: 69.95, currency: 'EUR', images: [], collection: 'featured',
    variants: [
      { id: 'v5', title: 'M', size: 'M', price: 69.95, stock_status: 'in_stock' },
      { id: 'v6', title: 'L', size: 'L', price: 69.95, stock_status: 'in_stock' },
      { id: 'v7', title: 'XL', size: 'XL', price: 69.95, stock_status: 'in_stock' },
    ],
    tags: ['hoodie'], stock_status: 'in_stock',
  },
  {
    id: '3', slug: 'loveke-sweater-kyiv', title: 'Kyiv Sunset Sweater', description: 'Geïnspireerd door de zonsondergangen boven de Dnjepr. Unisex fit.',
    price: 59.95, currency: 'EUR', images: [], collection: 'featured',
    variants: [
      { id: 'v8', title: 'S', size: 'S', price: 59.95, stock_status: 'in_stock' },
      { id: 'v9', title: 'M', size: 'M', price: 59.95, stock_status: 'in_stock' },
      { id: 'v10', title: 'L', size: 'L', price: 59.95, stock_status: 'in_stock' },
    ],
    tags: ['sweater'], stock_status: 'in_stock',
  },
  {
    id: '4', slug: 'loveke-cap-heart', title: 'Heart Cap', description: 'Geborduurde Loveke pet met hartje. Verstelbaar.',
    price: 29.95, currency: 'EUR', images: [], collection: 'accessories',
    variants: [
      { id: 'v11', title: 'One Size', size: 'One Size', price: 29.95, stock_status: 'in_stock' },
    ],
    tags: ['cap', 'accessory'], stock_status: 'in_stock',
  },
  {
    id: '5', slug: 'loveke-for-two-bundle', title: 'Loveke for Two Bundle', description: 'Twee classic tees voor jou en je Loveke. Bespaar 10%!',
    price: 71.90, compare_at_price: 79.90, currency: 'EUR', images: [], collection: 'loveke-for-two',
    variants: [
      { id: 'v12', title: 'S+S', size: 'S+S', price: 71.90, stock_status: 'in_stock' },
      { id: 'v13', title: 'M+M', size: 'M+M', price: 71.90, stock_status: 'in_stock' },
      { id: 'v14', title: 'L+L', size: 'L+L', price: 71.90, stock_status: 'in_stock' },
      { id: 'v15', title: 'M+L', size: 'M+L', price: 71.90, stock_status: 'in_stock' },
    ],
    tags: ['bundle', 'couples'], stock_status: 'in_stock',
  },
  {
    id: '6', slug: 'loveke-tote-bag', title: 'Loveke Tote Bag', description: 'Canvas draagtas met Loveke print. Perfect voor boodschappen of het strand.',
    price: 24.95, currency: 'EUR', images: [], collection: 'accessories',
    variants: [
      { id: 'v16', title: 'One Size', size: 'One Size', price: 24.95, stock_status: 'in_stock' },
    ],
    tags: ['bag', 'accessory'], stock_status: 'in_stock',
  },
];

export const MOCK_COLLECTIONS: Collection[] = [
  { id: 'c1', slug: 'featured', title: 'Fresh Drops 🔥' },
  { id: 'c2', slug: 'loveke-for-two', title: 'Loveke for Two 💕' },
  { id: 'c3', slug: 'accessories', title: 'Accessoires' },
  { id: 'c4', slug: 'all', title: 'Alles' },
];

import { sellqoFetch } from './client';
import type {
  Product, Collection, Category, Cart, CheckoutSession,
  GiftCard, Page, NavigationMenu, Review, ReviewsSummary,
  StorefrontSettings, PaginatedResponse, ProductsParams
} from './types';

// === PRODUCTS ===
export const productsAPI = {
  getAll: (params?: ProductsParams) => {
    const searchParams = new URLSearchParams();
    if (params?.collection) searchParams.set('collection', params.collection);
    if (params?.category) searchParams.set('category', params.category);
    if (params?.category_slug) searchParams.set('category_slug', params.category_slug);
    if (params?.search) searchParams.set('search', params.search);
    if (params?.sort) searchParams.set('sort', params.sort);
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.per_page) searchParams.set('per_page', String(params.per_page));
    if (params?.in_stock) searchParams.set('in_stock', 'true');
    if (params?.tags?.length) searchParams.set('tags', params.tags.join(','));
    const qs = searchParams.toString();
    return sellqoFetch<PaginatedResponse<Product>>(`/products${qs ? `?${qs}` : ''}`);
  },

  getBySlug: (slug: string) =>
    sellqoFetch<Product>(`/products/${slug}`),

  getRelated: (slug: string, limit = 4) =>
    sellqoFetch<Product[]>(`/products/${slug}/related?limit=${limit}`),

  search: (query: string, limit = 10) =>
    sellqoFetch<Product[]>(`/products/search?q=${encodeURIComponent(query)}&limit=${limit}`),
};

// === COLLECTIONS & CATEGORIES ===
export const collectionsAPI = {
  getAll: () =>
    sellqoFetch<Collection[]>('/collections'),

  getBySlug: (slug: string) =>
    sellqoFetch<Collection>(`/collections/${slug}`),

  getProducts: (slug: string, params?: ProductsParams) => {
    const searchParams = new URLSearchParams();
    if (params?.sort) searchParams.set('sort', params.sort);
    if (params?.page) searchParams.set('page', String(params.page));
    const qs = searchParams.toString();
    return sellqoFetch<PaginatedResponse<Product>>(`/collections/${slug}/products${qs ? `?${qs}` : ''}`);
  },
};

export const categoriesAPI = {
  getAll: () =>
    sellqoFetch<Category[]>('/categories'),

  getBySlug: (slug: string) =>
    sellqoFetch<Category>(`/categories/${slug}`),
};

// === CART ===
export const cartAPI = {
  create: () =>
    sellqoFetch<Cart>('/cart', { method: 'POST' }),

  get: (cartId: string) =>
    sellqoFetch<Cart>(`/cart/${cartId}`),

  addItem: (cartId: string, item: { product_id: string; variant_id?: string; quantity: number; amount?: number; gift_card_metadata?: Record<string, unknown> }) => {
    const body: Record<string, unknown> = { product_id: item.product_id, quantity: item.quantity };
    if (item.variant_id) body.variant_id = item.variant_id;
    if (item.amount != null) body.amount = item.amount;
    if (item.gift_card_metadata) body.gift_card_metadata = item.gift_card_metadata;
    return sellqoFetch<Cart>(`/cart/${cartId}/items`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  updateItem: (cartId: string, itemId: string, quantity: number) =>
    sellqoFetch<Cart>(`/cart/${cartId}/items/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    }),

  removeItem: (cartId: string, itemId: string) =>
    sellqoFetch<Cart>(`/cart/${cartId}/items/${itemId}`, { method: 'DELETE' }),

  applyDiscount: (cartId: string, code: string) =>
    sellqoFetch<Cart>(`/cart/${cartId}/discount`, {
      method: 'POST',
      body: JSON.stringify({ code }),
    }),

  removeDiscount: (cartId: string) =>
    sellqoFetch<Cart>(`/cart/${cartId}/discount`, { method: 'DELETE' }),

  clear: (cartId: string) =>
    sellqoFetch<Cart>(`/cart/${cartId}`, { method: 'DELETE' }),
};

// === CHECKOUT ===
export const checkoutAPI = {
  create: (cartId: string, options?: {
    success_url?: string;
    cancel_url?: string;
    customer_email?: string;
  }) =>
    sellqoFetch<CheckoutSession>('/checkout', {
      method: 'POST',
      body: JSON.stringify({ cart_id: cartId, ...options }),
    }),
};

// === GIFT CARDS ===
export const giftCardsAPI = {
  getAll: () =>
    sellqoFetch<GiftCard[]>('/gift-cards'),

  purchase: (amount: number, recipient_email?: string, message?: string) =>
    sellqoFetch<GiftCard>('/gift-cards/purchase', {
      method: 'POST',
      body: JSON.stringify({ amount, recipient_email, message }),
    }),

  checkBalance: (code: string) =>
    sellqoFetch<{ balance: number; currency: string }>('/gift-cards/balance', {
      method: 'POST',
      body: JSON.stringify({ code }),
    }),

  redeem: (cartId: string, code: string) =>
    sellqoFetch<Cart>(`/cart/${cartId}/gift-card`, {
      method: 'POST',
      body: JSON.stringify({ code }),
    }),
};

// === PAGES ===
export const pagesAPI = {
  getAll: () =>
    sellqoFetch<Page[]>('/pages'),

  getBySlug: (slug: string) =>
    sellqoFetch<Page>(`/pages/${slug}`),

  getLegal: () =>
    sellqoFetch<Page[]>('/pages?type=legal'),
};

// === NAVIGATION ===
export const navigationAPI = {
  get: () =>
    sellqoFetch<NavigationMenu>('/navigation'),
};

// === REVIEWS ===
export const reviewsAPI = {
  getAll: (params?: { page?: number; per_page?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.per_page) searchParams.set('per_page', String(params.per_page));
    const qs = searchParams.toString();
    return sellqoFetch<PaginatedResponse<Review>>(`/reviews${qs ? `?${qs}` : ''}`);
  },

  getByProduct: (productSlug: string) =>
    sellqoFetch<{ reviews: Review[]; summary: ReviewsSummary }>(`/products/${productSlug}/reviews`),

  getSummary: () =>
    sellqoFetch<ReviewsSummary>('/reviews/summary'),
};

// === NEWSLETTER ===
export const newsletterAPI = {
  subscribe: (email: string, locale?: string) =>
    sellqoFetch<{ success: boolean; message: string }>('/newsletter/subscribe', {
      method: 'POST',
      body: JSON.stringify({ email, locale }),
    }),
};

// === SETTINGS ===
export const settingsAPI = {
  getAll: () =>
    sellqoFetch<StorefrontSettings>('/settings'),

  getSocial: () =>
    sellqoFetch<StorefrontSettings['social']>('/settings/social'),

  getTrust: () =>
    sellqoFetch<StorefrontSettings['trust']>('/settings/trust'),

  getConversion: () =>
    sellqoFetch<StorefrontSettings['conversion']>('/settings/conversion'),

  getTracking: () =>
    sellqoFetch<StorefrontSettings['tracking']>('/settings/tracking'),

  getCheckout: () =>
    sellqoFetch<StorefrontSettings['checkout']>('/settings/checkout'),

  getLanguages: () =>
    sellqoFetch<StorefrontSettings['languages']>('/settings/languages'),
};

// === SEARCH ===
export const searchAPI = {
  global: (query: string) =>
    sellqoFetch<{
      products: Product[];
      collections: Collection[];
      pages: Page[];
    }>(`/search?q=${encodeURIComponent(query)}`),
};

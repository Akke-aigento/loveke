import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  productsAPI, collectionsAPI, categoriesAPI, cartAPI, checkoutAPI,
  giftCardsAPI, pagesAPI, navigationAPI, reviewsAPI, newsletterAPI,
  settingsAPI, searchAPI
} from './api';
import { extractSingle } from './client';
import type { Cart, ProductsParams } from './types';

// === QUERY KEYS ===
export const sellqoKeys = {
  products: {
    all: ['sellqo', 'products'] as const,
    list: (params?: ProductsParams) => ['sellqo', 'products', 'list', params] as const,
    detail: (slug: string) => ['sellqo', 'products', 'detail', slug] as const,
    related: (slug: string) => ['sellqo', 'products', 'related', slug] as const,
    search: (query: string) => ['sellqo', 'products', 'search', query] as const,
  },
  collections: {
    all: ['sellqo', 'collections'] as const,
    detail: (slug: string) => ['sellqo', 'collections', 'detail', slug] as const,
    products: (slug: string, params?: ProductsParams) => ['sellqo', 'collections', 'products', slug, params] as const,
  },
  categories: {
    all: ['sellqo', 'categories'] as const,
    detail: (slug: string) => ['sellqo', 'categories', 'detail', slug] as const,
  },
  cart: (cartId: string) => ['sellqo', 'cart', cartId] as const,
  giftCards: ['sellqo', 'gift-cards'] as const,
  pages: {
    all: ['sellqo', 'pages'] as const,
    detail: (slug: string) => ['sellqo', 'pages', 'detail', slug] as const,
    legal: ['sellqo', 'pages', 'legal'] as const,
  },
  navigation: ['sellqo', 'navigation'] as const,
  reviews: {
    all: ['sellqo', 'reviews'] as const,
    byProduct: (slug: string) => ['sellqo', 'reviews', 'product', slug] as const,
    summary: ['sellqo', 'reviews', 'summary'] as const,
  },
  settings: {
    all: ['sellqo', 'settings'] as const,
    social: ['sellqo', 'settings', 'social'] as const,
    trust: ['sellqo', 'settings', 'trust'] as const,
    conversion: ['sellqo', 'settings', 'conversion'] as const,
    languages: ['sellqo', 'settings', 'languages'] as const,
  },
  search: (query: string) => ['sellqo', 'search', query] as const,
};

// === PRODUCT HOOKS ===
export function useProducts(params?: ProductsParams) {
  return useQuery({
    queryKey: sellqoKeys.products.list(params),
    queryFn: () => productsAPI.getAll(params),
    staleTime: 1000 * 60 * 2,
  });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: sellqoKeys.products.detail(slug),
    queryFn: () => productsAPI.getBySlug(slug),
    enabled: !!slug,
  });
}

export function useRelatedProducts(slug: string) {
  return useQuery({
    queryKey: sellqoKeys.products.related(slug),
    queryFn: () => productsAPI.getRelated(slug),
    enabled: !!slug,
  });
}

export function useProductSearch(query: string) {
  return useQuery({
    queryKey: sellqoKeys.products.search(query),
    queryFn: () => productsAPI.search(query),
    enabled: query.length >= 2,
    staleTime: 1000 * 30,
  });
}

// === COLLECTION HOOKS ===
export function useCollections() {
  return useQuery({
    queryKey: sellqoKeys.collections.all,
    queryFn: collectionsAPI.getAll,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCollection(slug: string) {
  return useQuery({
    queryKey: sellqoKeys.collections.detail(slug),
    queryFn: () => collectionsAPI.getBySlug(slug),
    enabled: !!slug,
  });
}

export function useCollectionProducts(slug: string, params?: ProductsParams) {
  return useQuery({
    queryKey: sellqoKeys.collections.products(slug, params),
    queryFn: () => collectionsAPI.getProducts(slug, params),
    enabled: !!slug,
  });
}

// === CATEGORY HOOKS ===
export function useCategories() {
  return useQuery({
    queryKey: sellqoKeys.categories.all,
    queryFn: categoriesAPI.getAll,
    staleTime: 1000 * 60 * 5,
  });
}

// === CART HOOKS ===
const CART_STORAGE_KEY = 'sellqo_cart_id';

function getStoredCartId(): string | null {
  try {
    return localStorage.getItem(CART_STORAGE_KEY);
  } catch {
    return null;
  }
}

function storeCartId(cartId: string) {
  try {
    localStorage.setItem(CART_STORAGE_KEY, cartId);
  } catch {
    // localStorage not available
  }
}

export function useCartQuery() {
  const cartId = getStoredCartId();
  return useQuery({
    queryKey: sellqoKeys.cart(cartId || ''),
    queryFn: () => cartAPI.get(cartId!),
    enabled: !!cartId,
    staleTime: 1000 * 30,
  });
}

export function useCreateCart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const result = await cartAPI.create();
      return extractSingle<Cart>(result) || result;
    },
    onSuccess: (cart) => {
      storeCartId(cart.id);
      queryClient.setQueryData(sellqoKeys.cart(cart.id), cart);
    },
  });
}

export function useAddToCart() {
  const queryClient = useQueryClient();
  const createCart = useCreateCart();

  return useMutation({
    mutationFn: async (item: { product_id: string; variant_id?: string; quantity: number }) => {
      let activeCartId = getStoredCartId();
      if (!activeCartId) {
        const newCart = await createCart.mutateAsync();
        activeCartId = newCart.id;
      }
      const result = await cartAPI.addItem(activeCartId, item);
      return extractSingle<Cart>(result) || result;
    },
    onSuccess: (cart) => {
      queryClient.setQueryData(sellqoKeys.cart(cart.id), cart);
    },
  });
}

export function useUpdateCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string; quantity: number }) => {
      const cartId = getStoredCartId();
      if (!cartId) throw new Error('No cart found');
      const result = await cartAPI.updateItem(cartId, itemId, quantity);
      return extractSingle<Cart>(result) || result;
    },
    onSuccess: (cart) => {
      queryClient.setQueryData(sellqoKeys.cart(cart.id), cart);
    },
  });
}

export function useRemoveCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: string) => {
      const cartId = getStoredCartId();
      if (!cartId) throw new Error('No cart found');
      const result = await cartAPI.removeItem(cartId, itemId);
      return extractSingle<Cart>(result) || result;
    },
    onSuccess: (cart) => {
      queryClient.setQueryData(sellqoKeys.cart(cart.id), cart);
    },
  });
}

export function useApplyDiscount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (code: string) => {
      const cartId = getStoredCartId();
      if (!cartId) throw new Error('No cart found');
      const result = await cartAPI.applyDiscount(cartId, code);
      return extractSingle<Cart>(result) || result;
    },
    onSuccess: (cart) => {
      queryClient.setQueryData(sellqoKeys.cart(cart.id), cart);
    },
  });
}

// === CHECKOUT HOOKS ===
export function useCreateCheckout() {
  return useMutation({
    mutationFn: (options?: { success_url?: string; cancel_url?: string; customer_email?: string }) => {
      const cartId = getStoredCartId();
      if (!cartId) throw new Error('No cart found');
      return checkoutAPI.create(cartId, options);
    },
    onSuccess: (session) => {
      if (session.checkout_url) {
        window.location.href = session.checkout_url;
      }
    },
  });
}

// === GIFT CARD HOOKS ===
export function useGiftCards() {
  return useQuery({
    queryKey: sellqoKeys.giftCards,
    queryFn: giftCardsAPI.getAll,
  });
}

export function usePurchaseGiftCard() {
  return useMutation({
    mutationFn: ({ amount, email, message }: { amount: number; email?: string; message?: string }) =>
      giftCardsAPI.purchase(amount, email, message),
  });
}

export function useCheckGiftCardBalance() {
  return useMutation({
    mutationFn: (code: string) => giftCardsAPI.checkBalance(code),
  });
}

// === PAGE HOOKS ===
export function usePages() {
  return useQuery({
    queryKey: sellqoKeys.pages.all,
    queryFn: pagesAPI.getAll,
    staleTime: 1000 * 60 * 10,
  });
}

export function usePage(slug: string) {
  return useQuery({
    queryKey: sellqoKeys.pages.detail(slug),
    queryFn: () => pagesAPI.getBySlug(slug),
    enabled: !!slug,
    staleTime: 1000 * 60 * 10,
  });
}

export function useLegalPages() {
  return useQuery({
    queryKey: sellqoKeys.pages.legal,
    queryFn: pagesAPI.getLegal,
    staleTime: 1000 * 60 * 30,
  });
}

// === NAVIGATION HOOKS ===
export function useNavigation() {
  return useQuery({
    queryKey: sellqoKeys.navigation,
    queryFn: navigationAPI.get,
    staleTime: 1000 * 60 * 10,
  });
}

// === REVIEW HOOKS ===
export function useReviews(params?: { page?: number; per_page?: number }) {
  return useQuery({
    queryKey: sellqoKeys.reviews.all,
    queryFn: () => reviewsAPI.getAll(params),
  });
}

export function useProductReviews(productSlug: string) {
  return useQuery({
    queryKey: sellqoKeys.reviews.byProduct(productSlug),
    queryFn: () => reviewsAPI.getByProduct(productSlug),
    enabled: !!productSlug,
  });
}

export function useReviewsSummary() {
  return useQuery({
    queryKey: sellqoKeys.reviews.summary,
    queryFn: reviewsAPI.getSummary,
    staleTime: 1000 * 60 * 10,
  });
}

// === NEWSLETTER HOOKS ===
export function useNewsletterSubscribe() {
  return useMutation({
    mutationFn: ({ email, locale }: { email: string; locale?: string }) =>
      newsletterAPI.subscribe(email, locale),
  });
}

// === SETTINGS HOOKS ===
export function useStorefrontSettings() {
  return useQuery({
    queryKey: sellqoKeys.settings.all,
    queryFn: settingsAPI.getAll,
    staleTime: 1000 * 60 * 15,
  });
}

export function useSocialLinks() {
  return useQuery({
    queryKey: sellqoKeys.settings.social,
    queryFn: settingsAPI.getSocial,
    staleTime: 1000 * 60 * 30,
  });
}

export function useTrustSettings() {
  return useQuery({
    queryKey: sellqoKeys.settings.trust,
    queryFn: settingsAPI.getTrust,
    staleTime: 1000 * 60 * 30,
  });
}

export function useConversionSettings() {
  return useQuery({
    queryKey: sellqoKeys.settings.conversion,
    queryFn: settingsAPI.getConversion,
    staleTime: 1000 * 60 * 10,
  });
}

export function useLanguages() {
  return useQuery({
    queryKey: sellqoKeys.settings.languages,
    queryFn: settingsAPI.getLanguages,
    staleTime: 1000 * 60 * 30,
  });
}

// === SEARCH HOOKS ===
export function useGlobalSearch(query: string) {
  return useQuery({
    queryKey: sellqoKeys.search(query),
    queryFn: () => searchAPI.global(query),
    enabled: query.length >= 2,
    staleTime: 1000 * 60,
  });
}

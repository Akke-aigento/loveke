import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  productsAPI, collectionsAPI, categoriesAPI, cartAPI, checkoutAPI,
  giftCardsAPI, pagesAPI, navigationAPI, reviewsAPI, newsletterAPI,
  settingsAPI, searchAPI
} from './api';
import { extractSingle } from './client';
import { normalizeCart } from './normalizer';
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
  });
}

// === COLLECTION HOOKS ===
export function useCollections() {
  return useQuery({
    queryKey: sellqoKeys.collections.all,
    queryFn: collectionsAPI.getAll,
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
  });
}

// === CART HOOKS ===
const CART_STORAGE_KEY = 'sellqo_cart_id';

function isValidCartId(id: string | null): id is string {
  if (!id || id === 'undefined' || id === 'null' || id.trim() === '') return false;
  return true;
}

function getStoredCartId(): string | null {
  try {
    const id = localStorage.getItem(CART_STORAGE_KEY);
    if (!isValidCartId(id)) {
      // Clean up invalid stored value
      if (id !== null) localStorage.removeItem(CART_STORAGE_KEY);
      return null;
    }
    return id;
  } catch {
    return null;
  }
}

function storeCartId(cartId: string) {
  if (!isValidCartId(cartId)) return;
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
    queryFn: async () => {
      const result = await cartAPI.get(cartId!);
      const raw = extractSingle<Cart>(result) || result;
      return normalizeCart(raw);
    },
    enabled: !!cartId,
  });
}

export function useCreateCart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const result = await cartAPI.create();
      const raw = extractSingle<Cart>(result) || result;
      return normalizeCart(raw);
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
    mutationFn: async (item: { product_id: string; variant_id?: string; quantity: number; amount?: number; gift_card_metadata?: Record<string, unknown> }) => {
      let activeCartId = getStoredCartId();
      if (!activeCartId) {
        const newCart = await createCart.mutateAsync();
        activeCartId = newCart.id;
      }
      const result = await cartAPI.addItem(activeCartId, item);
      const raw = extractSingle<Cart>(result) || result;
      return normalizeCart(raw);
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
      const raw = extractSingle<Cart>(result) || result;
      return normalizeCart(raw);
    },
    onMutate: async ({ itemId, quantity }) => {
      const cartId = getStoredCartId();
      if (!cartId) return;
      await queryClient.cancelQueries({ queryKey: sellqoKeys.cart(cartId) });
      const previousCart = queryClient.getQueryData<Cart>(sellqoKeys.cart(cartId));
      if (previousCart) {
        queryClient.setQueryData<Cart>(sellqoKeys.cart(cartId), {
          ...previousCart,
          items: previousCart.items.map(item =>
            item.id === itemId ? { ...item, quantity } : item
          ),
          item_count: previousCart.items.reduce((sum, item) =>
            sum + (item.id === itemId ? quantity : item.quantity), 0
          ),
        });
      }
      return { previousCart, cartId };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousCart && context.cartId) {
        queryClient.setQueryData(sellqoKeys.cart(context.cartId), context.previousCart);
      }
    },
    onSuccess: (cart) => {
      queryClient.setQueryData(sellqoKeys.cart(cart.id), cart);
    },
    onSettled: () => {
      const cartId = getStoredCartId();
      if (cartId) queryClient.invalidateQueries({ queryKey: sellqoKeys.cart(cartId) });
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
      const raw = extractSingle<Cart>(result) || result;
      return normalizeCart(raw);
    },
    onMutate: async (itemId) => {
      const cartId = getStoredCartId();
      if (!cartId) return;
      await queryClient.cancelQueries({ queryKey: sellqoKeys.cart(cartId) });
      const previousCart = queryClient.getQueryData<Cart>(sellqoKeys.cart(cartId));
      if (previousCart) {
        const newItems = previousCart.items.filter(item => item.id !== itemId);
        queryClient.setQueryData<Cart>(sellqoKeys.cart(cartId), {
          ...previousCart,
          items: newItems,
          item_count: newItems.reduce((sum, item) => sum + item.quantity, 0),
          subtotal: newItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
        });
      }
      return { previousCart, cartId };
    },
    onError: (_err, _itemId, context) => {
      if (context?.previousCart && context.cartId) {
        queryClient.setQueryData(sellqoKeys.cart(context.cartId), context.previousCart);
      }
    },
    onSuccess: (cart) => {
      queryClient.setQueryData(sellqoKeys.cart(cart.id), cart);
    },
    onSettled: () => {
      const cartId = getStoredCartId();
      if (cartId) queryClient.invalidateQueries({ queryKey: sellqoKeys.cart(cartId) });
    },
  });
}

export function useApplyDiscount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (code: string) => {
      const cartId = getStoredCartId();
      if (!cartId) throw new Error('No cart found');
      const result = code
        ? await cartAPI.applyDiscount(cartId, code)
        : await cartAPI.removeDiscount(cartId);
      const raw = extractSingle<Cart>(result) || result;
      return normalizeCart(raw);
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
    onSuccess: (response: any) => {
      const url =
        response?.data?.checkout_url ||
        response?.checkout_url ||
        (typeof response === 'string' ? response : null);
      if (url) {
        window.location.href = url;
      } else {
        console.error('Checkout response missing checkout_url:', response);
        import('sonner').then(({ toast }) =>
          toast.error('Checkout kon niet gestart worden. Probeer opnieuw.')
        );
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
  });
}

export function usePage(slug: string) {
  return useQuery({
    queryKey: sellqoKeys.pages.detail(slug),
    queryFn: () => pagesAPI.getBySlug(slug),
    enabled: !!slug,
  });
}

export function useLegalPages() {
  return useQuery({
    queryKey: sellqoKeys.pages.legal,
    queryFn: pagesAPI.getLegal,
  });
}

// === NAVIGATION HOOKS ===
export function useNavigation() {
  return useQuery({
    queryKey: sellqoKeys.navigation,
    queryFn: navigationAPI.get,
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

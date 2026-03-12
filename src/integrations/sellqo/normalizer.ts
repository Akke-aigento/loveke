/**
 * Normalizes raw SellQo API responses to match the frontend types.
 */

import type { Product, ProductImage, ProductVariant, Collection, Cart, CartItem } from './types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function normalizeProduct(raw: any): Product {
  if (!raw) return raw;

  console.log('SellQo raw product:', JSON.stringify(raw, null, 2));

  // Normalize images: API returns string[] or single image field, frontend expects ProductImage[]
  let rawImages = raw.images || [];
  // Related products return { image: "url" } instead of images[]
  if ((!Array.isArray(rawImages) || rawImages.length === 0) && raw.image) {
    rawImages = [raw.image];
  }
  const images: ProductImage[] = (Array.isArray(rawImages) ? rawImages : []).map(
    (img: string | ProductImage, i: number) => {
      if (typeof img === 'string') {
        return { id: `img-${i}`, url: img, alt: raw.name || raw.title || '', position: i };
      }
      return img; // Already in correct format
    }
  );

  // Normalize variants
  const rawVariants = raw.variants || [];
  const variants: ProductVariant[] = rawVariants.map((v: any) => ({
    id: v.id,
    title: v.title || '',
    sku: v.sku || undefined,
    price: v.price ?? raw.price ?? 0,
    compare_at_price: v.compare_at_price || undefined,
    stock_status: (v.in_stock === false && v.stock !== null && v.stock !== undefined && v.stock <= 0) ? 'out_of_stock' : (v.stock != null && v.stock > 0 && v.stock <= 3 ? 'low_stock' : 'in_stock'),
    stock_quantity: v.stock ?? undefined,
    options: v.attribute_values || {},
    image: v.image_url ? { id: v.id, url: v.image_url, alt: v.title, position: 0 } : undefined,
  }));

  // Don't create artificial default variants — products without real variants
  // should be added to cart without variant_id

  // Determine stock_status: if in_stock=false but stock is null/undefined, treat as available (stock not tracked)
  const stockStatus = (raw.in_stock === false && raw.stock !== null && raw.stock !== undefined && raw.stock <= 0)
    ? 'out_of_stock'
    : (raw.stock != null && raw.stock > 0 && raw.stock <= 3 ? 'low_stock' : 'in_stock');

  return {
    id: raw.id,
    slug: raw.slug || raw.handle || '',
    title: raw.name || raw.title || raw.product_name || 'Untitled',
    description: raw.description || '',
    short_description: raw.short_description || undefined,
    price: raw.price ?? 0,
    compare_at_price: raw.compare_at_price || undefined,
    currency: raw.currency || 'EUR',
    images,
    variants,
    collection: raw.category?.slug || raw.collection || undefined,
    collections: raw.collections || undefined,
    category: raw.category || undefined,
    tags: raw.tags || [],
    stock_status: stockStatus as Product['stock_status'],
    stock_quantity: raw.stock ?? undefined,
    sku: raw.sku || undefined,
    barcode: raw.barcode || undefined,
    weight: raw.weight || undefined,
    seo: raw.seo || undefined,
    related_products: raw.related_products?.map?.((rp: any) => rp.slug || rp.id || rp) || undefined,
    created_at: raw.created_at || '',
    updated_at: raw.updated_at || '',
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function normalizeCollection(raw: any): Collection {
  return {
    id: raw.id,
    slug: raw.slug || '',
    title: raw.name || raw.title || 'Untitled',
    description: raw.description || undefined,
    image: raw.image_url || raw.image || undefined,
    product_count: raw.product_count ?? undefined,
  };
}

/**
 * Normalize an array of products from API response
 */
export function normalizeProducts(rawProducts: any[]): Product[] {
  return (rawProducts || []).map(normalizeProduct);
}

/**
 * Normalize an array of collections from API response
 */
export function normalizeCollections(rawCollections: any[]): Collection[] {
  return (rawCollections || []).map(normalizeCollection);
}

// === CART NORMALIZATION ===

/**
 * Normalize a single cart item from API format to frontend CartItem format.
 * API returns: { id, product_id, variant_id, unit_price, quantity, line_total, product: { name, image }, variant: { title } | null }
 * Frontend expects: { id, product_id, variant_id, title, variant_title, price, quantity, image }
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function normalizeCartItem(raw: any): CartItem {
  if (!raw) return raw;

  // Already normalized (has 'price' and 'title' as direct fields with correct types)
  if (typeof raw.price === 'number' && typeof raw.title === 'string' && !raw.unit_price && !raw.product) {
    return raw;
  }

  return {
    id: raw.id || '',
    product_id: raw.product_id || raw.product?.id || '',
    variant_id: raw.variant_id || raw.variant?.id || '',
    title: raw.title || raw.product?.name || raw.product?.title || 'Product',
    variant_title: raw.variant_title || raw.variant?.title || '',
    price: raw.price ?? raw.unit_price ?? raw.line_total ?? 0,
    quantity: raw.quantity ?? 1,
    image: raw.image || raw.product?.image || raw.product?.images?.[0] || undefined,
    max_quantity: raw.max_quantity ?? undefined,
  };
}

/**
 * Normalize the full cart object from API format.
 * Ensures items are normalized and top-level fields have safe defaults.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function normalizeCart(raw: any): Cart {
  if (!raw) return raw;

  const items = (raw.items || []).map(normalizeCartItem);
  const itemCount = raw.item_count ?? items.reduce((sum: number, i: CartItem) => sum + i.quantity, 0);
  const subtotal = raw.subtotal ?? items.reduce((sum: number, i: CartItem) => sum + i.price * i.quantity, 0);

  return {
    id: raw.id || '',
    items,
    item_count: itemCount,
    subtotal,
    shipping: raw.shipping ?? 0,
    discount: raw.discount ?? 0,
    tax: raw.tax ?? 0,
    total: raw.total ?? subtotal,
    currency: raw.currency || 'EUR',
    discount_code: raw.discount_code ?? undefined,
    free_shipping_eligible: raw.free_shipping_eligible ?? undefined,
    free_shipping_remaining: raw.free_shipping_remaining ?? undefined,
  };
}

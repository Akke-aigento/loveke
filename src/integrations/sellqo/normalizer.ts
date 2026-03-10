/**
 * Normalizes raw SellQo API responses to match the frontend Product/Collection types.
 * 
 * API returns: name, images as string[], in_stock as boolean, variants with in_stock boolean
 * Frontend expects: title, images as {id,url,alt,position}[], stock_status enum, variants with stock_status
 */

import type { Product, ProductImage, ProductVariant, Collection } from './types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function normalizeProduct(raw: any): Product {
  if (!raw) return raw;

  console.log('SellQo raw product:', JSON.stringify(raw, null, 2));

  // Normalize images: API returns string[], frontend expects ProductImage[]
  const rawImages = raw.images || [];
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
    stock_status: v.in_stock === false ? 'out_of_stock' : (v.stock != null && v.stock > 0 && v.stock <= 3 ? 'low_stock' : 'in_stock'),
    stock_quantity: v.stock ?? undefined,
    options: v.attribute_values || {},
    image: v.image_url ? { id: v.id, url: v.image_url, alt: v.title, position: 0 } : undefined,
  }));

  // If no variants, create a default one
  if (variants.length === 0) {
    variants.push({
      id: raw.id || 'default',
      title: 'Default',
      price: raw.price ?? 0,
      stock_status: raw.in_stock === false ? 'out_of_stock' : 'in_stock',
      options: {},
    });
  }

  // Determine stock_status from in_stock boolean
  const stockStatus = raw.in_stock === false ? 'out_of_stock'
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

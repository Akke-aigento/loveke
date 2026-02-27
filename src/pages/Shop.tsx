import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useProducts, useCollections } from '@/integrations/sellqo/hooks';
import { extractArray } from '@/integrations/sellqo/client';
import { MOCK_PRODUCTS, MOCK_COLLECTIONS } from '@/lib/sellqo';
import type { Product } from '@/integrations/sellqo/types';
import ProductCard from '@/components/ProductCard';
import { motion } from 'framer-motion';

export default function Shop() {
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCollection = searchParams.get('collection') || 'all';
  const [sort, setSort] = useState('newest');

  const sortParam = sort === 'price-asc' ? 'price_asc' : sort === 'price-desc' ? 'price_desc' : 'newest';

  const { data: productsData, isLoading: productsLoading, isError: productsError } = useProducts({
    collection: activeCollection !== 'all' ? activeCollection : undefined,
    sort: sortParam as 'newest' | 'price_asc' | 'price_desc',
  });

  const { data: collectionsData, isError: collectionsError } = useCollections();

  // Safely extract products with fallback
  const products: Product[] = useMemo(() => {
    if (!productsError) {
      const apiProducts = extractArray<Product>(productsData);
      if (apiProducts.length > 0) return apiProducts;
    }
    // Fallback to mock data
    let filtered = activeCollection === 'all'
      ? MOCK_PRODUCTS
      : MOCK_PRODUCTS.filter(p => p.collection === activeCollection);
    if (sort === 'price-asc') filtered = [...filtered].sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') filtered = [...filtered].sort((a, b) => b.price - a.price);
    return filtered as unknown as Product[];
  }, [productsData, productsError, activeCollection, sort]);

  // Safely extract collections with fallback
  const collections = useMemo(() => {
    if (!collectionsError && collectionsData) {
      const arr = Array.isArray(collectionsData) ? collectionsData : [];
      if (arr.length > 0) return arr;
    }
    return MOCK_COLLECTIONS as unknown as typeof collectionsData;
  }, [collectionsData, collectionsError]);

  return (
    <main className="pt-24 pb-16 px-4 min-h-screen">
      <div className="container mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-5xl md:text-6xl text-center mb-10 gradient-text"
        >
          {t('shop.title')}
        </motion.h1>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSearchParams({})}
              className={`px-4 py-2 rounded-full font-body text-sm border-2 transition-all ${
                activeCollection === 'all'
                  ? 'border-foreground bg-foreground text-background shadow-sticker'
                  : 'border-border hover:border-foreground'
              }`}
            >
              {t('shop.all') || 'Alles'}
            </button>
            {collections && Array.isArray(collections) && collections.filter(c => c.slug !== 'all').map(col => (
              <button
                key={col.slug}
                onClick={() => setSearchParams({ collection: col.slug })}
                className={`px-4 py-2 rounded-full font-body text-sm border-2 transition-all ${
                  activeCollection === col.slug
                    ? 'border-foreground bg-foreground text-background shadow-sticker'
                    : 'border-border hover:border-foreground'
                }`}
              >
                {col.title}
              </button>
            ))}
          </div>
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="px-4 py-2 rounded-lg border-2 border-border bg-background font-body text-sm focus:outline-none focus:border-foreground"
          >
            <option value="newest">{t('shop.sortNewest')}</option>
            <option value="price-asc">{t('shop.sortPriceLow')}</option>
            <option value="price-desc">{t('shop.sortPriceHigh')}</option>
          </select>
        </div>

        {/* Loading */}
        {productsLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square bg-muted rounded-2xl mb-3" />
                <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                <div className="h-4 bg-muted rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-handwritten text-2xl text-muted-foreground">{t('shop.empty')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {products.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { MOCK_PRODUCTS, MOCK_COLLECTIONS } from '@/lib/sellqo';
import ProductCard from '@/components/ProductCard';
import { motion } from 'framer-motion';

export default function Shop() {
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCollection = searchParams.get('collection') || 'all';
  const [sort, setSort] = useState('newest');

  const filteredProducts = useMemo(() => {
    let products = activeCollection === 'all'
      ? MOCK_PRODUCTS
      : MOCK_PRODUCTS.filter(p => p.collection === activeCollection);

    if (sort === 'price-asc') products = [...products].sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') products = [...products].sort((a, b) => b.price - a.price);
    return products;
  }, [activeCollection, sort]);

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
            {MOCK_COLLECTIONS.map(col => (
              <button
                key={col.slug}
                onClick={() => setSearchParams(col.slug === 'all' ? {} : { collection: col.slug })}
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

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-handwritten text-2xl text-muted-foreground">{t('shop.empty')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {filteredProducts.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

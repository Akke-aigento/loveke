import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useProducts } from '@/integrations/sellqo/hooks';
import { extractArray } from '@/integrations/sellqo/client';
import { normalizeProducts } from '@/integrations/sellqo/normalizer';
import { MOCK_PRODUCTS } from '@/lib/sellqo';
import type { Product } from '@/integrations/sellqo/types';
import ProductCard from './ProductCard';
import { motion } from 'framer-motion';

const FEATURED_FALLBACK = MOCK_PRODUCTS.filter(p => p.collection === 'featured') as unknown as Product[];
const COUPLE_FALLBACK = MOCK_PRODUCTS.filter(p => p.collection === 'loveke-for-two') as unknown as Product[];

export default function FeaturedProducts() {
  const { t } = useLanguage();

  const { data: featuredData, isError: featuredError } = useProducts({ collection: 'featured' });
  const { data: coupleData, isError: coupleError } = useProducts({ collection: 'loveke-for-two' });

  // Safely extract, normalize, and fallback
  const featuredRaw = extractArray(featuredData);
  const featuredProducts = featuredRaw.length > 0 && !featuredError
    ? normalizeProducts(featuredRaw)
    : FEATURED_FALLBACK;

  const coupleRaw = extractArray(coupleData);
  const coupleProducts = coupleRaw.length > 0 && !coupleError
    ? normalizeProducts(coupleRaw)
    : COUPLE_FALLBACK;

  return (
    <>
      {/* Featured Collection */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-4xl md:text-5xl text-center mb-12"
          >
            {t('featured.title')}
          </motion.h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {featuredProducts.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Loveke for Two */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="gradient-love rounded-3xl p-8 md:p-12 text-center border-3 border-foreground shadow-card"
          >
            <h2 className="font-display text-3xl md:text-4xl text-primary-foreground mb-2">
              {t('featured.forTwo.title')}
            </h2>
            <p className="font-handwritten text-xl text-primary-foreground/80 mb-8">
              {t('featured.forTwo.subtitle')}
            </p>
            
            <div className="flex flex-wrap justify-center gap-6 mb-8">
              {coupleProducts.map((product, i) => (
                <div key={product.id} className="w-48">
                  <ProductCard product={product} index={i} />
                </div>
              ))}
            </div>

            <Link
              to="/shop?collection=loveke-for-two"
              className="inline-flex items-center justify-center px-8 py-3 rounded-xl font-display text-lg bg-background text-foreground border-2 border-foreground shadow-sticker hover:scale-105 transition-transform"
            >
              {t('featured.forTwo.cta')} 💕
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
}

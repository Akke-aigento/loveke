import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useProducts } from '@/integrations/sellqo/hooks';
import { extractArray } from '@/integrations/sellqo/client';
import { normalizeProducts } from '@/integrations/sellqo/normalizer';
import type { Product } from '@/integrations/sellqo/types';
import ProductCard from './ProductCard';
import { motion } from 'framer-motion';

const FRESH_DROPS_SLOTS = 4;

function CollectionPlaceholder({ title }: { title: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="aspect-[3/4] bg-card border-2 border-border rounded-2xl shadow-sticker flex flex-col items-center justify-center p-4 text-center"
    >
      <span className="text-5xl mb-3">🧡</span>
      <span className="font-display text-lg">{title}</span>
      <span className="font-body text-sm text-accent mt-1">Binnenkort beschikbaar</span>
    </motion.div>
  );
}

export default function FeaturedProducts() {
  const { t } = useLanguage();

  const { data: featuredData, isError: featuredError } = useProducts({ collection: 'fresh-drops' });

  const featuredRaw = extractArray(featuredData);
  const featuredProducts: Product[] = featuredRaw.length > 0 && !featuredError
    ? normalizeProducts(featuredRaw)
    : [];

  const freshDropsItems: (Product | null)[] = [
    ...featuredProducts.slice(0, FRESH_DROPS_SLOTS),
    ...Array(Math.max(0, FRESH_DROPS_SLOTS - featuredProducts.length)).fill(null),
  ];

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
            {freshDropsItems.map((product, i) =>
              product
                ? <ProductCard key={product.id} product={product} index={i} />
                : <CollectionPlaceholder key={`ph-feat-${i}`} title="Fresh Drops" />
            )}
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

            {/* Loveke for Two is een automatische staffelkorting in SellQo (vanaf 2 stuks),
                geen productcollectie: hier dus uitleg in plaats van productvakken. */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-8">
              <div
                className="w-28 h-28 shrink-0 rounded-full bg-background border-2 border-foreground shadow-sticker flex items-center justify-center -rotate-6"
                aria-hidden="true"
              >
                <span className="font-display text-3xl text-primary">{t('featured.forTwo.badge')}</span>
              </div>
              <p className="font-body text-base md:text-lg text-primary-foreground max-w-md sm:text-left">
                {t('featured.forTwo.how')}
              </p>
            </div>

            <Link
              to="/shop"
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

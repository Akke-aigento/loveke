import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useProducts, useProductDetails } from '@/integrations/sellqo/hooks';
import { extractArray, extractSingle } from '@/integrations/sellqo/client';
import { normalizeProduct, normalizeProducts } from '@/integrations/sellqo/normalizer';
import type { Product, ProductSizeGuide } from '@/integrations/sellqo/types';
import SizeGuideTable, { hasUsableSizeGuide } from '@/components/SizeGuideTable';
import { Skeleton } from '@/components/ui/skeleton';

type GuideProduct = Product & { size_guide: ProductSizeGuide };

export default function SizeGuide() {
  const { t } = useLanguage();
  const { data: listData, isLoading: listLoading, isError: listError } = useProducts({});

  const slugs = useMemo(
    () => normalizeProducts(extractArray(listData)).map(p => p.slug).filter(Boolean),
    [listData]
  );
  const details = useProductDetails(slugs);
  const detailsLoading = details.some(q => q.isLoading);

  const products: GuideProduct[] = details
    .map(q => {
      const raw = extractSingle(q.data);
      return raw ? normalizeProduct(raw) : null;
    })
    .filter((p): p is GuideProduct => !!p && hasUsableSizeGuide(p.size_guide));

  const [selected, setSelected] = useState<string | null>(null);
  const active = products.find(p => p.slug === selected) ?? products[0];
  const loading = listLoading || detailsLoading;

  return (
    <main className="pt-24 pb-16 px-4 min-h-screen">
      <div className="container mx-auto max-w-3xl">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-5xl md:text-6xl text-center gradient-text mb-10"
        >
          {t('sizeGuide.title')}
        </motion.h1>

        {loading ? (
          <div aria-busy="true">
            <div className="flex flex-wrap justify-center gap-3 mb-10">
              {[0, 1, 2, 3].map(i => (
                <Skeleton key={i} className="h-10 w-36 rounded-full" />
              ))}
            </div>
            <Skeleton className="h-72 w-full rounded-2xl" />
          </div>
        ) : listError || !active ? (
          <div className="border-3 border-foreground rounded-2xl p-6 text-center shadow-card">
            <p className="font-body">
              {t('sizeGuide.unavailable')}{' '}
              <Link to="/contact" className="text-primary font-semibold hover:underline">
                {t('sizeGuide.contactCta')}
              </Link>
            </p>
          </div>
        ) : (
          <>
            {/* Product tabs */}
            {products.length > 1 && (
              <div role="group" aria-label={t('sizeGuide.products')} className="flex flex-wrap justify-center gap-3 mb-10">
                {products.map(p => (
                  <button
                    key={p.slug}
                    type="button"
                    aria-pressed={p.slug === active.slug}
                    onClick={() => setSelected(p.slug)}
                    className={`px-5 py-2 rounded-full font-display text-sm border-2 transition-all ${
                      p.slug === active.slug
                        ? 'border-foreground bg-foreground text-background shadow-sticker'
                        : 'border-border hover:border-foreground'
                    }`}
                  >
                    {p.title}
                  </button>
                ))}
              </div>
            )}

            <motion.div
              key={active.slug}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="border-3 border-foreground rounded-2xl p-4 md:p-6 shadow-card bg-card"
            >
              {products.length === 1 && (
                <h2 className="font-display text-2xl mb-4">{active.title}</h2>
              )}
              <SizeGuideTable key={active.slug} guide={active.size_guide} />
            </motion.div>
          </>
        )}

        {/* Akke's tip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-10"
        >
          <div className="speech-bubble bg-secondary max-w-lg mx-auto">
            <p className="font-handwritten text-lg">💬 {t('sizeGuide.tip')}</p>
          </div>
        </motion.div>
      </div>
    </main>
  );
}

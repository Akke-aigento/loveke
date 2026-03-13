import { lazy, Suspense } from 'react';
import HeroSection from '@/components/HeroSection';
import USPMarquee from '@/components/USPMarquee';
import FeaturedProducts from '@/components/FeaturedProducts';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';

// Lazy load below-the-fold components
const StoryTeaser = lazy(() => import('@/components/StoryTeaser'));
const ComicBanner = lazy(() => import('@/components/ComicBanner'));
const NewsletterSignup = lazy(() => import('@/components/NewsletterSignup'));

const Index = () => {
  const { t } = useLanguage();

  return (
    <main>
      <HeroSection />
      <USPMarquee />
      <Suspense fallback={null}>
        <StoryTeaser />
      </Suspense>
      <FeaturedProducts />
      <Suspense fallback={null}>
        <ComicBanner />
      </Suspense>

      {/* Gift Card Teaser */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Link
              to="/shop/cadeaukaart"
              className="block text-center bg-accent/20 border-2 border-accent rounded-2xl p-6 hover:scale-105 transition-transform shadow-sticker"
            >
              <span className="font-display text-xl">{t('giftCardTeaser.title')}</span>
              <span className="block font-body text-sm text-muted-foreground mt-1">{t('giftCardTeaser.cta')} →</span>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Social Wall placeholder */}
      <section className="py-16 px-4">
        <div className="container mx-auto text-center">
          <h2 className="font-display text-3xl md:text-4xl mb-3">{t('socialWall.title')}</h2>
          <p className="font-body text-muted-foreground mb-8">{t('socialWall.subtitle')}</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-8">
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, rotate: (i % 2 === 0 ? -3 : 3) }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="aspect-square bg-card border-2 border-foreground rounded-lg shadow-sticker flex items-center justify-center text-3xl"
                style={{ transform: `rotate(${(i % 2 === 0 ? -2 : 2)}deg)` }}
              >
                {['📸', '🧡', '👫', '🔥'][i]}
              </motion.div>
            ))}
          </div>
          <a
            href="https://www.instagram.com/loveke.shop/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 font-display text-primary hover:underline"
          >
            {t('socialWall.follow')} →
          </a>
        </div>
      </section>

      <Suspense fallback={null}>
        <NewsletterSignup />
      </Suspense>
    </main>
  );
};

export default Index;

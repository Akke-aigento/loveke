import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';

export default function ComicBanner() {
  const { t } = useLanguage();

  return (
    <section className="py-12 px-4">
      <div className="container mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, rotate: -1 }}
          whileInView={{ opacity: 1, rotate: 0 }}
          viewport={{ once: true }}
          className="bg-secondary border-3 border-foreground rounded-2xl p-8 md:p-10 shadow-card relative overflow-hidden"
        >
          <div className="relative z-10 text-center">
            <p className="font-display text-xl md:text-2xl text-secondary-foreground mb-4">
              {t('comicBanner.text')}
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl font-display gradient-warm text-primary-foreground shadow-sticker hover:scale-105 transition-transform"
            >
              {t('comicBanner.cta')}
            </Link>
          </div>

          {/* Decorative fanned comic pages */}
          <div className="absolute -right-4 -bottom-4 flex gap-1 opacity-30">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-16 h-20 bg-background border-2 border-foreground rounded-sm"
                style={{ transform: `rotate(${(i - 1) * 15}deg)` }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

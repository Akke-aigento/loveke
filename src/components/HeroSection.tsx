import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';

export default function HeroSection() {
  const { t } = useLanguage();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden halftone">
      {/* Floating shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ y: [-20, 20, -20], rotate: [0, 10, 0] }}
          transition={{ duration: 6, repeat: Infinity }}
          className="absolute top-20 left-10 w-24 h-24 rounded-full bg-primary/20"
        />
        <motion.div
          animate={{ y: [15, -15, 15], rotate: [0, -8, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-40 right-16 w-16 h-16 rounded-lg bg-secondary/30 rotate-12"
        />
        <motion.div
          animate={{ y: [-10, 25, -10], rotate: [5, -5, 5] }}
          transition={{ duration: 7, repeat: Infinity }}
          className="absolute bottom-32 left-1/4 w-20 h-20 bg-accent/20 rounded-full"
        />
        <motion.div
          animate={{ y: [20, -20, 20] }}
          transition={{ duration: 9, repeat: Infinity }}
          className="absolute bottom-20 right-1/4 w-32 h-8 bg-destructive/15 rounded-full rotate-6"
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 12, repeat: Infinity }}
          className="absolute top-1/3 right-10 text-5xl"
        >
          ❤️
        </motion.div>
        <motion.div
          animate={{ scale: [1.1, 0.9, 1.1] }}
          transition={{ duration: 5, repeat: Infinity }}
          className="absolute bottom-1/3 left-16 text-4xl"
        >
          🧡
        </motion.div>
      </div>

      <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
        {/* Logo */}
        <motion.h1
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 12, delay: 0.2 }}
          className="font-display text-7xl md:text-9xl gradient-text mb-6 tracking-tight"
          style={{ textShadow: '4px 4px 0px hsl(var(--foreground) / 0.15)' }}
        >
          Loveke
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="font-handwritten text-2xl md:text-4xl text-foreground mb-3"
        >
          {t('hero.tagline')}
        </motion.p>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="font-body text-base md:text-lg text-muted-foreground mb-10 max-w-lg mx-auto"
        >
          {t('hero.subtitle')}
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link
            to="/shop"
            className="inline-flex items-center justify-center px-8 py-4 rounded-xl font-display text-lg gradient-warm text-primary-foreground shadow-sticker hover:scale-105 hover:shadow-card-hover transition-all"
          >
            {t('hero.shopCta')} →
          </Link>
          <Link
            to="/ons-verhaal"
            className="inline-flex items-center justify-center px-8 py-4 rounded-xl font-display text-lg border-2 border-foreground bg-background hover:bg-muted shadow-sticker hover:scale-105 transition-all"
          >
            {t('hero.storyCta')}
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

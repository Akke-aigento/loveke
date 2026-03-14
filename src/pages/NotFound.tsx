import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';

export default function NotFound() {
  const { t } = useLanguage();

  return (
    <main className="min-h-screen flex items-center justify-center px-4 pt-20 pb-16">
      <div className="text-center max-w-md">
        {/* Animated door sign */}
        <motion.div
          initial={{ rotate: -10 }}
          animate={{ rotate: [-10, 10, -10] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          className="inline-block mb-8"
        >
          <div className="bg-destructive text-destructive-foreground font-display text-2xl px-8 py-4 rounded-xl border-3 border-foreground shadow-sticker">
            {t('notFound.occupied')}
          </div>
        </motion.div>

        <h1 className="font-display text-7xl md:text-8xl gradient-text mb-4">
          {t('notFound.title')}
        </h1>

        <p className="font-body text-lg text-muted-foreground mb-10 leading-relaxed">
          {t('notFound.message')}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl font-display gradient-warm text-primary-foreground shadow-sticker hover:scale-105 transition-transform"
          >
            {t('notFound.homeCta')}
          </Link>
          <Link
            to="/ons-verhaal"
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl font-display border-2 border-border hover:border-foreground transition-colors"
          >
            {t('notFound.storyCta')}
          </Link>
        </div>
      </div>
    </main>
  );
}

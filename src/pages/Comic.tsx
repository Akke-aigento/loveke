import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';

export default function Comic() {
  const { t } = useLanguage();

  return (
    <main className="pt-24 pb-16 px-4 min-h-screen">
      <div className="container mx-auto max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="font-display text-5xl md:text-6xl gradient-text mb-3">{t('comic.title')}</h1>
          <p className="font-body text-muted-foreground">{t('comic.subtitle')}</p>
        </motion.div>

        {/* Comic page gallery placeholder */}
        <div className="grid grid-cols-2 gap-4 md:gap-6 mb-12">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.03, rotate: 0 }}
              className="aspect-[3/4] bg-card border-3 border-foreground rounded-lg shadow-card flex items-center justify-center"
              style={{ transform: `rotate(${(i % 2 === 0 ? -1 : 1)}deg)` }}
            >
              <span className="font-handwritten text-3xl text-muted-foreground">Page {i + 1}</span>
            </motion.div>
          ))}
        </div>

        {/* Free reminder */}
        <div className="text-center mb-12">
          <span className="inline-block px-6 py-3 bg-secondary border-2 border-foreground rounded-full font-display text-sm shadow-sticker">
            {t('comic.freeReminder')}
          </span>
        </div>

        {/* Purchase options */}
        <div className="grid sm:grid-cols-2 gap-6 max-w-lg mx-auto">
          <Link
            to="/shop"
            className="block text-center px-6 py-4 rounded-xl font-display gradient-warm text-primary-foreground shadow-sticker hover:scale-105 transition-transform"
          >
            {t('comic.buyDigital')} 📱
          </Link>
          <Link
            to="/shop"
            className="block text-center px-6 py-4 rounded-xl font-display border-2 border-foreground bg-background shadow-sticker hover:scale-105 transition-transform"
          >
            {t('comic.buyPrinted')} 📖
          </Link>
        </div>
      </div>
    </main>
  );
}

import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';

import strip1 from '@/assets/comic/strip-1.jpg';
import strip2 from '@/assets/comic/strip-2.jpg';
import strip3 from '@/assets/comic/strip-3.jpg';
import strip4 from '@/assets/comic/strip-4.jpg';
import strip5 from '@/assets/comic/strip-5.jpg';
import strip6 from '@/assets/comic/strip-6.jpg';
import strip7 from '@/assets/comic/strip-7.jpg';
import strip8 from '@/assets/comic/strip-8.jpg';
import strip9 from '@/assets/comic/strip-9.jpg';
import strip10 from '@/assets/comic/strip-10.jpg';
import strip11 from '@/assets/comic/strip-11.jpg';
import strip12 from '@/assets/comic/strip-12.jpg';

const comicPages = [strip1, strip2, strip3, strip4, strip5, strip6, strip7, strip8, strip9, strip10, strip11, strip12];

export default function Comic() {
  const { t } = useLanguage();

  return (
    <main className="pt-24 pb-16 px-4 min-h-screen">
      <div className="container mx-auto max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="font-display text-5xl md:text-6xl gradient-text mb-3">{t('comic.title')}</h1>
          <p className="font-body text-muted-foreground">{t('comic.subtitle')}</p>
        </motion.div>

        {/* Comic page gallery */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-12">
          {comicPages.map((src, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ scale: 1.03 }}
              className="border-3 border-foreground rounded-lg shadow-card overflow-hidden bg-card"
              style={{ transform: `rotate(${(i % 2 === 0 ? -0.5 : 0.5)}deg)` }}
            >
              <img src={src} alt={`Comic page ${i + 1}`} className="w-full h-auto" loading="lazy" />
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

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function CookieBanner() {
  const { t } = useLanguage();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem('loveke-cookies');
    if (!accepted) {
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    localStorage.setItem('loveke-cookies', 'accepted');
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem('loveke-cookies', 'declined');
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 200, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 200, opacity: 0 }}
          transition={{ type: 'spring', damping: 20 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50"
        >
          <div className="bg-card border-2 border-foreground rounded-2xl p-5 shadow-card">
            <p className="font-body text-sm mb-4">{t('cookie.message')}</p>
            <div className="flex gap-3">
              <button
                onClick={accept}
                className="flex-1 py-2 rounded-xl font-display text-sm gradient-warm text-primary-foreground shadow-sticker hover:scale-105 transition-transform"
              >
                {t('cookie.accept')}
              </button>
              <button
                onClick={decline}
                className="px-4 py-2 rounded-xl font-body text-sm border border-border hover:bg-muted transition-colors"
              >
                {t('cookie.decline')}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

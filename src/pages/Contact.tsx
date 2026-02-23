import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';

export default function Contact() {
  const { t } = useLanguage();
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <main className="pt-24 pb-16 px-4 min-h-screen">
      <div className="container mx-auto max-w-xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <h1 className="font-display text-5xl gradient-text mb-3">{t('contactPage.title')}</h1>
          <p className="font-body text-muted-foreground">{t('contactPage.subtitle')}</p>
        </motion.div>

        {sent ? (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center py-16"
          >
            <span className="text-6xl block mb-4">💌</span>
            <p className="font-display text-2xl">{t('contactPage.success')}</p>
          </motion.div>
        ) : (
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit}
            className="space-y-4 bg-card border-3 border-foreground rounded-2xl p-6 md:p-8 shadow-card"
          >
            <div>
              <label className="font-body font-semibold text-sm block mb-1">{t('contactPage.name')}</label>
              <input required className="w-full px-4 py-3 rounded-xl border-2 border-border bg-background font-body focus:outline-none focus:border-foreground" />
            </div>
            <div>
              <label className="font-body font-semibold text-sm block mb-1">{t('contactPage.email')}</label>
              <input type="email" required className="w-full px-4 py-3 rounded-xl border-2 border-border bg-background font-body focus:outline-none focus:border-foreground" />
            </div>
            <div>
              <label className="font-body font-semibold text-sm block mb-1">{t('contactPage.subject')}</label>
              <input required className="w-full px-4 py-3 rounded-xl border-2 border-border bg-background font-body focus:outline-none focus:border-foreground" />
            </div>
            <div>
              <label className="font-body font-semibold text-sm block mb-1">{t('contactPage.message')}</label>
              <textarea required rows={5} className="w-full px-4 py-3 rounded-xl border-2 border-border bg-background font-body focus:outline-none focus:border-foreground resize-none" />
            </div>
            <button type="submit" className="w-full py-3 rounded-xl font-display text-lg gradient-warm text-primary-foreground shadow-sticker hover:scale-105 transition-transform">
              {t('contactPage.send')}
            </button>
            <p className="text-center text-sm font-body text-muted-foreground">{t('contactPage.info')}</p>
          </motion.form>
        )}

        <div className="text-center mt-8 font-body text-sm text-muted-foreground">
          <p>📧 <a href="mailto:info@loveke.be" className="hover:text-primary transition-colors">info@loveke.be</a></p>
          <p>📸 <a href="https://www.instagram.com/loveke.shop/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">@loveke.shop</a></p>
        </div>
      </div>
    </main>
  );
}

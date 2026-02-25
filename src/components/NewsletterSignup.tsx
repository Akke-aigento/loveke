import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNewsletterSubscribe } from '@/integrations/sellqo/hooks';
import { motion } from 'framer-motion';

export default function NewsletterSignup() {
  const { t, locale } = useLanguage();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const subscribe = useNewsletterSubscribe();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    try {
      await subscribe.mutateAsync({ email, locale });
      setStatus('success');
      setEmail('');
    } catch {
      setStatus('error');
    }
  };

  return (
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="gradient-warm rounded-3xl p-8 md:p-12 text-center border-3 border-foreground shadow-card"
        >
          <h2 className="font-display text-3xl md:text-4xl text-primary-foreground mb-3">
            {t('newsletter.title')}
          </h2>
          <p className="font-body text-primary-foreground/80 mb-8">
            {t('newsletter.subtitle')}
          </p>

          {status === 'success' ? (
            <motion.div
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              className="font-display text-2xl text-primary-foreground"
            >
              {t('newsletter.success')}
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={t('newsletter.placeholder')}
                className="flex-1 px-4 py-3 rounded-xl border-2 border-foreground bg-background text-foreground font-body placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground"
                required
              />
              <button
                type="submit"
                disabled={subscribe.isPending}
                className="px-6 py-3 rounded-xl font-display bg-foreground text-background shadow-sticker hover:scale-105 transition-transform whitespace-nowrap disabled:opacity-50"
              >
                {subscribe.isPending ? '...' : t('newsletter.submit')}
              </button>
            </form>
          )}

          {status === 'error' && (
            <p className="mt-3 font-body text-sm text-primary-foreground/80">{t('newsletter.error')}</p>
          )}
        </motion.div>
      </div>
    </section>
  );
}

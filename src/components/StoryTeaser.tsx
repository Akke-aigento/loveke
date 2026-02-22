import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';

export default function StoryTeaser() {
  const { t } = useLanguage();

  return (
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          {/* Comic panel style */}
          <div className="bg-card border-3 border-foreground rounded-2xl p-8 md:p-12 shadow-card relative overflow-hidden">
            {/* Halftone overlay */}
            <div className="absolute inset-0 halftone opacity-50" />
            
            <div className="relative z-10">
              <h2 className="font-display text-3xl md:text-4xl mb-4">{t('storyTeaser.title')}</h2>
              
              {/* Speech bubble */}
              <div className="speech-bubble bg-background max-w-xl mb-6">
                <p className="font-body text-muted-foreground leading-relaxed">
                  {t('storyTeaser.text')}
                </p>
              </div>

              <Link
                to="/ons-verhaal"
                className="inline-flex items-center font-display text-lg text-primary hover:underline hover:scale-105 transition-transform"
              >
                {t('storyTeaser.cta')}
              </Link>
            </div>

            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 text-4xl rotate-12">💕</div>
            <div className="absolute -bottom-2 right-12 text-3xl -rotate-6">🍺</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

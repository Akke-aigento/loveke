import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';

const chapters = [
  { key: 'chapter1', icon: '🍺', color: 'bg-secondary' },
  { key: 'chapter2', icon: '🚂', color: 'bg-accent/20' },
  { key: 'chapter3', icon: '🌙', color: 'bg-primary/10' },
  { key: 'chapter4', icon: '🏛️', color: 'bg-secondary' },
  { key: 'chapter5', icon: '❤️', color: 'bg-accent/20' },
];

export default function Story() {
  const { t } = useLanguage();

  return (
    <main className="pt-24 pb-16 min-h-screen">
      {/* Hero */}
      <section className="py-16 px-4 text-center halftone">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-5xl md:text-7xl gradient-text mb-4"
        >
          {t('story.heroTitle')}
        </motion.h1>
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.3 }}
          className="w-32 h-1 gradient-warm mx-auto rounded-full"
        />
      </section>

      {/* Chapters */}
      <section className="px-4 pb-16">
        <div className="container mx-auto max-w-3xl space-y-12">
          {chapters.map((ch, i) => (
            <motion.div
              key={ch.key}
              initial={{ opacity: 0, x: i % 2 === 0 ? -40 : 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5 }}
              className={`${ch.color} border-3 border-foreground rounded-2xl p-6 md:p-8 shadow-card relative overflow-hidden`}
            >
              <div className="absolute top-3 right-4 text-3xl">{ch.icon}</div>
              <h3 className="font-display text-xl md:text-2xl mb-4 pr-10">
                {t(`story.${ch.key}Title`)}
              </h3>
              <p className="font-body leading-relaxed text-muted-foreground">
                {t(`story.${ch.key}`)}
              </p>

              {/* Dotted connector */}
              {i < chapters.length - 1 && (
                <div className="absolute -bottom-12 left-1/2 w-px h-12 border-l-2 border-dashed border-foreground/30" />
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="text-center py-12 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <span className="font-display text-6xl gradient-text block mb-6">Loveke</span>
          <Link
            to="/shop"
            className="inline-flex items-center justify-center px-8 py-4 rounded-xl font-display text-lg gradient-warm text-primary-foreground shadow-sticker hover:scale-105 transition-transform"
          >
            {t('story.shopCta')}
          </Link>
        </motion.div>
      </section>
    </main>
  );
}

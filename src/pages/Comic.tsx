import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';

import strip1 from '@/assets/comic/strip-1.webp';
import strip2 from '@/assets/comic/strip-2.webp';
import strip3 from '@/assets/comic/strip-3.webp';
import strip4 from '@/assets/comic/strip-4.webp';
import strip5 from '@/assets/comic/strip-5.webp';
import strip6 from '@/assets/comic/strip-6.webp';
import strip7 from '@/assets/comic/strip-7.webp';
import strip8 from '@/assets/comic/strip-8.webp';
import strip9 from '@/assets/comic/strip-9.webp';
import strip10 from '@/assets/comic/strip-10.webp';
import strip11 from '@/assets/comic/strip-11.webp';
import strip12 from '@/assets/comic/strip-12.webp';

const comicPages = [strip1, strip2, strip3, strip4, strip5, strip6, strip7, strip8, strip9, strip10, strip11, strip12];

// LOVEKE-LAUNCH-1: beschrijvende alt-teksten per pagina, in de taal van de site.
const PAGE_ALT: Record<'nl' | 'en' | 'fr', string[]> = {
  nl: [
    'Akke en Nastya met een pintje voor het Wild Elephants Hostel in Bratislava',
    'Akke wacht op blote voeten aan het hostel in Bratislava',
    'Nastya komt met haar rugzak aan bij het hostel',
    'Ze spreken af voor een pintje',
    'Nastya zit vast in de badkamer van het hostel',
    'De ochtend erna, met koffie en een Slowaakse lunch',
    'Lunch op het terras: "Je kan altijd meekomen"',
    'Akke boekt spontaan een treinticket naar Oekraïne',
    'De treinrit van Slowakije naar Oekraïne',
    'De eerste nacht in een motel in Mukachevo',
    'Samen door Kyiv',
    'Afscheid in Kyiv en berichtjes over de afstand',
  ],
  en: [
    'Akke and Nastya with a beer outside the Wild Elephants Hostel in Bratislava',
    'Akke waits barefoot outside the hostel in Bratislava',
    'Nastya arrives at the hostel with her backpack',
    'They agree to meet for a beer',
    'Nastya gets stuck in the hostel bathroom',
    'The morning after, with coffee and a Slovak lunch',
    'Lunch on the terrace: "You could always come with me"',
    'Akke spontaneously books a train ticket to Ukraine',
    'The train ride from Slovakia to Ukraine',
    'The first night in a motel in Mukachevo',
    'Exploring Kyiv together',
    'Saying goodbye in Kyiv and messaging across the distance',
  ],
  fr: [
    "Akke et Nastya avec une bière devant le Wild Elephants Hostel à Bratislava",
    "Akke attend pieds nus devant l'auberge à Bratislava",
    "Nastya arrive à l'auberge avec son sac à dos",
    'Ils se donnent rendez-vous pour une bière',
    "Nastya reste coincée dans la salle de bain de l'auberge",
    'Le lendemain matin, café et déjeuner slovaque',
    'Déjeuner en terrasse : « Tu pourrais venir avec moi »',
    "Akke réserve spontanément un billet de train pour l'Ukraine",
    "Le trajet en train de la Slovaquie à l'Ukraine",
    'La première nuit dans un motel à Moukatchevo',
    'Ensemble à Kyiv',
    'Les adieux à Kyiv et les messages à distance',
  ],
};

export default function Comic() {
  const { t, locale } = useLanguage();
  const alts = PAGE_ALT[locale] ?? PAGE_ALT.nl;

  return (
    <main className="pt-24 pb-16 px-4 min-h-screen">
      <div className="container mx-auto max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="font-display text-5xl md:text-6xl gradient-text mb-3">{t('comic.title')}</h1>
          <p className="font-body text-muted-foreground">{t('comic.subtitle')}</p>
          <p className="font-body text-sm text-muted-foreground mt-2">{t('comic.englishNote')}</p>
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
              <img
                src={src}
                alt={`${t('comic.alt')} ${i + 1}: ${alts[i]}`}
                width={896}
                height={1200}
                className="w-full h-auto"
                loading={i < 2 ? 'eager' : 'lazy'}
                decoding="async"
              />
            </motion.div>
          ))}
        </div>

        {/* Free reminder */}
        <div className="text-center mb-12">
          <span className="inline-block px-6 py-3 bg-secondary border-2 border-foreground rounded-full font-display text-sm shadow-sticker">
            {t('comic.freeReminder')}
          </span>
        </div>
      </div>
    </main>
  );
}

import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

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
import warsaw1 from '@/assets/comic/part-2/warsaw-1.webp';
import warsaw2 from '@/assets/comic/part-2/warsaw-2.webp';
import warsaw3 from '@/assets/comic/part-2/warsaw-3.webp';
import warsaw4 from '@/assets/comic/part-2/warsaw-4.webp';
import warsaw5 from '@/assets/comic/part-2/warsaw-5.webp';
import warsaw6 from '@/assets/comic/part-2/warsaw-6.webp';
import warsaw7 from '@/assets/comic/part-2/warsaw-7.webp';
import warsaw8 from '@/assets/comic/part-2/warsaw-8.webp';
import warsaw9 from '@/assets/comic/part-2/warsaw-9.webp';
import warsaw10 from '@/assets/comic/part-2/warsaw-10.webp';
import warsaw11 from '@/assets/comic/part-2/warsaw-11.webp';
import warsaw12 from '@/assets/comic/part-2/warsaw-12.webp';
import warsawCover from '@/assets/comic/part-2/warsaw-cover.webp';

const part1Pages = [strip1, strip2, strip3, strip4, strip5, strip6, strip7, strip8, strip9, strip10, strip11, strip12];
const part2Pages = [warsaw1, warsaw2, warsaw3, warsaw4, warsaw5, warsaw6, warsaw7, warsaw8, warsaw9, warsaw10, warsaw11, warsaw12];

// LOVEKE-LAUNCH-1: beschrijvende alt-teksten per pagina, in de taal van de site.
const PART1_ALT: Record<'nl' | 'en' | 'fr', string[]> = {
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

// STRIP-2: deel 2 "The Warsaw Story" (Warschau, mei 2024), zelfde opbouw als deel 1.
const PART2_ALT: Record<'nl' | 'en' | 'fr', string[]> = {
  nl: [
    'Drie weken berichtjes en videocalls tussen België en Kyiv',
    '"I need to see you again": verlof aanvragen, Warschau ligt in het midden',
    'Hij met het vliegtuig, zij een hele dag op de trein',
    'Akke wacht met rozen op het perron, deze keer met schoenen',
    'Het weerzien op het perron in Warschau',
    'Het appartementje en de cadeautjes: chacha en een briefje',
    'Een terras en twee tickets voor een kroegentocht',
    'De kroegentocht door Warschau bij nacht',
    'De laatste club slaan ze over',
    'Het Koningsslot, de Barbakan, de jasmijnstruik en de Wisła',
    'Georgisch eten op een terras: Gaumarjos!',
    'Afscheid en een vlucht die hij op één minuut na haalt',
  ],
  en: [
    'Three weeks of messages and video calls between Belgium and Kyiv',
    '"I need to see you again": requesting leave, Warsaw right in the middle',
    'Him on a quick flight, her a whole day on the train',
    'Akke waits on the platform with roses, wearing shoes this time',
    'The reunion on the platform in Warsaw',
    'The little apartment and the gifts: chacha and a handwritten note',
    'A terrace and two tickets for a pub crawl',
    'The pub crawl through Warsaw at night',
    'They skip the last club',
    'The Royal Castle, the Barbican, a jasmine bush and the Vistula',
    'Georgian food on a terrace: Gaumarjos!',
    'Saying goodbye and a flight caught with one minute to spare',
  ],
  fr: [
    'Trois semaines de messages et d\'appels vidéo entre la Belgique et Kyiv',
    '« I need to see you again » : demander congé, Varsovie juste au milieu',
    'Lui en avion, elle toute une journée en train',
    'Akke attend sur le quai avec des roses, cette fois avec des chaussures',
    'Les retrouvailles sur le quai à Varsovie',
    'Le petit appartement et les cadeaux : du chacha et un mot',
    'Une terrasse et deux billets pour une tournée des bars',
    'La tournée des bars dans Varsovie la nuit',
    'Ils sautent la dernière boîte',
    'Le château royal, la Barbacane, un jasmin et la Vistule',
    'Cuisine géorgienne en terrasse : Gaumarjos !',
    'Les adieux et un vol attrapé à une minute près',
  ],
};

const PARTS = [
  { id: 'deel-1', key: 'part1', pages: part1Pages, alts: PART1_ALT, thumb: strip1 },
  { id: 'deel-2', key: 'part2', pages: part2Pages, alts: PART2_ALT, thumb: warsawCover },
] as const;

export default function Comic() {
  const { t, locale } = useLanguage();
  const { hash } = useLocation();

  // Links als /de-strip#deel-2 (bv. vanuit Instagram) scrollen meteen naar dat deel.
  useEffect(() => {
    if (!hash) return;
    const el = document.getElementById(hash.slice(1));
    if (el) requestAnimationFrame(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }, [hash]);

  return (
    <main className="pt-24 pb-16 px-4 min-h-screen">
      <div className="container mx-auto max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="font-display text-5xl md:text-6xl gradient-text mb-3">{t('comic.title')}</h1>
          <p className="font-body text-muted-foreground">{t('comic.subtitle')}</p>
          <p className="font-body text-sm text-muted-foreground mt-2">{t('comic.englishNote')}</p>
        </motion.div>

        {/* Inhoud: twee delen naast elkaar */}
        <nav aria-label={t('comic.partsLabel')} className="grid grid-cols-2 gap-4 md:gap-6 max-w-2xl mx-auto mb-16">
          {PARTS.map((p, i) => (
            <a
              key={p.id}
              href={`#${p.id}`}
              className="group block bg-card border-3 border-foreground rounded-2xl shadow-sticker overflow-hidden hover:scale-[1.03] transition-transform"
              style={{ transform: `rotate(${i === 0 ? -1 : 1}deg)` }}
            >
              <div className="aspect-[4/3] overflow-hidden border-b-3 border-foreground">
                <img src={p.thumb} alt="" width={896} height={1200} className="w-full h-full object-cover object-top" loading="eager" decoding="async" />
              </div>
              <div className="p-3 md:p-4 text-left">
                <span className="block font-body text-xs uppercase tracking-wide text-muted-foreground">{t(`comic.${p.key}Label`)}</span>
                <span className="block font-display text-lg md:text-xl leading-tight">{t(`comic.${p.key}Title`)}</span>
                <span className="block font-body text-sm text-muted-foreground">{t(`comic.${p.key}Where`)}</span>
              </div>
            </a>
          ))}
        </nav>

        {PARTS.map((p, partIndex) => {
          const alts = p.alts[locale] ?? p.alts.nl;
          return (
            <section key={p.id} id={p.id} className="scroll-mt-28 mb-16" aria-labelledby={`${p.id}-titel`}>
              <div className="text-center mb-8">
                <span className="inline-block px-4 py-1 bg-secondary border-2 border-foreground rounded-full font-display text-sm shadow-sticker mb-3">
                  {t(`comic.${p.key}Label`)}
                </span>
                <h2 id={`${p.id}-titel`} className="font-display text-3xl md:text-4xl">{t(`comic.${p.key}Title`)}</h2>
                <p className="font-body text-muted-foreground mt-1">{t(`comic.${p.key}Where`)}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                {p.pages.map((src, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: (i % 2) * 0.05 }}
                    whileHover={{ scale: 1.03 }}
                    className="border-3 border-foreground rounded-lg shadow-card overflow-hidden bg-card"
                    style={{ transform: `rotate(${(i % 2 === 0 ? -0.5 : 0.5)}deg)` }}
                  >
                    <img
                      src={src}
                      alt={`${t(`comic.${p.key}Title`)}, ${t('comic.alt').toLowerCase()} ${i + 1}: ${alts[i]}`}
                      width={896}
                      height={1200}
                      className="w-full h-auto"
                      loading={partIndex === 0 && i < 2 ? 'eager' : 'lazy'}
                      decoding="async"
                    />
                  </motion.div>
                ))}
              </div>

              {partIndex === 0 && (
                <div className="text-center mt-10">
                  <a href="#deel-2" className="inline-flex items-center gap-2 font-display text-primary hover:underline">
                    {t('comic.nextPart')} ↓
                  </a>
                </div>
              )}
            </section>
          );
        })}

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

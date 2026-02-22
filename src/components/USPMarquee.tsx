import { useLanguage } from '@/contexts/LanguageContext';

export default function USPMarquee() {
  const { t } = useLanguage();

  const usps = [
    t('usps.belgium'),
    t('usps.organic'),
    t('usps.gots'),
    t('usps.shipping'),
    t('usps.love'),
    t('usps.comic'),
  ];

  const doubled = [...usps, ...usps];

  return (
    <section className="py-6 overflow-hidden border-y-3 border-foreground bg-foreground">
      <div className="flex animate-marquee whitespace-nowrap">
        {doubled.map((usp, i) => (
          <span
            key={i}
            className="mx-6 md:mx-10 font-display text-sm md:text-base text-background flex items-center gap-2"
          >
            <span className="w-2 h-2 rounded-full bg-primary inline-block" />
            {usp}
          </span>
        ))}
      </div>
    </section>
  );
}

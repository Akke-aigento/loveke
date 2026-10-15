import { Link } from 'react-router-dom';
import { Instagram, Facebook, Music } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useLegalPages, useStorefrontSettings } from '@/integrations/sellqo/hooks';
import { extractSingle } from '@/integrations/sellqo/client';

export default function Footer() {
  const { t, locale } = useLanguage();
  const { data: legalPages, isError: legalError } = useLegalPages();
  const { data: settingsData } = useStorefrontSettings();
  const settings = (extractSingle(settingsData) ?? settingsData) as any;
  const storeName = settings?.store?.name;

  // Use social data from settings instead of a separate API call
  const social = settings?.social ?? settings?.data?.social ?? {};

  const socialItems = [
    { key: 'instagram', url: social.instagram, icon: Instagram },
    { key: 'facebook', url: social.facebook, icon: Facebook },
    { key: 'tiktok', url: social.tiktok, icon: Music },
  ].filter(s => s.url && String(s.url).trim() !== '');

  // Normalize legal pages from various response shapes
  const pages: Array<Record<string, any>> =
    Array.isArray(legalPages) ? legalPages
    : Array.isArray((legalPages as any)?.data) ? (legalPages as any).data
    : [];
  const visibleLegal = !legalError
    ? pages.filter(p => p.enabled !== false && p.is_published !== false)
    : [];

  return (
    <footer className="bg-foreground text-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Logo & Social */}
          <div className="col-span-2 md:col-span-1">
            <span className="font-display text-3xl gradient-text">Loveke</span>
            <p className="mt-3 text-sm opacity-70 font-body">Born from Love. Worn on the Street.</p>
            <div className="flex gap-3 mt-4 items-center">
              {socialItems.length > 0 ? (
                socialItems.map(({ key, url, icon: Icon }) => (
                  <a key={key} href={url} target="_blank" rel="noopener noreferrer" aria-label={key} className="hover:text-primary transition-colors">
                    <Icon size={20} />
                  </a>
                ))
              ) : (
                <a href="https://www.instagram.com/loveke.shop/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:text-primary transition-colors">
                  <Instagram size={20} />
                </a>
              )}
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-display text-sm mb-3">{t('footer.shop')}</h4>
            <div className="flex flex-col gap-2 text-sm opacity-70 font-body">
              <Link to="/shop" className="hover:text-primary transition-colors">{t('footer.allProducts')}</Link>
              <Link to="/shop/loveke-cadeaukaart" className="hover:text-primary transition-colors">{t('footer.giftCards')}</Link>
            </div>
          </div>

          {/* Info */}
          <div>
            <h4 className="font-display text-sm mb-3">{t('footer.info')}</h4>
            <div className="flex flex-col gap-2 text-sm opacity-70 font-body">
              <Link to="/ons-verhaal" className="hover:text-primary transition-colors">{t('footer.ourStory')}</Link>
              <Link to="/de-strip" className="hover:text-primary transition-colors">{t('footer.theComic')}</Link>
            </div>
          </div>

          {/* Help */}
          <div>
            <h4 className="font-display text-sm mb-3">{t('footer.help')}</h4>
            <div className="flex flex-col gap-2 text-sm opacity-70 font-body">
              <Link to="/maatgids" className="hover:text-primary transition-colors">{t('footer.sizeGuide')}</Link>
              <Link to="/contact" className="hover:text-primary transition-colors">{t('footer.contact')}</Link>
            </div>
          </div>

          {/* Juridisch */}
          {visibleLegal.length > 0 && (
            <div>
              <h4 className="font-display text-sm mb-3">{t('footer.legal')}</h4>
              <div className="flex flex-col gap-2 text-sm opacity-70 font-body">
                {visibleLegal.map(page => (
                  <Link
                    key={page.page_type ?? page.slug}
                    to={`/juridisch/${page.page_type ?? page.slug}`}
                    className="hover:text-primary transition-colors"
                  >
                    {page[`title_${locale}`] || page.title_nl || page.title}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-6 border-t border-background/20 flex flex-col md:flex-row items-center justify-between gap-4 text-xs opacity-50 font-body">
          <div className="flex flex-col gap-1 text-center md:text-left">
            <span>{storeName ? `© ${new Date().getFullYear()} ${storeName}` : t('footer.copyright')}</span>
            <span>{t('footer.company')}</span>
          </div>
          {/* LOVEKE-LAUNCH-1: enkel de betaalmethodes die echt aanstaan (Stripe: kaart, Bancontact, iDEAL; plus overschrijving). */}
          <ul aria-label={t('footer.payments')} className="flex flex-wrap gap-2 items-center justify-center">
            {['Bancontact', 'iDEAL', 'Visa', 'Mastercard', 'Overschrijving'].map(m => (
              <li key={m} className="px-2.5 py-1 rounded-md border border-background/30 text-[11px] font-semibold tracking-wide">
                {m === 'Overschrijving' ? (locale === 'fr' ? 'Virement' : locale === 'en' ? 'Bank transfer' : 'Overschrijving') : m}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}

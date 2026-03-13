import { Link } from 'react-router-dom';
import { Instagram, Facebook, Music } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useLegalPages, useSocialLinks, useStorefrontSettings } from '@/integrations/sellqo/hooks';
import { extractSingle } from '@/integrations/sellqo/client';

export default function Footer() {
  const { t } = useLanguage();
  const { data: legalPages, isError: legalError } = useLegalPages();
  const { data: socialData } = useSocialLinks();
  const { data: settingsData } = useStorefrontSettings();
  const settings = (extractSingle(settingsData) ?? settingsData) as any;
  const storeName = settings?.store?.name;

  // Normalize social links from various response shapes
  const social = (socialData as any)?.data ?? socialData ?? {};

  const socialItems = [
    { key: 'instagram', url: social.instagram, icon: Instagram },
    { key: 'facebook', url: social.facebook, icon: Facebook },
    { key: 'tiktok', url: social.tiktok, icon: Music },
  ].filter(s => s.url && String(s.url).trim() !== '');

  // Normalize legal pages from various response shapes
  const pages: Array<{ slug: string; title: string; enabled?: boolean }> =
    Array.isArray(legalPages) ? legalPages
    : Array.isArray((legalPages as any)?.data) ? (legalPages as any).data
    : [];
  const visibleLegal = !legalError ? pages.filter(p => p.enabled !== false) : [];

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
                  <a key={key} href={url} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                    <Icon size={20} />
                  </a>
                ))
              ) : (
                <a href="https://www.instagram.com/loveke.shop/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
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
              <Link to="/cadeaubon" className="hover:text-primary transition-colors">{t('footer.giftCards')}</Link>
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
              <h4 className="font-display text-sm mb-3">Juridisch</h4>
              <div className="flex flex-col gap-2 text-sm opacity-70 font-body">
                {visibleLegal.map(page => (
                  <a
                    key={page.slug}
                    href={`https://sellqo.app/shop/loveke/legal/${page.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary transition-colors"
                  >
                    {page.title}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-6 border-t border-background/20 flex flex-col md:flex-row items-center justify-between gap-4 text-xs opacity-50 font-body">
          <span>{t('footer.copyright')}</span>
          <div className="flex gap-4">
            <span>Visa</span>
            <span>Mastercard</span>
            <span>Bancontact</span>
            <span>iDEAL</span>
            <span>PayPal</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

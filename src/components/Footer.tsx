import { Link } from 'react-router-dom';
import { Instagram, Facebook, Music } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useLegalPages, useStorefrontSettings } from '@/integrations/sellqo/hooks';
import { extractSingle } from '@/integrations/sellqo/client';

export default function Footer() {
  const { t } = useLanguage();
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
  const pages: Array<{ slug: string; title: string; url?: string; enabled?: boolean }> =
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
              <h4 className="font-display text-sm mb-3">Juridisch</h4>
              <div className="flex flex-col gap-2 text-sm opacity-70 font-body">
                {visibleLegal.map(page => {
                  const baseUrl = page.url || `https://sellqo.app/shop/loveke/legal/${page.slug}`;
                  const separator = baseUrl.includes('?') ? '&' : '?';
                  return (
                    <a
                      key={page.slug}
                      href={`${baseUrl}${separator}from=loveke.be`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-primary transition-colors"
                    >
                      {page.title}
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-6 border-t border-background/20 flex flex-col md:flex-row items-center justify-between gap-4 text-xs opacity-50 font-body">
          <span>{storeName ? `© ${new Date().getFullYear()} ${storeName}` : t('footer.copyright')}</span>
          <div className="flex gap-3 items-center">
            {/* Visa */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 32" className="h-6 w-auto opacity-70">
              <rect width="48" height="32" rx="4" fill="currentColor" fillOpacity="0.15"/>
              <path d="M19.5 21h-3l1.9-11h3l-1.9 11zm12.3-10.7c-.6-.2-1.5-.5-2.7-.5-3 0-5.1 1.5-5.1 3.7 0 1.6 1.5 2.5 2.7 3.1 1.2.5 1.6.9 1.6 1.4 0 .7-.9 1.1-1.8 1.1-1.2 0-1.9-.2-2.9-.6l-.4-.2-.4 2.5c.7.3 2.1.6 3.5.6 3.2 0 5.2-1.5 5.2-3.8 0-1.3-.8-2.2-2.5-3-1-.5-1.7-.9-1.7-1.4 0-.5.5-1 1.7-1 1 0 1.7.2 2.2.4l.3.1.3-2.4zm7.9-.3h-2.3c-.7 0-1.3.2-1.6.9l-4.4 10.1h3.2l.6-1.7h3.8l.4 1.7H42l-2.3-11zm-3.6 7.1l1.2-3.1.4-1.1.2 1.1.7 3.1h-2.5zM17.1 10h-4.8l-.1.3c3.8.9 6.3 3.2 7.3 5.9l-1.1-5.3c-.2-.7-.7-.9-1.3-.9z" fill="currentColor"/>
            </svg>
            {/* Mastercard */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 32" className="h-6 w-auto opacity-70">
              <rect width="48" height="32" rx="4" fill="currentColor" fillOpacity="0.15"/>
              <circle cx="19" cy="16" r="8" fill="currentColor" fillOpacity="0.4"/>
              <circle cx="29" cy="16" r="8" fill="currentColor" fillOpacity="0.3"/>
            </svg>
            {/* Bancontact */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 32" className="h-6 w-auto opacity-70">
              <rect width="48" height="32" rx="4" fill="currentColor" fillOpacity="0.15"/>
              <text x="24" y="18" textAnchor="middle" fontSize="7" fontWeight="bold" fill="currentColor" fontFamily="sans-serif">BC</text>
            </svg>
            {/* iDEAL */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 32" className="h-6 w-auto opacity-70">
              <rect width="48" height="32" rx="4" fill="currentColor" fillOpacity="0.15"/>
              <text x="24" y="18" textAnchor="middle" fontSize="7" fontWeight="bold" fill="currentColor" fontFamily="sans-serif">iDEAL</text>
            </svg>
            {/* PayPal */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 32" className="h-6 w-auto opacity-70">
              <rect width="48" height="32" rx="4" fill="currentColor" fillOpacity="0.15"/>
              <text x="24" y="18" textAnchor="middle" fontSize="7" fontWeight="bold" fill="currentColor" fontFamily="sans-serif">PP</text>
            </svg>
          </div>
        </div>
      </div>
    </footer>
  );
}

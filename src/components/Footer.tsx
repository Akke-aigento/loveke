import { Link } from 'react-router-dom';
import { Instagram } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-foreground text-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Logo & Social */}
          <div className="col-span-2 md:col-span-1">
            <span className="font-display text-3xl gradient-text">Loveke</span>
            <p className="mt-3 text-sm opacity-70 font-body">Born from Love. Worn on the Street.</p>
            <div className="flex gap-3 mt-4">
              <a href="https://instagram.com/loveke.shop" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                <Instagram size={20} />
              </a>
              <a href="https://tiktok.com/@loveke" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors text-sm font-bold">
                TikTok
              </a>
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

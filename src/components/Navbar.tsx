import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Menu, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { motion, AnimatePresence } from 'framer-motion';

const locales = [
  { code: 'nl' as const, label: 'NL', flag: '🇧🇪' },
  { code: 'en' as const, label: 'EN', flag: '🇬🇧' },
  { code: 'fr' as const, label: 'FR', flag: '🇫🇷' },
];

export default function Navbar() {
  const { t, locale, setLocale } = useLanguage();
  const { itemCount, openCart } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setMobileOpen(false), [location]);

  const navLinks = [
    { to: '/', label: t('nav.home') },
    { to: '/shop', label: t('nav.shop') },
    { to: '/ons-verhaal', label: t('nav.story') },
    { to: '/de-strip', label: t('nav.comic') },
    { to: '/contact', label: t('nav.contact') },
  ];

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'nav-solid shadow-md' : 'nav-transparent'}`}>
        <div className="container mx-auto px-4 flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="font-display text-2xl md:text-3xl gradient-text tracking-tight">
            Loveke
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`font-body font-medium text-sm transition-colors hover:text-primary ${location.pathname === link.to ? 'text-primary' : 'text-foreground'}`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <div className="hidden md:flex items-center gap-1 text-xs font-body">
              {locales.map((l, i) => (
                <span key={l.code} className="flex items-center">
                  {i > 0 && <span className="text-muted-foreground mx-1">|</span>}
                  <button
                    onClick={() => setLocale(l.code)}
                    className={`transition-colors ${locale === l.code ? 'text-primary font-bold' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    {l.flag} {l.label}
                  </button>
                </span>
              ))}
            </div>

            {/* Cart */}
            <button onClick={openCart} className="relative p-2 hover:text-primary transition-colors">
              <ShoppingBag size={22} />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>

            {/* Mobile menu button */}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2">
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed inset-0 z-40 bg-background flex flex-col items-center justify-center gap-6"
          >
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className="font-display text-3xl gradient-text"
              >
                {link.label}
              </Link>
            ))}
            <div className="flex items-center gap-4 mt-8">
              {locales.map(l => (
                <button
                  key={l.code}
                  onClick={() => setLocale(l.code)}
                  className={`text-lg font-body ${locale === l.code ? 'text-primary font-bold' : 'text-muted-foreground'}`}
                >
                  {l.flag} {l.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

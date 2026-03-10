import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSellQoCart } from '@/integrations/sellqo/CartContext';
import type { Product } from '@/integrations/sellqo/types';
import { motion } from 'framer-motion';

const PRESET_AMOUNTS = [5, 10, 20, 25, 30, 40, 50, 60, 70, 80, 90, 100];

interface GiftCardDetailProps {
  product: Product;
}

export default function GiftCardDetail({ product }: GiftCardDetailProps) {
  const { t } = useLanguage();
  const { addItem } = useSellQoCart();
  const [selectedAmount, setSelectedAmount] = useState(25);
  const [customAmount, setCustomAmount] = useState('');
  const [useCustom, setUseCustom] = useState(false);

  const activeAmount = useCustom ? (parseFloat(customAmount) || 0) : selectedAmount;

  const handleAddToCart = () => {
    if (activeAmount <= 0) return;
    addItem({
      product_id: product.id,
      variant_id: product.variants?.[0]?.id || product.id,
      title: product.title,
      variant_title: `€${activeAmount.toFixed(2)}`,
      price: activeAmount,
      quantity: 1,
      image: product.images?.[0]?.url || '',
    });
  };

  const mainImage = product.images?.[0]?.url;
  const plainDescription = product.description?.replace(/<[^>]*>/g, '') || '';

  return (
    <main className="pt-24 pb-16 px-4 min-h-screen">
      <div className="container mx-auto max-w-6xl">
        {/* Breadcrumb */}
        <nav className="font-body text-sm text-muted-foreground mb-8">
          <Link to="/" className="hover:text-primary">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/shop" className="hover:text-primary">{t('nav.shop')}</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{product.title}</span>
        </nav>

        <div className="grid md:grid-cols-2 gap-10 md:gap-16">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="aspect-square bg-card border-3 border-foreground rounded-2xl shadow-card flex items-center justify-center overflow-hidden"
          >
            {mainImage ? (
              <img src={mainImage} alt={product.title} className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-3">
                <span className="text-8xl">🎁</span>
                <span className="font-display text-xl text-muted-foreground">Cadeaukaart</span>
              </div>
            )}
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col"
          >
            <h1 className="font-display text-3xl md:text-4xl mb-2">{product.title}</h1>

            <p className="font-body text-muted-foreground mb-6 leading-relaxed">
              {product.short_description || plainDescription || 'Verras iemand met een Loveke cadeaukaart! Kies zelf het bedrag.'}
            </p>

            {/* Amount selector */}
            <div className="mb-6">
              <span className="font-body font-semibold text-sm mb-3 block">Kies je bedrag</span>
              <div className="flex flex-wrap gap-2 mb-4">
                {PRESET_AMOUNTS.map(amount => (
                  <button
                    key={amount}
                    onClick={() => { setSelectedAmount(amount); setUseCustom(false); }}
                    className={`px-4 py-2 rounded-lg border-2 font-body text-sm transition-all ${
                      !useCustom && selectedAmount === amount
                        ? 'border-foreground bg-foreground text-background'
                        : 'border-border hover:border-foreground'
                    }`}
                  >
                    €{amount}
                  </button>
                ))}
              </div>

              {/* Custom amount */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setUseCustom(true)}
                  className={`px-4 py-2 rounded-lg border-2 font-body text-sm transition-all ${
                    useCustom
                      ? 'border-foreground bg-foreground text-background'
                      : 'border-border hover:border-foreground'
                  }`}
                >
                  Ander bedrag
                </button>
                {useCustom && (
                  <div className="flex items-center border-2 border-foreground rounded-lg overflow-hidden">
                    <span className="px-3 py-2 bg-muted font-body text-sm">€</span>
                    <input
                      type="number"
                      min="1"
                      max="500"
                      value={customAmount}
                      onChange={e => setCustomAmount(e.target.value)}
                      placeholder="0"
                      className="w-20 px-2 py-2 font-body text-sm bg-background focus:outline-none"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Selected amount display */}
            <div className="mb-6 p-4 rounded-xl bg-muted/50 border border-border">
              <span className="font-body text-sm text-muted-foreground">Geselecteerd bedrag:</span>
              <span className="font-display text-2xl text-primary ml-3">
                {activeAmount > 0 ? `€${activeAmount.toFixed(2)}` : '—'}
              </span>
            </div>

            {/* Add to cart */}
            <button
              onClick={handleAddToCart}
              disabled={activeAmount <= 0}
              className="w-full py-4 rounded-xl font-display text-lg gradient-warm text-primary-foreground shadow-sticker hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
            >
              {t('product.addToCart')} 🎁
            </button>

            {/* USP badges */}
            <div className="flex flex-wrap gap-2 mt-6">
              {['Digitale levering', 'Direct bruikbaar', 'Geldig 1 jaar'].map(usp => (
                <span key={usp} className="px-3 py-1 rounded-full bg-card border border-border font-body text-xs">
                  {usp}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}

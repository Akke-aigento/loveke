import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSellQoCart } from '@/integrations/sellqo/CartContext';
import { useCheckGiftCardBalance } from '@/integrations/sellqo/hooks';
import type { Product } from '@/integrations/sellqo/types';
import { motion, AnimatePresence } from 'framer-motion';

const PRESET_AMOUNTS = [5, 10, 20, 25, 30, 40, 50, 60, 70, 80, 90, 100];

interface GiftCardDetailProps {
  product: Product;
}

type Step = 1 | 2 | 3;

export default function GiftCardDetail({ product }: GiftCardDetailProps) {
  const { t } = useLanguage();
  const { addItem } = useSellQoCart();
  const checkBalance = useCheckGiftCardBalance();

  // Step 1: Amount
  const [selectedAmount, setSelectedAmount] = useState(25);
  const [customAmount, setCustomAmount] = useState('');
  const [useCustom, setUseCustom] = useState(false);

  // Step 2: Recipient
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sendDate, setSendDate] = useState('');

  // Step 3 / general
  const [step, setStep] = useState<Step>(1);

  // Balance checker
  const [balanceCode, setBalanceCode] = useState('');
  const [balanceResult, setBalanceResult] = useState<{ balance: number; currency: string } | null>(null);

  const activeAmount = useCustom ? (parseFloat(customAmount) || 0) : selectedAmount;
  const mainImage = product.images?.[0]?.url;

  const canProceedStep1 = activeAmount > 0;
  const canProceedStep2 = recipientName.trim().length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail);

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
    // Reset flow
    setStep(1);
    setRecipientName('');
    setRecipientEmail('');
    setMessage('');
    setSendDate('');
  };

  const handleCheckBalance = async () => {
    if (!balanceCode) return;
    try {
      const result = await checkBalance.mutateAsync(balanceCode);
      setBalanceResult(result);
    } catch {
      setBalanceResult(null);
    }
  };

  const stepLabels = ['Bedrag', 'Ontvanger', 'Bevestiging'];

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

          {/* Right column: steps */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col"
          >
            <h1 className="font-display text-3xl md:text-4xl mb-2">{product.title}</h1>
            <p className="font-body text-muted-foreground mb-6 leading-relaxed">
              {product.short_description || product.description?.replace(/<[^>]*>/g, '') || 'Verras iemand met een Loveke cadeaukaart! Kies zelf het bedrag.'}
            </p>

            {/* Step indicator */}
            <div className="flex items-center gap-2 mb-8">
              {stepLabels.map((label, i) => {
                const stepNum = (i + 1) as Step;
                const isActive = step === stepNum;
                const isDone = step > stepNum;
                return (
                  <div key={label} className="flex items-center gap-2">
                    {i > 0 && <div className={`w-8 h-0.5 ${isDone ? 'bg-foreground' : 'bg-border'}`} />}
                    <button
                      onClick={() => isDone && setStep(stepNum)}
                      disabled={!isDone}
                      className={`flex items-center gap-2 transition-all ${isDone ? 'cursor-pointer' : 'cursor-default'}`}
                    >
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center font-display text-sm border-2 transition-all ${
                        isActive ? 'border-foreground bg-foreground text-background' :
                        isDone ? 'border-foreground bg-foreground text-background' :
                        'border-border text-muted-foreground'
                      }`}>
                        {isDone ? '✓' : stepNum}
                      </span>
                      <span className={`font-body text-sm hidden sm:inline ${isActive ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>
                        {label}
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Step content */}
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex-1"
                >
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

                  <div className="flex items-center gap-3 mb-6">
                    <button
                      onClick={() => setUseCustom(true)}
                      className={`px-4 py-2 rounded-lg border-2 font-body text-sm transition-all ${
                        useCustom ? 'border-foreground bg-foreground text-background' : 'border-border hover:border-foreground'
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

                  <div className="mb-6 p-4 rounded-xl bg-muted/50 border border-border">
                    <span className="font-body text-sm text-muted-foreground">Geselecteerd bedrag:</span>
                    <span className="font-display text-2xl text-primary ml-3">
                      {activeAmount > 0 ? `€${activeAmount.toFixed(2)}` : '—'}
                    </span>
                  </div>

                  <button
                    onClick={() => setStep(2)}
                    disabled={!canProceedStep1}
                    className="w-full py-4 rounded-xl font-display text-lg gradient-warm text-primary-foreground shadow-sticker hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
                  >
                    Volgende →
                  </button>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex-1 space-y-4"
                >
                  <span className="font-body font-semibold text-sm block">Voor wie is deze cadeaukaart?</span>

                  <div>
                    <label className="font-body text-sm text-muted-foreground mb-1 block">Naam ontvanger *</label>
                    <input
                      type="text"
                      value={recipientName}
                      onChange={e => setRecipientName(e.target.value)}
                      placeholder="Naam"
                      className="w-full px-4 py-3 rounded-xl border-2 border-border bg-background font-body focus:outline-none focus:border-foreground"
                    />
                  </div>

                  <div>
                    <label className="font-body text-sm text-muted-foreground mb-1 block">E-mailadres ontvanger *</label>
                    <input
                      type="email"
                      value={recipientEmail}
                      onChange={e => setRecipientEmail(e.target.value)}
                      placeholder="email@voorbeeld.be"
                      className="w-full px-4 py-3 rounded-xl border-2 border-border bg-background font-body focus:outline-none focus:border-foreground"
                    />
                  </div>

                  <div>
                    <label className="font-body text-sm text-muted-foreground mb-1 block">Persoonlijk bericht (optioneel)</label>
                    <textarea
                      value={message}
                      onChange={e => setMessage(e.target.value.slice(0, 500))}
                      placeholder="Schrijf een persoonlijk berichtje..."
                      rows={3}
                      maxLength={500}
                      className="w-full px-4 py-3 rounded-xl border-2 border-border bg-background font-body resize-none focus:outline-none focus:border-foreground"
                    />
                    <span className="font-body text-xs text-muted-foreground">{message.length}/500</span>
                  </div>

                  <div>
                    <label className="font-body text-sm text-muted-foreground mb-1 block">Verzenddatum (optioneel)</label>
                    <input
                      type="date"
                      value={sendDate}
                      onChange={e => setSendDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 rounded-xl border-2 border-border bg-background font-body focus:outline-none focus:border-foreground"
                    />
                    <span className="font-body text-xs text-muted-foreground">Laat leeg voor directe verzending</span>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setStep(1)}
                      className="px-6 py-4 rounded-xl font-display border-2 border-border hover:border-foreground transition-all"
                    >
                      ← Terug
                    </button>
                    <button
                      onClick={() => setStep(3)}
                      disabled={!canProceedStep2}
                      className="flex-1 py-4 rounded-xl font-display text-lg gradient-warm text-primary-foreground shadow-sticker hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
                    >
                      Volgende →
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex-1"
                >
                  <span className="font-body font-semibold text-sm mb-4 block">Overzicht cadeaukaart</span>

                  <div className="rounded-xl border-2 border-border p-5 space-y-3 mb-6">
                    <div className="flex justify-between">
                      <span className="font-body text-muted-foreground">Bedrag</span>
                      <span className="font-display text-lg">€{activeAmount.toFixed(2)}</span>
                    </div>
                    <div className="h-px bg-border" />
                    <div className="flex justify-between">
                      <span className="font-body text-muted-foreground">Ontvanger</span>
                      <span className="font-body">{recipientName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-body text-muted-foreground">E-mail</span>
                      <span className="font-body text-sm">{recipientEmail}</span>
                    </div>
                    {message && (
                      <>
                        <div className="h-px bg-border" />
                        <div>
                          <span className="font-body text-muted-foreground text-sm block mb-1">Bericht</span>
                          <p className="font-body text-sm bg-muted/50 p-3 rounded-lg italic">"{message}"</p>
                        </div>
                      </>
                    )}
                    <div className="h-px bg-border" />
                    <div className="flex justify-between">
                      <span className="font-body text-muted-foreground">Verzending</span>
                      <span className="font-body">{sendDate || 'Direct versturen'}</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setStep(2)}
                      className="px-6 py-4 rounded-xl font-display border-2 border-border hover:border-foreground transition-all"
                    >
                      ← Terug
                    </button>
                    <button
                      onClick={handleAddToCart}
                      className="flex-1 py-4 rounded-xl font-display text-lg gradient-warm text-primary-foreground shadow-sticker hover:scale-105 transition-transform"
                    >
                      {t('product.addToCart')} 🎁
                    </button>
                  </div>

                  {/* USP badges */}
                  <div className="flex flex-wrap gap-2 mt-6">
                    {['Digitale levering', 'Direct bruikbaar', 'Geldig 1 jaar'].map(usp => (
                      <span key={usp} className="px-3 py-1 rounded-full bg-card border border-border font-body text-xs">
                        {usp}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Balance checker */}
        <div className="mt-16 border-t border-border pt-10 max-w-md mx-auto">
          <h3 className="font-display text-lg mb-4 text-center">Saldo controleren</h3>
          <div className="flex gap-3">
            <input
              type="text"
              value={balanceCode}
              onChange={e => setBalanceCode(e.target.value)}
              placeholder="Vul je cadeaukaartcode in"
              className="flex-1 px-4 py-3 rounded-xl border-2 border-border bg-background font-body focus:outline-none focus:border-foreground"
            />
            <button
              onClick={handleCheckBalance}
              disabled={checkBalance.isPending}
              className="px-6 py-3 rounded-xl font-display border-2 border-foreground bg-background shadow-sticker hover:scale-105 transition-transform disabled:opacity-50"
            >
              {checkBalance.isPending ? '...' : 'Controleer'}
            </button>
          </div>
          {balanceResult && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 text-center font-display text-lg">
              Saldo: €{balanceResult.balance.toFixed(2)}
            </motion.p>
          )}
        </div>
      </div>
    </main>
  );
}

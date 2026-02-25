import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePurchaseGiftCard, useCheckGiftCardBalance } from '@/integrations/sellqo/hooks';
import { motion } from 'framer-motion';

const amounts = [25, 50, 75, 100];

export default function GiftCards() {
  const { t } = useLanguage();
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [balanceCode, setBalanceCode] = useState('');
  const [balanceResult, setBalanceResult] = useState<{ balance: number; currency: string } | null>(null);

  const purchaseGiftCard = usePurchaseGiftCard();
  const checkBalance = useCheckGiftCardBalance();

  const handlePurchase = async () => {
    if (!selectedAmount) return;
    try {
      await purchaseGiftCard.mutateAsync({
        amount: selectedAmount,
        email: recipientEmail || undefined,
      });
    } catch {
      // error handling
    }
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

  return (
    <main className="pt-24 pb-16 px-4 min-h-screen">
      <div className="container mx-auto max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="font-display text-5xl md:text-6xl gradient-text mb-3">{t('giftCardsPage.title')}</h1>
          <p className="font-body text-muted-foreground">{t('giftCardsPage.subtitle')}</p>
        </motion.div>

        {/* Amount selection */}
        <div className="mb-8">
          <h3 className="font-display text-lg mb-4 text-center">{t('giftCardsPage.selectAmount')}</h3>
          <div className="flex flex-wrap justify-center gap-4">
            {amounts.map(amount => (
              <motion.button
                key={amount}
                whileHover={{ scale: 1.08, rotate: 2 }}
                onClick={() => setSelectedAmount(amount)}
                className={`w-24 h-24 rounded-2xl border-3 font-display text-xl transition-all shadow-sticker ${
                  selectedAmount === amount
                    ? 'border-foreground gradient-warm text-primary-foreground'
                    : 'border-border bg-card hover:border-foreground'
                }`}
              >
                €{amount}
              </motion.button>
            ))}
          </div>
        </div>

        {selectedAmount && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-md mx-auto space-y-4 mb-12">
            <input
              type="email"
              value={recipientEmail}
              onChange={e => setRecipientEmail(e.target.value)}
              placeholder={t('giftCardsPage.recipientEmail')}
              className="w-full px-4 py-3 rounded-xl border-2 border-border bg-background font-body focus:outline-none focus:border-foreground"
            />
            <button
              onClick={handlePurchase}
              disabled={purchaseGiftCard.isPending}
              className="w-full py-3 rounded-xl font-display gradient-warm text-primary-foreground shadow-sticker hover:scale-105 transition-transform disabled:opacity-50"
            >
              {purchaseGiftCard.isPending ? '...' : `${t('giftCardsPage.addToCart')} 🎁`}
            </button>
          </motion.div>
        )}

        {/* Balance checker */}
        <div className="border-t border-border pt-10 max-w-md mx-auto">
          <h3 className="font-display text-lg mb-4 text-center">{t('giftCardsPage.balanceCheck')}</h3>
          <div className="flex gap-3">
            <input
              type="text"
              value={balanceCode}
              onChange={e => setBalanceCode(e.target.value)}
              placeholder={t('giftCardsPage.balancePlaceholder')}
              className="flex-1 px-4 py-3 rounded-xl border-2 border-border bg-background font-body focus:outline-none focus:border-foreground"
            />
            <button
              onClick={handleCheckBalance}
              disabled={checkBalance.isPending}
              className="px-6 py-3 rounded-xl font-display border-2 border-foreground bg-background shadow-sticker hover:scale-105 transition-transform disabled:opacity-50"
            >
              {checkBalance.isPending ? '...' : t('giftCardsPage.checkBalance')}
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

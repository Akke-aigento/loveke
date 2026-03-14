import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import type { Product } from '@/integrations/sellqo/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { productsAPI } from '@/integrations/sellqo/api';
import { sellqoKeys } from '@/integrations/sellqo/hooks';

const randomRotation = () => (Math.random() - 0.5) * 6;
const borderColors = [
  'border-primary',
  'border-secondary',
  'border-accent',
  'border-destructive',
  'border-loveke-yellow',
  'border-loveke-pink',
];

interface ProductCardProps {
  product: Product;
  index: number;
}

function isGiftCard(product: Product): boolean {
  return product.price === 0 || /cadeaukaart|gift.?card/i.test(product.title);
}

const ProductCard = forwardRef<HTMLDivElement, ProductCardProps>(({ product, index }, ref) => {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const rotation = randomRotation();
  const borderColor = borderColors[index % borderColors.length];
  const giftCard = isGiftCard(product);

  const handleMouseEnter = () => {
    queryClient.prefetchQuery({
      queryKey: sellqoKeys.products.detail(product.slug),
      queryFn: () => productsAPI.getBySlug(product.slug),
    });
  };

  return (
    <motion.div
      ref={ref}
      onMouseEnter={handleMouseEnter}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -8, rotate: 0 }}
      style={{ rotate: rotation }}
    >
      <Link to={`/shop/${product.slug}`} className="block">
        <div className={`sticker-card ${borderColor} bg-card overflow-hidden`}>
          {/* Image */}
          <div className="aspect-square bg-muted relative flex items-center justify-center overflow-hidden">
            {product.images?.[0]?.url ? (
              <img src={product.images[0].url} alt={product.images[0].alt || product.title} className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center justify-center gap-2">
                <span className="text-6xl">🧡</span>
                <span className="font-body text-xs text-muted-foreground">Foto binnenkort</span>
              </div>
            )}
            {!giftCard && product.compare_at_price && (
              <div className="absolute top-2 right-2 bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded-full rotate-6">
                -{Math.round((1 - product.price / product.compare_at_price) * 100)}%
              </div>
            )}
            {product.stock_status === 'low_stock' && (
              <div className="absolute top-2 left-2 bg-secondary text-secondary-foreground text-xs font-bold px-2 py-1 rounded-full -rotate-3">
                ⚡ Low stock
              </div>
            )}
            {product.stock_status === 'out_of_stock' && (
              <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                <span className="font-display text-sm bg-muted px-3 py-1 rounded-full">Uitverkocht</span>
              </div>
            )}
            {giftCard && (
              <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-full -rotate-3">
                🎁
              </div>
            )}
          </div>
          
          {/* Info */}
          <div className="p-4">
            <h3 className="font-display text-sm mb-1 truncate">{product.title}</h3>
            {giftCard ? (
              <div>
                <span className="font-body font-bold text-primary text-sm">Kies je bedrag</span>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {[10, 25, 50, 75, 100].map(amount => (
                    <span key={amount} className="text-[10px] font-body px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                      €{amount}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="font-body font-bold text-primary">
                  €{product.price.toFixed(2)}
                </span>
                {product.compare_at_price && (
                  <span className="font-body text-xs text-muted-foreground line-through">€{product.compare_at_price.toFixed(2)}</span>
                )}
              </div>
            )}
            <div className="mt-3">
              <span className={`inline-flex items-center justify-center px-4 py-1.5 rounded-lg text-xs font-display transition-transform ${
                product.stock_status === 'out_of_stock'
                  ? 'bg-muted text-muted-foreground'
                  : 'gradient-warm text-primary-foreground hover:scale-105'
              }`}>
                {product.stock_status === 'out_of_stock' ? 'Uitverkocht' : giftCard ? 'Kies bedrag' : t('featured.viewProduct')}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;

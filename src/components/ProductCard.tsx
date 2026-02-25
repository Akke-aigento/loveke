import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Product } from '@/integrations/sellqo/types';
import { useLanguage } from '@/contexts/LanguageContext';

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

export default function ProductCard({ product, index }: ProductCardProps) {
  const { t } = useLanguage();
  const rotation = randomRotation();
  const borderColor = borderColors[index % borderColors.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -8, rotate: 0 }}
      style={{ rotate: rotation }}
    >
      <Link to={`/shop/${product.slug}`} className="block">
        <div className={`sticker-card ${borderColor} bg-card overflow-hidden`}>
          {/* Image placeholder */}
          <div className="aspect-square bg-muted relative flex items-center justify-center overflow-hidden">
            {product.images?.[0]?.url ? (
              <img src={product.images[0].url} alt={product.images[0].alt || product.title} className="w-full h-full object-cover" />
            ) : (
              <span className="text-6xl">🧡</span>
            )}
            {product.compare_at_price && (
              <div className="absolute top-2 right-2 bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded-full rotate-6">
                -{Math.round((1 - product.price / product.compare_at_price) * 100)}%
              </div>
            )}
            {product.stock_status === 'low_stock' && (
              <div className="absolute top-2 left-2 bg-secondary text-secondary-foreground text-xs font-bold px-2 py-1 rounded-full -rotate-3">
                ⚡ Low stock
              </div>
            )}
          </div>
          
          {/* Info */}
          <div className="p-4">
            <h3 className="font-display text-sm mb-1 truncate">{product.title}</h3>
            <div className="flex items-center gap-2">
              <span className="font-body font-bold text-primary">€{product.price.toFixed(2)}</span>
              {product.compare_at_price && (
                <span className="font-body text-xs text-muted-foreground line-through">€{product.compare_at_price.toFixed(2)}</span>
              )}
            </div>
            <div className="mt-3">
              <span className="inline-flex items-center justify-center px-4 py-1.5 rounded-lg text-xs font-display gradient-warm text-primary-foreground hover:scale-105 transition-transform">
                {t('featured.viewProduct')}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

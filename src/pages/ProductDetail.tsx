import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { MOCK_PRODUCTS } from '@/lib/sellqo';
import ProductCard from '@/components/ProductCard';
import { motion } from 'framer-motion';
import { Minus, Plus } from 'lucide-react';

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useLanguage();
  const { addItem } = useCart();
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [quantity, setQuantity] = useState(1);

  // In production: useQuery for fetching from SellQo
  const product = MOCK_PRODUCTS.find(p => p.slug === slug);
  const relatedProducts = MOCK_PRODUCTS.filter(p => p.slug !== slug).slice(0, 3);

  if (!product) {
    return (
      <main className="pt-24 pb-16 px-4 min-h-screen flex items-center justify-center">
        <p className="font-handwritten text-2xl text-muted-foreground">Product not found 😢</p>
      </main>
    );
  }

  const variant = product.variants[selectedVariant];

  const handleAddToCart = () => {
    addItem({
      id: `${product.id}-${variant.id}`,
      product_id: product.id,
      variant_id: variant.id,
      title: product.title,
      variant_title: variant.title,
      price: variant.price,
      quantity,
      image: '',
    });
  };

  const stockLabel = {
    in_stock: { text: t('product.inStock'), color: 'text-green-600' },
    low_stock: { text: t('product.lowStock'), color: 'text-secondary-foreground' },
    out_of_stock: { text: t('product.outOfStock'), color: 'text-destructive' },
  }[variant.stock_status];

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
            className="aspect-square bg-card border-3 border-foreground rounded-2xl shadow-card flex items-center justify-center"
          >
            <span className="text-8xl">🧡</span>
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col"
          >
            <h1 className="font-display text-3xl md:text-4xl mb-2">{product.title}</h1>
            
            <div className="flex items-center gap-3 mb-4">
              <span className="font-display text-2xl text-primary">€{variant.price.toFixed(2)}</span>
              {product.compare_at_price && (
                <span className="font-body text-muted-foreground line-through">€{product.compare_at_price.toFixed(2)}</span>
              )}
            </div>

            <p className={`text-sm font-body mb-4 ${stockLabel.color}`}>● {stockLabel.text}</p>

            <p className="font-body text-muted-foreground mb-6 leading-relaxed">{product.description}</p>

            {/* Size selector */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-body font-semibold text-sm">{t('product.size')}</span>
                <Link to="/maatgids" className="font-body text-xs text-primary hover:underline">{t('product.sizeGuide')}</Link>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v, i) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(i)}
                    className={`px-4 py-2 rounded-lg border-2 font-body text-sm transition-all ${
                      selectedVariant === i
                        ? 'border-foreground bg-foreground text-background'
                        : 'border-border hover:border-foreground'
                    } ${v.stock_status === 'out_of_stock' ? 'opacity-40 cursor-not-allowed' : ''}`}
                    disabled={v.stock_status === 'out_of_stock'}
                  >
                    {v.size || v.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-4 mb-6">
              <span className="font-body font-semibold text-sm">{t('product.quantity')}</span>
              <div className="flex items-center border-2 border-border rounded-lg">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 hover:bg-muted transition-colors">
                  <Minus size={16} />
                </button>
                <span className="w-10 text-center font-body font-medium">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="p-2 hover:bg-muted transition-colors">
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Add to cart */}
            <button
              onClick={handleAddToCart}
              disabled={variant.stock_status === 'out_of_stock'}
              className="w-full py-4 rounded-xl font-display text-lg gradient-warm text-primary-foreground shadow-sticker hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
            >
              {t('product.addToCart')} 🛒
            </button>

            {/* USP badges */}
            <div className="flex flex-wrap gap-2 mt-6">
              {[t('product.belgiumMade'), t('product.organicCotton'), t('product.freeComic')].map(usp => (
                <span key={usp} className="px-3 py-1 rounded-full bg-card border border-border font-body text-xs">
                  {usp}
                </span>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Related */}
        {relatedProducts.length > 0 && (
          <div className="mt-20">
            <h2 className="font-display text-2xl mb-8">{t('product.related')}</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {relatedProducts.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSellQoCart } from '@/integrations/sellqo/CartContext';
import { useProduct, useRelatedProducts } from '@/integrations/sellqo/hooks';
import { extractSingle, extractArray } from '@/integrations/sellqo/client';
import { normalizeProduct, normalizeProducts } from '@/integrations/sellqo/normalizer';
import { MOCK_PRODUCTS } from '@/lib/sellqo';
import type { Product } from '@/integrations/sellqo/types';
import ProductCard from '@/components/ProductCard';
import GiftCardDetail from '@/components/GiftCardDetail';
import { motion } from 'framer-motion';
import { Minus, Plus } from 'lucide-react';

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useLanguage();
  const { addItem } = useSellQoCart();
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const { data: apiProductData, isLoading, isError } = useProduct(slug || '');
  const { data: apiRelatedData } = useRelatedProducts(slug || '');

  console.log('Single product API response:', apiProductData);

  // Extract and normalize single product from { success, data: {...} }
  const rawProduct = extractSingle(apiProductData);
  const apiProduct = rawProduct ? normalizeProduct(rawProduct) : null;

  // Fallback to mock data
  const product: Product | undefined = apiProduct || (MOCK_PRODUCTS.find(p => p.slug === slug) as unknown as Product | undefined);

  // Related products
  const rawRelated = extractArray(apiRelatedData);
  const relatedProducts = rawRelated.length > 0
    ? normalizeProducts(rawRelated)
    : (MOCK_PRODUCTS.filter(p => p.slug !== slug).slice(0, 3) as unknown as Product[]);

  if (isLoading) {
    return (
      <main className="pt-24 pb-16 px-4 min-h-screen">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-10 md:gap-16">
            <div className="aspect-square bg-muted rounded-2xl animate-pulse" />
            <div className="space-y-4">
              <div className="h-8 bg-muted rounded w-3/4 animate-pulse" />
              <div className="h-6 bg-muted rounded w-1/4 animate-pulse" />
              <div className="h-20 bg-muted rounded animate-pulse" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="pt-24 pb-16 px-4 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="font-handwritten text-2xl text-muted-foreground mb-4">Product niet gevonden 😢</p>
          <Link to="/shop" className="font-body text-primary hover:underline">← Terug naar shop</Link>
        </div>
      </main>
    );
  }

  // Gift card detection: render special gift card detail page
  const isGiftCardProduct = product.price === 0 || /cadeaukaart|gift.?card/i.test(product.title);
  if (isGiftCardProduct) {
    return <GiftCardDetail product={product} />;
  }

  const variant = product.variants?.[selectedVariant] || product.variants?.[0];
  const variantPrice = variant?.price ?? product.price ?? 0;
  const variantStockStatus = variant?.stock_status ?? product.stock_status ?? 'in_stock';

  const handleAddToCart = () => {
    if (!variant) return;
    addItem({
      product_id: product.id,
      variant_id: variant.id,
      title: product.title,
      variant_title: variant.title,
      price: variantPrice,
      quantity,
      image: product.images?.[0]?.url || '',
    });
  };

  const stockLabel = {
    in_stock: { text: t('product.inStock'), color: 'text-green-600' },
    low_stock: { text: t('product.lowStock'), color: 'text-secondary-foreground' },
    out_of_stock: { text: t('product.outOfStock'), color: 'text-destructive' },
  }[variantStockStatus] || { text: '', color: '' };

  const mainImage = product.images?.[0]?.url;

  // Strip HTML from description for plain text display
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
              <img src={mainImage} alt={product.images?.[0]?.alt || product.title} className="w-full h-full object-cover" />
            ) : (
              <span className="text-8xl">🧡</span>
            )}
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col"
          >
            <h1 className="font-display text-3xl md:text-4xl mb-2 break-words">{product.title}</h1>
            
            <div className="flex items-center gap-3 mb-4">
              <span className="font-display text-2xl text-primary">
                {variantPrice === 0 && /cadeaukaart|gift.?card/i.test(product.title)
                  ? 'Vanaf €5.00'
                  : `€${variantPrice.toFixed(2)}`}
              </span>
              {(variant?.compare_at_price || product.compare_at_price) && (
                <span className="font-body text-muted-foreground line-through">€{(variant?.compare_at_price || product.compare_at_price)?.toFixed(2)}</span>
              )}
            </div>

            {stockLabel.text && (
              <p className={`text-sm font-body mb-4 ${stockLabel.color}`}>● {stockLabel.text}</p>
            )}

            <p className="font-body text-muted-foreground mb-6 leading-relaxed">{product.short_description || plainDescription}</p>

            {/* Size selector - only show if more than 1 variant */}
            {product.variants && product.variants.length > 1 && (
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
                      {v.options?.size || Object.values(v.options || {})[0] || v.title}
                    </button>
                  ))}
                </div>
              </div>
            )}

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
              disabled={variantStockStatus === 'out_of_stock'}
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

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useLanguage } from '@/contexts/LanguageContext';
import type { ProductSizeGuide } from '@/integrations/sellqo/types';
import SizeGuideTable, { hasUsableSizeGuide } from '@/components/SizeGuideTable';

export { hasUsableSizeGuide };

export default function ProductSizeGuideDialog({ guide }: { guide: ProductSizeGuide }) {
  const { t } = useLanguage();

  if (!hasUsableSizeGuide(guide)) return null;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button type="button" className="font-body text-xs text-primary hover:underline">
          {t('product.sizeGuide')}
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-3 border-foreground rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">{t('product.sizeGuideTitle')}</DialogTitle>
        </DialogHeader>
        <SizeGuideTable guide={guide} />
      </DialogContent>
    </Dialog>
  );
}

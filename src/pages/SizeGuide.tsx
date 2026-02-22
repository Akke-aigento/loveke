import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';

const sizeData = {
  tshirts: [
    { size: 'XS', chest: 88, length: 66, shoulder: 42 },
    { size: 'S', chest: 92, length: 68, shoulder: 44 },
    { size: 'M', chest: 98, length: 71, shoulder: 46 },
    { size: 'L', chest: 104, length: 74, shoulder: 49 },
    { size: 'XL', chest: 110, length: 76, shoulder: 52 },
    { size: 'XXL', chest: 118, length: 78, shoulder: 55 },
  ],
  sweaters: [
    { size: 'XS', chest: 92, length: 64, shoulder: 44 },
    { size: 'S', chest: 96, length: 66, shoulder: 46 },
    { size: 'M', chest: 102, length: 69, shoulder: 48 },
    { size: 'L', chest: 108, length: 72, shoulder: 51 },
    { size: 'XL', chest: 114, length: 74, shoulder: 54 },
    { size: 'XXL', chest: 122, length: 76, shoulder: 57 },
  ],
  hoodies: [
    { size: 'XS', chest: 96, length: 66, shoulder: 46 },
    { size: 'S', chest: 100, length: 68, shoulder: 48 },
    { size: 'M', chest: 106, length: 71, shoulder: 50 },
    { size: 'L', chest: 112, length: 74, shoulder: 53 },
    { size: 'XL', chest: 118, length: 76, shoulder: 56 },
    { size: 'XXL', chest: 126, length: 78, shoulder: 59 },
  ],
};

type Category = keyof typeof sizeData;

export default function SizeGuide() {
  const { t } = useLanguage();
  const [category, setCategory] = useState<Category>('tshirts');

  const categories: { key: Category; label: string }[] = [
    { key: 'tshirts', label: t('sizeGuide.tshirts') },
    { key: 'sweaters', label: t('sizeGuide.sweaters') },
    { key: 'hoodies', label: t('sizeGuide.hoodies') },
  ];

  return (
    <main className="pt-24 pb-16 px-4 min-h-screen">
      <div className="container mx-auto max-w-3xl">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-5xl md:text-6xl text-center gradient-text mb-10"
        >
          {t('sizeGuide.title')}
        </motion.h1>

        {/* Category tabs */}
        <div className="flex justify-center gap-3 mb-10">
          {categories.map(cat => (
            <button
              key={cat.key}
              onClick={() => setCategory(cat.key)}
              className={`px-5 py-2 rounded-full font-display text-sm border-2 transition-all ${
                category === cat.key
                  ? 'border-foreground bg-foreground text-background shadow-sticker'
                  : 'border-border hover:border-foreground'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Table */}
        <motion.div
          key={category}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-3 border-foreground rounded-2xl overflow-hidden shadow-card"
        >
          <table className="w-full">
            <thead>
              <tr className="bg-foreground text-background">
                <th className="py-3 px-4 text-left font-display text-sm">{t('sizeGuide.size')}</th>
                <th className="py-3 px-4 text-center font-display text-sm">{t('sizeGuide.chest')}</th>
                <th className="py-3 px-4 text-center font-display text-sm">{t('sizeGuide.length')}</th>
                <th className="py-3 px-4 text-center font-display text-sm">{t('sizeGuide.shoulder')}</th>
              </tr>
            </thead>
            <tbody>
              {sizeData[category].map((row, i) => (
                <tr key={row.size} className={i % 2 === 0 ? 'bg-card' : 'bg-background'}>
                  <td className="py-3 px-4 font-display">{row.size}</td>
                  <td className="py-3 px-4 text-center font-body">{row.chest}</td>
                  <td className="py-3 px-4 text-center font-body">{row.length}</td>
                  <td className="py-3 px-4 text-center font-body">{row.shoulder}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        {/* Akke's tip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-10"
        >
          <div className="speech-bubble bg-secondary max-w-lg mx-auto">
            <p className="font-handwritten text-lg">💬 {t('sizeGuide.tip')}</p>
          </div>
        </motion.div>
      </div>
    </main>
  );
}

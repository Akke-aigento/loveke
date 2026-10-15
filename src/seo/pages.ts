// Eén bron voor titel en beschrijving per vaste pagina. Gebruikt door de Vite-plugin
// seo-pages-plugin.ts (per route een eigen HTML-bestand met head + canonical, plus sitemap.xml)
// en door RouteMeta (titel bij navigatie). Productpagina's (/shop/:slug) zijn dynamisch en
// vallen terug op index.html (zonder canonical).

import { withOverride } from "./insights";

export const SITE_URL = "https://loveke.be";

export type PageMeta = {
  path: string;
  title: string;
  description: string;
  noindex?: boolean;
  priority?: number;
};

export const PAGES: PageMeta[] = [
  {
    path: "/",
    title: "Loveke — Belgische streetwear geboren uit liefde",
    description:
      "Belgische streetwear met een verhaal: van een hostel in Bratislava tot tees en hoodies, gedrukt op bestelling. Gratis verzending. Shop de collectie.",
    priority: 1.0,
  },
  {
    path: "/shop",
    title: "Shop de collectie — Belgische streetwear | Loveke",
    description:
      "Shop de Loveke-collectie: Belgische streetwear met een verhaal. Oversized tees, hoodies, sweaters en tanktops, gedrukt op bestelling. Gratis verzending.",
    priority: 0.9,
  },
  {
    path: "/ons-verhaal",
    title: "Ons verhaal — hoe Loveke begon in Bratislava | Loveke",
    description:
      "Een koosnaampje werd een merk. Lees hoe Loveke begon: van een hostel in Bratislava in 2024, via een treinrit naar Oekraïne, tot Belgische streetwear.",
    priority: 0.7,
  },
  {
    path: "/de-strip",
    title: "De strip — het Loveke-verhaal als stripverhaal | Loveke",
    description: "Het liefdesverhaal achter Loveke, getekend als stripverhaal. Van Bratislava tot België, in beelden.",
    priority: 0.6,
  },
  {
    path: "/maatgids",
    title: "Maatgids — vind je juiste maat | Loveke",
    description: "Twijfel je over je maat? In de Loveke-maatgids vind je per model de afmetingen, zodat je in één keer de juiste maat kiest.",
    priority: 0.5,
  },
  {
    path: "/contact",
    title: "Contact — stuur ons een berichtje | Loveke",
    description: "Vraag over je bestelling, een maat of samenwerking? Stuur Loveke een berichtje, we antwoorden snel.",
    priority: 0.5,
  },
];

export function metaFor(pathname: string): PageMeta | undefined {
  const p = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  const m = PAGES.find((x) => x.path === p);
  // Goedgekeurde teksten uit Akke Insights gaan voor (zelfde bron als de statische head).
  return m ? withOverride(m) : undefined;
}

import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { metaFor } from "./pages";

/** Houdt titel en beschrijving in de browser gelijk met src/seo/pages.ts bij elke navigatie. */
export function useRouteMeta() {
  const { pathname } = useLocation();
  useEffect(() => {
    const meta = metaFor(pathname);
    if (!meta) return;
    document.title = meta.title;
    document.head.querySelector('meta[name="description"]')?.setAttribute("content", meta.description);
  }, [pathname]);
}

export function RouteMeta() {
  useRouteMeta();
  return null;
}

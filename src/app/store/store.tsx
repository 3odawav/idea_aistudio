import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Product } from "../data/types";
import { ART_CERAMIC_PRODUCTS } from "../data/artceramicImport";
import { fetchAbaElMozahemProducts } from "../data/abaElMozahemImport";
import { useBackend } from "../backend/db";
import { supabase } from "../backend/supabaseClient";

export interface QuoteItem {
  productId: string;
  quantity: number;
  unit: "sqm" | "pieces";
}

interface StoreCtx {
  products: Product[];
  stagedProductCount: number;
  catalogueLoadState: "loading" | "ready" | "unavailable";
  favorites: string[];
  quote: QuoteItem[];
  compare: string[];
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  addToQuote: (id: string, unit: "sqm" | "pieces") => void;
  updateQuoteQty: (id: string, qty: number) => void;
  removeFromQuote: (id: string) => void;
  clearQuote: () => void;
  toggleCompare: (id: string) => void;
}

const Ctx = createContext<StoreCtx | null>(null);

function usePersisted<T>(key: string, initial: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [val, setVal] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch {
      /* ignore */
    }
  }, [key, val]);
  return [val, setVal];
}

export function StoreProvider({ children }: { children: ReactNode }) {
  // Products imported from the source export. Unconfirmed fields stay empty.
  const [products] = useState<Product[]>(() => ART_CERAMIC_PRODUCTS.filter(product => product.approved));
  const [stagedProductCount, setStagedProductCount] = useState(0);
  const [catalogueLoadState, setCatalogueLoadState] = useState<"loading" | "ready" | "unavailable">("loading");
  useEffect(() => {
    let active = true;
    fetchAbaElMozahemProducts()
      .then(incoming => {
        if (!active) return;
        setStagedProductCount(incoming.filter(product => !product.approved).length);
        setCatalogueLoadState("ready");
      })
      .catch(() => { if (active) setCatalogueLoadState("unavailable"); });
    return () => { active = false; };
  }, []);
  const { session } = useBackend();
  const [favorites, setFavorites] = usePersisted<string[]>("idea.favorites", ["manila-95", "venezia-96"]);
  useEffect(() => {
    if (!session || !supabase) return;
    void supabase.from("favorites").select("catalog_product_id").eq("profile_id", session.id)
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          setFavorites((prev) => [...new Set([...prev, ...data.map((row: any) => row.catalog_product_id)])]);
        }
      })
      .catch(() => {});
  }, [session?.id]);
  const [quote, setQuote] = usePersisted<QuoteItem[]>("idea.quote", []);
  const [compare, setCompare] = usePersisted<string[]>("idea.compare", []);

  const value = useMemo<StoreCtx>(
    () => ({
      products,
      stagedProductCount,
      catalogueLoadState,
      favorites,
      quote,
      compare,
      isFavorite: (id) => favorites.includes(id),
      toggleFavorite: (id) => {
        const wasFavorite = favorites.includes(id);
        setFavorites((current) => wasFavorite ? current.filter((value) => value !== id) : [...current, id]);
        if (session && supabase) {
          const query = supabase.from("favorites");
          void (wasFavorite ? query.delete().eq("profile_id", session.id).eq("catalog_product_id", id) : query.insert({ profile_id: session.id, catalog_product_id: id }))
            .then(({ error }) => { if (error) console.error("IDEA favorite update failed", error); });
        }
      },
      toggleCompare: (id) =>
        setCompare((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id].slice(-4))),
      addToQuote: (id, unit) =>
        setQuote((q) =>
          q.some((i) => i.productId === id)
            ? q
            : [...q, { productId: id, quantity: unit === "sqm" ? 10 : 1, unit }]
        ),
      updateQuoteQty: (id, qty) =>
        setQuote((q) => q.map((i) => (i.productId === id ? { ...i, quantity: Math.max(1, qty) } : i))),
      removeFromQuote: (id) => setQuote((q) => q.filter((i) => i.productId !== id)),
      clearQuote: () => setQuote([]),
    }),
    [products, stagedProductCount, catalogueLoadState, favorites, quote, compare, session, setQuote, setCompare]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useStore must be used within StoreProvider");
  return c;
}

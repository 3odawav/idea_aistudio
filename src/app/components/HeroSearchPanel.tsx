import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Search, SlidersHorizontal } from "lucide-react";
import { useI18n } from "../i18n/i18n";
import "./Discovery.css";

const TECHNOLOGIES = [
  { id: "porcelain", label: { en: "Porcelain tiles", ar: "بورسلين", fr: "Carrelage porcelaine" } },
  { id: "ceramics", label: { en: "Ceramic tiles", ar: "سيراميك", fr: "Carrelage céramique" } },
  { id: "marble", label: { en: "Natural marble", ar: "رخام طبيعي", fr: "Marbre naturel" } },
  { id: "large", label: { en: "XXL Large format slabs", ar: "ألواح XXL كبيرة", fr: "Grandes dalles XXL" } },
  { id: "outdoor20", label: { en: "2 Cm Outdoor collections", ar: "خامات خارجية 2 سم", fr: "Extérieur 2 cm" } },
];

const DESTINATIONS = [
  { id: "bathroom", label: { en: "Bathroom", ar: "الحمام", fr: "Salle de bain" } },
  { id: "kitchen", label: { en: "Kitchen", ar: "المطبخ", fr: "Cuisine" } },
  { id: "living", label: { en: "Livingroom", ar: "غرفة المعيشة", fr: "Salon" } },
  { id: "bedroom", label: { en: "Bedroom", ar: "غرفة النوم", fr: "Chambre" } },
  { id: "commercial", label: { en: "Commercial", ar: "المساحات التجارية", fr: "Commercial" } },
  { id: "outdoor", label: { en: "Outdoor", ar: "المساحات الخارجية", fr: "Extérieur" } },
  { id: "pool", label: { en: "Swimming Pool", ar: "حمام السباحة", fr: "Piscine" } },
];

const LOOKS = [
  { id: "marble", label: { en: "Marble Look", ar: "تأثير الرخام", fr: "Aspect marbre" } },
  { id: "wood", label: { en: "Wood Look", ar: "تأثير الخشب", fr: "Aspect bois" } },
  { id: "stone", label: { en: "Stone Look", ar: "تأثير الحجر", fr: "Aspect pierre" } },
  { id: "colour", label: { en: "Color Look", ar: "تأثير الألوان", fr: "Aspect couleur" } },
  { id: "pattern", label: { en: "Pattern Look", ar: "تأثير النقوش", fr: "Aspect motif" } },
];

const SIZES = [
  "60 × 120 cm",
  "60 × 60 cm",
  "120 × 120 cm",
  "80 × 160 cm",
  "30 × 60 cm",
  "20 × 120 cm",
  "30 × 90 cm",
];

export function HeroSearchPanel({ advanced = true }: { advanced?: boolean }) {
  const { locale } = useI18n();
  const nav = useNavigate();
  const text = (en: string, ar: string, fr: string) => ({ en, ar, fr })[locale];

  const [tab, setTab] = useState<"filter" | "search">("filter");
  const [technology, setTechnology] = useState("");
  const [destination, setDestination] = useState("");
  const [look, setLook] = useState("");
  const [size, setSize] = useState("");
  const [q, setQ] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (tab === "search") {
      if (q.trim()) params.set("q", q.trim());
    } else {
      if (technology === "ceramics" || technology === "porcelain") {
        params.set("category", technology);
      } else if (technology === "marble") {
        params.set("material", "marble");
      } else if (technology === "large") {
        params.set("format", "large");
      } else if (technology === "outdoor20") {
        params.set("format", "outdoor20");
      }

      if (destination) params.set("usage", destination);
      if (look) params.set("material", look);
      if (size) params.set("size", size);
    }
    nav(`/products?${params.toString()}`);
  };

  return (
    <section className="idea-discovery-search" aria-label={text("Advanced Search", "البحث المتقدم", "Recherche avancée")}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 26, fontWeight: 500, margin: "0 0 6px", color: "var(--idea-text)" }}>
          {text("Advanced search", "البحث المتقدم", "Recherche avancée")}
        </h2>
        <p style={{ color: "var(--idea-gold-bright)", fontSize: 13, margin: 0, fontWeight: 500 }}>
          {text("Please select technology first.", "يرجى اختيار نوع الخامة أولاً.", "Veuillez sélectionner la technologie d'abord.")}
        </p>
      </div>

      <div className="idea-discovery-tabs" role="tablist">
        <button
          role="tab"
          aria-selected={tab === "filter"}
          onClick={() => setTab("filter")}
        >
          <SlidersHorizontal size={16} />
          {text("Filter by specifications", "تصفية حسب المواصفات", "Filtrer par critères")}
        </button>
        <button
          role="tab"
          aria-selected={tab === "search"}
          onClick={() => setTab("search")}
        >
          <Search size={16} />
          {text("Search by product name / code", "البحث بالاسم أو الكود", "Recherche par nom ou code")}
        </button>
      </div>

      <form onSubmit={handleSubmit} className={`idea-discovery-form${tab === "search" ? " is-name" : ""}`}>
        {tab === "search" ? (
          <label>
            {text("Product name or code", "اسم المنتج أو الكود", "Nom ou référence")}
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={text("Search the catalogue (e.g. Manila, Toronto, 60x120…)", "ابحث في الكتالوج (مثال: مانيلا، تورونتو، 60x120…)", "Rechercher dans le catalogue…")}
            />
          </label>
        ) : (
          <>
            <label>
              {text("TECHNOLOGY", "الخامة / التكنولوجيا", "TECHNOLOGIE")}
              <select value={technology} onChange={(e) => setTechnology(e.target.value)}>
                <option value="">{text("Choose technology", "اختر الخامة", "Choisir la technologie")}</option>
                {TECHNOLOGIES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label[locale]}
                  </option>
                ))}
              </select>
            </label>

            <label>
              {text("DESTINATION OF USE", "مكان الاستخدام", "DESTINATION D'USAGE")}
              <select value={destination} onChange={(e) => setDestination(e.target.value)}>
                <option value="">{text("All destinations", "جميع المساحات", "Toutes destinations")}</option>
                {DESTINATIONS.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.label[locale]}
                  </option>
                ))}
              </select>
            </label>

            <label>
              {text("LOOK", "المظهر / التأثير", "ASPECT")}
              <select value={look} onChange={(e) => setLook(e.target.value)}>
                <option value="">{text("All looks", "جميع التأثيرات", "Tous les aspects")}</option>
                {LOOKS.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.label[locale]}
                  </option>
                ))}
              </select>
            </label>

            <label>
              {text("SIZE", "المقاس", "FORMAT")}
              <select value={size} onChange={(e) => setSize(e.target.value)}>
                <option value="">{text("All sizes", "جميع المقاسات", "Tous formats")}</option>
                {SIZES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
          </>
        )}

        <button className="idea-discovery-submit" type="submit">
          <Search size={16} />
          {text("SEARCH", "بحث", "RECHERCHER")}
        </button>
      </form>

      <div className="idea-discovery-shortcuts">
        <Link to="/subscriptions">{text("Memberships", "العضويات", "Abonnements")}</Link>
        <Link to="/register/business">{text("For professionals", "للمحترفين والشركات", "Pour les professionnels")}</Link>
        <Link to="/room-designer">{text("Room designer", "مصمم الغرف", "Configurateur")}</Link>
      </div>
    </section>
  );
}

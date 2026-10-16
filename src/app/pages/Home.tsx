import { Link } from "react-router";
import { ArrowRight, Layers, FileText, Sparkles, Users, Play } from "lucide-react";
import { useI18n } from "../i18n/i18n";
import { useStore } from "../store/store";
import { COLLECTIONS } from "../data/catalog";
import { HeroCarousel } from "../components/HeroCarousel";
import { HeroSearchPanel } from "../components/HeroSearchPanel";
import { ProductCard } from "../components/ProductCard";
import { SurfaceMaterialStrip } from "../components/SurfaceMaterialStrip";
import { FeaturedCollectionStrip } from "../components/FeaturedCollectionStrip";
import "./Home.css";
import "../components/Discovery.css";
import { LOOKS, DESTINATIONS } from "../data/discovery";
import { GUIDES } from "./Resources";
import { useCollectionDestinations } from "../components/useCollectionDestinations";

const EDITORIALS = [
  {
    image: "porcelain",
    href: "/collections/porcelain",
    title: {
      en: "Porcelain tiles. Outstanding surface effects.",
      ar: "بلاط بورسلين. تأثيرات أسطح متميزة واستثنائية.",
      fr: "Carrelage porcelaine. Effets de surface remarquables.",
    },
    body: {
      en: "A refined living room, a brilliant character for your home. Get inspired by our finest collections.",
      ar: "غرفة معيشة راقية وطابع متألق لمنزلك. استلهم من أفضل مجموعاتنا المختارة.",
      fr: "Un salon raffiné et un caractère éclatant pour votre intérieur. Inspirez-vous de nos collections.",
    },
    cta: { en: "FIND YOUR INSPIRATION", ar: "اكتشف إلهامك", fr: "TROUVEZ VOTRE INSPIRATION" },
  },
  {
    image: "ceramics",
    href: "/collections/ceramics",
    title: {
      en: "Ceramic tiles. Best solution for floors and walls.",
      ar: "بلاط سيراميك. الحل الأفضل للحوائط والأرضيات.",
      fr: "Carrelage céramique. La solution idéale pour sols et murs.",
    },
    body: {
      en: "Ceramic tiles are the solution to maintain your rooms brilliant, always looking brand new.",
      ar: "بلاط السيراميك هو الحل للحفاظ على مساحتك مشرقة ودائمة التجدد.",
      fr: "Le carrelage céramique préserve la brillance et la fraîcheur de vos pièces au quotidien.",
    },
    cta: { en: "FIND YOUR INSPIRATION", ar: "اكتشف إلهامك", fr: "TROUVEZ VOTRE INSPIRATION" },
  },
  {
    image: "marble",
    href: "/products?format=large",
    title: {
      en: "XXL Porcelain Tile. The big size for extreme enlarging effect.",
      ar: "بلاط بورسلين XXL. المقاس الكبير لإحساس فائق بالاتساع.",
      fr: "Dalles XXL en porcelaine. Le grand format pour un effet grandiose.",
    },
    body: {
      en: "XXL Porcelain 120x120 creates an effect of continuity that enlarges the ambience in any residential or commercial application. Your space will look bigger and wider than ever.",
      ar: "بورسلين XXL مقاس 120x120 يصنع إحساسًا متصلاً يعزز اتساع المساحة في أي تطبيق سكني أو تجاري.",
      fr: "Le format XXL 120x120 crée une continuité visuelle qui sublime les espaces résidentiels et commerciaux.",
    },
    cta: { en: "DISCOVER XXL SIZE", ar: "اكتشف مقاسات XXL", fr: "DÉCOUVRIR LE GRAND FORMAT" },
  },
];

const BATH_SLUGS = ["bathroom-sets", "bathroom-units", "faucets", "shower-units", "bathtubs", "bathroom-accessories"];

export function Home() {
  const { locale, t } = useI18n();
  const { products } = useStore();
  const destinations = useCollectionDestinations();
  const text = (en: string, ar: string, fr: string) => ({ en, ar, fr })[locale];

  return (
    <div className="idea-home-editorial">
      {/* 1. Hero Carousel */}
      <HeroCarousel />

      {/* 2. Quick USP Bar */}
      <div className="idea-usp">
        {[
          { icon: Layers, to: "/products", title: text("Premium surface inspiration", "إلهام بخامات فاخرة", "Inspiration haut de gamme"), sub: text("Explore materials & finishes", "اكتشف الخامات والتشطيبات", "Matières & finitions") },
          { icon: FileText, to: "/request-quote/new", title: text("Private quote requests", "طلبات عروض أسعار خاصة", "Devis privés"), sub: text("Specify your project needs", "حدد احتياجات مشروعك", "Précisez votre projet") },
          { icon: Sparkles, to: "/room-designer", title: text("Room planning", "تخطيط الغرف", "Conception de pièces"), sub: text("Visualize your palette", "تخيّل تنسيق خاماتك", "Visualisez votre palette") },
          { icon: Users, to: "/register/business", title: text("For professionals", "للمحترفين والشركات", "Pour les professionnels"), sub: text("Explore business registration", "اكتشف تسجيل الشركات", "Inscription professionnelle") },
        ].map((item) => (
          <Link to={item.to} key={item.to}>
            <item.icon size={22} />
            <span>
              {item.title}
              <small>{item.sub}</small>
            </span>
          </Link>
        ))}
      </div>

      {/* 3. Advanced Search Panel (Retain exactly ONE on homepage immediately below hero) */}
      <HeroSearchPanel advanced />

      {/* 4. Featured Collections Carousel */}
      <FeaturedCollectionStrip />

      {/* 5. Editorial Stories: Find Your Inspiration (Alternating layout from reference image) */}
      <section className="idea-home-section">
        <p className="idea-home-kicker">{text("Find your inspiration", "اكتشف إلهامك", "Trouvez votre inspiration")}</p>
        {EDITORIALS.map((item, index) => (
          <article className={`idea-home-story${index % 2 ? " idea-home-story-reverse" : ""}`} key={item.image}>
            <Link to={item.href || destinations[item.image as keyof typeof destinations]} className="idea-home-story-image" aria-label={item.title[locale]}>
              <img src={`/images/featured/${item.image}.webp`} alt={item.title[locale]} loading="lazy" width={1600} height={900} />
            </Link>
            <div className="idea-home-story-copy">
              <h2>{item.title[locale]}</h2>
              <p>{item.body[locale]}</p>
              <Link className="idea-home-text-link" to={item.href || destinations[item.image as keyof typeof destinations]}>
                {item.cta[locale]} <ArrowRight size={16} />
              </Link>
            </div>
          </article>
        ))}
      </section>

      {/* 6. Search by Look (Stone, Wood, Marble, Color, Pattern - Luxury square cards) */}
      <section className="idea-home-section idea-home-look-section">
        <h2 className="idea-home-centered-title">{text("Search by look", "تصفح حسب شكل الخامة", "Explorer par aspect")}</h2>
        <div className="idea-home-looks">
          {LOOKS.map((look) => (
            <Link key={look.id} to={`/tile-showroom/${look.id}`} className="idea-look-tile">
              <img src={`/images/featured/${look.image}.webp`} alt={look.label[locale]} width={320} height={320} loading="lazy" />
              <div className="idea-look-overlay">
                <span>{look.label[locale]}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 7. Surface Materials Strip */}
      <SurfaceMaterialStrip />

      {/* 8. Visualize directly in your home! (Split Configurator Banner matching reference mockup) */}
      <section className="idea-home-section idea-configurator-banner">
        <div className="idea-configurator-card">
          <div className="idea-configurator-content">
            <h2>{text("Visualize our products directly in your home!", "تخيّل منتجاتنا مباشرة في بيتك!", "Visualisez nos produits directement chez vous !")}</h2>
            <p>
              {text(
                "Choose in a tap the surface you desire to design floors and walls. Try now our interactive room configurator in IDEA!",
                "اختر بلمسة واحدة الخامة اللي بتفضلها لتصميم الأرضيات والحوائط. جرّب الآن مصمم الغرف التفاعلي من IDEA!",
                "Sélectionnez d'un geste la surface idéale pour vos sols et murs avec notre configurateur interactif !"
              )}
            </p>
            <Link className="idea-configurator-btn" to="/room-designer/new">
              {text("CHOOSE A COLLECTION", "اختر مجموعة وابدأ", "CHOISIR UNE COLLECTION")}
            </Link>
          </div>
          <div className="idea-configurator-media">
            <img
              src="/images/featured/wood.webp"
              alt={text("Room Visualizer in action", "مصمم الغرف ثلاثي الأبعاد", "Configurateur de pièces")}
              loading="lazy"
              width={800}
              height={500}
            />
            <div className="idea-configurator-badge">
              <Sparkles size={16} color="var(--idea-gold-bright)" />
              <span>{text("Live 2D Surface Simulator", "محاكي الأسطح المباشر", "Simulateur 2D en direct")}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Search your destination (Bathroom, Living room, Kitchen, Bedroom, Commercial, Pool, Outdoor) */}
      <section className="idea-home-section">
        <h2 className="idea-home-centered-title">{text("Search your destination", "اختار مساحتك", "Choisissez votre espace")}</h2>
        <div className="idea-destination-grid">
          {DESTINATIONS.map((d) => (
            <Link key={d.id} to={`/inspiration/${d.id}`} className="idea-destination-card">
              <img src={`/images/featured/${d.image}.webp`} alt={d.label[locale]} loading="lazy" width={600} height={450} />
              <span>{d.label[locale]}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 10. Showroom Architectural Banner */}
      <section className="idea-home-section idea-home-showroom-section">
        <div className="idea-showroom-banner">
          <img src="/images/featured/stone.webp" alt={text("IDEA Showroom experience", "معرض IDEA للخامات", "Showroom IDEA")} loading="lazy" width={1600} height={700} />
          <div className="idea-showroom-overlay">
            <h2>{text("Showroom", "معرض الخامات", "Showroom")}</h2>
            <p>
              {text(
                "Large, refined and welcoming spaces to introduce you to IDEA's experience and in the world of its superior ceramic tile, porcelain slabs and architectural surface collections.",
                "مساحات راقية ومصممة بعناية لتعيش تجربة IDEA في عالم السيراميك والبورسلين والأسطح المعمارية الفاخرة.",
                "Des espaces raffinés et accueillants pour découvrir l'expérience IDEA et l'univers des surfaces architecturales d'exception."
              )}
            </p>
            <Link className="idea-showroom-cta" to="/showrooms">
              {text("FIND YOUR NEAREST SHOWROOM", "استكشف أقرب معرض", "TROUVER LE SHOWROOM LE PLUS PROCHE")} <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* 11. Video Inspiration Banner */}
      <section className="idea-home-section">
        <div className="idea-video-banner">
          <img src="/images/featured/marble.webp" alt="Video inspiration" loading="lazy" width={1600} height={500} />
          <div className="idea-video-overlay">
            <h2>{text("Discover IDEA inspiration", "اكتشف إلهام IDEA", "Découvrez l'inspiration IDEA")}</h2>
            <Link className="idea-video-btn" to="/videos">
              <Play size={16} fill="currentColor" /> {text("WATCH VIDEO GALLERY", "شاهد معرض الفيديو", "VOIR LA GALERIE VIDÉO")}
            </Link>
          </div>
        </div>
      </section>

      {/* 12. Worldwide Projects (Projects in Egypt & International Projects) */}
      <section className="idea-home-section">
        <div className="idea-projects-header">
          <div>
            <h2 className="idea-home-centered-title" style={{ margin: 0, textAlign: "start" }}>
              {text("Worldwide Projects", "المشروعات حول العالم", "Projets internationaux")}
            </h2>
            <p style={{ color: "var(--idea-text-muted)", margin: "6px 0 0", fontSize: 14 }}>
              {text(
                "Our architectural surfaces satisfy the needs of prestigious projects, renovations and new constructions.",
                "خاماتنا المعمارية تلبي متطلبات أرقى المشروعات والإنشاءات الحديثة.",
                "Nos surfaces répondent aux exigences des projets les plus prestigieux."
              )}
            </p>
          </div>
        </div>
        <div className="idea-projects-grid">
          <Link to="/projects" className="idea-project-card">
            <img src="/images/featured/porcelain.webp" alt="Projects in Egypt" loading="lazy" width={800} height={450} />
            <div className="idea-project-copy">
              <h3>{text("Projects in Egypt", "مشروعات في مصر", "Projets en Égypte")}</h3>
              <span className="idea-project-link">{text("SHOW ALL", "عرض الكل", "TOUT VOIR")} →</span>
            </div>
          </Link>
          <Link to="/projects" className="idea-project-card">
            <img src="/images/featured/tiles.webp" alt="International Projects" loading="lazy" width={800} height={450} />
            <div className="idea-project-copy">
              <h3>{text("International Projects", "مشروعات دولية", "Projets internationaux")}</h3>
              <span className="idea-project-link">{text("SHOW ALL", "عرض الكل", "TOUT VOIR")} →</span>
            </div>
          </Link>
        </div>
      </section>

      {/* 13. Latest News & Design Notes */}
      <section className="idea-home-section">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
          <h2 className="idea-home-centered-title" style={{ margin: 0 }}>
            {text("Latest news", "أحدث الأخبار والأدلة", "Dernières actualités")}
          </h2>
          <Link className="idea-home-text-link" to="/journal">
            {text("ALL NEWS", "كل الأخبار", "TOUTES LES ACTUALITÉS")} <ArrowRight size={14} />
          </Link>
        </div>
        <div className="idea-home-journal">
          {GUIDES.map((g) => (
            <Link key={g.id} to={`/journal/${g.id}`} className="idea-news-card">
              <img src={`/images/featured/${g.image}.webp`} alt="" loading="lazy" width={600} height={450} />
              <div className="idea-news-date">OCTOBER, 2026</div>
              <h3>{g.title[locale]}</h3>
              <p className="idea-news-read">{text("READ MORE", "اقرأ المزيد", "LIRE LA SUITE")} →</p>
            </Link>
          ))}
        </div>
      </section>

      {/* 14. Sanitary Ware & Bathroom Solutions */}
      <section className="idea-home-section">
        <h2 className="idea-home-centered-title">{t("home.sanitary")}</h2>
        <div className="idea-home-bath-grid">
          {BATH_SLUGS.map((slug) => {
            const c = COLLECTIONS.find((item) => item.slug === slug)!;
            return (
              <Link className="idea-home-bath-card" to={`/collections/${slug}`} key={slug}>
                <img src={c.image} alt={c.title[locale]} width={600} height={450} loading="lazy" />
                <span>{c.title[locale]}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 15. Verified Product Catalogue Grid with direct Site Links (/product/:slug) */}
      {products.length > 0 && (
        <section className="idea-home-section">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 28 }}>
            <div>
              <div className="idea-eyebrow">VERIFIED SPECIFICATIONS</div>
              <h2 className="idea-home-centered-title" style={{ textAlign: "start", margin: "4px 0 0" }}>
                {t("home.featured")}
              </h2>
            </div>
            <Link className="idea-home-text-link" to="/products">
              {t("action.browseAll")} <ArrowRight size={16} />
            </Link>
          </div>
          <div className="idea-home-products">
            {products.slice(0, 8).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* 16. Private Quote Request Banner */}
      <section className="idea-home-section idea-home-quote">
        <h2>{text("Request a private quote", "اطلب عرض سعر خاص", "Demandez un devis privé")}</h2>
        <p>{t("home.bestPriceBody")}</p>
        <Link className="idea-home-text-link" to="/request-quote/new">
          {t("action.requestPrice")} <ArrowRight size={16} />
        </Link>
      </section>

      {/* 17. Newsletter & Social bar */}
      <section className="idea-home-section" style={{ paddingTop: 0 }}>
        <div className="idea-home-newsletter">
          <div>
            <h2>{text("Stay tuned, subscribe to our mailing list.", "خليك دايمًا مُلهم. اشترك في قائمتنا البريدية.", "Restez inspiré, abonnez-vous.")}</h2>
            <p>
              {text(
                "Receive updates on new collections, large format slab arrivals and technical architectural guides.",
                "تابع جديد المجموعات، وصول ألواح البورسلين الكبيرة وأدلة التشطيب الفنية.",
                "Recevez les nouveautés, arrivages grands formats et guides techniques."
              )}
            </p>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              alert(text("Thank you for subscribing to IDEA updates.", "شكرًا لاشتراكك في تحديثات IDEA.", "Merci pour votre inscription."));
            }}
            style={{ display: "flex", gap: 8, width: "100%", maxWidth: 380 }}
          >
            <input
              type="email"
              placeholder={text("Enter your email", "أدخل بريدك الإلكتروني", "Votre adresse email")}
              required
              style={{
                flex: 1,
                padding: "10px 14px",
                borderRadius: "var(--idea-radius-sm)",
                border: "var(--idea-hairline)",
                background: "var(--idea-bg-2)",
                color: "var(--idea-text)",
              }}
            />
            <button
              type="submit"
              style={{
                background: "var(--idea-gold)",
                color: "#fff",
                border: "none",
                borderRadius: "var(--idea-radius-sm)",
                padding: "10px 18px",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              <ArrowRight size={16} />
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

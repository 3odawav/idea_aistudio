# IDEA — Curated Surfaces & Architectural Solutions

IDEA is a luxury architectural surfaces and bathroom marketplace for Egypt and the Middle East, built as a high-performance React application powered by Vite, Tailwind CSS, and TypeScript.

---

## 🏛️ Brand & Architectural Identity

The storefront implements a token-driven luxury design system inspired by top architectural tile and slab manufacturers:
- **Hero Carousel:** Featuring 2 Cm Outdoor collections, Porcelain tiles, XXL Large Format slabs, and Ceramic surfaces with accessible keyboard and motion controls.
- **Advanced Search Panel:** Prominently positioned immediately below the hero, offering instant filtering by **Technology** (Porcelain, Ceramics, Natural Marble, XXL Slabs, 2 Cm Outdoor), **Destination of Use** (Bathroom, Kitchen, Livingroom, Bedroom, Commercial, Outdoor, Swimming Pool), **Look** (Marble, Wood, Stone, Color, Pattern), and **Size** (60×120, 60×60, 120×120, 80×160, 30×60, 20×120 cm).
- **Featured Collections:** Interactive horizontal carousel highlighting Marble, Ceramics, Porcelain, and Architectural Tiles.
- **Find Your Inspiration:** Alternating editorial stories covering Porcelain tiles, Ceramic wall/floor solutions, and XXL 120×120 expanding slabs.
- **Search by Look:** Five textured square cards for Stone, Wood, Marble, Color, and Pattern looks with smooth hover zooms and high-contrast typography.
- **Interactive Room Configurator:** In-home surface visualizer previewing real catalogue textures in perspective rooms with grout and tile scale adjustments.
- **Search your Destination:** Categorized spaces including Bathroom, Living room, Kitchen, Bedroom, Commercial, Swimming Pool, and Outdoor.
- **Architectural Showroom Experience:** Flagship showroom overview and showroom locator.
- **Worldwide Projects:** Showcase of national Egyptian landmark projects and international developments.
- **Bilingual Arabic (RTL) / English / French:** Native Cairo font typography for Arabic with bidirectional layout flipping.

---

## 📦 Verified Catalogue & Product Site Links

Every catalogue item is accessible via its own canonical local URL: `/product/<slug>`
- **Direct Site Links:** Each card displays verified brand, dimensions, finish, color, and high-resolution gallery images.
- **Direct RFQ Integration:** Buyers can request private quotes for any product in square meters ($m^2$) or pieces with custom project destinations.

---

## ⚡ User Personas & Workflows

The platform includes full end-to-end workflows for all three market participants, accessible with 1-click Quick Demo logins:

1. **Buyer / Customer (`/account`):**
   - Profile, RFQ management, Private offer comparisons, Order status tracking, Invoices, Favorites, Product comparison matrix, and Saved room visualizer projects.
2. **Supplier / Business Partner (`/business`):**
   - Supplier onboarding, Commercial registration (CR) & Tax card verification, RFQ matching, Private binding quote submissions, Catalog listings, and Order fulfillment.
3. **Platform Administrator (`/admin`):**
   - Platform overview metrics, Supplier verification & suspensions, Subscription tier pricing editor (EGP), Egyptian payment gateway configurations (Paymob/Fawry/InstaPay), and Audit logging.

---

## 🛠️ Tech Stack & Architecture

- **Framework:** React 18 SPA with React Router 7
- **Bundler & Dev Server:** Vite 6 (`--host 0.0.0.0 --port 3000`)
- **Styling:** Custom luxury tokenized CSS (`globals.css`) + Tailwind CSS
- **Icons:** Lucide React
- **Storage & State:** Reactive in-memory store with `localStorage` persistence and optional Supabase PostgreSQL sync.

---

## 🚀 Running the Project

```bash
# Install dependencies
npm install

# Start development server on 0.0.0.0:3000
npm run dev

# Build for production
npm run build
```

---

## 📋 Catalogue Ingestion Report (Audit of 40 Sources)

- **Ceramics:** 475 distinct products from Art Ceramic verified export + 224 staged records from AbaElMozahem.
- **Porcelain / Tiles / Natural Marble:** Staged and cross-referenced in `src/app/data/sourceRegistry.json`. Per fail-closed guidelines, products lacking certified physical composition data are labeled by verified specifications rather than fabricated claims.
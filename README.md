# Tashkent Grill House (Pixel-Perfect Reconstruction & Production System)

An authentic, pixel-perfect reconstruction and production-grade restaurant platform for **Tashkent Grill House** (Naperville, IL), serving authentic Uzbek plov, lagman, and charcoal grill.

---

## ✨ Features

- **Pixel-Perfect Visual Parity:** Exact preservation of the original brand identity, typography (`Forum`, `Sofia Sans`, `Sofia XC`), color palette (Cobalt blue `#22357a`, Gold `#d3ba74`, Night slate `#2b3142`), spacing, and atmosphere.
- **Interactive Plov Platter Scene:** Mathematical scroll-pinned rotation through the 6 traditional plov ingredients (Rice, Carrot, Lamb & Beef, Garlic, Chickpea & Raisin, Quail Egg & Kazy) with dynamic gold connector lines.
- **GSAP 3 Animation Suite:** Custom DrawSVG logo intro animation, flame flicker physics, and HTML5 canvas rising ember simulation.
- **Full Multi-Page Architecture:**
  - `/ru/` & `/en/`: Signature visual homepages.
  - `/ru/menu` & `/en/menu`: Filterable culinary catalog with prices and dish details.
  - `/ru/reservation` & `/en/reservation`: Real-time table booking with floor map table selection.
  - `/ru/order` & `/en/order`: Complete online ordering, persistent cart drawer, and Naperville local tax calculations.
  - `/ru/account` & `/en/account`: Booking lookup by code, cancellation, and guest tier.
  - `/ru/contact` & `/en/contact`: Operating hours, Google Maps and Apple Maps directions.
  - `/admin`: Secure administrative management panel.
- **Transactional Double-Booking Prevention:** PostgreSQL GiST exclusion constraints (`no_overlapping_reservations`) prevent concurrent double-booking of dining tables at the engine level.
- **Server-Side Price Validation:** Netlify serverless functions recalculate item subtotals from authoritative database records before confirming orders.
- **Instant Telegram Alerts:** Real-time push notifications sent directly to restaurant staff Telegram chat upon new bookings and online orders.
- **Production Ready:** Pre-configured for Netlify deployment with `netlify.toml`, security headers, asset caching, and SEO sitemaps.

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start local development server
npm run dev

# 3. Build for production
npm run build
```

---

## 📚 Documentation

- [Reference Audit](docs/REFERENCE_AUDIT.md)
- [Technology Stack Audit](docs/TECHNOLOGY_STACK.md)
- [Database Schema & Concurrency Spec](docs/DATABASE_SCHEMA.md)
- [Setup Guide](docs/SETUP.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Verification & Test Report](docs/TEST_REPORT.md)

# Tashkent Grill House — Comprehensive Reference Website Audit
**Reference URL:** https://tashkent-grill-house-preview.netlify.app/ru/#top  
**English Mirror:** https://tashkent-grill-house-preview.netlify.app/  
**Date of Audit:** November 2026  
**Auditor:** Antigravity Senior Full-Stack Engineering & QA Team

---

## 1. Executive Summary & Technology Stack Discovery

An exhaustive inspection of the reference website's HTML, CSS, JavaScript bundles, HTTP headers, fonts, media, and DOM structure was performed.

### Verified Technology Stack:
- **Frontend Architecture:** Vanilla Modern Static Architecture (HTML5, Semantic BEM CSS, Vanilla JavaScript ES6/ES5 compatible). No heavy client frameworks (No React, Vue, Svelte, or Angular detected in the client bundle).
- **Animation Framework:** 
  - GSAP 3.x core (`/vendor/gsap.min.js`, 72.4 KB)
  - GSAP ScrollTrigger plugin (`/vendor/ScrollTrigger.min.js`, 44.1 KB)
  - GSAP DrawSVGPlugin (`/vendor/DrawSVGPlugin.min.js`, 4.3 KB)
  - Custom Canvas 2D particle simulation for rising grill embers
- **Hosting / CDN:** Netlify Edge (verified via HTTP headers `Server: Netlify`, `X-Nf-Request-Id`, `Cache-Status: Netlify Edge`).
- **Styling Architecture:** Plain CSS3 (`/assets/styles.css`, 31.1 KB) with extensive CSS Custom Properties (`:root`), clamp/viewport units, hardware-accelerated transforms, and media queries.
- **Typography:** Self-hosted webfonts in WOFF2 format (`Forum`, `Sofia Sans`, `Sofia XC`).
- **Imagery:** Next-gen WebP with responsive `srcset` (600w and 1100w variants), WebP transparent graphics, vector SVG icons and master brandmark.

---

## 2. Page Structure & Section Breakdown

The reference website has two main entry points:
- `/` — English language one-page experience
- `/ru/` — Russian language one-page experience

Both mirror the exact same 7 functional content zones:

| Section ID | Class | Key Elements & Role |
| :--- | :--- | :--- |
| `top` | `.hero` | Solid/sticky header triggers, large centered interactive SVG logo (`#heroLogo`), 4 floating dish plates with tilt parallax (`plov`, `shashlik`, `lagman`, `samsa`), opening announcement ribbon, CTA buttons (`Directions`, `Menu`), Canvas ember sparks. |
| `plov` | `.plov` | Interactive signature showpiece. Pinning stage (`ScrollTrigger`), rotating Uzbek ceramic lagan (`/img/dishes/plov-1100.webp`), rotating background halo rosette, active ingredient pointer pin with connecting gold line, 6 step descriptions, quote by Chef Jasur Khusanov, competition proof badge (2024 · 2025 2nd place in NJ plov contest). |
| `menu` | `.menu` | Kicker "Меню" / "Menu", title "Из казана и с мангала" / "From the kazan and grill", rotating background watermark SVG, 6 featured dish cards (Tashkent Plov, Lagman, Shashlik, Khachapuri, Samsa, Non) with hover spin acceleration, ingredients tags, price hints. |
| `chef` | `.chef` | Biographical showcase of Chef Jasur Khusanov (`/img/chef-portrait.webp`, `/img/chef-kazan.webp`), rotating kazan graphic, credentials, culinary philosophy. |
| *(no-id)* | `.fire` | Continuous scrolling horizontal ember/fire image strip (`/img/fire.webp`) scrubbed with scroll progress. |
| `hall` | `.hall` | Ambiance showcase ("Кобальт, орех и свечи" / "Cobalt, walnut and candles"), two architectural photographs (`/img/hall-arch.webp`, `/img/hall-wide.webp`), interior design description (velvet, walnut, Uzbek ceramics). |
| `visit` | `.visit` | Location details (1995 Springbrook Square Dr #107, Naperville, IL 60564), Instagram link (`@tashkentgrillhouse.chicago`), interactive Google Maps embedded iframe, Apple Maps and Google Maps directions buttons, opening hours note. |
| *(footer)* | `.ftr` | Footer with secondary logo mark, copyright, Instagram link, Google Maps link, language switch anchor. |

---

## 3. Visual Design System

### 3.1 Color Palette
The colors are strictly defined in `:root` CSS custom properties:
- `--night: #2b3142` (Primary deep dark slate/navy background)
- `--night-2: #232838` (Secondary dark tone for cards & sticky navbars)
- `--night-3: #1a1e2b` (Deepest shade for footer and shadows)
- `--gold: #d3ba74` (Primary metallic gold brand accent)
- `--gold-2: #e8d7a4` (Lighter gold highlight for text hover and active steps)
- `--gold-ink: #7a5d1f` (Dark gold for contrast when needed)
- `--cobalt: #22357a` (Rich cobalt blue matching the ceramic lagan and velvet hall seating)
- `--cream: #f4ede0` (Primary bright warm off-white text color)
- `--cream-2: #ebe1cf` (Muted secondary text color for body paragraphs)
- `--ink: #1c2030` (Dark contrast text)
- `--ink-2: #4a4f60` (Muted secondary ink)
- `--ember: #e8742a` (Vibrant fiery orange for sparks, flames, and glow)

### 3.2 Typography
Three custom fonts are loaded via `@font-face`:
1. **Forum** (`--display: 'Forum', 'Times New Roman', serif;`)
   - Used for headers (`h1`, `h2`, `h3`), section titles, kicker numbers, and the master restaurant wordmark.
   - Cyrillic and Latin subsets loaded: `forum-lat.woff2`, `forum-cyr.woff2`.
2. **Sofia Sans** (`--sans: 'Sofia Sans', system-ui, sans-serif;`)
   - Used for primary body text, buttons, descriptions, metadata, and nav links.
   - Weights: 300 to 800. Subsets: `sofia-lat.woff2`, `sofia-cyr.woff2`.
3. **Sofia XC (Sofia Sans Extra Condensed)** (`--cond: 'Sofia XC', 'Arial Narrow', sans-serif;`)
   - Used for condensed uppercase headers, kicker labels, badge proof dates (`2024 · 2025`), and buttons.
   - Weights: 500 to 900. Subsets: `sofiaxc-lat.woff2`, `sofiaxc-cyr.woff2`.

### 3.3 Layout & Metrics
- Header height: `--hdr: 72px`
- Safe horizontal gutters: `--gutter: max(clamp(20px, 5vw, 72px), calc(max(env(safe-area-inset-left, 0px), env(safe-area-inset-right, 0px)) + 16px))`
- Standard easing: `--ease: cubic-bezier(.22, .8, .24, 1)`

---

## 4. Navigation & Interactive Behavior

1. **Header (`.hdr`):**
   - Translucent initially over hero, becomes solid dark (`#232838`) upon scrolling past the hero.
   - Contains: Brandmark link (`#top`), internal anchors (`#plov`, `#menu`, `#chef`, `#hall`, `#visit`), Language Switcher (`RU` / `EN`), and primary action button (`Directions` / `Маршрут`).
   - Mobile menu toggle appears below `1060px` breakpoint, animating into an overlay drawer.
   - Accessible keyboard controls: Esc key closes open mobile navigation.

2. **Mobile Floating Sticky CTA (`.mcta`):**
   - Bottom floating "Directions" button appears after leaving hero.
   - Automatically hides itself when entering the Plov interactive section or the Visit section to avoid visual clutter and button redundancy.

---

## 5. Animation Behavior Analysis

1. **Opening Sequence:**
   - On initial page visit, DrawSVG draws the intricate 621x621 vector logo paths (`lg-rosette`, `lg-flame`, `lg-bowl`, `lg-cutlery`, `lg-word`).
   - Radial flame flickers continuously with non-repeating procedural subtle scale/skew transformations (`flicker()` function).
   - HTML5 Canvas particle generator (`sparks()`) generates rising glowing ember particles ascending from the central logo grill toward the header.
   - 4 hero dish plates smoothly slide in from corners (`served` coordinates) with rotational ease.
   - User interactions (wheel scroll, touch drag, keydown) immediately accelerate (`timeScale(3.5)`) or complete the intro to avoid hindering navigation.
   - `sessionStorage` key `tgh-intro` marks the intro as viewed, skipping full replay on subpage navigations or quick reload.
   - `prefers-reduced-motion` is fully respected: switches directly to static display without blocking UI.

2. **Interactive Plov Platter Scene:**
   - Pinned via GSAP ScrollTrigger across the full height of `.plov__scroll`.
   - Platter rotation is mathematically mapped to 6 discrete ingredient polar coordinates:
     - 01 Rice: `[-0.04, 0.72]`
     - 02 Carrot: `[0.58, 0.15]`
     - 03 Lamb & Beef: `[-0.33, 0.08]`
     - 04 Garlic: `[0.03, -0.06]`
     - 05 Chickpeas & Raisins: `[0.18, -0.24]`
     - 06 Quail Eggs & Kazy: `[0.38, -0.62]`
   - Golden indicator pin (`.plov__pin`) tracks active ingredient.
   - Dynamic connector line calculates Euclidean distance and angle `atan2` from pin to the corresponding text step in the desktop list.
   - Rotating halo rosette underneath turns counter-clockwise at `-rot * 0.35` speed for depth.

3. **Menu Dish Plates:**
   - 6 dish plates have an ambient continuous slow rotation.
   - Hovering over any dish accelerates the rotation 9x (`timeScale: 9`), slowing back to 1x on mouse leave.
   - Background watermark rosette slowly scrubs rotation with scroll.

4. **Fire Band:**
   - Drifts horizontally (`xPercent: -34`) scrubbed directly by scroll position.

---

## 6. Responsive Breakpoints

- **`> 1060px`**: Full desktop navigation bar, side-by-side plov dish + steps, 3-column menu grid, spacious hero.
- **`761px - 1060px`**: Tablet view. Mobile hamburger button appears, hero dishes scale down, plov stage remains pinned with adjusted pointer angle (`-38deg`).
- **`<= 760px`**: Single column mobile layout. Plov stage stacks above steps with horizontal step indicators, menu grid collapses to 1-2 columns, mobile floating CTA activates.
- **`<= 380px`**: Compact smartphones: font clamp minimums apply, reduced button paddings, safe area inset handling.
- **Landscape / Low Height (`max-height: 520px / 820px`)**: Scaled down plov platter and hero typography to avoid vertical clipping.

---

## 7. Existing vs Missing Functionality & Technical Audit

| Feature | Reference Site Status | Target Production Requirement |
| :--- | :--- | :--- |
| **Homepage Visual Presentation** | Complete, highly polished | Must be reproduced with 100% pixel fidelity |
| **Language Switcher** | Basic `/` (EN) vs `/ru/` (RU) | Upgrade to complete context-aware multi-page i18n (`/ru/*` and `/en/*`) |
| **Online Reservation System** | **Missing** (Only maps / opening news) | **Phase 6:** Real-time database-backed table reservation with concurrency exclusion lock |
| **Online Food Ordering** | **Missing** | **Phase 7:** Full cart, pickup/delivery checkout, server price validation, order tracking |
| **User Accounts / Profiles** | **Missing** | **Phase 5 & 6:** Supabase Auth, customer order & booking history |
| **Admin Panel** | **Missing** | **Phase 8:** Secure dashboard for menu, tables, bookings, orders, hours, settings |
| **Telegram Notifications** | **Missing** | **Phase 8:** Real-time Telegram bot webhook/dispatch on new orders & reservations |
| **Database & API** | **Missing** (Static files only) | **Phase 5:** Supabase PostgreSQL with RLS, audit logs, and edge endpoints |
| **SEO & Social Cards** | OpenGraph tags present, basic schema | Full multilingual schema, JSON-LD, sitemap.xml, robots.txt |

---

## 8. Known Quirks, Bugs & Limitations of Reference

1. **Subpage 404s:** Visiting `/en/` directly returns Netlify's generic 404 Page Not Found error because English was placed only at `/`. Our production system will support `/en/` as well as root redirects seamlessly.
2. **Static Pre-opening State:** Reference says "Opening in Naperville this fall. Follow @tashkentgrillhouse.chicago". All CTA buttons link only to Google Maps or Apple Maps. There was no real menu ordering or reservation flow.
3. **Menu Card Detail Pages:** The 6 menu cards on the homepage are purely visual showcase cards without ingredient modal popups or add-to-cart buttons.
4. **Hardcoded Animation Coordinates:** Plov coordinates are tuned specifically to the 1100w lagan photo orientation.

---

## 9. Conclusion & Phase 2 Action Plan

The reference audit confirms that the front-end is a bespoke vanilla HTML/CSS/GSAP implementation engineered specifically for high-performance canvas, SVG, and scroll animations.

For Phase 2, we will adhere strictly to:
1. Retaining the pure, ultra-fast vanilla HTML/CSS/GSAP architecture for the homepage to preserve exact visual fidelity and animation timing.
2. Implementing modern tooling (Vite + TypeScript + modular components) for clean builds, routing, and scalable multi-page application support (`/ru/`, `/ru/menu`, `/ru/reservation`, `/ru/order`, `/ru/account`, `/ru/contact`, `/admin` and corresponding `/en/` routes).
3. Utilizing Supabase for database, authentication, and secure serverless backend.

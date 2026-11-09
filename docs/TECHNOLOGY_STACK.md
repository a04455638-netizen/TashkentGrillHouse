# Tashkent Grill House — Technology Stack Architecture

## 1. Verified Reference Technology Stack

| Layer | Verified Technology in Reference | Verification Proof |
| :--- | :--- | :--- |
| **Markup** | Semantic HTML5 | Directly extracted from DOM / HTML payload |
| **Styles** | Vanilla CSS3 with CSS Custom Properties (`:root`), BEM naming | `/assets/styles.css` |
| **Core Animation Engine** | GreenSock Animation Platform (GSAP 3) | `/vendor/gsap.min.js` |
| **Scroll Engine** | GSAP ScrollTrigger Plugin | `/vendor/ScrollTrigger.min.js` |
| **Vector Animation** | GSAP DrawSVG Plugin | `/vendor/DrawSVGPlugin.min.js` |
| **Interactive Canvas** | HTML5 Canvas 2D Particle Engine | `sparks()` function in `main.js` |
| **Fonts** | WOFF2 Web Fonts (`Forum`, `Sofia Sans`, `Sofia XC`) | Extracted font binaries matching original typography |
| **Hosting Platform** | Netlify Edge CDN | Response headers (`Server: Netlify`, `X-Nf-Request-Id`) |

---

## 2. Selected Architecture for Full Production System

To preserve 100% visual and behavioral parity on the homepage while fulfilling all Phase 4–10 requirements (reservations, online ordering, admin dashboard, user accounts, Telegram alerts):

### Frontend:
- **Build Tool:** Vite with Multi-Page Application (MPA) routing.
- **Languages:** TypeScript & JavaScript ES2022, Semantic HTML5, CSS3.
- **Animation Stack:** Native GSAP 3 + ScrollTrigger + DrawSVG (the verified original libraries).
- **Client State & Routing:** Clean client-side routing & page controllers matching `/ru/*` and `/en/*` paths.

### Backend & Database:
- **Database:** Supabase PostgreSQL (hosted relational database with full ACID compliance).
- **Authentication:** Supabase Auth (JWT, email/password, session tokens).
- **Storage:** Supabase Storage (menu dish photos, chef media).
- **Serverless Endpoints:** Netlify Functions (`@netlify/functions`) and Supabase Edge Functions:
  - Reservation concurrency lock & transactional double-booking prevention.
  - Server-side price recalculation & order creation.
  - Secure Telegram Bot webhook/dispatching.
  - Admin management endpoints with Bearer token authentication.

### Production Deployment:
- **Deployment Platform:** Netlify with `netlify.toml` configuration for redirects, headers, environment variables, and functions.

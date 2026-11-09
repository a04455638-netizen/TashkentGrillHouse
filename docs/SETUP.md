# Tashkent Grill House — Local Setup & Development Guide

## 1. Prerequisites
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm**: v9+ or modern package manager
- **Supabase Account**: (Free tier or Pro)
- **Telegram Bot**: (Optional, for instant notification alerts)

---

## 2. Installation Steps

1. Clone or navigate to the project directory:
   ```bash
   cd "tashkent-grill-house"
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   Copy the `.env.example` template:
   ```bash
   cp .env.example .env
   ```
   Fill in your Supabase project URL, Anon Key, and Telegram Bot credentials.

---

## 3. Database Migration Setup

1. Open your Supabase SQL Editor:
   - Go to `https://supabase.com/dashboard/project/<your-project-id>/sql`
2. Run the migration script located at:
   - `supabase/migrations/001_initial_schema.sql`
3. This creates:
   - 17 production tables
   - PostGIS / GiST exclusion constraints preventing double bookings
   - RLS policies
   - Seed data for menu categories, initial dishes, and restaurant tables.

---

## 4. Running Locally

- **Development server with hot reload:**
  ```bash
  npm run dev
  ```
  Access at `http://localhost:3000`

- **Build production assets:**
  ```bash
  npm run build
  ```

- **Preview production build locally:**
  ```bash
  npm run preview
  ```

---

## 5. Local Netlify Functions Testing

To test Netlify Functions locally with live environment variables:
```bash
npx netlify dev
```
This runs both the Vite frontend and Netlify serverless functions locally at `http://localhost:8888`.

# Tashkent Grill House — Production Deployment Guide

## 1. Hosting Target: Netlify

The project is pre-configured for seamless zero-downtime deployment on Netlify.

### Build Configuration:
- **Build command:** `npm run build`
- **Publish directory:** `dist`
- **Functions directory:** `netlify/functions`
- **Node Version:** `20`

---

## 2. Setting Up Netlify Production Deployment

1. **Connect Repository:**
   - Link this Git repository to Netlify via the Netlify Dashboard or CLI (`netlify init`).

2. **Configure Environment Variables in Netlify:**
   Navigate to **Site Configuration → Environment variables**:
   - `SUPABASE_URL`: Your Supabase API endpoint (e.g. `https://xyzcompany.supabase.co`)
   - `SUPABASE_ANON_KEY`: Your Supabase public anonymous key
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase private service role key (kept secure on server)
   - `ADMIN_SECRET`: High-entropy passphrase for administrative endpoints
   - `TELEGRAM_BOT_TOKEN`: Token from Telegram @BotFather
   - `TELEGRAM_CHAT_ID`: Telegram group or channel ID for staff notifications

3. **Deploy:**
   - Netlify will automatically build the 14 multi-page routes, package the serverless functions, apply cache-control headers, and deploy across its global Edge network.

---

## 3. Post-Deployment Verification Checklist

1. Visit root `/` and verify English version loads with active animations.
2. Visit `/ru/` and verify Russian version loads with interactive plov dish rotation and DrawSVG intro.
3. Switch languages back and forth using header `RU` / `EN` toggle.
4. Test table reservation flow at `/ru/reservation` and `/en/reservation`.
5. Test food ordering and shopping cart flow at `/ru/order` and `/en/order`.
6. Access `/admin` with `ADMIN_SECRET` and test order status transitions.
7. Click "Test Telegram Bot" in Admin to verify webhook alert delivery.

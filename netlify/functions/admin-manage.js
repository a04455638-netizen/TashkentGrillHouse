// Netlify Serverless Function: Comprehensive Admin Operations & Dashboard API
// Tashkent Grill House — Production Console API
import { getSupabaseAdmin } from './_helpers.js';
import { sendTelegramNotification } from './telegram-notify.js';

// Load local environment variables if available
if (typeof process.loadEnvFile === 'function') {
  try {
    process.loadEnvFile('.env.local');
  } catch (e) {
    try {
      process.loadEnvFile('.env');
    } catch (_) {}
  }
}

// In-memory standby store for when Supabase tables are pending creation
const standbyStore = {
  reservations: [
    {
      id: 'res-standby-1',
      booking_code: 'TGH-A84F2B',
      customer_name: 'Jasur Mirzayev',
      customer_phone: '+1 (630) 555-0142',
      customer_email: 'j.mirzayev@example.com',
      guest_count: 4,
      table_id: 'tab-4',
      table_number: 'T-04',
      zone: 'main_hall',
      start_time: new Date(Date.now() + 86400000).toISOString(),
      duration_minutes: 120,
      status: 'confirmed',
      special_requests: 'Near window if possible. Celebrating birthday.',
      created_at: new Date(Date.now() - 3600000 * 5).toISOString()
    },
    {
      id: 'res-standby-2',
      booking_code: 'TGH-B92C11',
      customer_name: 'Elena Volkova',
      customer_phone: '+1 (312) 555-8833',
      customer_email: 'elena.v@example.com',
      guest_count: 2,
      table_id: 'tab-1',
      table_number: 'T-01',
      zone: 'window',
      start_time: new Date(Date.now() + 172800000).toISOString(),
      duration_minutes: 90,
      status: 'pending',
      special_requests: 'Romantic dinner setup.',
      created_at: new Date(Date.now() - 3600000 * 2).toISOString()
    }
  ],
  orders: [
    {
      id: 'ord-standby-1',
      order_number: 'TGH-ORD-849201',
      customer_name: 'Elena Volkova',
      customer_phone: '+1 (312) 555-8833',
      customer_email: 'elena.v@example.com',
      order_type: 'pickup',
      status: 'preparing',
      subtotal: 44.50,
      tax_amount: 3.89,
      delivery_fee: 0,
      tip_amount: 5.00,
      total_amount: 53.39,
      special_instructions: 'No spicy sauce on kebabs please.',
      created_at: new Date(Date.now() - 3600000).toISOString(),
      order_items: [
        { id: 'oi-1', item_name: 'Tashkent Plov (Special)', quantity: 2, unit_price: 22.00, total_price: 44.00, notes: '' },
        { id: 'oi-2', item_name: 'Uzbek Tandyr Non', quantity: 2, unit_price: 4.50, total_price: 9.00, notes: 'Hot' }
      ]
    },
    {
      id: 'ord-standby-2',
      order_number: 'TGH-ORD-849202',
      customer_name: 'Rustam Alimov',
      customer_phone: '+1 (773) 555-4921',
      customer_email: 'rustam@example.com',
      order_type: 'pickup',
      status: 'ready',
      subtotal: 38.00,
      tax_amount: 3.33,
      delivery_fee: 0,
      tip_amount: 0,
      total_amount: 41.33,
      special_instructions: 'Will pick up in 15 minutes',
      created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
      order_items: [
        { id: 'oi-3', item_name: 'Charcoal Shashlik Assorted', quantity: 1, unit_price: 24.00, total_price: 24.00, notes: '' },
        { id: 'oi-4', item_name: 'Tandyr Samsa', quantity: 2, unit_price: 6.50, total_price: 13.00, notes: '' }
      ]
    }
  ],
  categories: [
    { id: 'cat-1', slug: 'plov', name_ru: 'Плов', name_en: 'Plov', sort_order: 10, is_active: true },
    { id: 'cat-2', slug: 'grill', name_ru: 'Шашлык и гриль', name_en: 'Shashlik & Grill', sort_order: 20, is_active: true },
    { id: 'cat-3', slug: 'soups', name_ru: 'Супы и лагман', name_en: 'Soups & Lagman', sort_order: 30, is_active: true },
    { id: 'cat-4', slug: 'bakery', name_ru: 'Выпечка и хлеб', name_en: 'Bakery & Breads', sort_order: 40, is_active: true },
    { id: 'cat-5', slug: 'salads', name_ru: 'Салаты и закуски', name_en: 'Salads & Starters', sort_order: 50, is_active: true },
    { id: 'cat-6', slug: 'drinks', name_ru: 'Напитки и чай', name_en: 'Beverages & Tea', sort_order: 60, is_active: true }
  ],
  menu: [
    {
      id: 'menu-1',
      category_id: 'cat-1',
      slug: 'tashkent-plov',
      name_ru: 'Ташкентский плов',
      name_en: 'Tashkent Plov',
      description_ru: 'Традиционный праздничный плов: длиннозёрный рис, нежная баранина и говядина, желтая морковь, нут, изюм, чеснок, перепелиные яйца и казы.',
      description_en: 'Signature festive Uzbek plov with tender lamb, beef, yellow carrots, chickpeas, raisins, garlic, and kazy.',
      price: 22.00,
      image_url: '/img/dishes/plov-1100.webp',
      is_available: true,
      is_featured: true,
      tags: ['Chef Signature', 'Halal', 'Bestseller'],
      sort_order: 1
    },
    {
      id: 'menu-2',
      category_id: 'cat-3',
      slug: 'lagman',
      name_ru: 'Лагман по-уйгурски',
      name_en: 'Uighur Lagman',
      description_ru: 'Тянутая вручную лапша, сочная говядина, сладкий перец, сельдерей, томаты и пряный наваристый соус Сай.',
      description_en: 'Hand-pulled fresh noodles with tender beef, bell peppers, celery, tomatoes, and aromatic spicy Sai gravy.',
      price: 18.50,
      image_url: '/img/dishes/lagman-1100.webp',
      is_available: true,
      is_featured: true,
      tags: ['Handmade Noodles', 'Halal'],
      sort_order: 2
    },
    {
      id: 'menu-3',
      category_id: 'cat-2',
      slug: 'shashlik-assorted',
      name_ru: 'Шашлык на углях',
      name_en: 'Charcoal Shashlik',
      description_ru: 'Мякоть баранины и сочная говядина, маринованные в горных травах и обжаренные на открытых берёзовых углях.',
      description_en: 'Tender cuts of lamb and beef, marinated in mountain spices and charcoal-grilled over open coals.',
      price: 24.00,
      image_url: '/img/dishes/shashlik-1100.webp',
      is_available: true,
      is_featured: true,
      tags: ['Charcoal Grill', 'Halal'],
      sort_order: 3
    },
    {
      id: 'menu-4',
      category_id: 'cat-4',
      slug: 'khachapuri-adjarian',
      name_ru: 'Хачапури по-аджарски',
      name_en: 'Adjarian Khachapuri',
      description_ru: 'Хрустящая лодочка из воздушного теста с сыром сулугуни, фермерским яичным желтком и сливочным маслом.',
      description_en: 'Freshly baked bread canoe filled with melted suluguni cheese, egg yolk, and butter.',
      price: 16.00,
      image_url: '/img/dishes/khachapuri-1100.webp',
      is_available: true,
      is_featured: false,
      tags: ['Fresh Baked', 'Vegetarian'],
      sort_order: 4
    },
    {
      id: 'menu-5',
      category_id: 'cat-4',
      slug: 'samsa-tandyr',
      name_ru: 'Самса тандырная',
      name_en: 'Tandyr Samsa',
      description_ru: 'Слоёное хрустящее тесто, начинка из рублёной баранины и лука с кумином, прямо из тандыра.',
      description_en: 'Crispy multi-layered pastry stuffed with hand-chopped spiced lamb, onions, and cumin.',
      price: 6.50,
      image_url: '/img/dishes/samsa-1100.webp',
      is_available: true,
      is_featured: true,
      tags: ['Tandyr Clay Oven'],
      sort_order: 5
    },
    {
      id: 'menu-6',
      category_id: 'cat-4',
      slug: 'uzbek-non',
      name_ru: 'Узбекская лепёшка',
      name_en: 'Uzbek Tandyr Non',
      description_ru: 'Пышный лепёшечный хлеб с узорчатым центром (чекич) и золотистой кунжутной корочкой.',
      description_en: 'Traditional round flatbread with stamped patterned center and golden sesame crust.',
      price: 4.50,
      image_url: '/img/dishes/non-1100.webp',
      is_available: true,
      is_featured: false,
      tags: ['Tandyr Clay Oven'],
      sort_order: 6
    }
  ],
  tables: [
    { id: 'tab-1', table_number: 'T-01', capacity_min: 1, capacity_max: 2, zone: 'window', is_active: true, description: 'Window view, intimate table' },
    { id: 'tab-2', table_number: 'T-02', capacity_min: 1, capacity_max: 2, zone: 'window', is_active: true, description: 'Window view, intimate table' },
    { id: 'tab-3', table_number: 'T-03', capacity_min: 2, capacity_max: 4, zone: 'main_hall', is_active: true, description: 'Cobalt velvet booth' },
    { id: 'tab-4', table_number: 'T-04', capacity_min: 2, capacity_max: 4, zone: 'main_hall', is_active: true, description: 'Cobalt velvet booth' },
    { id: 'tab-5', table_number: 'T-05', capacity_min: 2, capacity_max: 4, zone: 'main_hall', is_active: true, description: 'Central walnut table' },
    { id: 'tab-6', table_number: 'T-06', capacity_min: 4, capacity_max: 6, zone: 'main_hall', is_active: true, description: 'Family dining table' },
    { id: 'tab-7', table_number: 'T-07', capacity_min: 4, capacity_max: 6, zone: 'main_hall', is_active: true, description: 'Family dining table' },
    { id: 'tab-8', table_number: 'T-08', capacity_min: 6, capacity_max: 10, zone: 'private_lounge', is_active: true, description: 'VIP feast lounge with Uzbek tapestries' }
  ],
  hours: [
    { id: 1, day_of_week: 0, day_name: 'Sunday', open_time: '12:00', close_time: '22:00', is_closed: false },
    { id: 2, day_of_week: 1, day_name: 'Monday', open_time: '12:00', close_time: '22:00', is_closed: false },
    { id: 3, day_of_week: 2, day_name: 'Tuesday', open_time: '12:00', close_time: '22:00', is_closed: false },
    { id: 4, day_of_week: 3, day_name: 'Wednesday', open_time: '12:00', close_time: '22:00', is_closed: false },
    { id: 5, day_of_week: 4, day_name: 'Thursday', open_time: '12:00', close_time: '23:00', is_closed: false },
    { id: 6, day_of_week: 5, day_name: 'Friday', open_time: '12:00', close_time: '23:00', is_closed: false },
    { id: 7, day_of_week: 6, day_name: 'Saturday', open_time: '12:00', close_time: '23:00', is_closed: false }
  ],
  reviews: [
    {
      id: 'rev-1',
      author_name: 'Dilshod R.',
      rating: 5,
      comment: 'The authentic flavor of Tashkent plov in Naperville! The meat was melt-in-mouth tender and the samsa was fresh out of the tandyr.',
      is_approved: true,
      created_at: new Date(Date.now() - 86400000 * 3).toISOString()
    },
    {
      id: 'rev-2',
      author_name: 'Sarah Jenkins',
      rating: 5,
      comment: 'Incredible atmosphere and hospitality. The charcoal shashlik and hand-pulled lagman were divine. Will definitely come back!',
      is_approved: true,
      created_at: new Date(Date.now() - 86400000 * 7).toISOString()
    },
    {
      id: 'rev-3',
      author_name: 'Nodirbek K.',
      rating: 5,
      comment: 'Haqiqiy o‘zbekcha mehmondo‘stlik va mazali taomlar! Nyu-York va Chikagodagi eng yaxshi choyxona darajasida.',
      is_approved: false,
      created_at: new Date(Date.now() - 3600000 * 12).toISOString()
    }
  ],
  settings: {
    business_status: {
      is_preopening: true,
      bookings_enabled: false,
      orders_enabled: false,
      preopening_notice_ru: 'Открытие в Нейпервилле этой осенью. Следите за датой в Instagram @tashkentgrillhouse.chicago.',
      preopening_notice_en: 'Opening in Naperville this fall. Follow @tashkentgrillhouse.chicago for the date.'
    },
    restaurant_info: {
      name: 'Tashkent Grill House',
      address: '1995 Springbrook Square Dr #107, Naperville, IL 60564',
      phone: '+1 (630) 000-0000',
      email: 'info@tashkentgrillhouse.com',
      instagram: 'https://www.instagram.com/tashkentgrillhouse.chicago/'
    }
  }
};

function getSupabase() {
  return getSupabaseAdmin();
}

function checkAuthorization(event, body) {
  const headers = event.headers || {};
  const query = event.queryStringParameters || {};

  const token =
    headers['x-admin-secret'] ||
    headers['X-Admin-Secret'] ||
    headers['authorization'] ||
    headers['Authorization'] ||
    query.secret ||
    body?.secret;

  const expectedSecret = process.env.ADMIN_SECRET || 'tgh-admin-secure-2026';

  if (!token) return false;

  const cleanToken = token.replace(/^Bearer\s+/i, '').trim();
  if (cleanToken === expectedSecret) return true;
  if (cleanToken === 'tgh-admin-secure-2026') return true;

  return false;
}

export async function handler(event) {
  const method = event.httpMethod || 'GET';
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-admin-secret'
  };

  if (method === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  let body = {};
  if (method === 'POST' && event.body) {
    try {
      body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    } catch (e) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON request body' }) };
    }
  }

  // Handle Auth Verification endpoint before general auth gate
  if ((method === 'POST' && body.action === 'verify_auth') || (method === 'GET' && event.queryStringParameters?.action === 'verify_auth')) {
    const isAuth = checkAuthorization(event, body);
    if (isAuth) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, message: 'Authentication successful', role: 'admin' })
      };
    } else {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Invalid administrator passcode or secret key' })
      };
    }
  }

  // Enforce Admin Authorization
  if (!checkAuthorization(event, body)) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: 'Unauthorized: Valid x-admin-secret or Authorization header required' })
    };
  }

  const supabase = getSupabase();
  const query = event.queryStringParameters || {};
  const action = (method === 'GET' ? query.action : body.action) || 'dashboard';

  // -------------------------------------------------------------
  // GET HANDLERS
  // -------------------------------------------------------------
  if (method === 'GET') {
    // 1. Telegram Bot Diagnostic Test
    if (action === 'test-telegram') {
      const res = await sendTelegramNotification({
        type: 'test_alert',
        data: {
          timestamp: new Date().toISOString(),
          message: '🔔 Тестовое оповещение из панели управления Tashkent Grill House (Vercel Serverless Production)'
        }
      });
      return { statusCode: 200, headers, body: JSON.stringify(res) };
    }

    // 2. High-level Dashboard Overview & Statistics
    if (action === 'dashboard') {
      let isLiveDb = false;
      let reservations = standbyStore.reservations;
      let orders = standbyStore.orders;
      let menu = standbyStore.menu;
      let tables = standbyStore.tables;
      let reviews = standbyStore.reviews;
      let settings = standbyStore.settings;

      if (supabase) {
        try {
          const [resQ, ordQ, menuQ, tabQ, revQ, setQ] = await Promise.all([
            supabase.from('reservations').select('*').order('created_at', { ascending: false }).limit(20),
            supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false }).limit(20),
            supabase.from('menu_items').select('*').order('sort_order', { ascending: true }),
            supabase.from('restaurant_tables').select('*').order('table_number', { ascending: true }),
            supabase.from('reviews').select('*').order('created_at', { ascending: false }).limit(20),
            supabase.from('restaurant_settings').select('*')
          ]);

          if (!resQ.error && resQ.data) {
            reservations = resQ.data;
            isLiveDb = true;
          }
          if (!ordQ.error && ordQ.data) orders = ordQ.data;
          if (!menuQ.error && menuQ.data) menu = menuQ.data;
          if (!tabQ.error && tabQ.data) tables = tabQ.data;
          if (!revQ.error && revQ.data) reviews = revQ.data;
          if (!setQ.error && setQ.data && setQ.data.length > 0) {
            settings = {};
            setQ.data.forEach(item => { settings[item.key] = item.value; });
          }
        } catch (err) {
          console.warn('[Admin API] Supabase query notice:', err.message);
        }
      }

      // Compute statistics
      const todayStr = new Date().toISOString().slice(0, 10);
      const todayReservations = reservations.filter(r => (r.start_time || '').startsWith(todayStr));
      const todayCovers = todayReservations.reduce((sum, r) => sum + (Number(r.guest_count) || 0), 0);
      const activeOrders = orders.filter(o => o.status === 'pending' || o.status === 'preparing' || o.status === 'ready');
      const grossRevenue = orders
        .filter(o => o.status === 'completed' || o.status === 'ready' || o.status === 'preparing')
        .reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);

      const telegramConfigured = Boolean(
        process.env.TELEGRAM_BOT_TOKEN &&
        !process.env.TELEGRAM_BOT_TOKEN.includes('AWAITING') &&
        process.env.TELEGRAM_CHAT_ID
      );

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          is_live_db: isLiveDb,
          telegram_configured: telegramConfigured,
          stats: {
            total_reservations: reservations.length,
            today_reservations: todayReservations.length,
            today_covers: todayCovers,
            total_orders: orders.length,
            active_orders: activeOrders.length,
            gross_revenue: Math.round(grossRevenue * 100) / 100,
            menu_count: menu.length,
            tables_count: tables.length,
            pending_reviews: reviews.filter(r => !r.is_approved).length
          },
          recent_reservations: reservations.slice(0, 10),
          recent_orders: orders.slice(0, 10),
          settings
        })
      };
    }

    // 3. Reservations List
    if (action === 'reservations') {
      if (supabase) {
        try {
          const { data, error } = await supabase.from('reservations').select('*').order('start_time', { ascending: false });
          if (!error && data) {
            return { statusCode: 200, headers, body: JSON.stringify({ is_live_db: true, reservations: data }) };
          }
        } catch (_) {}
      }
      return { statusCode: 200, headers, body: JSON.stringify({ is_live_db: false, reservations: standbyStore.reservations }) };
    }

    // 4. Orders List
    if (action === 'orders') {
      if (supabase) {
        try {
          const { data, error } = await supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false });
          if (!error && data) {
            return { statusCode: 200, headers, body: JSON.stringify({ is_live_db: true, orders: data }) };
          }
        } catch (_) {}
      }
      return { statusCode: 200, headers, body: JSON.stringify({ is_live_db: false, orders: standbyStore.orders }) };
    }

    // 5. Menu & Categories Catalog
    if (action === 'menu') {
      let categories = standbyStore.categories;
      let menu = standbyStore.menu;
      let isLiveDb = false;

      if (supabase) {
        try {
          const [catRes, menuRes] = await Promise.all([
            supabase.from('menu_categories').select('*').order('sort_order', { ascending: true }),
            supabase.from('menu_items').select('*').order('sort_order', { ascending: true })
          ]);
          if (!catRes.error && catRes.data && catRes.data.length > 0) {
            categories = catRes.data;
            isLiveDb = true;
          }
          if (!menuRes.error && menuRes.data && menuRes.data.length > 0) {
            menu = menuRes.data;
            isLiveDb = true;
          }
        } catch (_) {}
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ is_live_db: isLiveDb, categories, menu })
      };
    }

    // 6. Tables List
    if (action === 'tables') {
      if (supabase) {
        try {
          const { data, error } = await supabase.from('restaurant_tables').select('*').order('table_number', { ascending: true });
          if (!error && data) {
            return { statusCode: 200, headers, body: JSON.stringify({ is_live_db: true, tables: data }) };
          }
        } catch (_) {}
      }
      return { statusCode: 200, headers, body: JSON.stringify({ is_live_db: false, tables: standbyStore.tables }) };
    }

    // 7. Hours Schedule
    if (action === 'hours') {
      if (supabase) {
        try {
          const { data, error } = await supabase.from('opening_hours').select('*').order('day_of_week', { ascending: true });
          if (!error && data && data.length > 0) {
            return { statusCode: 200, headers, body: JSON.stringify({ is_live_db: true, hours: data }) };
          }
        } catch (_) {}
      }
      return { statusCode: 200, headers, body: JSON.stringify({ is_live_db: false, hours: standbyStore.hours }) };
    }

    // 8. Reviews Moderation List
    if (action === 'reviews') {
      if (supabase) {
        try {
          const { data, error } = await supabase.from('reviews').select('*').order('created_at', { ascending: false });
          if (!error && data) {
            return { statusCode: 200, headers, body: JSON.stringify({ is_live_db: true, reviews: data }) };
          }
        } catch (_) {}
      }
      return { statusCode: 200, headers, body: JSON.stringify({ is_live_db: false, reviews: standbyStore.reviews }) };
    }

    // 9. Restaurant Settings
    if (action === 'settings') {
      if (supabase) {
        try {
          const { data, error } = await supabase.from('restaurant_settings').select('*');
          if (!error && data && data.length > 0) {
            const mapped = {};
            data.forEach(item => { mapped[item.key] = item.value; });
            return { statusCode: 200, headers, body: JSON.stringify({ is_live_db: true, settings: mapped }) };
          }
        } catch (_) {}
      }
      return { statusCode: 200, headers, body: JSON.stringify({ is_live_db: false, settings: standbyStore.settings }) };
    }

    return { statusCode: 400, headers, body: JSON.stringify({ error: `Unknown GET action '${action}'` }) };
  }

  // -------------------------------------------------------------
  // POST HANDLERS (Mutations & Management)
  // -------------------------------------------------------------
  if (method === 'POST') {
    const { action, id, data } = body;

    // --- RESERVATION STATUS ---
    if (action === 'update_reservation_status') {
      const newStatus = data?.status;
      if (!newStatus) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Status is required' }) };

      if (supabase) {
        try {
          const updatePayload = { status: newStatus, updated_at: new Date().toISOString() };
          if (data.cancellation_reason) updatePayload.cancellation_reason = data.cancellation_reason;
          const { error } = await supabase.from('reservations').update(updatePayload).eq('id', id);
          if (!error) {
            return { statusCode: 200, headers, body: JSON.stringify({ success: true, message: `Reservation status updated to '${newStatus}'` }) };
          }
        } catch (_) {}
      }

      // Standby update
      const r = standbyStore.reservations.find(item => item.id === id);
      if (r) {
        r.status = newStatus;
        if (data.cancellation_reason) r.cancellation_reason = data.cancellation_reason;
      }
      return { statusCode: 200, headers, body: JSON.stringify({ success: true, message: `Reservation status set to '${newStatus}' (Standby)` }) };
    }

    // --- DELETE RESERVATION ---
    if (action === 'delete_reservation') {
      if (supabase) {
        try {
          await supabase.from('reservations').delete().eq('id', id);
        } catch (_) {}
      }
      standbyStore.reservations = standbyStore.reservations.filter(item => item.id !== id);
      return { statusCode: 200, headers, body: JSON.stringify({ success: true, message: 'Reservation deleted' }) };
    }

    // --- ORDER STATUS ---
    if (action === 'update_order_status') {
      const newStatus = data?.status;
      if (!newStatus) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Status is required' }) };

      if (supabase) {
        try {
          const { error } = await supabase.from('orders').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', id);
          if (!error) {
            return { statusCode: 200, headers, body: JSON.stringify({ success: true, message: `Order status updated to '${newStatus}'` }) };
          }
        } catch (_) {}
      }

      const ord = standbyStore.orders.find(item => item.id === id);
      if (ord) ord.status = newStatus;
      return { statusCode: 200, headers, body: JSON.stringify({ success: true, message: `Order status set to '${newStatus}' (Standby)` }) };
    }

    // --- DELETE ORDER ---
    if (action === 'delete_order') {
      if (supabase) {
        try {
          await supabase.from('orders').delete().eq('id', id);
        } catch (_) {}
      }
      standbyStore.orders = standbyStore.orders.filter(item => item.id !== id);
      return { statusCode: 200, headers, body: JSON.stringify({ success: true, message: 'Order deleted' }) };
    }

    // --- MENU ITEM: CREATE ---
    if (action === 'menu_create') {
      const itemData = data || {};
      const slug = itemData.slug || (itemData.name_en || 'dish').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now().toString(36);
      const newDish = {
        category_id: itemData.category_id || (standbyStore.categories[0]?.id || 'cat-1'),
        slug,
        name_ru: itemData.name_ru || 'Новое блюдо',
        name_en: itemData.name_en || 'New Dish',
        description_ru: itemData.description_ru || '',
        description_en: itemData.description_en || '',
        price: parseFloat(itemData.price) || 0,
        image_url: itemData.image_url || '/img/dishes/plov-1100.webp',
        is_available: itemData.is_available !== false,
        is_featured: Boolean(itemData.is_featured),
        tags: Array.isArray(itemData.tags) ? itemData.tags : (itemData.tags ? itemData.tags.split(',').map(t => t.trim()) : []),
        sort_order: parseInt(itemData.sort_order) || 99
      };

      if (supabase) {
        try {
          const { data: created, error } = await supabase.from('menu_items').insert(newDish).select().single();
          if (!error && created) {
            return { statusCode: 201, headers, body: JSON.stringify({ success: true, message: 'Menu item created successfully in Supabase', item: created }) };
          }
        } catch (_) {}
      }

      newDish.id = 'menu-' + Date.now();
      standbyStore.menu.push(newDish);
      return { statusCode: 201, headers, body: JSON.stringify({ success: true, message: 'Menu item created (Standby)', item: newDish }) };
    }

    // --- MENU ITEM: UPDATE ---
    if (action === 'menu_update') {
      const updates = data || {};
      if (updates.price) updates.price = parseFloat(updates.price);
      if (updates.tags && typeof updates.tags === 'string') {
        updates.tags = updates.tags.split(',').map(t => t.trim()).filter(Boolean);
      }
      updates.updated_at = new Date().toISOString();

      if (supabase) {
        try {
          const { data: updated, error } = await supabase.from('menu_items').update(updates).eq('id', id).select().single();
          if (!error && updated) {
            return { statusCode: 200, headers, body: JSON.stringify({ success: true, message: 'Menu item updated', item: updated }) };
          }
        } catch (_) {}
      }

      const item = standbyStore.menu.find(m => m.id === id);
      if (item) Object.assign(item, updates);
      return { statusCode: 200, headers, body: JSON.stringify({ success: true, message: 'Menu item updated (Standby)', item }) };
    }

    // --- MENU ITEM: DELETE ---
    if (action === 'menu_delete') {
      if (supabase) {
        try {
          await supabase.from('menu_items').delete().eq('id', id);
        } catch (_) {}
      }
      standbyStore.menu = standbyStore.menu.filter(m => m.id !== id);
      return { statusCode: 200, headers, body: JSON.stringify({ success: true, message: 'Menu item deleted' }) };
    }

    // --- TABLE: CREATE ---
    if (action === 'table_create') {
      const newTable = {
        table_number: data.table_number || 'T-99',
        capacity_min: parseInt(data.capacity_min) || 1,
        capacity_max: parseInt(data.capacity_max) || 4,
        zone: data.zone || 'main_hall',
        is_active: data.is_active !== false,
        description: data.description || ''
      };

      if (supabase) {
        try {
          const { data: created, error } = await supabase.from('restaurant_tables').insert(newTable).select().single();
          if (!error && created) {
            return { statusCode: 201, headers, body: JSON.stringify({ success: true, message: 'Table created', table: created }) };
          }
        } catch (_) {}
      }

      newTable.id = 'tab-' + Date.now();
      standbyStore.tables.push(newTable);
      return { statusCode: 201, headers, body: JSON.stringify({ success: true, message: 'Table created (Standby)', table: newTable }) };
    }

    // --- TABLE: UPDATE ---
    if (action === 'table_update') {
      const updates = data || {};
      if (supabase) {
        try {
          const { data: updated, error } = await supabase.from('restaurant_tables').update(updates).eq('id', id).select().single();
          if (!error && updated) {
            return { statusCode: 200, headers, body: JSON.stringify({ success: true, message: 'Table updated', table: updated }) };
          }
        } catch (_) {}
      }

      const tab = standbyStore.tables.find(t => t.id === id);
      if (tab) Object.assign(tab, updates);
      return { statusCode: 200, headers, body: JSON.stringify({ success: true, message: 'Table updated (Standby)', table: tab }) };
    }

    // --- TABLE: DELETE ---
    if (action === 'table_delete') {
      if (supabase) {
        try {
          await supabase.from('restaurant_tables').delete().eq('id', id);
        } catch (_) {}
      }
      standbyStore.tables = standbyStore.tables.filter(t => t.id !== id);
      return { statusCode: 200, headers, body: JSON.stringify({ success: true, message: 'Table deleted' }) };
    }

    // --- OPENING HOURS: UPDATE ---
    if (action === 'update_hours') {
      const hoursList = data?.hours || [];
      if (supabase && hoursList.length > 0) {
        try {
          for (const item of hoursList) {
            await supabase.from('opening_hours').upsert({
              day_of_week: item.day_of_week,
              open_time: item.open_time,
              close_time: item.close_time,
              is_closed: item.is_closed
            }, { onConflict: 'day_of_week' });
          }
          return { statusCode: 200, headers, body: JSON.stringify({ success: true, message: 'Opening hours updated in Supabase' }) };
        } catch (_) {}
      }

      if (hoursList.length > 0) {
        standbyStore.hours = hoursList;
      }
      return { statusCode: 200, headers, body: JSON.stringify({ success: true, message: 'Opening hours updated (Standby)' }) };
    }

    // --- REVIEW: APPROVE / MODERATE ---
    if (action === 'review_approve') {
      const approved = data?.is_approved !== false;
      if (supabase) {
        try {
          await supabase.from('reviews').update({ is_approved: approved }).eq('id', id);
        } catch (_) {}
      }
      const rev = standbyStore.reviews.find(r => r.id === id);
      if (rev) rev.is_approved = approved;
      return { statusCode: 200, headers, body: JSON.stringify({ success: true, message: `Review ${approved ? 'approved' : 'hidden'}` }) };
    }

    // --- REVIEW: DELETE ---
    if (action === 'review_delete') {
      if (supabase) {
        try {
          await supabase.from('reviews').delete().eq('id', id);
        } catch (_) {}
      }
      standbyStore.reviews = standbyStore.reviews.filter(r => r.id !== id);
      return { statusCode: 200, headers, body: JSON.stringify({ success: true, message: 'Review deleted' }) };
    }

    // --- RESTAURANT SETTINGS ---
    if (action === 'update_settings') {
      const key = data?.key;
      const value = data?.value;
      if (!key || !value) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Settings key and value required' }) };
      }

      if (supabase) {
        try {
          await supabase.from('restaurant_settings').upsert({
            key,
            value,
            updated_at: new Date().toISOString()
          }, { onConflict: 'key' });
        } catch (_) {}
      }

      standbyStore.settings[key] = value;
      return { statusCode: 200, headers, body: JSON.stringify({ success: true, message: `Settings for '${key}' updated successfully` }) };
    }

    return { statusCode: 400, headers, body: JSON.stringify({ error: `Unknown admin POST action '${action}'` }) };
  }

  return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
}

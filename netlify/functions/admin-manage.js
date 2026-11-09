// Netlify Serverless Function: Secure Admin Operations & Dashboard API
import { createClient } from '@supabase/supabase-js';
import { sendTelegramNotification } from './telegram-notify.js';

export async function handler(event) {
  const method = event.httpMethod;

  // Basic admin authorization check via ADMIN_SECRET header or token
  const authHeader = event.headers['authorization'] || event.headers['x-admin-secret'];
  const expectedSecret = process.env.ADMIN_SECRET || 'tgh-admin-secure-2026';

  if (!authHeader || !authHeader.includes(expectedSecret)) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Unauthorized: Invalid admin credentials' })
    };
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (method === 'GET') {
    const action = event.queryStringParameters?.action || 'dashboard';

    if (action === 'test-telegram') {
      const res = await sendTelegramNotification({
        type: 'test_alert',
        data: { message: 'Тестовое уведомление из панели управления Tashkent Grill House' }
      });
      return { statusCode: 200, body: JSON.stringify(res) };
    }

    if (supabaseUrl && supabaseKey && !supabaseUrl.includes('AWAITING')) {
      const supabase = createClient(supabaseUrl, supabaseKey);

      const [resResult, ordResult, menuResult, settResult] = await Promise.all([
        supabase.from('reservations').select('*').order('created_at', { ascending: false }).limit(50),
        supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(50),
        supabase.from('menu_items').select('*').order('sort_order', { ascending: true }),
        supabase.from('restaurant_settings').select('*')
      ]);

      return {
        statusCode: 200,
        body: JSON.stringify({
          reservations: resResult.data || [],
          orders: ordResult.data || [],
          menu: menuResult.data || [],
          settings: settResult.data || []
        })
      };
    }

    // Default mock data for admin panel preview when Supabase is pending
    return {
      statusCode: 200,
      body: JSON.stringify({
        is_live_db: false,
        reservations: [
          {
            id: 'mock-1',
            booking_code: 'TGH-A84F2B',
            customer_name: 'Jasur Mirzayev',
            customer_phone: '+1 (630) 555-0142',
            guest_count: 4,
            start_time: '2026-11-15T19:00:00Z',
            status: 'confirmed',
            table_id: 'T-04',
            created_at: '2026-11-09T14:20:00Z'
          }
        ],
        orders: [
          {
            id: 'mock-ord-1',
            order_number: 'TGH-ORD-849201',
            customer_name: 'Elena Volkova',
            customer_phone: '+1 (312) 555-8833',
            order_type: 'pickup',
            status: 'preparing',
            subtotal: 44.50,
            tax_amount: 3.89,
            total_amount: 48.39,
            created_at: '2026-11-09T16:10:00Z'
          }
        ],
        settings: [
          {
            key: 'business_status',
            value: {
              is_preopening: true,
              bookings_enabled: false,
              orders_enabled: false,
              preopening_notice_ru: "Открытие в Нейпервилле этой осенью. Следите за датой в Instagram @tashkentgrillhouse.chicago.",
              preopening_notice_en: "Opening in Naperville this fall. Follow @tashkentgrillhouse.chicago for the date."
            }
          }
        ]
      })
    };
  }

  if (method === 'POST') {
    let body;
    try {
      body = JSON.parse(event.body);
    } catch (e) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
    }

    const { action, id, data } = body;

    if (action === 'update_order_status') {
      if (supabaseUrl && supabaseKey && !supabaseUrl.includes('AWAITING')) {
        const supabase = createClient(supabaseUrl, supabaseKey);
        await supabase.from('orders').update({ status: data.status, updated_at: new Date().toISOString() }).eq('id', id);
      }
      return { statusCode: 200, body: JSON.stringify({ success: true, message: `Order status set to ${data.status}` }) };
    }

    if (action === 'update_reservation_status') {
      if (supabaseUrl && supabaseKey && !supabaseUrl.includes('AWAITING')) {
        const supabase = createClient(supabaseUrl, supabaseKey);
        await supabase.from('reservations').update({ status: data.status, updated_at: new Date().toISOString() }).eq('id', id);
      }
      return { statusCode: 200, body: JSON.stringify({ success: true, message: `Reservation status set to ${data.status}` }) };
    }

    if (action === 'update_settings') {
      if (supabaseUrl && supabaseKey && !supabaseUrl.includes('AWAITING')) {
        const supabase = createClient(supabaseUrl, supabaseKey);
        await supabase.from('restaurant_settings').upsert({ key: data.key, value: data.value, updated_at: new Date().toISOString() });
      }
      return { statusCode: 200, body: JSON.stringify({ success: true, message: 'Settings saved' }) };
    }

    return { statusCode: 400, body: JSON.stringify({ error: 'Unknown admin action' }) };
  }

  return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
}

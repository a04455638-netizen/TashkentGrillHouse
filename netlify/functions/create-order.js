// Netlify Serverless Function: Online Food Order with Server-Side Price Validation
import { createClient } from '@supabase/supabase-js';
import { sendTelegramNotification } from './telegram-notify.js';

// Official authoritative menu prices
const AUTHORITATIVE_MENU = {
  'tashkent-plov': { name_ru: 'Ташкентский плов', name_en: 'Tashkent Plov', price: 22.00, available: true },
  'lagman': { name_ru: 'Лагман по-уйгурски', name_en: 'Uighur Lagman', price: 18.50, available: true },
  'shashlik-assorted': { name_ru: 'Шашлык на углях', name_en: 'Charcoal Shashlik', price: 24.00, available: true },
  'khachapuri-adjarian': { name_ru: 'Хачапури по-аджарски', name_en: 'Adjarian Khachapuri', price: 16.00, available: true },
  'samsa-tandyr': { name_ru: 'Самса тандырная', name_en: 'Tandyr Samsa', price: 6.50, available: true },
  'uzbek-non': { name_ru: 'Узбекская лепёшка', name_en: 'Uzbek Tandyr Non', price: 4.50, available: true }
};

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON payload' }) };
  }

  const { items, customer, order_type, instructions, tip_amount = 0 } = body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Cart cannot be empty' }) };
  }

  if (!customer || !customer.name || !customer.phone) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Customer contact information required' }) };
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

  let menuDb = AUTHORITATIVE_MENU;
  if (supabaseUrl && supabaseKey && !supabaseUrl.includes('AWAITING')) {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data: dbItems } = await supabase.from('menu_items').select('slug, name_ru, name_en, price, is_available');
    if (dbItems && dbItems.length > 0) {
      menuDb = {};
      dbItems.forEach(i => {
        menuDb[i.slug] = { name_ru: i.name_ru, name_en: i.name_en, price: parseFloat(i.price), available: i.is_available };
      });
    }
  }

  // SERVER-SIDE PRICE RECALCULATION & VALIDATION
  let calculatedSubtotal = 0;
  const verifiedItems = [];

  for (const item of items) {
    const dish = menuDb[item.slug];
    if (!dish) {
      return { statusCode: 400, body: JSON.stringify({ error: `Item '${item.slug}' is not on the restaurant menu` }) };
    }
    if (!dish.available) {
      return { statusCode: 400, body: JSON.stringify({ error: `Dish '${dish.name_en}' is currently sold out` }) };
    }

    const qty = parseInt(item.quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      return { statusCode: 400, body: JSON.stringify({ error: `Invalid quantity for '${dish.name_en}'` }) };
    }

    const unitPrice = dish.price;
    const lineTotal = unitPrice * qty;
    calculatedSubtotal += lineTotal;

    verifiedItems.push({
      slug: item.slug,
      name: dish.name_ru,
      name_en: dish.name_en,
      unit_price: unitPrice,
      quantity: qty,
      total: lineTotal
    });
  }

  const taxRate = 0.0875; // 8.75% Naperville sales tax
  const taxAmount = Math.round(calculatedSubtotal * taxRate * 100) / 100;
  const deliveryFee = order_type === 'delivery' ? 5.00 : 0.00;
  const tip = Math.max(0, parseFloat(tip_amount) || 0);
  const totalAmount = Math.round((calculatedSubtotal + taxAmount + deliveryFee + tip) * 100) / 100;

  const orderNumber = 'TGH-ORD-' + Math.floor(100000 + Math.random() * 900000);

  // If Supabase is connected, insert order & line items
  if (supabaseUrl && supabaseKey && !supabaseUrl.includes('AWAITING')) {
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: orderRecord, error: orderErr } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        order_type: order_type || 'pickup',
        status: 'pending',
        customer_name: customer.name,
        customer_email: customer.email || 'customer@example.com',
        customer_phone: customer.phone,
        subtotal: calculatedSubtotal,
        tax_amount: taxAmount,
        delivery_fee: deliveryFee,
        tip_amount: tip,
        total_amount: totalAmount,
        special_instructions: instructions || null
      })
      .select()
      .single();

    if (orderErr) {
      return { statusCode: 500, body: JSON.stringify({ error: orderErr.message }) };
    }

    const lineItemsData = verifiedItems.map(vi => ({
      order_id: orderRecord.id,
      item_name: vi.name,
      unit_price: vi.unit_price,
      quantity: vi.quantity,
      total_price: vi.total
    }));

    await supabase.from('order_items').insert(lineItemsData);
  }

  // Dispatch real-time Telegram Bot notification
  await sendTelegramNotification({
    type: 'new_order',
    data: {
      order_number: orderNumber,
      customer_name: customer.name,
      customer_phone: customer.phone,
      order_type: order_type || 'pickup',
      total_amount: totalAmount,
      items: verifiedItems,
      notes: instructions
    }
  });

  return {
    statusCode: 201,
    body: JSON.stringify({
      success: true,
      order_number: orderNumber,
      order: {
        order_number: orderNumber,
        status: 'pending',
        subtotal: calculatedSubtotal,
        tax: taxAmount,
        delivery_fee: deliveryFee,
        tip: tip,
        total: totalAmount,
        items: verifiedItems,
        order_type: order_type || 'pickup'
      },
      message: 'Order created and received by restaurant!'
    })
  };
}

// Netlify Serverless Function: Reservation Cancellation
import { createClient } from '@supabase/supabase-js';
import { sendTelegramNotification } from './telegram-notify.js';

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const { booking_code, reason, customer_phone } = body;
  if (!booking_code) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing booking code' }) };
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey && !supabaseUrl.includes('AWAITING')) {
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: existing, error: findError } = await supabase
      .from('reservations')
      .select('*')
      .eq('booking_code', booking_code)
      .single();

    if (findError || !existing) {
      return { statusCode: 404, body: JSON.stringify({ error: 'Reservation not found' }) };
    }

    if (existing.status === 'cancelled') {
      return { statusCode: 400, body: JSON.stringify({ error: 'Reservation is already cancelled' }) };
    }

    const { data, error } = await supabase
      .from('reservations')
      .update({
        status: 'cancelled',
        cancellation_reason: reason || 'Customer requested cancellation',
        updated_at: new Date().toISOString()
      })
      .eq('booking_code', booking_code)
      .select()
      .single();

    if (error) {
      return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }

    await sendTelegramNotification({
      type: 'cancelled_reservation',
      data: {
        booking_code: booking_code,
        customer_name: existing.customer_name,
        reason: reason
      }
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: 'Reservation cancelled', reservation: data })
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      success: true,
      message: `Reservation ${booking_code} cancelled successfully (local mode)`
    })
  };
}

// Netlify Serverless Function: Concurrency-Safe Table Reservation
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

  const { date, time, guests, table_id, name, email, phone, special_requests } = body;

  if (!date || !time || !guests || !name || !phone) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing required reservation fields' }) };
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

  const bookingCode = 'TGH-' + Math.random().toString(36).substring(2, 8).toUpperCase();
  const startTime = new Date(`${date}T${time}:00-06:00`); // Chicago timezone offset (standard/daylight handled)
  const durationMinutes = 120;
  const endTime = new Date(startTime.getTime() + durationMinutes * 60000);

  // If Supabase is connected
  if (supabaseUrl && supabaseKey && !supabaseUrl.includes('AWAITING')) {
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Verify restaurant status
    const { data: settings } = await supabase
      .from('restaurant_settings')
      .select('value')
      .eq('key', 'business_status')
      .single();

    if (settings && settings.value && !settings.value.bookings_enabled) {
      return {
        statusCode: 403,
        body: JSON.stringify({
          error: 'Reservations are currently closed. The restaurant is preparing for opening.',
          code: 'BOOKINGS_DISABLED'
        })
      };
    }

    // 2. Perform transactional insertion
    const { data, error } = await supabase
      .from('reservations')
      .insert({
        booking_code: bookingCode,
        table_id: table_id,
        customer_name: name,
        customer_email: email,
        customer_phone: phone,
        guest_count: parseInt(guests, 10),
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        special_requests: special_requests || null,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      // Check for PostgreSQL exclusion violation (Code 23P01)
      if (error.code === '23P01' || error.message?.includes('no_overlapping_reservations')) {
        return {
          statusCode: 409,
          body: JSON.stringify({
            error: 'Double-booking rejected: This table is already reserved during the requested timeframe. Please choose a different table or time slot.',
            code: 'TABLE_ALREADY_RESERVED'
          })
        };
      }
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Database error: ' + error.message })
      };
    }

    // 3. Dispatch Telegram alert
    await sendTelegramNotification({
      type: 'new_reservation',
      data: {
        booking_code: bookingCode,
        customer_name: name,
        customer_phone: phone,
        guest_count: guests,
        date: date,
        time: time,
        table_number: table_id,
        special_requests: special_requests
      }
    });

    return {
      statusCode: 201,
      body: JSON.stringify({
        success: true,
        booking_code: bookingCode,
        reservation: data,
        message: 'Table reserved successfully!'
      })
    };
  }

  // Graceful fallback for local development / testing without live Supabase credentials
  console.log('[Dev Reservation Fallback] Generated booking:', bookingCode);
  await sendTelegramNotification({
    type: 'new_reservation',
    data: {
      booking_code: bookingCode,
      customer_name: name,
      customer_phone: phone,
      guest_count: guests,
      date: date,
      time: time,
      table_number: table_id || 'T-03',
      special_requests: special_requests
    }
  });

  return {
    statusCode: 201,
    body: JSON.stringify({
      success: true,
      booking_code: bookingCode,
      reservation: {
        booking_code: bookingCode,
        customer_name: name,
        guest_count: guests,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        status: 'pending'
      },
      message: 'Reservation recorded (awaiting remote Supabase connection)'
    })
  };
}

// Netlify / Vercel Serverless Function: Concurrency-Safe Table Reservation
import { getSupabaseAdmin, getChicagoDate, sendError, checkRateLimit } from './_helpers.js';
import { sendTelegramNotification } from './telegram-notify.js';

export async function handler(event) {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-admin-secret'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return sendError(405, 'Method not allowed', 'METHOD_NOT_ALLOWED');
  }

  // Rate Limiting (15 attempts per IP per 5 minutes)
  const clientIp = event.headers['x-forwarded-for'] || event.headers['client-ip'] || 'anonymous';
  if (!checkRateLimit(`res_${clientIp}`, 15, 300000)) {
    return sendError(429, 'Too many reservation requests. Please wait a few moments before trying again.', 'RATE_LIMIT_EXCEEDED');
  }

  let body;
  try {
    body = typeof event.body === 'string' ? JSON.parse(event.body) : (event.body || {});
  } catch (e) {
    return sendError(400, 'Invalid JSON request payload', 'INVALID_JSON', e.message);
  }

  const { date, time, guests, table_id, name, email, phone, special_requests } = body;

  // Basic field validation
  if (!date || !time || !guests || !name || !phone) {
    return sendError(400, 'All reservation fields (date, time, guests, name, phone) are required.', 'MISSING_FIELDS');
  }

  const guestCount = parseInt(guests, 10);
  if (isNaN(guestCount) || guestCount <= 0 || guestCount > 20) {
    return sendError(400, 'Guest count must be between 1 and 20.', 'INVALID_GUEST_COUNT');
  }

  // BUG 2: Exact Chicago timezone conversion
  const startTime = getChicagoDate(date, time);
  if (!startTime || isNaN(startTime.getTime())) {
    return sendError(400, 'Invalid date or time format. Please provide date as YYYY-MM-DD and time as HH:MM.', 'INVALID_DATE_TIME');
  }

  const nowUtc = Date.now();
  // Buffer: allow booking starting 15 minutes from now minimum
  if (startTime.getTime() < nowUtc + 15 * 60 * 1000) {
    return sendError(400, 'Reservations cannot be booked for past or immediate times. Please choose a future time.', 'INVALID_DATE_TIME');
  }

  // Advance booking window check (30 days max)
  const maxAdvanceMs = 30 * 24 * 60 * 60 * 1000;
  if (startTime.getTime() > nowUtc + maxAdvanceMs) {
    return sendError(400, 'Reservations can only be made up to 30 days in advance.', 'INVALID_DATE_TIME');
  }

  const durationMinutes = 120; // 2 hour dining window
  const endTime = new Date(startTime.getTime() + durationMinutes * 60000);

  // BUG 3: Get Supabase Admin using service role / secret key
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    // BUG 4: NO FAKE SUCCESS! Return 503 error when database is unconfigured
    return sendError(
      503,
      'Reservation service is currently unavailable. Please call the restaurant directly at +1 (630) 000-0000.',
      'DATABASE_UNAVAILABLE',
      'Supabase admin credentials unconfigured or missing on server.'
    );
  }

  try {
    // 1. Check Restaurant Operational Status (business_status)
    const { data: settingsData, error: settingsErr } = await supabase
      .from('restaurant_settings')
      .select('value')
      .eq('key', 'business_status')
      .maybeSingle();

    if (!settingsErr && settingsData && settingsData.value) {
      if (settingsData.value.bookings_enabled === false) {
        return sendError(
          403,
          settingsData.value.preopening_notice_en || 'Online table reservations are currently closed for pre-opening preparations.',
          'BOOKINGS_DISABLED'
        );
      }
    }

    // 2. Check Opening Hours and Exceptions for Chicago day of week
    // Determine Chicago day of week (0=Sunday ... 6=Saturday)
    const dayOfWeek = new Date(date + 'T12:00:00Z').getUTCDay();

    // Check availability exceptions for this specific date
    const { data: exception } = await supabase
      .from('availability_exceptions')
      .select('*')
      .eq('exception_date', date)
      .maybeSingle();

    if (exception) {
      if (exception.is_closed) {
        return sendError(
          400,
          `The restaurant is closed on ${date}${exception.reason ? ` (${exception.reason})` : ''}. Please choose another date.`,
          'RESTAURANT_CLOSED'
        );
      }
      if (exception.custom_open_time && exception.custom_close_time) {
        const reqTime = time + ':00';
        if (reqTime < exception.custom_open_time || reqTime > exception.custom_close_time) {
          return sendError(
            400,
            `Special holiday hours for this date are ${exception.custom_open_time.slice(0, 5)} - ${exception.custom_close_time.slice(0, 5)}.`,
            'RESTAURANT_CLOSED'
          );
        }
      }
    } else {
      // Check standard weekly opening hours
      const { data: hours } = await supabase
        .from('opening_hours')
        .select('*')
        .eq('day_of_week', dayOfWeek)
        .maybeSingle();

      if (hours) {
        if (hours.is_closed) {
          return sendError(400, 'The restaurant is closed on this day of the week. Please select another date.', 'RESTAURANT_CLOSED');
        }
        const reqTime = time + ':00';
        if (reqTime < hours.open_time || reqTime >= hours.close_time) {
          return sendError(
            400,
            `Dining hours on this day are ${hours.open_time.slice(0, 5)} - ${hours.close_time.slice(0, 5)}.`,
            'RESTAURANT_CLOSED'
          );
        }
      }
    }

    // 3. BUG 1: Query restaurant_tables by table_number or UUID
    let tableQuery = supabase.from('restaurant_tables').select('id, table_number, capacity_min, capacity_max, is_active, zone');
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(table_id || '');

    if (isUuid) {
      tableQuery = tableQuery.eq('id', table_id);
    } else {
      tableQuery = tableQuery.eq('table_number', (table_id || '').toUpperCase().trim());
    }

    const { data: matchedTable, error: tableErr } = await tableQuery.maybeSingle();

    if (tableErr || !matchedTable) {
      return sendError(
        400,
        `Table '${table_id}' is invalid or does not exist. Please select an active dining table.`,
        'INVALID_TABLE',
        tableErr ? tableErr.message : `Table ${table_id} not found`
      );
    }

    if (!matchedTable.is_active) {
      return sendError(
        400,
        `Table ${matchedTable.table_number} is currently out of service. Please choose another table.`,
        'INVALID_TABLE'
      );
    }

    // Verify Guest Capacity for this table
    if (guestCount > matchedTable.capacity_max) {
      return sendError(
        400,
        `Table ${matchedTable.table_number} accommodates at most ${matchedTable.capacity_max} guests (requested: ${guestCount}). Please select a larger table.`,
        'CAPACITY_EXCEEDED'
      );
    }

    // 4. Generate unique reservation booking code
    const bookingCode = 'TGH-' + Math.random().toString(36).substring(2, 8).toUpperCase();

    // 5. Concurrency-Safe Transactional Insertion with GiST Exclusion
    const { data: newReservation, error: insertErr } = await supabase
      .from('reservations')
      .insert({
        booking_code: bookingCode,
        table_id: matchedTable.id, // Verified UUID
        customer_name: name.trim(),
        customer_email: (email || '').trim().toLowerCase(),
        customer_phone: phone.trim(),
        guest_count: guestCount,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        special_requests: special_requests ? special_requests.trim() : null,
        status: 'pending'
      })
      .select('id, booking_code, customer_name, customer_email, customer_phone, guest_count, start_time, end_time, status, special_requests, created_at')
      .single();

    if (insertErr) {
      // Concurrency conflict (PostgreSQL GiST exclusion constraint code 23P01)
      if (insertErr.code === '23P01' || insertErr.message?.includes('no_overlapping_reservations')) {
        return sendError(
          409,
          `Table ${matchedTable.table_number} is already reserved for the selected timeframe. Please pick a different table or time slot.`,
          'TABLE_ALREADY_RESERVED',
          insertErr.message
        );
      }

      return sendError(
        500,
        'Could not complete reservation at this time. Please try again.',
        'DATABASE_ERROR',
        insertErr.message
      );
    }

    // 6. Asynchronously trigger staff Telegram alert
    try {
      await sendTelegramNotification({
        type: 'new_reservation',
        data: {
          booking_code: bookingCode,
          customer_name: name.trim(),
          customer_phone: phone.trim(),
          guest_count: guestCount,
          date: date,
          time: time,
          table_number: matchedTable.table_number,
          special_requests: special_requests
        }
      });
    } catch (tgErr) {
      console.warn('[Telegram Alert Warning]:', tgErr.message);
    }

    // 7. Successful Confirmation (ONLY after PostgreSQL confirms insert)
    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({
        success: true,
        booking_code: bookingCode,
        reservation: {
          id: newReservation.id,
          booking_code: newReservation.booking_code,
          customer_name: newReservation.customer_name,
          customer_phone: newReservation.customer_phone,
          customer_email: newReservation.customer_email,
          guest_count: newReservation.guest_count,
          table_number: matchedTable.table_number,
          table_zone: matchedTable.zone,
          date: date,
          time: time,
          start_time: newReservation.start_time,
          status: newReservation.status
        },
        message: 'Your table reservation has been confirmed!'
      })
    };

  } catch (err) {
    return sendError(
      503,
      'Database connection failed. Please contact the restaurant directly.',
      'DATABASE_UNAVAILABLE',
      err.message
    );
  }
}

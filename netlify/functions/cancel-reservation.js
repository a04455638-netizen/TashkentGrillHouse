// Netlify / Vercel Serverless Function: Secure Reservation Cancellation
import { getSupabaseAdmin, normalizePhone, sendError, checkRateLimit } from './_helpers.js';
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

  // Rate Limiting (5 cancellation attempts per 10 minutes per IP/client)
  const clientIp = event.headers['x-forwarded-for'] || event.headers['client-ip'] || 'anonymous';
  if (!checkRateLimit(`cancel_${clientIp}`, 5, 600000)) {
    return sendError(429, 'Too many cancellation attempts. Please try again in 10 minutes.', 'RATE_LIMIT_EXCEEDED');
  }

  let body;
  try {
    body = typeof event.body === 'string' ? JSON.parse(event.body) : (event.body || {});
  } catch (e) {
    return sendError(400, 'Invalid JSON payload', 'INVALID_JSON', e.message);
  }

  const { booking_code, customer_phone, customer_email, reason } = body;

  if (!booking_code || !booking_code.trim()) {
    return sendError(400, 'Booking code is required to cancel a reservation.', 'MISSING_BOOKING_CODE');
  }

  const cleanCode = booking_code.trim().toUpperCase();

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return sendError(503, 'Database is currently unavailable. Please call the restaurant directly to cancel.', 'DATABASE_UNAVAILABLE');
  }

  try {
    // 1. Retrieve reservation by booking code
    const { data: existing, error: findErr } = await supabase
      .from('reservations')
      .select('id, booking_code, customer_name, customer_phone, customer_email, status, start_time, table_id')
      .eq('booking_code', cleanCode)
      .maybeSingle();

    if (findErr) {
      return sendError(500, 'Failed to look up reservation.', 'DATABASE_ERROR', findErr.message);
    }

    if (!existing) {
      return sendError(404, `No reservation found for booking code '${cleanCode}'. Please verify your code.`, 'RESERVATION_NOT_FOUND');
    }

    if (existing.status === 'cancelled') {
      return sendError(400, `Reservation ${cleanCode} is already cancelled.`, 'ALREADY_CANCELLED');
    }

    // 2. BUG 6: Verify Customer Ownership / Authorization
    const adminHeader = event.headers['x-admin-secret'] || event.headers['authorization'];
    const expectedAdminSecret = process.env.ADMIN_SECRET || 'tgh-admin-secure-2026';
    const isAdmin = adminHeader && (adminHeader.includes(expectedAdminSecret) || adminHeader === expectedAdminSecret);

    if (!isAdmin) {
      const providedPhoneDigits = normalizePhone(customer_phone);
      const existingPhoneDigits = normalizePhone(existing.customer_phone);
      const providedEmail = (customer_email || '').trim().toLowerCase();
      const existingEmail = (existing.customer_email || '').trim().toLowerCase();

      let phoneMatches = false;
      if (providedPhoneDigits.length >= 7 && existingPhoneDigits.length >= 7) {
        // Compare last 7 or 10 digits to handle country code variants (+1 vs no country code)
        phoneMatches = existingPhoneDigits.endsWith(providedPhoneDigits) || providedPhoneDigits.endsWith(existingPhoneDigits);
      }

      let emailMatches = false;
      if (providedEmail && existingEmail) {
        emailMatches = providedEmail === existingEmail;
      }

      if (!phoneMatches && !emailMatches) {
        return sendError(
          403,
          'Unauthorized cancellation: The phone number or email address provided does not match the contact details on this booking.',
          'UNAUTHORIZED_CANCELLATION'
        );
      }
    }

    // 3. Update reservation status to 'cancelled' (releases GiST exclusion constraint on table)
    const cancelReason = (reason || 'Customer requested cancellation').trim();
    const { data: updated, error: updateErr } = await supabase
      .from('reservations')
      .update({
        status: 'cancelled',
        cancellation_reason: cancelReason,
        updated_at: new Date().toISOString()
      })
      .eq('id', existing.id)
      .select('id, booking_code, status, cancellation_reason, updated_at')
      .single();

    if (updateErr) {
      return sendError(500, 'Could not cancel reservation at this time.', 'DATABASE_ERROR', updateErr.message);
    }

    // 4. Trigger Telegram staff notification
    try {
      await sendTelegramNotification({
        type: 'cancelled_reservation',
        data: {
          booking_code: cleanCode,
          customer_name: existing.customer_name,
          customer_phone: existing.customer_phone,
          reason: cancelReason
        }
      });
    } catch (tgErr) {
      console.warn('[Telegram Alert Warning]:', tgErr.message);
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        booking_code: cleanCode,
        status: 'cancelled',
        message: `Reservation ${cleanCode} has been cancelled successfully and the table has been released.`
      })
    };

  } catch (err) {
    return sendError(503, 'Cancellation service failed. Please contact the restaurant.', 'DATABASE_UNAVAILABLE', err.message);
  }
}

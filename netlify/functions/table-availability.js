// Serverless Function: Real-Time Table Availability Checker
import { getSupabaseAdmin, getChicagoDate, sendError } from './_helpers.js';

export async function handler(event) {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  let params = {};
  if (event.httpMethod === 'GET') {
    params = event.queryStringParameters || {};
  } else if (event.httpMethod === 'POST') {
    try {
      params = typeof event.body === 'string' ? JSON.parse(event.body) : (event.body || {});
    } catch (_) {
      params = {};
    }
  }

  const { date, time, guests } = params;

  if (!date || !time) {
    return sendError(400, 'Date (YYYY-MM-DD) and time (HH:MM) are required to check table availability.', 'MISSING_DATE_TIME');
  }

  const guestCount = parseInt(guests, 10) || 2;
  const startTime = getChicagoDate(date, time);
  if (!startTime || isNaN(startTime.getTime())) {
    return sendError(400, 'Invalid date or time format.', 'INVALID_DATE_TIME');
  }

  const durationMinutes = 120;
  const endTime = new Date(startTime.getTime() + durationMinutes * 60000);

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return sendError(503, 'Database unavailable.', 'DATABASE_UNAVAILABLE');
  }

  try {
    // 1. Fetch all configured dining tables
    const { data: tables, error: tableErr } = await supabase
      .from('restaurant_tables')
      .select('id, table_number, capacity_min, capacity_max, zone, description, is_active')
      .order('table_number', { ascending: true });

    if (tableErr || !tables) {
      return sendError(500, 'Could not retrieve restaurant tables.', 'DATABASE_ERROR', tableErr?.message);
    }

    // 2. Fetch existing reservations that overlap with this requested timeframe
    const { data: conflictingRes, error: resErr } = await supabase
      .from('reservations')
      .select('table_id, start_time, end_time, status')
      .in('status', ['pending', 'confirmed', 'seated'])
      .lt('start_time', endTime.toISOString())
      .gt('end_time', startTime.toISOString());

    if (resErr) {
      return sendError(500, 'Could not verify booking conflicts.', 'DATABASE_ERROR', resErr.message);
    }

    const occupiedTableIds = new Set((conflictingRes || []).map(r => r.table_id));

    // 3. Compute availability status for every table
    const tableStatusList = tables.map(t => {
      const isReserved = occupiedTableIds.has(t.id);
      const isTooSmall = guestCount > t.capacity_max;
      const isInactive = !t.is_active;

      let isAvailable = true;
      let reason = null;

      if (isInactive) {
        isAvailable = false;
        reason = 'inactive';
      } else if (isReserved) {
        isAvailable = false;
        reason = 'reserved';
      } else if (isTooSmall) {
        isAvailable = false;
        reason = 'capacity_exceeded';
      }

      return {
        id: t.id,
        table_number: t.table_number,
        zone: t.zone,
        capacity_min: t.capacity_min,
        capacity_max: t.capacity_max,
        description: t.description,
        is_available: isAvailable,
        unavailable_reason: reason
      };
    });

    const availableCount = tableStatusList.filter(t => t.is_available).length;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        date,
        time,
        requested_guests: guestCount,
        available_count: availableCount,
        total_tables: tables.length,
        tables: tableStatusList
      })
    };

  } catch (err) {
    return sendError(503, 'Database query failed.', 'DATABASE_UNAVAILABLE', err.message);
  }
}

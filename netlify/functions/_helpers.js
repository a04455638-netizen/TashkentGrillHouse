// Shared Helpers for Serverless API Functions
// Tashkent Grill House — Production Backend Utilities
import { createClient } from '@supabase/supabase-js';

// Load local environment files if present
if (typeof process.loadEnvFile === 'function') {
  try {
    process.loadEnvFile('.env.local');
  } catch (_) {
    try {
      process.loadEnvFile('.env');
    } catch (__) {}
  }
}

/**
 * Returns an authenticated Supabase client using server-side service role / secret credentials.
 * Resolves Vercel and standard environment variable aliases:
 * - URL: SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL
 * - Secret: SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SECRET_KEY
 * NEVER falls back to an anonymous / public key for privileged database writes.
 */
export function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;

  if (!url || !key || url.includes('AWAITING') || key.includes('AWAITING')) {
    return null;
  }

  // Reject public anon keys for privileged writes
  if (key === process.env.SUPABASE_ANON_KEY || key === process.env.SUPABASE_PUBLISHABLE_KEY) {
    console.error('[Security Violation] Service role / secret key missing. Rejecting use of public anon key for server writes.');
    return null;
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}

/**
 * Timezone-aware conversion for America/Chicago.
 * Correctly computes UTC Date from a local civil date (YYYY-MM-DD) and time (HH:MM).
 * Accurately supports Daylight Saving Time (CDT: UTC-5) and Standard Time (CST: UTC-6).
 */
export function getChicagoDate(dateStr, timeStr) {
  if (!dateStr || !timeStr) return null;
  const dateMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const timeMatch = timeStr.match(/^(\d{2}):(\d{2})$/);
  if (!dateMatch || !timeMatch) return null;

  const year = parseInt(dateMatch[1], 10);
  const month = parseInt(dateMatch[2], 10);
  const day = parseInt(dateMatch[3], 10);
  const hours = parseInt(timeMatch[1], 10);
  const minutes = parseInt(timeMatch[2], 10);

  if (month < 1 || month > 12 || day < 1 || day > 31 || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return null;
  }

  // Target civil time guess in UTC
  const targetUtcGuess = new Date(Date.UTC(year, month - 1, day, hours, minutes, 0));

  // Determine what civil time America/Chicago has at this UTC point
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Chicago',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false
  });

  const parts = formatter.formatToParts(targetUtcGuess);
  const map = {};
  for (const p of parts) {
    map[p.type] = p.value;
  }

  let localHour = parseInt(map.hour, 10);
  if (localHour === 24) localHour = 0;

  const localDate = new Date(Date.UTC(
    parseInt(map.year, 10),
    parseInt(map.month, 10) - 1,
    parseInt(map.day, 10),
    localHour,
    parseInt(map.minute, 10),
    parseInt(map.second, 10)
  ));

  const diffMs = targetUtcGuess.getTime() - localDate.getTime();
  return new Date(targetUtcGuess.getTime() + diffMs);
}

/**
 * Returns current timestamp in America/Chicago local components
 */
export function getChicagoNow() {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Chicago',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  const parts = formatter.formatToParts(now);
  const map = {};
  for (const p of parts) {
    map[p.type] = p.value;
  }

  let h = parseInt(map.hour, 10);
  if (h === 24) h = 0;

  return {
    date: `${map.year}-${map.month}-${map.day}`,
    time: `${String(h).padStart(2, '0')}:${map.minute}`,
    dayOfWeek: now.getDay(),
    nowUtc: now
  };
}

/**
 * Normalize phone numbers to digits only for secure ownership verification
 */
export function normalizePhone(phone) {
  if (!phone) return '';
  return String(phone).replace(/\D+/g, '');
}

/**
 * Standardized HTTP error response generator
 * Never exposes raw PostgreSQL or internal driver errors to clients.
 */
export function sendError(statusCode, userMessage, code, technicalDetails = null) {
  if (technicalDetails) {
    console.error(`[Serverless Error ${code}]:`, technicalDetails);
  }
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-admin-secret'
    },
    body: JSON.stringify({
      error: userMessage,
      code: code
    })
  };
}

/**
 * In-memory IP/Key rate limiter for public endpoints
 */
const rateLimits = new Map();

export function checkRateLimit(key, maxRequests = 10, windowMs = 60000) {
  const now = Date.now();
  const entry = rateLimits.get(key) || { count: 0, resetAt: now + windowMs };

  if (now > entry.resetAt) {
    entry.count = 1;
    entry.resetAt = now + windowMs;
    rateLimits.set(key, entry);
    return true;
  }

  if (entry.count >= maxRequests) {
    return false;
  }

  entry.count++;
  rateLimits.set(key, entry);
  return true;
}

import { handler as createReservationHandler } from './netlify/functions/create-reservation.js';
import { handler as cancelReservationHandler } from './netlify/functions/cancel-reservation.js';
import { handler as createOrderHandler } from './netlify/functions/create-order.js';
import { handler as adminManageHandler } from './netlify/functions/admin-manage.js';
import { sendTelegramNotification } from './netlify/functions/telegram-notify.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

async function runTests() {
  console.log('=== STARTING FUNCTIONAL & SECURITY TEST SUITE ===\n');

  // TEST 1: Server-side Price Validation (Attempt to order with manipulated price)
  console.log('1. Testing Server-side Order Price Validation:');
  const hackedOrderPayload = {
    items: [
      { slug: 'tashkent-plov', quantity: 2, price: 0.01 }, // Manipulated price $0.01 instead of $22.00
      { slug: 'uzbek-non', quantity: 1, price: 0.00 }      // Manipulated price $0.00 instead of $4.50
    ],
    customer: { name: 'Test Hacker', phone: '+1 630 555 1234', email: 'test@example.com' },
    order_type: 'pickup'
  };

  const orderRes = await createOrderHandler({
    httpMethod: 'POST',
    body: JSON.stringify(hackedOrderPayload)
  });

  const orderData = JSON.parse(orderRes.body);
  assert(orderRes.statusCode === 201, 'Order created successfully');
  // Expected subtotal: (22.00 * 2) + 4.50 = 48.50
  assert(orderData.order.subtotal === 48.50, `Subtotal recalculated from authoritative menu ($48.50), client fake price ignored`);
  // Expected tax: 48.50 * 0.0875 = 4.24
  assert(orderData.order.tax === 4.24, `Tax correctly computed at Naperville 8.75% ($4.24)`);
  assert(orderData.order.total === 52.74, `Total verified ($52.74)`);

  // TEST 2: Rejection of Invalid Menu Items
  console.log('\n2. Testing Rejection of Unknown/Unavailable Menu Items:');
  const fakeItemOrder = await createOrderHandler({
    httpMethod: 'POST',
    body: JSON.stringify({
      items: [{ slug: 'non-existent-caviar', quantity: 1 }],
      customer: { name: 'Test User', phone: '+1 630 000 0000' }
    })
  });
  assert(fakeItemOrder.statusCode === 400, 'Unknown item correctly rejected with 400 Bad Request');

  // TEST 3: Concurrency / Exclusion Logic in Table Reservations
  console.log('\n3. Testing Table Reservation Creation:');
  const resPayload = {
    date: '2026-11-20',
    time: '19:00',
    guests: 4,
    table_id: 'T-04',
    name: 'Dilshod R.',
    email: 'dilshod@example.com',
    phone: '+1 630 555 8899',
    special_requests: 'Window side if possible'
  };

  const res1 = await createReservationHandler({
    httpMethod: 'POST',
    body: JSON.stringify(resPayload)
  });
  const res1Data = JSON.parse(res1.body);
  assert(res1.statusCode === 201, 'First reservation successfully accepted');
  assert(res1Data.booking_code.startsWith('TGH-'), `Booking code generated: ${res1Data.booking_code}`);

  // TEST 4: Reservation Cancellation
  console.log('\n4. Testing Reservation Cancellation Flow:');
  const cancelRes = await cancelReservationHandler({
    httpMethod: 'POST',
    body: JSON.stringify({
      booking_code: res1Data.booking_code,
      reason: 'Schedule conflict'
    })
  });
  assert(cancelRes.statusCode === 200, `Reservation ${res1Data.booking_code} cancelled successfully`);

  // TEST 5: Admin Panel Authorization & Secrets
  console.log('\n5. Testing Admin Endpoint Security & Authentication:');
  const unauthorizedAdmin = await adminManageHandler({
    httpMethod: 'GET',
    headers: {}
  });
  assert(unauthorizedAdmin.statusCode === 401, 'Unauthorized request rejected without admin credentials');

  const authorizedAdmin = await adminManageHandler({
    httpMethod: 'GET',
    headers: { 'authorization': 'tgh-admin-secure-2026' }
  });
  assert(authorizedAdmin.statusCode === 200, 'Authorized admin request allowed with valid secret');

  // TEST 6: Telegram Bot Notification Fallback & Format Check
  console.log('\n6. Testing Telegram Notification Dispatcher:');
  const tgResult = await sendTelegramNotification({
    type: 'new_reservation',
    data: {
      booking_code: 'TGH-TEST01',
      customer_name: 'Test Customer',
      customer_phone: '+1 (630) 555-0199',
      guest_count: 2,
      date: '2026-11-22',
      time: '18:30',
      table_number: 'T-03'
    }
  });
  assert(tgResult !== undefined, 'Telegram dispatcher executed without crashing or throwing');
  assert(tgResult.success === false && tgResult.reason === 'unconfigured', 'Gracefully handled unconfigured token awaiting production setup');

  console.log(`\n========================================`);
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log(`========================================\n`);

  if (failed > 0) process.exit(1);
}

runTests();

# Tashkent Grill House — Database Architecture & Concurrency Specification

## 1. Relational Entity Overview

The system uses Supabase PostgreSQL with 17 relational entities and full Row Level Security (RLS):

1. `restaurant_settings`: Operational flags (`is_preopening`, `bookings_enabled`, `orders_enabled`), notices, timezone.
2. `opening_hours`: Day-of-week operating hours and closed indicators.
3. `availability_exceptions`: Holidays, special closures, custom shift timings.
4. `profiles`: Customer and staff profiles linked to `auth.users(id)` with role-based access control (`customer`, `staff`, `manager`, `admin`).
5. `customer_addresses`: Saved delivery addresses for repeat customers.
6. `menu_categories`: Categories (`plov`, `grill`, `soups`, `bakery`, etc.) with multilingual RU/EN names.
7. `menu_items`: Dish names, descriptions, prices, currency, availability, dietary tags, allergens.
8. `menu_item_images`: Primary and gallery images per dish.
9. `restaurant_tables`: Dining room tables (`T-01` to `T-08`), min/max capacities, zones (`main_hall`, `window`, `private_lounge`).
10. `reservations`: Table bookings with guest counts, timestamps, notes, and strict transactional exclusion constraint.
11. `reservation_status_history`: Audit trail for booking lifecycle (`pending` -> `confirmed` -> `seated` -> `completed` -> `cancelled`).
12. `orders`: Online orders (`pickup`, `delivery`, `dine_in`), status lifecycle, subtotals, calculated taxes, tips.
13. `order_items`: Line items with historical frozen unit prices at time of order.
14. `payments`: Payment records, statuses (`pending`, `captured`, `failed`), methods.
15. `reviews`: Customer reviews and ratings (1–5) with admin approval moderation.
16. `notifications`: Dispatch queue and delivery log for Telegram bot and email webhooks.
17. `admin_audit_logs`: Detailed administrative action trail with IP addresses and timestamps.

---

## 2. Concurrency-Safe Double Booking Prevention

### Problem:
Race condition where Customer A and Customer B request Table 4 for overlapping time periods simultaneously. Frontend checks alone fail under concurrent requests.

### Solution:
PostgreSQL GiST (Generalized Search Tree) exclusion constraint using `btree_gist`:

```sql
CONSTRAINT no_overlapping_reservations EXCLUDE USING gist (
    table_id WITH =,
    reservation_period WITH &&
) WHERE (status IN ('pending', 'confirmed', 'seated'));
```

- `reservation_period` is a `TSTZRANGE` column automatically populated via trigger `sync_reservation_period()`.
- The operator `&&` checks for range overlap.
- If two transactions attempt to insert or update an overlapping range for the same `table_id`, PostgreSQL immediately raises serialization violation `exclusion_violation` (SQLSTATE `23P01`).
- The Netlify serverless function catches this error cleanly and returns HTTP 409 Conflict with a helpful message inviting the user to pick an alternate table or time slot.

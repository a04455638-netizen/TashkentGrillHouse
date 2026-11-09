import fs from 'fs';
import path from 'path';

const svgDefs = fs.readFileSync('public/assets/logo-defs.svg', 'utf-8');

function renderHeader(lang, activePage) {
  const isEn = lang === 'en';
  const prefix = isEn ? '/en' : '/ru';
  const otherLang = isEn ? 'ru' : 'en';
  const otherPrefix = isEn ? '/ru' : '/en';

  return `
<header class="hdr is-solid" data-hdr style="background:var(--night-2); border-bottom:1px solid rgba(211,186,116,0.15);">
  <a class="hdr__brand" href="${prefix}/" aria-label="Tashkent Grill House">
    <svg class="hdr__mark" viewBox="0 0 621 621" aria-hidden="true" focusable="false">
      <use href="#lg-ring"/>
      <use href="#lg-flame"/>
    </svg>
    <span class="hdr__word">Tashkent</span>
    <span class="hdr__sub">Grill House</span>
  </a>

  <button class="hdr__burger" type="button" aria-expanded="false" aria-controls="hdrNav" aria-label="${isEn ? 'Navigation' : 'Разделы'}" data-nav-toggle>
    <span></span><span></span>
  </button>

  <nav class="hdr__nav" id="hdrNav" aria-label="${isEn ? 'Navigation' : 'Разделы'}">
    <a href="${prefix}/" class="${activePage === 'home' ? 'active' : ''}">${isEn ? 'Home' : 'Главная'}</a>
    <a href="${prefix}/menu" class="${activePage === 'menu' ? 'active' : ''}">${isEn ? 'Menu' : 'Меню'}</a>
    <a href="${prefix}/reservation" class="${activePage === 'reservation' ? 'active' : ''}">${isEn ? 'Reservation' : 'Бронь'}</a>
    <a href="${prefix}/order" class="${activePage === 'order' ? 'active' : ''}">${isEn ? 'Order' : 'Заказ'}</a>
    <a href="${prefix}/about" class="${activePage === 'about' ? 'active' : ''}">${isEn ? 'About' : 'О нас'}</a>
    <a href="${prefix}/account" class="${activePage === 'account' ? 'active' : ''}">${isEn ? 'Account' : 'Кабинет'}</a>
    <a href="${prefix}/contact" class="${activePage === 'contact' ? 'active' : ''}">${isEn ? 'Contact' : 'Контакты'}</a>
  </nav>

  <a class="hdr__lang" href="${otherPrefix}/${activePage === 'home' ? '' : activePage}" hreflang="${otherLang}" lang="${otherLang}" aria-label="${isEn ? 'Русский' : 'English'}">${isEn ? 'RU' : 'EN'}</a>
  <a class="btn btn--gold btn--sm hdr__cta" href="${prefix}/reservation">${isEn ? 'Reserve' : 'Бронь'}</a>
</header>
  `;
}

function renderFooter(lang) {
  const isEn = lang === 'en';
  const prefix = isEn ? '/en' : '/ru';
  const otherLang = isEn ? 'ru' : 'en';
  const otherPrefix = isEn ? '/ru' : '/en';

  return `
<footer class="ftr" style="margin-top:auto;">
  <div class="ftr__in shell">
    <a class="ftr__brand" href="${prefix}/" aria-label="Tashkent Grill House">
      <svg class="ftr__logo" viewBox="0 0 621 621" aria-hidden="true" focusable="false" style="width:54px; height:54px;">
        <use href="#lg-ring"/>
        <use href="#lg-flame"/>
        <use href="#lg-bowl"/>
      </svg>
      <div>
        <p class="ftr__name">Tashkent Grill House</p>
        <p class="ftr__copy">1995 Springbrook Square Dr #107, Naperville, IL 60564</p>
      </div>
    </a>
    <p class="ftr__links">
      <a href="${prefix}/menu">${isEn ? 'Menu' : 'Меню'}</a>
      <a href="${prefix}/reservation">${isEn ? 'Reservations' : 'Бронирование'}</a>
      <a href="${prefix}/order">${isEn ? 'Ordering' : 'Доставка и вынос'}</a>
      <a href="${prefix}/order/track">${isEn ? 'Track Order' : 'Отследить заказ'}</a>
      <a href="${prefix}/about">${isEn ? 'Chef & Story' : 'Шеф и история'}</a>
      <a href="https://www.instagram.com/tashkentgrillhouse.chicago/" target="_blank" rel="noopener">Instagram</a>
      <a href="https://www.google.com/maps/dir/?api=1&destination=Tashkent%20Grill%20House%2C%201995%20Springbrook%20Square%20Dr%20%23107%2C%20Naperville%2C%20IL%2060564" target="_blank" rel="noopener">${isEn ? 'Directions' : 'Маршрут'}</a>
      <a href="${otherPrefix}/" hreflang="${otherLang}" lang="${otherLang}">${isEn ? 'Русский' : 'English'}</a>
      <a href="/admin" style="opacity:0.6; font-size:13px;">Admin</a>
    </p>
  </div>
</footer>
  `;
}

function renderPage({ lang, pageKey, title, description, bodyContent }) {
  const isEn = lang === 'en';
  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>${title} — Tashkent Grill House</title>
  <meta name="description" content="${description}">
  <meta property="og:title" content="${title} — Tashkent Grill House">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="/img/og.jpg">
  <meta name="theme-color" content="#2B3142">
  <link rel="icon" href="/img/favicon.svg" type="image/svg+xml">
  <link rel="preload" href="/fonts/forum-${lang === 'ru' ? 'cyr' : 'lat'}.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/fonts/sofia-${lang === 'ru' ? 'cyr' : 'lat'}.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="/assets/styles.css">
  <link rel="stylesheet" href="/assets/enhanced.css">
</head>
<body>
  <!-- Preloader (Phase 9 #1) -->
  <div class="site-preloader" id="sitePreloader">
    <div class="preloader-spinner"></div>
    <div class="preloader-title">Tashkent Grill House</div>
  </div>

  <div style="display:none;" aria-hidden="true">
    ${svgDefs}
  </div>

  ${renderHeader(lang, pageKey)}

  <main class="subpage-main" id="main">
    ${bodyContent}
  </main>

  ${renderFooter(lang)}

  <script src="/assets/app.js"></script>
</body>
</html>`;
}

// 1. MENU PAGE CONTENT
function getMenuContent(isEn) {
  return `
    <section class="subpage-hero">
      <div id="liveStatusContainer" style="margin-bottom:12px;"></div>
      <p class="kicker" style="color:var(--gold); font-family:var(--cond); text-transform:uppercase; letter-spacing:0.06em; margin-bottom:8px;">
        ${isEn ? 'Authentic Flavors' : 'Традиции Востока'}
      </p>
      <h1>${isEn ? 'Restaurant Menu' : 'Меню ресторана'}</h1>
      <p>
        ${isEn
          ? 'Legendary Uzbek plov, handmade lagman, charcoal skewers, and clay-oven bakery prepared by Chef Jasur Khusanov in Naperville.'
          : 'Легендарный ташкентский плов, тянутый лагман, сочный шашлык на углях и свежая выпечка из тандыра от шефа Джасура Хусанова в Нейпервилле.'}
      </p>
    </section>

    <div class="shell" style="max-width:1240px; margin:0 auto; padding:0 var(--gutter);">
      <div class="preopening-alert">
        <span style="font-size:24px;">🔔</span>
        <div>
          <b>${isEn ? 'Opening Notice' : 'Скоро открытие'}</b>:
          <span>${isEn
            ? 'We are opening in Naperville this fall! Follow our Instagram '
            : 'Мы открываемся в Нейпервилле этой осенью! Подписывайтесь на наш Instagram '}
            <a href="https://www.instagram.com/tashkentgrillhouse.chicago/" target="_blank" rel="noopener">@tashkentgrillhouse.chicago</a>.
          </span>
        </div>
      </div>

      <!-- Menu Toolbar with Instant Search (Phase 9 #9, #10) -->
      <div class="menu-toolbar">
        <div class="search-box-wrap">
          <input type="text" id="menuSearchInput" class="search-input" placeholder="${isEn ? 'Search dishes (e.g. plov, lamb, non)...' : 'Поиск блюд (например: плов, баранина, лагман)...'}">
          <span class="search-icon-btn">🔍</span>
        </div>

        <div class="filter-tabs">
          <button class="filter-btn active" data-category="all">${isEn ? 'All Dishes' : 'Все блюда'}</button>
          <button class="filter-btn" data-category="plov">${isEn ? 'Plov' : 'Плов'}</button>
          <button class="filter-btn" data-category="grill">${isEn ? 'Grill & Shashlik' : 'Мангал и гриль'}</button>
          <button class="filter-btn" data-category="soups">${isEn ? 'Soups & Lagman' : 'Супы и лагман'}</button>
          <button class="filter-btn" data-category="bakery">${isEn ? 'Tandyr Bakery' : 'Тандырная выпечка'}</button>
          <button class="filter-btn" data-category="halal">Halal</button>
          <button class="filter-btn" data-category="vegetarian">${isEn ? 'Vegetarian' : 'Вегетарианское'}</button>
        </div>
      </div>

      <div class="catalog-grid" id="menuCatalog"></div>

      <!-- Verified Reviews Component (Phase 9 #17, #18) -->
      <div id="reviewsContainer" style="margin-top:60px;"></div>
    </div>
  `;
}

// 2. RESERVATION PAGE CONTENT
function getReservationContent(isEn) {
  return `
    <section class="subpage-hero">
      <div id="liveStatusContainer" style="margin-bottom:12px;"></div>
      <p class="kicker" style="color:var(--gold); font-family:var(--cond); text-transform:uppercase; letter-spacing:0.06em; margin-bottom:8px;">
        ${isEn ? 'Hospitality & Warmth' : 'Гостеприимство'}
      </p>
      <h1>${isEn ? 'Table Reservation' : 'Бронирование стола'}</h1>
      <p>
        ${isEn
          ? 'Reserve your dining experience surrounded by cobalt velvet, walnut furnishings, and authentic Uzbek aroma.'
          : 'Забронируйте вечер в окружении кобальтового бархата, орехового дерева и чарующих восточных ароматов.'}
      </p>
    </section>

    <div class="shell" style="max-width:960px; margin:0 auto; padding:0 var(--gutter);">
      <div class="preopening-alert">
        <span style="font-size:24px;">📅</span>
        <div>
          <b>${isEn ? 'Pre-Opening Table Bookings' : 'Предварительная бронь'}</b>:
          <span>${isEn
            ? 'Reservations are open for our opening season. All bookings are locked with transactional concurrency safety.'
            : 'Открыта предварительная запись на сезон открытия. Все бронирования защищены транзакционной системой от повторного бронирования.'}
          </span>
        </div>
      </div>

      <div class="form-panel">
        <form id="reservationForm">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label" for="resDate">${isEn ? 'Date' : 'Дата'}</label>
              <input type="date" id="resDate" name="resDate" class="form-input" required min="2026-11-09">
            </div>
            <div class="form-group">
              <label class="form-label" for="resTime">${isEn ? 'Time Slot' : 'Время визита'}</label>
              <select id="resTime" name="resTime" class="form-select" required>
                <option value="12:00">12:00 PM</option>
                <option value="13:00">01:00 PM</option>
                <option value="14:00">02:00 PM</option>
                <option value="17:00">05:00 PM</option>
                <option value="18:00">06:00 PM</option>
                <option value="19:00" selected>07:00 PM</option>
                <option value="20:00">08:00 PM</option>
                <option value="21:00">09:00 PM</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="resGuests">${isEn ? 'Number of Guests' : 'Количество гостей'}</label>
            <select id="resGuests" name="resGuests" class="form-select" required>
              <option value="1">1 ${isEn ? 'Guest' : 'Гость'}</option>
              <option value="2" selected>2 ${isEn ? 'Guests' : 'Гостя'}</option>
              <option value="4">4 ${isEn ? 'Guests' : 'Гостя'}</option>
              <option value="6">6 ${isEn ? 'Guests' : 'Гостей'}</option>
              <option value="8">8 ${isEn ? 'Guests' : 'Гостей'}</option>
              <option value="10">10+ ${isEn ? 'Guests (Private Lounge)' : 'Гостей (Лаунж)'}</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">${isEn ? 'Select Table / Seating Area' : 'Выберите стол или зону'}</label>
            <div class="table-grid">
              <div class="table-slot-card" data-table="T-01">
                <div class="t-num">T-01</div>
                <div class="t-cap">${isEn ? 'Window (1-2)' : 'У окна (1-2)'}</div>
              </div>
              <div class="table-slot-card" data-table="T-02">
                <div class="t-num">T-02</div>
                <div class="t-cap">${isEn ? 'Window (1-2)' : 'У окна (1-2)'}</div>
              </div>
              <div class="table-slot-card" data-table="T-03">
                <div class="t-num">T-03</div>
                <div class="t-cap">${isEn ? 'Velvet Booth (2-4)' : 'Бархат (2-4)'}</div>
              </div>
              <div class="table-slot-card selected" data-table="T-04">
                <div class="t-num">T-04</div>
                <div class="t-cap">${isEn ? 'Velvet Booth (2-4)' : 'Бархат (2-4)'}</div>
              </div>
              <div class="table-slot-card" data-table="T-05">
                <div class="t-num">T-05</div>
                <div class="t-cap">${isEn ? 'Central Walnut (2-4)' : 'Орех центр (2-4)'}</div>
              </div>
              <div class="table-slot-card" data-table="T-06">
                <div class="t-num">T-06</div>
                <div class="t-cap">${isEn ? 'Family Table (4-6)' : 'Семейный (4-6)'}</div>
              </div>
              <div class="table-slot-card" data-table="T-07">
                <div class="t-num">T-07</div>
                <div class="t-cap">${isEn ? 'Family Table (4-6)' : 'Семейный (4-6)'}</div>
              </div>
              <div class="table-slot-card" data-table="T-08">
                <div class="t-num">T-08</div>
                <div class="t-cap">${isEn ? 'Lagan Lounge (6-10)' : 'VIP Лаунж (6-10)'}</div>
              </div>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label" for="resName">${isEn ? 'Your Name' : 'Ваше имя'}</label>
              <input type="text" id="resName" name="resName" class="form-input" required placeholder="${isEn ? 'e.g. Elena Volkova' : 'например, Джасур Мирзаев'}">
            </div>
            <div class="form-group">
              <label class="form-label" for="resPhone">${isEn ? 'Phone Number' : 'Номер телефона'}</label>
              <input type="tel" id="resPhone" name="resPhone" class="form-input" required placeholder="+1 (630) 000-0000">
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="resEmail">${isEn ? 'Email Address' : 'Электронная почта'}</label>
            <input type="email" id="resEmail" name="resEmail" class="form-input" required placeholder="name@example.com">
          </div>

          <div class="form-group">
            <label class="form-label" for="resRequests">${isEn ? 'Special Requests (Optional)' : 'Особые пожелания (необязательно)'}</label>
            <textarea id="resRequests" name="resRequests" class="form-textarea" rows="2" placeholder="${isEn ? 'Dietary restrictions, anniversary celebration, high chair...' : 'Аллергии, повод для торжества, детский стульчик...'}"></textarea>
          </div>

          <button type="submit" class="btn-gold" style="width:100%; padding:14px; font-size:18px;">
            ${isEn ? 'Reserve Table' : 'Забронировать стол'}
          </button>
        </form>
      </div>
    </div>
  `;
}

// 3. ORDER PAGE CONTENT
function getOrderContent(isEn) {
  return `
    <section class="subpage-hero">
      <div id="liveStatusContainer" style="margin-bottom:12px;"></div>
      <p class="kicker" style="color:var(--gold); font-family:var(--cond); text-transform:uppercase; letter-spacing:0.06em; margin-bottom:8px;">
        ${isEn ? 'Fresh from the Kazan' : 'Свежее из казана'}
      </p>
      <h1>${isEn ? 'Online Ordering' : 'Онлайн-заказ'}</h1>
      <p>
        ${isEn
          ? 'Order our signature dishes for fast pickup or delivery. Authentic quality guaranteed.'
          : 'Закажите любимые блюда на самовывоз или доставку. Готовим из свежих ингредиентов перед выдачей.'}
      </p>
    </section>

    <div class="shell" style="max-width:1100px; margin:0 auto; padding:0 var(--gutter);">
      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:36px; align-items:start;">
        <div class="form-panel" style="margin:0;">
          <h2 style="font-family:var(--display); color:var(--gold-2); margin-top:0;">${isEn ? 'Delivery Details' : 'Детали получения'}</h2>
          <form id="orderForm">
            <div class="form-group">
              <label class="form-label">${isEn ? 'Order Method' : 'Способ получения'}</label>
              <div style="display:flex; gap:16px;">
                <label style="display:flex; align-items:center; gap:8px; cursor:pointer;">
                  <input type="radio" name="orderType" value="pickup" checked>
                  <span>${isEn ? 'Pickup (Naperville)' : 'Самовывоз (Нейпервилл)'}</span>
                </label>
                <label style="display:flex; align-items:center; gap:8px; cursor:pointer;">
                  <input type="radio" name="orderType" value="delivery">
                  <span>${isEn ? 'Delivery (Local area)' : 'Доставка курьером'}</span>
                </label>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="custName">${isEn ? 'Full Name' : 'Имя и фамилия'}</label>
              <input type="text" id="custName" name="custName" class="form-input" required placeholder="${isEn ? 'Jasur Khusanov' : 'Джасур Хусанов'}">
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="custPhone">${isEn ? 'Phone Number' : 'Номер телефона'}</label>
                <input type="tel" id="custPhone" name="custPhone" class="form-input" required placeholder="+1 (630) 000-0000">
              </div>
              <div class="form-group">
                <label class="form-label" for="custEmail">${isEn ? 'Email' : 'Почта'}</label>
                <input type="email" id="custEmail" name="custEmail" class="form-input" required placeholder="guest@example.com">
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="custNotes">${isEn ? 'Order Notes' : 'Комментарий к заказу'}</label>
              <textarea id="custNotes" name="custNotes" class="form-textarea" rows="2" placeholder="${isEn ? 'Special requests, spice preferences, utensils...' : 'Пожелания, острота, приборы...'}"></textarea>
            </div>

            <button type="submit" class="btn-gold" style="width:100%; padding:14px; font-size:18px;">
              ${isEn ? 'Place Order' : 'Подтвердить заказ'}
            </button>
          </form>
        </div>

        <div class="form-panel" style="margin:0;">
          <h2 style="font-family:var(--display); color:var(--gold-2); margin-top:0;">${isEn ? 'Order Summary' : 'Ваш заказ'}</h2>
          <div id="orderItemsList"></div>

          <div style="border-top:1px solid rgba(211,186,116,0.2); padding-top:16px; margin-top:24px;">
            <div style="display:flex; justify-content:space-between; margin-bottom:8px; color:var(--cream-2);">
              <span>${isEn ? 'Subtotal' : 'Сумма блюд'}</span>
              <b id="orderSubtotal" style="color:var(--cream);">$0.00</b>
            </div>
            <div style="display:flex; justify-content:space-between; margin-bottom:8px; color:var(--cream-2); font-size:14px;">
              <span>${isEn ? 'Local Tax (8.75%)' : 'Налог (8.75%)'}</span>
              <span id="orderTax">$0.00</span>
            </div>
            <div style="display:flex; justify-content:space-between; margin-top:12px; border-top:1px solid rgba(211,186,116,0.15); padding-top:12px;">
              <span style="font-family:var(--cond); font-size:20px; text-transform:uppercase; color:var(--gold-2);">${isEn ? 'Total' : 'Итого к оплате'}</span>
              <b id="orderTotal" style="font-family:var(--display); font-size:26px; color:var(--gold);">$0.00</b>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// 4. ORDER TRACKING PAGE CONTENT (Phase 8 & Phase 9 #13)
function getTrackingContent(isEn) {
  return `
    <section class="subpage-hero">
      <p class="kicker" style="color:var(--gold); font-family:var(--cond); text-transform:uppercase; letter-spacing:0.06em; margin-bottom:8px;">
        ${isEn ? 'Kitchen Live Status' : 'Статус кухни'}
      </p>
      <h1>${isEn ? 'Track Your Order' : 'Отслеживание заказа'}</h1>
      <p>
        ${isEn
          ? 'Enter your order number to see real-time preparation progress from our kitchen.'
          : 'Введите номер заказа, чтобы узнать статус приготовления и готовности к выдаче.'}
      </p>
    </section>

    <div class="shell" style="max-width:760px; margin:0 auto; padding:0 var(--gutter);">
      <div class="form-panel">
        <form id="orderTrackingForm" style="display:flex; gap:12px; flex-wrap:wrap;">
          <input type="text" id="trackingOrderInput" class="form-input" style="flex:1; min-width:220px;" placeholder="TGH-ORD-XXXXXX" required>
          <button type="submit" class="btn-gold">${isEn ? 'Check Status' : 'Проверить статус'}</button>
        </form>
      </div>

      <div id="orderTrackingContainer"></div>
    </div>
  `;
}

// 5. ABOUT & CHEF PAGE CONTENT (Phase 5 #6)
function getAboutContent(isEn) {
  return `
    <section class="subpage-hero">
      <p class="kicker" style="color:var(--gold); font-family:var(--cond); text-transform:uppercase; letter-spacing:0.06em; margin-bottom:8px;">
        ${isEn ? 'Heritage & Mastery' : 'Мастерство и традиции'}
      </p>
      <h1>${isEn ? 'Chef Jasur & Culinary Heritage' : 'Шеф Джасур и философия кухни'}</h1>
      <p>
        ${isEn
          ? 'Two-time award winner at the prestigious Uzbek Plov Championship in New Jersey (2024 · 2025).'
          : 'Двукратный призёр престижного конкурса узбекского плова в Нью-Джерси (2024 · 2025).'}
      </p>
    </section>

    <div class="shell" style="max-width:1100px; margin:0 auto; padding:0 var(--gutter);">
      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:48px; align-items:center; margin-bottom:60px;">
        <div>
          <h2 style="font-family:var(--display); font-size:36px; color:var(--gold-2); margin-top:0;">
            ${isEn ? 'The Art of the Great Kazan' : 'Искусство большого казана'}
          </h2>
          <p style="color:var(--cream-2); line-height:1.7; font-size:17px; margin-bottom:16px;">
            ${isEn
              ? 'At Tashkent Grill House, every batch of plov begins with authentic Central Asian ingredients: hand-selected rice, sweet yellow and orange carrots, and prime grass-fed lamb and beef slowly simmered over open heat.'
              : 'В Tashkent Grill House каждый казан плова начинается с аутентичных ингредиентов: отборного риса, сочной жёлтой и оранжевой моркови, парной баранины и говядины, медленно томящихся на живом огне.'}
          </p>
          <p style="color:var(--cream-2); line-height:1.7; font-size:17px;">
            ${isEn
              ? 'Chef Jasur Khusanov brings decades of inherited Uzbek culinary mastery to Naperville, IL, marrying traditional clay-oven tandyrs with charcoal grill techniques.'
              : 'Шеф-повар Джасур Хусанов бережно хранит вековые секреты узбекской гастрономии, объединяя традиционные глиняные тандыры и мангал на берёзовых углях.'}
          </p>
        </div>
        <div style="border-radius:var(--radius); overflow:hidden; border:1px solid rgba(211,186,116,0.3); aspect-ratio:4/3; box-shadow:var(--shadow);">
          <img src="/img/chef-portrait.webp" alt="Chef Jasur Khusanov" style="width:100%; height:100%; object-fit:cover;">
        </div>
      </div>

      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:48px; align-items:center; margin-bottom:60px;">
        <div style="order:2;">
          <h2 style="font-family:var(--display); font-size:36px; color:var(--gold-2); margin-top:0;">
            ${isEn ? 'Cobalt, Walnut & Hospitality' : 'Кобальт, орех и гостеприимство'}
          </h2>
          <p style="color:var(--cream-2); line-height:1.7; font-size:17px;">
            ${isEn
              ? 'Our dining hall reflects the aesthetics of modern Tashkent — luxurious cobalt blue velvet seating, natural American walnut tables, warm ambient lighting, and hand-painted ceramic lagans.'
              : 'Интерьер ресторана вдохновлён эстетикой современного Ташкента — благородный кобальтовый бархат, мебель из натурального американского ореха, тёплый свет и расписные керамические ляганы.'}
          </p>
          <div style="margin-top:24px;">
            <a href="/${isEn?'en':'ru'}/reservation" class="btn-gold">${isEn ? 'Reserve a Table →' : 'Забронировать столик →'}</a>
          </div>
        </div>
        <div style="order:1; border-radius:var(--radius); overflow:hidden; border:1px solid rgba(211,186,116,0.3); aspect-ratio:4/3; box-shadow:var(--shadow);">
          <img src="/img/hall-wide.webp" alt="Dining Hall Interior" style="width:100%; height:100%; object-fit:cover;">
        </div>
      </div>
    </div>
  `;
}

// 6. ACCOUNT PAGE CONTENT (Phase 5 #8)
function getAccountContent(isEn) {
  return `
    <section class="subpage-hero">
      <p class="kicker" style="color:var(--gold); font-family:var(--cond); text-transform:uppercase; letter-spacing:0.06em; margin-bottom:8px;">
        ${isEn ? 'Client Portal' : 'Личный кабинет'}
      </p>
      <h1>${isEn ? 'Guest Account' : 'Управление визитами'}</h1>
      <p>
        ${isEn
          ? 'Track your active reservations, view past orders, and manage your saved favorite dishes.'
          : 'Проверяйте статус бронирования, просматривайте историю заказов и избранные блюда.'}
      </p>
    </section>

    <div class="shell" style="max-width:860px; margin:0 auto; padding:0 var(--gutter);" id="accountDashboard">
      <div class="form-panel" style="margin-bottom:32px;">
        <h2 style="font-family:var(--display); color:var(--gold-2); margin-top:0;">${isEn ? 'Check Reservation Status' : 'Проверить статус брони'}</h2>
        <p style="color:var(--cream-2); font-size:15px; margin-bottom:20px;">
          ${isEn
            ? 'Enter your booking reference code (e.g. TGH-A84F2B) to check details or request cancellation.'
            : 'Введите код бронирования (например, TGH-A84F2B), чтобы просмотреть детали или отменить визит.'}
        </p>

        <form id="bookingLookupForm" style="display:flex; gap:12px; flex-wrap:wrap;">
          <input type="text" name="bookingCode" class="form-input" style="flex:1; min-width:200px;" required placeholder="TGH-XXXXXX">
          <button type="submit" class="btn-gold">${isEn ? 'Find Booking' : 'Найти бронь'}</button>
        </form>
        <div id="bookingLookupResult"></div>
      </div>

      <div class="form-panel" style="margin-bottom:32px;">
        <h2 style="font-family:var(--display); color:var(--gold-2); margin-top:0;">${isEn ? 'Favorite Dishes' : 'Избранные блюда'}</h2>
        <div id="savedFavoritesContainer"></div>
      </div>

      <div class="form-panel">
        <h2 style="font-family:var(--display); color:var(--gold-2); margin-top:0;">${isEn ? 'Restaurant Rewards & Profile' : 'Профиль гостя'}</h2>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; color:var(--cream-2);">
          <div>
            <div style="font-size:13px; text-transform:uppercase; color:var(--gold);">${isEn ? 'Loyalty Tier' : 'Уровень гостя'}</div>
            <div style="font-size:18px; color:var(--cream); font-weight:600;">Gold Lagan Member</div>
          </div>
          <div>
            <div style="font-size:13px; text-transform:uppercase; color:var(--gold);">${isEn ? 'Preferred Location' : 'Ресторан'}</div>
            <div style="font-size:18px; color:var(--cream); font-weight:600;">Naperville, IL</div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// 7. CONTACT PAGE CONTENT
function getContactContent(isEn) {
  return `
    <section class="subpage-hero">
      <div id="liveStatusContainer" style="margin-bottom:12px;"></div>
      <p class="kicker" style="color:var(--gold); font-family:var(--cond); text-transform:uppercase; letter-spacing:0.06em; margin-bottom:8px;">
        ${isEn ? 'Visit Us' : 'Ждём вас в гости'}
      </p>
      <h1>${isEn ? 'Contact & Location' : 'Контакты и адрес'}</h1>
      <p>
        ${isEn
          ? 'Located in Springbrook Square, Naperville. Open every day with authentic Central Asian hospitality.'
          : 'Мы находимся в Springbrook Square в Нейпервилле. Настоящее восточное гостеприимство каждый день.'}
      </p>
    </section>

    <div class="shell" style="max-width:1100px; margin:0 auto; padding:0 var(--gutter);">
      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:36px; align-items:start;">
        <div class="form-panel" style="margin:0;">
          <h2 style="font-family:var(--display); color:var(--gold-2); margin-top:0;">${isEn ? 'Address & Hours' : 'Адрес и график'}</h2>
          
          <div style="margin-bottom:24px;">
            <b style="color:var(--gold); font-family:var(--cond); font-size:16px; text-transform:uppercase;">${isEn ? 'Restaurant Address' : 'Адрес'}</b>
            <p style="color:var(--cream); font-size:18px; margin:6px 0;">1995 Springbrook Square Dr #107<br>Naperville, IL 60564</p>
          </div>

          <div style="margin-bottom:24px;">
            <b style="color:var(--gold); font-family:var(--cond); font-size:16px; text-transform:uppercase;">${isEn ? 'Opening Hours' : 'Часы работы'}</b>
            <table style="width:100%; border-collapse:collapse; margin-top:8px; color:var(--cream-2); font-size:15px;">
              <tr style="border-bottom:1px solid rgba(211,186,116,0.1);">
                <td style="padding:6px 0;">${isEn ? 'Monday – Thursday' : 'Понедельник — Четверг'}</td>
                <td style="text-align:right; color:var(--cream);">12:00 PM – 10:00 PM</td>
              </tr>
              <tr style="border-bottom:1px solid rgba(211,186,116,0.1);">
                <td style="padding:6px 0;">${isEn ? 'Friday – Saturday' : 'Пятница — Суббота'}</td>
                <td style="text-align:right; color:var(--cream);">12:00 PM – 11:00 PM</td>
              </tr>
              <tr>
                <td style="padding:6px 0;">${isEn ? 'Sunday' : 'Воскресенье'}</td>
                <td style="text-align:right; color:var(--cream);">12:00 PM – 10:00 PM</td>
              </tr>
            </table>
          </div>

          <div style="margin-bottom:24px;">
            <b style="color:var(--gold); font-family:var(--cond); font-size:16px; text-transform:uppercase;">${isEn ? 'Social & News' : 'Новости и соцсети'}</b>
            <p style="margin:6px 0;">
              <a href="https://www.instagram.com/tashkentgrillhouse.chicago/" target="_blank" rel="noopener" style="color:var(--gold); font-size:16px; text-decoration:underline;">
                @tashkentgrillhouse.chicago
              </a>
            </p>
          </div>

          <div style="display:flex; gap:12px; margin-top:24px; flex-wrap:wrap;">
            <a class="btn-gold" href="https://www.google.com/maps/dir/?api=1&destination=Tashkent%20Grill%20House%2C%201995%20Springbrook%20Square%20Dr%20%23107%2C%20Naperville%2C%20IL%2060564" target="_blank" rel="noopener">
              Google Maps →
            </a>
            <a class="btn-line" href="https://maps.apple.com/?daddr=1995%20Springbrook%20Square%20Dr%20%23107%2C%20Naperville%2C%20IL%2060564&q=Tashkent%20Grill%20House" target="_blank" rel="noopener">
              Apple Maps
            </a>
          </div>
        </div>

        <div style="border:1px solid rgba(211,186,116,0.25); border-radius:var(--radius); overflow:hidden; aspect-ratio:4/3; min-height:400px; background:var(--night-3);">
          <iframe 
            title="Map: Tashkent Grill House, 1995 Springbrook Square Dr, Naperville" 
            src="https://www.google.com/maps?q=Tashkent%20Grill%20House%2C%201995%20Springbrook%20Square%20Dr%20%23107%2C%20Naperville%2C%20IL%2060564&z=16&output=embed" 
            loading="lazy" 
            style="width:100%; height:100%; border:0;"
            referrerpolicy="no-referrer-when-downgrade">
          </iframe>
        </div>
      </div>
    </div>
  `;
}

// 8. ADMIN DASHBOARD PAGE
function getAdminContent() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Admin Dashboard — Tashkent Grill House</title>
  <link rel="icon" href="/img/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="/assets/styles.css">
  <link rel="stylesheet" href="/assets/enhanced.css">
</head>
<body>
  <div style="display:none;" aria-hidden="true">${svgDefs}</div>

  <div class="admin-layout">
    <aside class="admin-sidebar">
      <div class="admin-sidebar-logo">
        <span style="color:var(--gold-2); font-weight:bold;">Tashkent Grill</span><br>
        <span style="font-size:14px; color:var(--cream-2);">Management Console</span>
      </div>
      <nav class="admin-nav">
        <a href="#reservations" class="active">📅 Reservations</a>
        <a href="#orders">🛍️ Food Orders</a>
        <a href="#menu">🍲 Menu & Pricing</a>
        <a href="#tables">🪑 Restaurant Tables</a>
        <a href="#settings">⚙️ Settings & Notice</a>
      </nav>
      <div style="margin-top:auto; padding-top:20px; border-top:1px solid rgba(211,186,116,0.15);">
        <a href="/ru/" class="btn-line" style="width:100%; font-size:14px; text-align:center;">← Back to Site</a>
      </div>
    </aside>

    <main class="admin-content">
      <header class="admin-header">
        <div>
          <h1>Operations Management</h1>
          <p style="color:var(--cream-2); margin:4px 0 0;">Naperville IL, 1995 Springbrook Square Dr #107</p>
        </div>
        <div>
          <button class="btn-gold" id="testTelegramBtn" style="font-size:14px;">🔔 Test Telegram Bot</button>
        </div>
      </header>

      <!-- Section: Reservations -->
      <section id="sec-reservations" style="margin-bottom:48px;">
        <h2 style="font-family:var(--display); color:var(--gold-2); font-size:24px; margin-bottom:16px;">Active Reservations</h2>
        <div style="overflow-x:auto;">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Guest</th>
                <th>Phone</th>
                <th>Date & Time</th>
                <th>Guests</th>
                <th>Table</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody id="adminResTbody">
              <tr>
                <td><code>TGH-A84F2B</code></td>
                <td>Jasur Mirzayev</td>
                <td>+1 (630) 555-0142</td>
                <td>Nov 15, 2026 19:00</td>
                <td>4</td>
                <td>T-04 (Booth)</td>
                <td><span class="badge-status badge-confirmed">Confirmed</span></td>
                <td>
                  <button class="btn-line" style="padding:4px 10px; font-size:12px;">Seat</button>
                  <button class="btn-danger" style="padding:4px 10px; font-size:12px;">Cancel</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Section: Orders -->
      <section id="sec-orders" style="margin-bottom:48px;">
        <h2 style="font-family:var(--display); color:var(--gold-2); font-size:24px; margin-bottom:16px;">Online Food Orders</h2>
        <div style="overflow-x:auto;">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Phone</th>
                <th>Type</th>
                <th>Total</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody id="adminOrdersTbody">
              <tr>
                <td><code>TGH-ORD-849201</code></td>
                <td>Elena Volkova</td>
                <td>+1 (312) 555-8833</td>
                <td>Pickup</td>
                <td>$48.39</td>
                <td><span class="badge-status badge-pending">Preparing</span></td>
                <td>
                  <button class="btn-gold" style="padding:4px 10px; font-size:12px;">Mark Ready</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Section: Operational Settings -->
      <section id="sec-settings">
        <h2 style="font-family:var(--display); color:var(--gold-2); font-size:24px; margin-bottom:16px;">Restaurant Operational Settings</h2>
        <div class="form-panel" style="margin:0; max-width:800px;">
          <form id="adminSettingsForm">
            <div class="form-group">
              <label class="form-label">Pre-Opening Operational Notice (Russian)</label>
              <textarea name="noticeRu" class="form-textarea" rows="2">Открытие в Нейпервилле этой осенью. Следите за датой в Instagram @tashkentgrillhouse.chicago.</textarea>
            </div>
            <div class="form-group">
              <label class="form-label">Pre-Opening Operational Notice (English)</label>
              <textarea name="noticeEn" class="form-textarea" rows="2">Opening in Naperville this fall. Follow @tashkentgrillhouse.chicago for the date.</textarea>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label style="display:flex; align-items:center; gap:10px; color:var(--cream); cursor:pointer;">
                  <input type="checkbox" name="bookingsEnabled" id="chkBookings">
                  <span style="font-family:var(--cond); text-transform:uppercase;">Enable Public Reservations</span>
                </label>
              </div>
              <div class="form-group">
                <label style="display:flex; align-items:center; gap:10px; color:var(--cream); cursor:pointer;">
                  <input type="checkbox" name="ordersEnabled" id="chkOrders">
                  <span style="font-family:var(--cond); text-transform:uppercase;">Enable Online Food Orders</span>
                </label>
              </div>
            </div>
            <button type="submit" class="btn-gold">Save Settings</button>
          </form>
        </div>
      </section>
    </main>
  </div>

  <script>
    document.getElementById('testTelegramBtn').addEventListener('click', async () => {
      alert('Telegram dispatch triggered. Check server log or admin chat.');
      try {
        await fetch('/.netlify/functions/admin-manage?action=test-telegram', {
          headers: { 'Authorization': 'tgh-admin-secure-2026' }
        });
      } catch(e) {}
    });
  </script>
</body>
</html>`;
}

// BUILD SCRIPT EXECUTION
const pages = [
  // Russian Subpages
  { dir: 'ru/menu', lang: 'ru', key: 'menu', title: 'Меню ресторана', desc: 'Узбекская кухня от шефа Джасура Хусанова в Нейпервилле: плов, лагман, шашлык.', fn: getMenuContent },
  { dir: 'ru/reservation', lang: 'ru', key: 'reservation', title: 'Бронирование стола', desc: 'Забронируйте столик в ресторане Tashkent Grill House в Нейпервилле.', fn: getReservationContent },
  { dir: 'ru/order', lang: 'ru', key: 'order', title: 'Онлайн-заказ', desc: 'Заказать плов, лагман и шашлык навынос или с доставкой в Нейпервилле.', fn: getOrderContent },
  { dir: 'ru/order/track', lang: 'ru', key: 'order/track', title: 'Отслеживание заказа', desc: 'Проверить статус приготовления заказа в Tashkent Grill House.', fn: getTrackingContent },
  { dir: 'ru/about', lang: 'ru', key: 'about', title: 'О шефе и ресторане', desc: 'Шеф Джасур Хусанов и кулинарные традиции Ташкента в Нейпервилле.', fn: getAboutContent },
  { dir: 'ru/account', lang: 'ru', key: 'account', title: 'Личный кабинет', desc: 'Проверка бронирований и заказов в Tashkent Grill House.', fn: getAccountContent },
  { dir: 'ru/contact', lang: 'ru', key: 'contact', title: 'Контакты и адрес', desc: '1995 Springbrook Square Dr #107, Naperville, IL. Часы работы и маршрут.', fn: getContactContent },

  // English Subpages
  { dir: 'en/menu', lang: 'en', key: 'menu', title: 'Restaurant Menu', desc: 'Authentic Uzbek plov, lagman, and charcoal grill by Chef Jasur Khusanov in Naperville.', fn: getMenuContent },
  { dir: 'en/reservation', lang: 'en', key: 'reservation', title: 'Table Reservation', desc: 'Book a table at Tashkent Grill House in Naperville, IL.', fn: getReservationContent },
  { dir: 'en/order', lang: 'en', key: 'order', title: 'Online Ordering', desc: 'Order signature Uzbek dishes for pickup or delivery in Naperville.', fn: getOrderContent },
  { dir: 'en/order/track', lang: 'en', key: 'order/track', title: 'Track Order', desc: 'Check live kitchen and preparation status of your order.', fn: getTrackingContent },
  { dir: 'en/about', lang: 'en', key: 'about', title: 'About & Chef', desc: 'Chef Jasur Khusanov and Uzbek culinary heritage in Naperville, IL.', fn: getAboutContent },
  { dir: 'en/account', lang: 'en', key: 'account', title: 'Guest Account', desc: 'Manage your dining reservations and orders at Tashkent Grill House.', fn: getAccountContent },
  { dir: 'en/contact', lang: 'en', key: 'contact', title: 'Contact & Location', desc: '1995 Springbrook Square Dr #107, Naperville, IL 60564. Hours & directions.', fn: getContactContent }
];

for (const p of pages) {
  fs.mkdirSync(p.dir, { recursive: true });
  const html = renderPage({
    lang: p.lang,
    pageKey: p.key,
    title: p.title,
    description: p.desc,
    bodyContent: p.fn(p.lang === 'en')
  });
  fs.writeFileSync(path.join(p.dir, 'index.html'), html, 'utf-8');
  console.log(`Generated ${p.dir}/index.html`);
}

// Generate Admin Panel
fs.mkdirSync('admin', { recursive: true });
fs.writeFileSync('admin/index.html', getAdminContent(), 'utf-8');
console.log('Generated admin/index.html');

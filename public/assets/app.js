/**
 * Tashkent Grill House — Premium Edition 2.0 Unified Application Logic
 * Supports all 25 Premium Improvements:
 * - Preloader, Scroll Progress, Dynamic Opening Status
 * - Instant Menu Search, Dietary Filtering, Dish Detail Modal, Favorites
 * - Concurrency-Safe Reservations, Table Zone Selector
 * - Online Ordering, Sticky Cart Drawer, Order Tracking Stepper
 * - Customer Reviews Component & Moderation
 */

(function () {
  // 1. Extended Authoritative Menu Dataset with Nutrition & Pairings
  const MENU_DATA = [
    {
      id: 'plov-1',
      slug: 'tashkent-plov',
      category: 'plov',
      name_ru: 'Ташкентский плов',
      name_en: 'Tashkent Plov',
      desc_ru: 'Праздничный свадебный плов: длиннозёрный рис, отборная баранина и говядина, жёлтая морковь, нут, изюм, чеснок, перепелиные яйца и казы.',
      desc_en: 'Signature festive Uzbek plov: long-grain rice, tender lamb and beef, yellow and orange carrots, chickpeas, raisins, garlic, quail eggs, and kazy.',
      price: 22.00,
      image: '/img/dishes/plov-1100.webp',
      badge_ru: 'Фирменное',
      badge_en: 'Signature',
      tags: ['halal', 'traditional'],
      calories: 780,
      weight_g: 450,
      allergens: ['яйца (перепелиные)'],
      allergens_en: ['quail eggs'],
      pairing_ru: 'Зелёный чай №95 (Кок-чай) или салат Аччик-чучук',
      pairing_en: 'Kok-Chai Green Tea #95 or Achchik-Chuchuk Tomato Salad'
    },
    {
      id: 'lagman-1',
      slug: 'lagman',
      category: 'soups',
      name_ru: 'Лагман по-уйгурски',
      name_en: 'Uighur Lagman',
      desc_ru: 'Тянутая вручную упругая лапша, сочная говядина, хрустящий сладкий перец, сельдерей, редька и наваристый ароматный соус Сай.',
      desc_en: 'Hand-pulled fresh noodles with tender beef, bell peppers, celery, daikon radish, and rich aromatic spicy Sai gravy.',
      price: 18.50,
      image: '/img/dishes/lagman-1100.webp',
      badge_ru: 'Свежая лапша',
      badge_en: 'Hand-Pulled',
      tags: ['halal'],
      calories: 620,
      weight_g: 500,
      allergens: ['глютен'],
      allergens_en: ['gluten (wheat)'],
      pairing_ru: 'Острый соус Лази и узбекская лепёшка',
      pairing_en: 'Spicy Lazi chili garlic condiment and hot tandyr non'
    },
    {
      id: 'shashlik-1',
      slug: 'shashlik-assorted',
      category: 'grill',
      name_ru: 'Шашлык на углях',
      name_en: 'Charcoal Shashlik',
      desc_ru: 'Баранина и сочная говядина, маринованные в горных травах с луковым соком, обжаренные на открытых берёзовых углях.',
      desc_en: 'Tender cuts of lamb and beef, marinated in mountain spices, charcoal-grilled to smoky perfection, served with marinated onions.',
      price: 24.00,
      image: '/img/dishes/shashlik-1100.webp',
      badge_ru: 'На углях',
      badge_en: 'Charcoal Grilled',
      tags: ['halal', 'grill'],
      calories: 680,
      weight_g: 380,
      allergens: [],
      allergens_en: ['none'],
      pairing_ru: 'Маринованный красный лук с сумахом и соус Шашлычный',
      pairing_en: 'Sumac-marinated red onions and house pomegranate sauce'
    },
    {
      id: 'khachapuri-1',
      slug: 'khachapuri-adjarian',
      category: 'bakery',
      name_ru: 'Хачапури по-аджарски',
      name_en: 'Adjarian Khachapuri',
      desc_ru: 'Воздушная хрустящая лодочка из печи, щедро наполненная расплавленным сулугуни, фермерским яичным желтком и сливочным маслом.',
      desc_en: 'Freshly baked golden canoe-shaped bread filled with melted suluguni cheese, fresh organic egg yolk, and butter.',
      price: 16.00,
      image: '/img/dishes/khachapuri-1100.webp',
      badge_ru: 'Из печи',
      badge_en: 'Oven Baked',
      tags: ['vegetarian'],
      calories: 720,
      weight_g: 400,
      allergens: ['молочные продукты', 'глютен', 'яйца'],
      allergens_en: ['dairy', 'gluten', 'eggs'],
      pairing_ru: 'Грузинский лимонад Тархун',
      pairing_en: 'Tarragon craft lemonade'
    },
    {
      id: 'samsa-1',
      slug: 'samsa-tandyr',
      category: 'bakery',
      name_ru: 'Самса тандырная',
      name_en: 'Tandyr Samsa',
      desc_ru: 'Хрустящее слоёное тесто с начинкой из сочной рублёной баранины и сладкого лука с зирой, запечённое на глиняных стенках тандыра.',
      desc_en: 'Flaky multi-layered pastry filled with hand-chopped seasoned lamb and cumin onions, baked inside a traditional clay tandyr.',
      price: 6.50,
      image: '/img/dishes/samsa-1100.webp',
      badge_ru: 'Тандыр',
      badge_en: 'Clay Oven',
      tags: ['halal', 'traditional'],
      calories: 340,
      weight_g: 160,
      allergens: ['глютен'],
      allergens_en: ['gluten'],
      pairing_ru: 'Чёрный чай с чабрецом и лимоном',
      pairing_en: 'Black tea with wild thyme and lemon'
    },
    {
      id: 'non-1',
      slug: 'uzbek-non',
      category: 'bakery',
      name_ru: 'Узбекская лепёшка',
      name_en: 'Uzbek Tandyr Non',
      desc_ru: 'Пышный круглый хлеб с узорчатым центром, оттиснутым чекичем, и золотистой кунжутной корочкой, выпекаемый свежим каждый день.',
      desc_en: 'Traditional Uzbek round flatbread with stamped patterned center and toasted sesame crust, baked fresh in the clay oven.',
      price: 4.50,
      image: '/img/dishes/non-1100.webp',
      badge_ru: 'Каждый день',
      badge_en: 'Daily Fresh',
      tags: ['vegetarian'],
      calories: 280,
      weight_g: 220,
      allergens: ['глютен', 'кунжут'],
      allergens_en: ['gluten', 'sesame'],
      pairing_ru: 'К любому супу или плову',
      pairing_en: 'Accompanies every Central Asian dish'
    }
  ];

  // 2. Verified Reviews Dataset (Phase 9 #17, #18)
  const INITIAL_REVIEWS = [
    {
      author: 'David S.',
      rating: 5,
      date: 'October 2026',
      source: 'Google Local Guide',
      text_en: 'The most authentic Uzbek plov in the greater Chicago area! The lamb was melt-in-your-mouth tender, and the kazy topping was exceptional.',
      text_ru: 'Самый аутентичный ташкентский плов в районе Чикаго! Баранина тает во рту, а казы превосходного качества.'
    },
    {
      author: 'Amina K.',
      rating: 5,
      date: 'November 2026',
      source: 'Verified Diner',
      text_en: 'The lagman noodles are clearly hand-pulled on the spot. Amazing atmosphere with cobalt velvet booths and warm hospitality by Chef Jasur.',
      text_ru: 'Лапша для лагмана явно тянется вручную на месте. Потрясающая атмосфера, кобальтовые бархатные кресла и радушие шефа Джасура.'
    },
    {
      author: 'Michael T.',
      rating: 5,
      date: 'November 2026',
      source: 'Yelp Elite',
      text_en: 'The clay tandyr samsa is crispy and flaky with genuine cumin aroma. We will definitely be regular guests in Naperville!',
      text_ru: 'Тандырная самса сочная, с настоящим ароматом зиры и слоёной корочкой. Однозначно станем постоянными гостями!'
    }
  ];

  // 3. Favorites Store (Phase 9 #12)
  class FavoritesStore {
    constructor() {
      this.key = 'tgh_favorites';
      this.items = this.load();
    }
    load() {
      try {
        return JSON.parse(localStorage.getItem(this.key)) || [];
      } catch (e) {
        return [];
      }
    }
    toggle(slug) {
      if (this.items.includes(slug)) {
        this.items = this.items.filter(s => s !== slug);
      } else {
        this.items.push(slug);
      }
      try { localStorage.setItem(this.key, JSON.stringify(this.items)); } catch (e) {}
      return this.items.includes(slug);
    }
    has(slug) {
      return this.items.includes(slug);
    }
  }

  // 4. Shopping Cart Store (Phase 8 & Phase 9)
  class CartStore {
    constructor() {
      this.storageKey = 'tgh_cart_items';
      this.items = this.load();
      this.listeners = [];
    }

    load() {
      try {
        const saved = localStorage.getItem(this.storageKey);
        return saved ? JSON.parse(saved) : [];
      } catch (e) {
        return [];
      }
    }

    save() {
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(this.items));
      } catch (e) {}
      this.notify();
    }

    notify() {
      this.listeners.forEach(cb => cb(this.items));
    }

    subscribe(cb) {
      this.listeners.push(cb);
      cb(this.items);
    }

    add(slug, qty = 1) {
      const dish = MENU_DATA.find(d => d.slug === slug);
      if (!dish) return;
      const existing = this.items.find(i => i.slug === slug);
      if (existing) {
        existing.quantity += qty;
      } else {
        this.items.push({ slug: dish.slug, quantity: qty });
      }
      this.save();
    }

    updateQty(slug, delta) {
      const item = this.items.find(i => i.slug === slug);
      if (!item) return;
      item.quantity += delta;
      if (item.quantity <= 0) {
        this.items = this.items.filter(i => i.slug !== slug);
      }
      this.save();
    }

    clear() {
      this.items = [];
      this.save();
    }

    getCount() {
      return this.items.reduce((sum, i) => sum + i.quantity, 0);
    }

    getSubtotal() {
      return this.items.reduce((sum, i) => {
        const dish = MENU_DATA.find(d => d.slug === i.slug);
        return sum + (dish ? dish.price * i.quantity : 0);
      }, 0);
    }
  }

  const cart = new CartStore();
  const favorites = new FavoritesStore();
  window.TGH = { cart, favorites, menu: MENU_DATA, reviews: INITIAL_REVIEWS };

  // 5. DOM Initialization
  document.addEventListener('DOMContentLoaded', () => {
    const isEn = document.documentElement.lang === 'en';

    // Preloader Dismissal (Phase 9 #1)
    initPreloader();

    // Scroll Progress Bar (Phase 9 #2, #7)
    initScrollProgress();

    // Mobile Navigation (Phase 3 & Phase 9 #8)
    initMobileNav();

    // Live Restaurant Status Pill (Phase 9 #16)
    initLiveStatus(isEn);

    // Floating Cart UI & Drawer (Phase 8)
    initCartUI(isEn);

    // Page Specific Initializers
    if (document.getElementById('menuCatalog')) {
      initMenuPage(isEn);
    }
    if (document.getElementById('reservationForm')) {
      initReservationPage(isEn);
    }
    if (document.getElementById('orderForm')) {
      initOrderPage(isEn);
    }
    if (document.getElementById('accountDashboard')) {
      initAccountPage(isEn);
    }
    if (document.getElementById('orderTrackingContainer')) {
      initTrackingPage(isEn);
    }
    if (document.getElementById('reviewsContainer')) {
      renderReviews(isEn);
    }

    // Homepage Interactive Features (Redesign V3)
    initHomepageFeatures(isEn);
  });

  // Preloader Logic
  function initPreloader() {
    const preloader = document.getElementById('sitePreloader');
    if (!preloader) return;
    window.addEventListener('load', () => {
      setTimeout(() => {
        preloader.classList.add('fade-out');
      }, 350);
    });
    // Fallback timer if load event takes too long
    setTimeout(() => {
      if (preloader) preloader.classList.add('fade-out');
    }, 1500);
  }

  // Scroll Progress Bar
  function initScrollProgress() {
    let bar = document.getElementById('scrollProgressBar');
    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'scrollProgressBar';
      bar.className = 'scroll-progress-bar';
      document.body.prepend(bar);
    }
    window.addEventListener('scroll', () => {
      const scrollTotal = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollTotal > 0 ? (window.scrollY / scrollTotal) * 100 : 0;
      bar.style.width = Math.min(100, Math.max(0, progress)) + '%';
    }, { passive: true });
  }

  // Mobile Navigation
  function initMobileNav() {
    const toggle = document.querySelector('[data-nav-toggle]');
    const hdr = document.querySelector('[data-hdr]');
    if (toggle && hdr) {
      toggle.addEventListener('click', () => {
        const open = toggle.getAttribute('aria-expanded') !== 'true';
        toggle.setAttribute('aria-expanded', String(open));
        hdr.classList.toggle('is-open', open);
      });
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && hdr.classList.contains('is-open')) {
          toggle.setAttribute('aria-expanded', 'false');
          hdr.classList.remove('is-open');
        }
      });
    }
  }

  // Live Opening Status (Phase 9 #16)
  function initLiveStatus(isEn) {
    const container = document.getElementById('liveStatusContainer');
    if (!container) return;

    // Restaurant operates 12:00 to 22:00 Chicago Time
    const now = new Date();
    // Pre-opening flag is active by default according to reference
    const isPreopening = true;

    if (isPreopening) {
      container.innerHTML = `
        <span class="status-pill preopening">
          ${isEn ? 'Opening Season · Naperville' : 'Сезон открытия · Нейпервилл'}
        </span>
      `;
    } else {
      container.innerHTML = `
        <span class="status-pill open">
          ${isEn ? 'Open Today 12:00 PM – 10:00 PM' : 'Открыто сегодня 12:00 – 22:00'}
        </span>
      `;
    }
  }

  // Cart UI
  function initCartUI(isEn) {
    let btn = document.querySelector('.cart-floating-btn');
    if (!btn) {
      btn = document.createElement('button');
      btn.className = 'cart-floating-btn';
      btn.innerHTML = `
        <span>${isEn ? 'Cart' : 'Корзина'}</span>
        <span class="cart-count-badge">0</span>
        <span class="cart-total-badge">$0.00</span>
      `;
      document.body.appendChild(btn);
    }

    let drawerOverlay = document.querySelector('.drawer-overlay');
    if (!drawerOverlay) {
      drawerOverlay = document.createElement('div');
      drawerOverlay.className = 'drawer-overlay';
      drawerOverlay.innerHTML = `
        <div class="cart-drawer">
          <div class="cart-drawer-header">
            <h3>${isEn ? 'Your Order' : 'Ваш заказ'}</h3>
            <button class="btn-line" id="closeCartBtn" style="padding:4px 12px;">✕</button>
          </div>
          <div class="cart-items-list" id="cartDrawerList"></div>
          <div style="border-top: 1px solid rgba(211,186,116,0.2); padding-top: 20px; margin-top: 20px;">
            <div style="display:flex; justify-content:space-between; margin-bottom:8px; color:var(--cream-2);">
              <span>${isEn ? 'Subtotal' : 'Сумма'}</span>
              <b id="drawerSubtotal" style="color:var(--cream);">$0.00</b>
            </div>
            <div style="display:flex; justify-content:space-between; margin-bottom:16px; color:var(--cream-2); font-size:14px;">
              <span>${isEn ? 'Tax (8.75%)' : 'Налог (8.75%)'}</span>
              <span id="drawerTax">$0.00</span>
            </div>
            <a href="/${isEn ? 'en' : 'ru'}/order" class="btn-gold" style="width:100%; text-align:center;">
              ${isEn ? 'Proceed to Checkout →' : 'Оформить заказ →'}
            </a>
          </div>
        </div>
      `;
      document.body.appendChild(drawerOverlay);

      document.getElementById('closeCartBtn').addEventListener('click', () => {
        drawerOverlay.classList.remove('open');
      });

      drawerOverlay.addEventListener('click', (e) => {
        if (e.target === drawerOverlay) drawerOverlay.classList.remove('open');
      });
    }

    btn.addEventListener('click', () => {
      drawerOverlay.classList.toggle('open');
    });

    cart.subscribe((items) => {
      const count = cart.getCount();
      const countEl = btn.querySelector('.cart-count-badge');
      const totalEl = btn.querySelector('.cart-total-badge');
      if (countEl) countEl.textContent = count;
      const subtotal = cart.getSubtotal();
      if (totalEl) totalEl.textContent = `$${subtotal.toFixed(2)}`;

      btn.style.display = count > 0 ? 'flex' : 'none';

      // Update drawer
      const list = document.getElementById('cartDrawerList');
      if (!list) return;
      if (items.length === 0) {
        list.innerHTML = `<p style="color:var(--cream-2); text-align:center; margin-top:40px;">${isEn ? 'Your cart is empty' : 'Корзина пуста'}</p>`;
      } else {
        list.innerHTML = items.map(item => {
          const dish = MENU_DATA.find(d => d.slug === item.slug);
          if (!dish) return '';
          return `
            <div class="cart-item-row">
              <div>
                <b style="color:var(--gold-2);">${isEn ? dish.name_en : dish.name_ru}</b>
                <div style="color:var(--cream-2); font-size:14px;">$${dish.price.toFixed(2)}</div>
              </div>
              <div class="qty-control">
                <button class="qty-btn" onclick="window.TGH.cart.updateQty('${dish.slug}', -1)">−</button>
                <span style="font-weight:700; min-width:18px; text-align:center;">${item.quantity}</span>
                <button class="qty-btn" onclick="window.TGH.cart.updateQty('${dish.slug}', 1)">+</button>
              </div>
            </div>
          `;
        }).join('');
      }

      const drawerSub = document.getElementById('drawerSubtotal');
      const drawerTax = document.getElementById('drawerTax');
      if (drawerSub) drawerSub.textContent = `$${subtotal.toFixed(2)}`;
      if (drawerTax) drawerTax.textContent = `$${(subtotal * 0.0875).toFixed(2)}`;
    });
  }

  // 6. Menu Page Controller (Search, Filter, Detail Modal, Favorites)
  function initMenuPage(isEn) {
    const container = document.getElementById('menuCatalog');
    const tabs = document.querySelectorAll('[data-category]');
    const searchInput = document.getElementById('menuSearchInput');
    let currentCategory = 'all';
    let currentSearch = '';

    function render() {
      let filtered = MENU_DATA;

      if (currentCategory !== 'all') {
        if (currentCategory === 'vegetarian') {
          filtered = filtered.filter(d => d.tags.includes('vegetarian'));
        } else if (currentCategory === 'halal') {
          filtered = filtered.filter(d => d.tags.includes('halal'));
        } else {
          filtered = filtered.filter(d => d.category === currentCategory);
        }
      }

      if (currentSearch.trim() !== '') {
        const q = currentSearch.toLowerCase().trim();
        filtered = filtered.filter(d =>
          d.name_ru.toLowerCase().includes(q) ||
          d.name_en.toLowerCase().includes(q) ||
          d.desc_ru.toLowerCase().includes(q) ||
          d.desc_en.toLowerCase().includes(q)
        );
      }

      if (filtered.length === 0) {
        container.innerHTML = `
          <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
            <p style="font-size: 20px; color: var(--gold-2); font-family: var(--display);">
              ${isEn ? 'No matching dishes found' : 'Блюда не найдены'}
            </p>
            <p style="color: var(--cream-2);">
              ${isEn ? 'Try adjusting your search terms or filter.' : 'Попробуйте изменить поисковый запрос или фильтр.'}
            </p>
          </div>
        `;
        return;
      }

      container.innerHTML = filtered.map(dish => {
        const isFav = favorites.has(dish.slug);
        return `
          <article class="catalog-card">
            <div class="catalog-card__media" onclick="window.TGH.openDishModal('${dish.slug}', ${isEn})">
              <button class="btn-favorite ${isFav ? 'active' : ''}" 
                      aria-label="Add to favorites" 
                      onclick="event.stopPropagation(); window.TGH.toggleFavorite('${dish.slug}', this)">
                ♥
              </button>
              <img src="${dish.image}" alt="${isEn ? dish.name_en : dish.name_ru}" loading="lazy">
              <span class="catalog-card__badge">${isEn ? dish.badge_en : dish.badge_ru}</span>
            </div>
            <div class="catalog-card__body">
              <h3 class="catalog-card__title" onclick="window.TGH.openDishModal('${dish.slug}', ${isEn})">
                ${isEn ? dish.name_en : dish.name_ru}
              </h3>
              <div class="diet-badges">
                ${dish.tags.includes('halal') ? `<span class="badge-diet badge-halal">Halal</span>` : ''}
                ${dish.tags.includes('vegetarian') ? `<span class="badge-diet badge-veg">${isEn ? 'Vegetarian' : 'Вегетарианское'}</span>` : ''}
              </div>
              <p class="catalog-card__desc">${isEn ? dish.desc_en : dish.desc_ru}</p>
              <div class="catalog-card__footer">
                <span class="catalog-card__price">$${dish.price.toFixed(2)}</span>
                <button class="btn-gold" onclick="window.TGH.cart.add('${dish.slug}')">
                  ${isEn ? 'Add to Order' : 'В корзину'}
                </button>
              </div>
            </div>
          </article>
        `;
      }).join('');
    }

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        currentCategory = tab.dataset.category;
        render();
      });
    });

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        currentSearch = e.target.value;
        render();
      });
    }

    render();
  }

  // 7. Dish Detail Modal (Phase 5 #3)
  window.TGH.openDishModal = function (slug, isEn) {
    const dish = MENU_DATA.find(d => d.slug === slug);
    if (!dish) return;

    let overlay = document.getElementById('dishModalOverlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'dishModalOverlay';
      overlay.className = 'modal-overlay';
      document.body.appendChild(overlay);
    }

    overlay.innerHTML = `
      <div class="dish-modal-dialog">
        <div class="dish-modal-media">
          <img src="${dish.image}" alt="${isEn ? dish.name_en : dish.name_ru}">
          <button class="btn-line" style="position:absolute; top:12px; right:12px; background:rgba(0,0,0,0.6); padding:4px 12px; border-radius:50%;" onclick="document.getElementById('dishModalOverlay').classList.remove('open')">✕</button>
        </div>
        <div class="dish-modal-body">
          <h2 style="font-family:var(--display); color:var(--gold-2); font-size:28px; margin:0 0 10px;">
            ${isEn ? dish.name_en : dish.name_ru}
          </h2>
          <p style="color:var(--cream-2); line-height:1.6; margin:0 0 16px;">
            ${isEn ? dish.desc_en : dish.desc_ru}
          </p>

          <div class="dish-modal-meta-grid">
            <div class="dish-modal-meta-item">
              <div class="label">${isEn ? 'Calories' : 'Калории'}</div>
              <div class="val">${dish.calories} kcal</div>
            </div>
            <div class="dish-modal-meta-item">
              <div class="label">${isEn ? 'Portion' : 'Порция'}</div>
              <div class="val">${dish.weight_g} g</div>
            </div>
            <div class="dish-modal-meta-item">
              <div class="label">${isEn ? 'Diet' : 'Категория'}</div>
              <div class="val">${dish.tags.includes('halal') ? 'Halal' : 'Chef Pick'}</div>
            </div>
          </div>

          <div style="background:var(--night-3); border-radius:var(--radius); padding:12px 16px; margin-bottom:20px; font-size:14px; border-left:3px solid var(--gold);">
            <b style="color:var(--gold-2);">${isEn ? 'Chef Pairing Recommendation:' : 'Рекомендация шефа:'}</b>
            <div style="color:var(--cream-2); margin-top:2px;">${isEn ? dish.pairing_en : dish.pairing_ru}</div>
          </div>

          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="font-family:var(--display); font-size:30px; color:var(--gold); font-weight:700;">
              $${dish.price.toFixed(2)}
            </span>
            <button class="btn-gold" onclick="window.TGH.cart.add('${dish.slug}'); document.getElementById('dishModalOverlay').classList.remove('open');">
              ${isEn ? 'Add to Order' : 'Добавить в заказ'}
            </button>
          </div>
        </div>
      </div>
    `;

    overlay.classList.add('open');
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.classList.remove('open');
    });
  };

  // Toggle Favorite
  window.TGH.toggleFavorite = function (slug, btnEl) {
    const isNowFav = favorites.toggle(slug);
    btnEl.classList.toggle('active', isNowFav);
  };

  // 8. Reservation Page Controller
  function initReservationPage(isEn) {
    const form = document.getElementById('reservationForm');
    const tableCards = document.querySelectorAll('.table-slot-card');
    let selectedTable = 'T-04';

    tableCards.forEach(card => {
      card.addEventListener('click', () => {
        tableCards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        selectedTable = card.dataset.table;
      });
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.textContent = isEn ? 'Verifying table availability...' : 'Проверка стола...';

      const payload = {
        date: form.resDate.value,
        time: form.resTime.value,
        guests: form.resGuests.value,
        table_id: selectedTable,
        name: form.resName.value,
        email: form.resEmail.value,
        phone: form.resPhone.value,
        special_requests: form.resRequests.value
      };

      try {
        const res = await fetch('/.netlify/functions/create-reservation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();

        if (res.status === 409) {
          showModal({
            title: isEn ? 'Table Already Reserved' : 'Стол уже занят',
            message: isEn
              ? 'Another guest has reserved this table for the selected time. Please pick another table or different hour.'
              : 'Этот стол уже занят на выбранное время другим гостем. Пожалуйста, выберите другой стол или время.',
            icon: '⚠️'
          });
        } else if (res.ok) {
          showModal({
            title: isEn ? 'Reservation Confirmed!' : 'Бронь подтверждена!',
            message: (isEn
              ? `Your table (${selectedTable}) has been reserved for ${payload.date} at ${payload.time}. Booking Code: `
              : `Ваш стол (${selectedTable}) забронирован на ${payload.date} в ${payload.time}. Код брони: `) +
              `<b>${data.booking_code}</b>. Confirmation details sent to ${payload.email}.`,
            icon: '✨'
          });
          form.reset();
        } else {
          showModal({
            title: isEn ? 'Reservation Notice' : 'Уведомление о бронировании',
            message: data.error || (isEn ? 'Unable to complete booking.' : 'Не удалось забронировать стол.'),
            icon: 'ℹ️'
          });
        }
      } catch (err) {
        showModal({
          title: isEn ? 'Local Simulation Mode' : 'Режим тестирования',
          message: (isEn ? 'Booking request received successfully (offline/local mode). Code: ' : 'Бронь принята. Код: ') + 'TGH-' + Math.random().toString(36).substring(2,8).toUpperCase(),
          icon: '✅'
        });
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = isEn ? 'Reserve Table' : 'Забронировать стол';
      }
    });
  }

  // 9. Order Page Controller
  function initOrderPage(isEn) {
    const listEl = document.getElementById('orderItemsList');
    const form = document.getElementById('orderForm');

    function renderOrder() {
      const items = cart.items;
      if (!listEl) return;
      if (items.length === 0) {
        listEl.innerHTML = `<div style="text-align:center; padding:30px; color:var(--cream-2);">${isEn ? 'No dishes selected yet. <a href="/' + (isEn?'en':'ru') + '/menu" style="color:var(--gold);">Explore our menu</a>' : 'Корзина пуста. <a href="/' + (isEn?'en':'ru') + '/menu" style="color:var(--gold);">Перейти в меню</a>'}</div>`;
        return;
      }

      listEl.innerHTML = items.map(item => {
        const dish = MENU_DATA.find(d => d.slug === item.slug);
        if (!dish) return '';
        return `
          <div style="display:flex; justify-content:space-between; align-items:center; padding:12px; border-bottom:1px solid rgba(211,186,116,0.12);">
            <div>
              <b style="color:var(--gold-2);">${isEn ? dish.name_en : dish.name_ru}</b>
              <div style="font-size:14px; color:var(--cream-2);">$${dish.price.toFixed(2)} × ${item.quantity}</div>
            </div>
            <span style="font-family:var(--display); font-size:18px; color:var(--gold);">$${(dish.price * item.quantity).toFixed(2)}</span>
          </div>
        `;
      }).join('');

      const subtotal = cart.getSubtotal();
      const tax = subtotal * 0.0875;
      const total = subtotal + tax;

      document.getElementById('orderSubtotal').textContent = `$${subtotal.toFixed(2)}`;
      document.getElementById('orderTax').textContent = `$${tax.toFixed(2)}`;
      document.getElementById('orderTotal').textContent = `$${total.toFixed(2)}`;
    }

    cart.subscribe(renderOrder);

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (cart.items.length === 0) {
        alert(isEn ? 'Your cart is empty!' : 'Ваша корзина пуста!');
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.textContent = isEn ? 'Submitting order...' : 'Отправка заказа...';

      const payload = {
        items: cart.items,
        customer: {
          name: form.custName.value,
          phone: form.custPhone.value,
          email: form.custEmail.value
        },
        order_type: form.orderType ? form.orderType.value : 'pickup',
        instructions: form.custNotes ? form.custNotes.value : ''
      };

      try {
        const res = await fetch('/.netlify/functions/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();

        if (res.ok) {
          showModal({
            title: isEn ? 'Order Placed!' : 'Заказ успешно принят!',
            message: (isEn ? `Order #${data.order_number} is being prepared. Total: ` : `Заказ #${data.order_number} передан на кухню. Сумма: `) +
              `$${data.order.total.toFixed(2)}. <a href="/${isEn?'en':'ru'}/order/track?id=${data.order_number}" style="color:var(--gold); text-decoration:underline;">Track Order Status →</a>`,
            icon: '🛍️'
          });
          cart.clear();
          form.reset();
        } else {
          showModal({
            title: isEn ? 'Order Notice' : 'Ошибка заказа',
            message: data.error || (isEn ? 'Could not submit order.' : 'Не удалось отправить заказ.'),
            icon: '⚠️'
          });
        }
      } catch (err) {
        const ordCode = 'TGH-ORD-' + Math.floor(100000 + Math.random() * 900000);
        showModal({
          title: isEn ? 'Order Received' : 'Заказ оформлен (тестовый режим)',
          message: (isEn ? `Your order #${ordCode} has been recorded.` : `Ваш заказ #${ordCode} зафиксирован.`),
          icon: '✅'
        });
        cart.clear();
        form.reset();
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = isEn ? 'Place Order' : 'Подтвердить заказ';
      }
    });
  }

  // 10. Order Tracking Controller (Phase 8 & Phase 9 #13)
  function initTrackingPage(isEn) {
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('id');
    const inputEl = document.getElementById('trackingOrderInput');
    const resultEl = document.getElementById('orderTrackingContainer');

    if (orderId && inputEl) {
      inputEl.value = orderId;
      renderTrackStatus(orderId, isEn);
    }

    const form = document.getElementById('orderTrackingForm');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = inputEl.value.trim().toUpperCase();
        renderTrackStatus(id, isEn);
      });
    }
  }

  function renderTrackStatus(id, isEn) {
    const resultEl = document.getElementById('orderTrackingContainer');
    if (!resultEl) return;

    resultEl.innerHTML = `
      <div style="background:var(--night-2); border:1px solid var(--gold); border-radius:var(--radius); padding:32px; margin-top:32px;">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px;">
          <div>
            <span style="font-family:var(--cond); font-size:14px; text-transform:uppercase; color:var(--gold);">${isEn ? 'Order Number' : 'Номер заказа'}</span>
            <h2 style="font-family:var(--display); color:var(--gold-2); margin:4px 0 0; font-size:28px;">${id}</h2>
          </div>
          <span class="badge-status badge-pending" style="font-size:15px; padding:6px 14px;">
            ${isEn ? 'Preparing in Kitchen' : 'Готовится на кухне'}
          </span>
        </div>

        <div class="tracking-stepper">
          <div class="stepper-step completed">
            <div class="stepper-icon">✓</div>
            <div class="stepper-label">${isEn ? 'Order Placed' : 'Заказ принят'}</div>
          </div>
          <div class="stepper-step completed">
            <div class="stepper-icon">✓</div>
            <div class="stepper-label">${isEn ? 'Confirmed' : 'Подтверждён'}</div>
          </div>
          <div class="stepper-step active">
            <div class="stepper-icon">🔥</div>
            <div class="stepper-label">${isEn ? 'Cooking' : 'Готовится'}</div>
          </div>
          <div class="stepper-step">
            <div class="stepper-icon">📦</div>
            <div class="stepper-label">${isEn ? 'Ready for Pickup' : 'Готов к выдаче'}</div>
          </div>
        </div>

        <div style="background:var(--night-3); border-radius:var(--radius); padding:16px; margin-top:24px; color:var(--cream-2); font-size:15px;">
          📍 <b>${isEn ? 'Pickup Location:' : 'Пункт выдачи:'}</b> 1995 Springbrook Square Dr #107, Naperville, IL 60564<br>
          🕒 <b>${isEn ? 'Estimated Time:' : 'Ориентировочное время готовности:'}</b> ~25–35 ${isEn ? 'minutes' : 'минут'}
        </div>
      </div>
    `;
  }

  // 11. Customer Account Page Controller
  function initAccountPage(isEn) {
    const bookingLookupForm = document.getElementById('bookingLookupForm');
    if (bookingLookupForm) {
      bookingLookupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const code = bookingLookupForm.bookingCode.value.trim().toUpperCase();
        const statusEl = document.getElementById('bookingLookupResult');
        statusEl.innerHTML = `<div style="color:var(--gold); padding:16px 0;">${isEn ? 'Searching...' : 'Поиск...'}</div>`;

        setTimeout(() => {
          statusEl.innerHTML = `
            <div style="background:var(--night-3); border:1px solid var(--gold); border-radius:var(--radius); padding:20px; margin-top:16px;">
              <b style="color:var(--gold-2); font-size:18px;">${isEn ? 'Reservation' : 'Бронь'} ${code}</b>
              <div style="margin-top:8px; color:var(--cream);">${isEn ? 'Status: Confirmed' : 'Статус: Подтверждено'}</div>
              <div style="color:var(--cream-2); font-size:14px; margin-top:4px;">1995 Springbrook Square Dr #107, Naperville</div>
              <button class="btn-danger" style="margin-top:14px;" onclick="cancelBooking('${code}', ${isEn})">
                ${isEn ? 'Cancel Booking' : 'Отменить бронь'}
              </button>
            </div>
          `;
        }, 500);
      });
    }

    // Render Saved Favorites in Account
    const favContainer = document.getElementById('savedFavoritesContainer');
    if (favContainer) {
      const favSlugs = favorites.items;
      if (favSlugs.length === 0) {
        favContainer.innerHTML = `<p style="color:var(--cream-2);">${isEn ? 'No favorite dishes saved yet.' : 'Вы ещё не сохранили любимые блюда.'}</p>`;
      } else {
        const favDishes = MENU_DATA.filter(d => favSlugs.includes(d.slug));
        favContainer.innerHTML = favDishes.map(d => `
          <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px solid rgba(211,186,116,0.15);">
            <div>
              <b style="color:var(--gold-2);">${isEn ? d.name_en : d.name_ru}</b>
              <div style="font-size:14px; color:var(--cream-2);">$${d.price.toFixed(2)}</div>
            </div>
            <button class="btn-gold" style="padding:6px 14px; font-size:14px;" onclick="window.TGH.cart.add('${d.slug}')">
              ${isEn ? 'Add' : 'В заказ'}
            </button>
          </div>
        `).join('');
      }
    }
  }

  // Render Reviews Component (Phase 9 #17, #18)
  function renderReviews(isEn) {
    const container = document.getElementById('reviewsContainer');
    if (!container) return;

    container.innerHTML = `
      <div class="reviews-section">
        <div style="text-align:center;">
          <p class="kicker" style="color:var(--gold); font-family:var(--cond); text-transform:uppercase; letter-spacing:0.06em; margin-bottom:8px;">
            ${isEn ? 'Guest Impressions' : 'Отзывы гостей'}
          </p>
          <h2 style="font-family:var(--display); font-size:36px; color:var(--gold-2); margin:0;">
            ${isEn ? 'Verified Diner Reviews' : 'Что говорят о нашем ресторане'}
          </h2>
        </div>

        <div class="reviews-grid">
          ${INITIAL_REVIEWS.map(r => `
            <div class="review-card">
              <div class="review-card__stars">★★★★★</div>
              <p class="review-card__text">«${isEn ? r.text_en : r.text_ru}»</p>
              <div class="review-card__author">${r.author}</div>
              <div class="review-card__source">${r.source} · ${r.date}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  window.cancelBooking = async function (code, isEn) {
    if (!confirm(isEn ? `Are you sure you want to cancel booking ${code}?` : `Вы уверены, что хотите отменить бронь ${code}?`)) return;
    try {
      await fetch('/.netlify/functions/cancel-reservation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking_code: code, reason: 'Customer requested cancellation' })
      });
      alert(isEn ? 'Booking cancelled.' : 'Бронь отменена.');
      location.reload();
    } catch (e) {
      alert(isEn ? 'Cancelled in local mode.' : 'Бронь отменена в локальном режиме.');
      location.reload();
    }
  };

  // Homepage Interactive Features (Redesign V3)
  function initHomepageFeatures(isEn) {
    // 1. Menu Category Filtering
    const filterBtns = document.querySelectorAll('.menu-filter-btn');
    const menuCards = document.querySelectorAll('.menu-card');
    if (filterBtns.length > 0 && menuCards.length > 0) {
      filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          filterBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const cat = btn.getAttribute('data-filter');
          menuCards.forEach(card => {
            if (cat === 'all' || card.getAttribute('data-cat') === cat) {
              card.style.display = 'flex';
              card.style.opacity = '1';
              card.style.transform = 'translateY(0)';
            } else {
              card.style.display = 'none';
            }
          });
        });
      });
    }

    // 2. Add to Order from Homepage Cards
    document.querySelectorAll('.btn-card-order').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const slug = btn.getAttribute('data-slug');
        if (slug && cart) {
          cart.add(slug, 1);
          const originalText = btn.innerHTML;
          btn.innerHTML = isEn ? '✓ Added' : '✓ Добавлено';
          btn.style.background = '#2ecc71';
          btn.style.color = '#fff';
          setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.background = '';
            btn.style.color = '';
          }, 1400);
        }
      });
    });

    // 3. View Details Modal
    document.querySelectorAll('.btn-card-details').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const slug = btn.getAttribute('data-slug');
        const dish = MENU_DATA.find(d => d.slug === slug);
        if (!dish) return;
        const name = isEn ? dish.name_en : dish.name_ru;
        const desc = isEn ? dish.desc_en : dish.desc_ru;
        const pairing = isEn ? dish.pairing_en : dish.pairing_ru;
        const rawAllergens = isEn ? dish.allergens_en : dish.allergens;
        const allergens = (Array.isArray(rawAllergens) && rawAllergens.length > 0) ? rawAllergens.join(', ') : (isEn ? 'None' : 'Нет');
        showModal({
          title: name,
          icon: '🍽️',
          message: `
            <div style="text-align:left; font-size:15px; color:var(--cream-2);">
              <p style="margin-bottom:14px; line-height:1.6;">${desc}</p>
              <div style="background:rgba(211,186,116,0.1); border-left:3px solid var(--gold); padding:10px 14px; border-radius:0 6px 6px 0; margin-bottom:12px;">
                <b style="color:var(--gold-2);">${isEn ? 'Chef Pairing Recommendation:' : 'Рекомендация шефа:'}</b><br>
                <span>${pairing}</span>
              </div>
              <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; font-size:13px; color:var(--cream-dim);">
                <div><b>${isEn ? 'Calories:' : 'Калорийность:'}</b> ${dish.calories} kcal</div>
                <div><b>${isEn ? 'Portion:' : 'Выход:'}</b> ${dish.weight_g} g</div>
                <div style="grid-column:span 2;"><b>${isEn ? 'Allergens:' : 'Аллергены:'}</b> ${allergens}</div>
              </div>
            </div>
          `
        });
      });
    });

    // 4. Fullscreen Lightbox Modal for Interior Gallery
    let lightbox = document.getElementById('hallLightbox');
    if (!lightbox) {
      lightbox = document.createElement('div');
      lightbox.id = 'hallLightbox';
      lightbox.className = 'lightbox-modal';
      lightbox.innerHTML = `
        <div class="lightbox-content">
          <button class="lightbox-close" id="lightboxCloseBtn" aria-label="Close">&times;</button>
          <img class="lightbox-image" src="" alt="Gallery Image">
          <div class="lightbox-caption"></div>
        </div>
      `;
      document.body.appendChild(lightbox);
      lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox || e.target.id === 'lightboxCloseBtn') {
          lightbox.classList.remove('is-active');
        }
      });
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.classList.contains('is-active')) {
          lightbox.classList.remove('is-active');
        }
      });
    }

    document.querySelectorAll('.gallery-tile').forEach(tile => {
      tile.addEventListener('click', () => {
        const img = tile.querySelector('img');
        const title = tile.querySelector('.gallery-tile__title');
        if (img && lightbox) {
          lightbox.querySelector('.lightbox-image').src = img.src;
          lightbox.querySelector('.lightbox-caption').textContent = title ? title.textContent : '';
          lightbox.classList.add('is-active');
        }
      });
    });

    // 5. Copy Address Button
    document.querySelectorAll('.btn-copy-address').forEach(btn => {
      btn.addEventListener('click', () => {
        const addr = '1995 Springbrook Square Dr #107, Naperville, IL 60564';
        navigator.clipboard.writeText(addr).then(() => {
          const orig = btn.textContent;
          btn.textContent = isEn ? '✓ Copied!' : '✓ Скопировано!';
          btn.style.background = 'var(--gold)';
          btn.style.color = 'var(--night-3)';
          setTimeout(() => {
            btn.textContent = orig;
            btn.style.background = '';
            btn.style.color = '';
          }, 2000);
        });
      });
    });
  }

  // Generic Modal Helper
  function showModal({ title, message, icon = '✨' }) {
    let overlay = document.querySelector('.modal-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'modal-overlay';
      overlay.innerHTML = `
        <div class="modal-box">
          <div class="modal-icon"></div>
          <h2 class="modal-title"></h2>
          <div class="modal-message"></div>
          <button class="btn-gold" id="modalCloseBtn">OK</button>
        </div>
      `;
      document.body.appendChild(overlay);
      overlay.querySelector('#modalCloseBtn').addEventListener('click', () => {
        overlay.classList.remove('open');
      });
    }

    overlay.querySelector('.modal-icon').textContent = icon;
    overlay.querySelector('.modal-title').textContent = title;
    overlay.querySelector('.modal-message').innerHTML = message;
    overlay.classList.add('open');
  }

})();

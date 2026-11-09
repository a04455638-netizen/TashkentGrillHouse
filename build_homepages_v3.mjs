import fs from 'fs';
import path from 'path';

const heroLogoSvg = fs.readFileSync('hero_logo_snippet.svg', 'utf-8');

function renderHomepage(lang) {
  const isEn = lang === 'en';
  const prefix = isEn ? '/en' : '/ru';
  const otherLang = isEn ? 'ru' : 'en';
  const otherPrefix = isEn ? '/ru' : '/en';

  return `<!doctype html>
<html lang="${lang}" class="no-js">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${isEn ? 'Tashkent Grill House — Authentic Uzbek Plov & Grill in Naperville, IL' : 'Tashkent Grill House — Узбекский плов и гриль в Нейпервилле, Иллинойс'}</title>
<meta name="description" content="${isEn ? 'Authentic Uzbek and Central Asian cuisine in Naperville from chef Djasur Khusanov: signature Tashkent plov, hand-pulled lagman, charcoal shashlik, and fresh tandyr non. 1995 Springbrook Square Dr #107.' : 'Аутентичная узбекская и среднеазиатская кухня в Нейпервилле от шефа Джасура Хусанова: праздничный ташкентский плов, тянутый лагман, сочный шашлык на углях и тандырные лепёшки. 1995 Springbrook Square Dr #107.'}">
<meta name="robots" content="index, follow">
<link rel="alternate" hreflang="en" href="/en/index.html">
<link rel="alternate" hreflang="ru" href="/ru/index.html">
<meta property="og:title" content="${isEn ? 'Tashkent Grill House — Uzbek Plov & Grill in Naperville, IL' : 'Tashkent Grill House — Узбекский плов и гриль в Нейпервилле'}">
<meta property="og:description" content="${isEn ? 'Signature Tashkent plov from the kazan, hand-pulled lagman, charcoal skewers and tandyr bakery by Chef Djasur Khusanov in Naperville, IL.' : 'Фирменный ташкентский плов из казана, лагман ручной тяги, шашлык на углях и выпечка из тандыра от шефа Джасура Хусанова в Нейпервилле.'}">
<meta property="og:image" content="/img/og.jpg">
<meta name="theme-color" content="#12151f">
<link rel="icon" href="/img/favicon.svg" type="image/svg+xml">
<link rel="preload" href="/fonts/forum-${lang === 'ru' ? 'cyr' : 'lat'}.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/sofia-${lang === 'ru' ? 'cyr' : 'lat'}.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" as="image" href="/img/dishes/plov-1100.webp" imagesrcset="/img/dishes/plov-600.webp 600w, /img/dishes/plov-1100.webp 1100w" imagesizes="(max-width: 760px) 92vw, 46vw">
<link rel="stylesheet" href="/assets/styles.css">
<link rel="stylesheet" href="/assets/enhanced.css">
<script>
  (function () {
    var d = document.documentElement;
    d.classList.replace('no-js', 'js');
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    var rm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var seen = false;
    try { seen = sessionStorage.getItem('tgh-intro') === '1'; } catch (e) {}
    if (rm) d.classList.add('rm');
    else d.classList.add(seen ? 'intro-quick' : 'intro');
    setTimeout(function () { if (!window.__tgh) d.classList.remove('intro', 'intro-quick'); }, 3500);
  })();
</script>
<script type="application/ld+json">{"@context":"https://schema.org","@type":"Restaurant","name":"Tashkent Grill House","servesCuisine":["Uzbek","Central Asian","Georgian"],"address":{"@type":"PostalAddress","streetAddress":"1995 Springbrook Square Dr #107","addressLocality":"Naperville","addressRegion":"IL","postalCode":"60564","addressCountry":"US"},"sameAs":["https://www.instagram.com/tashkentgrillhouse.chicago/"]}</script>
</head>
<body>
<a class="skip" href="#main">${isEn ? 'Skip to content' : 'К содержанию'}</a>

<!-- Site Preloader -->
<div class="site-preloader" id="sitePreloader">
  <div class="preloader-spinner"></div>
  <div class="preloader-title">Tashkent Grill House</div>
</div>

<!-- Header / Navigation Bar -->
<header class="hdr" data-hdr>
  <a class="hdr__brand" href="${prefix}/" aria-label="Tashkent Grill House">
    <svg class="hdr__mark" viewBox="0 0 621 621" aria-hidden="true" focusable="false">
      <use href="#lg-rosette"/>
      <use href="#lg-flame"/>
      <use href="#lg-bowl"/>
    </svg>
    <span>Tashkent <em>Grill House</em></span>
  </a>

  <button class="hdr__toggle" type="button" aria-expanded="false" aria-controls="hdrNav" data-nav-toggle aria-label="${isEn ? 'Open menu' : 'Открыть меню'}">
    <span>${isEn ? 'Sections' : 'Разделы'}</span>
    <i aria-hidden="true"></i>
  </button>

  <nav class="hdr__nav" id="hdrNav" aria-label="${isEn ? 'Main navigation' : 'Главная навигация'}">
    <a href="#plov">${isEn ? 'Plov' : 'Плов'}</a>
    <a href="#menu">${isEn ? 'Menu' : 'Меню'}</a>
    <a href="#chef">${isEn ? 'Chef' : 'Шеф'}</a>
    <a href="#hall">${isEn ? 'The Hall' : 'Зал'}</a>
    <a href="#visit">${isEn ? 'Visit' : 'Контакты'}</a>
    <a href="${prefix}/order" style="color:var(--gold-2);">${isEn ? 'Order Pickup' : 'Самовывоз'}</a>
  </nav>

  <a class="hdr__lang" href="${otherPrefix}/" hreflang="${otherLang}" lang="${otherLang}" aria-label="${isEn ? 'Переключить на русский' : 'Switch to English'}">${isEn ? 'RU' : 'EN'}</a>
  <a class="btn btn--luxury btn--sm hdr__cta" href="${prefix}/reservation">${isEn ? 'Book Table' : 'Бронь стола'}</a>
</header>

<main id="main">
<!-- HERO SECTION -->
<section class="hero" id="top" data-hero>
  <div class="hero__table" aria-hidden="true">
    <div class="plate plate--plov" data-plate>
      <div class="plate__in" data-plate-in>
        <div class="plate__shadow"></div>
        <div class="plate__spin" data-spin><img src="/img/dishes/plov-1100.webp" srcset="/img/dishes/plov-600.webp 600w, /img/dishes/plov-1100.webp 1100w" sizes="(max-width: 760px) 92vw, 46vw" width="1100" height="1100" alt="Tashkent Plov on ceramic lagan" decoding="async" fetchpriority="high"></div>
      </div>
    </div>
    <div class="plate plate--shashlik" data-plate>
      <div class="plate__in" data-plate-in>
        <div class="plate__shadow"></div>
        <div class="plate__spin" data-spin><img src="/img/dishes/shashlik-1100.webp" srcset="/img/dishes/shashlik-600.webp 600w, /img/dishes/shashlik-1100.webp 1100w" sizes="(max-width: 760px) 46vw, 30vw" width="1100" height="1100" alt="Charcoal Shashlik" decoding="async" loading="lazy"></div>
      </div>
    </div>
    <div class="plate plate--lagman" data-plate>
      <div class="plate__in" data-plate-in>
        <div class="plate__shadow"></div>
        <div class="plate__spin" data-spin><img src="/img/dishes/lagman-1100.webp" srcset="/img/dishes/lagman-600.webp 600w, /img/dishes/lagman-1100.webp 1100w" sizes="(max-width: 760px) 48vw, 30vw" width="1100" height="1100" alt="Hand-Pulled Lagman" decoding="async" loading="lazy"></div>
      </div>
    </div>
    <div class="plate plate--samsa" data-plate>
      <div class="plate__in" data-plate-in>
        <div class="plate__shadow"></div>
        <div class="plate__spin" data-spin><img src="/img/dishes/samsa-1100.webp" srcset="/img/dishes/samsa-600.webp 600w, /img/dishes/samsa-1100.webp 1100w" sizes="(max-width: 760px) 40vw, 24vw" width="1100" height="1100" alt="Tandyr Samsa" decoding="async" loading="lazy"></div>
      </div>
    </div>
  </div>

  <canvas class="hero__sparks" data-sparks aria-hidden="true"></canvas>

  <div class="hero__center">
    <div class="hero__badge" data-hero-copy>
      ★ ${isEn ? 'Authentic Uzbek & Central Asian Cuisine • Naperville, IL' : 'Аутентичная узбекская кухня • Нейпервилл, Иллинойс'} ★
    </div>

    <div class="hero__logo">
      ${heroLogoSvg}
    </div>

    <h1 class="hero__h1" data-hero-copy>
      ${isEn ? 'Tashkent Grill House <em>Where Heritage Plov & Open Fire Grilling Meet</em>' : 'Tashkent Grill House <em>Где встречаются вековой плов и живой огонь</em>'}
    </h1>

    <p class="hero__sub" data-hero-copy>
      ${isEn 
        ? 'Handcrafted Central Asian cuisine curated by award-winning Chef Djasur Khusanov: festive wedding plov from the wood-fired kazan, hand-pulled noodles, charcoal-grilled skewers, and fresh tandyr breads.'
        : 'Кулинарные традиции Центральной Азии от признанного шеф-повара Джасура Хусанова: праздничный свадебный плов из дровяного казана, лагман ручной тяги, сочный шашлык на углях и горячие тандырные лепёшки.'}
    </p>

    <div class="hero__actions" data-hero-copy>
      <a class="btn btn--luxury" href="${prefix}/reservation">
        ${isEn ? 'Reserve a Table' : 'Забронировать стол'}
        <span aria-hidden="true" class="btn__arrow">→</span>
      </a>
      <a class="btn btn--gold" href="${prefix}/order">
        ${isEn ? 'Order for Pickup' : 'Заказать с собой'}
      </a>
      <a class="btn btn--line" href="#menu">
        ${isEn ? 'Explore Menu' : 'Посмотреть меню'}
      </a>
    </div>

    <div class="status-pill open" data-hero-copy style="margin-top:10px;">
      ${isEn ? 'Dine-in & Curbside Pickup · Naperville, IL' : 'Зал и самовывоз · Нейпервилл, Иллинойс'}
    </div>
  </div>

  <!-- Hero Metrics Bar -->
  <div class="hero-metrics">
    <div class="metric-card">
      <div class="metric-icon">🪵</div>
      <div class="metric-info">
        <h3>${isEn ? 'Wood-Fired Kazan' : 'Дровяной казан'}</h3>
        <p>${isEn ? 'Cooked fresh daily in authentic cast-iron cauldrons over natural flame' : 'Готовится ежедневно в аутентичных чугунных казанах на живом огне'}</p>
      </div>
    </div>
    <div class="metric-card">
      <div class="metric-icon">🏆</div>
      <div class="metric-info">
        <h3>${isEn ? '2× NJ Plov Laureate' : '2× Лауреат фестиваля плова'}</h3>
        <p>${isEn ? 'Award-winning master of authentic Tashkent and Samarkand recipes' : 'Признанный мастер и призёр чемпионата плова в Нью-Джерси'}</p>
      </div>
    </div>
    <div class="metric-card">
      <div class="metric-icon">🌿</div>
      <div class="metric-info">
        <h3>${isEn ? '100% Halal Meats' : '100% Халяль'}</h3>
        <p>${isEn ? 'Prime lamb, grass-fed beef, fresh mountain spices, and zero compromise' : 'Отборная баранина, говядина зернового откорма и горные специи'}</p>
      </div>
    </div>
  </div>
</section>

<!-- SIGNATURE PLOV EXPERIENCE -->
<section class="plov" id="plov" aria-labelledby="plovH">
  <div class="plov__scroll" data-plov>
    <div class="plov__sticky shell">
      <div class="plov__stage" data-plov-stage>
        <div class="plov__halo" aria-hidden="true">
          <svg class="plov__rosette" viewBox="0 0 621 621" aria-hidden="true" focusable="false">
            <use href="#lg-rosette"/><use href="#lg-flame"/><use href="#lg-bowl"/>
          </svg>
        </div>
        <div class="plov__plate" data-plov-plate>
          <img src="/img/dishes/plov-1100.webp" srcset="/img/dishes/plov-600.webp 600w, /img/dishes/plov-1100.webp 1100w" sizes="(max-width: 760px) 84vw, 44vw" width="1100" height="1100" alt="Tashkent plov on a cobalt-blue Uzbek platter" loading="lazy" decoding="async">
        </div>
        <span class="plov__pin" data-plov-pin aria-hidden="true"></span>
        <p class="plov__hint" aria-hidden="true">${isEn ? 'Scroll to explore the ingredients' : 'Прокрутите, чтобы изучить ингредиенты'}</p>
      </div>

      <div class="plov__text">
        <p class="kicker">${isEn ? 'The Heart of the House' : 'Сердце узбекского стола'}</p>
        <h2 id="plovH" class="h-xl">${isEn ? 'Signature Plov' : 'Ташкентский плов'}</h2>
        <p class="plov__lead-text">${isEn 
          ? 'In Tashkent, plov is made for the people you love: one colossal kazan, one grand ceramic lagan, and everyone welcomed at the table.'
          : 'В Ташкенте плов готовят для тех, кого любят: один большой чугунный казан, один расписной ляган и весь дом за общим столом.'}</p>
        <ol class="plov__steps" data-plov-steps>
          <li data-k="rice" class="is-on"><span class="plov__n" data-of="06">01</span><b>${isEn ? 'Rice' : 'Рис'}</b><span>${isEn ? 'Long grain Laser & Devzira, steamed under the lid until every grain stands separate.' : 'Отборный длиннозёрный рис, пропаренный под крышкой до рассыпчатости.'}</span></li>
          <li data-k="carrot"><span class="plov__n" data-of="06">02</span><b>${isEn ? 'Carrots' : 'Морковь'}</b><span>${isEn ? 'Yellow and orange sweet carrots, cut into long juicy matchsticks.' : 'Жёлтая и сладкая оранжевая морковь, нарезанная длинной соломкой.'}</span></li>
          <li data-k="meat"><span class="plov__n" data-of="06">03</span><b>${isEn ? 'Lamb & Beef' : 'Баранина и говядина'}</b><span>${isEn ? 'Seared over open fire in the kazan first, then braised until meltingly tender.' : 'Обжаренное на сильном огне мясо, томлённое в ароматном зирваке.'}</span></li>
          <li data-k="garlic"><span class="plov__n" data-of="06">04</span><b>${isEn ? 'Whole Garlic' : 'Чеснок'}</b><span>${isEn ? 'Whole roasted heads, cooked right inside the fragrant zirvak broth.' : 'Целые головки чеснока, запекающиеся прямо в горячем рисе.'}</span></li>
          <li data-k="chickpea"><span class="plov__n" data-of="06">05</span><b>${isEn ? 'Chickpeas & Raisins' : 'Нут и изюм'}</b><span>${isEn ? 'Plump chickpeas and black raisins: gentle nuttiness and delicate sweetness.' : 'Крупный нут и тёмный сладкий изюм для баланса вкуса.'}</span></li>
          <li data-k="egg"><span class="plov__n" data-of="06">06</span><b>${isEn ? 'Kazy & Quail Eggs' : 'Казы и перепелиные яйца'}</b><span>${isEn ? 'The royal festive finish of an authentic Tashkent celebratory feast.' : 'Праздничное украшение — домашняя колбаса казы и нежные перепелиные яйца.'}</span></li>
        </ol>
      </div>
    </div>
  </div>

  <div class="plov__after shell">
    <figure class="plov__quote">
      <blockquote>${isEn ? '“It all begins with unyielding respect for the ingredients: choice rice, prime meats, sweet carrots, and fragrant cumin. Plov cannot be hurried.”' : '«Всё начинается с уважения к продуктам: отборный рис, свежее мясо, сладкая морковь и ароматная зира. Плов не терпит суеты.»'}</blockquote>
      <figcaption>${isEn ? 'Chef Djasur Khusanov — 2× New Jersey Plov Contest Finalist' : 'Шеф-повар Джасур Хусанов — призёр фестиваля плова в США'}</figcaption>
    </figure>
    <p class="plov__proof"><b>2024 · 2025</b><span>${isEn ? 'Runner-up, twice: the official Uzbek Plov Championship in New Jersey.' : 'Дважды серебряный призёр официального чемпионата узбекского плова в Нью-Джерси.'}</span></p>
  </div>
</section>

<!-- MENU SECTION -->
<section class="menu" id="menu" aria-labelledby="menuH">
  <div class="shell">
    <header class="menu__head">
      <p class="kicker">${isEn ? 'Curated Table Selections' : 'Избранные блюда стола'}</p>
      <h2 id="menuH" class="h-lg">${isEn ? 'From the Kazan & the Charcoal Grill' : 'Из казана и на открытых углях'}</h2>
      <p style="color:var(--cream-2); max-width:680px; margin:16px auto 0; font-size:17px; line-height:1.6;">
        ${isEn ? 'Every recipe is prepared from scratch using imported Central Asian spices, 100% halal meats, and time-honored artisanal baking techniques.' : 'Каждое блюдо готовится вручную с использованием аутентичных пряностей, 100% халяльного мяса и традиционной глиняной выпечки.'}
      </p>
    </header>

    <!-- Filter Buttons -->
    <div class="menu-filter-nav">
      <button class="menu-filter-btn active" data-filter="all">${isEn ? 'All Specialties' : 'Все блюда'}</button>
      <button class="menu-filter-btn" data-filter="plov">${isEn ? 'Kazan & Rice' : 'Казан и плов'}</button>
      <button class="menu-filter-btn" data-filter="grill">${isEn ? 'Charcoal Grill' : 'Мангал и гриль'}</button>
      <button class="menu-filter-btn" data-filter="soups">${isEn ? 'Noodles & Soups' : 'Лапша и супы'}</button>
      <button class="menu-filter-btn" data-filter="bakery">${isEn ? 'Tandyr Bakery' : 'Тандыр и выпечка'}</button>
    </div>

    <!-- Luxury Menu Cards -->
    <div class="menu-cards-grid">
      <!-- Dish 1 -->
      <div class="menu-card" data-cat="plov">
        <div class="menu-card__image-wrap">
          <img src="/img/dishes/plov-1100.webp" srcset="/img/dishes/plov-600.webp 600w, /img/dishes/plov-1100.webp 1100w" sizes="(max-width: 760px) 100vw, 33vw" alt="Tashkent Plov" loading="lazy">
          <span class="menu-card__badge">${isEn ? 'Signature' : 'Фирменное'}</span>
          <span class="menu-card__price">$22.00</span>
        </div>
        <div class="menu-card__body">
          <h3 class="menu-card__title">${isEn ? 'Tashkent Plov' : 'Ташкентский плов'}</h3>
          <p class="menu-card__desc">${isEn ? 'Festive Uzbek wedding plov: long-grain rice, tender braised lamb and beef, yellow carrots, chickpeas, garlic, and kazy.' : 'Праздничный свадебный плов: отборная баранина и говядина, жёлтая морковь, нут, чеснок, перепелиные яйца и казы.'}</p>
          <div class="menu-card__actions">
            <button class="btn-card-order" data-slug="tashkent-plov">${isEn ? '+ Add to Order' : '+ В заказ'}</button>
            <button class="btn-card-details" data-slug="tashkent-plov">${isEn ? 'Details' : 'Детали'}</button>
          </div>
        </div>
      </div>

      <!-- Dish 2 -->
      <div class="menu-card" data-cat="soups">
        <div class="menu-card__image-wrap">
          <img src="/img/dishes/lagman-1100.webp" srcset="/img/dishes/lagman-600.webp 600w, /img/dishes/lagman-1100.webp 1100w" sizes="(max-width: 760px) 100vw, 33vw" alt="Uighur Lagman" loading="lazy">
          <span class="menu-card__badge">${isEn ? 'Hand-Pulled' : 'Свежая лапша'}</span>
          <span class="menu-card__price">$18.50</span>
        </div>
        <div class="menu-card__body">
          <h3 class="menu-card__title">${isEn ? 'Uighur Lagman' : 'Лагман по-уйгурски'}</h3>
          <p class="menu-card__desc">${isEn ? 'Hand-pulled elastic noodles topped with succulent beef slices, sweet bell peppers, celery, radish, and aromatic spicy Sai gravy.' : 'Тянутая вручную лапша, сочная говядина, хрустящий перец, сельдерей, редька и ароматный пряный соус Сай.'}</p>
          <div class="menu-card__actions">
            <button class="btn-card-order" data-slug="lagman">${isEn ? '+ Add to Order' : '+ В заказ'}</button>
            <button class="btn-card-details" data-slug="lagman">${isEn ? 'Details' : 'Детали'}</button>
          </div>
        </div>
      </div>

      <!-- Dish 3 -->
      <div class="menu-card" data-cat="grill">
        <div class="menu-card__image-wrap">
          <img src="/img/dishes/shashlik-1100.webp" srcset="/img/dishes/shashlik-600.webp 600w, /img/dishes/shashlik-1100.webp 1100w" sizes="(max-width: 760px) 100vw, 33vw" alt="Charcoal Shashlik" loading="lazy">
          <span class="menu-card__badge">${isEn ? 'Wood-Fired' : 'На углях'}</span>
          <span class="menu-card__price">$24.00</span>
        </div>
        <div class="menu-card__body">
          <h3 class="menu-card__title">${isEn ? 'Charcoal Shashlik' : 'Шашлык на углях'}</h3>
          <p class="menu-card__desc">${isEn ? 'Prime lamb and beef skewers marinated in mountain spices, grilled over birchwood embers, served with sumac onions.' : 'Баранина и говядина, маринованные в горных травах с луковым соком, обжаренные на берёзовых углях с сумахом.'}</p>
          <div class="menu-card__actions">
            <button class="btn-card-order" data-slug="shashlik-assorted">${isEn ? '+ Add to Order' : '+ В заказ'}</button>
            <button class="btn-card-details" data-slug="shashlik-assorted">${isEn ? 'Details' : 'Детали'}</button>
          </div>
        </div>
      </div>

      <!-- Dish 4 -->
      <div class="menu-card" data-cat="bakery">
        <div class="menu-card__image-wrap">
          <img src="/img/dishes/khachapuri-1100.webp" srcset="/img/dishes/khachapuri-600.webp 600w, /img/dishes/khachapuri-1100.webp 1100w" sizes="(max-width: 760px) 100vw, 33vw" alt="Adjarian Khachapuri" loading="lazy">
          <span class="menu-card__badge">${isEn ? 'Oven-Baked' : 'Из печи'}</span>
          <span class="menu-card__price">$16.00</span>
        </div>
        <div class="menu-card__body">
          <h3 class="menu-card__title">${isEn ? 'Adjarian Khachapuri' : 'Хачапури по-аджарски'}</h3>
          <p class="menu-card__desc">${isEn ? 'Warm canoe-shaped crust brimming with molten suluguni and imeruli cheeses, topped with farm egg yolk and creamy butter.' : 'Хрустящая лодочка из печи, щедро наполненная расплавленным сулугуни, фермерским желтком и сливочным маслом.'}</p>
          <div class="menu-card__actions">
            <button class="btn-card-order" data-slug="khachapuri-adjarian">${isEn ? '+ Add to Order' : '+ В заказ'}</button>
            <button class="btn-card-details" data-slug="khachapuri-adjarian">${isEn ? 'Details' : 'Детали'}</button>
          </div>
        </div>
      </div>

      <!-- Dish 5 -->
      <div class="menu-card" data-cat="bakery">
        <div class="menu-card__image-wrap">
          <img src="/img/dishes/samsa-1100.webp" srcset="/img/dishes/samsa-600.webp 600w, /img/dishes/samsa-1100.webp 1100w" sizes="(max-width: 760px) 100vw, 33vw" alt="Tandyr Samsa" loading="lazy">
          <span class="menu-card__badge">${isEn ? 'Crispy Pastry' : 'Слоёная самса'}</span>
          <span class="menu-card__price">$6.50</span>
        </div>
        <div class="menu-card__body">
          <h3 class="menu-card__title">${isEn ? 'Tandyr Lamb Samsa' : 'Самса тандырная'}</h3>
          <p class="menu-card__desc">${isEn ? 'Flaky golden pastry triangles filled with tender hand-diced lamb, sweet onion, and toasted cumin seeds.' : 'Хрустящее слоёное тесто с сочной рублёной бараниной, сладким луком и зирой, запечённое на стенках тандыра.'}</p>
          <div class="menu-card__actions">
            <button class="btn-card-order" data-slug="samsa-tandyr">${isEn ? '+ Add to Order' : '+ В заказ'}</button>
            <button class="btn-card-details" data-slug="samsa-tandyr">${isEn ? 'Details' : 'Детали'}</button>
          </div>
        </div>
      </div>

      <!-- Dish 6 -->
      <div class="menu-card" data-cat="bakery">
        <div class="menu-card__image-wrap">
          <img src="/img/dishes/non-1100.webp" srcset="/img/dishes/non-600.webp 600w, /img/dishes/non-1100.webp 1100w" sizes="(max-width: 760px) 100vw, 33vw" alt="Uzbek Tandyr Non" loading="lazy">
          <span class="menu-card__badge">${isEn ? 'Artisanal Bread' : 'Тандырный хлеб'}</span>
          <span class="menu-card__price">$4.50</span>
        </div>
        <div class="menu-card__body">
          <h3 class="menu-card__title">${isEn ? 'Uzbek Tandyr Non' : 'Узбекская лепёшка'}</h3>
          <p class="menu-card__desc">${isEn ? 'Traditional round flatbread with ornate chekich-stamped center, baked against scorching clay oven walls.' : 'Ароматная круглая лепёшка с золотистой корочкой и узором чекича, испечённая в глиняном тандыре.'}</p>
          <div class="menu-card__actions">
            <button class="btn-card-order" data-slug="uzbek-non">${isEn ? '+ Add to Order' : '+ В заказ'}</button>
            <button class="btn-card-details" data-slug="uzbek-non">${isEn ? 'Details' : 'Детали'}</button>
          </div>
        </div>
      </div>
    </div>

    <div style="text-align:center; margin-top:48px;">
      <a href="${prefix}/menu" class="btn btn--gold">
        ${isEn ? 'Explore Complete 14-Dish Menu →' : 'Смотреть всё меню (14 блюд) →'}
      </a>
    </div>
  </div>
</section>

<!-- CHEF DJASUR KHUSANOV -->
<section class="chef" id="chef" aria-labelledby="chefH">
  <div class="shell chef__grid">
    <div class="chef__media">
      <figure class="arch chef__portrait">
        <img src="/img/chef-portrait.webp" width="760" height="940" alt="Chef Djasur Khusanov" loading="lazy" decoding="async">
      </figure>
      <figure class="chef__kazan" style="margin-top:20px;">
        <img src="/img/chef-kazan.webp" width="464" height="464" alt="Chef Djasur cooking plov over fire" loading="lazy" decoding="async">
      </figure>
    </div>
    <div class="chef__text">
      <p class="kicker">${isEn ? 'Culinary Master' : 'Шеф-повар'}</p>
      <h2 id="chefH" class="h-lg">Djasur Khusanov</h2>
      <p class="chef__body" style="font-size:18px; line-height:1.7; color:var(--cream-2); margin-top:16px;">
        ${isEn
          ? 'With over twenty years at the stoves of premier restaurants across Europe and Central Asia, Chef Djasur Khusanov opened Tashkent Grill House to bring authentic Uzbek and Georgian dining culture to Chicagoland. Every kazan of plov is crafted with ancestral mastery and genuine hospitality.'
          : 'Более двадцати лет на ресторанных кухнях Европы и Центральной Азии. Шеф Джасур Хусанов открыл Tashkent Grill House, чтобы познакомить Нейпервилл с настоящим узбекским гостеприимством и подлинным вкусом плова из казана.'}
      </p>

      <div class="chef-stats-row">
        <div class="chef-stat-box">
          <div class="chef-stat-number">20+</div>
          <div class="chef-stat-label">${isEn ? 'Years Experience' : 'Лет у казана'}</div>
        </div>
        <div class="chef-stat-box">
          <div class="chef-stat-number">2×</div>
          <div class="chef-stat-label">${isEn ? 'Plov Laureate' : 'Призёр США'}</div>
        </div>
        <div class="chef-stat-box">
          <div class="chef-stat-number">100%</div>
          <div class="chef-stat-label">${isEn ? 'Halal Certified' : 'Халяль рецепты'}</div>
        </div>
      </div>

      <div style="margin-top:32px;">
        <a href="${prefix}/reservation" class="btn btn--gold">
          ${isEn ? 'Book a Table for Chef’s Feast →' : 'Забронировать столик к шефу →'}
        </a>
      </div>
    </div>
  </div>
</section>

<!-- BARBECUE FIRE MARQUEE -->
<section class="fire" aria-label="Barbecue · Good food · Good mood">
  <div class="fire__bg" aria-hidden="true"><img src="/img/fire.webp" width="640" height="620" alt="" loading="lazy" decoding="async"></div>
  <p class="fire__line" data-fire aria-hidden="true"><span>Barbecue · Good food · Good mood</span><span>Barbecue · Good food · Good mood</span><span>Barbecue · Good food · Good mood</span></p>
  <p class="sr-only">Barbecue · Good food · Good mood</p>
</section>

<!-- THE DINING ROOM & GALLERY SHOWCASE -->
<section class="hall" id="hall" aria-labelledby="hallH">
  <div class="shell">
    <div style="text-align:center; max-width:720px; margin:0 auto 36px;">
      <p class="kicker" style="justify-content:center;">${isEn ? 'The Atmosphere & Dining Hall' : 'Атмосфера и интерьер'}</p>
      <h2 id="hallH" class="h-lg">${isEn ? 'Cobalt Velvet, Natural Walnut & Candlelight' : 'Кобальт, орех и тёплый вечерний свет'}</h2>
      <p style="color:var(--cream-2); font-size:17px; line-height:1.6; margin-top:14px;">
        ${isEn 
          ? 'Deep blue velvet banquettes, an arched mirror carved with traditional motifs, authentic Rishtan ceramics, and solid walnut tables. Click any perspective to open the immersive gallery.'
          : 'Глубокие синие бархатные диваны, резное арочное зеркало, авторская риштанская керамика и столы из массива ореха. Нажмите на фото для просмотра в полном размере.'}
      </p>
    </div>

    <div class="hall-gallery-grid">
      <!-- Tile 1 (Large) -->
      <div class="gallery-tile gallery-tile--large">
        <img src="/img/hall-wide.webp" alt="Tashkent Grill House Main Dining Hall" loading="lazy">
        <div class="gallery-tile__overlay">
          <h3 class="gallery-tile__title">${isEn ? 'Main Dining Hall' : 'Главный зал ресторана'}</h3>
          <p class="gallery-tile__desc">${isEn ? 'Spacious dining room with ambient chandeliers and cobalt banquettes' : 'Просторный зал с тёплыми люстрами и мягкими бархатными диванами'}</p>
        </div>
        <div class="gallery-tile__zoom-icon">🔍</div>
      </div>

      <!-- Tile 2 -->
      <div class="gallery-tile">
        <img src="/img/hall-arch.webp" alt="Carved Walnut Arch & Mirror" loading="lazy">
        <div class="gallery-tile__overlay">
          <h3 class="gallery-tile__title">${isEn ? 'Carved Architectural Arch' : 'Резная арочная композиция'}</h3>
          <p class="gallery-tile__desc">${isEn ? 'Intricate Central Asian woodwork and candlelight reflection' : 'Изящная резьба по дереву и мягкий отражённый свет'}</p>
        </div>
        <div class="gallery-tile__zoom-icon">🔍</div>
      </div>

      <!-- Tile 3 -->
      <div class="gallery-tile">
        <img src="/img/chef-kazan.webp" alt="Live Kazan Station" loading="lazy">
        <div class="gallery-tile__overlay">
          <h3 class="gallery-tile__title">${isEn ? 'Live Kazan Fire Station' : 'Станция дровяного казана'}</h3>
          <p class="gallery-tile__desc">${isEn ? 'Where plov simmers over authentic open flame every morning' : 'Где каждое утро на живом огне томится свежий плов'}</p>
        </div>
        <div class="gallery-tile__zoom-icon">🔍</div>
      </div>
    </div>
  </div>
</section>

<!-- VISIT & LOCATION DOSSIER -->
<section class="visit" id="visit" aria-labelledby="visitH">
  <div class="shell visit__grid" style="display:grid; grid-template-columns: 1fr 1fr; gap:48px; align-items:start;">
    <div class="visit-dossier">
      <p class="kicker">${isEn ? 'Visit Us in Naperville' : 'Ждём вас в Нейпервилле'}</p>
      <h2 id="visitH" class="h-lg" style="margin-bottom:20px;">Springbrook Square</h2>

      <div class="visit-address-box">
        <div>
          <div style="font-size:12px; text-transform:uppercase; color:var(--gold); font-family:var(--cond); letter-spacing:0.1em; margin-bottom:4px;">${isEn ? 'Address' : 'Адрес'}</div>
          <address style="color:var(--cream); font-size:17px; font-weight:600;">1995 Springbrook Square Dr #107<br>Naperville, IL 60564</address>
        </div>
        <button class="btn-copy-address" type="button">${isEn ? 'Copy' : 'Копировать'}</button>
      </div>

      <div class="visit__ctas" style="display:flex; gap:12px; flex-wrap:wrap; margin-bottom:28px;">
        <a class="btn btn--gold" href="https://www.google.com/maps/dir/?api=1&destination=Tashkent%20Grill%20House%2C%201995%20Springbrook%20Square%20Dr%20%23107%2C%20Naperville%2C%20IL%2060564" target="_blank" rel="noopener">
          ${isEn ? 'Google Maps' : 'Google Карты'} <span aria-hidden="true" class="btn__arrow">→</span>
        </a>
        <a class="btn btn--line" href="https://maps.apple.com/?daddr=1995%20Springbrook%20Square%20Dr%20%23107%2C%20Naperville%2C%20IL%2060564&q=Tashkent%20Grill%20House" target="_blank" rel="noopener">
          ${isEn ? 'Apple Maps' : 'Apple Карты'}
        </a>
      </div>

      <dl class="visit__facts" style="border-top:1px solid rgba(211,186,116,0.15); padding-top:20px;">
        <div style="margin-bottom:12px;"><dt style="color:var(--gold);">${isEn ? 'Service Format' : 'Формат сервиса'}</dt><dd style="color:var(--cream-2);">${isEn ? 'Dine-In Hall · Curbside Pickup · Catering' : 'Уютный зал · Самовывоз · Кейтеринг'}</dd></div>
        <div style="margin-bottom:12px;"><dt style="color:var(--gold);">${isEn ? 'Operating Hours' : 'Часы работы'}</dt><dd style="color:var(--cream-2);">${isEn ? 'Tue – Sun: 11:30 AM – 9:30 PM (Mon Closed)' : 'Вт – Вс: 11:30 – 21:30 (Пн выходной)'}</dd></div>
        <div><dt style="color:var(--gold);">${isEn ? 'Instagram News' : 'Инстаграм ресторана'}</dt><dd><a href="https://www.instagram.com/tashkentgrillhouse.chicago/" target="_blank" rel="noopener" style="color:var(--gold-2);">@tashkentgrillhouse.chicago</a></dd></div>
      </dl>
    </div>

    <div class="visit__map">
      <iframe title="Map: Tashkent Grill House, 1995 Springbrook Square Dr, Naperville" src="https://www.google.com/maps?q=Tashkent%20Grill%20House%2C%201995%20Springbrook%20Square%20Dr%20%23107%2C%20Naperville%2C%20IL%2060564&z=16&output=embed" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
    </div>
  </div>
</section>
</main>

<!-- AGENCY-GRADE LUXURY FOOTER -->
<footer class="ftr-luxury">
  <div class="ftr-grid">
    <!-- Col 1 -->
    <div class="ftr-col">
      <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">
        <svg viewBox="0 0 621 621" style="width:48px; height:48px; fill:var(--gold);" aria-hidden="true"><use href="#lg-rosette"/><use href="#lg-flame"/><use href="#lg-bowl"/></svg>
        <div>
          <div style="font-family:var(--display); font-size:22px; color:var(--cream);">Tashkent Grill House</div>
          <div style="font-family:var(--cond); font-size:12px; letter-spacing:0.18em; color:var(--gold); text-transform:uppercase;">${isEn ? 'Authentic Uzbek Cuisine' : 'Узбекская кухня'}</div>
        </div>
      </div>
      <p style="font-size:14px; line-height:1.6; color:var(--cream-dim); max-width:320px;">
        ${isEn 
          ? 'Bringing centuries of Central Asian hospitality, traditional copper-kazan plov, and open-charcoal grilling to Naperville, Illinois.'
          : 'Вековые традиции восточного гостеприимства, плов из дровяного казана и ароматный гриль на углях в Нейпервилле, Иллинойс.'}
      </p>
      <div class="ftr-social-pills">
        <a href="https://www.instagram.com/tashkentgrillhouse.chicago/" target="_blank" rel="noopener" class="ftr-social-pill" aria-label="Instagram">IG</a>
        <a href="https://www.google.com/maps/dir/?api=1&destination=Tashkent%20Grill%20House%2C%201995%20Springbrook%20Square%20Dr%20%23107%2C%20Naperville%2C%20IL%2060564" target="_blank" rel="noopener" class="ftr-social-pill" aria-label="Maps">MAP</a>
      </div>
    </div>

    <!-- Col 2 -->
    <div class="ftr-col">
      <h4>${isEn ? 'Culinary Menu' : 'Меню ресторана'}</h4>
      <ul>
        <li><a href="${prefix}/menu">${isEn ? 'Full Interactive Menu' : 'Полное меню'}</a></li>
        <li><a href="#plov">${isEn ? 'Signature Tashkent Plov' : 'Ташкентский плов'}</a></li>
        <li><a href="#menu">${isEn ? 'Charcoal Shashlik' : 'Шашлык на углях'}</a></li>
        <li><a href="#menu">${isEn ? 'Hand-Pulled Lagman' : 'Тянутый лагман'}</a></li>
        <li><a href="#menu">${isEn ? 'Tandyr Breads & Samsa' : 'Выпечка из тандыра'}</a></li>
      </ul>
    </div>

    <!-- Col 3 -->
    <div class="ftr-col">
      <h4>${isEn ? 'Guest Services' : 'Сервисы для гостей'}</h4>
      <ul>
        <li><a href="${prefix}/reservation">${isEn ? 'Online Table Reservation' : 'Бронирование столика'}</a></li>
        <li><a href="${prefix}/order">${isEn ? 'Curbside Order Pickup' : 'Заказ на вынос'}</a></li>
        <li><a href="${prefix}/order/track">${isEn ? 'Live Order Tracking' : 'Отслеживание заказа'}</a></li>
        <li><a href="${prefix}/account">${isEn ? 'Guest Profile & Bookings' : 'Личный кабинет'}</a></li>
        <li><a href="/admin">${isEn ? 'Staff & Manager Portal' : 'Портал администратора'}</a></li>
      </ul>
    </div>

    <!-- Col 4 -->
    <div class="ftr-col">
      <h4>${isEn ? 'Location & Hours' : 'Контакты и время'}</h4>
      <p style="font-size:14px; line-height:1.6; color:var(--cream-2); margin-bottom:12px;">
        1995 Springbrook Square Dr #107<br>Naperville, IL 60564
      </p>
      <p style="font-size:14px; line-height:1.6; color:var(--cream-dim);">
        ${isEn ? 'Tue – Sun: 11:30 AM – 9:30 PM' : 'Вт – Вс: 11:30 – 21:30'}<br>
        ${isEn ? 'Monday: Closed' : 'Понедельник: выходной'}
      </p>
    </div>
  </div>

  <div class="ftr-bottom">
    <div>© 2026 Tashkent Grill House. ${isEn ? 'All rights reserved.' : 'Все права защищены.'}</div>
    <div>${isEn ? '100% Halal Meats · Crafted with Authentic Central Asian Spices' : '100% Халяль · Традиционные восточные специи'}</div>
    <div><a href="${otherPrefix}/" style="color:var(--gold);">${isEn ? 'Русская версия (RU)' : 'English Version (EN)'}</a></div>
  </div>
</footer>

<a class="mcta btn btn--luxury" href="https://www.google.com/maps/dir/?api=1&destination=Tashkent%20Grill%20House%2C%201995%20Springbrook%20Square%20Dr%20%23107%2C%20Naperville%2C%20IL%2060564" target="_blank" rel="noopener" data-mcta>${isEn ? 'Get Directions →' : 'Маршрут →'}</a>

<script src="/vendor/gsap.min.js" defer></script>
<script src="/vendor/ScrollTrigger.min.js" defer></script>
<script src="/vendor/DrawSVGPlugin.min.js" defer></script>
<script src="/assets/main.js" defer></script>
<script src="/assets/app.js"></script>
</body>
</html>`;
}

// Generate all 3 homepages
fs.writeFileSync('index.html', renderHomepage('en'), 'utf-8');
fs.writeFileSync('en/index.html', renderHomepage('en'), 'utf-8');
fs.writeFileSync('ru/index.html', renderHomepage('ru'), 'utf-8');

console.log('Successfully generated upgraded index.html, en/index.html, and ru/index.html!');

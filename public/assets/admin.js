// Tashkent Grill House — Unified Admin Dashboard Application
// Connects to /api/admin-manage (Vercel Serverless Function) and Supabase

(function () {
  'use strict';

  // --- STATE ---
  let adminSecret = sessionStorage.getItem('tgh_admin_secret') || '';
  let activeTab = 'overview';
  let cachedData = {
    dashboard: null,
    reservations: [],
    orders: [],
    menu: [],
    categories: [],
    tables: [],
    hours: [],
    reviews: [],
    settings: {}
  };

  // --- TOAST NOTIFICATIONS ---
  function showToast(message, type = 'info') {
    let container = document.getElementById('admToastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'admToastContainer';
      container.className = 'adm-toast-container';
      document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = `adm-toast ${type}`;
    const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';
    toast.innerHTML = `<span style="font-weight:bold;">${icon}</span> <span>${escapeHtml(message)}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(20px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // --- API WRAPPER ---
  async function apiCall(action, method = 'GET', data = null) {
    const primaryUrl = `/api/admin-manage${method === 'GET' ? `?action=${action}` : ''}`;
    const fallbackUrl = `/.netlify/functions/admin-manage${method === 'GET' ? `?action=${action}` : ''}`;

    const headers = {
      'Content-Type': 'application/json',
      'x-admin-secret': adminSecret,
      'Authorization': `Bearer ${adminSecret}`
    };

    const options = {
      method,
      headers
    };

    if (method === 'POST') {
      options.body = JSON.stringify({ action, ...(data || {}) });
    }

    try {
      let res = await fetch(primaryUrl, options);
      if (res.status === 404) {
        // Fallback to Netlify function path
        res = await fetch(fallbackUrl, options);
      }

      if (res.status === 401) {
        sessionStorage.removeItem('tgh_admin_secret');
        adminSecret = '';
        showAuthModal(true);
        throw new Error('Authentication expired or invalid passcode');
      }

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || `HTTP ${res.status}`);
      }
      return json;
    } catch (err) {
      console.error(`[API Error] ${action}:`, err);
      throw err;
    }
  }

  // --- AUTHENTICATION MODAL ---
  function showAuthModal(show) {
    const overlay = document.getElementById('admAuthOverlay');
    if (overlay) {
      overlay.style.display = show ? 'flex' : 'none';
      if (show) {
        setTimeout(() => document.getElementById('admAuthKeyInput')?.focus(), 100);
      }
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    const keyInput = document.getElementById('admAuthKeyInput');
    const submitBtn = document.getElementById('admAuthSubmitBtn');
    const secret = keyInput.value.trim();

    if (!secret) {
      showToast('Please enter administrator passcode', 'error');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.innerText = 'Verifying...';

    try {
      // Direct verification probe
      const res = await fetch('/api/admin-manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify_auth', secret })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        adminSecret = secret;
        sessionStorage.setItem('tgh_admin_secret', secret);
        showAuthModal(false);
        showToast('Administrator session authenticated', 'success');
        loadActiveTab();
      } else {
        throw new Error(data.error || 'Invalid administrator secret key');
      }
    } catch (err) {
      showToast(err.message || 'Authentication failed', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerText = 'Sign In to Console';
    }
  }

  function handleLogout() {
    sessionStorage.removeItem('tgh_admin_secret');
    adminSecret = '';
    showToast('Signed out of admin session', 'info');
    showAuthModal(true);
  }

  // --- TAB NAVIGATION ---
  function setupTabs() {
    document.querySelectorAll('.adm-nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        if (!tab) return;
        switchTab(tab);
      });
    });
  }

  function switchTab(tab) {
    activeTab = tab;
    document.querySelectorAll('.adm-nav-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.tab === tab);
    });
    document.querySelectorAll('.adm-tab-panel').forEach(p => {
      p.classList.toggle('active', p.id === `tab-${tab}`);
    });
    loadActiveTab();
  }

  function loadActiveTab() {
    if (!adminSecret) {
      showAuthModal(true);
      return;
    }

    switch (activeTab) {
      case 'overview':
        loadOverview();
        break;
      case 'reservations':
        loadReservations();
        break;
      case 'orders':
        loadOrders();
        break;
      case 'menu':
        loadMenu();
        break;
      case 'tables':
        loadTables();
        break;
      case 'hours':
        loadHours();
        break;
      case 'reviews':
        loadReviews();
        break;
      case 'settings':
        loadSettings();
        break;
    }
  }

  // =========================================================================
  // TAB 1: OVERVIEW
  // =========================================================================
  async function loadOverview() {
    try {
      const data = await apiCall('dashboard');
      cachedData.dashboard = data;

      // Stats
      document.getElementById('statTodayCovers').innerText = data.stats.today_covers ?? 0;
      document.getElementById('statTotalReservations').innerText = data.stats.total_reservations ?? 0;
      document.getElementById('statActiveOrders').innerText = data.stats.active_orders ?? 0;
      document.getElementById('statGrossRevenue').innerText = `$${(data.stats.gross_revenue || 0).toFixed(2)}`;
      document.getElementById('statMenuCount').innerText = data.stats.menu_count ?? 0;
      document.getElementById('statTablesCount').innerText = data.stats.tables_count ?? 0;

      // Status Pills
      const dbPill = document.getElementById('pillDbStatus');
      if (dbPill) {
        if (data.is_live_db) {
          dbPill.className = 'adm-pill green';
          dbPill.innerHTML = '<span class="dot"></span> Supabase Postgres: Live';
        } else {
          dbPill.className = 'adm-pill amber';
          dbPill.innerHTML = '<span class="dot"></span> DB: Standby (Run Migration)';
        }
      }

      const tgPill = document.getElementById('pillTelegramStatus');
      if (tgPill) {
        if (data.telegram_configured) {
          tgPill.className = 'adm-pill green';
          tgPill.innerHTML = '<span class="dot"></span> Telegram Bot: Online';
        } else {
          tgPill.className = 'adm-pill amber';
          tgPill.innerHTML = '<span class="dot"></span> Telegram: Unconfigured';
        }
      }

      // Recent Reservations
      const resTbody = document.getElementById('overviewResTbody');
      if (resTbody) {
        if (!data.recent_reservations || data.recent_reservations.length === 0) {
          resTbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--admin-muted); padding:24px;">No reservations found</td></tr>`;
        } else {
          resTbody.innerHTML = data.recent_reservations.slice(0, 5).map(r => `
            <tr>
              <td><code>${escapeHtml(r.booking_code)}</code></td>
              <td><strong>${escapeHtml(r.customer_name)}</strong><br><small style="color:var(--admin-muted);">${escapeHtml(r.customer_phone)}</small></td>
              <td>${formatDateTime(r.start_time)}</td>
              <td>${r.guest_count} guests</td>
              <td><span class="adm-badge badge-${r.status}">${r.status}</span></td>
              <td>
                <div style="display:flex; gap:6px;">
                  ${r.status === 'confirmed' ? `<button class="adm-btn adm-btn-success adm-btn-sm" onclick="window.tghAdmin.updateResStatus('${r.id}', 'seated')">Seat</button>` : ''}
                  ${r.status === 'pending' ? `<button class="adm-btn adm-btn-primary adm-btn-sm" onclick="window.tghAdmin.updateResStatus('${r.id}', 'confirmed')">Confirm</button>` : ''}
                  ${r.status !== 'cancelled' ? `<button class="adm-btn adm-btn-danger adm-btn-sm" onclick="window.tghAdmin.updateResStatus('${r.id}', 'cancelled')">Cancel</button>` : ''}
                </div>
              </td>
            </tr>
          `).join('');
        }
      }

      // Recent Orders
      const ordTbody = document.getElementById('overviewOrdersTbody');
      if (ordTbody) {
        if (!data.recent_orders || data.recent_orders.length === 0) {
          ordTbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--admin-muted); padding:24px;">No orders found</td></tr>`;
        } else {
          ordTbody.innerHTML = data.recent_orders.slice(0, 5).map(o => `
            <tr>
              <td><code>${escapeHtml(o.order_number)}</code></td>
              <td><strong>${escapeHtml(o.customer_name)}</strong></td>
              <td><span style="text-transform:capitalize;">${o.order_type || 'pickup'}</span></td>
              <td><strong>$${(o.total_amount || 0).toFixed(2)}</strong></td>
              <td><span class="adm-badge badge-${o.status}">${o.status}</span></td>
              <td>
                <div style="display:flex; gap:6px;">
                  ${o.status === 'pending' ? `<button class="adm-btn adm-btn-primary adm-btn-sm" onclick="window.tghAdmin.updateOrdStatus('${o.id}', 'preparing')">Accept</button>` : ''}
                  ${o.status === 'preparing' ? `<button class="adm-btn adm-btn-success adm-btn-sm" onclick="window.tghAdmin.updateOrdStatus('${o.id}', 'ready')">Ready</button>` : ''}
                  <button class="adm-btn adm-btn-secondary adm-btn-sm" onclick="window.tghAdmin.viewOrderDetails('${o.id}')">View</button>
                </div>
              </td>
            </tr>
          `).join('');
        }
      }

    } catch (err) {
      showToast(`Failed to load overview: ${err.message}`, 'error');
    }
  }

  // =========================================================================
  // TAB 2: RESERVATIONS
  // =========================================================================
  async function loadReservations() {
    try {
      const data = await apiCall('reservations');
      cachedData.reservations = data.reservations || [];
      renderReservationsTable();
    } catch (err) {
      showToast(`Failed to load reservations: ${err.message}`, 'error');
    }
  }

  function renderReservationsTable() {
    const filter = document.querySelector('#resFilterBar .active')?.dataset.filter || 'all';
    const query = (document.getElementById('resSearchInput')?.value || '').toLowerCase().trim();
    const tbody = document.getElementById('reservationsTbody');
    if (!tbody) return;

    let items = cachedData.reservations;
    if (filter !== 'all') {
      items = items.filter(r => r.status === filter);
    }
    if (query) {
      items = items.filter(r =>
        (r.booking_code || '').toLowerCase().includes(query) ||
        (r.customer_name || '').toLowerCase().includes(query) ||
        (r.customer_phone || '').toLowerCase().includes(query)
      );
    }

    if (items.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:32px; color:var(--admin-muted);">No reservations found matching filter criteria</td></tr>`;
      return;
    }

    tbody.innerHTML = items.map(r => `
      <tr>
        <td><code>${escapeHtml(r.booking_code)}</code></td>
        <td>
          <strong>${escapeHtml(r.customer_name)}</strong><br>
          <small style="color:var(--admin-muted);">${escapeHtml(r.customer_email || '')}</small>
        </td>
        <td>${escapeHtml(r.customer_phone)}</td>
        <td><strong>${formatDateTime(r.start_time)}</strong></td>
        <td>${r.guest_count} persons</td>
        <td>${escapeHtml(r.table_number || r.table_id || 'Auto')}</td>
        <td><span class="adm-badge badge-${r.status}">${r.status}</span></td>
        <td>
          <div style="display:flex; gap:6px; flex-wrap:wrap;">
            ${r.status === 'pending' ? `<button class="adm-btn adm-btn-primary adm-btn-sm" onclick="window.tghAdmin.updateResStatus('${r.id}', 'confirmed')">Confirm</button>` : ''}
            ${r.status === 'confirmed' ? `<button class="adm-btn adm-btn-success adm-btn-sm" onclick="window.tghAdmin.updateResStatus('${r.id}', 'seated')">Seat</button>` : ''}
            ${r.status === 'seated' ? `<button class="adm-btn adm-btn-secondary adm-btn-sm" onclick="window.tghAdmin.updateResStatus('${r.id}', 'completed')">Finish</button>` : ''}
            ${r.status !== 'cancelled' && r.status !== 'completed' ? `<button class="adm-btn adm-btn-danger adm-btn-sm" onclick="window.tghAdmin.updateResStatus('${r.id}', 'cancelled')">Cancel</button>` : ''}
            <button class="adm-btn adm-btn-secondary adm-btn-sm" onclick="window.tghAdmin.deleteRes('${r.id}')" title="Delete">🗑</button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  async function updateResStatus(id, status) {
    let cancellationReason = '';
    if (status === 'cancelled') {
      cancellationReason = prompt('Reason for reservation cancellation (optional):', 'Customer request') || '';
    }

    try {
      const res = await apiCall('update_reservation_status', 'POST', {
        id,
        data: { status, cancellation_reason: cancellationReason }
      });
      showToast(res.message || `Reservation set to ${status}`, 'success');
      loadReservations();
      if (activeTab === 'overview') loadOverview();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  async function deleteRes(id) {
    if (!confirm('Are you sure you want to permanently delete this reservation?')) return;
    try {
      await apiCall('delete_reservation', 'POST', { id });
      showToast('Reservation deleted successfully', 'success');
      loadReservations();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  // =========================================================================
  // TAB 3: ORDERS
  // =========================================================================
  async function loadOrders() {
    try {
      const data = await apiCall('orders');
      cachedData.orders = data.orders || [];
      renderOrdersTable();
    } catch (err) {
      showToast(`Failed to load orders: ${err.message}`, 'error');
    }
  }

  function renderOrdersTable() {
    const filter = document.querySelector('#ordFilterBar .active')?.dataset.filter || 'all';
    const query = (document.getElementById('ordSearchInput')?.value || '').toLowerCase().trim();
    const tbody = document.getElementById('ordersTbody');
    if (!tbody) return;

    let items = cachedData.orders;
    if (filter !== 'all') {
      items = items.filter(o => o.status === filter);
    }
    if (query) {
      items = items.filter(o =>
        (o.order_number || '').toLowerCase().includes(query) ||
        (o.customer_name || '').toLowerCase().includes(query) ||
        (o.customer_phone || '').toLowerCase().includes(query)
      );
    }

    if (items.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:32px; color:var(--admin-muted);">No orders found matching filter criteria</td></tr>`;
      return;
    }

    tbody.innerHTML = items.map(o => `
      <tr>
        <td><code>${escapeHtml(o.order_number)}</code></td>
        <td>
          <strong>${escapeHtml(o.customer_name)}</strong><br>
          <small style="color:var(--admin-muted);">${escapeHtml(o.customer_phone)}</small>
        </td>
        <td><span style="text-transform:capitalize;">${o.order_type || 'pickup'}</span></td>
        <td>${(o.order_items || []).length} items</td>
        <td><strong>$${(o.total_amount || 0).toFixed(2)}</strong></td>
        <td>${formatDateTime(o.created_at)}</td>
        <td><span class="adm-badge badge-${o.status}">${o.status}</span></td>
        <td>
          <div style="display:flex; gap:6px; flex-wrap:wrap;">
            ${o.status === 'pending' ? `<button class="adm-btn adm-btn-primary adm-btn-sm" onclick="window.tghAdmin.updateOrdStatus('${o.id}', 'preparing')">Accept</button>` : ''}
            ${o.status === 'preparing' ? `<button class="adm-btn adm-btn-success adm-btn-sm" onclick="window.tghAdmin.updateOrdStatus('${o.id}', 'ready')">Mark Ready</button>` : ''}
            ${o.status === 'ready' ? `<button class="adm-btn adm-btn-secondary adm-btn-sm" onclick="window.tghAdmin.updateOrdStatus('${o.id}', 'completed')">Complete</button>` : ''}
            ${o.status !== 'cancelled' && o.status !== 'completed' ? `<button class="adm-btn adm-btn-danger adm-btn-sm" onclick="window.tghAdmin.updateOrdStatus('${o.id}', 'cancelled')">Cancel</button>` : ''}
            <button class="adm-btn adm-btn-secondary adm-btn-sm" onclick="window.tghAdmin.viewOrderDetails('${o.id}')">Details</button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  async function updateOrdStatus(id, status) {
    try {
      const res = await apiCall('update_order_status', 'POST', { id, data: { status } });
      showToast(res.message || `Order status updated to ${status}`, 'success');
      loadOrders();
      if (activeTab === 'overview') loadOverview();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  function viewOrderDetails(id) {
    const order = (cachedData.orders || []).find(o => o.id === id) ||
                  (cachedData.dashboard?.recent_orders || []).find(o => o.id === id);
    if (!order) {
      showToast('Order details not found', 'error');
      return;
    }

    const modalBody = document.getElementById('orderDetailsBody');
    if (!modalBody) return;

    modalBody.innerHTML = `
      <div style="margin-bottom:20px; border-bottom:1px solid var(--admin-border); padding-bottom:16px;">
        <h4 style="margin:0 0 8px; color:var(--admin-gold-light); font-size:16px;">Order #${escapeHtml(order.order_number)}</h4>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; font-size:13px;">
          <div><strong>Customer:</strong> ${escapeHtml(order.customer_name)}</div>
          <div><strong>Phone:</strong> ${escapeHtml(order.customer_phone)}</div>
          <div><strong>Email:</strong> ${escapeHtml(order.customer_email || '—')}</div>
          <div><strong>Type:</strong> <span style="text-transform:capitalize;">${order.order_type || 'pickup'}</span></div>
          <div><strong>Status:</strong> <span class="adm-badge badge-${order.status}">${order.status}</span></div>
          <div><strong>Placed:</strong> ${formatDateTime(order.created_at)}</div>
        </div>
        ${order.special_instructions ? `<div style="margin-top:12px; font-size:13px; color:var(--admin-gold);"><strong>Notes:</strong> ${escapeHtml(order.special_instructions)}</div>` : ''}
      </div>

      <h5 style="margin:0 0 12px; color:var(--admin-gold); font-size:14px; text-transform:uppercase;">Order Items</h5>
      <table class="adm-table" style="font-size:13px; margin-bottom:18px;">
        <thead>
          <tr>
            <th>Item</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${(order.order_items && order.order_items.length > 0) ? order.order_items.map(item => `
            <tr>
              <td>${escapeHtml(item.item_name)}</td>
              <td>${item.quantity}</td>
              <td>$${(Number(item.unit_price) || 0).toFixed(2)}</td>
              <td><strong>$${(Number(item.total_price) || 0).toFixed(2)}</strong></td>
            </tr>
          `).join('') : `<tr><td colspan="4" style="text-align:center; color:var(--admin-muted);">No itemized rows recorded</td></tr>`}
        </tbody>
      </table>

      <div style="display:flex; justify-content:flex-end;">
        <div style="width:220px; font-size:13px;">
          <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
            <span style="color:var(--admin-muted);">Subtotal:</span>
            <span>$${(order.subtotal || 0).toFixed(2)}</span>
          </div>
          <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
            <span style="color:var(--admin-muted);">Tax:</span>
            <span>$${(order.tax_amount || 0).toFixed(2)}</span>
          </div>
          ${order.tip_amount ? `
          <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
            <span style="color:var(--admin-muted);">Tip:</span>
            <span>$${(order.tip_amount || 0).toFixed(2)}</span>
          </div>` : ''}
          <div style="display:flex; justify-content:space-between; margin-top:8px; padding-top:8px; border-top:1px solid var(--admin-border); font-size:16px; font-weight:bold; color:var(--admin-gold-light);">
            <span>Total:</span>
            <span>$${(order.total_amount || 0).toFixed(2)}</span>
          </div>
        </div>
      </div>
    `;

    openModal('orderDetailsModal');
  }

  // =========================================================================
  // TAB 4: MENU CATALOG
  // =========================================================================
  async function loadMenu() {
    try {
      const data = await apiCall('menu');
      cachedData.menu = data.menu || [];
      cachedData.categories = data.categories || [];
      renderCategoryFilters();
      renderMenuGrid();
      populateMenuCategorySelect();
    } catch (err) {
      showToast(`Failed to load menu: ${err.message}`, 'error');
    }
  }

  function renderCategoryFilters() {
    const bar = document.getElementById('menuFilterBar');
    if (!bar) return;
    const cats = cachedData.categories;
    bar.innerHTML = `
      <button class="adm-filter-pill active" data-cat="all" onclick="window.tghAdmin.filterMenu('all', this)">All Categories</button>
      ${cats.map(c => `
        <button class="adm-filter-pill" data-cat="${c.id}" onclick="window.tghAdmin.filterMenu('${c.id}', this)">${escapeHtml(c.name_ru || c.name_en)}</button>
      `).join('')}
    `;
  }

  function filterMenu(catId, btn) {
    document.querySelectorAll('#menuFilterBar .adm-filter-pill').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderMenuGrid(catId);
  }

  function renderMenuGrid(selectedCat = 'all') {
    const grid = document.getElementById('menuItemsGrid');
    if (!grid) return;

    let items = cachedData.menu;
    if (selectedCat !== 'all') {
      items = items.filter(m => m.category_id === selectedCat);
    }

    if (items.length === 0) {
      grid.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:48px; color:var(--admin-muted);">No menu items found in this category</div>`;
      return;
    }

    grid.innerHTML = items.map(item => `
      <div class="adm-card" style="margin:0; display:flex; flex-direction:column; justify-content:space-between;">
        <div>
          <div style="position:relative; border-radius:8px; overflow:hidden; margin-bottom:12px; aspect-ratio:16/9; background:#000;">
            <img src="${escapeHtml(item.image_url || '/img/dishes/plov-1100.webp')}" alt="${escapeHtml(item.name_en)}" style="width:100%; height:100%; object-fit:cover;">
            <div style="position:absolute; top:8px; right:8px; display:flex; gap:6px;">
              ${item.is_featured ? `<span class="adm-badge" style="background:var(--admin-gold); color:#000;">Featured</span>` : ''}
              <span class="adm-badge ${item.is_available ? 'badge-ready' : 'badge-cancelled'}">${item.is_available ? 'In Stock' : 'Out of Stock'}</span>
            </div>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:6px;">
            <h4 style="margin:0; font-size:16px; color:var(--admin-gold-light);">${escapeHtml(item.name_ru || item.name_en)}</h4>
            <span style="font-weight:bold; font-size:16px; color:var(--admin-gold);">$${(Number(item.price) || 0).toFixed(2)}</span>
          </div>
          <div style="font-size:13px; color:var(--admin-muted); margin-bottom:8px;">${escapeHtml(item.name_en)}</div>
          <p style="font-size:12px; color:var(--admin-text); line-height:1.4; margin:0 0 12px; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">
            ${escapeHtml(item.description_ru || item.description_en || '')}
          </p>
        </div>

        <div style="display:flex; gap:8px; padding-top:12px; border-top:1px solid var(--admin-border);">
          <button class="adm-btn adm-btn-secondary adm-btn-sm" style="flex:1;" onclick="window.tghAdmin.toggleMenuStock('${item.id}', ${!item.is_available})">
            ${item.is_available ? 'Mark Sold Out' : 'Set Available'}
          </button>
          <button class="adm-btn adm-btn-primary adm-btn-sm" onclick="window.tghAdmin.editMenuItem('${item.id}')">Edit</button>
          <button class="adm-btn adm-btn-danger adm-btn-sm" onclick="window.tghAdmin.deleteMenuItem('${item.id}')">🗑</button>
        </div>
      </div>
    `).join('');
  }

  function populateMenuCategorySelect() {
    const select = document.getElementById('menuFormCategory');
    if (!select) return;
    select.innerHTML = (cachedData.categories || []).map(c => `
      <option value="${c.id}">${escapeHtml(c.name_ru)} (${escapeHtml(c.name_en)})</option>
    `).join('');
  }

  function openAddMenuModal() {
    document.getElementById('menuModalTitle').innerText = 'Add New Menu Dish';
    document.getElementById('menuItemId').value = '';
    document.getElementById('menuForm').reset();
    openModal('menuModal');
  }

  function editMenuItem(id) {
    const item = cachedData.menu.find(m => m.id === id);
    if (!item) return;

    document.getElementById('menuModalTitle').innerText = 'Edit Menu Dish';
    document.getElementById('menuItemId').value = item.id;
    document.getElementById('menuFormNameRu').value = item.name_ru || '';
    document.getElementById('menuFormNameEn').value = item.name_en || '';
    document.getElementById('menuFormPrice').value = item.price || '';
    document.getElementById('menuFormCategory').value = item.category_id || '';
    document.getElementById('menuFormDescRu').value = item.description_ru || '';
    document.getElementById('menuFormDescEn').value = item.description_en || '';
    document.getElementById('menuFormImageUrl').value = item.image_url || '';
    document.getElementById('menuFormTags').value = Array.isArray(item.tags) ? item.tags.join(', ') : (item.tags || '');
    document.getElementById('menuFormAvailable').checked = item.is_available !== false;
    document.getElementById('menuFormFeatured').checked = Boolean(item.is_featured);

    openModal('menuModal');
  }

  async function handleMenuFormSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('menuItemId').value;
    const isEdit = Boolean(id);

    const payload = {
      name_ru: document.getElementById('menuFormNameRu').value.trim(),
      name_en: document.getElementById('menuFormNameEn').value.trim(),
      price: parseFloat(document.getElementById('menuFormPrice').value) || 0,
      category_id: document.getElementById('menuFormCategory').value,
      description_ru: document.getElementById('menuFormDescRu').value.trim(),
      description_en: document.getElementById('menuFormDescEn').value.trim(),
      image_url: document.getElementById('menuFormImageUrl').value.trim() || '/img/dishes/plov-1100.webp',
      tags: document.getElementById('menuFormTags').value.trim(),
      is_available: document.getElementById('menuFormAvailable').checked,
      is_featured: document.getElementById('menuFormFeatured').checked
    };

    try {
      if (isEdit) {
        await apiCall('menu_update', 'POST', { id, data: payload });
        showToast('Menu item updated successfully', 'success');
      } else {
        await apiCall('menu_create', 'POST', { data: payload });
        showToast('Menu item created successfully', 'success');
      }
      closeModal('menuModal');
      loadMenu();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  async function toggleMenuStock(id, newAvailable) {
    try {
      await apiCall('menu_update', 'POST', { id, data: { is_available: newAvailable } });
      showToast(`Dish marked as ${newAvailable ? 'In Stock' : 'Sold Out'}`, 'success');
      loadMenu();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  async function deleteMenuItem(id) {
    if (!confirm('Permanently delete this dish from the menu?')) return;
    try {
      await apiCall('menu_delete', 'POST', { id });
      showToast('Dish removed from menu catalog', 'success');
      loadMenu();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  // =========================================================================
  // TAB 5: RESTAURANT TABLES
  // =========================================================================
  async function loadTables() {
    try {
      const data = await apiCall('tables');
      cachedData.tables = data.tables || [];
      renderTablesList();
    } catch (err) {
      showToast(`Failed to load tables: ${err.message}`, 'error');
    }
  }

  function renderTablesList() {
    const grid = document.getElementById('tablesGrid');
    if (!grid) return;
    const items = cachedData.tables;

    if (items.length === 0) {
      grid.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:48px; color:var(--admin-muted);">No tables defined yet</div>`;
      return;
    }

    grid.innerHTML = items.map(t => `
      <div class="adm-card" style="margin:0;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
          <h3 style="margin:0; font-size:22px; color:var(--admin-gold-light); font-weight:bold;">${escapeHtml(t.table_number)}</h3>
          <span class="adm-badge ${t.is_active ? 'badge-ready' : 'badge-cancelled'}">${t.is_active ? 'Active' : 'Disabled'}</span>
        </div>
        <div style="font-size:13px; color:var(--admin-muted); margin-bottom:14px;">
          <div><strong>Capacity:</strong> ${t.capacity_min} – ${t.capacity_max} guests</div>
          <div><strong>Zone:</strong> <span style="text-transform:capitalize;">${(t.zone || '').replace('_', ' ')}</span></div>
          ${t.description ? `<div style="margin-top:4px;">${escapeHtml(t.description)}</div>` : ''}
        </div>
        <div style="display:flex; gap:8px; padding-top:12px; border-top:1px solid var(--admin-border);">
          <button class="adm-btn adm-btn-secondary adm-btn-sm" style="flex:1;" onclick="window.tghAdmin.toggleTableActive('${t.id}', ${!t.is_active})">
            ${t.is_active ? 'Disable' : 'Activate'}
          </button>
          <button class="adm-btn adm-btn-danger adm-btn-sm" onclick="window.tghAdmin.deleteTable('${t.id}')">🗑</button>
        </div>
      </div>
    `).join('');
  }

  function openAddTableModal() {
    document.getElementById('tableForm').reset();
    openModal('tableModal');
  }

  async function handleTableFormSubmit(e) {
    e.preventDefault();
    const payload = {
      table_number: document.getElementById('tabFormNumber').value.trim(),
      capacity_min: parseInt(document.getElementById('tabFormMin').value) || 1,
      capacity_max: parseInt(document.getElementById('tabFormMax').value) || 4,
      zone: document.getElementById('tabFormZone').value,
      description: document.getElementById('tabFormDesc').value.trim(),
      is_active: document.getElementById('tabFormActive').checked
    };

    try {
      await apiCall('table_create', 'POST', { data: payload });
      showToast('New table created successfully', 'success');
      closeModal('tableModal');
      loadTables();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  async function toggleTableActive(id, newActive) {
    try {
      await apiCall('table_update', 'POST', { id, data: { is_active: newActive } });
      showToast(`Table marked as ${newActive ? 'Active' : 'Disabled'}`, 'success');
      loadTables();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  async function deleteTable(id) {
    if (!confirm('Permanently remove this table?')) return;
    try {
      await apiCall('table_delete', 'POST', { id });
      showToast('Table deleted', 'success');
      loadTables();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  // =========================================================================
  // TAB 6: OPENING HOURS SCHEDULE
  // =========================================================================
  async function loadHours() {
    try {
      const data = await apiCall('hours');
      cachedData.hours = data.hours || [];
      renderHoursForm();
    } catch (err) {
      showToast(`Failed to load schedule: ${err.message}`, 'error');
    }
  }

  function renderHoursForm() {
    const container = document.getElementById('hoursContainer');
    if (!container) return;
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const list = cachedData.hours;

    container.innerHTML = dayNames.map((name, idx) => {
      const row = list.find(h => h.day_of_week === idx) || { open_time: '12:00', close_time: '22:00', is_closed: false };
      return `
        <div style="display:grid; grid-template-columns:120px 140px 140px 1fr; gap:16px; align-items:center; padding:12px 0; border-bottom:1px solid rgba(211,186,116,0.08);">
          <strong style="color:var(--admin-gold-light);">${name}</strong>
          <div>
            <label class="adm-form-label" style="font-size:11px; margin-bottom:2px;">Open</label>
            <input type="time" class="adm-input" id="hrsOpen_${idx}" value="${row.open_time || '12:00'}" ${row.is_closed ? 'disabled' : ''}>
          </div>
          <div>
            <label class="adm-form-label" style="font-size:11px; margin-bottom:2px;">Close</label>
            <input type="time" class="adm-input" id="hrsClose_${idx}" value="${row.close_time || '22:00'}" ${row.is_closed ? 'disabled' : ''}>
          </div>
          <div style="display:flex; align-items:center; gap:8px;">
            <input type="checkbox" id="hrsClosed_${idx}" ${row.is_closed ? 'checked' : ''} onchange="window.tghAdmin.toggleDayClosed(${idx}, this.checked)">
            <label for="hrsClosed_${idx}" style="font-size:13px; color:var(--admin-muted); cursor:pointer;">Closed this day</label>
          </div>
        </div>
      `;
    }).join('');
  }

  function toggleDayClosed(idx, isClosed) {
    const openInput = document.getElementById(`hrsOpen_${idx}`);
    const closeInput = document.getElementById(`hrsClose_${idx}`);
    if (openInput) openInput.disabled = isClosed;
    if (closeInput) closeInput.disabled = isClosed;
  }

  async function saveHoursSchedule(e) {
    e.preventDefault();
    const updated = [];
    for (let i = 0; i <= 6; i++) {
      const isClosed = document.getElementById(`hrsClosed_${i}`)?.checked || false;
      const openTime = document.getElementById(`hrsOpen_${i}`)?.value || '12:00';
      const closeTime = document.getElementById(`hrsClose_${i}`)?.value || '22:00';
      updated.push({
        day_of_week: i,
        open_time: openTime,
        close_time: closeTime,
        is_closed: isClosed
      });
    }

    try {
      await apiCall('update_hours', 'POST', { data: { hours: updated } });
      showToast('Weekly opening hours saved successfully', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  // =========================================================================
  // TAB 7: REVIEWS MODERATION
  // =========================================================================
  async function loadReviews() {
    try {
      const data = await apiCall('reviews');
      cachedData.reviews = data.reviews || [];
      renderReviewsList();
    } catch (err) {
      showToast(`Failed to load reviews: ${err.message}`, 'error');
    }
  }

  function renderReviewsList() {
    const list = document.getElementById('reviewsList');
    if (!list) return;
    const items = cachedData.reviews;

    if (items.length === 0) {
      list.innerHTML = `<div style="text-align:center; padding:48px; color:var(--admin-muted);">No reviews posted yet</div>`;
      return;
    }

    list.innerHTML = items.map(r => `
      <div class="adm-card" style="margin-bottom:16px;">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px;">
          <div>
            <strong style="font-size:16px; color:var(--admin-gold-light);">${escapeHtml(r.author_name)}</strong>
            <div style="color:var(--admin-gold); font-size:14px; margin-top:2px;">
              ${'★'.repeat(r.rating || 5)}${'☆'.repeat(5 - (r.rating || 5))}
            </div>
          </div>
          <div style="display:flex; align-items:center; gap:8px;">
            <span class="adm-badge ${r.is_approved ? 'badge-ready' : 'badge-pending'}">
              ${r.is_approved ? 'Approved' : 'Pending Review'}
            </span>
            <span style="font-size:12px; color:var(--admin-muted);">${formatDateTime(r.created_at)}</span>
          </div>
        </div>
        <p style="font-size:14px; color:var(--admin-text); line-height:1.5; margin:0 0 14px;">
          "${escapeHtml(r.comment)}"
        </p>
        <div style="display:flex; gap:8px; justify-content:flex-end;">
          <button class="adm-btn adm-btn-sm ${r.is_approved ? 'adm-btn-secondary' : 'adm-btn-success'}" onclick="window.tghAdmin.toggleReviewApproval('${r.id}', ${!r.is_approved})">
            ${r.is_approved ? 'Hide Review' : 'Approve Review'}
          </button>
          <button class="adm-btn adm-btn-danger adm-btn-sm" onclick="window.tghAdmin.deleteReview('${r.id}')">Delete</button>
        </div>
      </div>
    `).join('');
  }

  async function toggleReviewApproval(id, isApproved) {
    try {
      await apiCall('review_approve', 'POST', { id, data: { is_approved: isApproved } });
      showToast(`Review ${isApproved ? 'approved for display' : 'hidden from public'}`, 'success');
      loadReviews();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  async function deleteReview(id) {
    if (!confirm('Permanently delete this customer review?')) return;
    try {
      await apiCall('review_delete', 'POST', { id });
      showToast('Review deleted', 'success');
      loadReviews();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  // =========================================================================
  // TAB 8: SETTINGS & TELEGRAM
  // =========================================================================
  async function loadSettings() {
    try {
      const data = await apiCall('settings');
      cachedData.settings = data.settings || {};
      const biz = cachedData.settings.business_status || {};

      const noticeRu = document.getElementById('settNoticeRu');
      const noticeEn = document.getElementById('settNoticeEn');
      const chkBookings = document.getElementById('settChkBookings');
      const chkOrders = document.getElementById('settChkOrders');
      const chkPreopening = document.getElementById('settChkPreopening');

      if (noticeRu) noticeRu.value = biz.preopening_notice_ru || '';
      if (noticeEn) noticeEn.value = biz.preopening_notice_en || '';
      if (chkBookings) chkBookings.checked = Boolean(biz.bookings_enabled);
      if (chkOrders) chkOrders.checked = Boolean(biz.orders_enabled);
      if (chkPreopening) chkPreopening.checked = Boolean(biz.is_preopening);
    } catch (err) {
      showToast(`Failed to load settings: ${err.message}`, 'error');
    }
  }

  async function saveSettings(e) {
    e.preventDefault();
    const biz = {
      is_preopening: document.getElementById('settChkPreopening')?.checked || false,
      bookings_enabled: document.getElementById('settChkBookings')?.checked || false,
      orders_enabled: document.getElementById('settChkOrders')?.checked || false,
      preopening_notice_ru: document.getElementById('settNoticeRu')?.value || '',
      preopening_notice_en: document.getElementById('settNoticeEn')?.value || ''
    };

    try {
      await apiCall('update_settings', 'POST', { data: { key: 'business_status', value: biz } });
      showToast('Operational settings saved successfully', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  async function triggerTelegramTest() {
    const btn = document.getElementById('btnTestTelegram');
    if (btn) btn.disabled = true;

    try {
      showToast('Dispatching Telegram alert test...', 'info');
      const res = await apiCall('test-telegram', 'GET');
      if (res.success) {
        showToast('✓ Telegram alert delivered successfully to your channel/bot!', 'success');
      } else {
        showToast(`Telegram warning: ${res.reason || res.error || 'Check bot configuration'}`, 'error');
      }
    } catch (err) {
      showToast(`Telegram test failed: ${err.message}`, 'error');
    } finally {
      if (btn) btn.disabled = false;
    }
  }

  // --- UTILS & MODALS ---
  function openModal(id) {
    const m = document.getElementById(id);
    if (m) m.classList.add('active');
  }

  function closeModal(id) {
    const m = document.getElementById(id);
    if (m) m.classList.remove('active');
  }

  function formatDateTime(isoStr) {
    if (!isoStr) return '—';
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' ' +
             d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    } catch (_) {
      return isoStr;
    }
  }

  // --- EXPORT TO WINDOW FOR INLINE HANDLERS ---
  window.tghAdmin = {
    updateResStatus,
    deleteRes,
    updateOrdStatus,
    viewOrderDetails,
    filterMenu,
    toggleMenuStock,
    editMenuItem,
    deleteMenuItem,
    openAddMenuModal,
    openAddTableModal,
    toggleTableActive,
    deleteTable,
    toggleDayClosed,
    toggleReviewApproval,
    deleteReview,
    triggerTelegramTest,
    closeModal,
    handleLogout
  };

  // --- INITIALIZATION ---
  document.addEventListener('DOMContentLoaded', () => {
    // Auth Form
    const loginForm = document.getElementById('admLoginForm');
    if (loginForm) loginForm.addEventListener('submit', handleLogin);

    // Logout
    document.querySelectorAll('.btn-admin-logout').forEach(btn => {
      btn.addEventListener('click', handleLogout);
    });

    // Test Telegram buttons
    document.querySelectorAll('.btn-trigger-telegram').forEach(btn => {
      btn.addEventListener('click', triggerTelegramTest);
    });

    // Forms
    document.getElementById('menuForm')?.addEventListener('submit', handleMenuFormSubmit);
    document.getElementById('tableForm')?.addEventListener('submit', handleTableFormSubmit);
    document.getElementById('hoursForm')?.addEventListener('submit', saveHoursSchedule);
    document.getElementById('settingsForm')?.addEventListener('submit', saveSettings);

    // Filter pills
    document.querySelectorAll('#resFilterBar .adm-filter-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#resFilterBar .adm-filter-pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderReservationsTable();
      });
    });

    document.querySelectorAll('#ordFilterBar .adm-filter-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#ordFilterBar .adm-filter-pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderOrdersTable();
      });
    });

    // Search inputs
    document.getElementById('resSearchInput')?.addEventListener('input', renderReservationsTable);
    document.getElementById('ordSearchInput')?.addEventListener('input', renderOrdersTable);

    // Navigation
    setupTabs();

    // Check Auth
    if (adminSecret) {
      showAuthModal(false);
      loadActiveTab();
    } else {
      showAuthModal(true);
    }
  });

})();

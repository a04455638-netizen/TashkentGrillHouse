// Netlify Serverless Function: Telegram Notification Dispatcher
// Dispatches structured Markdown/HTML alerts for bookings and orders

export async function sendTelegramNotification({ type, data }) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId || token === 'AWAITING_CONFIG') {
    console.log(`[Telegram Notice] Bot not configured. Event '${type}' logged locally:`, data);
    return { success: false, reason: 'unconfigured' };
  }

  let text = '';
  if (type === 'new_reservation') {
    text = `✨ <b>НОВАЯ БРОНЬ СТОЛА — Tashkent Grill House</b>\n\n` +
           `🔖 <b>Код:</b> <code>${data.booking_code}</code>\n` +
           `👤 <b>Гость:</b> ${escapeHtml(data.customer_name)}\n` +
           `📞 <b>Телефон:</b> ${escapeHtml(data.customer_phone)}\n` +
           `👥 <b>Гостей:</b> ${data.guest_count} чел.\n` +
           `🕒 <b>Время:</b> ${data.date} в ${data.time}\n` +
           `🪑 <b>Стол:</b> ${data.table_number || 'Автовыбор'}\n` +
           (data.special_requests ? `💬 <b>Пожелания:</b> ${escapeHtml(data.special_requests)}\n` : '');
  } else if (type === 'new_order') {
    text = `🛍️ <b>НОВЫЙ ЗАКАЗ — Tashkent Grill House</b>\n\n` +
           `📦 <b>Номер заказа:</b> <code>${data.order_number}</code>\n` +
           `👤 <b>Клиент:</b> ${escapeHtml(data.customer_name)}\n` +
           `📞 <b>Телефон:</b> ${escapeHtml(data.customer_phone)}\n` +
           `🚗 <b>Тип:</b> ${data.order_type === 'pickup' ? 'Самовывоз' : 'Доставка'}\n` +
           `💰 <b>Итого:</b> $${data.total_amount.toFixed(2)}\n\n` +
           `<b>Состав заказа:</b>\n` +
           (data.items || []).map(i => `• ${escapeHtml(i.name)} × ${i.quantity} ($${i.total.toFixed(2)})`).join('\n') +
           (data.notes ? `\n\n📝 <b>Заметка:</b> ${escapeHtml(data.notes)}` : '');
  } else if (type === 'cancelled_reservation') {
    text = `❌ <b>ОТМЕНА БРОНИ — Tashkent Grill House</b>\n\n` +
           `🔖 <b>Код:</b> <code>${data.booking_code}</code>\n` +
           `👤 <b>Гость:</b> ${escapeHtml(data.customer_name)}\n` +
           `Причина: ${escapeHtml(data.reason || 'Запрос клиента')}`;
  } else {
    text = `ℹ️ <b>Оповещение системы:</b> ${escapeHtml(JSON.stringify(data))}`;
  }

  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'HTML'
      })
    });
    const result = await res.json();
    return { success: result.ok, data: result };
  } catch (err) {
    console.error('[Telegram Error] Failed to send notification:', err.message);
    return { success: false, error: err.message };
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

import { sendTelegramNotification } from '../netlify/functions/telegram-notify.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const payload = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const result = await sendTelegramNotification(payload);
    return res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

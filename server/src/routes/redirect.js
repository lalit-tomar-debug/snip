import Url from '../models/Url.js';
import Click from '../models/Click.js';
import { cacheGet, cacheSet } from '../config/redis.js';

function getBrowser(ua = '') {
  if (/edg/i.test(ua)) return 'Edge';
  if (/chrome/i.test(ua)) return 'Chrome';
  if (/firefox/i.test(ua)) return 'Firefox';
  if (/safari/i.test(ua)) return 'Safari';
  return 'Other';
}

export async function redirect(req, res) {
  try {
    const { code } = req.params;

    // 1. Check Redis (fast), 2. fall back to MongoDB (slower), then cache it
    let target = await cacheGet(code);
    if (!target) {
      const doc = await Url.findOne({ shortCode: code });
      if (!doc) return res.status(404).send('Link not found');
      target = doc.originalUrl;
      await cacheSet(code, target);
    }

    // 302 (temporary) so browsers do not cache it and every click is counted
    res.redirect(302, target);

    // Save the click AFTER responding, so the user never waits for it
    Click.create({
      shortCode: code,
      browser: getBrowser(req.headers['user-agent']),
      referrer: req.get('referer') || 'direct',
    }).catch(() => {});
    Url.updateOne({ shortCode: code }, { $inc: { clicks: 1 } }).catch(() => {});
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
}

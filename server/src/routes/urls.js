import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { nanoid } from 'nanoid';
import Url from '../models/Url.js';
import Click from '../models/Click.js';
import { cacheDel } from '../config/redis.js';

const router = Router();
const BASE = () => process.env.BASE_URL || 'http://localhost:5000';

// Catches errors in async routes so the server never crashes
const wrap = (fn) => (req, res) =>
  fn(req, res).catch((err) => {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  });

// Max 10 new links per minute per IP
const shortenLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  message: { error: 'Too many requests. Try again in a minute.' },
});

function isValidUrl(value) {
  try {
    const u = new URL(value);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

router.post('/shorten', shortenLimiter, wrap(async (req, res) => {
  const { url } = req.body;
  if (!url || !isValidUrl(url)) {
    return res.status(400).json({ error: 'Enter a valid link starting with http:// or https://' });
  }

  // Retry a few times in the rare case the random code already exists
  for (let i = 0; i < 5; i++) {
    const shortCode = nanoid(7);
    try {
      const doc = await Url.create({ originalUrl: url, shortCode });
      return res.status(201).json({ ...doc.toObject(), shortUrl: `${BASE()}/${shortCode}` });
    } catch (err) {
      if (err.code !== 11000) throw err; // 11000 = duplicate key, try again
    }
  }
  res.status(500).json({ error: 'Could not create a short link. Try again.' });
}));

router.get('/links', wrap(async (req, res) => {
  const links = await Url.find().sort({ createdAt: -1 }).limit(50).lean();
  res.json(links.map((l) => ({ ...l, shortUrl: `${BASE()}/${l.shortCode}` })));
}));

router.get('/analytics/:code', wrap(async (req, res) => {
  const { code } = req.params;
  const link = await Url.findOne({ shortCode: code }).lean();
  if (!link) return res.status(404).json({ error: 'Link not found' });

  const [byDay, byBrowser] = await Promise.all([
    // clicks per day: filter -> group by date -> sort
    Click.aggregate([
      { $match: { shortCode: code } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, clicks: { $sum: 1 } } },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, date: '$_id', clicks: 1 } },
    ]),
    // clicks per browser
    Click.aggregate([
      { $match: { shortCode: code } },
      { $group: { _id: '$browser', clicks: { $sum: 1 } } },
      { $sort: { clicks: -1 } },
      { $project: { _id: 0, browser: '$_id', clicks: 1 } },
    ]),
  ]);

  res.json({ link: { ...link, shortUrl: `${BASE()}/${code}` }, byDay, byBrowser });
}));

router.delete('/links/:code', wrap(async (req, res) => {
  const { code } = req.params;
  await Url.deleteOne({ shortCode: code });
  await Click.deleteMany({ shortCode: code });
  await cacheDel(code); // remove from Redis so a deleted link stops working
  res.json({ ok: true });
}));

export default router;

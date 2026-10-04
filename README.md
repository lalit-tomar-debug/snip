# Snip - URL Shortener with Click Analytics

Paste a long link, get a short one with a QR code, and see how many people clicked it.

**Stack:** React (Vite), Node.js, Express, MongoDB (Mongoose), Redis (optional cache), Recharts.

## Features
- Shorten links with random 7-character codes (`nanoid`)
- Fast redirects using a Redis cache, with MongoDB as the source of truth
- Rate limiting: 10 new links per minute per IP
- Click analytics via MongoDB aggregation: clicks per day and per browser
- QR code for every short link, copy button, delete link
- Works without Redis (falls back to MongoDB)

## How it works
1. **Create:** React sends the URL to `POST /api/shorten`. The server validates it, makes a unique code, and saves it in MongoDB.
2. **Open:** `GET /:code` checks Redis first, then MongoDB. It redirects with HTTP 302, then records the click without making the visitor wait.
3. **Stats:** `GET /api/analytics/:code` groups saved clicks with a MongoDB aggregation pipeline, and React draws the charts.

## Folder structure
```
snip/
├── client/            React app (Vite)
│   └── src/components ShortenForm, LinksTable, Analytics
└── server/
    └── src/
        ├── config/    redis.js
        ├── models/    Url.js, Click.js
        └── routes/    urls.js (API), redirect.js
```

## Run locally
You need Node 18+ and MongoDB running locally (or a MongoDB Atlas URL).

```bash
# 1. Server
cd server
cp .env.example .env      # then edit MONGO_URI if needed
npm install
npm run dev               # http://localhost:5000

# 2. Client (new terminal)
cd client
cp .env.example .env
npm install
npm run dev               # http://localhost:5173
```

Optional Redis: `docker run -p 6379:6379 redis`. If Redis is not running, the server logs a message and still works.

## API
| Method | Route | What it does |
|---|---|---|
| POST | `/api/shorten` | Body `{ "url": "https://..." }`, returns the short link |
| GET | `/api/links` | Latest 50 links |
| GET | `/api/analytics/:code` | Clicks per day and per browser |
| DELETE | `/api/links/:code` | Delete a link and its clicks |
| GET | `/:code` | Redirect to the original URL |

## Possible improvements
User login (JWT), custom aliases, link expiry, safe-browsing check, deployment.

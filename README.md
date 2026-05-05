# FUELD — Calorie & Macro Tracker

A mobile-first PWA for tracking daily calories and macros.

## Local Development

```bash
# 1. Install dependencies
npm install

# 2. Create your env file
cp .env.example .env
# Edit .env and set VITE_API_URL to your backend URL

# 3. Start dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.
For the best experience, open in Chrome DevTools with "Responsive" mode set to an iPhone size.

## Deploy to Vercel

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import your repo
3. Set the environment variable:
   - **Name:** `VITE_API_URL`
   - **Value:** your backend URL (e.g. `https://fueld-api.onrender.com`)
4. Click **Deploy** — Vercel detects Vite automatically

## Add to iPhone Home Screen (PWA)

1. Open the deployed URL in **Safari** on your iPhone
2. Tap the **Share** button (box with arrow, bottom of screen)
3. Scroll down and tap **"Add to Home Screen"**
4. Name it **FUELD** and tap **Add**

The app will now launch fullscreen with no browser UI, just like a native app.

## API

Expects a REST API at `VITE_API_URL` with these endpoints:

| Method | Path | Description |
|--------|------|-------------|
| GET | `/foods` | List all foods |
| POST | `/foods` | Create custom food |
| DELETE | `/foods/:id` | Delete custom food |
| GET | `/logs?date=YYYY-MM-DD` | Get log entries for a date |
| GET | `/logs/week?startDate=YYYY-MM-DD` | Get week summary |
| POST | `/logs` | Add log entry `{ foodItemId, quantity, date }` |
| DELETE | `/logs/:id` | Delete log entry |

## Tech Stack

- React 19 + Vite 6
- TypeScript
- React Query (TanStack Query v5) — data fetching & cache
- Axios — HTTP client
- React Router v6
- CSS Modules — scoped styles
- vite-plugin-pwa — PWA support

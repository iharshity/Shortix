# Shortix 🔗

> A sleek full‑stack URL shortener with custom branded slugs, QR‑code generation, real‑time click analytics, and a dark glassmorphism UI.

---

## ✨ Core Features

- **Custom Branded Aliases** – Choose your own short link endings or use auto‑generated Base62 codes.
- **QR Code Generator** – One‑click download of high‑resolution QR codes for any link.
- **Real‑time Click Tracking** – Instant counters displayed on the dashboard.
- **My Links Dashboard** – View, search, edit, and delete your links.
- **Redis‑cached Redirects** – Lightning‑fast 302 redirects with fallback to MongoDB.
- **Secure JWT Authentication** – HTTP‑only cookies, bcrypt password hashing.
- **Health Check Endpoint** – `/health` for uptime monitors (prevents Render free‑tier sleep).
- **Responsive Dark Glass UI** – Optimised for desktop, tablet, and mobile.

---

## 🧱 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite, React Router v7, `qrcode.react` |
| **Backend** | Express 5, Node.js, MongoDB (Mongoose), Redis (`node-redis`) |
| **Auth** | JWT in HTTP‑only cookies, bcrypt |
| **Deploy** | Vercel (Frontend) • Render (Backend) |

---

## 📦 Project Structure

```
Shortix/
├── Backend/
│   ├── src/
│   │   ├── config/       # Mongo & Redis clients
│   │   ├── controllers/  # Auth & URL logic
│   │   ├── middleware/   # Auth verification, rate limiting
│   │   ├── models/       # User, Url, Counter schemas
│   │   ├── routes/       # Auth, URL, redirect, health
│   │   └── app.js        # Express setup
│   └── server.js          # Entry point
├── Frontend/
│   ├── src/
│   │   ├── components/   # ShortenPage, AuthPage, modals
│   │   ├── context/      # Auth & toast contexts
│   │   ├── api.js        # HTTP client wrapper
│   │   ├── App.jsx / App.css
│   │   └── index.css    # Design tokens & dark theme
│   └── vite.config.js
└── README.md
```

---

## 🚀 Deployment Guide

### Backend – Render
1. Create a **Web Service** linked to this repo.
2. Set **Root Directory** to `Backend`.
3. **Build Command:** `npm install`
4. **Start Command:** `npm start`
5. Add environment variables:
   - `NODE_ENV=production`
   - `DB_URL`, `REDIS_URL`, `JWT_SECRET`
   - `PUBLIC_BASE_URL` (your Render URL)
   - `FRONTEND_URL` (your Vercel URL)
6. Deploy. Copy the backend URL (e.g., `https://your-api.onrender.com`).

> **Keep‑alive tip:** Free Render services sleep after 15 min. Schedule a ping to `/health` (e.g., via cron‑job.org or UptimeRobot) every 12 min.

### Frontend – Vercel
1. Import this repository to Vercel.
2. Set **Root Directory** to `Frontend` and select the **Vite** preset.
3. Add environment variable:
   - `VITE_API_URL` = your Render backend URL.
4. Deploy and obtain the live URL.
5. Ensure the backend’s `FRONTEND_URL` matches this Vercel URL for proper CORS & cookie handling.

---

## 📚 Quick Start (Local Development)

```bash
# Backend
cd Backend
cp .env.example .env   # fill in credentials
npm install
npm run dev            # http://localhost:4000

# Frontend
cd ../Frontend
npm install
npm run dev            # http://localhost:5173
```

---

## 🛡️ Security & Audits

Run `npm audit fix` after installation to address known vulnerabilities.

---

*Feel free to explore, star the repo, and contribute!*

> A modern full-stack URL shortener — create, brand, track, and manage short links in seconds.

[![Live Demo](https://img.shields.io/badge/Live_Demo-shortix.eta.vercel.app-06b6d4?style=flat-square&logo=vercel)](https://shortix-eta.vercel.app)

Shortix is a production-ready URL shortener built with user authentication, custom branded slugs, instant QR code generation, real-time click tracking, Redis-cached redirects, and a responsive dark glassmorphism UI.

**Live Demo:** <https://shortix-eta.vercel.app>

---

## ✨ Major Features

- **Custom Branded Aliases**: Choose your own custom short link ending (e.g., `shortix.onrender.com/portfolio`) or use automatic Base62 sequence codes.
- **QR Code Generator**: Generate and download scannable high-resolution QR codes (PNG) for any link with one click.
- **Click Tracking & Analytics**: Tracks total visits in real time across all links, with click counter badges on each link.
- **"My Links" Dashboard**: View all created short links, filter via live search, copy URLs, and monitor engagement.
- **Edit Destination URLs**: Update where any short link points without changing the short code or reprinting QR codes.
- **Delete Management**: Delete short links with an interactive confirmation modal and automatic Redis cache invalidation.
- **Redis Caching**: Ultra-fast 302 redirects served from Redis (with automatic fallback to MongoDB).
- **Secure Authentication**: User accounts with JWT in `httpOnly` cross-site cookies and bcrypt password hashing.
- **Keep-Alive Health Check**: `/health` endpoint for uptime monitors to prevent free-tier servers (like Render) from sleeping.
- **Floating Toast Notifications**: Real-time feedback for copying, shortening, editing, and deleting links.
- **Responsive Dark Glass UI**: Optimized for desktop, tablet, and mobile devices.

---

## 🧱 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite, React Router v7, `qrcode.react` |
| **Backend** | Express 5, Node.js, MongoDB (Mongoose), Redis (`node-redis`) |
| **Authentication** | JWT stored in secure `httpOnly` cookies, bcrypt password hashing |
| **Caching & Rate Limiting** | Redis-backed URL caching (1h TTL) + `express-rate-limit` with Redis store |
| **Deployment** | Vercel (Frontend) & Render (Backend) |

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Create a new user account |
| `POST` | `/api/auth/login` | Log in and receive `httpOnly` session cookie |
| `POST` | `/api/auth/logout` | Clear auth cookie |
| `GET` | `/api/auth/me` | Restore user session on load |

### URL Operations
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/url/shorten` | Shorten URL (accepts `url` and optional `customSlug`) |
| `GET` | `/api/url/my-urls` | Get all short links created by logged-in user |
| `PATCH` | `/api/url/:id` | Update destination URL of an existing short link |
| `DELETE` | `/api/url/:id` | Delete a short link and invalidate cache |

### System & Redirects
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health check endpoint for uptime monitors |
| `GET` | `/:shortCode` | Redirect to original destination URL (Redis cached) |

---

## 📁 Project Structure

```
Shortix/
├── Backend/
│   ├── src/
│   │   ├── config/        # MongoDB & Redis clients
│   │   ├── controllers/   # Auth and URL logic (slugs, clicks, caching)
│   │   ├── middleware/    # Auth verification & rate limiter
│   │   ├── models/        # User, Url, and Counter schemas
│   │   ├── routes/        # Auth, URL, and Redirect routes
│   │   ├── services/      # Redis cache service
│   │   └── app.js         # Express setup & security headers
│   ├── server.js          # Server entry point
│   └── .env.example
├── Frontend/
│   ├── src/
│   │   ├── components/    # ShortenPage, AuthPage, Modals (QR, Edit, Delete)
│   │   ├── context/       # AuthContext, ToastContext
│   │   ├── api.js         # HTTP client wrapper
│   │   ├── App.jsx / App.css
│   │   └── index.css      # Design tokens & dark glass theme
│   ├── index.html
│   └── vite.config.js
└── README.md
```

---

## 🛠 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas database (or local MongoDB)
- Redis Cloud instance (or local Redis)

### 1. Setup Backend

```bash
cd Backend
cp .env.example .env       # fill in your MongoDB and Redis credentials
npm install
npm run dev                # runs on http://localhost:4000
```

### 2. Setup Frontend

```bash
cd ../Frontend
npm install
npm run dev                # runs on http://localhost:5173
```

---

## 🔐 Environment Variables

See [Backend/.env.example](Backend/.env.example) for reference:

| Variable | Description |
|---|---|
| `DB_URL` | MongoDB connection string |
| `REDIS_URL` | Redis connection string |
| `JWT_SECRET` | Secret key for JWT signing |
| `PUBLIC_BASE_URL` | Public backend URL (used to prefix short links) |
| `FRONTEND_URL` | Frontend URL for CORS allowance |
| `NODE_ENV` | Set to `production` in production deployment |
| `PORT` | Backend port (default `4000`) |

---

## ☁️ Deployment

### Backend — Render
1. Create a new **Web Service** on Render connected to this repository.
2. Settings:
   - **Root Directory:** `Backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
3. Add environment variables: `NODE_ENV=production`, `DB_URL`, `REDIS_URL`, `JWT_SECRET`, `PUBLIC_BASE_URL`, `FRONTEND_URL`.
4. Deploy and copy your backend URL (e.g., `https://your-api.onrender.com`).

> **Tip (Free Tier Keep-Alive):** Free Render instances sleep after 15 minutes of inactivity. Set up a free cron job on [cron-job.org](https://cron-job.org) or UptimeRobot to ping `https://your-api.onrender.com/health` every 12 minutes to keep it awake!

### Frontend — Vercel
1. Import repository on Vercel.
2. Settings:
   - **Root Directory:** `Frontend`
   - **Framework Preset:** `Vite`
3. Add environment variable:
   - `VITE_API_URL` = `https://your-api.onrender.com`
4. Deploy and copy your live frontend URL.
5. In Render, ensure `FRONTEND_URL` matches your Vercel URL so cross-origin cookies work properly.

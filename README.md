# Shortix 🔗

> A modern full-stack URL shortener — create, brand, track, and manage short links in seconds.

[![Live Demo](https://img.shields.io/badge/Live_Demo-shortix--eta.vercel.app-06b6d4?style=flat-square&logo=vercel)](https://shortix-eta.vercel.app)

Shortix is a production-ready URL shortener built with user authentication, custom branded slugs, instant QR code generation, real-time click tracking, Redis-cached redirects, and a responsive dark glassmorphism UI.

**Live Demo:** <https://shortix-eta.vercel.app>

---

## ✨ Features

- **Custom Branded Aliases** — Choose your own short link ending (e.g., `shortix.onrender.com/portfolio`) or use auto-generated Base62 codes (6-char).
- **QR Code Generator** — Generate and download high-resolution QR codes (PNG) for any link with one click.
- **Real-time Click Tracking** — Every redirect increments the click counter; badges show live engagement on the dashboard.
- **"My Links" Dashboard** — View, search, copy, edit, and delete all your short links in one place.
- **Edit Destination URLs** — Update where a short link points without changing the short code or reprinting QR codes.
- **Delete with Confirmation** — Glassmorphism confirmation modal with automatic Redis cache invalidation.
- **Redis-cached Redirects** — Ultra-fast 302 redirects served from Redis (1 h TTL) with automatic fallback to MongoDB.
- **Secure JWT Authentication** — User accounts with JWT stored in `httpOnly` cross-site cookies and bcrypt password hashing.
- **Rate Limiting** — Auth and shorten endpoints protected with `express-rate-limit` backed by a hybrid Redis / MemoryStore.
- **Security Headers** — `X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`, and `Referrer-Policy` set on every response.
- **SSRF Protection** — URL validation blocks `localhost`, `127.0.0.1`, `::1`, and `.local` destinations.
- **Reserved Slug Guard** — System paths (`api`, `health`, `admin`, …) cannot be used as custom aliases.
- **Keep-Alive Health Check** — `/health` endpoint for uptime monitors to prevent free-tier servers from sleeping.
- **Floating Toast Notifications** — Real-time feedback for copying, shortening, editing, and deleting links.
- **Responsive Dark Glass UI** — Neon-accented glassmorphism design optimized for desktop, tablet, and mobile.

---

## 🧱 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite, React Router v7, `qrcode.react` |
| **Backend** | Express 5, Node.js, MongoDB (Mongoose), Redis (`node-redis`) |
| **Authentication** | JWT in secure `httpOnly` cookies, bcrypt password hashing |
| **Caching & Rate Limiting** | Redis-backed URL cache (1 h TTL) + `express-rate-limit` with Redis store |
| **Deployment** | Vercel (Frontend) & Render (Backend) |

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Create a new user account |
| `POST` | `/api/auth/login` | Log in and receive `httpOnly` session cookie |
| `POST` | `/api/auth/logout` | Clear auth cookie |
| `GET` | `/api/auth/me` | Restore user session on page load |

### URL Operations
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/url/shorten` | Shorten a URL (accepts `url` and optional `customSlug`) |
| `GET` | `/api/url/my-urls` | Get all short links created by the logged-in user |
| `PATCH` | `/api/url/:id` | Update the destination URL of an existing short link |
| `DELETE` | `/api/url/:id` | Delete a short link and invalidate its Redis cache |

### System & Redirects
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health check endpoint for uptime monitors |
| `GET` | `/:shortCode` | Redirect to the original destination URL (Redis cached) |

---

## 📁 Project Structure

```
Shortix/
├── Backend/
│   ├── src/
│   │   ├── config/        # MongoDB & Redis client setup
│   │   ├── controllers/   # Auth and URL logic (slugs, clicks, caching)
│   │   ├── middleware/     # Auth verification & rate limiter
│   │   ├── models/        # User, Url, and Counter schemas
│   │   ├── routes/        # Auth, URL, and Redirect routes
│   │   ├── services/      # Redis cache service
│   │   ├── utils/         # Base62 encoder
│   │   └── app.js         # Express setup & security headers
│   ├── server.js          # Server entry point
│   └── .env.example
├── Frontend/
│   ├── src/
│   │   ├── components/    # ShortenPage, AuthPage, QRCodeModal, EditUrlModal,
│   │   │                  # ConfirmDeleteModal, LoadingScreen, ProtectedRoute
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
| `JWT_SECRET` | Secret key for JWT signing (use a long random string) |
| `PUBLIC_BASE_URL` | Public backend URL (used to prefix short links) |
| `FRONTEND_URL` | Frontend URL for CORS allowance |
| `NODE_ENV` | Set to `production` in production deployments |
| `PORT` | Backend port (default `4000`, Render injects its own) |

---

## ☁️ Deployment

### Backend — Render
1. Create a new **Web Service** on Render connected to this repository.
2. Settings:
   - **Root Directory:** `Backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
3. Add environment variables: `NODE_ENV=production`, `DB_URL`, `REDIS_URL`, `JWT_SECRET`, `PUBLIC_BASE_URL`, `FRONTEND_URL`.
4. Deploy and copy your backend URL (e.g., `https://shortix-api.onrender.com`).

> **Keep-Alive Tip:** Free Render instances sleep after 15 min of inactivity. Set up a free cron job on [cron-job.org](https://cron-job.org) or UptimeRobot to ping `https://your-api.onrender.com/health` every 12 minutes.

### Frontend — Vercel
1. Import this repository on Vercel.
2. Settings:
   - **Root Directory:** `Frontend`
   - **Framework Preset:** `Vite`
3. Add environment variable:
   - `VITE_API_URL` = `https://your-api.onrender.com`
4. Deploy and copy your live frontend URL.
5. In Render, ensure `FRONTEND_URL` matches your Vercel URL so cross-origin cookies work properly.

> **Note:** In production the backend sets `SameSite=None` on the auth cookie so login works across the Vercel → Render domains.

---

## 🛡️ Security

- **httpOnly JWT cookies** — tokens are never exposed to client-side JavaScript.
- **bcrypt password hashing** — passwords are salted and hashed before storage.
- **Security headers** — `X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`, `Referrer-Policy` on every response.
- **SSRF protection** — blocks redirects to internal hosts (`localhost`, `127.0.0.1`, `::1`, `.local`).
- **Rate limiting** — auth and shorten endpoints are rate-limited to prevent abuse.
- Run `npm audit fix` after installation to address known dependency vulnerabilities.

---

## 🤝 Contributing

Contributions are welcome! Fork the repository, create a feature branch, and open a pull request.

---

*Feel free to explore, star the repo ⭐, and contribute!*

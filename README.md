# Shortix 🔗

> A modern full-stack URL shortener — create, share, and track short links in seconds.

[![Live Demo](https://img.shields.io/badge/Live_Demo-shortix.eta.vercel.app-06b6d4?style=flat-square&logo=vercel)](https://shortix-eta.vercel.app)

Shortix is a production-ready URL shortener with user accounts, Redis-cached redirects, rate limiting, and a dark glass UI with neon accents.

**Live app:** <https://shortix-eta.vercel.app>

## ✨ Features

- User registration & login with JWT **httpOnly cookies**
- URL shortening via atomic counter + base62 encoding (6-char codes)
- **Redis-cached redirects** (1h TTL) with automatic fallback to MongoDB
- Rate limiting on auth & shorten endpoints
- Session restore on page reload (`/api/auth/me`)

## 🧱 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Express 5, MongoDB (Mongoose), Redis (node-redis), JWT auth |
| **Frontend** | React 19, Vite, React Router v7 |
| **Auth** | JWT in httpOnly cookies, bcrypt password hashing |
| **Caching** | Redis-backed URL cache (1h TTL), graceful degradation |
| **Rate Limiting** | express-rate-limit with hybrid Redis/MemoryStore |

## 📁 Project Structure

```
Shortix/
├── Backend/
│   ├── src/
│   │   ├── config/        # DB, Redis, env
│   │   ├── controllers/   # Auth, URL logic
│   │   ├── middleware/    # Auth, rate limiter
│   │   ├── models/        # User, Url schemas
│   │   ├── routes/        # API + redirect routes
│   │   └── app.js         # Express app setup
│   ├── server.js          # Entry point
│   └── .env.example
├── Frontend/
│   ├── src/
│   │   ├── components/    # AuthPage, ShortenPage, ProtectedRoute
│   │   ├── context/       # AuthContext
│   │   ├── api.js         # Fetch wrapper
│   │   ├── App.jsx / App.css
│   │   └── index.css      # Theme variables
│   └── vite.config.js
└── README.md
```

## 🛠 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Redis Cloud account (or local Redis)

### Backend

```bash
cd Backend
cp .env.example .env       # fill in your credentials
npm install
npm run dev                # http://localhost:4000
```

### Frontend

```bash
cd Frontend
npm install
npm run dev                # http://localhost:5173
```

## 🔐 Environment Variables

See [Backend/.env.example](Backend/.env.example) for all required variables.

| Variable | Description |
|----------|-------------|
| `DB_URL` | MongoDB Atlas connection string |
| `REDIS_URL` | Redis Cloud connection string |
| `JWT_SECRET` | Secret key for JWT signing (use a long random string) |
| `PUBLIC_BASE_URL` | Backend public URL (short links point here) |
| `FRONTEND_URL` | Frontend URL for CORS |
| `NODE_ENV` | `production` on deployed servers |
| `PORT` | Backend port (Render injects this) |

## ☁️ Deployment

### Backend — Render

1. Render → **New → Web Service** → connect the GitHub repo.
2. **Root Directory:** `Backend` · **Build:** `npm install` · **Start:** `npm start`.
3. Add env vars: `NODE_ENV=production`, `DB_URL`, `REDIS_URL`, `JWT_SECRET`, `PUBLIC_BASE_URL`, `FRONTEND_URL`.
4. **Deploy**, then copy your URL (e.g. `https://shortix-api.onrender.com`).

### Frontend — Vercel

1. Vercel → **Add New → Project** → import the same repo.
2. **Root Directory:** `Frontend` · Framework: **Vite**.
3. Add env var `VITE_API_URL = <your Render URL>` (must be set before the build).
4. **Deploy**, then copy your URL (e.g. `https://shortix.vercel.app`).

### Final wiring

Back on Render, set:
- `PUBLIC_BASE_URL = <Render URL>` — the base of your short links
- `FRONTEND_URL = <Vercel URL>` — so CORS allows the frontend

Then **Manual Deploy** once more.

> **Note:** in production the backend sets `SameSite=None` on the auth cookie so login works across the Vercel → Render domains.

## 📦 API Endpoints

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login`    | Log in and receive JWT cookie |
| `POST` | `/api/auth/logout`   | Clear auth cookie |
| `GET`  | `/api/auth/me`       | Restore session |

### URL Operations
| Method | Endpoint | Description |
|---|---|---|
| `POST`   | `/api/url/shorten` | Shorten a URL (optional custom slug) |
| `GET`    | `/api/url/my-urls` | List user's short URLs |
| `PATCH`  | `/api/url/:id`     | Update destination URL |
| `DELETE` | `/api/url/:id`     | Delete a short link |

### System & Redirects
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health check for uptime monitors |
| `GET` | `/:shortCode` | Redirect to original URL (Redis cached) |

## 🤝 Contributing

Contributions are welcome! Fork the repository, create a feature branch, and open a pull request. Please ensure code follows existing style and run `npm test` (if tests exist) before submitting.

## 📄 License

This project is licensed under the MIT License – see the `LICENSE` file for details.

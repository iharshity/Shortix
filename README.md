# URL Shortener

A full-stack URL shortener built with Express, MongoDB, Redis, and React.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Express 5, MongoDB (Mongoose), Redis (node-redis), JWT auth |
| **Frontend** | React 19, Vite, React Router v7 |
| **Auth** | JWT in httpOnly cookies, bcrypt password hashing |
| **Caching** | Redis-backed URL cache (1h TTL) with graceful degradation |
| **Rate Limiting** | express-rate-limit with hybrid Redis/MemoryStore |

## Features

- User registration & login with JWT httpOnly cookies
- URL shortening with atomic counter + base62 encoding
- Redis-cached redirects (auto-fallback to MongoDB)
- Rate limiting on auth & shorten endpoints
- Session restore on page reload (`/api/auth/me`)
- iOS 18 glass UI with cyan accent theme

## Project Structure

```
URL_Shortener/
├── Backend/
│   ├── src/
│   │   ├── config/        # DB, Redis, env
│   │   ├── controllers/   # Auth, URL logic
│   │   ├── middleware/     # Auth, rate limiter
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

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Redis Cloud account (or local Redis)

### Backend

```bash
cd Backend
cp .env.example .env       # fill in your credentials
npm install
npm run dev                 # http://localhost:4000
```

### Frontend

```bash
cd Frontend
npm install --include=dev
npm run dev                 # http://localhost:5173
```

## Environment Variables

See [Backend/.env.example](Backend/.env.example) for all required variables.

| Variable | Description |
|----------|-------------|
| `DB_URL` | MongoDB Atlas connection string |
| `REDIS_URL` | Redis Cloud connection string |
| `JWT_SECRET` | Secret key for JWT signing |
| `PUBLIC_BASE_URL` | Backend public URL (e.g. `https://api.example.com`) |
| `FRONTEND_URL` | Frontend URL for CORS (e.g. `https://yourapp.vercel.app`) |

## License

MIT

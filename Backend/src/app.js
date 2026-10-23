const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const app = express();
const authRouter = require('./routes/auth.route');
const urlRouter = require('./routes/url.routes');
const redirectRouter = require('./routes/redirect.route');

const FRONTEND_ORIGIN = process.env.FRONTEND_URL || 'http://localhost:5173';

app.use(express.json());
app.use(cookieParser());

// Security headers: protect against clickjacking, MIME sniffing, XSS, and referrer leaks
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
});

// The frontend runs on a different origin (Vite default port 5173), so the API
// must allow cross-origin requests and send credentials (auth uses an httpOnly cookie).
app.use(
    cors({
        origin: FRONTEND_ORIGIN,
        credentials: true,
    })
);

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

app.use('/api/auth', authRouter);
app.use('/api/url', urlRouter);
app.use('/', redirectRouter);

module.exports = app;

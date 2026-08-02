const { Router } = require('express');
const { shortenUrl } = require('../controllers/url.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { shortenLimiter } = require('../middleware/rateLimiter.middleware');

const urlRouter = Router();

urlRouter.post('/shorten', shortenLimiter, authenticate, shortenUrl);

module.exports = urlRouter;

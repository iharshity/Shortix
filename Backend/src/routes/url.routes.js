const { Router } = require('express');
const { shortenUrl, getUserUrls, deleteUrl } = require('../controllers/url.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { shortenLimiter } = require('../middleware/rateLimiter.middleware');

const urlRouter = Router();

urlRouter.post('/shorten', shortenLimiter, authenticate, shortenUrl);
urlRouter.get('/my-urls', authenticate, getUserUrls);
urlRouter.delete('/:id', authenticate, deleteUrl);

module.exports = urlRouter;

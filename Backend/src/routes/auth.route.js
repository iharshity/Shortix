const { Router } = require('express');
const { registerUser, loginUser, logoutUser, getCurrentUser } = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { registerLimiter, loginLimiter } = require('../middleware/rateLimiter.middleware');

const authRouter = Router();

authRouter.post('/register', registerLimiter, registerUser);
authRouter.post('/login', loginLimiter, loginUser);
authRouter.post('/logout', logoutUser);
authRouter.get('/me', authenticate, getCurrentUser);

module.exports = authRouter;

const { Router } = require('express');
const redirectRouter = Router();
const { redirectUrl } = require('../controllers/url.controller')

redirectRouter.get('/:shortCode',redirectUrl);

module.exports = redirectRouter;
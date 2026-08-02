const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

async function authenticate(req, res, next) {
    if (!process.env.JWT_SECRET) {
        console.error('JWT_SECRET is not configured.');
        return res.status(500).json({
            success: false,
            message: 'Internal server error.',
        });
    }

    const token = req.cookies?.access_token;

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Authentication is required.',
        });
    }

    let payload;

    try {
        payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired access token.',
        });
    }

    if (typeof payload !== 'object' || !payload.sub) {
        return res.status(401).json({
            success: false,
            message: 'Invalid access token.',
        });
    }

    try {
        const user = await User.findById(payload.sub).select('_id username email');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User account no longer exists.',
            });
        }

        req.user = {
            id: user._id.toString(),
            username: user.username,
            email: user.email,
        };

        return next();
    } catch (error) {
        console.error('Failed to authenticate user:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error.',
        });
    }
}

module.exports = { authenticate };

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const configuredSaltRounds = Number.parseInt(process.env.BCRYPT_SALT_ROUNDS, 10);
const PASSWORD_SALT_ROUNDS = configuredSaltRounds >= 10 && configuredSaltRounds <= 14
    ? configuredSaltRounds
    : 12;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const configuredCookieMaxAge = Number.parseInt(process.env.JWT_COOKIE_MAX_AGE_MS, 10);
const JWT_COOKIE_MAX_AGE_MS = configuredCookieMaxAge > 0
    ? configuredCookieMaxAge
    : 7 * 24 * 60 * 60 * 1000;

function getAuthCookieOptions() {
    return {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        // 'none' in production so the httpOnly cookie survives cross-site
        // requests (Vercel frontend -> Render backend); 'lax' is fine in dev
        // where the Vite proxy makes everything same-origin.
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: JWT_COOKIE_MAX_AGE_MS,
        path: '/',
    };
}

async function registerUser(req, res) {
    const { username, email, password } = req.body;

    if (
        typeof username !== 'string' ||
        typeof email !== 'string' ||
        typeof password !== 'string' ||
        password.length < 8
    ) {
        return res.status(400).json({
            success: false,
            message: 'Username, email, and a password of at least 8 characters are required.',
        });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, PASSWORD_SALT_ROUNDS);
        const user = await User.create({
            username,
            email,
            password: hashedPassword,
        });

        return res.status(201).json({
            success: true,
            data: {
                id: user._id,
                username: user.username,
                email: user.email,
                createdAt: user.createdAt,
            },
        });
    } catch (error) {
        if (error.code === 11000) {
            const duplicateField = Object.keys(error.keyPattern || {})[0] || 'value';

            return res.status(409).json({
                success: false,
                message: `A user with this ${duplicateField} already exists.`,
            });
        }

        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: Object.values(error.errors)
                    .map((validationError) => validationError.message)
                    .join(' '),
            });
        }

        console.error('Failed to register user:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error.',
        });
    }
}

async function loginUser(req, res) {
    const { email, password } = req.body;

    if (typeof email !== 'string' || typeof password !== 'string') {
        return res.status(400).json({
            success: false,
            message: 'Email and password are required.',
        });
    }

    try {
        const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password.',
            });
        }

        const passwordMatches = await bcrypt.compare(password, user.password);

        if (!passwordMatches) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password.',
            });
        }

        if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET is not configured.');
            return res.status(500).json({
                success: false,
                message: 'Internal server error.',
            });
        }

        const token = jwt.sign(
            {
                sub: user._id.toString(),
                username: user.username,
            },
            process.env.JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        res.cookie('access_token', token, getAuthCookieOptions());

        return res.status(200).json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                },
            },
        });
    } catch (error) {
        console.error('Failed to log in user:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error.',
        });
    }
}

function logoutUser(req, res) {
    const { maxAge, ...clearCookieOptions } = getAuthCookieOptions();
    res.clearCookie('access_token', clearCookieOptions);
    return res.status(204).send();
}

// Protected by the authenticate middleware, which already populates req.user.
function getCurrentUser(req, res) {
    return res.status(200).json({
        success: true,
        data: {
            user: req.user,
        },
    });
}

module.exports = { registerUser, loginUser, logoutUser, getCurrentUser };

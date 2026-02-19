const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const EMAIL_DOMAIN = '@pccoepune.org';

/**
 * Verify Google Token and check if user exists
 * Returns: { exists: boolean, email: string, name: string }
 */
exports.checkGoogleUser = async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({ message: 'Google token is required' });
        }

        // Verify Google token
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const email = payload.email.toLowerCase();
        const name = payload.name;

        // Check if email is from allowed domain
        if (!email.endsWith(EMAIL_DOMAIN)) {
            return res.status(403).json({
                message: 'Only @pccoepune.org email addresses are allowed'
            });
        }

        // Check if user exists
        const result = await pool.query(
            'SELECT id, name, email, role, department, prn, is_active FROM users WHERE LOWER(email) = $1',
            [email]
        );

        if (result.rows.length > 0) {
            const user = result.rows[0];

            if (!user.is_active) {
                return res.status(403).json({ message: "Account disabled or deactivated" });
            }

            // User exists - return user data for login
            const authToken = jwt.sign(
                { id: user.id, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: '1d' }
            );

            return res.json({
                exists: true,
                token: authToken,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    department: user.department,
                    prn: user.prn
                }
            });
        } else {
            // New user - needs to complete registration
            return res.json({
                exists: false,
                email,
                name
            });
        }
    } catch (error) {
        console.error('Google auth check error:', error);

        if (error.message && error.message.includes('Token')) {
            return res.status(401).json({ message: 'Invalid Google token' });
        }

        res.status(500).json({ message: 'Authentication failed' });
    }
};

/**
 * Register new user with Google Auth
 * Requires: token, prn, department
 */
exports.registerGoogleUser = async (req, res) => {
    try {
        const { token, prn, department } = req.body;

        if (!token || !prn || !department) {
            return res.status(400).json({
                message: 'Google token, PRN, and department are required'
            });
        }

        // Verify Google token
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const email = payload.email.toLowerCase();
        const name = payload.name;

        // Check if email is from allowed domain
        if (!email.endsWith(EMAIL_DOMAIN)) {
            return res.status(403).json({
                message: 'Only @pccoepune.org email addresses are allowed'
            });
        }

        // Check if user already exists
        const existingUser = await pool.query(
            'SELECT id FROM users WHERE LOWER(email) = $1',
            [email]
        );

        if (existingUser.rows.length > 0) {
            return res.status(409).json({ message: 'User already exists' });
        }

        // Check if PRN is already taken
        const existingPRN = await pool.query(
            'SELECT id FROM users WHERE prn = $1',
            [prn]
        );

        if (existingPRN.rows.length > 0) {
            return res.status(409).json({ message: 'PRN already registered' });
        }

        // Create new user (password is set to a random string since they'll use Google Auth)
        const randomPassword = require('crypto').randomBytes(32).toString('hex');
        const bcrypt = require('bcrypt');
        const hashedPassword = await bcrypt.hash(randomPassword, 10);

        const result = await pool.query(
            `INSERT INTO users (name, email, password, role, department, prn, google_id)
       VALUES ($1, $2, $3, 'FACULTY', $4, $5, $6)
       RETURNING id, name, email, role, department, prn, google_id`,
            [name, email, hashedPassword, department, prn, payload.sub]
        );

        const user = result.rows[0];

        // Generate JWT token
        const authToken = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.status(201).json({
            message: 'Registration successful',
            token: authToken,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department,
                prn: user.prn
            },
            needsBankDetails: true // Flag to show toast notification
        });
    } catch (error) {
        console.error('Google registration error:', error);

        if (error.message && error.message.includes('Token')) {
            return res.status(401).json({ message: 'Invalid Google token' });
        }

        res.status(500).json({ message: 'Registration failed' });
    }
};

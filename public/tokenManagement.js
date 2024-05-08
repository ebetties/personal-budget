const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('./models/User'); // Assuming you have a User model

// Function to generate JWT token
function generateAuthToken(user) {
    return jwt.sign({ userId: user.id, userEmail: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' }); // Token expires in 1 hour
}

// Function to refresh JWT token
function refreshToken(req, res) {
    // Get the current user from request (assuming it's set in middleware)
    const user = req.user;

    // Generate a new JWT token for the user
    const token = generateAuthToken(user);

    // Set the new JWT token in cookie
    res.cookie('authToken', token, { httpOnly: true, sameSite: 'None', secure: true }); // Secure cookie

    // Send response
    res.json({ message: 'Token refreshed', token });
}
// Login endpoint
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const token = generateAuthToken(user);

        res.cookie('authToken', token, { httpOnly: true, sameSite: 'None', secure: true }); // Secure cookie

        res.json({ message: 'Login successful', token });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Signup endpoint
router.post('/signup', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const newUser = new User({ email, password: hashedPassword });
        await newUser.save();

        // Generate JWT token
        const token = generateAuthToken(newUser);

        // Set JWT token in cookie
        res.cookie('authToken', token, { httpOnly: true, sameSite: 'None', secure: true }); // Secure cookie

        // Send response
        res.status(201).json({ message: 'Signup successful', token });
    } catch (error) {
        console.error('Error signing up:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Refresh token endpoint
router.post('/refresh-token', refreshToken);

module.exports = router;

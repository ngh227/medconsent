// src/routes/auth/staff.route.js
// HANDLES STAFF AUTHENTICATION THROUGH DOCUSIGN
const express = require('express');
const router = express.Router();
const { getJWTToken, getAuthorizationCodeToken } = require('../../services/docusign/auth.service');
const User = require('../../models/user.model');

// Authorization Code Grant for staff logins
router.get('/auth/staff/login', (req, res) => {
    try {
        const scopes = 'signature impersonation';
        const authURL = `https://${process.env.AUTH_SERVER}/oauth/auth?` +
            `response_type=code&` +
            `scope=${encodeURIComponent(scopes)}&` +
            `client_id=${process.env.CLIENT_ID}&` +
            `redirect_uri=${encodeURIComponent(process.env.REDIRECT_URI)}`;

        res.redirect(authURL);
    } catch (error) {
        console.error('Error Initializing auth flow: ', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// DocuSign Staff callback
router.get('/auth/staff/callback', async (req, res) => {
    try {
        const { code } = req.query;
        const apiClient = new docusign.ApiClient();
        apiClient.setOAuthBasePath(process.env.AUTH_SERVER);

        const response = await apiClient.generateAccessToken(
            process.env.CLIENT_ID,
            process.env.SECRET_KEY,
            code
        );

        // Get user info from DocuSign
        const userInfo = await apiClient.getUserInfo(response.accessToken);

        // Find or create staff user
        let staffUser = await User.findOne({ email: userInfo.email });
        if (!staffUser) {
            staffUser = await User.create({
                email: userInfo.email,
                name: userInfo.name,
                role: 'staff',
                staffId: userInfo.sub
            });
        }

        // Set session
        req.session.userId = staffUser._id;
        req.session.accessToken = response.accessToken;
        req.session.refreshToken = response.refreshToken;
        req.session.accountId = userInfo.accounts[0].accountId;

        res.redirect('/staff/dashboard');
    } catch (error) {
        console.error('Auth callback error:', error);
        res.redirect('/error');
    }
});

module.exports = router;
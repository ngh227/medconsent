// routes/auth.js
const express = require('express');
const { getJWTToken, getAuthorizationCodeToken, refreshToken } = require('../utils/auth');
const router = express.Router();
const docusign = require('docusign-esign');

router.get('/auth/jwt', async (req, res) => {
    try {
        const result = await getJWTToken();
        
        res.json({
            success: true,
            access_token: result.accessToken,
            expires_in: result.expiresIn
        });
    } catch (error) {
        console.error('Auth endpoint error:', {
            message: error.message,
            response: error.response?.body
        });

        if (error.response?.body?.error === 'consent_required') {
            return res.status(403).json({
                error: 'consent_required',
                message: 'DocuSign consent required',
                consentUrl: error.consentUrl
            });
        }

        res.status(500).json({
            success: false,
            error: error.message,
            details: error.response?.body || 'Unknown error'
        });
    }
});

// Authorization Code Grant for staff logins
router.get('/auth/docusign', (req, res) => {
    try {
        const scopes = 'signature impersonation';
        const authURL = `https://${process.env.AUTH_SERVER}/oauth/auth?` +
            `response_type=code&` +
            `scope=${encodeURIComponent(scopes)}&` +
            `client_id=${process.env.CLIENT_ID}&` +
            `redirect_uri=${encodeURIComponent(process.env.REDIRECT_URI)}`;

        res.redirect(authURL);
    } catch (error){
        console.error('Error Initializing auth flow: ', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Handling callback
router.get('/auth/callback', async (req, res) => {
    const { code } = req.query;
    try {
        console.log('Received code:', code);  // Log code nhận được
        console.log('Auth flow - Step 1: Received code');
        // Tạo API client
        const apiClient = new docusign.ApiClient();
        apiClient.setOAuthBasePath(process.env.AUTH_SERVER);
        
        console.log('Generating token...'); // Log bước generate token
        const response = await apiClient.generateAccessToken(
            process.env.CLIENT_ID,
            process.env.SECRET_KEY,
            code
        );
        console.log('Token response:', response); // Log response

        // Store tokens in session
        req.session.accessToken = response.accessToken;
        req.session.refreshToken = response.refreshToken;

        // Get user info
        console.log('Getting user info...'); // Log bước get user info
        const userInfo = await apiClient.getUserInfo(response.accessToken);
        console.log('User info:', userInfo); // Log user info
        
        req.session.accountId = userInfo.accounts[0].accountId;

        // Log session data
        console.log('Session data:', {
            hasAccessToken: !!req.session.accessToken,
            hasRefreshToken: !!req.session.refreshToken,
            hasAccountId: !!req.session.accountId
        });

        res.json({
            success: true,
            message: 'Login successful',
            accountId: req.session.accountId
        });
    } catch (error) {
        console.error('Callback error details:', {
            message: error.message,
            stack: error.stack,
            response: error.response?.data,
            status: error.response?.status
        });
        
        res.status(500).json({
            error: 'Authentication failed',
            details: error.message,
            stack: error.stack
        });
    }
});

// refresh access token
router.post('/auth/refresh', async (req, res) => {
    const { refreshToken } = req.body;
    console.log('refreshToken: ', refreshToken);
    if (!refreshToken){
        return res.status(400).json({
            success: false,
            error: 'Refresh token is required'
        });
    }

    try {
        const refreshedTokenData = await refreshToken(refreshToken);
        res.json({
            success: true,
            accessToken: refreshedTokenData.accessToken,
            refreshToken: refreshedTokenData.refreshToken,
            expiresIn: refreshedTokenData.expiresIn
        });
    } catch(error){
        console.error('Error refreshing token: ', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;

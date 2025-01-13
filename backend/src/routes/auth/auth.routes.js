// src/routes/auth/auth.routes.js
const express = require('express');
const router = express.Router();
const docusign = require('docusign-esign');

const authService = require('../../services/docusign/auth.service');


// DocuSign JWT authentication
router.get('/auth/jwt', async (req, res) => {
  try {
    const result = await authService.getJWTToken();
    res.json({
      success: true,
      access_token: result.accessToken,
      expires_in: result.expiresIn
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// DocuSign OAuth callback handler
router.get('/auth/callback', async (req, res) => {
  const { code } = req.query;
  try {
    console.log('Processing OAuth callback...');
    
    const apiClient = new docusign.ApiClient();
    apiClient.setOAuthBasePath(process.env.AUTH_SERVER);
    
    // Generate access token
    const response = await apiClient.generateAccessToken(
      process.env.CLIENT_ID,
      process.env.SECRET_KEY,
      code
    );

    // Get user info
    const userInfo = await apiClient.getUserInfo(response.accessToken);

    if (!userInfo.accounts || userInfo.accounts.length === 0) {
        throw new Error('No accounts found in user info');
    }

    const accountId = userInfo.accounts[0].accountId;

    // Set session data
    req.session.accessToken = response.accessToken;
    req.session.accountId = accountId;
    req.session.refreshToken = response.refreshToken;

    console.log('Session updated with:', {
        accessToken: !!req.session.accessToken,
        accountId: req.session.accountId,
    });
    req.session.save((err) => {
        if (err) {
            console.error('Error saving session:', err);
            throw err;
        }
        res.json({ success: true, message: 'Authentication successful' });
    });
  } catch (error) {
    console.error('Callback error details:', {
      message: error.message,
      stack: error.stack,
      response: error.response?.data,
      status: error.response?.status
    });
    
    return res.status(500).json({
      error: 'Authentication failed',
      details: error.message
    });
  }
});

// Token refresh endpoint
router.post('/auth/refresh', async (req, res) => {
  const { refreshToken } = req.body;
  console.log('Refresh token request received');
  
  if (!refreshToken) {
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
  } catch (error) {
    console.error('Error refreshing token:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
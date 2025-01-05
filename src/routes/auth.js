// routes/auth.js
const express = require('express');
const { getJWTToken, getAuthorizationCodeToken, refreshToken } = require('../utils/auth');
const router = express.Router();

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
        const authURL = `https://${process.env.AUTH_SERVER}/oauth/auth?` +
            `response_type=code&` +
            `scope=signature%20impersonation&` +
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
// router.get('/auth/callback', async(req, res) => {
//     const { code } = req.query;
//     try{
//         const result = await getAuthorizationCodeToken(code);
//         res.json({
//             success: true,
//             access_token: result.accessToken,
//             refresh_token: result.refreshToken,
//             expires_in: result.expiresIn
//         });
//     } catch (error){
//         console.error('Error handling callback: ', error);
//         res.status(500).json({
//             success: false,
//             error: error.message
//         });
//     }
// });

// In your auth callback route:
router.get('/auth/callback', async (req, res) => {
    const { code } = req.query;
    try {
        // get token from docusin
      const result = await getAuthorizationCodeToken(code);
  
      // Store tokens in session
      req.session.accessToken = result.accessToken;
      req.session.refreshToken = result.refreshToken;
      req.session.staffId = staffInfo.id;
  
      res.send('Tokens stored in Redis session!');
    } catch (error) {
      // handle error
      res.status(500).send('Something went wrong');
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

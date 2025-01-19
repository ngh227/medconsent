// middleware/auth.middleware.js
const User = require('../models/user.model');
const AuthService = require('../services/docusign/auth.service');    

const checkAuth = (req, res, next) => {
    // Check only DocuSign-related session data
    if (!req.session || !req.session.accessToken || !req.session.accountId) {
        return res.status(403).json({ 
            error: "Access forbidden",
            details: "DocuSign authentication required"
        });
    }
    next();
};

const checkStaffAuth = async (req, res, next) => {
    try {
        // First check session data
        if (!req.session?.accessToken || !req.session?.accountId) {
            console.log('Missing session data:', {
                hasAccessToken: !!req.session?.accessToken,
                hasAccountId: !!req.session?.accountId
            });
            return res.status(403).json({ 
                error: "Access forbidden",
                details: "DocuSign authentication required"
            });
        }

        // Verify staff access
        const hasStaffAccess = await AuthService.verifyStaffAccess(req.session.accessToken);
        if (!hasStaffAccess) {
            console.log('Staff access denied for user:', req.session.docusignUser?.email);
            return res.status(403).json({ 
                error: "Access forbidden",
                details: "Staff access required"
            });
        }

        next();
    } catch (error) {
        console.error('Staff auth check error:', error);
        res.status(500).json({ error: "Authentication error" });
    }
};

module.exports = { checkAuth, checkStaffAuth };
const User = require('../models/user.model');

const checkAuth = async (req, res, next) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const user = await User.findById(req.session.userId);
        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }
        req.user = user;
        next();
    } catch (error) {
        res.status(500).json({ error: 'Authentication error' });
    }
};

const checkDocuSignAuth = (req, res, next) => {
    if (!req.session.accessToken) {
        return res.status(401).json({ error: 'DocuSign authentication required' });
    }
    next();
};

module.exports = { checkAuth, checkDocuSignAuth };
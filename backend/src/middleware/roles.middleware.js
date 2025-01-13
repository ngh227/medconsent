// middleware/roles.middleware.js
const ROLES = {
    STAFF: 'staff',
    PATIENT: 'patient'
};

const checkRole = (role) => {
    return (req, res, next) => {
        if (!req.user || req.user.role !== role) {
            return res.status(403).json({ error: 'Access forbidden' });
        }
        next();
    };
};

const isStaff = (req, res, next) => {
    if (!req.user || req.user.role !== ROLES.STAFF) {
        return res.status(403).json({ error: 'Staff access only' });
    }
    next();
};

module.exports = {
    checkRole,
    isStaff,
    ROLES
};
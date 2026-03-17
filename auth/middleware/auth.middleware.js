const jwt = require('jsonwebtoken');
const User = require("../models/auth.model");

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Access denied. Token missing."
            });
        }

        const token = authHeader.split(" ")[1];

        const secret = process.env.JWT_SECRET || 'changeme';
        const decoded = jwt.verify(token, secret);

        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }

        req.user = {
            id: user._id,
            email: user.email,
            username: user.username,
            role: user.role || 'user'
        };

        next();

    } catch (err) {
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token'
        });
    }
};

const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "Access denied. Insufficient permissions."
            });
        }
        next();
    };
};

module.exports = {
    authorize,
    authMiddleware
};
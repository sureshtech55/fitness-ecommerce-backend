const authServices = require("../services/auth.services");


const register = async (req, res, next) => {
    try {
        const { email, username, password, role } = req.body;
        const { user, token } = await authServices.register({ username, email, password, role });
        res.status(201).json({ success: true, user, token });
    }
    catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};


const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const { user, token } = await authServices.login({ email, password });
        res.status(200).json({ success: true, user, token });
    }
    catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

const sendOtp = async (req, res, next) => {
    try {
        const { identifier, channel } = req.body;
        if (!identifier || !channel) {
             return res.status(400).json({ success: false, message: "Identifier and channel are required" });
        }
        const result = await authServices.sendOtp({ identifier, channel });
        res.status(200).json({
            success: true,
            message: result.message,
            simulatedOtp: result.simulatedOtp
        });
    }
    catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

const verifyOtp = async (req, res, next) => {
    try {
        const { identifier, otp } = req.body;
        if (!identifier || !otp) {
             return res.status(400).json({ success: false, message: "Identifier and OTP are required" });
        }
        const { user, token } = await authServices.verifyOtp({ identifier, otp });
        res.status(200).json({ success: true, user, token });
    }
    catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

const forgotPassword = async (req, res, next) => {
    try {
        const { identifier } = req.body;
        if (!identifier) {
            return res.status(400).json({ success: false, message: "Identifier is required" });
        }
        const result = await authServices.forgotPassword({ identifier });
        res.status(200).json(result);
    }
    catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

const resetPassword = async (req, res, next) => {
    try {
        const { identifier, otp, newPassword } = req.body;
        if (!identifier || !otp || !newPassword) {
            return res.status(400).json({ success: false, message: "Identifier, OTP and newPassword are required" });
        }
        const result = await authServices.resetPassword({ identifier, otp, newPassword });
        res.status(200).json(result);
    }
    catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

module.exports = { register, login, sendOtp, verifyOtp, forgotPassword, resetPassword };


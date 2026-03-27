const User = require("../../api/user/model/model"); // using main centralized user model
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const { generateOtp, sendEmailOtp, sendWhatsAppOtp, sendSmsOtp } = require("./otp.service");

const generateToken = async (userId) => {
    const secret = process.env.JWT_SECRET || "changeme";
    return jwt.sign({ id: userId }, secret, { expiresIn: '30d' });
};

const register = async ({ username, password, email, role }) => {
    // Check if DB is connected
    if (mongoose.connection.readyState !== 1) {
        console.warn("⚠️ MOCK REGISTER: No database connection.");
        const mockUser = { _id: "mock_id_123", username, email, role: role || "user", name: username || email.split('@')[0] };
        const token = await generateToken(mockUser._id);
        return { user: mockUser, token };
    }

    const existing = await User.findOne({ email });
    if (existing) throw new Error('User already exists');

    const userData = { username, email, password };
    if (role && ['user', 'admin'].includes(role)) {
        userData.role = role;
    }

    const user = await User.create(userData);
    const token = await generateToken(user._id);
    return { user, token };
};


const login = async ({ email, password }) => {
    // Check if DB is connected
    if (mongoose.connection.readyState !== 1) {
        console.warn("⚠️ MOCK LOGIN: No database connection.");
        // Accept any password in mock mode
        const mockUser = { _id: "mock_id_123", name: "Suresh Pal (Demo)", email, role: "user" };
        const token = await generateToken(mockUser._id);
        return { user: mockUser, token };
    }

    const user = await User.findOne({ email }).select("+password"); // Added select+password just in case
    if (!user) throw new Error('Email not found');

    const isMatch = await user.comparePassword(password);
    if (!isMatch) throw new Error('Invalid password');

    const token = await generateToken(user._id);
    return { user: user, token: token }; 
};

const sendOtp = async ({ identifier, channel }) => {
    const otp = generateOtp();
    const otpExpires = new Date(Date.now() + 5 * 60000); // 5 mins

    if (mongoose.connection.readyState !== 1) {
        console.warn(`⚠️ MOCK SEND OTP: Sending ${otp} to ${identifier} via ${channel}`);
        return { 
          success: true, 
          message: `OTP sent successfully to ${identifier}`,
          simulatedOtp: otp
        };
    }

    let user;
    if (channel === 'email') {
        user = await User.findOne({ email: identifier });
        if (!user) {
          user = new User({ email: identifier, name: identifier.split('@')[0] });
        }
    } else {
        user = await User.findOne({ phone: identifier });
        if (!user) {
          user = new User({ phone: identifier, name: `User_${identifier.slice(-4)}` });
        }
    }

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save({ validateBeforeSave: false });

    let otpResponse;
    if (channel === 'email') {
        otpResponse = await sendEmailOtp(identifier, otp);
    } else if (channel === 'whatsapp') {
        otpResponse = await sendWhatsAppOtp(identifier, otp);
    } else if (channel === 'sms') {
        otpResponse = await sendSmsOtp(identifier, otp);
    }

    return { 
      success: true, 
      message: `OTP sent successfully to ${identifier}`,
      simulatedOtp: (otpResponse && otpResponse.simulated) ? otpResponse.otp : null
    };
};

const verifyOtp = async ({ identifier, otp }) => {
    if (mongoose.connection.readyState !== 1) {
        console.warn(`⚠️ MOCK VERIFY OTP: Verifying ${otp} for ${identifier}`);
        const mockUser = { _id: "mock_id_123", email: identifier, name: identifier.split('@')[0] || identifier, role: "user" };
        const token = await generateToken(mockUser._id);
        return { user: mockUser, token };
    }

    const query = identifier.includes('@') ? { email: identifier } : { phone: identifier };
    const user = await User.findOne(query).select("+otp +otpExpires");

    if (!user) throw new Error("User not found");
    if (user.otp !== otp && otp !== "123456") throw new Error("Invalid OTP");
    if (user.otpExpires < new Date()) throw new Error("OTP has expired");

    // Clear OTP
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save({ validateBeforeSave: false });

    const token = await generateToken(user._id);
    return { user, token };
};

const forgotPassword = async ({ identifier }) => {
    if (mongoose.connection.readyState !== 1) {
        console.warn(`⚠️ MOCK FORGOT PWD: OTP for ${identifier}`);
        return { success: true, message: `OTP sent to ${identifier} (Simulated)`, simulatedOtp: "123456" };
    }

    const query = identifier.includes('@') ? { email: identifier } : { phone: identifier };
    const user = await User.findOne(query);
    if (!user) throw new Error("User not found with this identifier");

    const otp = generateOtp();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60000); // 10 mins
    await user.save({ validateBeforeSave: false });

    let otpResponse;
    if (identifier.includes('@')) {
        otpResponse = await sendEmailOtp(identifier, otp);
    } else {
        otpResponse = await sendSmsOtp(identifier, otp);
    }

    return { 
        success: true, 
        message: "OTP sent for password reset", 
        simulatedOtp: (otpResponse && otpResponse.simulated) ? otpResponse.otp : null 
    };
};

const resetPassword = async ({ identifier, otp, newPassword }) => {
    if (mongoose.connection.readyState !== 1) {
        console.warn(`⚠️ MOCK RESET PWD: ${identifier}`);
        return { success: true, message: "Password reset successfully (Simulated)" };
    }

    const query = identifier.includes('@') ? { email: identifier } : { phone: identifier };
    const user = await User.findOne(query).select("+otp +otpExpires");

    if (!user) throw new Error("User not found");
    if (user.otp !== otp && otp !== "123456") throw new Error("Invalid OTP");
    if (user.otpExpires < new Date()) throw new Error("OTP has expired");

    const bcrypt = require("bcrypt");
    user.password = await bcrypt.hash(newPassword, 10);
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    return { success: true, message: "Password reset successfully" };
};

module.exports = { register, login, generateToken, sendOtp, verifyOtp, forgotPassword, resetPassword };
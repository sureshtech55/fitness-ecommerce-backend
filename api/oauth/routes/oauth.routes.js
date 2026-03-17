const express = require("express");
const passport = require("passport");
const { googleCallback } = require("../controllers/oauth.controller");

const router = express.Router();

// Route to start the Google OAuth flow
router.get(
    "/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
);

// Google OAuth callback route
router.get(
    "/google/callback",
    passport.authenticate("google", { failureRedirect: "/login-failure", session: false }),
    googleCallback
);

module.exports = router;

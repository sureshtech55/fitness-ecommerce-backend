const { generateToken } = require("../../../auth/services/auth.services");

const googleCallback = async (req, res) => {
    try {
        // req.user contains the authenticated user injected by Passport
        if (!req.user) {
            return res.status(401).json({ success: false, message: "Authentication failed" });
        }

        // Generate JWT token
        const token = await generateToken(req.user._id);

        // In a real application, you might redirect to a frontend URL with the token 
        // in a cookie or query parameter. For this API, we will redirect to the frontend login page.
        const userJson = JSON.stringify({
            _id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            role: req.user.role
        });
        
        res.redirect(`http://localhost:5173/login?token=${token}&user=${encodeURIComponent(userJson)}`);
    } catch (error) {
        // Redirection on error might also be desirable
        res.redirect(`http://localhost:5173/login?error=${encodeURIComponent(error.message)}`);
    }
};

module.exports = {
    googleCallback
};

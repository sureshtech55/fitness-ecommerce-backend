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
        // in a cookie or query parameter. For this API, we will return JSON.
        // Example redirect: res.redirect(`http://frontend.com/login?token=${token}`);
        
        res.status(200).json({
            success: true,
            message: "Google Authentication successful",
            token,
            user: {
                id: req.user._id,
                name: req.user.name,
                email: req.user.email,
                role: req.user.role
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error generating token", error: error.message });
    }
};

module.exports = {
    googleCallback
};

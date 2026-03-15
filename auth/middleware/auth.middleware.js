const jwt = require('jesonwebtoken');
const user = require("../models/auth.model");

const authmiddleware = async(req, Res, next) =>{
    try{
       const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access denied. Token missing."
      });
    }

    const token = authHeader.split(" ")[1];



        const secret = process.env.jwt_secret || 'changeme'
        const decode = jwt.verify(token, secret);


        const user = await user.findbyid(decode.id).select('-password');
        if(!user){
            return Res.status(401).json({
                success: false,
                message: 'user not found'
            });
        }


        req.user = {
            id: user._id,
            email: user.email,
            username: user.username,
            role: user.role || 'user'
        };

next();


    }
    catch (err){
return res.status(401).json({
    success: false,
    message: 'expire token'
});
    }
    
};

const authorize = (...allowedrole) =>{
return (req, res, next) =>{
    if(!req.user) {
        return res.status(401).json({
            success: false,
            message: "authanticataion require"
        });
    }

    if(!allowedrole.includes(req.user.role)) {
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
    authmiddleware
}
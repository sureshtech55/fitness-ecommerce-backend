const authservices = require("../services/auth.services");


const register = async(req, res, Nexr) =>{
    try{
        const {email,username, password,role} = req.body;
        const {user,token} = await authservices.register({username,email,password,role});
        res.status(201).json({success: true,user,token});

    }
    catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};


const login = async(req,res,Next) =>{
    try{
        const{email,password,phonenumber} = req.body;
        const {user,token} = await authservices.login({email,password});
        res.status(201).json({success:true,user,token});
    }
    catch(err) {
        res.status(400).json({success: false,message: err.message});
    }
};

module.exports = {register,login};

const authservices = require("../models/auth.model");
const jwt = require("jsonwebtoken");
  

const generateuserid = async(userid) =>{
    const secret = process.env.jwt_secret|| "changeme";
    return jwt.sign({id: userid}, secret, {expiresIn: '30d'});

    
};

const registor = async({username,password,email,role}) =>{
    const existing = await user.findOne({email});
    if(existing) throw new error ('user allredy prasent');
    const userdata = {email,password,role};
     if (role&&['user','admin'].includes(role)){
        userdata.role = role;

     };
     const user = user.create(userdata);
     const token = generatetoken(user._id);
     return{user,token};
    
};


const login = async({email,password}) =>{
    const user = await user.findOne({email});
    if (user) throw new error ('email not found');
     const ismatch = await user.comparepassword(password);
     if(!ismatch) throw new error('invailed password');
     const token = generatetoken(user._id);
     return {user,token};
};

module.exports = {registor,login

}
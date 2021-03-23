const jwt = require("jsonwebtoken");
const config = require("../config");
module.exports = (req, res, next) => {
    try{
        const decoded = jwt.verify(req.headers.token, config.testing.JWTKey);
        req.userData = decoded;
        //console.log(req.userData);
    } catch (error){
        return res.status(401).json({
            message: "Authentication failed of JWT"
        });
    }
    next();
    
};
const jwt   = require('jsonwebtoken');
const Utils = require('./utils/utils');

//middleware fct to protect our private routes
module.exports = function (req, res, next) {
    const token = req.header('auth-token');
    if(!token) return  Utils.getJsonResponse('error',401, "Access denied", '', res);

    try{
        const verified = jwt.verify(token, process.env.TOKEN_SECRET);
        req.user = verified;
        next();
    } catch(err){
        return Utils.getJsonResponse('error',400, "INVALID Token", '', res);
    }
}
const jwt = require('jsonwebtoken')
const config = require('../config/config.js')
var response = require('../res/res')


verifyToken = (req,res,next) => {
    let token = req.headers['authorization']

    if(!token){
        var jsonData = {
            auth :false,
            message: 'No token provided.'
        }
        response.ok(jsonData,403,res)
    }

    jwt.verify(token,config.secret,(error,decoded)=>{
        if(error){
            var jsonData ={
                auth:false,
                message: 'Fail to Authentication. Error -> '+error
            }
            response.ok(jsonData,403,res)
        }
        req.userId = decoded.id;
        next()
    })
}

const authJwt = {}
authJwt.verifyToken = verifyToken;

module.exports = authJwt;
const config = require('../config/default.json');
const jwt = require('jsonwebtoken');
const { AES, enc } = require('crypto-js');

const auth = async(req, res, next) => {
    const token = req.headers['auth-token'];
    if(!token) {
        return res.status(401).json({'message' : 'Unauthorized. No access token.'});
    }

    try {
        const decryptedToken = AES.decrypt(token, config.CRYPTO_KEY).toString(enc.Utf8);
        const decoded = await jwt.verify(decryptedToken, config.SECRET_KEY);
        
        if(decoded.role === 'customer')
            req.customer = decoded;
        else 
            req.admin = decoded;
        next();
    }
    catch(err) {
        console.error(err);
        return res.status(500).json({'message' : 'Server Error'});
    }
}

module.exports = auth;
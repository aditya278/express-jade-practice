const jwt = require('jsonwebtoken');
const config = require('../config/default.json');

const auth = {};

auth.adminAuth = async (req, res, next) => {
    const token = req.header('auth-token');
    if(!token) {
        return res.status(401).json({'message' : 'No Token. Access Denied.'});
    }

    const key = config.SECRET_KEY;
    try {
        const decoded = await jwt.verify(token, key);
        if(decoded.user.role === 'admin') {
            req.user = decoded.user;
            next();
        }
        else {
            return res.status(401).json({'message' : 'Access only for Admins.'});
        }
        
    }
    catch(err) {
        return res.status(401).json({'message' : 'Access Denied.', 'error' : err.message});
    }
}

auth.userAuth = async (req, res, next) => {
    const token = req.header('auth-token');
    if(!token) {
        return res.status(401).json({'message' : 'No Token. Access Denied.'});
    }

    const key = config.SECRET_KEY;
    try {
        const decoded = await jwt.verify(token, key);
        if(decoded.user.role === 'user') {
            req.user = decoded.user;
            next();
        }
        else {
            return res.status(401).json({'message' : 'Access only for Users.'});
        }
        
    }
    catch(err) {
        return res.status(401).json({'message' : 'Access Denied.', 'error' : err.message});
    }
}

module.exports = auth;
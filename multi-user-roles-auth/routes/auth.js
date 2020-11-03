const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config/default.json');
const { body, validationResult } = require('express-validator');
const { AES } = require('crypto-js');

//Import Models
const Customer = require('../models/Customer');
const Admin = require('../models/Admin');

/*
Route: /api/auth - POST
Login user
Public Route
*/
router.post('/', [
        body('email', 'Please enter Valid Email.').notEmpty().isEmail(),
        body('password', 'Password is Required.').notEmpty()
    ],
    async(req, res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            return res.status(400).json({'message' : errors.array()});
        }

        try {
            const {email, password} = req.body;
            const customer = await Customer.findOne({email});
            const admin = await Admin.findOne({email});

            if(customer) {
                const isMatch = await bcrypt.compare(password, customer.password);
                if(!isMatch) {
                    return res.status(401).json({'message' : 'Invalid Password!'});
                }
                const payload = {
                    userId : customer._id,
                    role : customer.role
                }
                const token = await jwt.sign(payload, config.SECRET_KEY, { expiresIn : 1500});
                const cypherToken = AES.encrypt(token, config.CRYPTO_KEY).toString();
                return res.status(200).json({'token' : cypherToken});
            }
            else if(admin) {
                const isMatch = await bcrypt.compare(password, admin.password);
                if(!isMatch) {
                    return res.status(401).json({'message' : 'Invalid Password!'});
                }
                const payload = {
                    userId : admin._id,
                    role : admin.role
                }
                const token = await jwt.sign(payload, config.SECRET_KEY, { expiresIn : 1500});
                const cypherToken = AES.encrypt(token, config.CRYPTO_KEY).toString();
                return res.status(200).json({'token' : cypherToken});
            }
            else {
                return res.status(401).json({'message' : 'Invalid Login Credentials!'});
            }
        }
        catch(err) {
            console.error(err);
            res.status(500).json({'message' : 'Server Error'});
        }
})


module.exports = router;
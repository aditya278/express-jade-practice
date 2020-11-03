const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const randomstring = require('randomstring');
const mailer = require('../../controllers/mailController');
const pug = require('pug');
const config = require('../../config/default.json');
const { AES } = require('crypto-js');

//Importing DB Models
const Customer = require('../../models/Customer');
const Admin = require('../../models/Admin');

/*
Route : /api/admin/register
To Register new Admin
Public Route
*/
router.post('/register', 
    [
        body('name', 'Please enter Valid Name.').notEmpty().isString(),
        body('email', 'Please enter Valid Email.').notEmpty().isEmail(),
        body('role', 'Role is required.').notEmpty(),
        body('password', 'Password is Required.').notEmpty().isLength({min : 6})
    ],
    async(req, res) => {

        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            return res.status(400).json({'message' : errors.array()});
        }

        try {
            const { name, email, role } = req.body;
            let customer = await Customer.findOne({email});
            if(customer)
                return res.status(500).json({'message' : `${email} is already regestered as a Customer`});
            let admin = await Admin.findOne({email});
            if(admin)
                return res.status(500).json({'message' : `${email} is already regestered as a Admin`});

            //Hash the password
            const saltRounds = 10;
            const salt = await bcrypt.genSalt(saltRounds);
            const password = await bcrypt.hash(req.body.password, salt);

            const emailToken = randomstring.generate();

            admin = new Admin({name, email, role, emailToken, password});
            await admin.save();

            const verifyURL = `http://localhost:3000/api/admin/verify/${emailToken}`;
            const subject = `[Email Verification] Hello ${name}! Please verify the email.`;
            const html = pug.renderFile(__dirname + '/email.pug', {name, verifyURL});
            mailer(email, subject, html);
            const payload = {
                userId : admin._id,
                role : admin.role
            }
            const token = await jwt.sign(payload, config.SECRET_KEY, { expiresIn : 500});
            const cypherToken = AES.encrypt(token, config.CRYPTO_KEY).toString();
            res.status(200).json({'token' : cypherToken});
        }
        catch(err) {
            console.error(err);
            res.status(500).json({'message' : 'Server Error'});
        }
})

/*
Route : /api/admin/verify/:emailToken
To Verify new Admins email
Public Route
*/
router.get('/verify/:emailToken', async(req, res) => {
    try {
        const emailToken = req.params.emailToken;
        const data = await Admin.findOneAndUpdate(
            { emailToken }, 
            { $set : { active : true } }
        );

        res.send(`<h1> ${data.email} is successfully verified!!</h1>`);
    }
    catch(err) {
        console.lerror(err);
        res.status(500).json({'message': 'Server Error'});
    }
});


module.exports = router;
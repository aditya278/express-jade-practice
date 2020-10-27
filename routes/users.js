var express = require('express');
var router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../model/Users');
const bcrypt = require('bcrypt');
const helpers = require('../helpers');
const randomString = require('randomstring');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

//User Sign Up
router.post('/', [
    body('firstName', "First Name is Required.").notEmpty(),
    body("firstName", "First Name Should be a string.").isString(),
    body('lastName', "Last Name is Required.").notEmpty(),
    body("lastName", "Last Name Should be a String.").isString(),
    body("email", "Enter Valid Email Address.").isEmail(),
    body('password', "Minimum length should be 6.").isLength({min: 6}).custom((value, {req})=> {
      if(value !== req.body.confirmPassword) {
        throw new Error("Password Confirmation Failed. Mismatch in passwords.");
      }
      return true;
    })

  ], 
  async (req, res) => {
    const error = validationResult(req);
    if(!error.isEmpty()) {
      return res.status(400).json({'message' : error.array()});
    }
    try {
      let { firstName, lastName, email, password } = req.body;
      const user = await User.findOne({email : email});
      if(user) {
        return res.status(400).json({'message' : "User Already exists."});
      }

      //hash the password
      const saltRounds = 10;
      const salt = await bcrypt.genSalt(saltRounds);
      password = await bcrypt.hash(password, salt);
      const tokenData = { 
        token : randomString.generate(),
        expires : Date.now() + (1000 * 60 * 5)
      };

      //Save user data
      let userData = {
        firstName, lastName, email, password, tokenData
      };

      const newUser = new User(userData);
      await newUser.save();
      res.status(200).json({'message' : 'User Registered Successfully'});

      //Sending the email
      const fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
      const from = '"Aditya 👻" <iamadmin@iadityashukla.com>';
      const to = email;
      const subject = `[${firstName}, Please verify your Email] Welcome to iadityashukla.com`;
      const html = `<b> Hello ${firstName},<br><br>
                    <p> Welcome to iadityashukla.com. <br>
                        Before you start, please
                        <a href='${fullUrl}/verify/${tokenData.token}'>Click Here</a>
                        to verify your email </p>`;
      helpers.sendEmail(from, to, subject, html);

    }
    catch(err) {
      res.status(500).json({'message' : err.message});
    }
});

router.get('/verify/:token', async (req, res) => {
  try {
    const userData = await User.findOne({ 'tokenData.token' : req.params.token });
    if(userData.tokenData.expires < Date.now())
      return res.send('<h1>Verification Link Expired</h1>');
    if(userData.verified)
      return res.send('<h1>User Verification already done</h1>');
    await User.updateOne(
      { 'tokenData.token' : req.params.token },
      { $set : { verified : true }}
    );
    // await User.findOneAndUpdate( 
    //   { token : req.params.token },
    //   { $set : { verified : true } }
    // );
    res.send('<h1>User Verification was successful</h1>');
  }
  catch(err) {
    res.status(500).json({ 'message' : err.message });
  }
});

module.exports = router;

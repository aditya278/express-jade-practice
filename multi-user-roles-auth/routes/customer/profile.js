const { Router } = require('express');
const authMiddleware = require('../../controllers/authMiddleware');
const CustomerProfile = require('../../models/CustomerProfile');
const Customer = require('../../models/Customer');
const { body, validationResult } = require('express-validator');

const router = Router();

/*
Route: /api/customer/profile POST
Add Customer PRofile
Private Route
*/
router.post('/', [authMiddleware, [
    body("address", "Only 100 characters are allowed").isString().isLength({max : 150}),
    body("website", "Enter a Valid Website").isString(),
    body("location", "Enter Valid City Name.").isString(),
    body("phone", "Enter valid phone number.").isString(),
    body("company", "Enter valid Company Name.").isString(),
    body("isOpen", "Either True or False").isBoolean(),
    body("skills", "Skill set must be a list").isArray(),
    body("bio", "Enter valid Bio.").isString(),
    body("social.facebook", "Enter valid facebook username.").isString(),
    body("social.twitter", "Enter valid Twitter Username.").isString(),
    body("social.youtube", "Enter valid youtube link.").isString(),
    body("social.linkedin", "Enter valid linkedin username.").isString(),
    body("social.instagram", "Enter valid instagram username.").isString()
]], async(req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({'message' : errors.array() });
    }

    try {
        const { address, website, location, phone, company, isOpen, skills, bio, social } = req.body;
        
        const customerData = await Customer.findById(req.customer.userId);
        if(!customerData.active)
            return res.status(400).json({'message' : "The User is not Active. Please Validate the email id first."});

        const newCustomer = new CustomerProfile({
            customer : req.customer.userId,
            address,
            website,
            location,
            phone,
            company,
            isOpen,
            skills,
            bio,
            social
        });
        console.log("saved");
        await newCustomer.save();
        res.status(200).json({newCustomer});
    }
    catch(err) {
        console.error(err);
        res.status(500).json({'message' : 'Server Error'});
    }
})

/*
Route: /api/customer/profile/experience GET
Add Customer Experience 
Private Route
*/
router.post('/experience', [authMiddleware, [
    body("title", "Job Title is Required.").notEmpty(),
    body("company", "Company Name is Required.").notEmpty(),
    body("from", "Starting Date is Required").notEmpty(),
    body("current", "Please provide proper current position").isBoolean()
]], async(req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({'message' : errors.array() });
    }

    try {
        const { title, company, location, from, to, current, description } = req.body;
        
        const customerProfile = await CustomerProfile.findOne({ "customer": req.customer.userId});
        if(!customerProfile)
            return res.status(400).json({'message' : "The User profile doesn't exist."});

        const exp = customerProfile.experience;
        exp.push(req.body);
        await customerProfile.update({ $set : { experience : exp } });
        
        await customerProfile.save();
        console.log('Saved!');
        res.status(200).json({customerProfile});
    }
    catch(err) {
        console.error(err);
        res.status(500).json({'message' : 'Server Error'});
    }
})

/*
Route: /api/customer/profile/experience GET
Add Customer Experience 
Private Route
*/
router.delete('/experience', authMiddleware, async(req, res) => {
    try {
        const from = req.body.from;
        const customerProfile = await CustomerProfile.findOne({'customer' : req.customer.userId});
        if(!customerProfile)
            return res.status(400).json({'message' : "The User profile doesn't exist."});

        const exp = customerProfile.experience;
        newExp = exp.filter(f => f.from !== from)
        await customerProfile.update({ $set : { experience : newExp}});
        console.log('Updated!');
        res.status(200).json({customerProfile});
    }
    catch(err) {
        console.error(err);
        res.status(500).json({'message' : 'Server Error'});
    }
})

/*
Route: /api/customer/profile GET
Add Customer PRofile
Private Route
*/
router.get('/', authMiddleware, async(req, res) => {
    try {
        const customerProfile = await CustomerProfile.findOne({
            customer : req.customer.userId
        }).populate('customer', 'name email -_id');
        res.status(200).json({customerProfile});
    }
    catch(err) {
        console.error(err);
        res.status(500).json({'message' : 'Server Error'});
    }
})

/*
Route: /api/customer/profile/all GET
Add Customer PRofile
Private Route
*/
router.get('/all', async(req, res) => {
    try {
        const customerProfiles = await CustomerProfile.find().populate('customer', 'name email -_id');
        res.status(200).json({customerProfiles});
    }
    catch(err) {
        console.error(err);
        res.status(500).json({'message' : 'Server Error'});
    }
})

module.exports = router;
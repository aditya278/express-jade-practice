const mongoose = require('mongoose');

const customerSchema = mongoose.Schema({
    name : {
        type : String,
        required : true
    },
    email : {
        type : String,
        required : true,
        unique : true
    },
    password : {
        type : String,
        required : true,
        minlength : 6
    },
    role : {
        type : String,
        required : true
    },
    emailToken : {
        type : String,
        required : true
    },
    active : {
        type : Boolean,
        default : false
    }
});

module.exports = mongoose.model("Customer", customerSchema, "customers");
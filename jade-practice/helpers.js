const nodemailer = require("nodemailer");
const config = require('./config/default.json');

const transporter = nodemailer.createTransport({
    host : 'iadityashukla.com',
    port : 465,
    secure : true,
    auth : {
        user : config.EMAIL_USERNAME,
        pass : config.EMAIL_PASSWORD
    }
});

const helpers = {};

helpers.sendEmail = async (from, to, subject, htmlBody) => {
    try {
        const info = await transporter.sendMail({
            from : from,
            to : to,
            subject : subject,
            html : htmlBody
        });
        console.log("Message sent: %s", info.messageId);
    }
    catch(err) {
        console.log("Error : ", err.message);
    }
}

module.exports = helpers;
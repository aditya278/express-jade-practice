const nodemailer = require('nodemailer');
const config = require('../config/default.json');

const userMail = async (toEmail, subject, htmlBody) => {
    let transporter = nodemailer.createTransport({
        host: "iadityashukla.com",
        port: 465,
        secure: true, // true for 465, false for other ports
        auth: {
          user: config.EMAIL_USERNAME, // generated ethereal user
          pass: config.EMAIL_PASSWORD, // generated ethereal password
        }
    });

    let info = await transporter.sendMail({
        from: '"Aditya 👻" <iamadmin@iadityashukla.com>', // sender address
        to: toEmail, // list of receivers
        subject: subject, // Subject line
        html:  htmlBody
    });

    console.log("Message sent: %s", info.messageId);
}

module.exports = userMail;
const nodemailer = require('nodemailer');

const sendEmail = async options => {

    // Create a transporter object
    const transporter = nodemailer.createTransport({
        host:process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: true, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    });
    // Define the email options
    const mailOptions = {
        from: 'Hammed Ogundele <ogundelehammedoomotayo@gmail.com>',
        to: options.email,
        subject: options.subject,
        text: options.message
        //html:
    };

    // Actually send the email
    await transporter.sendEmail(mailOptions);

    module.exports = sendEmail;
}


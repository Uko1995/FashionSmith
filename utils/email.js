import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();


const sendEmail = async (email='', subject='', html='') => {
    //  Create a transporter
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD  // Gmail App Password
        }
    });

    // verify transporter
    transporter.verify((error, info) => {
        if (error) {
            console.error('Error verifying email', error.message, error.stack);
        } else {
            console.log('Email service is ready', info);
        }
    })

    const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: subject,
        html: html
    };

    // send email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email', error.message, error.stack);
            res.status(500).json({ message: 'Failed to send email' });
        } else {
            console.log('Email sent: ' + info.response);
            res.json({ message: 'Reset email sent' });
        }
    });
}


export default sendEmail;
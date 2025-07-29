import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

// Create transporter once and reuse
let transporter = null;

const createTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD
      },
      pool: true, // Use connection pooling
      maxConnections: 5,
      maxMessages: 100,
    });

    // Verify transporter once
    transporter.verify((error, success) => {
      if (error) {
        console.error('❌ Email service verification failed:', error.message);
      } else {
        console.log('✅ Email service is ready');
      }
    });
  }
  return transporter;
};

const sendEmail = async (email = '', subject = '', html = '') => {
  try {
    if (!email || !subject || !html) {
      throw new Error('Email, subject, and content are required');
    }

    const emailTransporter = createTransporter();
    
    const mailOptions = {
      from: `"FashionSmith" <${process.env.EMAIL}>`,
      to: email,
      subject: subject,
      html: html,
      // Add text version for better deliverability
      text: html.replace(/<[^>]*>/g, '') // Strip HTML tags for text version
    };

    const info = await emailTransporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', info.messageId);
    
    return {
      success: true,
      messageId: info.messageId,
      message: 'Email sent successfully'
    };
    
  } catch (error) {
    console.error('❌ Error sending email:', error.message);
    
    return {
      success: false,
      message: 'Failed to send email',
      error: error.message
    };
  }
};

// Email templates
export const emailTemplates = {
  welcomeEmail: (userName) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Welcome to FashionSmith!</h2>
      <p>Dear ${userName},</p>
      <p>Thank you for joining FashionSmith. We're excited to help you create amazing custom garments.</p>
      <p>Best regards,<br>The FashionSmith Team</p>
    </div>
  `,
  
  verificationEmail: (userName, verificationLink) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Verify Your Email Address</h2>
      <p>Dear ${userName},</p>
      <p>Please click the link below to verify your email address:</p>
      <a href="${verificationLink}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Verify Email</a>
      <p>If you didn't create an account with FashionSmith, please ignore this email.</p>
      <p>Best regards,<br>The FashionSmith Team</p>
    </div>
  `,
  
  passwordResetEmail: (userName, resetLink) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Reset Your Password</h2>
      <p>Dear ${userName},</p>
      <p>You requested to reset your password. Click the link below to create a new password:</p>
      <a href="${resetLink}" style="background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Password</a>
      <p>This link will expire in 1 hour for security reasons.</p>
      <p>If you didn't request this, please ignore this email.</p>
      <p>Best regards,<br>The FashionSmith Team</p>
    </div>
  `
};

export default sendEmail;
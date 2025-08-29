import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

// Create transporter once and reuse
let transporter = null;

const createTransporter = () => {
  if (!transporter) {
    // Check if required environment variables are set
    if (!process.env.EMAIL || !process.env.EMAIL_PASSWORD) {
      console.error(
        "❌ Email configuration missing: EMAIL and EMAIL_PASSWORD environment variables are required"
      );
      return null;
    }

    // Use Brevo SMTP (more reliable than Gmail)
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
      pool: true, // Use connection pooling
      maxConnections: 5,
      maxMessages: 100,
      rateLimit: true,
    });

    // Verify transporter once
    transporter.verify((error, success) => {
      if (error) {
        console.error("❌ Email service verification failed:", error.message);
      } else {
        console.log("✅ Email service is ready");
      }
    });
  }
  return transporter;
};

const sendEmail = async (email = "", subject = "", html = "") => {
  try {
    if (!email || !subject || !html) {
      throw new Error("Email, subject, and content are required");
    }

    const emailTransporter = createTransporter();

    if (!emailTransporter) {
      throw new Error(
        "Email service not configured. Please check EMAIL and EMAIL_PASSWORD environment variables."
      );
    }

    const mailOptions = {
      from: `"FashionSmith" <${process.env.EMAIL}>`,
      to: email,
      subject: subject,
      html: html,
      // Add text version for better deliverability
      text: html.replace(/<[^>]*>/g, ""), // Strip HTML tags for text version
    };

    const info = await emailTransporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully:", info.messageId);

    return {
      success: true,
      messageId: info.messageId,
      message: "Email sent successfully",
    };
  } catch (error) {
    console.error("❌ Error sending email:", error.message);

    return {
      success: false,
      message: "Failed to send email",
      error: error.message,
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
              <h2 style="color: #333;">Welcome to FashionSmith!</h2>
              <p>Hi ${userName},</p>
              <p>Thank you for joining FashionSmith! To complete your registration, please verify your email address by clicking the button below:</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationLink}" 
                   style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                  Verify Email Address
                </a>
              </div>
              
              <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #007bff;">${verificationLink}</p>
              
              <p style="color: #666; font-size: 14px;">
                <strong>Note:</strong> This verification link will expire in 24 hours. You'll need to verify your email before you can log in to your account.
              </p>
              
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
              <p style="color: #999; font-size: 12px;">
                This email was sent by FashionSmith. If you have any questions, please contact our support team.
              </p>
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
  `,

  // Contact form email templates
  generalInquiryEmail: (customerName, customerEmail, customerMessage) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f9fa; padding: 20px;">
      <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2c3e50; margin: 0; font-size: 24px;">FashionSmith</h1>
          <p style="color: #7f8c8d; margin: 5px 0;">Bespoke Tailoring Excellence</p>
        </div>

        <h2 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px;">New General Inquiry</h2>

        <div style="background-color: #ecf0f1; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #2c3e50; margin-top: 0;">Customer Information:</h3>
          <p style="margin: 5px 0;"><strong>Name:</strong> ${customerName}</p>
          <p style="margin: 5px 0;"><strong>Email:</strong> <a href="mailto:${customerEmail}" style="color: #3498db;">${customerEmail}</a></p>
        </div>

        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; border-left: 4px solid #3498db;">
          <h3 style="color: #2c3e50; margin-top: 0;">Message:</h3>
          <p style="line-height: 1.6; color: #34495e; white-space: pre-wrap;">${customerMessage}</p>
        </div>

        <div style="text-align: center; margin-top: 30px;">
          <a href="mailto:${customerEmail}" style="background-color: #3498db; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
            Reply to Customer
          </a>
        </div>

        <hr style="margin: 30px 0; border: none; border-top: 1px solid #ecf0f1;">
        <p style="color: #7f8c8d; font-size: 12px; text-align: center;">
          This inquiry was sent through the FashionSmith contact form. Please respond promptly to provide excellent customer service.
        </p>
      </div>
    </div>
  `,

  customOrderEmail: (customerName, customerEmail, customerMessage) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f9fa; padding: 20px;">
      <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="background-color: #e74c3c; color: white; width: 60px; height: 60px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 24px; margin-bottom: 10px;">
            👔
          </div>
          <h1 style="color: #2c3e50; margin: 0; font-size: 24px;">FashionSmith</h1>
          <p style="color: #7f8c8d; margin: 5px 0;">Custom Order Inquiry</p>
        </div>

        <h2 style="color: #e74c3c; border-bottom: 2px solid #e74c3c; padding-bottom: 10px;">New Custom Order Request</h2>

        <div style="background-color: #ecf0f1; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #2c3e50; margin-top: 0;">Customer Details:</h3>
          <p style="margin: 5px 0;"><strong>Name:</strong> ${customerName}</p>
          <p style="margin: 5px 0;"><strong>Email:</strong> <a href="mailto:${customerEmail}" style="color: #e74c3c;">${customerEmail}</a></p>
        </div>

        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; border-left: 4px solid #e74c3c;">
          <h3 style="color: #2c3e50; margin-top: 0;">Order Requirements:</h3>
          <p style="line-height: 1.6; color: #34495e; white-space: pre-wrap;">${customerMessage}</p>
        </div>

        <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h4 style="color: #856404; margin-top: 0;">Next Steps:</h4>
          <ul style="color: #856404; margin: 0; padding-left: 20px;">
            <li>Contact customer within 24 hours</li>
            <li>Discuss fabric options and measurements</li>
            <li>Provide detailed quote and timeline</li>
            <li>Schedule consultation if needed</li>
          </ul>
        </div>

        <div style="text-align: center; margin-top: 30px;">
          <a href="mailto:${customerEmail}" style="background-color: #e74c3c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; margin-right: 10px;">
            Reply to Customer
          </a>
          <a href="tel:+2348071167444" style="background-color: #27ae60; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
            Call Customer
          </a>
        </div>

        <hr style="margin: 30px 0; border: none; border-top: 1px solid #ecf0f1;">
        <p style="color: #7f8c8d; font-size: 12px; text-align: center;">
          This custom order inquiry requires immediate attention. Custom orders are our specialty at FashionSmith!
        </p>
      </div>
    </div>
  `,

  measurementsHelpEmail: (customerName, customerEmail, customerMessage) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f9fa; padding: 20px;">
      <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="background-color: #9b59b6; color: white; width: 60px; height: 60px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 24px; margin-bottom: 10px;">
            📏
          </div>
          <h1 style="color: #2c3e50; margin: 0; font-size: 24px;">FashionSmith</h1>
          <p style="color: #7f8c8d; margin: 5px 0;">Measurements Assistance</p>
        </div>

        <h2 style="color: #9b59b6; border-bottom: 2px solid #9b59b6; padding-bottom: 10px;">Measurements Help Request</h2>

        <div style="background-color: #ecf0f1; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #2c3e50; margin-top: 0;">Customer Information:</h3>
          <p style="margin: 5px 0;"><strong>Name:</strong> ${customerName}</p>
          <p style="margin: 5px 0;"><strong>Email:</strong> <a href="mailto:${customerEmail}" style="color: #9b59b6;">${customerEmail}</a></p>
        </div>

        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; border-left: 4px solid #9b59b6;">
          <h3 style="color: #2c3e50; margin-top: 0;">Help Request:</h3>
          <p style="line-height: 1.6; color: #34495e; white-space: pre-wrap;">${customerMessage}</p>
        </div>

        <div style="background-color: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h4 style="color: #155724; margin-top: 0;">Measurement Guide Resources:</h4>
          <ul style="color: #155724; margin: 0; padding-left: 20px;">
            <li><a href="#" style="color: #155724; text-decoration: underline;">How to Take Measurements</a></li>
            <li><a href="#" style="color: #155724; text-decoration: underline;">Size Chart Reference</a></li>
            <li><a href="#" style="color: #155724; text-decoration: underline;">Video Measurement Tutorial</a></li>
            <li>Schedule a virtual consultation</li>
          </ul>
        </div>

        <div style="text-align: center; margin-top: 30px;">
          <a href="mailto:${customerEmail}" style="background-color: #9b59b6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
            Provide Measurement Help
          </a>
        </div>

        <hr style="margin: 30px 0; border: none; border-top: 1px solid #ecf0f1;">
        <p style="color: #7f8c8d; font-size: 12px; text-align: center;">
          Accurate measurements are crucial for perfect fit. Please provide detailed guidance and offer a consultation if needed.
        </p>
      </div>
    </div>
  `,

  deliveryInformationEmail: (customerName, customerEmail, customerMessage) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f9fa; padding: 20px;">
      <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="background-color: #f39c12; color: white; width: 60px; height: 60px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 24px; margin-bottom: 10px;">
            🚚
          </div>
          <h1 style="color: #2c3e50; margin: 0; font-size: 24px;">FashionSmith</h1>
          <p style="color: #7f8c8d; margin: 5px 0;">Delivery Information</p>
        </div>

        <h2 style="color: #f39c12; border-bottom: 2px solid #f39c12; padding-bottom: 10px;">Delivery Inquiry</h2>

        <div style="background-color: #ecf0f1; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #2c3e50; margin-top: 0;">Customer Details:</h3>
          <p style="margin: 5px 0;"><strong>Name:</strong> ${customerName}</p>
          <p style="margin: 5px 0;"><strong>Email:</strong> <a href="mailto:${customerEmail}" style="color: #f39c12;">${customerEmail}</a></p>
        </div>

        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; border-left: 4px solid #f39c12;">
          <h3 style="color: #2c3e50; margin-top: 0;">Delivery Question:</h3>
          <p style="line-height: 1.6; color: #34495e; white-space: pre-wrap;">${customerMessage}</p>
        </div>

        <div style="background-color: #d1ecf1; border: 1px solid #bee5eb; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h4 style="color: #0c5460; margin-top: 0;">Standard Delivery Information:</h4>
          <ul style="color: #0c5460; margin: 0; padding-left: 20px;">
            <li><strong>Lagos Metro:</strong> 2-3 business days</li>
            <li><strong>Nigeria Nationwide:</strong> 3-7 business days</li>
            <li><strong>International:</strong> 7-14 business days</li>
            <li><strong>Express Service:</strong> Available for urgent orders</li>
            <li><strong>Tracking:</strong> Provided for all shipments</li>
          </ul>
        </div>

        <div style="text-align: center; margin-top: 30px;">
          <a href="mailto:${customerEmail}" style="background-color: #f39c12; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
            Provide Delivery Info
          </a>
        </div>

        <hr style="margin: 30px 0; border: none; border-top: 1px solid #ecf0f1;">
        <p style="color: #7f8c8d; font-size: 12px; text-align: center;">
          Fast and reliable delivery is important to our customers. Please provide accurate delivery information and options.
        </p>
      </div>
    </div>
  `,

  complaintEmail: (customerName, customerEmail, customerMessage) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f9fa; padding: 20px;">
      <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="background-color: #e74c3c; color: white; width: 60px; height: 60px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 24px; margin-bottom: 10px;">
            ⚠️
          </div>
          <h1 style="color: #2c3e50; margin: 0; font-size: 24px;">FashionSmith</h1>
          <p style="color: #7f8c8d; margin: 5px 0;">Customer Complaint</p>
        </div>

        <h2 style="color: #e74c3c; border-bottom: 2px solid #e74c3c; padding-bottom: 10px;">URGENT: Customer Complaint</h2>

        <div style="background-color: #f8d7da; border: 1px solid #f5c6cb; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="color: #721c24; margin: 0; font-weight: bold;">⚠️ This requires immediate attention from management</p>
        </div>

        <div style="background-color: #ecf0f1; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #2c3e50; margin-top: 0;">Customer Information:</h3>
          <p style="margin: 5px 0;"><strong>Name:</strong> ${customerName}</p>
          <p style="margin: 5px 0;"><strong>Email:</strong> <a href="mailto:${customerEmail}" style="color: #e74c3c;">${customerEmail}</a></p>
        </div>

        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; border-left: 4px solid #e74c3c;">
          <h3 style="color: #2c3e50; margin-top: 0;">Complaint Details:</h3>
          <p style="line-height: 1.6; color: #34495e; white-space: pre-wrap;">${customerMessage}</p>
        </div>

        <div style="background-color: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h4 style="color: #155724; margin-top: 0;">Resolution Steps:</h4>
          <ul style="color: #155724; margin: 0; padding-left: 20px;">
            <li>Acknowledge the complaint within 2 hours</li>
            <li>Investigate the issue thoroughly</li>
            <li>Provide appropriate compensation/refund</li>
            <li>Follow up to ensure satisfaction</li>
            <li>Document for quality improvement</li>
          </ul>
        </div>

        <div style="text-align: center; margin-top: 30px;">
          <a href="mailto:${customerEmail}" style="background-color: #e74c3c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; margin: 10px;">
            Respond Immediately
          </a>
          <a href="tel:+2348071167444" style="background-color: #27ae60; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
            Call Customer
          </a>
        </div>

        <hr style="margin: 30px 0; border: none; border-top: 1px solid #ecf0f1;">
        <p style="color: #7f8c8d; font-size: 12px; text-align: center;">
          Customer complaints are opportunities to improve. Handle with care and escalate to management if needed.
        </p>
      </div>
    </div>
  `,

  otherEmail: (customerName, customerEmail, customerMessage) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f9fa; padding: 20px;">
      <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="background-color: #6c757d; color: white; width: 60px; height: 60px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 24px; margin-bottom: 10px;">
            💬
          </div>
          <h1 style="color: #2c3e50; margin: 0; font-size: 24px;">FashionSmith</h1>
          <p style="color: #7f8c8d; margin: 5px 0;">General Message</p>
        </div>

        <h2 style="color: #6c757d; border-bottom: 2px solid #6c757d; padding-bottom: 10px;">New Message Received</h2>

        <div style="background-color: #ecf0f1; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #2c3e50; margin-top: 0;">Sender Information:</h3>
          <p style="margin: 5px 0;"><strong>Name:</strong> ${customerName}</p>
          <p style="margin: 5px 0;"><strong>Email:</strong> <a href="mailto:${customerEmail}" style="color: #6c757d;">${customerEmail}</a></p>
        </div>

        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; border-left: 4px solid #6c757d;">
          <h3 style="color: #2c3e50; margin-top: 0;">Message Content:</h3>
          <p style="line-height: 1.6; color: #34495e; white-space: pre-wrap;">${customerMessage}</p>
        </div>

        <div style="background-color: #d1ecf1; border: 1px solid #bee5eb; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h4 style="color: #0c5460; margin-top: 0;">Response Guidelines:</h4>
          <ul style="color: #0c5460; margin: 0; padding-left: 20px;">
            <li>Review message content carefully</li>
            <li>Categorize appropriately if needed</li>
            <li>Respond within 24 hours</li>
            <li>Provide helpful information</li>
            <li>Offer further assistance</li>
          </ul>
        </div>

        <div style="text-align: center; margin-top: 30px;">
          <a href="mailto:${customerEmail}" style="background-color: #6c757d; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
            Reply to Message
          </a>
        </div>

        <hr style="margin: 30px 0; border: none; border-top: 1px solid #ecf0f1;">
        <p style="color: #7f8c8d; font-size: 12px; text-align: center;">
          This message has been categorized as "Other". Please review and respond appropriately based on the content.
        </p>
      </div>
    </div>
  `,
};

export default sendEmail;

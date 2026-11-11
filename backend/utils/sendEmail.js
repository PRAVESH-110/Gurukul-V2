const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const ejs = require('ejs');
const path = require('path');
const fs = require('fs');

// Create a transporter using Gmail (supports standard App Password or OAuth2)
const createTransporter = async () => {
  // 1. Standard Gmail SMTP via App Password (simplest & standard production setup)
  if (process.env.EMAIL_PASSWORD) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  // 2. OAuth2 Gmail configuration
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_REFRESH_TOKEN) {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      'https://developers.google.com/oauthplayground',
    );

    oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    });

    const accessToken = await new Promise((resolve, reject) => {
      oauth2Client.getAccessToken((err, token) => {
        if (err) {
          reject(new Error('Failed to create access token: ' + err.message));
        }
        resolve(token);
      });
    });

    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.EMAIL_USERNAME,
        accessToken,
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
      },
    });
  }

  throw new Error(
    'No Gmail configuration found. Please set EMAIL_USERNAME and EMAIL_PASSWORD (or GOOGLE_CLIENT_ID & GOOGLE_REFRESH_TOKEN) in backend/.env',
  );
};

// Render email template (helper for templated emails)
const _renderTemplate = async (templateName, data) => {
  try {
    const templatePath = path.join(__dirname, '..', 'views', 'emails', `${templateName}.ejs`);
    const template = fs.readFileSync(templatePath, 'utf-8');
    return ejs.render(template, data);
  } catch (error) {
    console.error('Error rendering email template:', error);
    throw new Error('Failed to render email template', { cause: error });
  }
};

// Send email
const sendEmail = async (options) => {
  try {
    // If no email credentials configured at all in development, log the email content
    const hasCredentials =
      process.env.EMAIL_PASSWORD ||
      (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_REFRESH_TOKEN);

    if (!hasCredentials) {
      console.log('⚠️ [DEV MODE] No EMAIL_PASSWORD configured. Simulating email send:', {
        to: options.to,
        subject: options.subject,
        html: options.html,
      });
      return { message: 'Email logged in dev mode (missing EMAIL_PASSWORD)', simulated: true };
    }

    const transporter = await createTransporter();

    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'Gurukul Platform'}" <${process.env.EMAIL_FROM || process.env.EMAIL_USERNAME}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      attachments: options.attachments,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);
    return { message: 'Email sent successfully', messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email', { cause: error });
  }
};

module.exports = sendEmail;

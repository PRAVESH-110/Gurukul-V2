const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const ejs = require('ejs');
const path = require('path');
const fs = require('fs');

// Create a transporter using Gmail SMTP
const createTransporter = async () => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'https://developers.google.com/oauthplayground',
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    //loading saved refresh token from .env
  });

  const accessToken = await new Promise((resolve, reject) => {
    oauth2Client.getAccessToken((err, token) => {
      if (err) {
        reject('Failed to create access token');
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
    // In development, log the email instead of sending it
    if (process.env.NODE_ENV === 'development') {
      console.log('Email not sent in development mode. Email details:', {
        to: options.to,
        subject: options.subject,
      });
      return { message: 'Email not sent in development mode' };
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

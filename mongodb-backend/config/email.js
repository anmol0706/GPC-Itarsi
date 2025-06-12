const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Create reusable transporter object using SMTP transport
const createTransporter = () => {
  // Check if we have SMTP settings in environment variables
  if (
    !process.env.SMTP_HOST ||
    !process.env.SMTP_PORT ||
    !process.env.SMTP_USER ||
    !process.env.SMTP_PASS
  ) {
    console.warn('SMTP configuration is incomplete. Email functionality will not work properly.');
    console.warn('Please set SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS environment variables.');

    // Return a dummy transporter for development
    if (process.env.NODE_ENV !== 'production') {
      console.log('Using ethereal.email for development testing');

      // Create a test account at ethereal.email for development
      return nodemailer.createTestAccount().then(account => {
        console.log('Ethereal Email credentials:', account);

        return nodemailer.createTransport({
          host: account.smtp.host,
          port: account.smtp.port,
          secure: account.smtp.secure,
          auth: {
            user: account.user,
            pass: account.pass
          }
        });
      }).catch(err => {
        console.error('Failed to create test email account:', err);
        return null;
      });
    }

    return Promise.resolve(null);
  }

  // Create a real SMTP transporter
  console.log('Creating SMTP transporter with settings:');
  console.log('- Host:', process.env.SMTP_HOST);
  console.log('- Port:', process.env.SMTP_PORT);
  console.log('- Secure:', process.env.SMTP_SECURE);
  console.log('- User:', process.env.SMTP_USER);

  const secure = process.env.SMTP_SECURE === 'true' || process.env.SMTP_SECURE === true;
  console.log('- Secure (parsed):', secure);

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10),
    secure: secure, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    tls: {
      // Do not fail on invalid certs
      rejectUnauthorized: false
    }
  });

  return Promise.resolve(transporter);
};

// Send email function
const sendEmail = async (options) => {
  try {
    const transporter = await createTransporter();

    if (!transporter) {
      throw new Error('Email transporter could not be created');
    }

    // Set default from address if not provided
    const from = options.from || `GPC Itarsi <${process.env.SMTP_FROM || process.env.SMTP_USER}>`;

    // Send mail with defined transport object
    const info = await transporter.sendMail({
      from,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html
    });

    console.log('Email sent:', info.messageId);
    console.log('Email sent to:', options.to);

    // If using ethereal.email, log the preview URL
    if (info.ethereal) {
      console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    }

    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    console.error('Error details:', error.message);
    if (error.response) {
      console.error('SMTP Response:', error.response);
    }
    throw error;
  }
};

module.exports = {
  sendEmail
};

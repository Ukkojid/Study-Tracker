const nodemailer = require('nodemailer');
const { logger } = require('./logger');

const sendEmail = async (options) => {
  // 1) Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  // 2) Define the email options
  const mailOptions = {
    from: `Revision Tracker <${process.env.SMTP_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  // 3) Send the email
  try {
    await transporter.sendMail(mailOptions);
    logger.info(`Email sent to ${options.email}`);
  } catch (error) {
    logger.error('Error sending email:', error);
    throw new Error('There was an error sending the email. Try again later!');
  }
};

const sendRevisionReminder = async (user, revision) => {
  const subject = 'Upcoming Revision Reminder';
  const message = `Hello ${user.name},\n\nThis is a reminder that you have a revision scheduled for ${revision.subject} - ${revision.topic} on ${revision.scheduledDate.toLocaleDateString()} at ${revision.scheduledDate.toLocaleTimeString()}.\n\nDuration: ${revision.duration} minutes\nPriority: ${revision.priority}\n\nGood luck with your studies!\n\nBest regards,\nRevision Tracker Team`;

  await sendEmail({
    email: user.email,
    subject,
    message,
  });
};

const sendPasswordResetEmail = async (user, resetToken) => {
  const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
  const message = `Hello ${user.name},\n\nYou requested a password reset. Click the link below to reset your password:\n\n${resetURL}\n\nThis link will expire in 10 minutes.\n\nIf you didn't request this, please ignore this email.\n\nBest regards,\nRevision Tracker Team`;

  await sendEmail({
    email: user.email,
    subject: 'Password Reset Request',
    message,
  });
};

const sendWelcomeEmail = async (user) => {
  const message = `Hello ${user.name},\n\nWelcome to Revision Tracker! We're excited to help you manage your study schedule effectively.\n\nHere are some tips to get started:\n1. Add your subjects and topics\n2. Schedule your first revision\n3. Upload study materials\n4. Track your progress\n\nIf you have any questions, feel free to reach out to our support team.\n\nBest regards,\nRevision Tracker Team`;

  await sendEmail({
    email: user.email,
    subject: 'Welcome to Revision Tracker!',
    message,
  });
};

module.exports = {
  sendEmail,
  sendRevisionReminder,
  sendPasswordResetEmail,
  sendWelcomeEmail,
}; 
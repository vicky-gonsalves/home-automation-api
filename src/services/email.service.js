import nodemailer from 'nodemailer';
import config from '../config/config';
import logger from '../config/logger';

const transportService = nodemailer.createTransport(config.email.smtp);
/* istanbul ignore next */
if (config.env !== 'test') {
  transportService
    .verify()
    .then(() => logger.info('Connected to email server'))
    .catch(() => logger.warn('Unable to connect to email server. Make sure you have configured the SMTP options in .env'));
}

const sendEmailService = async (to, subject, text) => {
  const msg = { from: config.email.from, to, subject, text };
  await transportService.sendMail(msg);
};

const sendResetPasswordEmailService = async (to, token) => {
  const subject = 'Reset password';
  // replace this url with the link to the reset password page of your front-end app
  const resetPasswordUrl = `http://link-to-app/reset-password?token=${token}`;
  const text = `Dear user,
  To reset your password, click on this link: ${resetPasswordUrl}
  If you did not request any password resets, then ignore this email.`;
  await sendEmailService(to, subject, text);
};

module.exports = {
  transportService,
  sendEmailService,
  sendResetPasswordEmailService,
};

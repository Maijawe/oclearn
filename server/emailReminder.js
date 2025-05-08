// emailReminder.js
require('dotenv').config();
const formData = require('form-data');
const Mailgun = require('mailgun.js');

const mailgun = new Mailgun(formData);
const mg = mailgun.client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY,
});

const DOMAIN = process.env.MAILGUN_DOMAIN;

async function sendReminderEmail(to, learnerName) {
  try {
    
    const result = await mg.messages.create(DOMAIN, {
      from: `Oclearn Reminder <reminder@${DOMAIN}>`,
      to,
      subject: `${learnerName} missed their spelling today 📚`,
      text: `Hi! Your child ${learnerName} hasn’t played Oclearn today. Daily practice helps with spelling progress. Encourage them to play now 😊`,
    });

    console.log('Reminder sent to', to, '✅', result.id);
  } catch (err) {
    console.error('❌ Error sending reminder:', err);
  }
}

module.exports = sendReminderEmail;

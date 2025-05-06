const cron = require("node-cron");
const mongoose = require("mongoose");
const dotenv = require('dotenv');
const { Learner } = require("./models/Learner");
const twilio = require("twilio");

// Twilio setup
const accountSid = process.env.TwilioSid;
const authToken = process.env.TwilioAuthenticationToken;
const twilioClient = new twilio(accountSid, authToken);
const twilioPhoneNumber = "+27600193490"; // Your Twilio number

// Connect to MongoDB
mongoose.connect("your_mongo_db_url_here", { useNewUrlParser: true, useUnifiedTopology: true });

const { Learner} = require('./databse');

const today = new Date().toDateString();

// Run every day at 8 PM
cron.schedule("0 17 * * *", async () => {
  console.log("Running reminder job...");

  const learners = await Learner.find();

  for (const learner of learners) {
    const lastLogin = new Date(learner.lastLoginDate).toDateString();
    if (lastLogin !== today) {
      if (learner.parentContact) {
        await twilioClient.messages.create({
          body: `Hi! Your child ${learner.name} hasn’t played Oclearn today. Daily practice helps with spelling progress. Encourage them to play now 😊`,
          from: twilioPhoneNumber,
          to: learner.parentContact, // e.g. +27... (make sure number format is valid)
        });
        console.log(`Reminder sent to ${learner.parentContact}`);
      }
    }
  }
});

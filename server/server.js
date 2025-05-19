const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const authenticateToken = require('./authMiddleware');
const fs = require('fs');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const path = require("path");
const sendReminderEmail = require('./emailReminder');

const app = express();
const port = process.env.PORT || 5000;

dotenv.config();
app.use(cors());// for listening to react requests on port 3000
app.use(express.json()); // for parsing JSON requests
app.use(bodyParser.json());
const Analytics = require("./analyticsModel");

// Serve static files from the React frontend
app.use(express.static(path.join(__dirname, "../frontend/build")));



const upload = multer({ dest: 'uploads/' });
//mongoose.connect('mongodb://127.0.0.1/aiLMSDatabase', { useNewUrlParser: true});
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}); 





const { Learner, LevelWords,DailyAnalytics} = require('./databse');

const updateStreak = async (userId) => {
  const user = await Learner.findById(userId);
  if (!user) return { streakReset: false, user: null };

  const lastLogin = new Date(user.lastLoginDate);
  const today = new Date();

  const lastDate = new Date(lastLogin.getFullYear(), lastLogin.getMonth(), lastLogin.getDate());
  const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const diffInDays = (todayDate - lastDate) / (1000 * 3600 * 24);
  console.log(`Difference in days: ${diffInDays}`);

  let streakReset = false;

  if (diffInDays > 1) {
    user.streak = 1;
    user.cipherStreak = 1;
    streakReset = true;
    console.log("User missed a day. Streak reset to 1.");
  } else if (diffInDays === 1) {
    user.streak += 1;
    user.cipherStreak += 1;
    console.log(`Streak increased! Current streak: ${user.streak}`);
  } else {
    console.log("User already logged in today.");
  }

  user.lastLoginDate = today;
  await user.save();

  return { streakReset, user };
};


app.get("/api/send-reminders", async (req, res) => {
  console.log("reminder route is triggered");

  const today = new Date().toISOString().slice(0, 10);

  try {
    const learners = await Learner.find();

    for (const learner of learners) {
      const lastLogin = learner.lastLoginDate?.toISOString().slice(0, 10);
      if (lastLogin !== today && learner.parentEmail) {
        await sendReminderEmail(learner.parentEmail, learner.name);
      }
      console.log(`📧 ${learner.name} missed today. Email sent to: ${learner.parentEmail}`);
    }

    res.status(200).json({ message: "Reminders sent successfully!" });
  } catch (err) {
    console.error("Error sending reminders:", err);
    res.status(500).json({ error: "Failed to send reminders" });
  }
});




app.post("/api/updatecipher", authenticateToken, async (req, res) => {
  try {
    const { cipherKeys, cipherStreak } = req.body;

    
    console.log("Updating cipherKeys:", cipherKeys, "cipherStreak:", cipherStreak);

    const updated = await Learner.findByIdAndUpdate(
      req.userId,
      {
        $set: {
          cipherKeys,
          cipherStreak,
        },
      },
      { new: true }
    );

    if (!updated) throw new Error("User not found");
    res.json({ message: "Cipher data updated", updated });
  } catch (err) {
    console.error("Error updating cipher data:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});




app.get("/api/startgame", authenticateToken, async (req, res) => {
  try {
    const learner = await Learner.findById(req.userId);
    if (!learner) return res.status(404).json({ error: "Learner not found" });

    const { level, streak, stars, cipherKeys, cipherStreak, currentDailyStars, highestStars } = learner;

    // Fetch level words
    const levelDoc = await LevelWords.findOne({ level });
    const levelWords = levelDoc?.words || [];

    // If no words for the level, return a flag
    if (levelWords.length === 0) {
      console.log(`🚧 No words for level ${level}`);
      return res.status(200).json({
        levelAvailable: false,
        level,
        message: `Level ${level} is under construction`
      });
    }

    res.status(200).json({
      levelAvailable: true,
      levelWords,
      streak,
      cipherStreak,
      stars,
      cipherKeys,
      level,
      highestStars
    });
  } catch (error) {
    console.error("Error in /api/startgame:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


// send data to db
app.post("/api/senddata", authenticateToken, async (req, res) => {
  try {
    console.log("Received data:", req.body);

    //send levels to analytics model if level 3 completed
    const alreadyLogged = await Analytics.findOne({
      userId: req.userId,
      eventType: "level_complete",
      level: 3
    });
    
    if (!alreadyLogged && req.body.level === 4) {
      await Analytics.create({
        userId: req.userId,
        eventType: "level_complete",
        level: 3,
      });
    }

    const data = await Learner.findByIdAndUpdate(
      req.userId,
      {
        $set: {
          stars: req.body.stars,
          level: req.body.level,
          cipherKeys: req.body.cipherKeys
        },
        $push: {
          wordsIKnow: { $each: req.body.wordsIknow }
        }
      },
      { new: true, useFindAndModify: false }
    );

    const learner = await Learner.findById(req.userId);

if (learner) {
  const currentStars = req.body.currentDailyStars;
  const previousHigh = learner.highestStars || 0;

  if (currentStars > previousHigh) {
    learner.highestStars = currentStars;
    await learner.save();
    console.log("🔥 New high score saved:", currentStars);
  } else {
    console.log("⭐ Current stars did not beat highestStars:", previousHigh);
  }
}

    res.json({ message: "Data received successfully", data });
  } catch (err) {
    console.error("Error updating learner:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});







// Get the streak of the user
app.get("/api/updatestreak", authenticateToken, async (req, res) => {
  const userId = req.userId;
  console.log(`UserId: ${userId}`);

  try {
    const { streakReset, user } = await updateStreak(userId);

    if (!user) return res.status(404).json({ error: "User not found" });

    console.log(`Streak is: ${user.streak}, CipherStreak: ${user.cipherStreak}, Streak Reset: ${streakReset}`);

    res.status(200).json({
      streak: user.streak,
      cipherStreak: user.cipherStreak,
      streakReset, // 🔥 now returned to frontend
    });
  } catch (error) {
    console.error("Error updating streak:", error);
    res.status(500).json({ error: "Failed to update streak" });
  }
});



app.get('/api/analytics/level3-completions', async (req, res) => {
  try {
    const users = await Analytics.find({
      eventType: "level_complete",
      level: 4,
    }).distinct("userId");

    res.json({
      level3Completions: users.length,
      userIds: users, // optional: remove this line if you only want the count
    });
  } catch (err) {
    console.error("Error fetching level 3 completions:", err);
    res.status(500).json({ message: "Failed to fetch level 3 completions" });
  }
});



app.get('/api/analytics/daily-logins', async (req, res) => {
  try {
    const start = new Date();
    start.setHours(0, 0, 0, 0); // today at 00:00

    const end = new Date();
    end.setHours(23, 59, 59, 999); // today at 23:59

    // Find unique userIds who logged in today
    const dailyUsers = await Analytics.find({
      eventType: "login",
      timestamp: { $gte: start, $lte: end },
    }).distinct("userId");

    res.json({
      date: start.toISOString().slice(0, 10),
      dailyActiveUsers: dailyUsers.length,
      userIds: dailyUsers, // optional: show the actual IDs
    });
  } catch (error) {
    console.error("Error fetching daily logins:", error);
    res.status(500).json({ message: "Error getting daily active users" });
  }
});

app.get("/api/analytics/daily-snapshot", async (req, res) => {
  try {
    // Get today's full date range
    const start = new Date();
    start.setHours(0, 0, 0, 0); // 00:00:00.000

    const end = new Date();
    end.setHours(23, 59, 59, 999); // 23:59:59.999

    const todayString = start.toISOString().slice(0, 10); // "YYYY-MM-DD"

    // ✅ Get today's active users using date range
    const dailyUsers = await Learner.find({
      lastLoginDate: { $gte: start, $lte: end }
    });

    const dailyActiveUsers = dailyUsers.length;

    // ✅ Streak cohorts
    let under3 = 0, between3And20 = 0, between21And40 = 0, over40 = 0;

    const allLearners = await Learner.find();

    allLearners.forEach((l) => {
      const s = l.streak || 0;
      if (s < 3) under3++;
      else if (s >= 3 && s <= 20) between3And20++;
      else if (s >= 21 && s <= 40) between21And40++;
      else over40++;
    });

    // ✅ Average session duration
    let totalDuration = 0;
    let totalSessions = 0;

    allLearners.forEach((l) => {
      if (Array.isArray(l.sessions)) {
        l.sessions.forEach((s) => {
          totalDuration += s.duration || 0;
          totalSessions++;
        });
      }
    });

    const averageSessionDuration =
      totalSessions > 0 ? Math.round(totalDuration / totalSessions) : 0;

    // ✅ Save analytics snapshot
    await DailyAnalytics.findOneAndUpdate(
      { date: todayString },
      {
        date: todayString,
        dailyActiveUsers,
        streakCohorts: { under3, between3And20, between21And40, over40 },
        averageSessionDuration
      },
      { upsert: true }
    );

    res.json({
      message: "Analytics snapshot saved",
      data: {
        date: todayString,
        dailyActiveUsers,
        streakCohorts: { under3, between3And20, between21And40, over40 },
        averageSessionDuration
      }
    });
  } catch (error) {
    console.error("Error generating daily analytics:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/api/analytics/all", async (req, res) => {
  try {
    const analytics = await DailyAnalytics.find({}).sort({ date: -1 }); // newest first
    res.json(analytics);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});


app.post("/api/session/end", authenticateToken, async (req, res) => {
  try {
    const { duration } = req.body;
    if (!duration) return res.status(400).json({ error: "Missing duration" });

    const learner = await Learner.findById(req.userId);
    if (!learner) return res.status(404).json({ error: "Learner not found" });

    learner.sessions.push({ duration });
    await learner.save();

    res.json({ message: "Session duration saved" });
  } catch (err) {
    console.error("Error saving session duration:", err);
    res.status(500).json({ error: "Server error" });
  }
});



app.post("/api/levels", async (req, res) => {
  const { level, words } = req.body;

  // Basic validation
  if (!level || !Array.isArray(words) || words.length !== 10) {
    return res.status(400).json({
      message: "Level and exactly 10 words are required.",
    });
  }

  try {
    // Check if this level already exists
    const existing = await LevelWords.findOne({ level });
    if (existing) {
      return res.status(400).json({
        message: `Level ${level} already exists. Please choose a different level or update it.`,
      });
    }

    // Save new level
    const newLevel = new LevelWords({ level, words });
    await newLevel.save();

    res.status(201).json({
      message: `Level ${level} added successfully.`,
      levelData: newLevel,
    });
  } catch (error) {
    console.error("Error adding level:", error);
    res.status(500).json({ message: "Server error" });
  }
});




app.post("/api/login", async (req, res) => {
  const { username, pin } = req.body;

  if (!username || !pin) {
    return res.status(400).json({ message: "Please enter both username and pin." });
  }

  try {
    // Check if learner exists
    const learner = await Learner.findOne({ username });
    if (!learner) {
      console.log("Username not found:", username);
      return res.status(401).json({ message: "Invalid username or pin" });
    }

    // Compare PIN
    const isMatch = await bcrypt.compare(pin.toString(), learner.pin);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid username or pin" });
    }

    // Generate JWT
    const token = jwt.sign({ userId: learner._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // (Optional) Log event
    await Analytics.create({
      userId: learner._id.toString(),
      eventType: "login",
    });

    console.log("Login successful for:", username);
    return res.status(200).json({ token, message: "Login successful" });

  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "An error occurred during login" });
  }
});


app.post("/api/register", async (req, res) => {
  const { name, username, pin, parentContact , parentEmail } = req.body;

  // Basic validation
  if (!name || !username || !pin || !parentContact || !parentEmail) {
    return res.status(400).json({ message: "Please fill in all required fields." });
  }

  try {
    // Check if username already exists
    const existingUser = await Learner.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username already taken. Please choose another." });
    }

    // Hash the PIN before storing
    const saltRounds = 10;
    const hashedPin = await bcrypt.hash(pin.toString(), saltRounds);

    const learner = new Learner({
      name: name,
      username:username,
      pin: hashedPin,
      contacts: parentContact,
      parentEmail : parentEmail
    });

    await learner.save();
    console.log("Successfully registered:", username);

    const token = jwt.sign({ userId: learner._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    
    res.status(201).json({ message: "Successfully registered!", token });
    

  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Something went wrong. Please try again later." });
  }
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
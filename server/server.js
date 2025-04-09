const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const authenticateToken = require('./authMiddleware');
const fs = require('fs');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const path = require("path");

const app = express();
const port = 5000;

dotenv.config();
app.use(cors());// for listening to react requests on port 3000
//app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
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




const { Learner,Level1Words ,Level2Words , Level3Words} = require('./databse');

const updateStreak = async (userId) => {
  const user = await Learner.findById(userId); // Ensure correct model name
  if (!user) return console.log("User not found");

  const lastLogin = new Date(user.lastLoginDate);
  const today = new Date();
  
  const lastDate = new Date(lastLogin.getFullYear(), lastLogin.getMonth(), lastLogin.getDate());
  const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  
  // Calculate difference in days
  const diffInTime = todayDate.getTime() - lastDate.getTime();
  const diffInDays = diffInTime / (1000 * 3600 * 24);

  console.log(`Difference in days: ${diffInDays}`);

  if (diffInDays > 1) {
    user.streak = 1; // Reset streak
    user.cipherStreak = 1
    console.log("User missed a day. Streak reset to 1.");
  } else if (diffInDays === 1) {
    user.streak += 1; // Increment streak
    user.cipherStreak +=1
    console.log(`Streak increased! Current streak: ${user.streak}`);
  } else {
    console.log("User already logged in today.");
  }

  user.lastLoginDate = today;
  await user.save();
};

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build/index.html"));
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




//get all the details to start the game
app.get("/api/startgame", authenticateToken, async (req, res) => {
  try {
    const learner = await Learner.findById(req.userId);
    if (!learner) return res.status(404).json({ error: "Learner not found" });

    const { level, streak, stars, cipherKeys , cipherStreak } = learner;
    let levelWords = [];

    if (level === 1) {
      const level1Doc = await Level1Words.findOne({}); // Fetch the first document
      if (level1Doc) {
        levelWords = level1Doc.words; // Extract the `words` array
      }
      console.log("Fetched Level 1 Words:", levelWords);
    } else if (level === 2) {
      const level2Doc = await Level2Words.findOne({}); // Fetch the first document
      if (level2Doc) {
        levelWords = level2Doc.words; // Extract the `words` array
      }
      console.log("Fetched Level 2 Words:", levelWords);
    } else if (level === 3) {
      const level3Doc = await Level3Words.findOne({}); // Fetch the first document
      if (level3Doc) {
        levelWords = level3Doc.words; // Extract the `words` array
      }
      console.log("Fetched Level 3 Words:", levelWords);
    }
    else if(level ===4){
      levelWords = []
    }
    
    else {
      console.log("Unexpected level:", level);
      return res.status(400).json({ error: "Invalid level" });
    }

    // Fallback if no words are found
    if (levelWords.length === 0) {
      console.log("No words found for level:", level);
      //levelWords = ["default", "words", "for", "this", "level"]; // Fallback words
    }

    console.log(`levelWords: ${levelWords.length}, streak: ${streak}, stars: ${stars}, cipherKeys: ${cipherKeys}, level: ${level}`);

    res.json({ levelWords, streak, cipherStreak, stars, cipherKeys, level });
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
    await updateStreak(userId);
    const updatedUser = await Learner.findById(userId); // Ensure correct model name
    console.log(`Streak is: ${updatedUser.streak}`);
    res.status(200).json({ streak: updatedUser.streak });
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
  const { name, username, pin, parentContact } = req.body;

  // Basic validation
  if (!name || !username || !pin || !parentContact) {
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
    });

    await learner.save();
    console.log("Successfully registered:", username);
    res.status(201).json({ message: "Successfully registered!" });

  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Something went wrong. Please try again later." });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
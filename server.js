const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 5000,
  family: 4
})
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB error:", err));

  const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("./models/User");
const Entry = require("./models/Entry");

// SIGNUP
app.post("/signup", async (req, res) => {
  const { username, password } = req.body;
  
  const existing = await User.findOne({ username });
  if (existing) return res.json({ error: "Username already taken" });
  
  const hashed = await bcrypt.hash(password, 10);
  const user = new User({ username, password: hashed });
  await user.save();
  
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
  res.json({ token });
});

// LOGIN
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  
  const user = await User.findOne({ username });
  if (!user) return res.json({ error: "User not found" });
  
  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.json({ error: "Wrong password" });
  
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
  res.json({ token });
});

// MIDDLEWARE - verify token
function authenticate(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.json({ error: "No token" });
  
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.userId = decoded.userId;
  next();
}

// SAVE ENTRY
app.post("/entries", authenticate, async (req, res) => {
  const entry = new Entry({
    userId: req.userId,
    content: req.body.content,
    mood: req.body.mood
  });
  await entry.save();
  res.json(entry);
});

// GET ALL ENTRIES
app.get("/entries", authenticate, async (req, res) => {
  const entries = await Entry.find({ userId: req.userId }).sort({ createdAt: -1 });
  res.json(entries);
});

// DELETE ENTRY
app.delete("/entries/:id", authenticate, async (req, res) => {
  await Entry.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

// AI ANALYSIS
app.post("/analyze", authenticate, async (req, res) => {
  const entries = await Entry.find({ userId: req.userId });
  const allEntries = entries.map(e => e.content).join("\n\n");

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + process.env.GROQ_API_KEY
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are a compassionate AI therapist analyzing someone's diary entries. 
Identify emotional patterns, recurring themes, and give warm honest insights.
Format your response with these sections:
🌊 EMOTIONAL PATTERNS
💭 RECURRING THEMES  
💡 INSIGHTS FOR YOU
🌱 ONE THING TO FOCUS ON`
        },
        {
          role: "user",
          content: allEntries
        }
      ]
    })
  });

  const data = await response.json();
  res.json({ result: data.choices[0].message.content });
});
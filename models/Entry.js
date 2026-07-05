const mongoose = require("mongoose");

const EntrySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  content: String,
  mood: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Entry", EntrySchema);
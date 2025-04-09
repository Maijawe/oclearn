// models/analyticsModel.js
const mongoose = require("mongoose");

const analyticsSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  eventType: {
    type: String,
    enum: ["login", "level_complete"],
    required: true,
  },
  level: Number, // optional, only for level_complete
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const Analytics = mongoose.model("Analytics", analyticsSchema);

module.exports = Analytics;

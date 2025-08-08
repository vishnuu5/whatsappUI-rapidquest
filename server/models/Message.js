const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  wa_id: {
    type: String,
    required: true,
  },
  message_id: {
    type: String,
    required: true,
    unique: true,
  },
  text: {
    type: String,
    required: false,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  type: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["sent", "delivered", "read", "failed", "pending"],
    default: "pending",
  },
  direction: {
    type: String,
    enum: ["inbound", "outbound"],
    required: true,
  },
  meta_msg_id: {
    type: String,
    required: false,
  },
  userName: {
    type: String,
    required: false,
  },
  raw_payload: {
    type: Object,
    required: false,
  },
});

MessageSchema.index({ wa_id: 1, timestamp: -1 });

module.exports = mongoose.model("Message", MessageSchema);

const express = require("express");
const {
  processWebhookPayload,
  getConversations,
  getMessagesByWaId,
  sendMessage,
} = require("../controllers/chatController");
const router = express.Router();

router.post("/webhook", processWebhookPayload);
router.get("/conversations", getConversations);
router.get("/messages/:wa_id", getMessagesByWaId);
router.post("/send-message", sendMessage);

module.exports = router;

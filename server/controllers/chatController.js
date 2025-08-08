const Message = require("../models/Message");

let io;

const setSocketIO = (socketIO) => {
  io = socketIO;
};

const processWebhookPayload = async (req, res) => {
  const payload = req.body;
  console.log("Received webhook payload:", JSON.stringify(payload, null, 2));

  try {
    const entryData =
      payload.entry || (payload.metaData && payload.metaData.entry);

    if (
      entryData &&
      entryData[0] &&
      entryData[0].changes &&
      entryData[0].changes[0]
    ) {
      const change = entryData[0].changes[0];
      console.log("Processing change field:", change.field);

      if (change.field === "messages") {
        const value = change.value;

        let wa_id = null;
        let userName = null;

        // Extract wa_id and userName only if 'contacts' array exists (for incoming messages)
        if (value.contacts && value.contacts.length > 0) {
          wa_id = value.contacts[0].wa_id;
          userName = value.contacts[0].profile.name;
        } else if (value.statuses && value.statuses.length > 0) {
          wa_id = value.statuses[0].recipient_id;
        }

        console.log("Extracted wa_id:", wa_id, "User Name:", userName);

        // Handle incoming messages
        if (value.messages && value.messages.length > 0) {
          const msg = value.messages[0];
          const message_id = msg.id;
          const message_type = msg.type;
          let message_text = "";

          if (message_type === "text") {
            message_text = msg.text.body;
          } else {
            message_text = `[${message_type} message]`;
          }

          const newMessage = new Message({
            wa_id: wa_id,
            message_id: message_id,
            text: message_text,
            timestamp: new Date(parseInt(msg.timestamp) * 1000),
            type: message_type,
            status: "delivered",
            direction: "inbound",
            userName: userName,
            raw_payload: payload,
          });

          console.log("Attempting to save new inbound message:", newMessage);
          await newMessage.save();
          console.log("New inbound message saved:", newMessage);
          io.emit("newMessage", newMessage);
          io.emit("updateConversations");
        }

        // Handle status updates
        if (value.statuses && value.statuses.length > 0) {
          const status = value.statuses[0];
          const message_id_to_update = status.id;
          const new_status = status.status;
          const timestamp = new Date(parseInt(status.timestamp) * 1000);

          console.log(
            `Attempting to update message ID: ${message_id_to_update} to status: ${new_status}`
          );
          const updatedMessage = await Message.findOneAndUpdate(
            { message_id: message_id_to_update },
            { status: new_status, timestamp: timestamp },
            { new: true }
          );

          if (updatedMessage) {
            console.log("Message status updated:", updatedMessage);
            io.emit("messageStatusUpdate", updatedMessage);
            io.emit("updateConversations");
          } else {
            console.log(
              `Message with ID ${message_id_to_update} not found for status update.`
            );
          }
        }
      }
    }

    res.status(200).send("Webhook received and processed");
  } catch (err) {
    console.error("Error processing webhook:", err.message, err.stack);
    res.status(500).send("Error processing webhook");
  }
};

const getConversations = async (req, res) => {
  try {
    const conversations = await Message.aggregate([
      { $sort: { timestamp: -1 } },
      {
        $group: {
          _id: "$wa_id",
          lastMessage: { $first: "$$ROOT" },
          inboundUserNames: {
            $addToSet: {
              $cond: {
                if: { $eq: ["$direction", "inbound"] },
                then: "$userName",
                else: "$$REMOVE",
              },
            },
          },
        },
      },
      {
        $project: {
          _id: "$_id",
          message_id: "$lastMessage.message_id",
          text: "$lastMessage.text",
          timestamp: "$lastMessage.timestamp",
          type: "$lastMessage.type",
          status: "$lastMessage.status",
          direction: "$lastMessage.direction",
          userName: {
            $cond: {
              if: { $ne: [{ $size: "$inboundUserNames" }, 0] },
              then: { $arrayElemAt: ["$inboundUserNames", 0] },
              else: {
                $cond: {
                  if: "$lastMessage.userName",
                  then: "$lastMessage.userName",
                  else: { $concat: ["User ", "$_id"] },
                },
              },
            },
          },
        },
      },
      { $sort: { timestamp: -1 } },
    ]);

    res.json(conversations);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};
const getMessagesByWaId = async (req, res) => {
  try {
    const { wa_id } = req.params;
    const messages = await Message.find({ wa_id }).sort({ timestamp: 1 });
    res.json(messages);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

const sendMessage = async (req, res) => {
  const { wa_id, text, clientMessageId, contactUserName } = req.body;

  try {
    const newMessage = new Message({
      wa_id,
      message_id: `outbound-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 9)}`,
      text,
      timestamp: new Date(),
      type: "text",
      status: "sent",
      direction: "outbound",
      userName: "You",
    });

    await newMessage.save();
    console.log("New outbound message saved:", newMessage);
    io.emit("newMessage", { ...newMessage.toObject(), clientMessageId });
    io.emit("updateConversations");
    setTimeout(async () => {
      try {
        const replyText = `Got it! This is an automated reply from ${
          contactUserName || `User ${wa_id}`
        }.`;
        const replyMessage = new Message({
          wa_id: wa_id,
          message_id: `inbound-reply-${Date.now()}-${Math.random()
            .toString(36)
            .substring(2, 9)}`,
          text: replyText,
          timestamp: new Date(),
          type: "text",
          status: "delivered",
          direction: "inbound",
          userName: contactUserName || `User ${wa_id}`,
        });
        await replyMessage.save();
        console.log("Simulated inbound reply saved:", replyMessage);
        io.emit("newMessage", replyMessage);
        io.emit("updateConversations");
      } catch (replyError) {
        console.error("Error simulating reply:", replyError.message);
      }
    }, 2000);

    res.status(201).json(newMessage);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

module.exports = {
  setSocketIO,
  processWebhookPayload,
  getConversations,
  getMessagesByWaId,
  sendMessage,
};

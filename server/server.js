require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./utils/db");
const chatRoutes = require("./routes/chatRoutes");
const { setSocketIO } = require("./controllers/chatController");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "https://whatsapp-ui-rapidquest.vercel.app",
    methods: ["GET", "POST"],
  },
});

setSocketIO(io);
connectDB();

app.use(cors());
app.use(express.json());

app.use("/api", chatRoutes);

app.get("/", (req, res) => {
  res.send("WhatsApp Web Clone Backend API is running!");
});

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));


require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const color = require("colors");
const user_routes = require("./routes/user-routes");
const chat_routes = require("./routes/chat-routes");
const message_routes = require("./routes/messageRoutes");
const notification_routes = require("./routes/notification-routes");
const path = require("path");
const Notification = require("./models/NotificationModel");
const User = require("./models/UserModel");
const protected = require("./middleware/AuthMiddleware");

const app = express();

// middleware
app.use(express.json());
app.use((req, res, next) => {
  console.log(req.method, req.path);
  next();
});

// routes
app.use("/api/user", user_routes);
app.use("/api/chat", chat_routes);
app.use("/api/message", message_routes);
app.use("/api/notification", notification_routes);

// ---------------Deployment ----------------

const __dirname1 = path.resolve();

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname1, "../front-end/build")));

  app.get("*", (req, res) => {
    res.sendFile(
      path.resolve(__dirname1, "../front-end", "build", "index.html")
    );
  });
} else {
  app.get("/", (req, res) => {
    res.send("Api is Running Successfully");
  });
}

app.use((req, res, next) => {
  res.status(404);
  // Redirect to '/' on 404 error
  res.redirect("/");
  next();
});
//---------------Deployment ----------------

// connecting to database
mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log("Connected to MongoDB".cyan.underline);
});

// listening on port 4000
const server = app.listen(process.env.PORT, () => {
  console.log("Listining for requests".yellow.bold);
});

// now for soketIO
const io = require("socket.io")(server, {
  pingTimout: 60000,
  cors: {
    origin: "https://chatapp-ca25.onrender.com",
  },
});

// create a connection
io.on("connection", async (socket) => {
  console.log("connected to socket.io");

  // seting up socketio
  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
  });

  //create room
  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User Joined Room: " + room);
  });

  // to see if the user is typing or not
  socket.on("typing", (room) => {
    socket.in(room).emit("typing");
  });

  // to see if the user is typing or not
  socket.on("stop typing", (room) => {
    socket.in(room).emit("stop typing");
  });

  // sendes the newmessage to all users in the room exept the user currently logged in
  socket.on("new message", async (newMessageRecieved) => {
    var chat = newMessageRecieved.chat;

    if (!chat.users) {
      return console.log("chat.users not defiend");
    }

    // Create notification for the sender

    /// end of it

    chat.users.forEach((user) => {
      if (user._id == newMessageRecieved.sender._id) {
        return;
      }
      socket.in(user._id).emit("message recieved", newMessageRecieved);
    });

    console.log("----------start", newMessageRecieved, "---------end");
  });

  socket.off("setup", () => {
    console.log("USER DISCONNECTED");
    socket.leave(userData._id);
  });
});

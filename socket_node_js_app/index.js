const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");

const server = http.createServer(app);
const io = new Server(server);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

let users = [];

io.on("connection", (socket) => {
  socket.emit("user list", users);
  io.emit("connection", "A user has connected");

  socket.on("set nickname", (name) => {
    socket.nickname = name;
    if (!users.includes(name.toLowerCase())) {
      users.push(name.toLowerCase());
      socket.emit("set nickname", name);
      io.emit("new user connected", name);
    } else {
      socket.emit("set nickname", "invalid");
    }
    io.emit("user list", users);
    socket.id = name;
  });

  socket.on("messages", (message) => {
    console.log(message);
    socket.broadcast.emit("messages", {
      message: message,
      username: socket.id,
    });
  });

  socket.on("user typing", () => {
    socket.broadcast.emit("user typing", socket.id);
  });

  socket.on("user not typing", () => {
    socket.broadcast.emit("user not typing", socket.id);
  });

  socket.on("disconnect", () => {
    socket.broadcast.emit("user disconnected", {
      nickname: socket.id,
      text: "has disconnected",
    });
    const indexOfDisconnectedUser = users.indexOf(socket.id);
    users.splice(indexOfDisconnectedUser, 1);
    io.emit("user list", users);
  });
});

server.listen(3000, () => {
  console.log("listening on http://localhost:3000");
});

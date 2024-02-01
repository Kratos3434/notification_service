const port = process.env.PORT || 8081;
const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
  },
});
const user = require("./controller/user");

let users = [];

const findUser = (email) => {
  return users.find((e) => {
    return e.email == email;
  });
};

io.on("connection", (socket) => {
  console.log("A user connected");
  socket.on("join", async (data) => {
    socket.data.email = data.email;
    let notifications = null;
    if (!findUser(socket.data.email)) {
      users.push({ email: socket.data.email });
    }
    socket.join(data.email);
    // socket.to(data.email).emit("notifications", {
    //   notifications,
    // });
    // socket.emit("notifications", {
    //   notifications
    // })
    console.log("Users:", users);
  });

  socket.on("like", async (data) => {
    console.log("Like event");
    if (data.recipientId != data.senderId) {
      const notification = await user.sendNotification(
        data.senderId,
        data.recipientId,
        data.type,
        `${data.sender} has liked your post`,
        data.postId
      );
      if (notification) {
        socket.to(data.recipient).emit("notifications", {
          notifications: null,
        });
      }
    }
  });

  socket.on("disconnect", () => {
    console.log(`Disconnected: ${socket.data.email}`);
    users = users.filter((e) => e.email !== socket.data.email);
    console.log("Disconnect:", users);
    console.log("A user disconnected");
  });
});

server.listen(port, () => console.log(`Server listening on port ${port}`));

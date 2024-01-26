const port = process.env.PORT || 8080;
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000"
  }
});

let users = [];

io.on('connection', (socket) => {
  console.log("A user connected");
  socket.on('join', (data) => {
    socket.data.email = data.email;
    if (!users.find((e) => {
      return e.email === socket.data.email;
    })) {
      users.push({email: socket.data.email, notifications: []});
    }
    console.log("Users:", users);
    socket.join(data.email);
  })

  socket.on("like", (data) => {
    console.log("Like event")
    const idx = users.findIndex(e => e.email === data.to);
    users[idx].notifications.push(`${data.liker} has liked your post`);
    socket.to(data.to).emit('notif', {
      notifications: users[idx].notifications
    })
  })
  socket.on('disconnect', () => {
    console.log(`Disconnected: ${socket.data.email}`);
    users = users.filter(e => e.email !== socket.data.email);
    console.log("Disconnect:", users);
    console.log("A user disconnected");
  })

})

server.listen(port, () => console.log(`Server listening on port ${port}`));
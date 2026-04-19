import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("user connected:", socket.id);

  socket.on("message", (msg) => {
    console.log("client msg:", msg);

    // echo user message
    socket.emit("message", {
      id: Date.now(),
      sender: "user",
      text: msg,
    });

    // bot reply
    setTimeout(() => {
      socket.emit("message", {
        id: Date.now() + 1,
        sender: "support",
        text: "Xin chào, bộ phận hỗ trợ đang tiếp nhận yêu cầu của bạn. Vui lòng chờ trong giây lát…",
      });
    }, 800);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected:", socket.id);
  });
});

server.listen(4000, () => {
  console.log("Server + Socket running on 4000");
});
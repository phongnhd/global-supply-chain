import "dotenv/config";
import http from "http";
import { Server } from "socket.io";
import app from "./app.js";

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: true,
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("user connected:", socket.id);
  socket.on("join_product", (productId: string) => {
    socket.join(productId);
    console.log(`Joined room: ${productId}`);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected:", socket.id);
  });
});

const port = Number(process.env.PORT) || 4000;

server.listen(port, () => {
  console.log(`API + Socket running on http://localhost:${port}`);
});
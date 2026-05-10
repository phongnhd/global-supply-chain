import { Server } from "socket.io";
import http from "http";
import { registerChatSocket } from "./chat.socket.js";

let io: Server;

export const initSocket = (server: http.Server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  console.log("Socket initialized");

  registerChatSocket(io);
};

export const getIO = () => io;
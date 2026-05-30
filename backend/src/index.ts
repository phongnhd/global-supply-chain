import "dotenv/config";
import http from "http";
import { Server } from "socket.io";

import app from "./app.js";
import airportsRoute from "./routes/airports.js";
import seaportsRoute from "./routes/seaports.js";
import agentRouter from "./routes/agent.route.js";

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: true,
    credentials: true,
  },
});

// Routes
app.use("/api/agent", agentRouter);
app.use("/api/airports", airportsRoute);
app.use("/api/seaports", seaportsRoute);

io.on("connection", (socket) => {
  console.log("connected:", socket.id);

  socket.on("join_product", (productId: string) => {
    socket.join(productId);
  });

  socket.on("disconnect", () => {
    console.log("disconnected:", socket.id);
  });
});

app.get("/", (_, res) => {
  res.json({
    message: "Supply Chain API Running",
  });
});

const port = Number(process.env.PORT) || 4000;

server.listen(port, () => {
  console.log(`http://localhost:${port}`);
});
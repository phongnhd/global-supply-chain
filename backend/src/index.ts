import "dotenv/config";

import http from "http";
import { Server } from "socket.io";
import { AgentService } from "../../agent/agent.service.js";
import app from "./app.js";
import airportsRoute from "./routes/airports.js";
import seaportsRoute from "./routes/seaports.js";

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: true,
    credentials: true,
  },
});
const agent = new AgentService();
app.post("/api/agent/process-document", async (req, res) => {
  try {
    const { filePath } = req.body;

    const result = await agent.processDocument(filePath);

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});
app.use("/api/airports", airportsRoute);
app.use("/api/seaports", seaportsRoute);

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

app.get("/", (_, res) => {
  res.json({
    message: "Supply Chain API Running",
  });
});

const port = Number(process.env.PORT) || 4000;

server.listen(port, () => {
  console.log(`running on http://localhost:${port}`);
});

import "dotenv/config";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { apiV1Router } from "./routes/api.v1.js";
import cookieParser from "cookie-parser";
const app = express();

app.use(cookieParser());
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "2mb" }));

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "global-backend" });
});

app.use("/api/v1", apiV1Router);

export default app;
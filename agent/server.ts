import dotenv from "dotenv";

dotenv.config();

import express from "express";
import { AgentService } from "./agent.service.js";

const app = express();

app.use(express.json());

const agentService = new AgentService();

app.post("/process-document", async (req, res) => {
  try {
    const { filePath } = req.body;

    console.log("FILE PATH:", filePath);

    const result = await agentService.processDocument(filePath);

    return res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error("AGENT SERVER ERROR:", error);

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

app.listen(5001, () => {
  console.log("AGENT SERVICE RUNNING: 5001");
});

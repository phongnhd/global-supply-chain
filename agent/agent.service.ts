import { ocrTool } from "./tools/ocr.js";
import { documentPrompt } from "./prompts/document.prompt.js";
import { documentSchema } from "./schemas/document.schema.js";

export class AgentService {
  async processDocument(filePath: string) {
    try {
      console.log("FILE PATH:", filePath);

      const text = await ocrTool(filePath);
      console.log("OCR TEXT:", text);

      if (!text || text.trim().length === 0) {
        throw new Error("OCR empty");
      }

      const result = await this.callOllama(documentPrompt, text);
      console.log("OLLAMA OUTPUT:", result);

      const cleaned = result
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      console.log("CLEANED OUTPUT:", cleaned);

      const parsed = JSON.parse(cleaned);
      const normalized = this.normalizeDocument(parsed);
      const validated = documentSchema.safeParse(normalized);

      if (!validated.success) {
        console.error("VALIDATION ERROR:", validated.error.format());
        throw new Error("Invalid AI response structure");
      }

      return validated.data;
    } catch (err: any) {
      console.error("AGENT ERROR:", err);
      throw err;
    }
  }

  private async callOllama(prompt: string, input: string) {
    const res = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "qwen2.5:3b",
        stream: false,
        prompt: `
${prompt}

---
INPUT:
${input}
          `,
      }),
    });

    if (!res.ok) {
      throw new Error(`Ollama API error: ${res.status}`);
    }

    const data = await res.json();
    return data.response;
  }

  private normalizeDocument(data: Record<string, unknown>) {
    const transport = String(data.transportMethod || "").toLowerCase();

    if (transport.includes("air") || transport.includes("flight")) {
      data.transportMethod = "Air Freight";
    } else if (
      transport.includes("sea") ||
      transport.includes("ocean") ||
      transport.includes("vessel") ||
      transport.includes("maritime")
    ) {
      data.transportMethod = "Sea Freight";
    } else if (transport.includes("rail") || transport.includes("train")) {
      data.transportMethod = "Rail Freight";
    } else if (!data.transportMethod) {
      data.transportMethod = null;
    }

    return data;
  }
}

import { ocrTool } from "./tools/ocr";
import { documentPrompt } from "./prompts/document.prompt";

export class AgentService {
  async processDocument(filePath: string) {
    try {
      console.log("FILE PATH:", filePath);

      // OCR
      const text = await ocrTool(filePath);
      console.log("OCR TEXT:", text);

      if (!text || text.trim().length === 0) {
        throw new Error("OCR empty");
      }

      // CALL OLLAMA (LOCAL LLM)
      const result = await this.callOllama(documentPrompt, text);

      console.log("OLLAMA OUTPUT:", result);

      // clean JSON
      const cleaned = result
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      console.log("CLEANED OUTPUT:", cleaned);

      // parse
      const data = JSON.parse(cleaned);

      return data;

    } catch (err: any) {
      console.error("AGENT ERROR:", err);
      throw err;
    }
  }

  private async callOllama(prompt: string, input: string) {
    const res = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama3",
        stream: false,
        prompt: `
${prompt}

---
INPUT:
${input}
        `,
      }),
    });

    const data = await res.json();

    return data.response;
  }
}
import { ocrTool } from "./tools/ocr.js";
import { SYSTEM_PROMPT } from "./prompts/document.prompt.js";
import { documentSchema } from "./schemas/document.schema.js";

export class AgentService {
  async processDocument(filePath: string) {
    try {
      console.log("FILE PATH:", filePath);

      const text = await ocrTool(filePath);
      console.log("OCR TEXT LENGTH:", text.length);
      console.log("OCR TEXT PREVIEW:", text.slice(0, 1000));

      if (!text || text.trim().length === 0) {
        throw new Error("OCR empty");
      }

      const result = await this.callOllama(SYSTEM_PROMPT, text);
      console.log("OLLAMA OUTPUT:", result);

      const cleaned = this.extractJson(result);

      console.log("CLEANED OUTPUT:", cleaned);

      const parsed = JSON.parse(cleaned);
      const normalized = this.normalizeDocument(parsed);
      const validated = documentSchema.safeParse(normalized);

      if (!validated.success) {
        console.error("VALIDATION ERROR:", validated.error.format());
        console.error("NORMALIZED OUTPUT:", normalized);
        throw new Error("Invalid AI response structure");
      }

      return validated.data;
    } catch (err: any) {
      console.error("AGENT ERROR:", err);
      throw err;
    }
  }

 private async callOllama(prompt: string, input: string) {
  const fullPrompt = `
${prompt}

OCR TEXT:
${input}
`;

  console.log("CALLING OLLAMA...");
  console.log("PROMPT LENGTH:", prompt.length);
  console.log("INPUT LENGTH:", input.length);
  console.log("FULL PROMPT LENGTH:", fullPrompt.length);

  const start = Date.now();

  const res = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal: AbortSignal.timeout(300000),
    body: JSON.stringify({
      model: "qwen2.5:3b",
      stream: false,
      format: "json",
      system: SYSTEM_PROMPT,
       prompt: `OCR TEXT:\n${input}`,
    }),
  });

  console.log("OLLAMA RESPONSE TIME:", Date.now() - start, "ms");

  if (!res.ok) {
    throw new Error(`Ollama API error: ${res.status}`);
  }

  const data = await res.json();

  console.log("OLLAMA RAW:", data);

  if (!data.response) {
    throw new Error("Ollama response is empty");
  }

  return data.response;
}
  private extractJson(value: string) {
    const cleaned = value
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");

    if (start === -1 || end === -1 || end <= start) {
      throw new Error("AI response does not contain JSON object");
    }

    return cleaned.slice(start, end + 1);
  }

  private normalizeDocument(data: Record<string, unknown>) {
    data.importerTaxId ??= data.taxId;
    data.exporterCountryCode ??= data.countryCode;
    data.goodsDescription ??= data.description;
    data.quantity ??= data.quantity1;
    data.hsCode ??= data.hsCodeRepresentative;

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

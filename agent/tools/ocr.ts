import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import path from "path";

export async function ocrTool(filePath: string) {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error("File not found");
    }

    const apiKey = process.env.OCR_SPACE_API_KEY;
    if (!apiKey) throw new Error("Missing OCR API key");

    const form = new FormData();
    form.append("apikey", apiKey);
    form.append("language", "eng");
    form.append("isOverlayRequired", "false");
    form.append("file", fs.createReadStream(filePath), {
      filename: path.basename(filePath),
    });

    const response = await axios.post(
      "https://api.ocr.space/parse/image",
      form,
      {
        headers: form.getHeaders(),
        maxBodyLength: Infinity,
      }
    );

    const text = response.data?.ParsedResults?.[0]?.ParsedText;
    if (!text) throw new Error("OCR empty");

    return text;
  } catch (err: any) {
    console.error("OCR ERROR:", err?.response?.data || err.message);
    throw err;
  }
}

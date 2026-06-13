import axios from "axios";
import fs from "fs";
import FormData from "form-data";
import path from "path";

export async function ocrTool(filePath: string) {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error("File not found");
    }

    const formData = new FormData();

    formData.append("file", fs.createReadStream(filePath), {
      filename: path.basename(filePath),
    });

    const res = await axios.post(
      "http://localhost:8001/ocr",
      formData,
      {
        headers: {
          ...formData.getHeaders(),
        },
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
        timeout: 120000,
      }
    );

    const text = res.data?.text;

    if (!text) {
      throw new Error("OCR empty");
    }

    return text
      .replace(/\r/g, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

  } catch (err: any) {
    console.error("OCR ERROR:", err.response?.data || err.message);
    throw err;
  }
}

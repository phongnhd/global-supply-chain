import axios from "axios";
import fs from "fs";
import FormData from "form-data";

export async function ocrTool(filePath: string) {
  const form = new FormData();

  form.append("file", fs.createReadStream(filePath));
  form.append("language", "eng");

  const res = await axios.post(
    "https://api.ocr.space/parse/image",
    form,
    {
      headers: {
        ...form.getHeaders(),
        apikey: process.env.OCR_API_KEY || "",
      },
      maxBodyLength: Infinity,
    }
  );

  if (!res.data?.ParsedResults?.length) {
    throw new Error("OCR failed or empty result");
  }

  return res.data.ParsedResults[0].ParsedText || "";
}
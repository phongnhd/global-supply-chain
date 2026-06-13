import express from "express";
import multer from "multer";
import path from "path";

const router = express.Router();

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (_, file, cb) => {
    const ext = path.extname(file.originalname);
    const fileName =
      `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;

    cb(null, fileName);
  },
});

const upload = multer({ storage });

router.post("/process-document", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const filePath = path.join(process.cwd(), req.file.path);

    const response = await fetch(
      "http://localhost:5001/process-document",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ filePath }),
      }
    );

    const payload = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(payload);
    }

    return res.json(payload);
  } catch (err: any) {
    console.error("BACKEND ERROR:", err);

    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

export default router;

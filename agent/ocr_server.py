import os
import tempfile
import traceback
import fitz
import pypdfium2 as pdfium
from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename

os.environ.setdefault("FLAGS_use_onednn", "0")
os.environ.setdefault("FLAGS_use_mkldnn", "0")

from paddleocr import PaddleOCR

MAX_PDF_PAGES = int(os.environ.get("OCR_MAX_PDF_PAGES", "10"))
TEXT_PAGE_RATIO_THRESHOLD = float(os.environ.get("OCR_TEXT_PAGE_RATIO", "0.5"))
MIN_CHARS_PER_PAGE = int(os.environ.get("OCR_MIN_CHARS_PER_PAGE", "50"))

app = Flask(__name__)

ocr = PaddleOCR(
    use_doc_orientation_classify=False,
    use_doc_unwarping=False,
    use_textline_orientation=False,
    lang="en",
    enable_mkldnn=False,
)

SUPPORTED_IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg", ".bmp", ".tiff", ".tif", ".webp"}
SUPPORTED_EXTENSIONS = SUPPORTED_IMAGE_EXTENSIONS | {".pdf"}

def collect_text_lines(result) -> list[str]:
    text_lines: list[str] = []
    if not result:
        return text_lines
    for page in result:
        if not page:
            continue
        if isinstance(page, dict):
            rec_texts = page.get("rec_texts")
            if isinstance(rec_texts, list):
                text_lines.extend(str(t) for t in rec_texts if t)
                continue
            text = page.get("text")
            if text:
                text_lines.append(str(text))
                continue
        json_data = getattr(page, "json", None)
        if callable(json_data):
            json_data = json_data()
        if isinstance(json_data, dict):
            res_data = json_data.get("res", json_data)
            rec_texts = res_data.get("rec_texts")
            if isinstance(rec_texts, list):
                text_lines.extend(str(t) for t in rec_texts if t)
                continue
        if isinstance(page, list):
            for line in page:
                if len(line) > 1 and len(line[1]) > 0:
                    text_lines.append(str(line[1][0]))
    return text_lines

def ocr_path(path: str) -> list[str]:
    result = ocr.predict(path)
    return collect_text_lines(result)

def extract_pdf_text(path: str, max_pages: int | None = None) -> str:
    try:
        doc = fitz.open(path)
        page_count = min(len(doc), max_pages) if max_pages else len(doc)
        text_parts = [doc[i].get_text("text") for i in range(page_count)]
        doc.close()
        return "\n".join(text_parts).strip()
    except Exception as e:
        print(f"PDF TEXT EXTRACT ERROR: {e}")
        return ""

def classify_pdf(path: str) -> dict:
    try:
        doc = fitz.open(path)
        total_pages = len(doc)
        analyze_count = min(total_pages, MAX_PDF_PAGES)
        text_pages = 0
        ocr_pages = 0
        for i in range(analyze_count):
            page_text = doc[i].get_text("text").strip()
            if len(page_text) >= MIN_CHARS_PER_PAGE:
                text_pages += 1
            else:
                ocr_pages += 1
        doc.close()
        ratio = text_pages / analyze_count if analyze_count > 0 else 0.0
        if ratio >= TEXT_PAGE_RATIO_THRESHOLD:
            mode = "text"
        elif ratio == 0.0:
            mode = "ocr"
        else:
            mode = "hybrid"
        return {
            "mode": mode,
            "text_pages": text_pages,
            "ocr_pages": ocr_pages,
            "analyzed_pages": analyze_count,
            "total_pages": total_pages,
            "ratio": round(ratio, 3),
        }
    except Exception as e:
        print(f"PDF CLASSIFY ERROR: {e}")
        return {
            "mode": "ocr",
            "text_pages": 0,
            "ocr_pages": 0,
            "analyzed_pages": 0,
            "total_pages": 0,
            "ratio": 0.0,
        }

def render_pdf_pages(path: str, max_pages: int | None = None) -> list[str]:
    rendered_paths: list[str] = []
    pdf = None
    try:
        pdf = pdfium.PdfDocument(path)
        page_count = min(len(pdf), max_pages or MAX_PDF_PAGES)
        for index in range(page_count):
            page = None
            bitmap = None
            try:
                page = pdf[index]
                bitmap = page.render(scale=2).to_pil()
                with tempfile.NamedTemporaryFile(
                    delete=False,
                    suffix=f"-page-{index + 1}.png",
                ) as tmp:
                    image_path = tmp.name
                bitmap.save(image_path)
                rendered_paths.append(image_path)
            finally:
                try:
                    if bitmap:
                        bitmap.close()
                except Exception:
                    pass
                try:
                    if page:
                        page.close()
                except Exception:
                    pass
    finally:
        try:
            if pdf:
                pdf.close()
        except Exception:
            pass
    return rendered_paths

def process_pdf(path: str) -> tuple[str, dict]:
    info = classify_pdf(path)
    mode = info["mode"]
    print(f"PDF classify → mode={mode} ratio={info['ratio']} ({info['text_pages']}/{info['analyzed_pages']} pages have text)")
    if mode == "text":
        text = extract_pdf_text(path, max_pages=MAX_PDF_PAGES)
        return text, info
    if mode == "ocr":
        rendered_paths = render_pdf_pages(path)
        try:
            lines: list[str] = []
            for img_path in rendered_paths:
                lines.extend(ocr_path(img_path))
            return "\n".join(lines), info
        finally:
            _cleanup_files(rendered_paths)
    doc = fitz.open(path)
    final_parts: list[str] = []
    ocr_image_paths: list[str] = []
    try:
        page_count = min(len(doc), MAX_PDF_PAGES)
        for i in range(page_count):
            page = doc[i]
            page_text = page.get_text("text").strip()
            if len(page_text) >= MIN_CHARS_PER_PAGE:
                final_parts.append(f"[Page {i + 1}]\n{page_text}")
            else:
                zoom = 2
                mat = fitz.Matrix(zoom, zoom)
                pix = page.get_pixmap(matrix=mat)
                with tempfile.NamedTemporaryFile(
                    delete=False,
                    suffix=f"-page-{i + 1}.png",
                ) as tmp:
                    img_path = tmp.name
                pix.save(img_path)
                ocr_image_paths.append((i + 1, img_path))
        for page_num, img_path in ocr_image_paths:
            ocr_lines = ocr_path(img_path)
            final_parts.append(f"[Page {page_num} — OCR]\n" + "\n".join(ocr_lines))
    finally:
        doc.close()
        _cleanup_files([p for _, p in ocr_image_paths])
    return "\n\n".join(final_parts), info

def _cleanup_files(paths: list[str]) -> None:
    for p in paths:
        try:
            if p and os.path.exists(p):
                os.remove(p)
        except Exception as e:
            print(f"Cleanup error [{p}]: {e}")

@app.route("/ocr", methods=["POST"])
def ocr_endpoint():
    upload_path: str | None = None
    try:
        if "file" not in request.files:
            return jsonify({"error": "No file uploaded"}), 400
        file = request.files["file"]
        filename = secure_filename(file.filename or "")
        _, ext = os.path.splitext(filename)
        ext = ext.lower()
        if ext not in SUPPORTED_EXTENSIONS:
            return jsonify({
                "error": f"Unsupported file type '{ext}'. Supported: {', '.join(sorted(SUPPORTED_EXTENSIONS))}"
            }), 400
        with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp:
            upload_path = tmp.name
        file.save(upload_path)
        if ext == ".pdf":
            text, info = process_pdf(upload_path)
            return jsonify({
                "text": text,
                "method": info["mode"],
                "pages": {
                    "analyzed": info["analyzed_pages"],
                    "total": info["total_pages"],
                    "text_ratio": info["ratio"],
                },
            })
        lines = ocr_path(upload_path)
        return jsonify({
            "text": "\n".join(lines),
            "method": "ocr_image",
        })
    except Exception as err:
        traceback.print_exc()
        return jsonify({
            "error": "Processing failed",
            "detail": str(err),
        }), 500
    finally:
        _cleanup_files([upload_path] if upload_path else [])

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "max_pdf_pages": MAX_PDF_PAGES})

if __name__ == "__main__":
    app.run(
        host="127.0.0.1",
        port=8001,
        debug=False,
    )
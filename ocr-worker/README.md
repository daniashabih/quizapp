# Hangbug Self-Hosted Free OCR Worker (Optional)

Hangbug already runs **free built-in OCR directly on Vercel** using `pdfjs-dist` + `@napi-rs/canvas` + offline `tesseract.js` LSTM in resumable batches.

This optional Dockerized worker uses native C++ `tesseract-ocr` + `poppler-utils` (`pdftoppm`) for 3–5x faster OCR on very large scanned textbooks (100+ pages) on free container platforms (Render.com Free Tier, Fly.io, Koyeb, Railway).

## Deploy Free on Render.com
1. Create a new **Web Service** on Render pointing to this repository with **Root Directory** = `ocr-worker` and **Runtime** = `Docker` (or import `ocr-worker/render.yaml`).
2. Set `OCR_WORKER_SECRET` to a strong random string.
3. In your Vercel project environment variables, set:
   - `OCR_WORKER_URL=https://<your-render-service>.onrender.com`
   - `OCR_WORKER_SECRET=<same-secret>`
   - `OCR_WORKER_FALLBACK=true` (automatically falls back to built-in Vercel Tesseract.js if the free worker is cold-starting or sleeping)

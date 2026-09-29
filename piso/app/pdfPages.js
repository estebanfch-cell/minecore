import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

GlobalWorkerOptions.workerSrc = workerUrl;

const cache = new Map();

export async function renderPdfPages(url) {
  if (!url) return [];
  if (cache.has(url)) return cache.get(url);
  const task = getDocument(url).promise.then(async (pdf) => {
    const pages = [];
    const count = Math.min(pdf.numPages, 4);
    for (let i = 1; i <= count; i += 1) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 1.35 });
      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      await page.render({ canvasContext: canvas.getContext("2d"), viewport }).promise;
      pages.push(canvas.toDataURL("image/jpeg", 0.86));
    }
    return pages;
  });
  cache.set(url, task);
  try {
    return await task;
  } catch (err) {
    cache.delete(url);
    throw err;
  }
}

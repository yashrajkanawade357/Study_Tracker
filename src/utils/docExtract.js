// Extract plain text from an uploaded document. Heavy parsers (pdfjs,
// mammoth) are lazy-imported so they only load when actually needed.

const lower = (s) => (s || '').toLowerCase();

export async function extractText(file) {
  const name = lower(file.name);
  const type = lower(file.type);

  if (type === 'application/pdf' || name.endsWith('.pdf')) {
    return extractPdf(file);
  }
  if (type.includes('officedocument.wordprocessingml') || name.endsWith('.docx')) {
    return extractDocx(file);
  }
  // txt / md / csv / anything text-like
  return (await file.text()).trim();
}

async function extractPdf(file) {
  const pdfjs = await import('pdfjs-dist');
  // Bundle the worker as a same-origin asset (no CORS / CDN dependency).
  const workerUrl = (await import('pdfjs-dist/build/pdf.worker.min.mjs?url')).default;
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

  const data = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data }).promise;
  let text = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((it) => it.str).join(' ') + '\n\n';
  }
  return text.trim();
}

async function extractDocx(file) {
  const mammoth = await import('mammoth');
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return (result.value || '').trim();
}

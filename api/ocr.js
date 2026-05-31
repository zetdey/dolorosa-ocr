export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Solo POST' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (e) { body = {}; }
    }
    const image = body && body.image;
    if (!image) {
      return res.status(400).json({ error: 'Falta la imagen' });
    }

    const form = new URLSearchParams();
    form.append('base64Image', image);
    form.append('language', 'spa');
    form.append('isTable', 'true');
    form.append('scale', 'true');
    form.append('OCREngine', '2');
    form.append('apikey', process.env.OCR_API_KEY);

    const r = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form.toString()
    });
    const data = await r.json();

    let text = '';
    if (data && data.ParsedResults && data.ParsedResults[0]) {
      text = data.ParsedResults[0].ParsedText || '';
    }
    const ocrError = data && data.IsErroredOnProcessing ? (data.ErrorMessage || 'OCR error') : null;

    return res.status(200).json({ text, ocrError, raw: data });
  } catch (e) {
    return res.status(500).json({ error: 'Error procesando', detail: String(e) });
  }
}

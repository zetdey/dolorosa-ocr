export default async function handler(req, res) {
  // Permitir que tu app llame a este puente
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Solo POST' });

  try {
    const { image } = req.body;
    if (!image) return res.status(400).json({ error: 'Falta la imagen' });

    const form = new URLSearchParams();
    form.append('base64Image', image);
    form.append('language', 'spa');
    form.append('isTable', 'true');
    form.append('OCREngine', '2');
    form.append('apikey', process.env.OCR_API_KEY);

    const r = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form.toString()
    });
    const data = await r.json();
    const text = data?.ParsedResults?.[0]?.ParsedText || '';
    return res.status(200).json({ text });
  } catch (e) {
    return res.status(500).json({ error: 'Error procesando la imagen' });
  }
}

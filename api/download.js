export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url, filename } = req.query;
  if (!url) {
    return res.status(400).json({ error: 'Missing url query parameter' });
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      return res.status(response.status).json({ 
        error: `Failed to fetch image from source: ${response.statusText}` 
      });
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Set headers for CORS and force file download
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Content-Type', contentType);
    
    const safeFilename = filename || `biker-photo-${Date.now()}.jpg`;
    const encodedFilename = encodeURIComponent(safeFilename);
    
    // Content-Disposition: attachment triggers browser download prompt
    res.setHeader('Content-Disposition', `attachment; filename="${encodedFilename}"; filename*=UTF-8''${encodedFilename}`);
    
    return res.status(200).send(buffer);
  } catch (error) {
    console.error('Download proxy server error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}

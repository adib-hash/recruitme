import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import type { IncomingMessage, ServerResponse } from 'http';

export const config = { api: { bodyParser: false } };

// Parse raw body from IncomingMessage
function parseBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk: Buffer) => { body += chunk.toString(); });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  try {
    const rawBody = await parseBody(req);
    const body = JSON.parse(rawBody) as HandleUploadBody;

    const jsonResponse = await handleUpload({
      body,
      request: req as any,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: [
          'image/jpeg', 'image/png', 'image/webp', 'image/gif',
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'text/plain',
        ],
        maximumSizeInBytes: 5 * 1024 * 1024, // 5MB
        addRandomSuffix: true,
      }),
      onUploadCompleted: async () => {},
    });

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(jsonResponse));
  } catch (error) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: (error as Error).message }));
  }
}

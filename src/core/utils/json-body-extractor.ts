import { PayloadRequest } from 'payload';

export async function extractJsonBody(req: PayloadRequest): Promise<any> {
  try {
    const body = req.json ? await req.json() : null;
    if (!body) {
      return {};
    }

    return body;
  } catch {
    return {};
  }
}

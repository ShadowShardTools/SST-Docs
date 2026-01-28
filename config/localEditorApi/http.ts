import type { IncomingMessage } from "http";

export class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function readRequestBody(
  req: IncomingMessage,
  maxBytes: number,
): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    let totalSize = 0;
    req.on("data", (chunk) => {
      const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      chunks.push(buf);
      totalSize += buf.length;
      if (totalSize > maxBytes) {
        reject(new HttpError(413, "Payload too large"));
        req.destroy();
      }
    });
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

export async function readJsonBody<T>(
  req: IncomingMessage,
  maxBytes: number,
): Promise<T> {
  const bodyBuffer = await readRequestBody(req, maxBytes);
  const bodyText = bodyBuffer.toString("utf8");
  try {
    return JSON.parse(bodyText) as T;
  } catch (err) {
    throw new HttpError(
      400,
      err instanceof Error ? err.message : "Invalid JSON payload",
    );
  }
}

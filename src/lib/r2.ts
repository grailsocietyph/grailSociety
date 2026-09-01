import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
} from "@aws-sdk/client-s3";

const endpoint = process.env.CLOUDFLARE_R2_ENDPOINT || "";
const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || "";
const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || "";
const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME || "grailsociety-images";
const publicUrl = (process.env.CLOUDFLARE_R2_PUBLIC_URL || "").replace(/\/$/, "");

export const r2Client = new S3Client({
  region: "auto",
  endpoint,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

export async function uploadToR2(
  fileBuffer: Buffer | Uint8Array,
  originalFilename: string,
  contentType: string
): Promise<{ url: string; key: string }> {
  // Sanitize filename and create unique key
  const safeName = originalFilename
    .toLowerCase()
    .replace(/[^a-z0-9.]/g, "-")
    .replace(/-+/g, "-");
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const key = `products/${Date.now()}-${randomSuffix}-${safeName}`;

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: fileBuffer,
    ContentType: contentType || "image/jpeg",
  });

  await r2Client.send(command);

  const url = `${publicUrl}/${key}`;
  return { url, key };
}

/**
 * Safely extracts the S3/R2 object key from a full URL or relative path.
 * Returns null if the item is not stored in the R2 bucket.
 */
export function extractR2Key(keyOrUrl: string): string | null {
  if (!keyOrUrl || typeof keyOrUrl !== "string") return null;
  const trimmed = keyOrUrl.trim();
  if (!trimmed) return null;

  try {
    let pathname = trimmed;
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      const parsed = new URL(trimmed);
      pathname = parsed.pathname;
    }
    const cleanKey = pathname.replace(/^\/+/, "");
    // Ensure only products stored in R2 bucket are targeted
    if (cleanKey.startsWith("products/")) {
      return cleanKey;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Deletes one or multiple images from Cloudflare R2 bucket.
 * Accepts a single string key/URL or an array of keys/URLs.
 */
export async function deleteFromR2(keysOrUrls: string | string[]): Promise<number> {
  const list = Array.isArray(keysOrUrls) ? keysOrUrls : [keysOrUrls];
  const keys = list
    .map(extractR2Key)
    .filter((k): k is string => Boolean(k && k.length > 0));

  if (keys.length === 0) return 0;

  if (keys.length === 1) {
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: keys[0],
    });
    await r2Client.send(command);
    return 1;
  }

  // Delete in chunks of up to 1,000 keys per S3 DeleteObjects specification
  let totalDeleted = 0;
  for (let i = 0; i < keys.length; i += 1000) {
    const chunk = keys.slice(i, i + 1000);
    const command = new DeleteObjectsCommand({
      Bucket: bucketName,
      Delete: {
        Objects: chunk.map((Key) => ({ Key })),
        Quiet: true,
      },
    });
    await r2Client.send(command);
    totalDeleted += chunk.length;
  }

  return totalDeleted;
}

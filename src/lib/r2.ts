import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

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

export async function deleteFromR2(keyOrUrl: string): Promise<void> {
  let key = keyOrUrl;
  if (keyOrUrl.startsWith("http")) {
    // Extract key from public URL
    const parsed = new URL(keyOrUrl);
    key = parsed.pathname.replace(/^\//, "");
  }

  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  await r2Client.send(command);
}

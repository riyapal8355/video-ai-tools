import fs from "fs";
import path from "path";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const hasS3Config = Boolean(
  process.env.S3_ACCESS_KEY_ID &&
  process.env.S3_SECRET_ACCESS_KEY &&
  process.env.S3_BUCKET
);

const s3Client = hasS3Config
  ? new S3Client({
      region: process.env.S3_REGION || "auto",
      endpoint: process.env.S3_ENDPOINT || undefined,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",
      },
    })
  : null;

export async function getUploadUrl(
  fileName: string,
  contentType: string
): Promise<{ uploadUrl: string; storageKey: string; publicUrl: string }> {
  const ext = path.extname(fileName) || "";
  const baseName = path.basename(fileName, ext).replace(/[^a-zA-Z0-9_-]/g, "");
  const storageKey = `uploads/${Date.now()}_${baseName}${ext}`;

  if (s3Client && process.env.S3_BUCKET) {
    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: storageKey,
      ContentType: contentType,
    });
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    const publicUrl = process.env.S3_PUBLIC_DOMAIN
      ? `${process.env.S3_PUBLIC_DOMAIN}/${storageKey}`
      : `https://${process.env.S3_BUCKET}.s3.amazonaws.com/${storageKey}`;

    return { uploadUrl, storageKey, publicUrl };
  }

  // Local filesystem fallback
  const publicUrl = `/${storageKey}`;
  const uploadUrl = `/api/v2/assets/local-upload?key=${encodeURIComponent(storageKey)}`;
  return { uploadUrl, storageKey, publicUrl };
}

export async function saveLocalFile(
  storageKey: string,
  buffer: Buffer
): Promise<string> {
  const targetPath = path.join(process.cwd(), "public", storageKey);
  const dir = path.dirname(targetPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(targetPath, buffer);
  return `/${storageKey.replace(/^\/?/, "")}`;
}

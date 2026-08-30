import { NextRequest } from "next/server";
import crypto from "crypto";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const runtime = "nodejs";

/**
 * Destination prefixes. Mirrors the Joi enum in next-template-api
 * `fileUpload.controller.ts` — keep the two in sync.
 */
const FOLDERS = ["compliance", "products", "avatars"] as const;
type Folder = (typeof FOLDERS)[number];

/**
 * Explicit credentials are passed ONLY when both are present — that's the local
 * dev case, where you export a key pair. Deployed environments have no static
 * keys: the container picks up the EC2 instance profile through the SDK's
 * default provider chain (IMDS). Passing `credentials` unconditionally with
 * `?? ""` would override that chain with empty strings and every presign would
 * fail with a signature error.
 */
const hasStaticCredentials = Boolean(
  process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY,
);

const s3 = new S3Client({
  region: process.env.AWS_REGION ?? "ap-southeast-1",
  ...(hasStaticCredentials
    ? {
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
        },
      }
    : {}),
});

/** Presigned PUT URLs expire in 15 minutes, matching the API's S3Util. */
const UPLOAD_URL_TTL_SECONDS = 900;

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const fileName = (params.get("fileName") ?? "").trim();
  const mimeType = (params.get("mimeType") ?? "").trim();
  const folderParam = params.get("folder") ?? "compliance";

  if (!fileName) {
    return Response.json({ error: "fileName is required" }, { status: 400 });
  }
  if (!mimeType) {
    return Response.json({ error: "mimeType is required" }, { status: 400 });
  }
  if (!FOLDERS.includes(folderParam as Folder)) {
    return Response.json(
      { error: `folder must be one of: ${FOLDERS.join(", ")}` },
      { status: 400 },
    );
  }

  const bucket = process.env.AWS_S3_BUCKET_NAME;
  if (!bucket) {
    console.error("[s3/presign] AWS_S3_BUCKET_NAME is not set");
    return Response.json(
      { error: "Upload storage is not configured" },
      { status: 500 },
    );
  }

  // Same key shape as the API's S3Util: {folder}/{16-byte hex}.{ext}
  const fileExtension = fileName.split(".").pop();
  const randomName = crypto.randomBytes(16).toString("hex");
  const fileKey = `${folderParam}/${randomName}.${fileExtension}`;

  try {
    const uploadUrl = await getSignedUrl(
      s3,
      new PutObjectCommand({
        Bucket: bucket,
        Key: fileKey,
        ContentType: mimeType,
      }),
      { expiresIn: UPLOAD_URL_TTL_SECONDS },
    );

    // Shaped like the API's responseSuccess envelope so the client hook can
    // read `data` either way.
    return Response.json({ data: { uploadUrl, fileKey } });
  } catch (err) {
    console.error("[s3/presign]", err);
    return Response.json(
      {
        error:
          err instanceof Error ? err.message : "Failed to presign upload URL",
      },
      { status: 500 },
    );
  }
}

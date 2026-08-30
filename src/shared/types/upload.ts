/**
 * Destination folder on the presign route. Mirrors the Joi enum in
 * next-template-api `fileUpload.controller.ts` and the `FOLDERS` list in
 * `src/app/api/file-uploads/presigned-url/route.ts` — keep all three in sync.
 *
 * `compliance` holds seller verification documents (permits, certificates),
 * `products` holds catalog imagery, `avatars` holds profile pictures.
 */
export type UploadFolder = "compliance" | "products" | "avatars";

/** `data` payload of GET /api/file-uploads/presigned-url. */
export interface PresignedUrlResponse {
  uploadUrl: string;
  fileKey: string;
}

export interface UploadSuccessResult {
  fileKey: string;
  fileName: string;
}

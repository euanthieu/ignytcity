import { useMutation, UseMutationResult } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  PresignedUrlResponse,
  UploadFolder,
  UploadSuccessResult,
} from "@/shared/types/upload";

/**
 * Two-step direct-to-S3 upload:
 *   1. ask our own Next route handler for a presigned PUT URL (15-min expiry)
 *   2. PUT the file straight to S3, bypassing our servers
 *
 * The presign step is a same-origin call to `/api/file-uploads/presigned-url`,
 * which builds the S3 client server-side — AWS credentials never reach the
 * browser. The PUT targets S3's origin directly; the signature is the
 * authorization, so no bearer token is attached.
 */
const executeCloudUpload = async (
  file: File,
  folder: UploadFolder,
): Promise<UploadSuccessResult> => {
  const query = new URLSearchParams({
    fileName: file.name,
    mimeType: file.type,
    folder,
  });

  const presignRes = await fetch(
    `/api/file-uploads/presigned-url?${query.toString()}`,
  );

  if (!presignRes.ok) {
    const body = await presignRes.json().catch(() => ({}));
    throw new Error(body?.error || "Couldn't prepare the upload. Try again.");
  }

  const { data }: { data: PresignedUrlResponse } = await presignRes.json();

  const transferRes = await fetch(data.uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });

  if (!transferRes.ok) {
    throw new Error("Upload to storage failed. Try again.");
  }

  return { fileKey: data.fileKey, fileName: file.name };
};

/**
 * @param folder Where the asset belongs. Compliance documents must not land in
 * the same prefix as public catalog imagery.
 */
export function useS3AssetUpload(
  folder: UploadFolder,
): UseMutationResult<UploadSuccessResult, Error, File> {
  return useMutation<UploadSuccessResult, Error, File>({
    mutationFn: (file) => executeCloudUpload(file, folder),
    onSuccess: (data) => {
      toast.success(`Uploaded ${data.fileName}`);
    },
    onError: (error) => {
      toast.error(error.message || "Upload failed. Try again.");
    },
  });
}

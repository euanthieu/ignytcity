import { ApiError } from "./api-error";

export function mapApiValidationToForm(error: unknown) {
  if (!(error instanceof ApiError)) return {};

  if (error.category !== "VALIDATION") return {};

  return error.details || {};
}

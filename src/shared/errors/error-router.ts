import { ApiError } from "./api-error";

export function routeError(error: unknown) {
  if (!(error instanceof ApiError)) {
    return {
      toast: "Unexpected error occurred",
      action: "log",
    };
  }

  switch (error.category) {
    case "AUTH":
      return {
        toast: "Session expired",
        action: "logout",
      };

    case "FORBIDDEN":
      return {
        toast: "Access denied",
        action: "none",
      };

    case "VALIDATION":
      return {
        toast: null,
        action: "form",
      };

    case "NETWORK":
      return {
        toast: "Network connection issue",
        action: "retryable",
      };

    default:
      return {
        toast: error.message,
        action: "log",
      };
  }
}

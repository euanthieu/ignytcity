"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log catastrophic errors
    console.error("Global Layout Error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-[#0a0a0a] text-white flex min-h-screen items-center justify-center font-sans">
        <div className="text-center p-8 max-w-md border border-red-500/20 bg-red-500/5 rounded-2xl">
          <h2 className="text-2xl font-bold mb-4">
            Critical Application Error
          </h2>
          <p className="text-white/60 mb-6 text-sm">
            A severe error occurred that prevented the application from loading.
            Please refresh the page.
          </p>
          <button
            onClick={() => reset()}
            className="px-6 py-3 bg-[#d3427b] text-white font-semibold rounded-xl hover:opacity-90 transition-opacity"
          >
            Refresh Application
          </button>
        </div>
      </body>
    </html>
  );
}

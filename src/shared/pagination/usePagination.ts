"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

export function usePagination(initialPage = 1, initialLimit = 10) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = Number(searchParams.get("page")) || initialPage;
  const limit = Number(searchParams.get("limit")) || initialLimit;

  const updateUrl = (newPage: number, newLimit: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    params.set("limit", newLimit.toString());
    router.replace(`${pathname}?${params.toString()}`);
  };

  const next = () => updateUrl(page + 1, limit);
  const prev = () => updateUrl(Math.max(1, page - 1), limit);
  const goTo = (p: number) => updateUrl(Math.max(1, p), limit);

  return {
    page,
    limit,
    next,
    prev,
    goTo,
  };
}

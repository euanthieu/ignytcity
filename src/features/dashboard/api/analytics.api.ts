// not used - backend analytics endpoint (/api/v1/stores/:id/analytics) not implemented
import { API_BASE_URL } from "@/shared/config/api";

export const getAnalytics = async (storeId: string) => {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_BASE_URL}/api/v1/stores/${storeId}/analytics`,
    {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    },
  );

  return response.json();
};

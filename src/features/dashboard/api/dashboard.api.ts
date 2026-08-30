// not used - superseded by dashboard.client.ts
import { API_BASE_URL } from "@/shared/config/api";

export const getDashboard = async (storeId: string) => {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_BASE_URL}/api/v1/stores/${storeId}/dashboard`,
    {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    },
  );

  if (!response.ok) throw new Error("Dashboard metrics unreachable.");

  return response.json();
};

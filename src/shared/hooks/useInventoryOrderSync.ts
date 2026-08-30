// not used - backend REST route /api/orders not implemented
import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { io, Socket } from "socket.io-client";

export interface OrderRecord {
  id: string;
  sku: string;
  quantity: number;
  customer: string;
  stockSnapshot: number;
  status: "PENDING" | "SHIPPED" | "CANCELLED" | string;
  createdAt: string;
}

export const ORDERS_QUERY_KEY = ["orders"];

// TOGGLE FLAG: Switch to false since the backend hasn't implemented real-time sockets yet
const IS_SOCKET_BACKEND_READY = false;

export const useInventoryOrderSync = () => {
  const queryClient = useQueryClient();

  // 1. HTTP Layer: Fetch initial dashboard baseline state
  const query = useQuery<OrderRecord[], Error>({
    queryKey: ORDERS_QUERY_KEY,
    queryFn: async () => {
      const res = await fetch("/api/orders");
      if (!res.ok) throw new Error("Failed to load baseline order stream.");
      return res.json();
    },
    // Safe fall-back: standard 5-second staleness window until sockets go live
    staleTime: IS_SOCKET_BACKEND_READY ? Infinity : 5000,
  });

  useEffect(() => {
    // Escape loop immediately if the backend socket isn't ready
    if (!IS_SOCKET_BACKEND_READY) return;

    const socketUrl =
      process.env.NEXT_PUBLIC_SOCKET_SERVER_URL || "http://localhost:4002";

    const socket: Socket = io(socketUrl, {
      autoConnect: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 3000,
    });

    socket.on("order:created", (newOrder: OrderRecord) => {
      queryClient.setQueryData<OrderRecord[]>(ORDERS_QUERY_KEY, (old) => {
        const currentOrders = old ?? [];
        if (currentOrders.some((order) => order.id === newOrder.id))
          return currentOrders;
        return [newOrder, ...currentOrders];
      });
    });

    socket.on("order:updated", (updatedOrder: OrderRecord) => {
      queryClient.setQueryData<OrderRecord[]>(ORDERS_QUERY_KEY, (old) => {
        const currentOrders = old ?? [];
        return currentOrders.map((order) =>
          order.id === updatedOrder.id ? updatedOrder : order,
        );
      });
    });

    socket.on(
      "inventory:stock-sync",
      (payload: { sku: string; newStock: number }) => {
        queryClient.setQueryData<OrderRecord[]>(ORDERS_QUERY_KEY, (old) => {
          const currentOrders = old ?? [];
          return currentOrders.map((order) =>
            order.sku === payload.sku
              ? { ...order, stockSnapshot: payload.newStock }
              : order,
          );
        });
      },
    );

    socket.on("disconnect", (reason) => {
      console.warn(`Socket disconnected: ${reason}. Invalidate queries.`);
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY });
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection failed:", error.message);
    });

    return () => {
      socket.off("order:created");
      socket.off("order:updated");
      socket.off("inventory:stock-sync");
      socket.off("disconnect");
      socket.off("connect_error");
      socket.disconnect();
    };
  }, [queryClient]);

  return query;
};

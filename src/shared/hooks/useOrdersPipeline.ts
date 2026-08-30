import { io, Socket } from "socket.io-client";
import { useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetcher } from "@/shared/lib/http";
import { getToken } from "@/shared/lib/token";

export interface OrderRecord {
  id: string;
  sku: string;
  quantity: number;
  customer: string;
  /** Null when the API did not report a stock level — never guess one. */
  stockSnapshot: number | null;
  status: "PENDING" | "SHIPPED" | "CANCELLED" | string;
  createdAt: string;
  subtotalAmount?: number;
  taxAmount?: number;
  marketplaceFeeAmount?: number;
  sellerNetAmount?: number;
  totalAmount?: number;
}

export interface OrdersPipelineParams {
  userId: string | null;
  storeId?: string | null;
  search?: string;
  status?: string;
  sortAsc?: boolean;
  page?: number;
  limit?: number;
}

export const ORDERS_QUERY_KEY = ["seller-orders"];

function readActiveStoreId(storeId?: string | null) {
  if (storeId) return storeId;
  if (typeof window === "undefined") return null;
  return localStorage.getItem("active_store_context_id");
}

function normalize(o: Record<string, any>): OrderRecord {
  const itemNames =
    o.orderitems?.map((i: any) => i.product?.name || "Product").join(", ") ||
    o.sku ||
    "N/A";
  const totalQty =
    o.orderitems?.reduce((sum: number, i: any) => sum + (i.quantity || 1), 0) ||
    o.quantity ||
    1;

  return {
    ...o,
    sku: itemNames,
    quantity: totalQty,
    customer: o.buyer?.displayName || o.customer || "Customer",
    stockSnapshot: typeof o.stockSnapshot === "number" ? o.stockSnapshot : null,
  } as OrderRecord;
}

/**
 * Single source of truth for a store's orders.
 *
 * The API ignores search/status/sort/page/limit — `GET /v1/orders/store` takes
 * only a storeId and returns every order — so we fetch once per store and do
 * all filtering, sorting and paging on the client. Both the stats tiles and the
 * orders board share this query, so they cost one request between them.
 */
function useStoreOrdersQuery(userId: string | null, storeId?: string | null) {
  const token = getToken();
  const activeStoreId = readActiveStoreId(storeId);

  return useQuery<OrderRecord[], Error>({
    queryKey: [...ORDERS_QUERY_KEY, { userId, storeId: activeStoreId }],
    queryFn: async () => {
      const endpoint = activeStoreId
        ? `/api/v1/orders/store?storeId=${activeStoreId}`
        : `/api/v1/orders`;

      const res: any = await fetcher(endpoint);
      const rawList: any[] = Array.isArray(res) ? res : res?.data || [];
      return rawList.map(normalize);
    },
    enabled: Boolean(token),
    staleTime: 5000,
  });
}

function matchesStatus(orderStatus: string, filter: string) {
  switch (filter) {
    case "ALL":
      return true;
    case "PENDING":
      return orderStatus === "PENDING";
    case "PROCESSING":
    case "PREPARING":
      return orderStatus === "PROCESSING" || orderStatus === "PREPARING";
    case "READY_FOR_PICKUP":
    case "READY":
      return orderStatus === "READY_FOR_PICKUP" || orderStatus === "READY";
    case "COMPLETED":
    case "FULFILLED":
      return orderStatus === "COMPLETED" || orderStatus === "SHIPPED";
    case "CANCELLED":
      return orderStatus === "CANCELLED";
    default:
      return orderStatus === filter;
  }
}

export const useStoreOverviewStats = (params: {
  userId: string | null;
  storeId?: string | null;
}) => {
  const query = useStoreOrdersQuery(params.userId, params.storeId);
  const allOrders = useMemo(() => query.data ?? [], [query.data]);

  const stats = useMemo(() => {
    const totalRevenue = allOrders.reduce((acc, order) => {
      const amount = Number(order.totalAmount);
      return acc + (Number.isFinite(amount) ? amount : 0);
    }, 0);

    const countWhere = (filter: string) =>
      allOrders.filter((o) => matchesStatus(o.status, filter)).length;

    return {
      totalRevenue,
      pendingCount: allOrders.filter(
        (o) =>
          matchesStatus(o.status, "PENDING") ||
          matchesStatus(o.status, "PREPARING") ||
          matchesStatus(o.status, "READY_FOR_PICKUP"),
      ).length,
      fulfilledCount: countWhere("COMPLETED"),
      statusCounts: {
        ALL: allOrders.length,
        PENDING: countWhere("PENDING"),
        PREPARING: countWhere("PREPARING"),
        READY_FOR_PICKUP: countWhere("READY_FOR_PICKUP"),
        FULFILLED: countWhere("COMPLETED"),
        CANCELLED: countWhere("CANCELLED"),
      },
    };
  }, [allOrders]);

  return { allOrders, ...stats, isLoading: query.isLoading };
};

export const useOrdersPipeline = (params: OrdersPipelineParams) => {
  const {
    userId,
    storeId,
    search = "",
    status = "ALL",
    sortAsc = false,
    page = 1,
    limit = 20,
  } = params;

  const queryClient = useQueryClient();
  const token = getToken();
  const activeStoreId = readActiveStoreId(storeId);
  const queryKey = [...ORDERS_QUERY_KEY, { userId, storeId: activeStoreId }];

  const query = useStoreOrdersQuery(userId, storeId);

  const { orders, totalCount, pageCount, safePage } = useMemo(() => {
    const all = query.data ?? [];
    const term = search.trim().toLowerCase();

    const filtered = all
      .filter((o) => matchesStatus(o.status, status))
      .filter((o) => {
        if (!term) return true;
        return (
          o.sku.toLowerCase().includes(term) ||
          o.customer.toLowerCase().includes(term) ||
          o.id.toLowerCase().includes(term)
        );
      })
      .sort((a, b) => {
        const diff =
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        return sortAsc ? diff : -diff;
      });

    const pages = Math.max(1, Math.ceil(filtered.length / limit));
    const current = Math.min(Math.max(1, page), pages);
    const start = (current - 1) * limit;

    return {
      orders: filtered.slice(start, start + limit),
      totalCount: filtered.length,
      pageCount: pages,
      safePage: current,
    };
  }, [query.data, search, status, sortAsc, page, limit]);

  useEffect(() => {
    if (!userId || !token) return;

    const socketUrl =
      process.env.NEXT_PUBLIC_SOCKET_SERVER_URL || "http://localhost:4002";
    const socket: Socket = io(socketUrl, {
      transports: ["polling", "websocket"],
      autoConnect: true,
    });

    socket.on("connect", () => {
      socket.emit("subscribe_notifications", { userId });
    });

    socket.on("notification:new", (notification: any) => {
      if (
        notification?.metadata?.type === "ORDER_CREATED" ||
        notification?.metadata?.type === "ORDER_PAID" ||
        notification?.metadata?.type === "ORDER_UPDATED"
      ) {
        queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY });
      }
    });

    socket.on("disconnect", () => {
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY });
    });

    return () => {
      socket.disconnect();
    };
  }, [userId, token, queryClient]);

  const fulfillmentMutation = useMutation({
    mutationFn: async ({
      orderId,
      status: nextStatus,
    }: {
      orderId: string;
      status: string;
    }) => {
      // Backend exposes a single body-driven endpoint, not a per-order path.
      return fetcher(`/api/v1/orders/status`, {
        method: "PATCH",
        body: JSON.stringify({ orderId, status: nextStatus }),
      });
    },
    onMutate: async ({ orderId, status: nextStatus }) => {
      await queryClient.cancelQueries({ queryKey });
      const previousOrders = queryClient.getQueryData<OrderRecord[]>(queryKey);

      queryClient.setQueryData<OrderRecord[]>(queryKey, (old) =>
        old?.map((order) => {
          if (order.id !== orderId) return order;
          return {
            ...order,
            status: nextStatus,
            ...(nextStatus === "COMPLETED" &&
              order.stockSnapshot !== null && {
                stockSnapshot: Math.max(
                  0,
                  order.stockSnapshot - (order.quantity || 1),
                ),
              }),
          };
        }),
      );

      return { previousOrders };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousOrders) {
        queryClient.setQueryData(queryKey, context.previousOrders);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY });
    },
  });

  return {
    orders,
    totalCount,
    pageCount,
    page: safePage,
    isLoading: query.isLoading,
    error: query.error,
    fulfillOrder: (orderId: string, status: string = "PREPARING") =>
      fulfillmentMutation.mutate({ orderId, status }),
    isMutationPending: fulfillmentMutation.isPending,
    mutationVariables: fulfillmentMutation.variables,
    forceManualRefresh: () => {
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY });
    },
  };
};

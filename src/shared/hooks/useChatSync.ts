// not used - backend REST route /api/channels/:id/messages not implemented
import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { io, Socket } from "socket.io-client";

export interface ChatMessage {
  id: string;
  channelId: string;
  senderId: string;
  text: string;
  status: "SENT" | "DELIVERED" | "READ" | string;
  createdAt: string;
}

export interface ChatMessagePayload {
  roomId: string;
  senderId: string;
  senderName: string;
  body: string;
  sentAt: string;
  metadata?: Record<string, unknown>;
}

export const useChatSync = (channelId: string) => {
  const queryClient = useQueryClient();

  // Stable inline reference for the query hook
  const baselineCacheKey = ["messages", channelId];

  // Fetch baseline message history via standard REST API
  const query = useQuery<ChatMessage[], Error>({
    queryKey: baselineCacheKey,
    queryFn: async () => {
      const res = await fetch(`/api/channels/${channelId}/messages`);
      if (!res.ok) throw new Error("Chat history sync failure.");
      return res.json();
    },
    // Set to 5 seconds to allow regular poll syncs until backend sockets are ready
    staleTime: 5000,
  });

  useEffect(() => {
    if (!channelId) return;

    const targetCacheKey = ["messages", channelId];
    const socketUrl =
      process.env.NEXT_PUBLIC_SOCKET_SERVER_URL || "http://localhost:4002";
    const socket: Socket = io(socketUrl, { transports: ["websocket"] });

    socket.on("connect", () => {
      socket.emit("join_chat_room", channelId);
    });

    socket.on("chat:message", (payload: ChatMessagePayload) => {
      const liveMessage: ChatMessage = {
        id:
          (payload.metadata?.id as string) ||
          `msg-${Date.now()}-${Math.random()}`,
        channelId: payload.roomId,
        senderId: payload.senderId,
        text: payload.body,
        status: "SENT",
        createdAt: payload.sentAt,
      };

      queryClient.setQueryData<ChatMessage[]>(targetCacheKey, (old) => {
        const currentHistory = old ?? [];
        if (currentHistory.some((m) => m.id === liveMessage.id)) {
          return currentHistory;
        }
        return [...currentHistory, liveMessage];
      });
    });

    socket.on("disconnect", () => {
      queryClient.invalidateQueries({ queryKey: targetCacheKey });
    });

    return () => {
      socket.emit("leave_chat_room", channelId);
      socket.disconnect();
    };
  }, [channelId, queryClient]);

  return query;
};

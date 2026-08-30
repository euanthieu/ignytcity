"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import {
  Menu,
  Sun,
  Moon,
  Lock,
  Unlock,
  RefreshCw,
  Bell,
  ShoppingBag,
  Check,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "../ui/Button";
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";
import { getToken } from "@/shared/lib/token";
import { useCurrentUser } from "@/shared/hooks/useCurrentUser";

interface SellerLayoutProps {
  children: React.ReactNode;
  isAuthenticated: boolean;
  onSignOut: () => void;
}

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export function SellerLayout({
  children,
  isAuthenticated,
  onSignOut,
}: SellerLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const router = useRouter();
  const pathname = usePathname();
  const { userId } = useCurrentUser();

  const [activeStoreId, setActiveStoreId] = useState<string | null>(null);
  const [activePropertyId, setActivePropertyId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync the active seller context whenever the route changes.
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedActiveId = localStorage.getItem("active_store_context_id");
      const storedPropertyId = localStorage.getItem(
        "active_property_context_id",
      );
      setActiveStoreId(storedActiveId);
      setActivePropertyId(storedPropertyId);
    }
  }, [pathname]);

  // Real-time Socket.io Notification Listener for Incoming Orders
  useEffect(() => {
    const token = getToken();
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

    socket.on("notification:new", (data: any) => {
      const isOrder =
        data?.metadata?.type === "ORDER_CREATED" ||
        data?.metadata?.type === "ORDER_PAID" ||
        data?.type === "ORDER_CREATED";

      const title = isOrder
        ? "🛍️ New Order Received!"
        : "Notification Received";
      const message =
        data?.message ||
        `Order #${data?.metadata?.orderId?.slice(0, 8) || "LIVE"} placed by customer.`;

      toast.success(title, {
        description: message,
        duration: 6000,
      });

      const newItem: NotificationItem = {
        id: String(Date.now()),
        title,
        message,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        read: false,
      };

      setNotifications((prev) => [newItem, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    return () => {
      socket.disconnect();
    };
  }, [userId]);

  const handleClearContext = () => {
    localStorage.removeItem("active_store_context_id");
    localStorage.removeItem("active_property_context_id");
    setActiveStoreId(null);
    setActivePropertyId(null);
    router.push("/seller/manage-stores");
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const hasSellerContext = Boolean(activeStoreId || activePropertyId);
  const isPropertyRoute = pathname.startsWith("/seller/properties/");
  const isPropertyContext = Boolean(
    (activePropertyId || isPropertyRoute) && !activeStoreId,
  );
  const hasContextForRoute = hasSellerContext || isPropertyRoute;
  const isLocked =
    mounted &&
    (!isAuthenticated ||
      (!hasContextForRoute && pathname !== "/seller/manage-stores"));

  useEffect(() => {
    if (
      mounted &&
      isAuthenticated &&
      !hasContextForRoute &&
      pathname !== "/seller/manage-stores"
    ) {
      router.push("/seller/manage-stores");
    }
  }, [router, hasContextForRoute, pathname, mounted, isAuthenticated]);

  return (
    <div
      className="flex h-screen max-h-screen overflow-hidden transition-colors duration-300"
      style={{ backgroundColor: "var(--background-primary)" }}
    >
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isLocked={!hasContextForRoute}
        isPropertyContext={isPropertyContext}
        propertyId={activePropertyId}
        onSignOut={onSignOut}
      />

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        <header
          className="h-20 border-b flex items-center px-6 justify-between sticky top-0 z-30 backdrop-blur-md bg-opacity-80 transition-colors shrink-0"
          style={{
            backgroundColor: "var(--background-elevated)",
            borderColor: "var(--border-default)",
          }}
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              disabled={!hasSellerContext}
              className="p-2 border rounded-xl md:hidden transition-colors disabled:opacity-30"
              style={{
                backgroundColor: "var(--background-tertiary)",
                borderColor: "var(--border-light)",
              }}
            >
              <Menu className="w-4 h-4" />
            </button>
            <div className="text-left hidden sm:block">
              <h2 className="text-base font-semibold text-[var(--text-primary)]">
                Seller dashboard
              </h2>
              {activeStoreId ? (
                <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <Unlock className="w-3 h-3" /> Managing your store
                </span>
              ) : activePropertyId || isPropertyRoute ? (
                <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <Unlock className="w-3 h-3" /> Managing your property
                </span>
              ) : (
                <span className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Choose a store or property to
                  continue
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {hasContextForRoute && pathname !== "/seller/manage-stores" && (
              <Button
                variant="dark"
                onClick={handleClearContext}
                className="!h-9 !px-4 !rounded-xl !text-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Switch context
              </Button>
            )}

            {/* Notification Bell Center */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications((prev) => !prev)}
                className="w-9 h-9 border rounded-xl flex items-center justify-center relative hover:bg-[var(--background-tertiary)] transition-colors"
                style={{ borderColor: "var(--border-light)" }}
                aria-label="Order Notifications"
              >
                <Bell className="w-4 h-4 text-zinc-400" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-sky-500 text-white rounded-full text-[9px] font-black flex items-center justify-center animate-bounce shadow-md">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown Menu */}
              {showNotifications && (
                <div
                  className="absolute right-0 mt-2 w-80 rounded-2xl border shadow-xl p-4 space-y-3 z-50 text-left bg-[var(--background-elevated)]"
                  style={{ borderColor: "var(--border-default)" }}
                >
                  <div className="flex items-center justify-between border-b pb-2 border-[var(--border-light)]">
                    <span className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                      <ShoppingBag className="w-4 h-4 text-sky-500" /> Order
                      alerts
                    </span>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-sky-600 dark:text-sky-400 font-medium hover:underline flex items-center gap-0.5"
                      >
                        <Check className="w-3.5 h-3.5" /> Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-64 overflow-y-auto space-y-2 text-sm">
                    {notifications.length === 0 ? (
                      <div className="py-6 text-center text-[var(--text-secondary)] text-sm">
                        No new orders yet.
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`p-2.5 rounded-xl border transition-colors ${
                            !n.read
                              ? "bg-sky-500/10 border-sky-500/30 text-[var(--text-primary)]"
                              : "bg-[var(--background-secondary)] border-[var(--border-light)] text-zinc-400"
                          }`}
                        >
                          <div className="flex items-center justify-between font-semibold text-sm">
                            <span>{n.title}</span>
                            <span className="text-xs text-[var(--text-tertiary)] shrink-0 ml-2">
                              {n.timestamp}
                            </span>
                          </div>
                          <p className="text-xs text-[var(--text-secondary)] mt-1">
                            {n.message}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <Button
              variant="secondary"
              onClick={() =>
                setTheme(resolvedTheme === "dark" ? "light" : "dark")
              }
              className="!w-9 !h-9 !p-0 !rounded-xl border"
              style={{ borderColor: "var(--border-light)" }}
              aria-label="Toggle Theme"
            >
              {!mounted ? (
                <div className="w-4 h-4 rounded-full animate-pulse bg-[var(--border-strong)]" />
              ) : resolvedTheme === "dark" ? (
                <Sun className="w-4 h-4 text-amber-500" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-500" />
              )}
            </Button>
          </div>
        </header>

        <main className="p-6 md:p-8 flex-1 max-w-7xl w-full mx-auto flex flex-col justify-between">
          <div className="flex-1">
            {isLocked ? (
              <div className="p-12 text-center py-24">
                <p className="text-sm text-[var(--text-secondary)]">
                  Taking you to your store or property list…
                </p>
              </div>
            ) : (
              children
            )}
          </div>

          <footer
            className="pt-12 pb-4 mt-auto border-t text-center text-xs text-[var(--text-secondary)] flex flex-col sm:flex-row items-center justify-between gap-2"
            style={{ borderColor: "var(--border-light)" }}
          >
            <span>© 2026 NextTemplate — Seller tools</span>
            <span className="font-mono text-xs">v1.1.0</span>
          </footer>
        </main>
      </div>
    </div>
  );
}

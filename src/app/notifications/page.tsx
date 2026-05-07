"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Bell, BellOff } from "lucide-react";

export default function NotificationsPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const { data, refetch } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      if (!session) return [];
      const res = await fetch("/api/notifications");
      const data = await res.json();
      return data.notifications;
    },
    enabled: !!session,
    refetchInterval: 30000,
  });

  if (!session) {
    router.push("/login");
    return null;
  }

  const markAsRead = async (id: string) => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isRead: true }),
    });
    refetch();
  };

  const notifications = data || [];

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <Bell className="h-5 w-5 text-gray-400" />
      </div>

      {notifications.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <BellOff className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No notifications yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification: any) => (
            <Card
              key={notification.id}
              className={`cursor-pointer transition-colors ${!notification.isRead ? "border-indigo-200 bg-indigo-50/30" : ""}`}
              onClick={() => !notification.isRead && markAsRead(notification.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900">{notification.title}</p>
                    <p className="text-sm text-gray-500 mt-1">{notification.body}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(notification.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <span className="h-2 w-2 rounded-full bg-indigo-600 shrink-0 mt-2" />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

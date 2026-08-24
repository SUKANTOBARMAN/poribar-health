import { api } from "./client";
import type { NotificationOut } from "@/types";

export const notificationsApi = {
  my: () => api.get<NotificationOut[]>("/notifications/my").then((r) => r.data),
  markAsRead: (id: number) => api.patch<NotificationOut>(`/notifications/${id}/read`).then((r) => r.data),
  markAllAsRead: () => api.patch("/notifications/read-all").then((r) => r.data),
};

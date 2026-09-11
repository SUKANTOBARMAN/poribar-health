import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationsApi } from "@/api/notifications";
import { formatDate } from "@/lib/utils";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const qc = useQueryClient();

  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications"],
    queryFn: notificationsApi.my,
    refetchInterval: 30_000,
  });

  const markAllRead = useMutation({
    mutationFn: notificationsApi.markAllAsRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const markOneRead = useMutation({
    mutationFn: notificationsApi.markAsRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  // বাইরে ক্লিক করলে dropdown বন্ধ হবে
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleNotificationClick(id: number, isRead: boolean) {
    if (!isRead) markOneRead.mutate(id);
    setOpen(false); // ক্লিক করলে dropdown বন্ধ হয়ে যাবে
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="relative" ref={wrapperRef}>
      <button onClick={() => setOpen((o) => !o)} className="relative rounded-full p-2 hover:bg-brand-100">
        🔔
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rust-500 text-[10px] text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-2 w-80 rounded-xl border border-slate-200 bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-100 p-3">
            <span className="text-sm font-semibold">নোটিফিকেশন</span>
            {unreadCount > 0 && (
              <button
                onClick={() => { markAllRead.mutate(); setOpen(false); }}
                className="text-xs text-brand-600 hover:underline"
              >
                সব পড়া হয়েছে চিহ্নিত করো
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 && <p className="p-4 text-sm text-slate-400">কোনো নোটিফিকেশন নেই</p>}
            {notifications.map((n) => (
              <button
                key={n.id}
                onClick={() => handleNotificationClick(n.id, n.is_read)}
                className={`block w-full border-b border-slate-50 p-3 text-left text-sm hover:bg-brand-50 ${!n.is_read ? "bg-brand-50/60" : ""}`}
              >
                <p className="font-medium text-slate-800">{n.title}</p>
                {n.body && <p className="mt-0.5 text-xs text-slate-500">{n.body}</p>}
                <p className="mt-1 text-[11px] text-slate-400">{formatDate(n.created_at)}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
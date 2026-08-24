import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationsApi } from "@/api/notifications";
import { formatDate } from "@/lib/utils";
import Card from "@/components/ui/Card";
import Spinner from "@/components/ui/Spinner";
import EmptyState from "@/components/ui/EmptyState";

export default function Notifications() {
  const qc = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: notificationsApi.my,
  });

  const markAllRead = useMutation({
    mutationFn: notificationsApi.markAllAsRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const markOneRead = useMutation({
    mutationFn: notificationsApi.markAsRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-800">নোটিফিকেশন</h1>
          <p className="text-sm text-slate-500">আপনার সাম্প্রতিক সকল আপডেট ও নোটিশ</p>
        </div>

        {notifications.some((n) => !n.is_read) && (
          <button
            onClick={() => markAllRead.mutate()}
            disabled={markAllRead.isPending}
            className="btn btn-ghost text-xs text-brand-700 hover:bg-brand-50"
          >
            সব পড়া হয়েছে হিসেবে চিহ্নিত করুন
          </button>
        )}
      </div>

      {isLoading && <Spinner />}

      {!isLoading && notifications.length === 0 && (
        <EmptyState message="আপনার কোনো নোটিফিকেশন নেই।" />
      )}

      <div className="space-y-3">
        {notifications.map((n) => (
          <Card
            key={n.id}
            onClick={() => !n.is_read && markOneRead.mutate(n.id)}
            className={`p-4 transition-colors cursor-pointer ${
              !n.is_read ? "border-l-4 border-l-brand-600 bg-brand-50/30" : ""
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-slate-800 text-xs">{n.title}</h3>
                {n.body && <p className="mt-1 text-xs text-slate-600">{n.body}</p>}
                <span className="mt-2 block text-[10px] text-slate-400">
                  {formatDate(n.created_at)}
                </span>
              </div>

              {!n.is_read && (
                <span className="h-2 w-2 rounded-full bg-brand-600" title="নতুন নোটিফিকেশন" />
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
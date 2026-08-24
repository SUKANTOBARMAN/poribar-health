import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationsApi } from "@/api/notifications";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import EmptyState from "@/components/ui/EmptyState";
import { formatDate } from "@/lib/utils";

export default function Notifications() {
  const qc = useQueryClient();
  const { data: notifications, isLoading } = useQuery({ queryKey: ["notifications"], queryFn: notificationsApi.my });

  const markAllRead = useMutation({
    mutationFn: notificationsApi.markAllAsRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
  const markOneRead = useMutation({
    mutationFn: notificationsApi.markAsRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const unreadCount = notifications?.filter((n) => !n.is_read).length || 0;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-brand-800">সব নোটিফিকেশন</h1>
        {unreadCount > 0 && (
          <Button variant="secondary" loading={markAllRead.isPending} onClick={() => markAllRead.mutate()}>
            সব পড়া হয়েছে চিহ্নিত করো
          </Button>
        )}
      </div>

      {isLoading && <Spinner />}
      {notifications?.length === 0 && <EmptyState message="কোনো নোটিফিকেশন নেই" />}

      <div className="mt-4 space-y-3">
        {notifications?.map((n) => (
          <Card
            key={n.id}
            className={!n.is_read ? "border-brand-300 bg-brand-50/60" : ""}
            onClick={() => !n.is_read && markOneRead.mutate(n.id)}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-slate-800">{n.title}</p>
                {n.body && <p className="mt-1 text-sm text-slate-600">{n.body}</p>}
                <p className="mt-2 text-xs text-slate-400">{formatDate(n.created_at)}</p>
              </div>
              {!n.is_read && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand-600" />}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
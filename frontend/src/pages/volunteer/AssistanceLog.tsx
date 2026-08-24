import { useQuery } from "@tanstack/react-query";
import { helpRequestsApi } from "@/api/helpRequests";
import Card from "@/components/ui/Card";
import Spinner from "@/components/ui/Spinner";
import EmptyState from "@/components/ui/EmptyState";
import { formatDate } from "@/lib/utils";

export default function AssistanceLog() {
  const { data: logs, isLoading } = useQuery({ queryKey: ["assistance-log"], queryFn: helpRequestsApi.assistanceLog });

  return (
    <div>
      <h1 className="text-xl font-bold text-brand-800">আমার সহায়তার ইতিহাস</h1>
      {isLoading && <Spinner />}
      {logs?.length === 0 && <EmptyState message="এখনো কোনো সহায়তা রেকর্ড নেই" />}
      <div className="mt-4 space-y-3">
        {logs?.map((log) => (
          <Card key={log.id}>
            <p className="text-sm">{log.action_taken}</p>
            {log.outcome && <p className="mt-1 text-xs text-brand-600">ফলাফল: {log.outcome}</p>}
            <p className="mt-2 text-xs text-slate-400">Request #{log.help_request_id} · {formatDate(log.created_at)}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
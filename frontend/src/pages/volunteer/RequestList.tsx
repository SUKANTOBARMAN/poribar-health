import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { helpRequestsApi } from "@/api/helpRequests";
import type { HelpRequestStatus } from "@/types";
import StatusBadge from "@/components/ui/Badge";
import Select from "@/components/ui/Select";
import Spinner from "@/components/ui/Spinner";
import EmptyState from "@/components/ui/EmptyState";
import Card from "@/components/ui/Card";
import { formatDate } from "@/lib/utils";

export default function VolunteerRequestList() {
  const [status, setStatus] = useState<HelpRequestStatus | "">("open");
  const { data: requests, isLoading } = useQuery({
    queryKey: ["volunteer-requests", status],
    queryFn: () => helpRequestsApi.volunteerList(status || undefined),
  });

  return (
    <div>
      <h1 className="text-xl font-bold text-brand-800">এলাকার Help Requests</h1>
      <p className="mt-1 text-sm text-slate-500">শুধু তোমার সার্ভিস এলাকার অনুরোধ দেখাচ্ছে।</p>

      <div className="mt-4 max-w-xs">
        <Select value={status} onChange={(e) => setStatus(e.target.value as HelpRequestStatus)}>
          <option value="">সব</option>
          <option value="open">খোলা</option>
          <option value="accepted">গ্রহণ করা হয়েছে</option>
          <option value="inprogress">চলমান</option>
          <option value="resolved">সমাধান হয়েছে</option>
        </Select>
      </div>

      {isLoading && <Spinner />}
      {requests?.length === 0 && <EmptyState message="কোনো অনুরোধ নেই" />}
      <div className="mt-4 space-y-3">
        {requests?.map((r) => (
          <Link key={r.id} to={`/app/volunteer/requests/${r.id}`}>
            <Card className="flex items-center justify-between hover:shadow-md">
              <div>
                <p className="text-sm font-medium">{r.description}</p>
                <p className="mt-1 text-xs text-slate-400">{r.type} · {r.urgency} · {formatDate(r.created_at)}</p>
              </div>
              <StatusBadge status={r.status} />
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
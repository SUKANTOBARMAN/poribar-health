import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { helpRequestsApi } from "@/api/helpRequests";
import StatusBadge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Spinner from "@/components/ui/Spinner";
import { formatDate } from "@/lib/utils";

export default function VolunteerRequestDetail() {
  const { id } = useParams();
  const requestId = Number(id);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [actionTaken, setActionTaken] = useState("");

  const { data: requests, isLoading } = useQuery({ queryKey: ["volunteer-requests-all"], queryFn: () => helpRequestsApi.volunteerList() });
  const request = requests?.find((r) => r.id === requestId);

  const accept = useMutation({ mutationFn: () => helpRequestsApi.accept(requestId), onSuccess: () => qc.invalidateQueries({ queryKey: ["volunteer-requests-all"] }) });
  const update = useMutation({
    mutationFn: () => helpRequestsApi.update(requestId, { status: "inprogress", action_taken: actionTaken }),
    onSuccess: () => { setActionTaken(""); qc.invalidateQueries({ queryKey: ["volunteer-requests-all"] }); },
  });
  const resolve = useMutation({
    mutationFn: () => helpRequestsApi.resolve(requestId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["volunteer-requests-all"] }); qc.invalidateQueries({ queryKey: ["volunteer-dashboard"] }); },
  });

  if (isLoading) return <Spinner />;
  if (!request) return <p className="text-sm text-slate-500">অনুরোধ পাওয়া যায়নি।</p>;

  return (
    <div className="max-w-xl">
      <button onClick={() => navigate(-1)} className="text-sm text-brand-600 hover:underline">← ফিরে যাও</button>
      <div className="mt-3 flex items-center justify-between">
        <h1 className="text-xl font-bold text-brand-800">Request #{request.id}</h1>
        <StatusBadge status={request.status} />
      </div>

      <Card className="mt-4">
        <p className="text-sm">{request.description}</p>
        <p className="mt-2 text-xs text-slate-400">ধরন: {request.type} · জরুরি মাত্রা: {request.urgency} · {formatDate(request.created_at)}</p>
      </Card>

      <div className="mt-6 space-y-3">
        {request.status === "open" && (
          <Button loading={accept.isPending} onClick={() => accept.mutate()}>এই অনুরোধ গ্রহণ করো</Button>
        )}

        {(request.status === "accepted" || request.status === "inprogress") && (
          <Card>
            <label className="label">Progress আপডেট</label>
            <textarea className="input" rows={3} value={actionTaken} onChange={(e) => setActionTaken(e.target.value)} placeholder="কী করা হয়েছে লেখো..." />
            <div className="mt-3 flex gap-3">
              <Button variant="secondary" loading={update.isPending} disabled={!actionTaken} onClick={() => update.mutate()}>আপডেট সেভ করো</Button>
              <Button loading={resolve.isPending} onClick={() => resolve.mutate()}>সমাধান হয়েছে হিসেবে চিহ্নিত করো</Button>
            </div>
          </Card>
        )}

        {(request.status === "resolved" || request.status === "closed") && (
          <p className="text-sm text-green-700">✓ এই অনুরোধ সমাধান হয়ে গেছে।</p>
        )}
      </div>
    </div>
  );
}
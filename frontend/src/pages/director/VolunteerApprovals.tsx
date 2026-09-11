import { useState } from "react";
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { volunteersApi } from "@/api/volunteers";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Spinner from "@/components/ui/Spinner";
import EmptyState from "@/components/ui/EmptyState";

export default function VolunteerApprovals() {
  const qc = useQueryClient();
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [reason, setReason] = useState("");

  const { data: volunteers, isLoading } = useQuery({ queryKey: ["director-volunteers"], queryFn: () => volunteersApi.directorList("pending") });

  const approve = useMutation({ mutationFn: (id: number) => volunteersApi.approve(id), onSuccess: () => qc.invalidateQueries({ queryKey: ["director-volunteers"] }) });
  const reject = useMutation({
    mutationFn: () => volunteersApi.reject(rejectingId!, reason),
    onSuccess: () => { setRejectingId(null); setReason(""); qc.invalidateQueries({ queryKey: ["director-volunteers"] }); },
  });

  return (
    <div>
      <h1 className="text-xl font-bold text-brand-800">ভলান্টিয়ার অনুমোদন</h1>
      <p className="mt-1 text-sm text-slate-500">অনুমোদনের অপেক্ষায় থাকা ভলান্টিয়ার আবেদন</p>

      {isLoading && <Spinner />}
      {volunteers?.length === 0 && <EmptyState message="অনুমোদনের অপেক্ষায় কেউ নেই" />}
      <div className="mt-4 space-y-3">
        {volunteers?.map((v) => (
          <Card key={v.user_id}>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{v.name}</p>
                <p className="text-xs text-slate-500">{v.phone} · স্টুডেন্ট আইডি: {v.student_id_no} · সেমিস্টার: {v.semester}</p>
              </div>
              <Link to={`/app/volunteer/requests/${v.user_id}`} className="mr-3 text-xs text-brand-600 hover:underline">সম্পাদনা করো</Link>
              <div className="flex gap-2">
                <Button loading={approve.isPending} onClick={() => approve.mutate(v.user_id)}>অনুমোদন</Button>
                <Button variant="danger" onClick={() => setRejectingId(v.user_id)}>প্রত্যাখ্যান</Button>
              </div>
            </div>

            {rejectingId === v.user_id && (
              <div className="mt-3 border-t border-slate-100 pt-3">
                <textarea className="input" rows={2} placeholder="প্রত্যাখ্যানের কারণ লেখো..." value={reason} onChange={(e) => setReason(e.target.value)} />
                <div className="mt-2 flex gap-2">
                  <Button variant="danger" loading={reject.isPending} disabled={!reason} onClick={() => reject.mutate()}>নিশ্চিত করো</Button>
                  <Button variant="ghost" onClick={() => setRejectingId(null)}>বাতিল</Button>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
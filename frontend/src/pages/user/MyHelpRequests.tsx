import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { helpRequestsApi } from "@/api/helpRequests";
import type { HelpRequestType, HelpRequestUrgency } from "@/types";
import StatusBadge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Select from "@/components/ui/Select";
import Spinner from "@/components/ui/Spinner";
import EmptyState from "@/components/ui/EmptyState";
import { formatDate } from "@/lib/utils";

// এটাই একটা পূর্ণাঙ্গ উদাহরণ — list দেখানো + নতুন কিছু তৈরি করা (create + list pattern),
// পরের যেকোনো মডিউল (ambulance, blood donor ইত্যাদি) এই একই প্যাটার্নে বানানো যাবে।
export default function MyHelpRequests() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ upazila_id: 1, type: "info" as HelpRequestType, urgency: "normal" as HelpRequestUrgency, description: "" });

  const { data: requests, isLoading } = useQuery({ queryKey: ["my-help-requests"], queryFn: helpRequestsApi.my });

  const createMutation = useMutation({
    mutationFn: () => helpRequestsApi.create(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-help-requests"] });
      setForm({ ...form, description: "" });
    },
  });

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="mb-4 font-semibold text-brand-800">নতুন সাহায্যের অনুরোধ</h2>
        <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(); }} className="grid grid-cols-2 gap-4">
          <Select label="ধরন" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as HelpRequestType })}>
            <option value="info">তথ্য</option>
            <option value="serial">সিরিয়াল</option>
            <option value="accommodation">থাকার ব্যবস্থা</option>
            <option value="ambulance">অ্যাম্বুলেন্স</option>
            <option value="blood">রক্ত</option>
            <option value="emergency">জরুরি</option>
          </Select>
          <Select label="জরুরি মাত্রা" value={form.urgency} onChange={(e) => setForm({ ...form, urgency: e.target.value as HelpRequestUrgency })}>
            <option value="normal">স্বাভাবিক</option>
            <option value="urgent">জরুরি</option>
            <option value="emergency">অতি জরুরি</option>
          </Select>
          <div className="col-span-2">
            <label className="label">বিস্তারিত</label>
            <textarea className="input" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required minLength={5} />
          </div>
          <Button type="submit" loading={createMutation.isPending} className="col-span-2">অনুরোধ পাঠাও</Button>
        </form>
      </Card>

      <div>
        <h2 className="mb-3 font-semibold text-brand-800">আমার সব অনুরোধ</h2>
        {isLoading && <Spinner />}
        {requests?.length === 0 && <EmptyState message="এখনো কোনো অনুরোধ করা হয়নি" />}
        <div className="space-y-3">
          {requests?.map((r) => (
            <Card key={r.id} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{r.description}</p>
                <p className="mt-1 text-xs text-slate-400">{formatDate(r.created_at)}</p>
              </div>
              <StatusBadge status={r.status} />
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

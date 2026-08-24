import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/api/admin";
import Card from "@/components/ui/Card";
import Spinner from "@/components/ui/Spinner";
import EmptyState from "@/components/ui/EmptyState";

export default function AllVolunteers() {
  const [status, setStatus] = useState<string>("active");

  const { data: volunteers, isLoading } = useQuery({
    queryKey: ["admin-all-volunteers", status],
    queryFn: () => adminApi.volunteers(status),
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-800">সকল ভলান্টিয়ার তালিকা</h1>
          <p className="text-sm text-slate-500">পুরো প্ল্যাটফর্মের ভলান্টিয়ারদের তথ্য অনুসন্ধান করুন</p>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
          <label>স্ট্যাটাস:</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-1.5 outline-none focus:border-brand-500"
          >
            <option value="active">অ্যাক্টিভ (Active)</option>
            <option value="pending">পেন্ডিং (Pending)</option>
            <option value="suspended">সাসপেন্ডেড (Suspended)</option>
          </select>
        </div>
      </div>

      {isLoading && <Spinner />}

      {!isLoading && volunteers?.length === 0 && (
        <EmptyState message="এই স্ট্যাটাসে কোনো ভলান্টিয়ার পাওয়া যায়নি।" />
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {volunteers?.map((v) => (
          <Card key={v.user_id} className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-slate-800">{v.name}</h3>
                <p className="mt-0.5 text-xs text-slate-500">📞 {v.phone}</p>
              </div>
              <span
                className={`rounded px-2 py-0.5 text-[11px] font-medium capitalize ${
                  v.status === "active"
                    ? "bg-emerald-50 text-emerald-700"
                    : v.status === "pending"
                    ? "bg-amber-50 text-amber-700"
                    : "bg-rose-50 text-rose-700"
                }`}
              >
                {v.status}
              </span>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3 text-xs text-slate-500">
              <div>
                <span className="block text-[10px] text-slate-400">স্টুডেন্ট আইডি</span>
                <span className="font-medium text-slate-700">{v.student_id_no || "N/A"}</span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-400">সেমিস্টার</span>
                <span className="font-medium text-slate-700">{v.semester || "N/A"}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
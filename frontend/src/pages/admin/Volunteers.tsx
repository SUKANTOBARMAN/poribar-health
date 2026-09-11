import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/api/admin";
import StatusBadge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import Select from "@/components/ui/Select";
import Spinner from "@/components/ui/Spinner";
import EmptyState from "@/components/ui/EmptyState";
import GeoUpazilaPicker from "@/components/GeoUpazilaPicker";

export default function AdminVolunteers() {
  const [status, setStatus] = useState("");
  const [upazilaId, setUpazilaId] = useState<number | null>(null);

  const { data: volunteers, isLoading } = useQuery({
    queryKey: ["admin-volunteers", status, upazilaId],
    queryFn: () => adminApi.volunteers({ status: status || undefined, upazila_id: upazilaId || undefined }),
  });

  return (
    <div>
      <h1 className="text-xl font-bold text-brand-800">সব ভলান্টিয়ার</h1>

      <div className="mt-4 max-w-lg space-y-3 rounded-xl border border-slate-200 bg-white p-4">
        <Select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">সব স্ট্যাটাস</option>
          <option value="pending">অপেক্ষমান</option>
          <option value="active">সক্রিয়</option>
          <option value="suspended">স্থগিত</option>
        </Select>
        <div>
          <label className="label">এলাকা অনুযায়ী দেখো</label>
          <GeoUpazilaPicker value={upazilaId} onChange={setUpazilaId} />
        </div>
      </div>

      {isLoading && <Spinner />}
      {volunteers?.length === 0 && <EmptyState message="কোনো ভলান্টিয়ার পাওয়া যায়নি" />}
      <div className="mt-4 space-y-3">
        {volunteers?.map((v) => (
          <Card key={v.user_id} className="flex items-center justify-between">
            <div>
              <p className="font-medium">{v.name}</p>
              <p className="text-xs text-slate-500">{v.phone} · স্টুডেন্ট আইডি: {v.student_id_no} · সেমিস্টার: {v.semester}</p>
            </div>
            <StatusBadge status={v.status} />
          </Card>
        ))}
      </div>
    </div>
  );
}
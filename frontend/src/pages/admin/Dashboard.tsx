import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/api/admin";
import Card from "@/components/ui/Card";
import Spinner from "@/components/ui/Spinner";
import { STATUS_LABELS_BN } from "@/lib/utils";

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({ queryKey: ["admin-dashboard"], queryFn: adminApi.dashboard });
  if (isLoading) return <Spinner />;
  if (!data) return null;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-brand-800">Organization Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card><p className="text-2xl font-bold text-brand-700">{data.total_users}</p><p className="text-xs text-slate-500">মোট ইউজার</p></Card>
        <Card><p className="text-2xl font-bold text-brand-700">{data.total_volunteers_active}</p><p className="text-xs text-slate-500">সক্রিয় ভলান্টিয়ার</p></Card>
        <Card><p className="text-2xl font-bold text-amber-600">{data.pending_volunteer_approvals}</p><p className="text-xs text-slate-500">অনুমোদনের অপেক্ষায়</p></Card>
        <Card><p className="text-2xl font-bold text-brand-700">{data.total_hospitals}</p><p className="text-xs text-slate-500">হাসপাতাল</p></Card>
        <Card><p className="text-2xl font-bold text-brand-700">{data.total_help_requests}</p><p className="text-xs text-slate-500">মোট অনুরোধ</p></Card>
        <Card><p className="text-2xl font-bold text-green-700">{data.resolved_help_requests}</p><p className="text-xs text-slate-500">সমাধান হয়েছে</p></Card>
        <Card><p className="text-2xl font-bold text-brand-700">{data.available_ambulances}/{data.total_ambulances}</p><p className="text-xs text-slate-500">উপলব্ধ অ্যাম্বুলেন্স</p></Card>
        <Card><p className="text-2xl font-bold text-rust-600">{data.total_blood_donors}</p><p className="text-xs text-slate-500">রক্তদাতা</p></Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <h2 className="mb-3 font-semibold text-brand-800">ধরন অনুযায়ী অনুরোধ</h2>
          <Card>
            {Object.entries(data.requests_by_type).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between border-b border-slate-50 py-2 last:border-0">
                <span className="text-sm">{STATUS_LABELS_BN[type] || type}</span>
                <span className="font-medium">{count}</span>
              </div>
            ))}
          </Card>
        </div>
        <div>
          <h2 className="mb-3 font-semibold text-brand-800">স্ট্যাটাস অনুযায়ী অনুরোধ</h2>
          <Card>
            {Object.entries(data.requests_by_status).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between border-b border-slate-50 py-2 last:border-0">
                <span className="text-sm">{STATUS_LABELS_BN[status] || status}</span>
                <span className="font-medium">{count}</span>
              </div>
            ))}
          </Card>
        </div>
      </div>

      <div>
        <h2 className="mb-3 font-semibold text-brand-800">এই মাসের শীর্ষ ভলান্টিয়ার</h2>
        <Card>
          {data.top_volunteers_this_month.map((v, i) => (
            <div key={v.user_id} className="flex items-center justify-between border-b border-slate-50 py-2 last:border-0">
              <span className="text-sm">#{i + 1} {v.name}</span>
              <span className="font-medium text-brand-700">{v.resolved_count} সহায়তা</span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}
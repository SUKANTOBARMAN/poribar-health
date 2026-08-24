import { useQuery } from "@tanstack/react-query";
import { directorAnalyticsApi } from "@/api/admin";
import Card from "@/components/ui/Card";
import Spinner from "@/components/ui/Spinner";
import { STATUS_LABELS_BN } from "@/lib/utils";

export default function AreaAnalytics() {
  const { data, isLoading } = useQuery({ queryKey: ["director-analytics"], queryFn: directorAnalyticsApi.analytics });
  if (isLoading) return <Spinner />;
  if (!data) return null;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-brand-800">এলাকার Analytics</h1>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <Card><p className="text-2xl font-bold text-brand-700">{data.total_volunteers_active}</p><p className="text-xs text-slate-500">সক্রিয় ভলান্টিয়ার</p></Card>
        <Card><p className="text-2xl font-bold text-amber-600">{data.pending_volunteer_approvals}</p><p className="text-xs text-slate-500">অনুমোদনের অপেক্ষায়</p></Card>
        <Card><p className="text-2xl font-bold text-brand-700">{data.total_help_requests}</p><p className="text-xs text-slate-500">মোট অনুরোধ</p></Card>
        <Card><p className="text-2xl font-bold text-green-700">{data.resolved_help_requests}</p><p className="text-xs text-slate-500">সমাধান হয়েছে</p></Card>
        <Card><p className="text-2xl font-bold text-amber-600">{data.pending_article_reviews}</p><p className="text-xs text-slate-500">আর্টিকেল রিভিউ বাকি</p></Card>
      </div>

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
        <h2 className="mb-3 font-semibold text-brand-800">এই মাসের শীর্ষ ভলান্টিয়ার</h2>
        <Card>
          {data.top_volunteers_this_month.map((v, i) => (
            <div key={v.user_id} className="flex items-center justify-between border-b border-slate-50 py-2 last:border-0">
              <span className="text-sm">#{i + 1} {v.name}</span>
              <span className="font-medium text-brand-700">{v.resolved_count} সহায়তা</span>
            </div>
          ))}
          {data.top_volunteers_this_month.length === 0 && <p className="text-sm text-slate-400">এই মাসে এখনো কোনো সহায়তার রেকর্ড নেই</p>}
        </Card>
      </div>
    </div>
  );
}
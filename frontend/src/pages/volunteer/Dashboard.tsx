import { useQuery } from "@tanstack/react-query";
import { volunteersApi } from "@/api/volunteers";
import Card from "@/components/ui/Card";
import Spinner from "@/components/ui/Spinner";

export default function VolunteerDashboard() {
  const { data, isLoading } = useQuery({ queryKey: ["volunteer-dashboard"], queryFn: volunteersApi.dashboard });

  if (isLoading) return <Spinner />;
  if (!data) return null;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-brand-800">আমার ড্যাশবোর্ড</h1>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card><p className="text-2xl font-bold text-brand-700">{data.total_assistance_count}</p><p className="text-xs text-slate-500">মোট সহায়তা</p></Card>
        <Card><p className="text-2xl font-bold text-brand-700">{data.this_month_assistance_count}</p><p className="text-xs text-slate-500">এই মাসে</p></Card>
        <Card><p className="text-2xl font-bold text-amber-600">{data.pending_requests_count}</p><p className="text-xs text-slate-500">অপেক্ষমান</p></Card>
        <Card><p className="text-2xl font-bold text-brand-700">#{data.rank}</p><p className="text-xs text-slate-500">এলাকায় ranking ({data.total_volunteers_in_area} জনের মধ্যে)</p></Card>
      </div>

      <div>
        <h2 className="mb-3 font-semibold text-brand-800">আমার ব্যাজ</h2>
        <div className="flex flex-wrap gap-3">
          {data.badges.map((b) => (
            <div key={b.badge.id} className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-center">
              <p className="text-2xl">🏅</p>
              <p className="mt-1 text-sm font-medium text-amber-800">{b.badge.name_bn}</p>
              <p className="text-[11px] text-amber-600">{b.badge.description}</p>
            </div>
          ))}
          {data.badges.length === 0 && <p className="text-sm text-slate-400">এখনো কোনো ব্যাজ অর্জন করোনি — সাহায্যের অনুরোধ resolve করলে automatic ব্যাজ পাবে।</p>}
        </div>
      </div>
    </div>
  );
}
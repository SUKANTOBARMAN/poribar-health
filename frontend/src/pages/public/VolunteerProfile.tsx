import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { volunteersApi } from "@/api/volunteers";
import Spinner from "@/components/ui/Spinner";
import Card from "@/components/ui/Card";

export default function VolunteerProfile() {
  const { slug } = useParams();
  const { data: profile, isLoading } = useQuery({ queryKey: ["volunteer-profile", slug], queryFn: () => volunteersApi.publicProfile(slug!) });

  if (isLoading) return <Spinner />;
  if (!profile) return null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-brand-100 text-2xl font-bold text-brand-700">
          {profile.name.charAt(0)}
        </div>
        <h1 className="mt-3 text-xl font-bold text-brand-800">{profile.name}</h1>
        <p className="text-sm text-brand-600">✓ Verified by Poribar Health</p>
      </div>

      <div className="mt-8 grid grid-cols-3 gap-3 text-center">
        <Card><p className="text-2xl font-bold text-brand-700">{profile.total_assistance_count}</p><p className="text-xs text-slate-500">মোট সহায়তা</p></Card>
        <Card><p className="text-2xl font-bold text-rust-600">{profile.emergency_case_count}</p><p className="text-xs text-slate-500">জরুরি কেস</p></Card>
        <Card><p className="text-2xl font-bold text-brand-700">{profile.published_article_count}</p><p className="text-xs text-slate-500">আর্টিকেল</p></Card>
      </div>

      <h2 className="mt-8 font-semibold text-brand-800">অর্জিত ব্যাজ</h2>
      <div className="mt-3 flex flex-wrap gap-3">
        {profile.badges.map((b) => (
          <div key={b.badge.id} className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-center">
            <p className="text-sm font-medium text-amber-800">🏅 {b.badge.name_bn}</p>
          </div>
        ))}
        {profile.badges.length === 0 && <p className="text-sm text-slate-400">এখনো কোনো ব্যাজ অর্জন করেননি</p>}
      </div>

      <h2 className="mt-8 font-semibold text-brand-800">প্রকাশিত আর্টিকেল</h2>
      <div className="mt-3 space-y-2">
        {profile.articles.map((a) => <Card key={a.id}><p className="font-medium">{a.title}</p></Card>)}
        {profile.articles.length === 0 && <p className="text-sm text-slate-400">এখনো কোনো আর্টিকেল প্রকাশিত হয়নি</p>}
      </div>
    </div>
  );
}
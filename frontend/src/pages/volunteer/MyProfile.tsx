import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { volunteersApi } from "@/api/volunteers";
import { documentsApi } from "@/api/documents";
import { useAuthStore } from "@/store/authStore";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import StatusBadge from "@/components/ui/Badge";
import Spinner from "@/components/ui/Spinner";
import { formatDate } from "@/lib/utils";

export default function MyProfile() {
  const { user } = useAuthStore();
  const [file, setFile] = useState<File | null>(null);

  const { data: dashboard, isLoading } = useQuery({ queryKey: ["volunteer-dashboard"], queryFn: volunteersApi.dashboard });
  const { data: certificates } = useQuery({ queryKey: ["my-certificates"], queryFn: volunteersApi.myCertificates });
  const { data: letters } = useQuery({ queryKey: ["my-reference-letters"], queryFn: volunteersApi.myReferenceLetters });
  const { data: awards } = useQuery({ queryKey: ["my-awards"], queryFn: volunteersApi.myAwards });

  const uploadMutation = useMutation({ mutationFn: () => documentsApi.upload(file!) });

  if (isLoading) return <Spinner />;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-brand-800">আমার প্রোফাইল</h1>
        <p className="mt-1 text-sm text-slate-500">তথ্য বদলাতে <a href="/app/settings" className="text-brand-600 hover:underline">সেটিংস</a> পেজে যাও।</p>
      </div>

      <Card>
        <p className="text-sm"><span className="text-slate-500">নাম:</span> {user?.name}</p>
        <p className="mt-1 text-sm"><span className="text-slate-500">ফোন:</span> {user?.phone}</p>
        <p className="mt-1 text-sm"><span className="text-slate-500">ইমেইল:</span> {user?.email || "দেওয়া নেই"}</p>
      </Card>

      {dashboard && (
        <Card>
          <p className="mb-2 text-sm font-semibold text-brand-800">সংক্ষিপ্ত পরিসংখ্যান</p>
          <p className="text-sm">মোট সহায়তা: <span className="font-medium">{dashboard.total_assistance_count}</span></p>
          <p className="mt-1 text-sm">এলাকায় র‍্যাংক: <span className="font-medium">#{dashboard.rank}</span></p>
        </Card>
      )}

      <Card>
        <p className="mb-3 text-sm font-semibold text-brand-800">স্টুডেন্ট আইডি কার্ড আপলোড</p>
        <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setFile(e.target.files?.[0] || null)} className="text-sm" />
        <Button className="mt-3" disabled={!file} loading={uploadMutation.isPending} onClick={() => uploadMutation.mutate()}>আপলোড করো</Button>
        {uploadMutation.isSuccess && <p className="mt-2 text-xs text-green-700">✓ আপলোড সফল হয়েছে</p>}
      </Card>

      <div>
        <h2 className="mb-3 font-semibold text-brand-800">আমার সার্টিফিকেট</h2>
        {certificates?.length === 0 && <p className="text-sm text-slate-400">এখনো কোনো সার্টিফিকেট ইস্যু হয়নি</p>}
        <div className="space-y-2">
          {certificates?.map((c) => (
            <Card key={c.id} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{c.type === "appreciation" ? "স্বীকৃতি সনদ" : "বার্ষিক সেবা সনদ"}</p>
                <p className="text-xs text-slate-400">{formatDate(c.issued_at)}</p>
              </div>
              <Button variant="secondary" onClick={() => volunteersApi.downloadCertificate(c.token)}>ডাউনলোড</Button>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-3 font-semibold text-brand-800">আমার Reference Letter</h2>
        {letters?.length === 0 && <p className="text-sm text-slate-400">এখনো কোনো Reference Letter ইস্যু হয়নি</p>}
        <div className="space-y-2">
          {letters?.map((l) => (
            <Card key={l.id} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{l.purpose || "সাধারণ প্রত্যয়নপত্র"}</p>
                <p className="text-xs text-slate-400">{formatDate(l.issued_at)}</p>
              </div>
              <Button variant="secondary" onClick={() => volunteersApi.downloadReferenceLetter(l.token)}>ডাউনলোড</Button>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-3 font-semibold text-brand-800">আমার পুরস্কার মনোনয়ন</h2>
        {awards?.length === 0 && <p className="text-sm text-slate-400">এখনো কোনো মনোনয়ন নেই</p>}
        <div className="space-y-2">
          {awards?.map((a) => (
            <Card key={a.id} className="flex items-center justify-between">
              <p className="text-sm font-medium">{a.award_title}</p>
              <StatusBadge status={a.status} />
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
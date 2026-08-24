import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { volunteersApi } from "@/api/volunteers";
import { useAuthStore } from "@/store/authStore";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Spinner from "@/components/ui/Spinner";

export default function MyProfile() {
  const { user } = useAuthStore();
  const { data: dashboard, isLoading } = useQuery({ queryKey: ["volunteer-dashboard"], queryFn: volunteersApi.dashboard });

  const [certToken, setCertToken] = useState("");
  const [letterToken, setLetterToken] = useState("");
  const [downloading, setDownloading] = useState<"cert" | "letter" | null>(null);

  async function handleCertDownload() {
    if (!certToken) return;
    setDownloading("cert");
    try {
      await volunteersApi.downloadCertificate(certToken);
    } finally {
      setDownloading(null);
    }
  }

  async function handleLetterDownload() {
    if (!letterToken) return;
    setDownloading("letter");
    try {
      await volunteersApi.downloadReferenceLetter(letterToken);
    } finally {
      setDownloading(null);
    }
  }

  if (isLoading) return <Spinner />;

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-brand-800">আমার প্রোফাইল</h1>
        <p className="mt-1 text-sm text-slate-500">এখন পর্যন্ত প্রোফাইল edit করার ফিচার নেই — শুধু তথ্য দেখা যাবে।</p>
      </div>

      <Card>
        <p className="text-sm"><span className="text-slate-500">নাম:</span> {user?.name}</p>
        <p className="mt-1 text-sm"><span className="text-slate-500">ফোন:</span> {user?.phone}</p>
        <p className="mt-1 text-sm"><span className="text-slate-500">ইমেইল:</span> {user?.email || "দেওয়া নেই"}</p>
        <p className="mt-1 text-sm"><span className="text-slate-500">স্ট্যাটাস:</span> {user?.status}</p>
      </Card>

      {dashboard && (
        <Card>
          <p className="mb-2 text-sm font-semibold text-brand-800">সংক্ষিপ্ত পরিসংখ্যান</p>
          <p className="text-sm">মোট সহায়তা: <span className="font-medium">{dashboard.total_assistance_count}</span></p>
          <p className="mt-1 text-sm">এলাকায় র‍্যাংক: <span className="font-medium">#{dashboard.rank}</span> ({dashboard.total_volunteers_in_area} জনের মধ্যে)</p>
          <p className="mt-1 text-sm">অর্জিত ব্যাজ: <span className="font-medium">{dashboard.badges.length}</span> টি</p>
        </Card>
      )}

      <Card>
        <p className="mb-3 text-sm font-semibold text-brand-800">সার্টিফিকেট ডাউনলোড</p>
        <p className="mb-2 text-xs text-slate-500">Director থেকে ইস্যু হওয়ার পর notification-এ যেই token পেয়েছ সেটা এখানে বসাও।</p>
        <div className="flex gap-2">
          <Input placeholder="Certificate token" value={certToken} onChange={(e) => setCertToken(e.target.value)} />
          <Button loading={downloading === "cert"} disabled={!certToken} onClick={handleCertDownload}>ডাউনলোড</Button>
        </div>
      </Card>

      <Card>
        <p className="mb-3 text-sm font-semibold text-brand-800">Reference Letter ডাউনলোড</p>
        <div className="flex gap-2">
          <Input placeholder="Reference letter token" value={letterToken} onChange={(e) => setLetterToken(e.target.value)} />
          <Button loading={downloading === "letter"} disabled={!letterToken} onClick={handleLetterDownload}>ডাউনলোড</Button>
        </div>
      </Card>
    </div>
  );
}
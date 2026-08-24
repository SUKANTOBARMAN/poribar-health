import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/client";
import Card from "@/components/ui/Card";

export default function AwardsAndCertificates() {
  const queryClient = useQueryClient();
  const [volunteerId, setVolunteerId] = useState<number | "">("");
  const [awardTitle, setAwardTitle] = useState("");
  const [reason, setReason] = useState("");
  
  const [certVolunteerId, setCertVolunteerId] = useState<number | "">("");
  const [certType, setCertType] = useState<"appreciation" | "annual_service">("appreciation");
  const [issuedToken, setIssuedToken] = useState<string | null>(null);

  // ১. পুরস্কার মনোনয়ন মিউটেশন
  const nominateMutation = useMutation({
    mutationFn: (payload: { volunteer_id: number; award_title: string; reason: string }) =>
      api.post("/director/awards/nominate", payload),
    onSuccess: () => {
      setVolunteerId("");
      setAwardTitle("");
      setReason("");
      alert("পুরস্কার মনোনয়ন সফলভাবে জমা হয়েছে!");
    },
  });

  // ২. সার্টিফিকেট ইস্যু মিউটেশন
  const certMutation = useMutation({
    mutationFn: (payload: { volunteer_id: number; type: string }) =>
      api.post<{ token: string }>("/director/certificates/issue", payload).then((r) => r.data),
    onSuccess: (data) => {
      setCertVolunteerId("");
      setIssuedToken(data.token);
    },
  });

  const handleNominateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!volunteerId || !awardTitle.trim() || !reason.trim()) return;
    nominateMutation.mutate({
      volunteer_id: Number(volunteerId),
      award_title: awardTitle,
      reason,
    });
  };

  const handleCertSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!certVolunteerId) return;
    certMutation.mutate({
      volunteer_id: Number(certVolunteerId),
      type: certType,
    });
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-8">
      <div>
        <h1 className="text-2xl font-bold text-brand-800">পুরস্কার ও সনদ ব্যবস্থাপনা</h1>
        <p className="text-sm text-slate-500">মেধাবী ভলান্টিয়ারদের স্বীকৃতি প্রদান ও সনদ ইস্যু করুন</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* পুরস্কার মনোনয়ন ফর্ম */}
        <Card className="p-5">
          <h2 className="font-semibold text-slate-800">পুরস্কারের জন্য মনোনয়ন</h2>
          <form onSubmit={handleNominateSubmit} className="mt-4 space-y-3 text-xs">
            <div>
              <label className="block font-medium text-slate-600">ভলান্টিয়ার আইডি:</label>
              <input
                type="number"
                value={volunteerId}
                onChange={(e) => setVolunteerId(e.target.value ? Number(e.target.value) : "")}
                placeholder="যেমন: 6"
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-1.5 outline-none focus:border-brand-500"
                required
              />
            </div>

            <div>
              <label className="block font-medium text-slate-600">পুরস্কারের নাম/টাইটেল:</label>
              <input
                type="text"
                value={awardTitle}
                onChange={(e) => setAwardTitle(e.target.value)}
                placeholder="যেমন: Best Volunteer 2026"
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-1.5 outline-none focus:border-brand-500"
                required
              />
            </div>

            <div>
              <label className="block font-medium text-slate-600">মনোনয়নের কারণ:</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                placeholder="দায়িত্বশীলতা ও চমৎকার সেবার বিবরণ লিখুন..."
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-1.5 outline-none focus:border-brand-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={nominateMutation.isPending}
              className="btn btn-primary w-full text-xs"
            >
              {nominateMutation.isPending ? "জমা হচ্ছে..." : "মনোনয়ন দিন"}
            </button>
          </form>
        </Card>

        {/* সার্টিফিকেট ইস্যু ফর্ম */}
        <Card className="p-5">
          <h2 className="font-semibold text-slate-800">সনদ (Certificate) ইস্যু</h2>
          <form onSubmit={handleCertSubmit} className="mt-4 space-y-3 text-xs">
            <div>
              <label className="block font-medium text-slate-600">ভলান্টিয়ার আইডি:</label>
              <input
                type="number"
                value={certVolunteerId}
                onChange={(e) => setCertVolunteerId(e.target.value ? Number(e.target.value) : "")}
                placeholder="যেমন: 6"
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-1.5 outline-none focus:border-brand-500"
                required
              />
            </div>

            <div>
              <label className="block font-medium text-slate-600">সনদের ধরন:</label>
              <select
                value={certType}
                onChange={(e) => setCertType(e.target.value as "appreciation" | "annual_service")}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-1.5 outline-none focus:border-brand-500"
              >
                <option value="appreciation">Appreciation (প্রশংসাপত্র)</option>
                <option value="annual_service">Annual Service (বার্ষিক সেবা)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={certMutation.isPending}
              className="btn btn-primary w-full text-xs"
            >
              {certMutation.isPending ? "ইস্যু হচ্ছে..." : "সনদ ইস্যু করুন"}
            </button>
          </form>

          {issuedToken && (
            <div className="mt-4 rounded-md bg-emerald-50 p-3 text-xs text-emerald-800">
              <p className="font-semibold">✓ সার্টিফিকেট সফলভাবে জেনারেট হয়েছে!</p>
              <p className="mt-1 break-all text-[11px]">টোকেন: {issuedToken}</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
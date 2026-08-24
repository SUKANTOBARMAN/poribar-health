import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { recognitionApi } from "@/api/recognition";
import StatusBadge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Spinner from "@/components/ui/Spinner";
import EmptyState from "@/components/ui/EmptyState";
import VolunteerPicker from "@/components/VolunteerPicker";

export default function Awards() {
  const qc = useQueryClient();
  const [form, setForm] = useState<{ volunteer_id: number | null; award_title: string; reason: string }>({
    volunteer_id: null,
    award_title: "",
    reason: "",
  });
  const [letterForm, setLetterForm] = useState<{ volunteer_id: number | null; purpose: string }>({
    volunteer_id: null,
    purpose: "",
  });

  const { data: nominations, isLoading } = useQuery({ queryKey: ["award-nominations"], queryFn: () => recognitionApi.listNominations() });

  const nominate = useMutation({
    mutationFn: () => recognitionApi.nominate(form.volunteer_id!, form.award_title, form.reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["award-nominations"] });
      setForm({ volunteer_id: null, award_title: "", reason: "" });
    },
  });

  const issueLetter = useMutation({
    mutationFn: () => recognitionApi.issueReferenceLetter(letterForm.volunteer_id!, letterForm.purpose),
    onSuccess: () => setLetterForm({ volunteer_id: null, purpose: "" }),
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold text-brand-800">পুরস্কারের জন্য মনোনয়ন</h1>
        <Card className="mt-3">
          <form onSubmit={(e) => { e.preventDefault(); nominate.mutate(); }} className="space-y-3">
            <VolunteerPicker value={form.volunteer_id} onChange={(id) => setForm({ ...form, volunteer_id: id })} />
            <input className="input" placeholder="পুরস্কারের নাম (যেমন: Best Volunteer 2026)" value={form.award_title} onChange={(e) => setForm({ ...form, award_title: e.target.value })} required minLength={3} />
            <textarea className="input" rows={2} placeholder="মনোনয়নের কারণ" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} required minLength={10} />
            <Button type="submit" loading={nominate.isPending} disabled={!form.volunteer_id}>মনোনয়ন দাও</Button>
          </form>
        </Card>
      </div>

      <div>
        <h2 className="mb-3 font-semibold text-brand-800">সব মনোনয়ন</h2>
        {isLoading && <Spinner />}
        {nominations?.length === 0 && <EmptyState message="এখনো কোনো মনোনয়ন নেই" />}
        <div className="space-y-2">
          {nominations?.map((n) => (
            <Card key={n.id} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{n.award_title}</p>
                <p className="text-xs text-slate-500">{n.reason}</p>
              </div>
              <StatusBadge status={n.status} />
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-3 font-semibold text-brand-800">Reference Letter ইস্যু করো</h2>
        <Card>
          <form onSubmit={(e) => { e.preventDefault(); issueLetter.mutate(); }} className="space-y-3">
            <VolunteerPicker value={letterForm.volunteer_id} onChange={(id) => setLetterForm({ ...letterForm, volunteer_id: id })} />
            <input className="input" placeholder="উদ্দেশ্য (যেমন: চাকরির আবেদনের জন্য)" value={letterForm.purpose} onChange={(e) => setLetterForm({ ...letterForm, purpose: e.target.value })} />
            <Button type="submit" loading={issueLetter.isPending} disabled={!letterForm.volunteer_id}>ইস্যু করো</Button>
            {issueLetter.isSuccess && <p className="text-sm text-green-700">✓ ইস্যু হয়েছে, ভলান্টিয়ার notification পাবে এবং নিজের ড্যাশবোর্ড থেকে ডাউনলোড করতে পারবে।</p>}
          </form>
        </Card>
      </div>
    </div>
  );
}
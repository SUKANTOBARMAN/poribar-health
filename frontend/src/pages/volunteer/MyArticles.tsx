import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { articlesApi } from "@/api/articles";
import type { ArticleType } from "@/types";
import StatusBadge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Select from "@/components/ui/Select";
import Spinner from "@/components/ui/Spinner";
import EmptyState from "@/components/ui/EmptyState";

export default function MyArticles() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ title: "", body: "", type: "success_story" as ArticleType });

  const { data: articles, isLoading } = useQuery({ queryKey: ["my-articles"], queryFn: articlesApi.mine });

  const create = useMutation({
    mutationFn: () => articlesApi.create(form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["my-articles"] }); setForm({ title: "", body: "", type: "success_story" }); },
  });

  const submitForReview = useMutation({
    mutationFn: (id: number) => articlesApi.update(id, { submit_for_review: true }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-articles"] }),
  });

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="mb-4 font-semibold text-brand-800">নতুন আর্টিকেল লিখুন</h2>
        <form onSubmit={(e) => { e.preventDefault(); create.mutate(); }} className="space-y-4">
          <input className="input" placeholder="শিরোনাম" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required minLength={5} />
          <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as ArticleType })}>
            <option value="success_story">সফলতার গল্প</option>
            <option value="health_info">স্বাস্থ্য তথ্য</option>
            <option value="area_report">এলাকার প্রতিবেদন</option>
          </Select>
          <textarea className="input" rows={4} placeholder="মূল লেখা (কমপক্ষে ২০ ক্যারেক্টার)" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} required minLength={20} />
          <Button type="submit" loading={create.isPending}>খসড়া হিসেবে সেভ করো</Button>
        </form>
      </Card>

      <div>
        <h2 className="mb-3 font-semibold text-brand-800">আমার সব আর্টিকেল</h2>
        {isLoading && <Spinner />}
        {articles?.length === 0 && <EmptyState message="এখনো কোনো আর্টিকেল লেখা হয়নি" />}
        <div className="space-y-3">
          {articles?.map((a) => (
            <Card key={a.id}>
              <div className="flex items-center justify-between">
                <p className="font-medium">{a.title}</p>
                <StatusBadge status={a.status} />
              </div>
              {a.review_note && <p className="mt-1 text-xs text-rust-600">রিভিউ নোট: {a.review_note}</p>}
              {(a.status === "draft" || a.status === "rejected") && (
                <Button variant="secondary" className="mt-3" loading={submitForReview.isPending} onClick={() => submitForReview.mutate(a.id)}>
                  রিভিউর জন্য জমা দাও
                </Button>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
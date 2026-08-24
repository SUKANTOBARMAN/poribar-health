import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { articlesApi } from "@/api/articles";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Spinner from "@/components/ui/Spinner";
import EmptyState from "@/components/ui/EmptyState";

export default function ArticleReview() {
  const qc = useQueryClient();
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [note, setNote] = useState("");

  const { data: articles, isLoading } = useQuery({ queryKey: ["director-articles"], queryFn: () => articlesApi.forReview("pending") });

  const approve = useMutation({ mutationFn: (id: number) => articlesApi.approve(id), onSuccess: () => qc.invalidateQueries({ queryKey: ["director-articles"] }) });
  const reject = useMutation({
    mutationFn: () => articlesApi.reject(rejectingId!, note),
    onSuccess: () => { setRejectingId(null); setNote(""); qc.invalidateQueries({ queryKey: ["director-articles"] }); },
  });

  return (
    <div>
      <h1 className="text-xl font-bold text-brand-800">আর্টিকেল রিভিউ</h1>
      {isLoading && <Spinner />}
      {articles?.length === 0 && <EmptyState message="রিভিউর অপেক্ষায় কোনো আর্টিকেল নেই" />}
      <div className="mt-4 space-y-3">
        {articles?.map((a) => (
          <Card key={a.id}>
            <p className="font-medium">{a.title}</p>
            <p className="mt-1 line-clamp-3 text-sm text-slate-600">{a.body}</p>
            <div className="mt-3 flex gap-2">
              <Button loading={approve.isPending} onClick={() => approve.mutate(a.id)}>অনুমোদন</Button>
              <Button variant="danger" onClick={() => setRejectingId(a.id)}>প্রত্যাখ্যান</Button>
            </div>
            {rejectingId === a.id && (
              <div className="mt-3 border-t border-slate-100 pt-3">
                <textarea className="input" rows={2} placeholder="প্রত্যাখ্যানের কারণ..." value={note} onChange={(e) => setNote(e.target.value)} />
                <div className="mt-2 flex gap-2">
                  <Button variant="danger" loading={reject.isPending} disabled={!note} onClick={() => reject.mutate()}>নিশ্চিত করো</Button>
                  <Button variant="ghost" onClick={() => setRejectingId(null)}>বাতিল</Button>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
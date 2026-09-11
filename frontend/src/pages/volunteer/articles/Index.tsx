import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { articlesApi } from "@/api/articles";
import StatusBadge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import Spinner from "@/components/ui/Spinner";
import EmptyState from "@/components/ui/EmptyState";

export default function ArticleIndex() {
  const { data: articles, isLoading } = useQuery({ queryKey: ["my-articles"], queryFn: articlesApi.mine });
  
  const qc = useQueryClient();
  const remove = useMutation({
    mutationFn: (id: number) => articlesApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-articles"] }),
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-brand-800">আমার আর্টিকেল</h1>
        <Link to="/app/volunteer/articles/new" className="btn btn-primary text-xs">+ নতুন আর্টিকেল</Link>
      </div>

      {isLoading && <Spinner />}
      {articles?.length === 0 && <EmptyState message="এখনো কোনো আর্টিকেল লেখা হয়নি" />}
      <div className="mt-4 space-y-3">
        {articles?.map((a) => (
          <Card key={a.id}>
            <div className="flex items-center justify-between">
              <p className="font-medium">{a.title}</p>
              <StatusBadge status={a.status} />
            </div>
            {a.category_name && <p className="mt-1 text-xs text-brand-600">📁 {a.category_name}</p>}
            {a.review_note && <p className="mt-1 text-xs text-rust-600">রিভিউ নোট: {a.review_note}</p>}
            {(a.status === "draft" || a.status === "rejected" || a.status==="pending" || a.status === "approved") && (
              <Link to={`/app/volunteer/articles/${a.id}/edit`} className="mt-2 inline-block text-xs text-brand-600 hover:underline">সম্পাদনা করো →</Link>
            )}
            {(a.status === "draft" || a.status === "rejected" || a.status==="pending" || a.status === "approved") && (
              <button onClick={() => confirm("মুছে ফেলতে চাও?") && remove.mutate(a.id)} className="text-xs text-rust-600 hover:underline">মুছো</button>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
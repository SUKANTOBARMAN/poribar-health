import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { articlesApi } from "@/api/articles";
import StatusBadge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import Select from "@/components/ui/Select";
import Spinner from "@/components/ui/Spinner";
import EmptyState from "@/components/ui/EmptyState";

export default function ArticleReview() {
  const [status, setStatus] = useState("pending");
  const { data: articles, isLoading } = useQuery({ queryKey: ["director-articles", status], queryFn: () => articlesApi.forReview(status || undefined) });

  return (
    <div>
      <h1 className="text-xl font-bold text-brand-800">আর্টিকেল রিভিউ</h1>
      <div className="mt-3 max-w-xs">
        <Select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="pending">অপেক্ষমান</option>
          <option value="approved">অনুমোদিত</option>
          <option value="rejected">প্রত্যাখ্যাত</option>
          <option value="draft">খসড়া</option>
        </Select>
      </div>

      {isLoading && <Spinner />}
      {articles?.length === 0 && <EmptyState message="কোনো আর্টিকেল নেই" />}
      <div className="mt-4 space-y-3">
        {articles?.map((a) => (
          <Link key={a.id} to={`/app/director/articles/${a.id}`}>
            <Card className="flex items-center justify-between hover:shadow-md">
              <div>
                <p className="font-medium">{a.title}</p>
                <p className="text-xs text-slate-500">✍️ {a.author_name}</p>
              </div>
              <StatusBadge status={a.status} />
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
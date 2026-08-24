import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { articlesApi } from "@/api/articles";
import type { ArticleType } from "@/types";
import Spinner from "@/components/ui/Spinner";
import EmptyState from "@/components/ui/EmptyState";
import Select from "@/components/ui/Select";
import Pagination from "@/components/ui/Pagination";

const PAGE_SIZE = 10;

export default function Articles() {
  const [type, setType] = useState<ArticleType | "">("");
  const [page, setPage] = useState(1);

  const { data: articles, isLoading } = useQuery({
    queryKey: ["articles", type, page],
    queryFn: () => articlesApi.list({ type: type || undefined, page, page_size: PAGE_SIZE }),
  });

  function handleTypeChange(value: string) {
    setType(value as ArticleType);
    setPage(1);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold text-brand-800">সফলতার গল্প ও স্বাস্থ্য তথ্য</h1>
      <div className="mt-4 max-w-xs">
        <Select value={type} onChange={(e) => handleTypeChange(e.target.value)}>
          <option value="">সব ধরন</option>
          <option value="success_story">সফলতার গল্প</option>
          <option value="health_info">স্বাস্থ্য তথ্য</option>
          <option value="area_report">এলাকার প্রতিবেদন</option>
        </Select>
      </div>

      {isLoading && <Spinner />}
      {articles?.length === 0 && <EmptyState message="কোনো আর্টিকেল পাওয়া যায়নি" />}
      <div className="mt-6 space-y-4">
        {articles?.map((a) => (
          <Link key={a.id} to={`/articles/${a.id}`} className="card block p-5 hover:shadow-md">
            <h3 className="font-semibold text-brand-800">{a.title}</h3>
            <p className="mt-1 line-clamp-2 text-sm text-slate-600">{a.body}</p>
            <div className="mt-2 flex gap-2">
              {a.tags.map((t) => <span key={t} className="badge bg-brand-100 text-brand-700">{t}</span>)}
            </div>
          </Link>
        ))}
      </div>

      {articles && articles.length > 0 && (
        <Pagination page={page} hasMore={articles.length === PAGE_SIZE} onPageChange={setPage} />
      )}
    </div>
  );
}
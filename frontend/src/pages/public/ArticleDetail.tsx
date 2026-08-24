import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { articlesApi } from "@/api/articles";
import Spinner from "@/components/ui/Spinner";
import { formatDate } from "@/lib/utils";

export default function ArticleDetail() {
  const { id } = useParams();
  const { data: article, isLoading } = useQuery({ queryKey: ["article", id], queryFn: () => articlesApi.detail(Number(id)) });

  if (isLoading) return <Spinner />;
  if (!article) return null;

  return (
    <article className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-bold text-brand-800">{article.title}</h1>
      {article.published_at && <p className="mt-1 text-xs text-slate-400">{formatDate(article.published_at)}</p>}
      <div className="mt-2 flex gap-2">
        {article.tags.map((t) => <span key={t} className="badge bg-brand-100 text-brand-700">{t}</span>)}
      </div>
      <div className="mt-6 whitespace-pre-line text-slate-700">{article.body}</div>
    </article>
  );
}
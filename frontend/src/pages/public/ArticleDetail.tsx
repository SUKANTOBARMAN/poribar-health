import { useRef, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { articlesApi } from "@/api/articles";
import { mediaUrl } from "@/api/content";
import { hydrateGalleries , hydrateClickableImages} from "@/lib/hydrateGalleries";
import Spinner from "@/components/ui/Spinner";
import { formatDate } from "@/lib/utils";
import { openLightbox } from "@/components/Lightbox";

export default function ArticleDetail() {
  // ⚠️ সব hook সবসময় উপরে, কোনো early return-এর আগে — এটাই React-এর নিয়ম,
  // নাহলে loading অবস্থায় কম hook, loaded অবস্থায় বেশি hook চলে, React crash করে।
  const { id } = useParams();
  const articleId = Number(id);

  const { data: article, isLoading } = useQuery({
    queryKey: ["article", articleId],
    queryFn: () => articlesApi.detail(articleId),
  });
  const { data: related } = useQuery({
    queryKey: ["related", articleId],
    queryFn: () => articlesApi.related(articleId),
    enabled: !!article,
  });

  const bodyRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (bodyRef.current && article) {
      hydrateGalleries(bodyRef.current);
      hydrateClickableImages(bodyRef.current);
    }
  }, [article?.body]);

  // --- এখন থেকে conditional return, সব hook-এর পরে ---
  if (isLoading) return <Spinner />;
  if (!article) return <p className="mx-auto max-w-2xl px-4 py-10 text-center text-slate-500">আর্টিকেল পাওয়া যায়নি।</p>;

  const coverUrl = article.cover_media_id ? mediaUrl(article.cover_media_id) : null;

  return (
    <article className="mx-auto max-w-3xl px-4 py-6 sm:py-10 md:px-6">
      {/* --- Cover ছবি --- */}
      {coverUrl && (
        <figure className="mb-4 sm:mb-6">
          <img
            src={coverUrl}
            alt={article.title}
            onClick={() => openLightbox(coverUrl, article.cover_caption || undefined)}
            className="aspect-video w-full cursor-zoom-in rounded-xl object-cover shadow-sm sm:aspect-[16/8]"
          />
          {article.cover_caption && (
            <figcaption className="mt-2 text-center text-xs text-slate-500 sm:text-sm">{article.cover_caption}</figcaption>
          )}
        </figure>
      )}

      {/* --- Category + Title --- */}
      <div className="mx-auto max-w-2xl">
        {article.category_name && (
          <span className="badge mb-2 bg-brand-100 text-brand-700">📁 {article.category_name}</span>
        )}
        <h1 className="text-2xl font-bold leading-snug text-slate-900 sm:text-3xl">{article.title}</h1>

        {/* --- Byline --- */}
        <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-500">
          <span className="font-medium text-slate-700">✍️ {article.author_name}</span>
          {article.author_institution && <span>· {article.author_institution}</span>}
          {article.published_at && <span>· {formatDate(article.published_at)}</span>}
        </div>

        {/* --- Tags --- */}
        {article.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {article.tags.map((t) => (
              <span key={t} className="badge bg-slate-100 text-slate-600">#{t}</span>
            ))}
          </div>
        )}

        {/* --- মূল লেখা (rich text + hydrated slider) --- */}
        <div
          ref={bodyRef}
          className="rich-content mt-6 text-[15px] leading-7 text-slate-800 sm:text-base sm:leading-8"
          dangerouslySetInnerHTML={{ __html: article.body }}
        />
      </div>

      {/* --- আরও পড়ুন --- */}
      {related && related.length > 0 && (
        <div className="mx-auto mt-10 max-w-2xl border-t border-slate-200 pt-6 sm:mt-12">
          <h3 className="mb-4 text-base font-semibold text-brand-800 sm:text-lg">আরও পড়ুন</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {related.map((r) => {
              const rCover = r.cover_media_id ? mediaUrl(r.cover_media_id) : null;
              return (
                <Link key={r.id} to={`/articles/${r.id}`} className="card flex gap-3 overflow-hidden p-3 hover:shadow-md">
                  {rCover && <img src={rCover} alt="" className="h-16 w-16 shrink-0 rounded-lg object-cover" />}
                  <div className="min-w-0">
                    <p className="line-clamp-2 text-sm font-medium text-slate-800">{r.title}</p>
                    {r.published_at && <p className="mt-1 text-xs text-slate-400">{formatDate(r.published_at)}</p>}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </article>
  );
}
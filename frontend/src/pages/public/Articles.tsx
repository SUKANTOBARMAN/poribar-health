import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { articlesApi } from "@/api/articles";
import type { ArticleType } from "@/types";
import Spinner from "@/components/ui/Spinner";
import EmptyState from "@/components/ui/EmptyState";
import Select from "@/components/ui/Select";
import Pagination from "@/components/ui/Pagination";
import { formatDate } from "@/lib/utils";

const PAGE_SIZE = 10;

// এইচটিএমএল ট্যাগ রিমুভ করে প্লেন টেক্সট বা সংক্ষিপ্ত অংশ বের করার হেল্পার ফাংশন
const stripHtmlTags = (html: string) => {
  if (!html) return "";
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.body.textContent || "";
};

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
    <main className="min-h-screen bg-white pb-24 pt-12">
      <div className="mx-auto max-w-[720px] px-5 sm:px-6">
        
        {/* পেজ হেডার ও ফিল্টার সেকশন */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10 pb-6 border-b border-slate-100">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              সফলতার গল্প ও স্বাস্থ্য তথ্য
            </h1>
            <p className="text-sm text-slate-400 mt-1">প্রয়োজনীয় তথ্য, প্রতিবেদন ও জীবনমুখী অভিজ্ঞতা</p>
          </div>

          <div className="w-full sm:w-48">
            <Select value={type} onChange={(e) => handleTypeChange(e.target.value)}>
              <option value="">সব ধরন</option>
              <option value="success_story">সফলতার গল্প</option>
              <option value="health_info">স্বাস্থ্য তথ্য</option>
              <option value="area_report">এলাকার প্রতিবেদন</option>
            </Select>
          </div>
        </div>

        {/* লোডিং এবং এম্প্টি স্টেট */}
        {isLoading && (
          <div className="flex justify-center py-20">
            <Spinner />
          </div>
        )}

        {!isLoading && articles?.length === 0 && (
          <EmptyState message="কোনো আর্টিকেল পাওয়া যায়নি" />
        )}

        {/* প্রিমিয়াম আর্টিকেলের লিস্ট */}
        <div className="space-y-10">
          {articles?.map((a) => {
            // বডি থেকে এইচটিএমএল ট্যাগ সরিয়ে পরিষ্কার টেক্সট প্রিভিউ তৈরি করা
            const plainTextSnippet = stripHtmlTags(a.body);

            return (
              <article key={a.id} className="group border-b border-slate-100 pb-8 last:border-none">
                <Link to={`/articles/${a.id}`} className="block space-y-2.5">
                  
                  {/* ক্যাটাগরি বা টাইপ ব্যাজ (যদি থাকে) */}
                  {a.type && (
                    <span className="inline-block text-[11px] font-bold uppercase tracking-widest text-brand-700">
                      {a.type === "success_story" ? "সফলতার গল্প" : a.type === "health_info" ? "স্বাস্থ্য তথ্য" : "প্রতিবেদন"}
                    </span>
                  )}

                  {/* শিরোনাম */}
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 group-hover:text-brand-600 transition leading-snug">
                    {a.title}
                  </h2>

                  {/* পরিষ্কার টেক্সট স্নিপেট (বডির কোড ছাড়া) */}
                  <p className="text-slate-600 text-base leading-relaxed line-clamp-2 font-normal">
                    {plainTextSnippet}
                  </p>

                  {/* মেটা ইনফো (লেখক ও তারিখ) */}
                  <div className="flex items-center gap-2 pt-1 text-xs text-slate-400 font-medium">
                    <span className="text-slate-700 font-semibold">{a.author_name}</span>
                    {a.author_institution && <span>· {a.author_institution}</span>}
                    {a.published_at && <span>· {formatDate(a.published_at)}</span>}
                  </div>

                  {/* ট্যাগসমূহ */}
                  {a.tags && a.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {a.tags.map((t) => (
                        <span key={t} className="rounded bg-slate-50 px-2 py-0.5 text-[11px] text-slate-500">
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}

                </Link>
              </article>
            );
          })}
        </div>

        {/* পেজিনেশন */}
        {articles && articles.length > 0 && (
          <div className="mt-14 pt-6 border-t border-slate-100">
            <Pagination page={page} hasMore={articles.length === PAGE_SIZE} onPageChange={setPage} />
          </div>
        )}

      </div>
    </main>
  );
}
import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { articlesApi } from "@/api/articles";
import { contentApi } from "@/api/content";
import type { ArticleType } from "@/types";
import StatusBadge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Select from "@/components/ui/Select";
import Spinner from "@/components/ui/Spinner";
import EmptyState from "@/components/ui/EmptyState";
import RichTextEditor from "@/components/RichTextEditor";
import CategoryTree from "@/components/CategoryTree";

export default function MyArticles() {
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [type, setType] = useState<ArticleType>("success_story");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [mediaIds, setMediaIds] = useState<number[]>([]);
  const [tagsInput, setTagsInput] = useState("");

  const { data: categories } = useQuery({ queryKey: ["categories"], queryFn: contentApi.categories });
  const { data: articles, isLoading } = useQuery({ queryKey: ["my-articles"], queryFn: articlesApi.mine });

  console.log("Sukanto Barman",qc.getQueryData(["my-articles"]));

  const create = useMutation({
    mutationFn: () => articlesApi.create({ title, body, type, category_id: categoryId || undefined, media_ids: mediaIds, tags: tagsInput.split(",").map(t => t.trim()).filter(Boolean) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-articles"] });
      setTitle(""); setBody(""); setCategoryId(null); setMediaIds([]);
    },
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
          <input className="input" placeholder="শিরোনাম" value={title} onChange={(e) => setTitle(e.target.value)} required minLength={5} />
          <div className="grid grid-cols-2 gap-3">
            {categories && <CategoryTree categories={categories} value={categoryId} onChange={setCategoryId} />}
          </div>
          <RichTextEditor content={body} onChange={setBody} onImageUploaded={(id) => setMediaIds((prev) => [...prev, id])} />
          <input className="input" placeholder="ট্যাগ (কমা দিয়ে, যেমন: success, rangpur)" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} />
          <Button type="submit" loading={create.isPending} disabled={body.length < 20}>খসড়া হিসেবে সেভ করো</Button>
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
                {(a.status === "draft" ||  a.status === "pending" ||  a.status === "approved" || a.status === "rejected") && (
                <Link to={`/app/volunteer/articles/${a.id}/edit`} className="mr-3 text-xs text-brand-600 hover:underline">সম্পাদনা করো</Link>
               )}
              </div>
              {a.category_name && <p className="mt-1 text-xs text-brand-600">📁 {a.category_name}</p>}
              {a.review_note && <p className="mt-1 text-xs text-rust-600">রিভিউ নোট: {a.review_note}</p>}
              
              
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
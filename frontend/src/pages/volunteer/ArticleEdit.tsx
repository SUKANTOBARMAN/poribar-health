import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { articlesApi } from "@/api/articles";
import { contentApi } from "@/api/content";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Spinner from "@/components/ui/Spinner";
import RichTextEditor from "@/components/RichTextEditor";
import CategoryTree from "@/components/CategoryTree";
import AlbumManager from "@/components/AlbumManager";

export default function ArticleEdit() {
  const { id } = useParams();
  const articleId = Number(id);
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: articles, isLoading } = useQuery({ queryKey: ["my-articles"], queryFn: articlesApi.mine });
  const { data: categories } = useQuery({ queryKey: ["categories"], queryFn: contentApi.categories });
  const article = articles?.find((a) => a.id === articleId);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);

  useEffect(() => {
    if (article) {
      setTitle(article.title);
      setBody(article.body);
      setTagsInput(article.tags.join(", "));
      setCategoryId(article.category_id || null);
    }
  }, [article]);

  const save = useMutation({
    mutationFn: () =>
      articlesApi.update(articleId, {
        title, body,
        tags: tagsInput.split(",").map((t) => t.trim()).filter(Boolean),
        category_id: categoryId || undefined,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-articles"] }),
  });

  const submitForReview = useMutation({
    mutationFn: () => articlesApi.update(articleId, { title, body, submit_for_review: true }),
    onSuccess: () => navigate("/app/volunteer/articles"),
  });

  if (isLoading) return <Spinner />;
  if (!article) return <p className="text-sm text-slate-500">আর্টিকেল পাওয়া যায়নি।</p>;
  if (article.status !== "draft" && article.status !== "rejected" && article.status !=="pending" && article.status !== "approved") {
    return <p className="text-sm text-slate-500">শুধু draft অথবা rejected আর্টিকেলই সম্পাদনা করা যাবে।</p>;
  }

  return (
    <div className="max-w-2xl space-y-4">
      <button onClick={() => navigate("/app/volunteer/articles")} className="text-sm text-brand-600 hover:underline">← ফিরে যাও</button>
      <h1 className="text-xl font-bold text-brand-800">আর্টিকেল সম্পাদনা</h1>

      {article.review_note && (
        <Card className="border-rust-300 bg-rust-50">
          <p className="text-sm font-medium text-rust-700">Director-এর নোট:</p>
          <p className="mt-1 text-sm text-rust-600">{article.review_note}</p>
        </Card>
      )}

      <AlbumManager articleId={articleId} />

      <Card className="space-y-3">
        <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} required minLength={5} />
        {categories && <CategoryTree categories={categories} value={categoryId} onChange={setCategoryId} />}
        <input className="input" placeholder="ট্যাগ (কমা দিয়ে, যেমন: success, rangpur)" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} />
        <RichTextEditor content={body} onChange={setBody} />
        <div className="flex gap-3">
          <Button variant="secondary" loading={save.isPending} onClick={() => save.mutate()}>সেভ করো</Button>
          <Button loading={submitForReview.isPending} onClick={() => submitForReview.mutate()}>রিভিউর জন্য জমা দাও</Button>
        </div>
      </Card>
    </div>
  );
}
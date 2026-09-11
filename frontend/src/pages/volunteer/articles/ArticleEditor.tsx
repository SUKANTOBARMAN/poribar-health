import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { articlesApi } from "@/api/articles";
import { contentApi, mediaUrl } from "@/api/content";
import type { AlbumItemLocal } from "@/api/content";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Spinner from "@/components/ui/Spinner";
import RichTextEditor from "@/components/RichTextEditor";
import CategoryTree from "@/components/CategoryTree";
import AlbumManager from "@/components/AlbumManager";

export default function ArticleEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const isEditing = !!id;

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [album, setAlbum] = useState<AlbumItemLocal[]>([]);
  const [error, setError] = useState("");

  const { data: categories } = useQuery({ queryKey: ["categories"], queryFn: contentApi.categories });

  const { data: article, isLoading } = useQuery({
    queryKey: ["my-article", id],
    queryFn: () => articlesApi.myArticle(Number(id)),
    enabled: isEditing,
  });

  useEffect(() => {
    if (article) {
      setTitle(article.title);
      setBody(article.body);
      setTagsInput(article.tags.join(", "));
      setCategoryId(article.category_id ?? null);
      setAlbum(
        (article.album_items ?? []).map((a) => ({
          media_id: a.media_id,
          url: mediaUrl(a.media_id),
          caption: a.caption ?? "",
          is_cover: a.is_cover,
        }))
      );
    }
  }, [article]);

  
  const buildPayload = (submitForReview: boolean) => ({
    title, body, category_id: categoryId || undefined,
    tags: tagsInput.split(",").map((t) => t.trim()).filter(Boolean),
    album: album.map((a) => ({ media_id: a.media_id, caption: a.caption || undefined, is_cover: a.is_cover })),
    submit_for_review: submitForReview,
  });

  const createMutation = useMutation({
    mutationFn: (submitForReview: boolean) => articlesApi.create(buildPayload(submitForReview) as any),
    onSuccess: (created, submitForReview) => {
      setError("");
      qc.invalidateQueries({ queryKey: ["my-articles"] });
      navigate(submitForReview ? "/app/volunteer/articles" : `/app/volunteer/articles/${created.id}/edit`);
    },
    onError: (err: any) => setError(err?.response?.data?.detail || "সেভ করা যায়নি"),
  });

    const updateMutation = useMutation({
      mutationFn: (submitForReview: boolean) => articlesApi.update(Number(id), buildPayload(submitForReview)),
      onSuccess: (_updated, submitForReview) => {
        setError("");
        qc.invalidateQueries({ queryKey: ["my-article", id] });
        qc.invalidateQueries({ queryKey: ["my-articles"] });
        if (submitForReview) navigate("/app/volunteer/articles");
      },
      onError: (err: any) => {
        console.error("Save failed:", err?.response?.data);
        setError(err?.response?.data?.detail || "সেভ করা যায়নি — নেটওয়ার্ক সমস্যা হতে পারে");
      },
    });

  function handleSave(submitForReview: boolean) {
    if (isEditing) updateMutation.mutate(submitForReview);
    else createMutation.mutate(submitForReview);
  }

  if (isEditing && isLoading) return <Spinner />;
  

  const saving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="max-w-2xl space-y-4">
      <button onClick={() => navigate("/app/volunteer/articles")} className="text-sm text-brand-600 hover:underline">← ফিরে যাও</button>
      <h1 className="text-xl font-bold text-brand-800">{isEditing ? "আর্টিকেল সম্পাদনা" : "নতুন আর্টিকেল লিখুন"}</h1>

      {article?.review_note && (
        <Card className="border-rust-300 bg-rust-50">
          <p className="text-sm font-medium text-rust-700">Director-এর নোট:</p>
          <p className="mt-1 text-sm text-rust-600">{article.review_note}</p>
        </Card>
      )}

      <Card className="space-y-3">
        <input className="input text-lg font-medium" placeholder="শিরোনাম" value={title} onChange={(e) => setTitle(e.target.value)} required minLength={5} />
        {categories && <CategoryTree categories={categories} value={categoryId} onChange={setCategoryId} />}
        <input className="input" placeholder="ট্যাগ (কমা দিয়ে, যেমন: success, rangpur)" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} />
      </Card>

    

     <Card><RichTextEditor content={body} onChange={setBody} album={album} onAlbumChange={setAlbum} /></Card>

   {error && <p className="text-sm text-rust-600">{error}</p>}

      <div className="flex gap-3">
        <Button variant="secondary" loading={saving} onClick={() => handleSave(false)}>খসড়া হিসেবে সেভ করো</Button>
        <Button loading={saving} onClick={() => handleSave(true)}>রিভিউর জন্য জমা দাও</Button>
      </div>
    </div>
  );
}
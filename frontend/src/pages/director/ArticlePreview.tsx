import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { articlesApi } from "@/api/articles";
import { contentApi, mediaUrl } from "@/api/content";
import type { AlbumItemLocal } from "@/api/content";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import StatusBadge from "@/components/ui/Badge";
import Spinner from "@/components/ui/Spinner";
import RichTextEditor from "@/components/RichTextEditor";
import CategoryTree from "@/components/CategoryTree";

export default function DirectorArticlePreview() {
  const { id } = useParams();
  const articleId = Number(id);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [note, setNote] = useState("");
  const [editMode, setEditMode] = useState(false);

  const { data: article, isLoading } = useQuery({ queryKey: ["director-article", articleId], queryFn: () => articlesApi.directorDetail(articleId) });
  const { data: categories } = useQuery({ queryKey: ["categories"], queryFn: contentApi.categories });

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [tagsInput, setTagsInput] = useState("");
  const [album, setAlbum] = useState<AlbumItemLocal[]>([]);

  function enterEditMode() {
    if (!article) return;
    setTitle(article.title);
    setBody(article.body);
    setCategoryId(article.category_id ?? null);
    setTagsInput(article.tags.join(", "));
    setAlbum(
      (article.album_items ?? []).map((a) => ({
        media_id: a.media_id,
        url: mediaUrl(a.media_id),
        caption: a.caption ?? "",
        is_cover: a.is_cover,
      }))
    );
    setEditMode(true);
  }

  const saveEdit = useMutation({
    mutationFn: () =>
      articlesApi.directorUpdate(articleId, {
        title, body, category_id: categoryId || undefined,
        tags: tagsInput.split(",").map((t) => t.trim()).filter(Boolean),
        album: album.map((a) => ({ media_id: a.media_id, caption: a.caption || undefined, is_cover: a.is_cover })),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["director-article", articleId] });
      setEditMode(false);
    },
  });

  const approve = useMutation({
    mutationFn: () => articlesApi.approve(articleId, note || undefined),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["director-article", articleId] }); qc.invalidateQueries({ queryKey: ["director-articles"] }); },
  });
  const reject = useMutation({
    mutationFn: () => articlesApi.reject(articleId, note),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["director-article", articleId] }); qc.invalidateQueries({ queryKey: ["director-articles"] }); },
  });

  if (isLoading) return <Spinner />;
  if (!article) return null;

  if (editMode) {
    return (
      <div className="max-w-2xl space-y-4">
        <button onClick={() => setEditMode(false)} className="text-sm text-brand-600 hover:underline">← প্রিভিউতে ফিরে যাও</button>
        <h1 className="text-xl font-bold text-brand-800">আর্টিকেল সম্পাদনা (Director)</h1>
        <Card className="space-y-3">
          <input className="input text-lg font-medium" value={title} onChange={(e) => setTitle(e.target.value)} />
          {categories && <CategoryTree categories={categories} value={categoryId} onChange={setCategoryId} />}
          <input className="input" placeholder="ট্যাগ (কমা দিয়ে)" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} />
        </Card>
        <Card><RichTextEditor content={body} onChange={setBody} album={album} onAlbumChange={setAlbum} /></Card>
        <Button loading={saveEdit.isPending} onClick={() => saveEdit.mutate()}>পরিবর্তন সেভ করো</Button>
      </div>
    );
  }

  const coverUrl = article.cover_media_id ? mediaUrl(article.cover_media_id) : null;

  return (
    <div className="max-w-2xl">
      <button onClick={() => navigate(-1)} className="text-sm text-brand-600 hover:underline">← ফিরে যাও</button>
      <div className="mt-3 flex items-center justify-between">
        <h1 className="text-xl font-bold text-brand-800">প্রিভিউ</h1>
        <div className="flex items-center gap-3">
          <StatusBadge status={article.status} />
          <Button variant="secondary" onClick={enterEditMode}>✏️ সম্পাদনা করো</Button>
        </div>
      </div>

      {coverUrl && (
        <figure className="my-4">
          <img src={coverUrl} alt="" className="h-64 w-full rounded-xl object-cover" />
          {article.cover_caption && <figcaption className="mt-1 text-center text-xs text-slate-500">{article.cover_caption}</figcaption>}
        </figure>
      )}

      <h2 className="text-lg font-semibold">{article.title}</h2>
      <p className="mt-1 text-sm text-slate-500">✍️ {article.author_name} {article.author_institution && `· ${article.author_institution}`}</p>
      {article.category_name && <span className="badge mt-2 bg-slate-100 text-slate-600">📁 {article.category_name}</span>}

      <div className="rich-content mt-4" dangerouslySetInnerHTML={{ __html: article.body }} />

      {article.status === "pending" && (
        <Card className="mt-6">
          <textarea className="input" rows={2} placeholder="নোট (ঐচ্ছিক)" value={note} onChange={(e) => setNote(e.target.value)} />
          <div className="mt-3 flex gap-3">
            <Button loading={approve.isPending} onClick={() => approve.mutate()}>অনুমোদন</Button>
            <Button variant="danger" loading={reject.isPending} disabled={!note} onClick={() => reject.mutate()}>প্রত্যাখ্যান</Button>
          </div>
        </Card>
      )}
    </div>
  );
}
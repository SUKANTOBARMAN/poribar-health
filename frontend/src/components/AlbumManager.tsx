import { useState } from "react";
import { contentApi, mediaUrl } from "@/api/content";
import type { AlbumItemLocal } from "@/api/content";
import Card from "@/components/ui/Card";

interface Props {
  items: AlbumItemLocal[];
  onChange: (items: AlbumItemLocal[]) => void;
}

export default function AlbumManager({ items, onChange }: Props) {
  const [uploading, setUploading] = useState(false);

  async function handleMultiUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploading(true);
    try {
      const uploaded: AlbumItemLocal[] = [];
      for (const file of files) {
        const media = await contentApi.uploadMedia(file);
        uploaded.push({ media_id: media.id, url: mediaUrl(media.id), caption: "", is_cover: items.length === 0 && uploaded.length === 0 });
      }
      onChange([...items, ...uploaded]);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function updateItem(mediaId: number, patch: Partial<AlbumItemLocal>) {
    onChange(items.map((it) => (it.media_id === mediaId ? { ...it, ...patch } : it)));
  }

  function setCover(mediaId: number) {
    onChange(items.map((it) => ({ ...it, is_cover: it.media_id === mediaId })));
  }

  function removeItem(mediaId: number) {
    onChange(items.filter((it) => it.media_id !== mediaId));
  }

  return (
    <Card className="border-brand-300">
      <h2 className="mb-1 font-semibold text-brand-800">📸 ছবি (৪-৫টা একসাথে বেছে নিতে পারো)</h2>
      <p className="mb-3 text-xs text-slate-500">এখানে যা করবে (আপলোড, cover বাছা, মুছে ফেলা) — কিছুই DB-তে যাবে না, শুধু নিচের "সেভ করো" বাটন চাপলে তবেই সব একসাথে সেভ হবে।</p>

      <label className="btn btn-primary inline-block cursor-pointer">
        {uploading ? "আপলোড হচ্ছে..." : "+ ছবি যোগ করো (একাধিক বেছে নিতে পারবে)"}
        <input type="file" accept="image/jpeg,image/png" multiple onChange={handleMultiUpload} disabled={uploading} className="hidden" />
      </label>

      <div className="mt-4 grid grid-cols-3 gap-3">
        {items.map((img) => (
          <div key={img.media_id} className={`overflow-hidden rounded-lg border-2 ${img.is_cover ? "border-brand-500" : "border-slate-200"}`}>
            <img src={img.url} alt="" className="h-28 w-full object-cover" />
            <div className="p-2">
              <input
                className="w-full rounded border border-slate-200 px-1.5 py-1 text-xs"
                placeholder="ক্যাপশন..."
                value={img.caption}
                onChange={(e) => updateItem(img.media_id, { caption: e.target.value })}
              />
              <div className="mt-1.5 flex items-center justify-between">
                <button type="button" onClick={() => setCover(img.media_id)} className={`text-[11px] ${img.is_cover ? "font-medium text-brand-700" : "text-slate-400 hover:underline"}`}>
                  {img.is_cover ? "✓ কভার" : "কভার করো"}
                </button>
                <button type="button" onClick={() => removeItem(img.media_id)} className="text-[11px] text-rust-600 hover:underline">মুছো</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {items.length === 0 && <p className="mt-2 text-sm text-slate-400">এখনো কোনো ছবি যোগ করোনি</p>}
    </Card>
  );
}
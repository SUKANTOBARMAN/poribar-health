import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { contentApi, mediaUrl } from "@/api/content";
import Button from "@/components/ui/Button";

interface Props {
  onSelect: (mediaId: number, url: string) => void;
  trigger: React.ReactNode;
}

export default function MediaLibraryPicker({ onSelect, trigger }: Props) {
  const [open, setOpen] = useState(false);
  const { data: media } = useQuery({ queryKey: ["my-media"], queryFn: contentApi.myMedia, enabled: open });

  return (
    <>
      <span onClick={() => setOpen(true)}>{trigger}</span>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="font-semibold text-brand-800">আমার আপলোড করা ছবি (Album)</p>
              <button onClick={() => setOpen(false)} className="text-xl text-slate-400">✕</button>
            </div>
            {media?.length === 0 && <p className="text-sm text-slate-400">এখনো কোনো ছবি আপলোড করোনি — এডিটরে "🖼️ ছবি" বাটন দিয়ে আপলোড করো, তারপর এখানে দেখতে পাবে।</p>}
            <div className="grid grid-cols-4 gap-3">
              {media?.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => { onSelect(m.id, mediaUrl(m.id)); setOpen(false); }}
                  className="aspect-square overflow-hidden rounded-lg border border-slate-200 hover:border-brand-400"
                >
                  <img src={mediaUrl(m.id)} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
            <Button variant="secondary" className="mt-4" onClick={() => setOpen(false)}>বন্ধ করো</Button>
          </div>
        </div>
      )}
    </>
  );
}
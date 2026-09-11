import { useState } from "react";
import { mediaUrl } from "@/api/content";
import type { AlbumImageOut } from "@/api/content";

export default function ImageCarousel({ images }: { images: AlbumImageOut[] }) {
  const [index, setIndex] = useState(0);
  if (images.length === 0) return null;
  const current = images[index];

  return (
    <div className="my-4 overflow-hidden rounded-xl border border-slate-200">
      <div className="relative bg-black">
        <img src={mediaUrl(current.media_id)} alt="" className="mx-auto max-h-[400px] w-full object-contain" />
        {images.length > 1 && (
          <>
            <button
              onClick={() => setIndex((i) => (i === 0 ? images.length - 1 : i - 1))}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 px-3 py-2 text-white hover:bg-black/70"
            >
              ‹
            </button>
            <button
              onClick={() => setIndex((i) => (i === images.length - 1 ? 0 : i + 1))}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 px-3 py-2 text-white hover:bg-black/70"
            >
              ›
            </button>
            <div className="absolute bottom-2 right-2 rounded-full bg-black/50 px-2 py-0.5 text-xs text-white">
              {index + 1} / {images.length}
            </div>
          </>
        )}
      </div>
      {current.caption && <p className="bg-slate-50 px-3 py-2 text-center text-sm text-slate-600">{current.caption}</p>}
    </div>
  );
}
import { useEditor, EditorContent } from "@tiptap/react";
import { useEffect } from "react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import { useState } from "react";
import { contentApi, mediaUrl } from "@/api/content";
import type { AlbumItemLocal } from "@/api/content";
import { FigureImage } from "./FigureImage";
import { ImageGallery } from "./ImageGallery";

interface Props {
  content: string;
  onChange: (html: string) => void;
  album: AlbumItemLocal[];
  onAlbumChange: (items: AlbumItemLocal[]) => void;
}

function ToolbarBtn({ active, onClick, children, title }: { active?: boolean; onClick: () => void; children: React.ReactNode; title: string }) {
  return (
    <button type="button" title={title} onClick={onClick} className={`rounded px-2 py-1 text-sm ${active ? "bg-brand-200 text-brand-800" : "hover:bg-slate-200 text-slate-700"}`}>
      {children}
    </button>
  );
}

export default function RichTextEditor({ content, onChange, album, onAlbumChange }: Props) {
  const [uploading, setUploading] = useState(false);
  const [showAlbum, setShowAlbum] = useState(false);

  const editor = useEditor({
    extensions: [StarterKit, FigureImage, ImageGallery, Link.configure({ openOnClick: false }), Underline, TextAlign.configure({ types: ["heading", "paragraph"] }), Highlight],
    content,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: { attributes: { class: "rich-content min-h-[220px] p-3 focus:outline-none" } },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content]);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !editor) return;
    setUploading(true);
    try {
      const media = await contentApi.uploadMedia(file);
      editor.chain().focus().setFigureImage({ src: mediaUrl(media.id) }).run();
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleAlbumUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploading(true);
    try {
      const uploaded: AlbumItemLocal[] = [];
      for (const file of files) {
        const media = await contentApi.uploadMedia(file);
        uploaded.push({ media_id: media.id, url: mediaUrl(media.id), caption: "", is_cover: album.length === 0 && uploaded.length === 0 });
      }
      onAlbumChange([...album, ...uploaded]);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleGalleryUpload(e: React.ChangeEvent<HTMLInputElement>) {
      const files = Array.from(e.target.files || []);
      if (files.length === 0 || !editor) return;
      setUploading(true);
      try {
        const images = [];
        for (const file of files) {
          const media = await contentApi.uploadMedia(file);
          images.push({ src: mediaUrl(media.id), caption: "" });
        }
        editor.chain().focus().setImageGallery(images).run();
      } finally {
        setUploading(false);
        e.target.value = "";
      }
    }

  function insertIntoText(url: string) {
    editor?.chain().focus().setFigureImage({ src: url }).run();
  }
  function setCover(mediaId: number) {
    onAlbumChange(album.map((it) => ({ ...it, is_cover: it.media_id === mediaId })));
  }
  function removeFromAlbum(mediaId: number) {
    onAlbumChange(album.filter((it) => it.media_id !== mediaId));
  }

  if (!editor) return null;

  return (
    <div className="overflow-hidden rounded-lg border border-slate-300">
      <div className="flex flex-wrap items-center gap-0.5 border-b border-slate-200 bg-slate-50 p-2">
        <ToolbarBtn title="Undo" onClick={() => editor.chain().focus().undo().run()}>↶</ToolbarBtn>
        <ToolbarBtn title="Redo" onClick={() => editor.chain().focus().redo().run()}>↷</ToolbarBtn>
        <span className="mx-1 h-5 w-px bg-slate-300" />
        <ToolbarBtn title="H2" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2</ToolbarBtn>
        <ToolbarBtn title="H3" active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>H3</ToolbarBtn>
        <span className="mx-1 h-5 w-px bg-slate-300" />
        <ToolbarBtn title="Bullet" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>• তালিকা</ToolbarBtn>
        <ToolbarBtn title="Ordered" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>1. তালিকা</ToolbarBtn>
        <ToolbarBtn title="Blockquote" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>❝ কোট</ToolbarBtn>
        <ToolbarBtn title="Code" active={editor.isActive("codeBlock")} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>{"</>"}</ToolbarBtn>
        <span className="mx-1 h-5 w-px bg-slate-300" />
        <ToolbarBtn title="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}><b>B</b></ToolbarBtn>
        <ToolbarBtn title="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}><i>I</i></ToolbarBtn>
        <ToolbarBtn title="Strike" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}><s>S</s></ToolbarBtn>
        <ToolbarBtn title="Underline" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}><u>U</u></ToolbarBtn>
        <ToolbarBtn title="Highlight" active={editor.isActive("highlight")} onClick={() => editor.chain().focus().toggleHighlight().run()}>🖍️</ToolbarBtn>
        <span className="mx-1 h-5 w-px bg-slate-300" />
        <ToolbarBtn title="Left" active={editor.isActive({ textAlign: "left" })} onClick={() => editor.chain().focus().setTextAlign("left").run()}>⬅</ToolbarBtn>
        <ToolbarBtn title="Center" active={editor.isActive({ textAlign: "center" })} onClick={() => editor.chain().focus().setTextAlign("center").run()}>↔</ToolbarBtn>
        <ToolbarBtn title="Right" active={editor.isActive({ textAlign: "right" })} onClick={() => editor.chain().focus().setTextAlign("right").run()}>➡</ToolbarBtn>
        <span className="mx-1 h-5 w-px bg-slate-300" />
        <label className="cursor-pointer rounded px-2 py-1 text-sm hover:bg-slate-200">
          {uploading ? "..." : "🖼️ নতুন ছবি বসাও"}
          <input type="file" accept="image/jpeg,image/png" className="hidden" onChange={handleImageUpload} disabled={uploading} />
        </label>
        <label className="cursor-pointer rounded px-2 py-1 text-sm hover:bg-slate-200">
          {uploading ? "..." : "🎠 স্লাইডার যোগ করো"}
          <input type="file" accept="image/jpeg,image/png" multiple className="hidden" onChange={handleGalleryUpload} disabled={uploading} />
        </label>
        <ToolbarBtn title="আর্টিকেলের ছবি" active={showAlbum} onClick={() => setShowAlbum((s) => !s)}>📷 আমার ছবি ({album.length})</ToolbarBtn>
      </div>

      {showAlbum && (
        <div className="border-b border-slate-200 bg-slate-50 p-3">
          <p className="mb-2 text-xs text-slate-500">এই ছবিগুলো তোমার এই আর্টিকেলের জন্য — "বসাও" চাপলে cursor যেখানে আছে সেখানে বসবে। একটাকে "কভার" বানালে সেটা article-এর সবার উপরে দেখাবে (লেখার মধ্যে বসানো লাগবে না)।</p>
          <label className="btn btn-secondary mb-2 inline-block cursor-pointer text-xs">
            {uploading ? "..." : "+ নতুন ছবি যোগ করো"}
            <input type="file" accept="image/jpeg,image/png" multiple className="hidden" onChange={handleAlbumUpload} disabled={uploading} />
          </label>
          <div className="grid grid-cols-4 gap-2">
            {album.map((img) => (
              <div key={img.media_id} className={`overflow-hidden rounded-lg border-2 ${img.is_cover ? "border-brand-500" : "border-slate-200"} bg-white`}>
                <img src={img.url} alt="" className="h-20 w-full object-cover" />
                <input
                  className="mt-1 w-full rounded border border-slate-200 px-1 py-0.5 text-[11px]"
                  placeholder="ক্যাপশন..."
                  value={img.caption}
                  onChange={(e) => onAlbumChange(album.map((it) => it.media_id === img.media_id ? { ...it, caption: e.target.value } : it))}
                />
                <div className="space-y-1 p-1.5">
                  <button type="button" onClick={() => insertIntoText(img.url)} className="w-full rounded bg-brand-600 py-1 text-[11px] text-white hover:bg-brand-700">লেখায় বসাও</button>
                  <div className="flex items-center justify-between text-[10px]">
                    <button type="button" onClick={() => setCover(img.media_id)} className={img.is_cover ? "font-medium text-brand-700" : "text-slate-400 hover:underline"}>
                      {img.is_cover ? "✓ কভার" : "কভার করো"}
                    </button>
                    <button type="button" onClick={() => removeFromAlbum(img.media_id)} className="text-rust-600 hover:underline">মুছো</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {album.length === 0 && <p className="text-xs text-slate-400">এখনো কোনো ছবি নেই — উপরের বাটন দিয়ে যোগ করো</p>}
        </div>
      )}

      <EditorContent editor={editor} />
    </div>
  );
}
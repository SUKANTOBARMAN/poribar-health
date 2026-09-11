import { Node, mergeAttributes } from "@tiptap/core";
import { openLightbox } from "./Lightbox";

export interface GalleryImage {
  src: string;
  caption: string;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    imageGallery: {
      setImageGallery: (images: GalleryImage[]) => ReturnType;
    };
  }
}

export const ImageGallery = Node.create({
  name: "imageGallery",
  group: "block",
  atom: true,
  addAttributes() {
    return { images: { default: [] } };
  },
  parseHTML() {
    return [{ tag: 'div[data-type="image-gallery"]' }];
  },
  renderHTML({ node, HTMLAttributes }) {
    const images: GalleryImage[] = node.attrs.images || [];
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "image-gallery", "data-images": JSON.stringify(images), class: "poribar-gallery" })];
  },
  addNodeView() {
  return ({ node, editor, getPos }) => {
    let images: GalleryImage[] = JSON.parse(JSON.stringify(node.attrs.images || []));
    let idx = 0;

    const wrapper = document.createElement("div");
    wrapper.setAttribute("data-type", "image-gallery");
    wrapper.style.cssText = "position:relative;margin:12px 0;border-radius:8px;overflow:hidden;background:#111;";

    const imgWrap = document.createElement("div");
    imgWrap.style.cssText = "position:relative;";

    const img = document.createElement("img");
    img.style.cssText = "width:100%;max-height:350px;object-fit:contain;display:block;cursor:zoom-in;";
    img.onclick = () => openLightbox(img.src, images[idx]?.caption);

    const captionInput = document.createElement("input");
    captionInput.type = "text";
    captionInput.placeholder = "এই ছবির ক্যাপশন লেখো...";
    captionInput.style.cssText = "width:100%;box-sizing:border-box;background:#f8fafc;color:#334155;font-size:12px;text-align:center;padding:8px;border:none;outline:none;";

    const counter = document.createElement("span");
    counter.style.cssText = "position:absolute;bottom:6px;right:6px;background:rgba(0,0,0,0.6);color:#fff;font-size:11px;padding:1px 6px;border-radius:8px;";

    function persist() {
      if (typeof getPos === "function") {
        const pos = getPos();
        editor.view.dispatch(editor.view.state.tr.setNodeMarkup(pos, undefined, { ...node.attrs, images }));
      }
    }

    // ⚠️ আগে "function render() {}" ছিল, পরে "render = () => {}" দিয়ে reassign করতে গিয়ে
    // TypeScript error দিচ্ছিল। এখন শুরু থেকেই "let render" — একবার ঘোষণা, পরে বদলানো বৈধ।
    let render = () => {
      img.src = images[idx]?.src || "";
      captionInput.value = images[idx]?.caption || "";
    };

    captionInput.addEventListener("input", () => {
      images[idx] = { ...images[idx], caption: captionInput.value };
    });
    captionInput.addEventListener("blur", persist);

    imgWrap.appendChild(img);
    wrapper.appendChild(imgWrap);
    wrapper.appendChild(captionInput);

    if (images.length > 1) {
      const prev = document.createElement("button");
      prev.type = "button";
      prev.textContent = "‹";
      prev.style.cssText = "position:absolute;left:8px;top:35%;background:rgba(0,0,0,0.5);color:#fff;border:none;border-radius:50%;width:32px;height:32px;cursor:pointer;";
      prev.onclick = () => { idx = idx === 0 ? images.length - 1 : idx - 1; render(); };

      const next = document.createElement("button");
      next.type = "button";
      next.textContent = "›";
      next.style.cssText = "position:absolute;right:8px;top:35%;background:rgba(0,0,0,0.5);color:#fff;border:none;border-radius:50%;width:32px;height:32px;cursor:pointer;";
      next.onclick = () => { idx = idx === images.length - 1 ? 0 : idx + 1; render(); };

      imgWrap.appendChild(prev);
      imgWrap.appendChild(next);
      imgWrap.appendChild(counter);

      const baseRender = render;
      render = () => { baseRender(); counter.textContent = `${idx + 1}/${images.length}`; };
    }

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.textContent = "✕ পুরো স্লাইডার মুছো";
    removeBtn.style.cssText = "position:absolute;top:6px;right:6px;background:rgba(0,0,0,0.6);color:#fff;border:none;border-radius:4px;padding:2px 6px;font-size:11px;cursor:pointer;";
    removeBtn.onclick = () => {
      if (typeof getPos === "function") {
        const pos = getPos();
        editor.view.dispatch(editor.view.state.tr.delete(pos, pos + node.nodeSize));
      }
    };
    imgWrap.appendChild(removeBtn);

    render();
    return { dom: wrapper };
  };
},
  addCommands() {
    return {
      setImageGallery:
        (images: GalleryImage[]) =>
        ({ commands }: any) =>
          commands.insertContent({ type: this.name, attrs: { images } }),
    };
  },
});
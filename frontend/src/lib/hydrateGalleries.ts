import { openLightbox } from "@/components/Lightbox";

export function hydrateGalleries(container: HTMLElement) {
  const galleries = container.querySelectorAll<HTMLElement>('[data-type="image-gallery"]');
  galleries.forEach((el) => {
    if (el.dataset.hydrated) return;
    el.dataset.hydrated = "true";

    let images: { src: string; caption: string }[] = [];
    try {
      images = JSON.parse(el.getAttribute("data-images") || "[]");
    } catch {
      return;
    }
    if (images.length === 0) return;

    el.innerHTML = "";
    el.style.cssText = "position:relative;margin:12px 0;border-radius:8px;overflow:hidden;background:#000;";

    let idx = 0;
    const img = document.createElement("img");
    img.style.cssText = "width:100%;max-height:400px;object-fit:contain;display:block;";
    const caption = document.createElement("p");
    caption.style.cssText = "background:#f8fafc;color:#64748b;font-size:13px;text-align:center;padding:8px;margin:0;";

    function render() {
      img.src = images[idx].src;
      caption.textContent = images[idx].caption || "";
    }
    render();
    img.style.cursor = "zoom-in";
    img.onclick = () => openLightbox(images[idx].src, images[idx].caption);
    el.appendChild(img);
    el.appendChild(caption);

    if (images.length > 1) {
      const prev = document.createElement("button");
      prev.textContent = "‹";
      prev.style.cssText = "position:absolute;left:8px;top:40%;background:rgba(0,0,0,0.5);color:#fff;border:none;border-radius:50%;width:36px;height:36px;cursor:pointer;font-size:18px;";
      prev.onclick = () => { idx = idx === 0 ? images.length - 1 : idx - 1; render(); };

      const next = document.createElement("button");
      next.textContent = "›";
      next.style.cssText = "position:absolute;right:8px;top:40%;background:rgba(0,0,0,0.5);color:#fff;border:none;border-radius:50%;width:36px;height:36px;cursor:pointer;font-size:18px;";
      next.onclick = () => { idx = idx === images.length - 1 ? 0 : idx + 1; render(); };

      el.appendChild(prev);
      el.appendChild(next);
    }
  });
}

export function hydrateClickableImages(container: HTMLElement) {
  // FigureImage (single insert) আর সাধারণ <img> সবগুলোতে ক্লিক-টু-জুম লাগায়
  const images = container.querySelectorAll<HTMLImageElement>("figure[data-type='figure-image'] img, .rich-content > img");
  images.forEach((img) => {
    if (img.dataset.lightboxBound) return;
    img.dataset.lightboxBound = "true";
    img.style.cursor = "zoom-in";
    img.addEventListener("click", () => {
      const figcaption = img.closest("figure")?.querySelector("figcaption");
      openLightbox(img.src, figcaption?.textContent || undefined);
    });
  });
}
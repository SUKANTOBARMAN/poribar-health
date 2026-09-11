import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

interface LightboxState {
  src: string;
  caption?: string;
}

let openLightboxFn: ((state: LightboxState) => void) | null = null;

export function openLightbox(src: string, caption?: string) {
  openLightboxFn?.({ src, caption });
}

export default function LightboxProvider() {
  const [state, setState] = useState<LightboxState | null>(null);

  useEffect(() => {
    openLightboxFn = setState;
    return () => { openLightboxFn = null; };
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setState(null);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  if (!state) return null;

  return createPortal(
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/90 p-4" onClick={() => setState(null)}>
      <button className="absolute right-4 top-4 text-3xl text-white/80 hover:text-white" onClick={() => setState(null)}>✕</button>
      <div className="max-h-full max-w-full" onClick={(e) => e.stopPropagation()}>
        <img src={state.src} alt="" className="max-h-[85vh] max-w-full rounded object-contain" />
        {state.caption && <p className="mt-3 text-center text-sm text-white/80">{state.caption}</p>}
      </div>
    </div>,
    document.body
  );
}
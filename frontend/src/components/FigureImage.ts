import { Node, mergeAttributes } from "@tiptap/core";

export interface FigureImageOptions {
  HTMLAttributes: Record<string, any>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    figureImage: {
      setFigureImage: (attrs: { src: string; width?: string }) => ReturnType;
    };
  }
}

export const FigureImage = Node.create<FigureImageOptions>({
  name: "figureImage",
  group: "block",
  content: "inline*",
  isolating: true,

  addOptions() {
    return { HTMLAttributes: {} };
  },

  addAttributes() {
    return {
      src: { default: null },
      width: { default: "100%" },
    };
  },

  parseHTML() {
    return [{ tag: 'figure[data-type="figure-image"]' }];
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      "figure",
      mergeAttributes(HTMLAttributes, { "data-type": "figure-image" }),
      ["img", { src: node.attrs.src, style: `width:${node.attrs.width}; display:block; border-radius:8px;` }],
      ["figcaption", { style: "font-size:13px; color:#64748b; text-align:center; margin-top:6px;" }, 0],
    ];
  },

  addNodeView() {
    return ({ node, getPos, editor }) => {
      const figure = document.createElement("figure");
      figure.setAttribute("data-type", "figure-image");
      figure.style.cssText = "position:relative; margin:12px 0;";

      const img = document.createElement("img");
      img.src = node.attrs.src;
      img.style.cssText = `width:${node.attrs.width}; display:block; border-radius:8px;`;

      const handle = document.createElement("div");
      handle.style.cssText =
        "position:absolute; right:6px; bottom:34px; width:14px; height:14px; background:#2c5f2d; border-radius:3px; cursor:nwse-resize; z-index:10;";

      let startX = 0;
      let startWidthPx = 0;

      handle.addEventListener("mousedown", (e) => {
        e.preventDefault();
        startX = e.clientX;
        startWidthPx = img.offsetWidth;

        const onMove = (moveEvent: MouseEvent) => {
          const delta = moveEvent.clientX - startX;
          const parentWidth = figure.parentElement?.offsetWidth || 600;
          const newWidthPx = Math.max(80, startWidthPx + delta);
          const pct = Math.min(100, Math.max(15, (newWidthPx / parentWidth) * 100));
          img.style.width = pct.toFixed(0) + "%";
        };

        const onUp = () => {
          document.removeEventListener("mousemove", onMove);
          document.removeEventListener("mouseup", onUp);

          if (typeof getPos === "function") {
            const pos = getPos();
            if (pos !== undefined && !isNaN(pos) && pos >= 0) {
              const transaction = editor.view.state.tr.setNodeMarkup(pos, undefined, {
                ...node.attrs,
                width: img.style.width,
              });
              editor.view.dispatch(transaction);
            }
          }
        };

        document.addEventListener("mousemove", onMove);
        document.addEventListener("mouseup", onUp);
      });

      const caption = document.createElement("figcaption");
      caption.style.cssText = "font-size:13px; color:#64748b; text-align:center; margin-top:6px; outline:none; min-height:18px;";
      caption.setAttribute("data-placeholder", "ছবির ক্যাপশন লেখো...");

      figure.appendChild(img);
      figure.appendChild(handle);
      figure.appendChild(caption);

      return {
        dom: figure,
        contentDOM: caption,
      };
    };
  },

  addCommands() {
    return {
      setFigureImage:
        (attrs: { src: string; width?: string }) =>
        ({ commands }: any) => {
          return commands.insertContent({
            type: this.name,
            attrs: { width: "100%", ...attrs },
          });
        },
    };
  },
});
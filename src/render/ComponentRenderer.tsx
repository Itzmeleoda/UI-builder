import { useEffect, useState } from "react";
import { cn } from "../utils/cn";
import type { ComponentSpec } from "../types";
import { sanitizeHtml } from "../utils/sanitize";
import { Search, ChevronDown } from "lucide-react";

function shadowFor(v: string) {
  return (
    { none: "none", sm: "0 1px 2px rgba(0,0,0,.06)", md: "0 4px 10px rgba(0,0,0,.08)", lg: "0 10px 25px rgba(0,0,0,.12)", xl: "0 20px 40px rgba(0,0,0,.16)" }[v] ??
    "0 4px 10px rgba(0,0,0,.08)"
  );
}

export function ComponentRenderer({ spec }: { spec: ComponentSpec }) {
  if (spec.customCode && spec.type !== "rawBlock") {
    const { safe, warnings } = sanitizeHtml(spec.customCode);
    return (
      <div className="w-full h-full flex flex-col">
        <div className="flex-1 min-h-0">
          <RenderBody spec={spec} />
        </div>
        <div className="flex-shrink-0 border-t border-dashed border-indigo-200 bg-indigo-50/60 px-2 py-1">
          <div className="text-[9px] uppercase tracking-wide text-indigo-400 font-semibold">Custom code slot</div>
          <div className="text-[11px]" dangerouslySetInnerHTML={{ __html: safe }} />
          {warnings.length > 0 && <div className="text-[9px] text-amber-600">{warnings.join("; ")}</div>}
        </div>
      </div>
    );
  }
  return <RenderBody spec={spec} />;
}

function RenderBody({ spec }: { spec: ComponentSpec }) {
  const p = spec.params as any;
  const wrapperClass = cn("w-full h-full", spec.customClassName);

  switch (spec.type) {
    case "container":
      return (
        <div
          className={wrapperClass}
          style={{
            display: "flex",
            flexDirection: p.direction,
            gap: p.gap,
            padding: p.padding,
            alignItems: p.align,
            justifyContent: p.justify === "between" ? "space-between" : p.justify === "around" ? "space-around" : p.justify,
            background: p.background,
            borderRadius: p.borderRadius,
            border: "1px dashed #cbd5e1",
          }}
        >
          <span className="text-xs text-slate-400 m-auto">Container — drop area</span>
        </div>
      );

    case "tabs": {
      const [active, setActive] = useState(p.activeIndex ?? 0);
      const tabs: string[] = p.tabs ?? [];
      return (
        <div className={wrapperClass}>
          <div className={cn("flex border-b border-gray-200", p.orientation === "vertical" && "flex-col")}>
            {tabs.map((t, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className="px-3 py-2 text-sm font-medium border-b-2"
                style={{
                  color: i === active ? p.activeTextColor : p.inactiveTextColor,
                  borderBottomColor: i === active ? p.indicatorColor : "transparent",
                  transitionProperty: "all",
                  transitionDuration: `${p.durationMs}ms`,
                  transitionTimingFunction: p.easing,
                }}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="p-3 text-sm text-slate-500">Content for “{tabs[active]}”</div>
        </div>
      );
    }

    case "card": {
      const [hovered, setHovered] = useState(false);
      return (
        <div
          className={cn("relative overflow-hidden", wrapperClass)}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            background: p.background,
            borderRadius: p.borderRadius,
            boxShadow: shadowFor(p.shadow),
            transform: hovered ? p.transform : "none",
            transitionProperty: "transform",
            transitionDuration: `${p.durationMs}ms`,
            transitionTimingFunction: p.easing,
          }}
        >
          {p.imageUrl && <img src={p.imageUrl} alt={p.title} className="w-full h-1/2 object-cover" />}
          <div className="p-3">
            <h3 className="font-semibold text-slate-900 text-sm">{p.title}</h3>
            <p className="text-xs text-slate-500 mt-1 line-clamp-2">{p.body}</p>
          </div>
          {p.hoverReveal && (
            <div
              className="absolute inset-0 flex items-center justify-center text-sm font-medium"
              style={{
                background: p.revealBackground,
                color: p.revealTextColor,
                opacity: hovered ? 1 : 0,
                transitionProperty: "opacity",
                transitionDuration: `${p.durationMs}ms`,
                transitionTimingFunction: p.easing,
              }}
            >
              {p.revealContent}
            </div>
          )}
        </div>
      );
    }

    case "imageHover": {
      const [hovered, setHovered] = useState(false);
      return (
        <div
          className={cn("relative overflow-hidden", wrapperClass)}
          style={{ borderRadius: p.borderRadius }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          {p.imageUrl ? (
            <img
              src={p.imageUrl}
              alt={p.caption}
              className="w-full h-full"
              style={{
                objectFit: p.objectFit,
                transform: hovered ? `scale(${p.zoomScale})` : "scale(1)",
                transitionProperty: "transform",
                transitionDuration: `${p.durationMs}ms`,
                transitionTimingFunction: p.easing,
              }}
            />
          ) : (
            <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400 text-xs">No image</div>
          )}
          <div
            className="absolute inset-0 flex items-end p-3 text-sm"
            style={{
              background: p.overlayColor,
              color: p.captionColor,
              opacity: hovered ? 1 : 0,
              transitionProperty: "opacity",
              transitionDuration: `${p.durationMs}ms`,
              transitionTimingFunction: p.easing,
            }}
          >
            {p.caption}
          </div>
        </div>
      );
    }

    case "carousel": {
      const slides: string[] = p.slides ?? [];
      const [index, setIndex] = useState(0);
      useEffect(() => {
        if (!p.autoplay || slides.length === 0) return;
        const id = setInterval(() => setIndex((i) => (p.loop ? (i + 1) % slides.length : Math.min(i + 1, slides.length - 1))), p.intervalMs);
        return () => clearInterval(id);
      }, [p.autoplay, p.intervalMs, p.loop, slides.length]);
      return (
        <div className={cn("relative overflow-hidden rounded-xl bg-slate-100", wrapperClass)}>
          <div
            className="flex h-full"
            style={{
              transform: `translateX(-${index * 100}%)`,
              transitionProperty: "transform",
              transitionDuration: `${p.durationMs}ms`,
              transitionTimingFunction: p.easing,
            }}
          >
            {slides.map((s, i) => (
              <div key={i} className="w-full h-full flex-shrink-0 flex items-center justify-center font-medium text-slate-700">
                {s}
              </div>
            ))}
          </div>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: i === index ? p.dotColor : "#d1d5db" }}
              />
            ))}
          </div>
        </div>
      );
    }

    case "searchBar":
      return (
        <div className={cn("flex items-center", wrapperClass)} style={{ background: p.background, borderRadius: p.rounded, padding: "6px 12px" }}>
          {p.showIcon && <Search className="w-4 h-4 mr-2 opacity-50" />}
          <input readOnly placeholder={p.placeholder} className="bg-transparent outline-none text-sm w-full" style={{ color: p.textColor }} />
        </div>
      );

    case "table": {
      const cols: string[] = p.columns ?? [];
      const rows: string[][] = p.rows ?? [];
      return (
        <div className={cn("overflow-auto", wrapperClass)}>
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr style={{ background: p.headerBackground, color: p.headerTextColor }}>
                {cols.map((c, i) => (
                  <th key={i} className="text-left px-2 py-1.5 font-medium">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri} style={{ background: p.striped && ri % 2 === 1 ? "#f9fafb" : "transparent" }}>
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-2 py-1.5 border-b" style={{ borderColor: p.borderColor }}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    case "button": {
      const [hovered, setHovered] = useState(false);
      const solid = p.variant === "solid";
      return (
        <div className="w-full h-full flex items-center">
          <button
            className={cn("text-sm font-medium", spec.customClassName)}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
              background: solid ? (hovered ? p.hoverBackground : p.background) : "transparent",
              color: solid ? p.textColor : p.background,
              border: p.variant === "outline" ? `2px solid ${p.background}` : "none",
              borderRadius: p.borderRadius,
              padding: `${p.paddingY}px ${p.paddingX}px`,
              transform: hovered ? p.transform : "none",
              transitionProperty: "all",
              transitionDuration: `${p.durationMs}ms`,
              transitionTimingFunction: p.easing,
            }}
          >
            {p.label}
          </button>
        </div>
      );
    }

    case "modal":
      return (
        <div className={cn("flex items-center justify-center h-full rounded-xl", wrapperClass)} style={{ background: "#eef2ff" }}>
          <div className="p-4 w-4/5 text-center" style={{ background: p.panelBackground, borderRadius: p.borderRadius, boxShadow: "0 10px 25px rgba(0,0,0,.12)" }}>
            <h3 className="font-semibold text-sm">{p.title}</h3>
            <p className="text-xs text-slate-500 mt-1">{p.body}</p>
            <p className="text-[10px] text-slate-400 mt-2">(modal preview — opens on “{p.trigger}” in generated app)</p>
          </div>
        </div>
      );

    case "accordion": {
      const items: { title: string; body: string }[] = p.items ?? [];
      const [open, setOpen] = useState<number>(0);
      return (
        <div className={cn("divide-y overflow-auto", wrapperClass)} style={{ borderColor: p.dividerColor }}>
          {items.map((it, i) => (
            <div key={i}>
              <button
                className="w-full flex justify-between items-center py-2 text-sm font-medium text-left"
                style={{ color: p.headerTextColor }}
                onClick={() => setOpen(open === i ? -1 : i)}
              >
                {it.title}
                <ChevronDown
                  className="w-4 h-4"
                  style={{
                    transform: open === i ? "rotate(180deg)" : "rotate(0)",
                    transitionProperty: "transform",
                    transitionDuration: `${p.durationMs}ms`,
                    transitionTimingFunction: p.easing,
                  }}
                />
              </button>
              <div style={{ maxHeight: open === i ? 100 : 0, overflow: "hidden", transitionProperty: "max-height", transitionDuration: `${p.durationMs}ms`, transitionTimingFunction: p.easing }}>
                <p className="pb-2 text-xs text-slate-500">{it.body}</p>
              </div>
            </div>
          ))}
        </div>
      );
    }

    case "stickyHeader":
      return (
        <div className={cn("flex items-center justify-between px-4 rounded-lg", wrapperClass)} style={{ background: p.background, boxShadow: "0 1px 3px rgba(0,0,0,.08)" }}>
          <span className="font-bold text-sm">{p.logoText}</span>
          <nav className="flex gap-4 text-xs text-slate-600">
            {(p.links ?? []).map((l: string, i: number) => (
              <span key={i}>{l}</span>
            ))}
          </nav>
        </div>
      );

    case "pageTransition":
      return (
        <div className={cn("flex items-center justify-center rounded-xl border-2 border-dashed border-indigo-200 bg-indigo-50/50", wrapperClass)}>
          <span className="text-xs text-indigo-400 text-center px-4">
            Page transition wrapper — “{p.transitionStyle}”, {p.durationMs}ms {p.easing}
          </span>
        </div>
      );

    case "rawBlock": {
      const { safe, warnings } = sanitizeHtml(String(p.html ?? ""));
      return (
        <div className={cn("h-full overflow-auto rounded-lg border border-amber-300 bg-amber-50 p-2", wrapperClass)}>
          <div className="text-[10px] uppercase tracking-wide text-amber-700 font-semibold mb-1">Raw block (unmatched import)</div>
          <div className="text-xs text-slate-700" dangerouslySetInnerHTML={{ __html: safe }} />
          {warnings.length > 0 && <div className="text-[10px] text-amber-600 mt-1">{warnings.join("; ")}</div>}
        </div>
      );
    }

    default:
      return <div className="p-2 text-xs text-red-500">Unknown type: {spec.type}</div>;
  }
}

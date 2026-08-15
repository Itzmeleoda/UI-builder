import { useEffect, useRef, useState } from "react";
import { cn } from "../utils/cn";
import type { ComponentSpec } from "../types";
import { sanitizeHtml } from "../utils/sanitize";
import { PICKER_ICONS } from "../data/iconMap";
import {
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Star,
  Heart,
  ThumbsUp,
  Quote as QuoteIcon,
  X,
  Play,
  Pause,
  Check,
  Info,
  CircleAlert,
  CircleCheck,
  TriangleAlert,
  Plus,
  Copy,
} from "lucide-react";

function shadowFor(v: unknown) {
  return (
    { none: "none", sm: "0 1px 2px rgba(0,0,0,.06)", md: "0 4px 10px rgba(0,0,0,.08)", lg: "0 10px 25px rgba(0,0,0,.12)", xl: "0 20px 40px rgba(0,0,0,.16)" }[String(v)] ??
    "0 4px 10px rgba(0,0,0,.08)"
  );
}

const FONT_SIZE_PX: Record<string, number> = { sm: 12, md: 14, lg: 17 };

function fs(v: unknown) {
  return FONT_SIZE_PX[String(v)] ?? 14;
}

function alignTo(v: unknown) {
  return String(v ?? "left") === "center" ? "center" : String(v) === "right" ? "right" : "left";
}

function IconOrFallback({ name, size = 16, ...rest }: { name?: string; size?: number } & Record<string, unknown>) {
  const Icon = PICKER_ICONS[String(name ?? "")] ?? Star;
  return <Icon size={size} {...(rest as object)} />;
}

function ratingIcon(name: string) {
  return name === "heart" ? Heart : name === "thumbs-up" ? ThumbsUp : Star;
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
    // ───────────────────────────── LAYOUT ─────────────────────────────
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
            border: p.borderStyle && p.borderStyle !== "none" ? `${p.borderWidth ?? 1}px ${p.borderStyle} ${p.borderColor}` : "none",
            boxShadow: shadowFor(p.shadow),
            maxWidth: p.maxWidth,
          }}
        >
          <span className="text-xs text-slate-400 m-auto">Container — drop area</span>
        </div>
      );

    case "navbar": {
      const dark = p.variant === "dark";
      return (
        <div
          className={cn("flex items-center justify-between px-5 h-full", wrapperClass)}
          style={{
            background: p.variant === "glass" ? "rgba(255,255,255,.65)" : p.background,
            backdropFilter: p.variant === "glass" ? "blur(10px)" : undefined,
            color: p.textColor,
            boxShadow: shadowFor(p.shadow),
            fontFamily: p.textFont,
            position: p.sticky ? "sticky" : undefined,
            top: 0,
            zIndex: 30,
          }}
        >
          <span className="font-bold text-base" style={{ color: dark ? p.textColor : "#111827" }}>
            {p.logoText}
          </span>
          <nav className="flex items-center gap-5 text-[13px]" style={{ color: p.textColor }}>
            {(p.links ?? []).map((l: string, i: number) => (
              <span key={i} className="cursor-pointer hover:underline" style={{ ["--hover" as string]: p.accentColor }}>
                {l}
              </span>
            ))}
          </nav>
          {p.ctaLabel && (
            <span className="px-3.5 py-1.5 rounded-lg text-[12px] font-medium" style={{ background: p.ctaBackground, color: p.ctaTextColor }}>
              {p.ctaLabel}
            </span>
          )}
        </div>
      );
    }

    case "footer": {
      const cols = (p.columns ?? []) as string[];
      const parsed = cols.map((line) => {
        const [title, links] = line.split("::");
        return { title: title?.trim() ?? "", links: (links ?? "").split(",").map((l) => l.trim()).filter(Boolean) };
      });
      return (
        <div className={cn("px-6 py-4 flex flex-col h-full overflow-auto", wrapperClass)} style={{ background: p.background, fontFamily: p.textFont, borderTop: `1px solid ${p.borderColor}` }}>
          <div className="flex gap-8 flex-1 min-h-0">
            <div className="flex-shrink-0 max-w-[180px]">
              <div className="font-bold" style={{ color: p.textColor }}>{p.brandName}</div>
              <p className="text-[11px] mt-1" style={{ color: p.mutedColor }}>{p.tagline}</p>
              {p.showSocial && (
                <div className="flex gap-1.5 mt-2">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="w-6 h-6 flex items-center justify-center text-[10px]" style={{ background: p.socialStyle === "minimal" ? "transparent" : p.accentColor, borderRadius: p.socialStyle === "square" ? 4 : 999, color: p.textColor, opacity: p.socialStyle === "minimal" ? 0.8 : 0.95 }}>
                      {["𝕏", "in", "gh"][i]}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-8 flex-1 flex-wrap">
              {parsed.map((col, i) => (
                <div key={i} className="min-w-[90px]">
                  <div className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: p.accentColor }}>{col.title}</div>
                  <div className="mt-1.5 space-y-1">
                    {col.links.map((l, j) => (
                      <div key={j} className="text-[11px] cursor-pointer hover:underline" style={{ color: p.mutedColor }}>{l}</div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="text-[10px] pt-2 mt-2" style={{ color: p.mutedColor, borderTop: `1px solid ${p.borderColor}` }}>
            © 2026 {p.brandName}. All rights reserved.
          </div>
        </div>
      );
    }

    case "hero": {
      const centered = p.layout === "center";
      const imageBg = p.layout === "image";
      const textAlign = alignTo(p.align);
      const textBlock = (
        <div className={cn("flex flex-col gap-3", centered && "items-center text-center", textAlign === "right" && "items-end text-right", textAlign === "left" && "items-start text-left")}>
          <h2 className="text-2xl font-extrabold leading-tight" style={{ color: p.textColor, fontFamily: p.textFont }}>{p.headline}</h2>
          <p className="text-[13px] max-w-md" style={{ color: p.mutedColor, fontFamily: p.textFont }}>{p.subheadline}</p>
          <div className="flex gap-2 mt-1 flex-wrap">
            <span className="px-4 py-2 rounded-lg text-[13px] font-semibold" style={{ background: p.accentColor, color: p.accentTextColor }}>{p.ctaPrimary}</span>
            {p.ctaSecondary && (
              <span className="px-4 py-2 rounded-lg text-[13px] font-semibold border" style={{ color: p.textColor, borderColor: p.textColor + "44" }}>{p.ctaSecondary}</span>
            )}
          </div>
        </div>
      );
      return (
        <div
          className={cn("relative overflow-hidden", wrapperClass)}
          style={{
            background: imageBg && p.imageUrl ? undefined : p.background,
            borderRadius: p.borderRadius,
            display: "flex",
            alignItems: "center",
            justifyContent: centered ? "center" : "space-between",
            padding: 28,
            gap: 24,
          }}
        >
          {imageBg && p.imageUrl && <img src={p.imageUrl} className="absolute inset-0 w-full h-full object-cover" alt="" />}
          {imageBg && <div className="absolute inset-0" style={{ background: "rgba(0,0,0,.45)" }} />}
          <div className={cn("relative z-10 flex", centered ? "flex-col items-center" : "flex-row items-center justify-between w-full", imageBg && "text-white")}>
            {textBlock}
            {p.layout !== "center" && p.imageUrl && (
              <img src={p.imageUrl} alt="" className="w-2/5 h-[85%] object-cover rounded-xl shadow-lg flex-shrink-0" />
            )}
          </div>
        </div>
      );
    }

    case "divider": {
      const lineStyle = p.style === "gradient" ? "solid" : p.style;
      const label = p.label ? (
        <span className="px-3 text-[11px] whitespace-nowrap" style={{ color: p.textColor, fontFamily: p.textFont }}>{p.label}</span>
      ) : null;
      return (
        <div className={cn("flex items-center h-full", wrapperClass)}>
          {p.labelPosition === "right" && <div className="flex-1" style={{ borderTop: `${p.thickness}px ${lineStyle} ${p.color}` }} />}
          {p.labelPosition !== "right" && p.labelPosition !== "center" && label}
          <div className="flex-1" style={{ borderTop: `${p.thickness}px ${lineStyle} ${p.color}`, ...(p.style === "gradient" ? { borderImage: "linear-gradient(90deg, transparent, #6366f1, #a855f7, transparent) 1" } : {}) }} />
          {p.labelPosition === "center" && label}
          {p.labelPosition === "center" && <div className="flex-1" style={{ borderTop: `${p.thickness}px ${lineStyle} ${p.color}`, ...(p.style === "gradient" ? { borderImage: "linear-gradient(90deg, transparent, #a855f7, #6366f1, transparent) 1" } : {}) }} />}
          {p.labelPosition === "right" && label}
        </div>
      );
    }

    case "stickyHeader":
      return (
        <div className={cn("flex items-center justify-between px-4 h-full rounded-lg", wrapperClass)} style={{ background: p.background, boxShadow: "0 1px 3px rgba(0,0,0,.08)", fontFamily: p.textFont }}>
          <span className="font-bold text-sm" style={{ color: p.textColor }}>{p.logoText}</span>
          <nav className="flex gap-4 text-xs">
            {(p.links ?? []).map((l: string, i: number) => (
              <span key={i} className="cursor-pointer" style={{ color: p.linkColor }}>{l}</span>
            ))}
          </nav>
          {p.ctaLabel && <span className="text-xs px-3 py-1 rounded-md" style={{ background: p.ctaBackground, color: p.ctaTextColor }}>{p.ctaLabel}</span>}
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

    // ─────────────────────────── INTERACTION ───────────────────────────
    case "tabs": {
      return <TabsRenderer p={p} wrapperClass={wrapperClass} />;
    }

    case "carousel": {
      return <CarouselRenderer p={p} wrapperClass={wrapperClass} />;
    }

    case "searchBar": {
      const padY = { sm: 5, md: 8, lg: 12 }[String(p.size)] ?? 8;
      return (
        <div
          className={cn("flex items-center", wrapperClass)}
          style={{ background: p.background, borderRadius: p.rounded, padding: `${padY}px 12px`, border: `1px solid ${p.borderColor}`, fontFamily: p.textFont }}
        >
          {p.showIcon && <Search size={fs(p.size)} className="mr-2 opacity-50" style={{ color: p.textColor }} />}
          <input readOnly placeholder={p.placeholder} className="bg-transparent outline-none w-full" style={{ color: p.textColor, fontSize: fs(p.size) }} />
        </div>
      );
    }

    case "table": {
      const cols: string[] = p.columns ?? [];
      const rows: string[][] = p.rows ?? [];
      return (
        <div className={cn("overflow-auto", wrapperClass)}>
          <table className="w-full border-collapse" style={{ fontSize: fs(p.fontSize), fontFamily: p.textFont }}>
            <thead>
              <tr style={{ background: p.headerBackground, color: p.headerTextColor, position: p.stickyHeader ? "sticky" : undefined, top: 0 }}>
                {cols.map((c, i) => (
                  <th key={i} className="font-medium px-2" style={{ padding: `${p.cellPadding}px 8px`, textAlign: alignTo(p.headerAlign) }}>
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri} style={{ background: p.striped && ri % 2 === 1 ? "#f9fafb" : "transparent" }}>
                  {row.map((cell, ci) => (
                    <td key={ci} className="border-b" style={{ padding: `${p.cellPadding}px 8px`, borderColor: p.borderColor }}>
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
      return <ButtonRenderer p={p} wrapperClass={wrapperClass} />;
    }

    case "modal":
      return (
        <div className={cn("flex items-center justify-center h-full rounded-xl", wrapperClass)} style={{ background: "#eef2ff" }}>
          <div className="p-4 text-center" style={{ background: p.panelBackground, borderRadius: p.borderRadius, boxShadow: "0 10px 25px rgba(0,0,0,.12)", width: p.size === "sm" ? "55%" : p.size === "lg" ? "90%" : "75%", fontFamily: p.textFont }}>
            {p.showCloseButton && (
              <div className="flex justify-end">
                <X size={14} className="text-slate-400" />
              </div>
            )}
            <h3 className="font-semibold text-sm" style={{ color: "#111827" }}>{p.title}</h3>
            <p className="text-xs text-slate-500 mt-1">{p.body}</p>
            <p className="text-[10px] text-slate-400 mt-2">(modal preview — opens on “{p.trigger}” in generated app)</p>
          </div>
        </div>
      );

    case "accordion": {
      return <AccordionRenderer p={p} wrapperClass={wrapperClass} />;
    }

    case "dropdown": {
      return <DropdownRenderer p={p} wrapperClass={wrapperClass} />;
    }

    case "toggle": {
      return <ToggleRenderer p={p} wrapperClass={wrapperClass} />;
    }

    case "slider": {
      return <SliderRenderer p={p} wrapperClass={wrapperClass} />;
    }

    case "tooltip": {
      return <TooltipRenderer p={p} wrapperClass={wrapperClass} />;
    }

    case "stepper": {
      const steps: string[] = p.steps ?? [];
      const current = Number(p.current ?? 0);
      const horizontal = p.orientation !== "vertical";
      return (
        <div className={cn("flex h-full", horizontal ? "items-center" : "flex-col justify-center", wrapperClass)} style={{ fontFamily: p.textFont }}>
          {steps.map((s, i) => {
            const done = i < current;
            const active = i === current;
            const color = done ? p.doneColor : active ? p.activeColor : p.inactiveColor;
            return (
              <div key={i} className={cn("flex items-center", horizontal ? "flex-1" : "flex-col", !horizontal && "flex-1 justify-center")}>
                {horizontal && i > 0 && <div className="flex-1 mx-1" style={{ height: 2, background: i <= current ? p.doneColor : p.connectorColor }} />}
                <div className={cn("flex items-center gap-1.5", horizontal ? "" : "flex-row")}>
                  <span className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-semibold text-white flex-shrink-0" style={{ background: color }}>
                    {done ? <Check size={12} /> : p.showNumbers ? i + 1 : "•"}
                  </span>
                  <span className={cn("text-[11px] font-medium whitespace-nowrap", horizontal && "mt-0")} style={{ color: active || done ? p.textColor : "#9ca3af" }}>{s}</span>
                </div>
                {!horizontal && i < steps.length - 1 && <div className="my-1 w-0.5 flex-1 min-h-[10px]" style={{ background: i < current ? p.doneColor : p.connectorColor }} />}
              </div>
            );
          })}
        </div>
      );
    }

    case "segmentedControl": {
      return <SegmentedRenderer p={p} wrapperClass={wrapperClass} />;
    }

    // ────────────────────────────── CONTENT ────────────────────────────
    case "card": {
      return <CardRenderer p={p} wrapperClass={wrapperClass} />;
    }

    case "imageHover": {
      return <ImageHoverRenderer p={p} wrapperClass={wrapperClass} />;
    }

    case "avatar": {
      const radius = p.shape === "circle" ? "50%" : p.shape === "rounded" ? "30%" : "8%";
      return (
        <div className={cn("flex items-center justify-center h-full", wrapperClass)}>
          <div className="relative inline-block" style={{ width: p.size, height: p.size }}>
            {p.imageUrl ? (
              <img src={p.imageUrl} alt="" className="w-full h-full object-cover" style={{ borderRadius: radius, boxShadow: `0 0 0 ${p.ringWidth}px ${p.ringColor}` }} />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-semibold" style={{ borderRadius: radius, background: p.background, color: p.textColor, boxShadow: `0 0 0 ${p.ringWidth}px ${p.ringColor}`, fontFamily: p.textFont }}>
                {(p.name ?? "A").slice(0, 2).toUpperCase()}
              </div>
            )}
            {p.showStatus && (
              <span className="absolute rounded-full" style={{ width: p.size * 0.28, height: p.size * 0.28, background: p.statusColor, border: "2px solid white", right: 0, bottom: 0 }} />
            )}
          </div>
        </div>
      );
    }

    case "badge": {
      const pad = { sm: "2px 8px", md: "4px 12px", lg: "6px 16px" }[String(p.size)] ?? "4px 12px";
      const text = { sm: 10, md: 12, lg: 14 }[String(p.size)] ?? 12;
      return (
        <div className={cn("flex items-center justify-center h-full", wrapperClass)}>
          <span
            className="inline-flex items-center gap-1.5 font-medium"
            style={{
              padding: pad,
              fontSize: text,
              borderRadius: p.rounded,
              background: p.variant === "solid" ? p.color : p.variant === "soft" ? p.color + "22" : "transparent",
              color: p.variant === "solid" ? p.textColor : p.color,
              border: p.variant === "outline" ? `1.5px solid ${p.color}` : "none",
              fontFamily: p.textFont,
            }}
          >
            <IconOrFallback name={p.icon} size={text} />
            {p.text}
          </span>
        </div>
      );
    }

    case "rating": {
      return <RatingRenderer p={p} wrapperClass={wrapperClass} />;
    }

    case "progress": {
      return <ProgressRenderer p={p} wrapperClass={wrapperClass} />;
    }

    case "stat": {
      const dir = p.deltaDirection;
      return (
        <div className={cn("flex items-center gap-3 h-full px-4 rounded-xl", wrapperClass)} style={{ background: p.background, boxShadow: shadowFor(p.shadow), borderRadius: p.borderRadius }}>
          <span className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: p.accentColor + "1f", color: p.accentColor }}>
            <IconOrFallback name={p.icon} size={18} />
          </span>
          <div className="min-w-0">
            <div className="text-xl font-bold leading-none" style={{ color: p.textColor, fontFamily: p.textFont }}>{p.value}</div>
            <div className="text-[11px] mt-1 truncate" style={{ color: p.mutedColor, fontFamily: p.textFont }}>{p.label}</div>
          </div>
          {p.delta && dir !== "none" && (
            <span className="ml-auto text-[11px] font-semibold" style={{ color: dir === "down" ? "#dc2626" : "#16a34a" }}>
              {dir === "down" ? "↓" : "↑"} {p.delta}
            </span>
          )}
        </div>
      );
    }

    case "testimonial": {
      return (
        <div className={cn("p-4 flex flex-col h-full overflow-auto", wrapperClass)} style={{ background: p.background, borderRadius: p.borderRadius, boxShadow: shadowFor(p.shadow), fontFamily: p.textFont }}>
          <div className="flex items-center gap-0.5 mb-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={13} fill={i < Math.round(Number(p.rating ?? 5)) ? p.accentColor : "none"} color={i < Math.round(Number(p.rating ?? 5)) ? p.accentColor : p.accentColor} opacity={i < Math.round(Number(p.rating ?? 5)) ? 1 : 0.3} />
            ))}
          </div>
          <QuoteIcon size={18} style={{ color: p.accentColor }} className="mb-1.5 opacity-60" />
          <p className="text-[13px] leading-relaxed italic flex-1" style={{ color: p.textColor }}>“{p.quote}”</p>
          <div className="flex items-center gap-2.5 mt-3">
            {p.avatarUrl ? <img src={p.avatarUrl} alt="" className="w-9 h-9 rounded-full object-cover" /> : <div className="w-9 h-9 rounded-full" style={{ background: p.accentColor + "33" }} />}
            <div>
              <div className="text-[12px] font-semibold" style={{ color: p.textColor }}>{p.author}</div>
              <div className="text-[10px]" style={{ color: p.mutedColor }}>{p.role}</div>
            </div>
          </div>
        </div>
      );
    }

    case "pricing": {
      return (
        <div
          className={cn("p-4 flex flex-col h-full overflow-auto", wrapperClass)}
          style={{
            background: p.background,
            borderRadius: p.borderRadius,
            boxShadow: shadowFor(p.shadow),
            border: p.highlighted ? `2px solid ${p.accentColor}` : "1px solid rgba(0,0,0,.06)",
            fontFamily: p.textFont,
          }}
        >
          {p.highlighted && (
            <span className="self-start text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mb-2" style={{ background: p.accentColor, color: "#fff" }}>
              Popular
            </span>
          )}
          <div className="text-[12px] font-semibold" style={{ color: p.textColor }}>{p.planName}</div>
          <div className="text-[10px] mt-0.5" style={{ color: p.mutedColor }}>{p.description}</div>
          <div className="flex items-baseline gap-0.5 mt-2">
            <span className="text-lg font-bold" style={{ color: p.accentColor }}>{p.currency}</span>
            <span className="text-3xl font-extrabold leading-none" style={{ color: p.textColor }}>{p.price}</span>
            <span className="text-[11px]" style={{ color: p.mutedColor }}>{p.period}</span>
          </div>
          <div className="space-y-1.5 mt-3 flex-1">
            {(p.features ?? []).map((f: string, i: number) => (
              <div key={i} className="flex items-center gap-1.5 text-[11px]" style={{ color: p.textColor }}>
                <Check size={12} style={{ color: p.accentColor }} /> {f}
              </div>
            ))}
          </div>
          <div className="mt-3 text-center py-2 rounded-lg text-[12px] font-semibold" style={{ background: p.highlighted ? p.accentColor : p.accentColor + "1a", color: p.highlighted ? "#fff" : p.accentColor }}>
            {p.ctaLabel}
          </div>
        </div>
      );
    }

    case "timeline": {
      const items = (p.items ?? []) as string[];
      const parsed = items.map((it) => {
        const [date, ...rest] = it.split("::");
        return { date: date?.trim() ?? "", body: rest.join("::").trim() };
      });
      const horizontal = p.orientation === "horizontal";
      return (
        <div className={cn("flex h-full overflow-auto", horizontal ? "items-center" : "flex-col", wrapperClass)} style={{ fontFamily: p.textFont }}>
          {parsed.map((it, i) => (
            <div key={i} className={cn("flex relative", horizontal ? "flex-1 flex-col items-center" : "flex-row items-start", !horizontal && "pb-3")}>
              {horizontal ? (
                <div className="w-full flex items-center">
                  {i > 0 && <div className="flex-1" style={{ height: 2, background: p.lineColor }} />}
                  <span className="w-4 h-4 rounded-full border-4 flex-shrink-0" style={{ borderColor: "#fff", background: p.dotColor, boxShadow: `0 0 0 2px ${p.lineColor}` }} />
                  {i < parsed.length - 1 && <div className="flex-1" style={{ height: 2, background: p.lineColor }} />}
                </div>
              ) : (
                <>
                  <div className="flex flex-col items-center self-stretch">
                    <span className="w-4 h-4 rounded-full border-4 flex-shrink-0 mt-0.5" style={{ borderColor: "#fff", background: p.dotColor, boxShadow: `0 0 0 2px ${p.lineColor}` }} />
                    {i < parsed.length - 1 && <div className="w-0.5 flex-1 min-h-[14px]" style={{ background: p.lineColor }} />}
                  </div>
                  <div className={cn("pl-3", p.alternate && i % 2 === 1 && "pl-3")}>
                    <div className="text-[11px] font-bold" style={{ color: p.titleColor }}>{it.date}</div>
                    <div className="text-[11px]" style={{ color: p.bodyColor }}>{it.body}</div>
                  </div>
                </>
              )}
              {horizontal && (
                <div className="text-center mt-1.5 px-1">
                  <div className="text-[10px] font-bold" style={{ color: p.titleColor }}>{it.date}</div>
                  <div className="text-[10px]" style={{ color: p.bodyColor }}>{it.body}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      );
    }

    case "alert": {
      const styles = {
        info: { bg: "#eff6ff", border: "#bfdbfe", text: "#1e40af", icon: Info },
        success: { bg: "#f0fdf4", border: "#bbf7d0", text: "#166534", icon: CircleCheck },
        warning: { bg: "#fffbeb", border: "#fde68a", text: "#92400e", icon: TriangleAlert },
        error: { bg: "#fef2f2", border: "#fecaca", text: "#991b1b", icon: CircleAlert },
      }[String(p.variant)] ?? { bg: "#eff6ff", border: "#bfdbfe", text: "#1e40af", icon: Info };
      const Icon = styles.icon;
      const [dismissed, setDismissed] = useState(false);
      if (dismissed) return null;
      return (
        <div className={cn("flex items-start gap-2.5 p-3 h-full overflow-auto", wrapperClass)} style={{ background: styles.bg, border: `1px solid ${styles.border}`, borderRadius: p.borderRadius, fontFamily: p.textFont }}>
          {p.showIcon && <Icon size={16} style={{ color: styles.text }} className="mt-0.5 flex-shrink-0" />}
          <div className="min-w-0 flex-1">
            <div className="text-[12px] font-semibold" style={{ color: styles.text }}>{p.title}</div>
            <div className="text-[11px] mt-0.5" style={{ color: styles.text, opacity: 0.85 }}>{p.body}</div>
          </div>
          {p.dismissible && (
            <button onClick={() => setDismissed(true)} className="flex-shrink-0" style={{ color: styles.text, opacity: 0.6 }}>
              <X size={13} />
            </button>
          )}
        </div>
      );
    }

    case "videoPlayer": {
      const [playing, setPlaying] = useState(Boolean(p.autoplay));
      const aspect = p.aspect === "4:3" ? 4 / 3 : p.aspect === "1:1" ? 1 : 16 / 9;
      return (
        <div className={cn("flex items-center justify-center h-full", wrapperClass)}>
          <div className="relative w-full max-h-full overflow-hidden" style={{ aspectRatio: String(aspect), borderRadius: p.rounded, boxShadow: shadowFor(p.shadow), background: "#0f172a" }}>
            {p.posterUrl ? (
              <img src={p.posterUrl} alt="" className={cn("w-full h-full object-cover", playing && "opacity-40")} />
            ) : (
              <div className="w-full h-full bg-slate-800" />
            )}
            <div className="absolute inset-0 flex items-center justify-center">
              <button
                onClick={() => setPlaying((v) => !v)}
                className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
              >
                {playing ? <Pause size={18} className="ml-0.5" /> : <Play size={18} className="ml-1" />}
              </button>
            </div>
            {p.controls && (
              <div className="absolute bottom-2 inset-x-3 flex items-center gap-2">
                <div className="flex-1 h-1 rounded bg-white/30">
                  <div className="h-full rounded bg-white/90" style={{ width: playing ? "42%" : "18%" }} />
                </div>
                <span className="text-[10px] text-white/80 font-mono">1:24</span>
              </div>
            )}
          </div>
        </div>
      );
    }

    case "codeBlock": {
      const lines = String(p.code ?? "").split("\n");
      const [copied, setCopied] = useState(false);
      return (
        <div className={cn("flex flex-col h-full overflow-hidden", wrapperClass)} style={{ background: p.background, borderRadius: p.rounded, fontFamily: p.textFont }}>
          <div className="flex items-center gap-1.5 px-3 py-1.5 flex-shrink-0" style={{ background: p.headerBackground }}>
            <span className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
            <span className="ml-2 text-[10px]" style={{ color: p.textColor, opacity: 0.7 }}>{p.headerLabel}</span>
            {p.copyButton && (
              <button className="ml-auto flex items-center gap-1 text-[10px]" style={{ color: p.textColor, opacity: 0.7 }} onClick={() => { navigator.clipboard?.writeText(String(p.code ?? "")).catch(() => undefined); setCopied(true); setTimeout(() => setCopied(false), 1200); }}>
                {copied ? <Check size={11} /> : <Copy size={11} />} {copied ? "Copied" : "Copy"}
              </button>
            )}
          </div>
          <pre className="flex-1 overflow-auto px-3 py-2 text-[11px] leading-relaxed" style={{ color: p.textColor }}>
            {lines.map((line, i) => (
              <div key={i} className="flex">
                {p.showLineNumbers && <span className="w-6 flex-shrink-0 text-right pr-3 select-none" style={{ opacity: 0.4 }}>{i + 1}</span>}
                <code className="whitespace-pre">{line || " "}</code>
              </div>
            ))}
          </pre>
          {p.language && <div className="px-3 pb-1.5 text-[9px] uppercase tracking-wider flex-shrink-0" style={{ color: p.accentColor }}>{p.language}</div>}
        </div>
      );
    }

    case "newsletter": {
      const inline = p.layout === "inline";
      return (
        <div className={cn("flex items-center justify-center h-full p-5", wrapperClass)} style={{ background: p.background, borderRadius: p.borderRadius, fontFamily: p.textFont }}>
          <div className={cn("w-full", inline && "flex items-center gap-3 flex-wrap justify-center")}>
            <div className={cn(inline && "flex-1 min-w-[160px] text-left", !inline && "text-center")}>
              <div className="font-bold text-[15px]" style={{ color: p.textColor }}>{p.headline}</div>
              <div className="text-[11px] mt-0.5" style={{ color: p.mutedColor }}>{p.subheadline}</div>
            </div>
            <div className={cn("flex gap-2", inline ? "flex-1 min-w-[220px]" : "mt-3 w-full", !inline && "flex-col")}>
              <input readOnly placeholder={p.placeholder} className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-[12px] outline-none" />
              <span className={cn("text-[12px] font-semibold text-center py-2 rounded-lg", inline ? "px-4" : "")} style={{ background: p.accentColor, color: p.accentTextColor }}>
                {p.buttonLabel}
              </span>
            </div>
          </div>
        </div>
      );
    }

    case "breadcrumb": {
      const items: string[] = p.items ?? [];
      return (
        <div className={cn("flex items-center gap-1.5 h-full overflow-auto", wrapperClass)} style={{ fontFamily: p.textFont }}>
          {items.map((it, i) => {
            const last = i === items.length - 1;
            return (
              <div key={i} className="flex items-center gap-1.5 whitespace-nowrap">
                <span className="text-[12px] cursor-pointer" style={{ color: last ? p.currentColor : p.textColor, fontWeight: last ? 600 : 400 }}>
                  {it}
                </span>
                {!last && <span className="text-[11px]" style={{ color: p.textColor, opacity: 0.5 }}>{p.separator}</span>}
              </div>
            );
          })}
        </div>
      );
    }

    case "marquee": {
      return <MarqueeRenderer p={p} wrapperClass={wrapperClass} />;
    }

    case "iconList": {
      const items = (p.items ?? []) as string[];
      const parsed = items.map((line) => {
        const [icon, title, ...rest] = line.split("::");
        return { icon: icon?.trim() ?? "check", title: title?.trim() ?? "", body: rest.join("::").trim() };
      });
      return (
        <div className={cn("overflow-auto", wrapperClass)}>
          <div className="grid gap-3 h-full" style={{ gridTemplateColumns: `repeat(${p.columns ?? 1}, 1fr)` }}>
            {parsed.map((it, i) => (
              <div key={i} className="flex items-start gap-2.5 p-2">
                <span className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: p.iconColor + "1a", color: p.iconColor }}>
                  <IconOrFallback name={it.icon} size={15} />
                </span>
                <div className="min-w-0">
                  <div className="text-[12px] font-semibold" style={{ color: p.titleColor, fontFamily: p.textFont }}>{it.title}</div>
                  <div className="text-[11px] mt-0.5" style={{ color: p.bodyColor, fontFamily: p.textFont }}>{it.body}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    case "gallery": {
      const images: string[] = p.images ?? [];
      const [hoveredIdx, setHoveredIdx] = useState(-1);
      return (
        <div className={cn("overflow-auto", wrapperClass)}>
          <div className="grid h-full" style={{ gridTemplateColumns: `repeat(${p.columns ?? 3}, 1fr)`, gap: p.gap }}>
            {images.map((src, i) => (
              <div key={i} className="relative overflow-hidden" style={{ borderRadius: p.rounded, boxShadow: shadowFor(p.shadow) }} onMouseEnter={() => setHoveredIdx(i)} onMouseLeave={() => setHoveredIdx(-1)}>
                <img src={src} alt="" className="w-full h-full object-cover transition-transform duration-300" style={{ aspectRatio: (p.aspect ?? "1:1").replace(":", "/"), transform: p.hoverZoom && hoveredIdx === i ? "scale(1.07)" : "scale(1)" }} />
              </div>
            ))}
            {images.length === 0 && <div className="col-span-full h-24 flex items-center justify-center text-xs text-slate-400 bg-slate-100 rounded">No images</div>}
          </div>
        </div>
      );
    }

    case "features": {
      const feats = (p.features ?? []) as string[];
      const parsed = feats.map((line) => {
        const [icon, title, ...rest] = line.split("::");
        return { icon: icon?.trim() ?? "sparkles", title: title?.trim() ?? "", body: rest.join("::").trim() };
      });
      return (
        <div className={cn("overflow-auto p-4", wrapperClass)} style={{ background: p.background, borderRadius: p.borderRadius, fontFamily: p.textFont }}>
          <div className="text-center mb-3" style={{ textAlign: alignTo(p.textAlign) }}>
            <h3 className="text-base font-bold" style={{ color: p.headingColor }}>{p.heading}</h3>
            <p className="text-[11px] mt-1" style={{ color: p.bodyColor }}>{p.subheading}</p>
          </div>
          <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${p.columns ?? 3}, 1fr)` }}>
            {parsed.map((f, i) => (
              <div key={i} className="rounded-xl border border-slate-100 p-3 bg-white/60" style={{ textAlign: alignTo(p.textAlign) }}>
                <span className="w-9 h-9 rounded-lg flex items-center justify-center mb-2" style={{ background: p.iconColor + "1a", color: p.iconColor, margin: alignTo(p.textAlign) === "center" ? "0 auto 8px" : undefined }}>
                  <IconOrFallback name={f.icon} size={16} />
                </span>
                <div className="text-[12px] font-semibold" style={{ color: p.headingColor }}>{f.title}</div>
                <div className="text-[11px] mt-1" style={{ color: p.bodyColor }}>{f.body}</div>
              </div>
            ))}
          </div>
        </div>
      );
    }

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

// ───────────────────────── stateful sub-renderers ─────────────────────────

function TabsRenderer({ p, wrapperClass }: { p: any; wrapperClass: string }) {
  const [active, setActive] = useState(Number(p.activeIndex ?? 0));
  const tabs: string[] = p.tabs ?? [];
  const horizontal = p.orientation !== "vertical";
  const variant = p.variant ?? "underline";
  return (
    <div className={cn(wrapperClass, "flex", horizontal ? "flex-col" : "flex-row")}>
      <div className={cn("flex", horizontal ? "border-b border-gray-200" : "flex-col border-r border-gray-200 pr-1")}>
        {tabs.map((t, i) => {
          const isActive = i === active;
          const pill = variant === "pills";
          const boxed = variant === "boxed";
          return (
            <button
              key={i}
              onClick={() => setActive(i)}
              className="font-medium"
              style={{
                padding: `${p.paddingY}px 14px`,
                fontSize: fs(p.fontSize),
                fontFamily: p.textFont,
                color: isActive ? p.activeTextColor : p.inactiveTextColor,
                background: pill || boxed ? (isActive ? p.indicatorColor : boxed ? "#f3f4f6" : "transparent") : "transparent",
                borderRadius: pill ? 999 : boxed ? "8px 8px 0 0" : 0,
                borderBottom: !pill && !boxed && horizontal ? `2px solid ${isActive ? p.indicatorColor : "transparent"}` : "none",
                borderRight: !pill && !boxed && !horizontal ? `2px solid ${isActive ? p.indicatorColor : "transparent"}` : "none",
                transitionProperty: "all",
                transitionDuration: `${p.durationMs}ms`,
                transitionTimingFunction: p.easing,
              }}
            >
              {t}
            </button>
          );
        })}
      </div>
      <div className="p-3 text-sm text-slate-500" style={{ fontSize: fs(p.fontSize) }}>Content for “{tabs[active]}”</div>
    </div>
  );
}

function CarouselRenderer({ p, wrapperClass }: { p: any; wrapperClass: string }) {
  const slides: string[] = p.slides ?? [];
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (!p.autoplay || paused || slides.length === 0) return;
    const id = setInterval(() => setIndex((i) => (p.loop ? (i + 1) % slides.length : Math.min(i + 1, slides.length - 1))), p.intervalMs);
    return () => clearInterval(id);
  }, [p.autoplay, p.intervalMs, p.loop, paused, slides.length]);
  return (
    <div className={cn("relative overflow-hidden rounded-xl bg-slate-100", wrapperClass)} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
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
          <div key={i} className="w-full h-full flex-shrink-0 flex items-center justify-center font-medium" style={{ color: "#374151", fontFamily: p.textFont, fontSize: fs(p.fontSize), textAlign: alignTo(p.textAlign), padding: p.slidePadding }}>
            {s}
          </div>
        ))}
      </div>
      {p.showArrows && index > 0 && (
        <button onClick={() => setIndex((i) => Math.max(0, i - 1))} className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/80 shadow flex items-center justify-center" style={{ borderRadius: p.arrowStyle === "square" ? 6 : p.arrowStyle === "minimal" ? 0 : 999 }}>
          <ChevronLeft size={14} />
        </button>
      )}
      {p.showArrows && index < slides.length - 1 && (
        <button onClick={() => setIndex((i) => Math.min(slides.length - 1, i + 1))} className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/80 shadow flex items-center justify-center" style={{ borderRadius: p.arrowStyle === "square" ? 6 : p.arrowStyle === "minimal" ? 0 : 999 }}>
          <ChevronRight size={14} />
        </button>
      )}
      {p.showDots && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
          {slides.map((_, i) => (
            <button key={i} onClick={() => setIndex(i)} className="w-1.5 h-1.5 rounded-full" style={{ background: i === index ? p.dotColor : "#d1d5db" }} />
          ))}
        </div>
      )}
    </div>
  );
}

function ButtonRenderer({ p, wrapperClass }: { p: any; wrapperClass: string }) {
  const [hovered, setHovered] = useState(false);
  const sizePad = { sm: [10, 14], md: [p.paddingY, p.paddingX], lg: [p.paddingY + 4, p.paddingX + 8] }[String(p.size)] ?? [p.paddingY, p.paddingX];
  const sizeText = { sm: 11, md: 13, lg: 15 }[String(p.size)] ?? 13;
  const icon = <IconOrFallback name={p.icon} size={sizeText} />;
  const label = (
    <span className="inline-flex items-center gap-1.5">
      {p.icon && p.iconPosition !== "right" && icon}
      {p.label}
      {p.icon && p.iconPosition === "right" && icon}
    </span>
  );
  const background = p.variant === "gradient" ? `linear-gradient(120deg, ${p.background}, ${p.hoverBackground})` : hovered && p.variant === "solid" ? p.hoverBackground : p.variant === "solid" ? p.background : "transparent";
  return (
    <div className={cn("w-full h-full flex items-center justify-center", wrapperClass)}>
      <button
        className="font-medium relative overflow-hidden"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          width: p.fullWidth ? "100%" : undefined,
          background,
          color: p.variant === "solid" || p.variant === "gradient" ? p.textColor : p.background,
          border: p.variant === "outline" ? `${p.borderWidth}px solid ${p.background}` : "none",
          borderRadius: p.borderRadius,
          padding: `${sizePad[0]}px ${sizePad[1]}px`,
          fontSize: sizeText,
          fontWeight: p.fontWeight,
          fontFamily: p.textFont,
          boxShadow: shadowFor(p.shadow),
          transform: hovered ? p.transform : "none",
          transitionProperty: "all",
          transitionDuration: `${p.durationMs}ms`,
          transitionTimingFunction: p.easing,
        }}
      >
        {label}
      </button>
    </div>
  );
}

function AccordionRenderer({ p, wrapperClass }: { p: any; wrapperClass: string }) {
  const items: { title: string; body: string }[] = p.items ?? [];
  const [open, setOpen] = useState<number | number[]>(p.allowMultipleOpen ? [] : Number(p.initialOpenIndex ?? 0));
  const isOpen = (i: number) => (Array.isArray(open) ? open.includes(i) : open === i);
  const toggle = (i: number) => {
    if (Array.isArray(open)) {
      setOpen(open.includes(i) ? open.filter((x) => x !== i) : [...open, i]);
    } else {
      setOpen(open === i ? -1 : i);
    }
  };
  const Icon = p.iconStyle === "plus" ? Plus : p.iconStyle === "arrow" ? ChevronRight : ChevronDown;
  return (
    <div className={cn("divide-y overflow-auto", wrapperClass)} style={{ borderColor: p.dividerColor }}>
      {items.map((it, i) => (
        <div key={i}>
          <button
            className="w-full flex justify-between items-center py-2 text-left"
            style={{ color: p.headerTextColor, fontFamily: p.textFont, fontSize: fs(p.fontSize) }}
            onClick={() => toggle(i)}
          >
            <span className="font-medium">{it.title}</span>
            <Icon
              size={15}
              style={{
                transform: isOpen(i) ? (p.iconStyle === "arrow" ? "rotate(90deg)" : "rotate(180deg)") : "rotate(0)",
                transitionProperty: "transform",
                transitionDuration: `${p.durationMs}ms`,
                transitionTimingFunction: p.easing,
              }}
            />
          </button>
          <div style={{ maxHeight: isOpen(i) ? 120 : 0, overflow: "hidden", transitionProperty: "max-height", transitionDuration: `${p.durationMs}ms`, transitionTimingFunction: p.easing }}>
            <p className="pb-2" style={{ fontSize: fs(p.fontSize) === 12 ? 11 : 12, color: p.bodyTextColor, fontFamily: p.textFont }}>{it.body}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function DropdownRenderer({ p, wrapperClass }: { p: any; wrapperClass: string }) {
  const [open, setOpen] = useState(false);
  const items: string[] = p.items ?? [];
  return (
    <div className={cn("flex flex-col items-center justify-center h-full", wrapperClass)}>
      <div className="relative w-full px-3">
        <button
          className="w-full flex items-center justify-center gap-1.5 font-medium"
          style={{
            padding: "7px 14px",
            fontSize: 13,
            borderRadius: p.rounded,
            background: p.variant === "solid" ? p.background : "transparent",
            color: p.variant === "solid" ? p.textColor : p.background,
            border: p.variant === "outline" ? `1.5px solid ${p.background}` : "none",
            fontFamily: p.textFont,
          }}
          onClick={() => setOpen((o) => !o)}
          onMouseEnter={() => p.openOn === "hover" && setOpen(true)}
          onMouseLeave={() => p.openOn === "hover" && setOpen(false)}
        >
          {p.buttonLabel}
          <ChevronDown size={13} style={{ transform: open ? "rotate(180deg)" : "none", transition: `transform ${p.durationMs}ms ${p.easing}` }} />
        </button>
        {open && (
          <div
            className="absolute left-3 right-3 top-full mt-1 rounded-lg shadow-xl border z-30 overflow-hidden"
            style={{ background: p.menuBackground, borderColor: p.borderColor, boxShadow: shadowFor(p.shadow) }}
          >
            {items.map((it, i) => (
              <div key={i} className="px-3 py-2 text-[12px] cursor-pointer" style={{ color: p.menuTextColor, fontFamily: p.textFont }} onMouseEnter={(e) => ((e.target as HTMLElement).style.background = p.menuHoverColor)} onMouseLeave={(e) => ((e.target as HTMLElement).style.background = "transparent")} onClick={() => setOpen(false)}>
                {it}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ToggleRenderer({ p, wrapperClass }: { p: any; wrapperClass: string }) {
  const [checked, setChecked] = useState(Boolean(p.checked));
  const dims = { sm: [32, 18, 14], md: [42, 24, 20], lg: [54, 30, 26] }[String(p.size)] ?? [42, 24, 20];
  const [w, h, knob] = dims;
  return (
    <div className={cn("flex items-center justify-center gap-2.5 h-full px-3", wrapperClass)}>
      {p.label && p.labelPosition === "left" && <span className="text-[12px]" style={{ color: p.textColor, fontFamily: p.textFont }}>{p.label}</span>}
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => setChecked((v) => !v)}
        className="relative rounded-full flex-shrink-0"
        style={{ width: w, height: h, background: checked ? p.onColor : p.offColor, transition: `background ${p.durationMs}ms ${p.easing}` }}
      >
        <span
          className="absolute rounded-full shadow"
          style={{
            width: knob,
            height: knob,
            top: (h - knob) / 2,
            left: checked ? w - knob - 2 : 2,
            background: p.knobColor,
            transition: `left ${p.durationMs}ms ${p.easing}`,
          }}
        />
      </button>
      {p.label && p.labelPosition !== "left" && <span className="text-[12px]" style={{ color: p.textColor, fontFamily: p.textFont }}>{p.label}</span>}
    </div>
  );
}

function SliderRenderer({ p, wrapperClass }: { p: any; wrapperClass: string }) {
  const [value, setValue] = useState(Number(p.value ?? 0));
  const min = Number(p.min ?? 0);
  const max = Number(p.max ?? 100);
  const pct = ((value - min) / (max - min || 1)) * 100;
  return (
    <div className={cn("flex items-center justify-center gap-3 h-full px-3", wrapperClass)}>
      {p.label && <span className="text-[12px] whitespace-nowrap" style={{ color: p.textColor, fontFamily: p.textFont }}>{p.label}</span>}
      <div className="flex-1 h-1.5 rounded-full relative" style={{ background: p.trackColor }}>
        <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${Math.max(0, Math.min(100, pct))}%`, background: p.color }} />
        <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-2 shadow" style={{ left: `calc(${Math.max(0, Math.min(100, pct))}% - 8px)`, borderColor: p.color }} />
      </div>
      {p.showValue && <span className="text-[11px] font-mono w-9 text-right" style={{ color: p.textColor }}>{Math.round(value)}</span>}
      <input type="range" className="hidden" value={value} min={min} max={max} step={p.step} onChange={(e) => setValue(Number(e.target.value))} />
    </div>
  );
}

function TooltipRenderer({ p, wrapperClass }: { p: any; wrapperClass: string }) {
  const [visible, setVisible] = useState(false);
  const pos = p.position ?? "top";
  const posMap: Record<string, string> = { top: "bottom-full mb-1.5", bottom: "top-full mt-1.5", left: "right-full mr-1.5", right: "left-full ml-1.5" };
  const posClass = posMap[pos] ?? posMap.top;
  const arrowMap: Record<string, string> = { top: "top-full left-1/2 -translate-x-1/2 border-t-[6px] border-t-inherit", bottom: "bottom-full left-1/2 -translate-x-1/2 border-b-[6px] border-b-inherit", left: "left-full top-1/2 -translate-y-1/2 border-l-[6px] border-l-inherit", right: "right-full top-1/2 -translate-y-1/2 border-r-[6px] border-r-inherit" };
  const arrow = arrowMap[pos] ?? arrowMap.top;
  return (
    <div className={cn("flex items-center justify-center h-full", wrapperClass)}>
      <div className="relative inline-block">
        <span
          className="text-[13px] font-medium underline decoration-dotted underline-offset-4 cursor-help"
          style={{ color: "#4b5563", fontFamily: p.textFont }}
          onMouseEnter={() => setVisible(true)}
          onMouseLeave={() => setVisible(false)}
          onClick={() => setVisible((v) => !v)}
        >
          {p.anchorText}
        </span>
        {visible && (
          <div
            className={cn("absolute z-30 whitespace-nowrap text-[11px] px-2.5 py-1.5", posClass)}
            style={{
              background: p.background,
              color: p.textColor,
              borderRadius: p.rounded,
              fontFamily: p.textFont,
              opacity: visible ? 1 : 0,
              transition: `opacity ${p.durationMs}ms ${p.easing}`,
            }}
          >
            {p.text}
            {p.showArrow && <span className={cn("absolute border-4 border-transparent", arrow)} style={{ borderTopColor: ["top"].includes(pos) ? p.background : undefined, borderBottomColor: pos === "bottom" ? p.background : undefined, borderLeftColor: pos === "left" ? p.background : undefined, borderRightColor: pos === "right" ? p.background : undefined }} />}
          </div>
        )}
      </div>
    </div>
  );
}

function SegmentedRenderer({ p, wrapperClass }: { p: any; wrapperClass: string }) {
  const options: string[] = p.options ?? [];
  const [selected, setSelected] = useState(Number(p.selected ?? 0));
  return (
    <div className={cn("flex items-center justify-center h-full px-2", wrapperClass)}>
      <div className="flex w-full p-1" style={{ background: p.background, borderRadius: p.rounded }}>
        {options.map((o, i) => (
          <button
            key={i}
            onClick={() => setSelected(i)}
            className="flex-1 text-[12px] font-medium py-1.5 px-2"
            style={{
              background: i === selected ? p.activeBackground : "transparent",
              color: i === selected ? p.activeTextColor : p.textColor,
              borderRadius: Math.max(0, Number(p.rounded) - 4),
              fontFamily: p.textFont,
              boxShadow: i === selected ? "0 1px 3px rgba(0,0,0,.12)" : "none",
              transition: `all ${p.durationMs}ms ${p.easing}`,
            }}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

function CardRenderer({ p, wrapperClass }: { p: any; wrapperClass: string }) {
  const [hovered, setHovered] = useState(false);
  const titleSize = { sm: 13, md: 14, lg: 16 }[String(p.titleSize)] ?? 14;
  return (
    <div
      className={cn("relative overflow-hidden flex flex-col", wrapperClass)}
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
      {p.imageUrl && p.imageHeightPct > 0 && <img src={p.imageUrl} alt={p.title} className="w-full object-cover flex-shrink-0" style={{ height: `${p.imageHeightPct}%` }} />}
      <div className="flex-1 min-h-0 overflow-hidden" style={{ padding: p.padding, textAlign: alignTo(p.textAlign) }}>
        <h3 className="font-semibold text-slate-900" style={{ fontSize: titleSize, fontFamily: p.textFont }}>{p.title}</h3>
        <p className="text-xs text-slate-500 mt-1" style={{ fontFamily: p.textFont }}>{p.body}</p>
      </div>
      {p.hoverReveal && (
        <div
          className="absolute inset-0 flex items-center justify-center font-medium"
          style={{
            background: p.revealBackground,
            color: p.revealTextColor,
            opacity: hovered ? 1 : 0,
            transitionProperty: "opacity",
            transitionDuration: `${p.durationMs}ms`,
            transitionTimingFunction: p.easing,
            pointerEvents: "none",
          }}
        >
          {p.revealContent}
        </div>
      )}
    </div>
  );
}

function ImageHoverRenderer({ p, wrapperClass }: { p: any; wrapperClass: string }) {
  const [hovered, setHovered] = useState(false);
  const posStyle = p.captionPosition === "top" ? { alignItems: "flex-start" } : p.captionPosition === "center" ? { alignItems: "center", justifyContent: "center" } : { alignItems: "flex-end" };
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
        className="absolute inset-0 flex p-3 text-sm"
        style={{
          ...posStyle,
          background: p.overlayColor,
          color: p.captionColor,
          textAlign: alignTo(p.textAlign),
          opacity: hovered ? 1 : 0,
          transitionProperty: "opacity",
          transitionDuration: `${p.durationMs}ms`,
          transitionTimingFunction: p.easing,
          pointerEvents: "none",
          fontFamily: p.textFont,
        }}
      >
        {p.caption}
      </div>
    </div>
  );
}

function RatingRenderer({ p, wrapperClass }: { p: any; wrapperClass: string }) {
  const [value, setValue] = useState(Number(p.value ?? 0));
  const Icon = ratingIcon(String(p.icon ?? "star"));
  const max = Number(p.max ?? 5);
  return (
    <div className={cn("flex items-center justify-center gap-1.5 h-full", wrapperClass)}>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: max }).map((_, i) => {
          const filled = i < Math.floor(value);
          const half = !filled && i < Math.ceil(value) && value % 1 >= 0.25;
          return (
            <button key={i} onClick={() => p.interactive && setValue(i + 1)} className="relative" style={{ cursor: p.interactive ? "pointer" : "default" }}>
              <Icon size={p.size} style={{ color: p.emptyColor }} fill={p.emptyColor} />
              <span className="absolute inset-0 overflow-hidden" style={{ width: filled ? "100%" : half ? "50%" : "0%" }}>
                <Icon size={p.size} style={{ color: p.color }} fill={p.color} />
              </span>
            </button>
          );
        })}
      </div>
      {p.showValue && <span className="text-[12px] font-semibold" style={{ color: p.color }}>{Number(value).toFixed(1)}</span>}
    </div>
  );
}

function ProgressRenderer({ p, wrapperClass }: { p: any; wrapperClass: string }) {
  const value = Math.max(0, Math.min(100, Number(p.value ?? 0)));
  const [animate, setAnimate] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setAnimate(true), 60);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className={cn("flex flex-col justify-center h-full gap-1.5 px-3", wrapperClass)}>
      {p.showLabel && (
        <div className="flex justify-between text-[11px]">
          <span style={{ color: p.textColor, fontFamily: p.textFont }}>{p.label}</span>
          <span className="font-semibold" style={{ color: p.color }}>{value}%</span>
        </div>
      )}
      <div className="w-full overflow-hidden relative" style={{ height: p.height, background: p.trackColor, borderRadius: p.rounded }}>
        <div
          className="h-full relative overflow-hidden"
          style={{
            width: animate ? `${value}%` : "0%",
            background: p.color,
            borderRadius: p.rounded,
            transition: `width ${p.durationMs}ms ${p.easing}`,
            backgroundImage: p.striped ? "linear-gradient(45deg, rgba(255,255,255,.25) 25%, transparent 25%, transparent 50%, rgba(255,255,255,.25) 50%, rgba(255,255,255,.25) 75%, transparent 75%, transparent)" : undefined,
            backgroundSize: p.striped ? "20px 20px" : undefined,
          }}
        />
      </div>
    </div>
  );
}

function MarqueeRenderer({ p, wrapperClass }: { p: any; wrapperClass: string }) {
  const items: string[] = p.items ?? [];
  const [paused, setPaused] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);
  useEffect(() => {
    if (paused || items.length === 0) return;
    let raf = 0;
    const speed = 60; // px per second
    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      setOffset((o) => (o + (p.reverse ? -speed * dt : speed * dt)) % ((trackRef.current?.scrollWidth ?? 2) / 2 || 1));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [paused, items.length, p.reverse]);
  const content = items.join(` ${p.separator ?? "•"} `);
  return (
    <div className={cn("flex items-center overflow-hidden h-full", wrapperClass)} style={{ background: p.background, fontFamily: p.textFont }} onMouseEnter={() => setPaused(Boolean(p.pauseOnHover))} onMouseLeave={() => setPaused(false)}>
      <div ref={trackRef} className="flex whitespace-nowrap flex-shrink-0" style={{ transform: `translateX(${p.reverse ? offset : -offset}px)` }}>
        <span className="px-4 font-medium" style={{ color: p.textColor, fontSize: fs(p.fontSize) }}>{content}</span>
        <span className="px-4 font-medium" style={{ color: p.textColor, fontSize: fs(p.fontSize) }}>{content}</span>
      </div>
    </div>
  );
}

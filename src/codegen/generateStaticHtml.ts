import type { ComponentSpec, ProjectSpec } from "../types";
import { sanitizeHtml } from "../utils/sanitize";

// Renders a single component spec to a plain HTML fragment (no framework),
// used for the standalone/static export and doubles as the file format the
// import engine round-trips against for "authored" files. Every top-level
// node carries data-ui-type / data-ui-id / data-ui-box so a re-import can
// recover structure even in heuristic (non-spec) mode.

function staticAction(action: unknown): { href: string; onClick: string } {
  const a = (action ?? { type: "none" }) as any;
  if (a.type === "link" && a.url) return { href: a.url, onClick: a.target === "_blank" ? `window.open('${String(a.url).replace(/'/g, "\\'")}','_blank');return false;` : "" };
  if (a.type === "scroll" && a.componentId) return { href: `#comp-${a.componentId}`, onClick: "" };
  if (a.type === "alert") return { href: "#", onClick: `alert('${String(a.message ?? "").replace(/'/g, "\\'")}');return false;` };
  if (a.type === "custom") return { href: "#", onClick: String(a.code ?? "").replace(/"/g, "&quot;") };
  return { href: "", onClick: "" };
}

function box(spec: ComponentSpec) {
  return `grid-column:${spec.box.x + 1}/span ${spec.box.w};grid-row:${spec.box.y + 1}/span ${spec.box.h};`;
}

function wrap(spec: ComponentSpec, inner: string, extraStyle = "") {
  const cls = spec.customClassName ? ` ${spec.customClassName}` : "";
  const custom =
    spec.customCode && spec.type !== "rawBlock"
      ? `<div class="ui-custom-code">${sanitizeHtml(spec.customCode).safe}</div>`
      : "";
  return `<div id="comp-${spec.id}" data-ui-type="${spec.type}" data-ui-id="${spec.id}" data-ui-box='${JSON.stringify(spec.box)}' class="ui-block${cls}" style="${box(spec)}${extraStyle}">${inner}${custom}</div>`;
}

export function componentToHtml(spec: ComponentSpec): string {
  const p = spec.params as any;
  switch (spec.type) {
    case "container":
      return wrap(
        spec,
        `<!-- container children would render here -->`,
        `display:flex;flex-direction:${p.direction};gap:${p.gap}px;padding:${p.padding}px;align-items:${p.align};justify-content:${p.justify};background:${p.background};border-radius:${p.borderRadius}px;max-width:${p.maxWidth};`
      );
    case "tabs": {
      const tabs = (p.tabs as string[]) ?? [];
      return wrap(
        spec,
        `<div class="tabs" role="tablist" data-duration="${p.durationMs}" data-easing="${p.easing}" data-trigger="${p.trigger}">
          ${tabs.map((t, i) => `<button role="tab" class="tab-item" data-index="${i}" style="color:${i === 0 ? p.activeTextColor : p.inactiveTextColor};border-bottom:2px solid ${i === 0 ? p.indicatorColor : "transparent"}">${t}</button>`).join("")}
        </div>`
      );
    }
    case "card":
      return wrap(
        spec,
        `<div class="card" style="background:${p.background};border-radius:${p.borderRadius}px;position:relative;overflow:hidden;">
          ${p.imageUrl ? `<img src="${p.imageUrl}" alt="${p.title}" style="width:100%;height:50%;object-fit:cover;">` : ""}
          <div style="padding:16px;"><h3>${p.title}</h3><p>${p.body}</p></div>
          ${p.hoverReveal ? `<div class="card-reveal" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:${p.revealBackground};color:${p.revealTextColor};opacity:0;transition:opacity ${p.durationMs}ms ${p.easing};">${p.revealContent}</div>` : ""}
        </div>`
      );
    case "imageHover":
      return wrap(
        spec,
        `<figure class="reveal" style="position:relative;overflow:hidden;border-radius:${p.borderRadius}px;margin:0;">
          <img src="${p.imageUrl}" alt="${p.caption}" style="width:100%;height:100%;object-fit:${p.objectFit};">
          <figcaption style="position:absolute;inset:0;display:flex;align-items:flex-end;padding:16px;background:${p.overlayColor};color:${p.captionColor};opacity:0;">${p.caption}</figcaption>
        </figure>`
      );
    case "carousel":
      return wrap(
        spec,
        `<div class="carousel" data-carousel data-autoplay="${p.autoplay}" data-interval="${p.intervalMs}">
          ${(p.slides as string[]).map((s) => `<div class="slide">${s}</div>`).join("")}
        </div>`
      );
    case "searchBar":
      return wrap(spec, `<input type="search" placeholder="${p.placeholder}" style="background:${p.background};border-radius:${p.rounded}px;color:${p.textColor};padding:8px 16px;border:none;width:100%;">`);
    case "table": {
      const cols = p.columns as string[];
      const rows = p.rows as string[][];
      return wrap(
        spec,
        `<table><thead><tr style="background:${p.headerBackground};color:${p.headerTextColor};">${cols.map((c) => `<th>${c}</th>`).join("")}</tr></thead>
          <tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody></table>`
      );
    }
    case "button": {
      const act = staticAction(p.action);
      const inner = `<button style="background:${p.background};color:${p.textColor};border-radius:${p.borderRadius}px;padding:${p.paddingY}px ${p.paddingX}px;border:none;cursor:pointer;"${act.href ? ` data-href="${act.href}"` : ""}${act.onClick ? ` onclick="${act.onClick}"` : ""}>${p.label}</button>`;
      return wrap(spec, inner);
    }
    case "modal":
      return wrap(
        spec,
        `<div role="dialog" aria-modal="true" class="modal" style="background:${p.panelBackground};border-radius:${p.borderRadius}px;padding:24px;">
          <h3>${p.title}</h3><p>${p.body}</p>
        </div>`
      );
    case "accordion": {
      const items = p.items as { title: string; body: string }[];
      return wrap(
        spec,
        `<div class="accordion">${items
          .map(
            (it) =>
              `<details><summary style="color:${p.headerTextColor}">${it.title}</summary><p>${it.body}</p></details>`
          )
          .join("")}</div>`
      );
    }
    case "stickyHeader":
      return wrap(
        spec,
        `<header style="background:${p.background};position:sticky;top:0;display:flex;justify-content:space-between;align-items:center;padding:0 24px;">
          <span><strong>${p.logoText}</strong></span>
          <nav style="display:flex;gap:24px;">${(p.links as string[]).map((l) => `<a href="#">${l}</a>`).join("")}</nav>
        </header>`
      );
    case "pageTransition":
      return wrap(spec, `<div class="page-transition-wrapper">Page content wrapper (${p.transitionStyle})</div>`);
    case "navbar":
      return wrap(
        spec,
        `<nav class="navbar" style="display:flex;justify-content:space-between;align-items:center;padding:0 24px;background:${p.background};color:${p.textColor};box-shadow:${p.shadow === "none" ? "none" : "0 1px 2px rgba(0,0,0,.06)"};">
          <span><strong>${p.logoText}</strong></span>
          <div style="display:flex;gap:24px;">${(p.links as string[]).map((l) => { const [label, url] = l.split("::"); return url ? `<a href="${url.trim()}">${label.trim()}</a>` : `<span>${label.trim()}</span>`; }).join("")}</div>
          ${p.ctaLabel ? `<a href="${staticAction(p.ctaAction).href || "#"}" style="background:${p.ctaBackground};color:${p.ctaTextColor};padding:8px 16px;border-radius:8px;">${p.ctaLabel}</a>` : ""}
        </nav>`
      );
    case "footer":
      return wrap(
        spec,
        `<footer class="footer" style="background:${p.background};color:${p.textColor};padding:24px;border-top:1px solid ${p.borderColor};display:flex;gap:32px;">
          <div><strong>${p.brandName}</strong><p style="color:${p.mutedColor};font-size:12px;">${p.tagline}</p></div>
          ${((p.columns as string[]) ?? []).map((c) => { const [t, ls] = c.split("::"); return `<div><div style="color:${p.accentColor};font-size:11px;text-transform:uppercase;">${t}</div>${(ls ?? "").split(",").map((l) => `<div style="font-size:12px;">${l.trim()}</div>`).join("")}</div>`; }).join("")}
        </footer>`
      );
    case "hero":
      return wrap(
        spec,
        `<section class="hero" style="display:flex;align-items:center;justify-content:${p.layout === "center" ? "center" : "space-between"};padding:32px;background:${p.background};border-radius:${p.borderRadius}px;gap:24px;overflow:hidden;position:relative;">
          <div style="text-align:${p.align};max-width:560px;"><h1 style="color:${p.textColor};margin:0;">${p.headline}</h1><p style="color:${p.mutedColor};">${p.subheadline}</p>
          <a href="${staticAction(p.primaryAction).href || "#"}" ${staticAction(p.primaryAction).onClick ? `onclick="${staticAction(p.primaryAction).onClick}"` : ""} style="background:${p.accentColor};color:${p.accentTextColor};padding:12px 22px;border-radius:10px;display:inline-block;">${p.ctaPrimary}</a></div>
          ${p.imageUrl && p.layout !== "center" ? `<img src="${p.imageUrl}" style="width:40%;height:85%;object-fit:cover;border-radius:14px;">` : ""}
        </section>`
      );
    case "divider":
      return wrap(
        spec,
        `<hr class="divider" style="border:none;border-top:${p.thickness}px ${p.style === "gradient" ? "solid" : p.style} ${p.color};margin:0;${p.label ? "" : ""}">${p.label ? `<div style="text-align:center;margin-top:-12px;"><span style="background:#fff;padding:0 12px;color:${p.textColor};">${p.label}</span></div>` : ""}`
      );
    case "dropdown":
      return wrap(
        spec,
        `<div class="dropdown" style="position:relative;"><button style="background:${p.variant === "solid" ? p.background : "transparent"};color:${p.variant === "solid" ? p.textColor : p.background};border-radius:${p.rounded}px;padding:8px 16px;">${p.buttonLabel} ▾</button>
        <div class="dropdown-menu" style="display:none;position:absolute;background:${p.menuBackground};border:1px solid ${p.borderColor};border-radius:${p.rounded}px;padding:4px;">${(p.items as string[]).map((it) => `<div style="padding:6px 12px;color:${p.menuTextColor};">${it}</div>`).join("")}</div></div>`
      );
    case "toggle":
      return wrap(spec, `<div class="toggle" role="switch" aria-checked="${p.checked}" style="display:flex;align-items:center;gap:10px;justify-content:center;"><span style="width:42px;height:24px;border-radius:999px;background:${p.checked ? p.onColor : p.offColor};display:inline-block;position:relative;"><span style="position:absolute;width:20px;height:20px;border-radius:999px;background:${p.knobColor};top:2px;left:${p.checked ? 20 : 2}px;"></span></span><span style="color:${p.textColor};">${p.label}</span></div>`);
    case "slider":
      return wrap(spec, `<div class="slider" style="display:flex;align-items:center;gap:12px;justify-content:center;"><span>${p.label}</span><input type="range" min="${p.min}" max="${p.max}" step="${p.step}" value="${p.value}" style="flex:1;accent-color:${p.color};"><span>${p.value}</span></div>`);
    case "tooltip":
      return wrap(spec, `<div class="tooltip" data-tooltip="${p.text}" style="text-align:center;"><span style="text-decoration:underline dotted;cursor:help;">${p.anchorText}</span></div>`);
    case "stepper":
      return wrap(
        spec,
        `<ol class="stepper" style="display:flex;list-style:none;padding:0;gap:8px;align-items:center;justify-content:center;">${(p.steps as string[]).map((s, i) => `<li style="display:flex;align-items:center;gap:8px;"><span style="width:24px;height:24px;border-radius:999px;display:inline-flex;align-items:center;justify-content:center;color:#fff;background:${i < p.current ? p.doneColor : i === p.current ? p.activeColor : p.inactiveColor};font-size:11px;">${i < p.current ? "✓" : p.showNumbers ? i + 1 : "•"}</span><span>${s}</span></li>`).join("")}</ol>`
      );
    case "segmentedControl":
      return wrap(
        spec,
        `<div class="segmented" style="display:flex;background:${p.background};border-radius:${p.rounded}px;padding:4px;justify-content:center;">${(p.options as string[]).map((o, i) => `<span style="flex:1;text-align:center;padding:6px 12px;border-radius:${Math.max(0, p.rounded - 4)}px;background:${i === p.selected ? p.activeBackground : "transparent"};color:${i === p.selected ? p.activeTextColor : p.textColor};">${o}</span>`).join("")}</div>`
      );
    case "avatar":
      return wrap(
        spec,
        `<div class="avatar" style="text-align:center;"><img src="${p.imageUrl}" alt="${p.name}" style="width:${p.size}px;height:${p.size}px;object-fit:cover;border-radius:${p.shape === "circle" ? "50%" : p.shape === "rounded" ? "30%" : "8%"};box-shadow:0 0 0 ${p.ringWidth}px ${p.ringColor};"></div>`
      );
    case "badge":
      return wrap(
        spec,
        `<span class="badge" style="display:inline-flex;padding:4px 12px;border-radius:${p.rounded}px;background:${p.variant === "solid" ? p.color : p.variant === "soft" ? p.color + "22" : "transparent"};color:${p.variant === "solid" ? p.textColor : p.color};border:${p.variant === "outline" ? `1.5px solid ${p.color}` : "none"};">${p.text}</span>`
      );
    case "rating":
      return wrap(
        spec,
        `<div class="rating" style="display:flex;justify-content:center;align-items:center;gap:8px;"><span style="color:${p.color};font-size:${p.size}px;">${"★".repeat(Math.floor(p.value))}${p.value % 1 >= 0.25 ? "½" : ""}</span>${p.showValue ? `<span>${p.value}</span>` : ""}</div>`
      );
    case "progress":
      return wrap(
        spec,
        `<div class="progress" style="padding:8px 12px;"><div style="display:flex;justify-content:space-between;font-size:11px;color:${p.textColor};"><span>${p.label}</span><span>${p.value}%</span></div><div style="height:${p.height}px;background:${p.trackColor};border-radius:${p.rounded}px;overflow:hidden;"><div style="width:${p.value}%;height:100%;background:${p.color};"></div></div></div>`
      );
    case "stat":
      return wrap(
        spec,
        `<div class="stat" style="display:flex;align-items:center;gap:12px;padding:12px 16px;background:${p.background};border-radius:${p.borderRadius}px;box-shadow:0 1px 2px rgba(0,0,0,.06);"><span style="color:${p.accentColor};font-size:20px;">◆</span><div><div style="font-size:20px;font-weight:700;color:${p.textColor};">${p.value}</div><div style="font-size:12px;color:${p.mutedColor};">${p.label}</div></div></div>`
      );
    case "testimonial":
      return wrap(
        spec,
        `<figure class="testimonial" style="margin:0;padding:20px;background:${p.background};border-radius:${p.borderRadius}px;box-shadow:0 4px 10px rgba(0,0,0,.08);"><div style="color:${p.accentColor};">${"★".repeat(Math.round(p.rating))}</div><blockquote style="margin:8px 0;color:${p.textColor};font-style:italic;">“${p.quote}”</blockquote><figcaption style="display:flex;align-items:center;gap:12px;"><img src="${p.avatarUrl}" style="width:36px;height:36px;border-radius:50%;object-fit:cover;"><span><strong>${p.author}</strong><br><span style="color:${p.mutedColor};font-size:12px;">${p.role}</span></span></figcaption></figure>`
      );
    case "pricing":
      return wrap(
        spec,
        `<div class="pricing" style="padding:20px;background:${p.background};border-radius:${p.borderRadius}px;border:${p.highlighted ? `2px solid ${p.accentColor}` : "1px solid rgba(0,0,0,.06)"};box-shadow:0 4px 10px rgba(0,0,0,.08);"><div><strong>${p.planName}</strong></div><div style="font-size:32px;font-weight:800;">${p.currency}${p.price}<span style="font-size:12px;">${p.period}</span></div><ul style="padding-left:18px;">${(p.features as string[]).map((f) => `<li>${f}</li>`).join("")}</ul><div style="text-align:center;background:${p.accentColor};color:#fff;border-radius:10px;padding:10px;">${p.ctaLabel}</div></div>`
      );
    case "timeline":
      return wrap(
        spec,
        `<div class="timeline" style="display:flex;flex-direction:${p.orientation === "horizontal" ? "row" : "column"};">${((p.items as string[]) ?? []).map((it) => { const [d, ...r] = it.split("::"); return `<div style="display:flex;align-items:flex-start;gap:8px;padding:4px 0;"><span style="width:12px;height:12px;border-radius:50%;background:${p.dotColor};margin-top:4px;"></span><div><strong style="color:${p.titleColor};">${d}</strong><div style="color:${p.bodyColor};">${r.join("::")}</div></div></div>`; }).join("")}</div>`
      );
    case "alert":
      return wrap(
        spec,
        `<div class="alert" role="alert" style="padding:12px 16px;border-radius:${p.borderRadius}px;background:${({ info: "#eff6ff", success: "#f0fdf4", warning: "#fffbeb", error: "#fef2f2" } as Record<string, string>)[p.variant] ?? "#eff6ff"};border:1px solid ${({ info: "#bfdbfe", success: "#bbf7d0", warning: "#fde68a", error: "#fecaca" } as Record<string, string>)[p.variant] ?? "#bfdbfe"};"><strong>${p.title}</strong><p style="margin:4px 0 0;">${p.body}</p></div>`
      );
    case "videoPlayer":
      return wrap(spec, `<video class="video" src="${p.videoUrl}" poster="${p.posterUrl}" controls="${p.controls}" autoplay="${p.autoplay}" loop="${p.loop}" muted="${p.muted}" style="width:100%;border-radius:${p.rounded}px;background:#0f172a;"></video>`);
    case "codeBlock":
      return wrap(
        spec,
        `<pre class="code-block" style="margin:0;background:${p.background};color:${p.textColor};border-radius:${p.rounded}px;padding:16px;overflow:auto;font-family:monospace;font-size:12px;"><code>${String(p.code ?? "").replace(/</g, "&lt;")}</code></pre>`
      );
    case "newsletter":
      return wrap(
        spec,
        `<form class="newsletter" style="display:flex;flex-direction:${p.layout === "inline" ? "row" : "column"};gap:8px;align-items:center;justify-content:center;padding:24px;background:${p.background};border-radius:${p.borderRadius}px;"><div><h3 style="margin:0;color:${p.textColor};">${p.headline}</h3><p style="margin:4px 0 0;color:${p.mutedColor};font-size:12px;">${p.subheadline}</p></div><input type="email" placeholder="${p.placeholder}" style="padding:10px 14px;border-radius:10px;border:1px solid #e5e7eb;"><button style="padding:10px 18px;border:none;border-radius:10px;background:${p.accentColor};color:${p.accentTextColor};font-weight:600;">${p.buttonLabel}</button></form>`
      );
    case "breadcrumb":
      return wrap(
        spec,
        `<nav class="breadcrumb" aria-label="breadcrumb" style="display:flex;gap:8px;align-items:center;">${(p.items as string[]).map((it, i, arr) => `<span style="color:${i === arr.length - 1 ? p.currentColor : p.textColor};">${it}</span>${i < arr.length - 1 ? `<span style="color:${p.textColor};opacity:.5;">${p.separator}</span>` : ""}`).join("")}</nav>`
      );
    case "marquee":
      return wrap(
        spec,
        `<div class="marquee" style="display:flex;align-items:center;overflow:hidden;background:${p.background};color:${p.textColor};white-space:nowrap;">${(p.items as string[]).map((it) => `<span style="padding:0 24px;">${it}</span>`).join(`<span style="opacity:.5;">${p.separator ?? "•"}</span>`)}</div>`
      );
    case "iconList":
      return wrap(
        spec,
        `<div class="icon-list" style="display:grid;grid-template-columns:repeat(${p.columns ?? 1},1fr);gap:12px;">${((p.items as string[]) ?? []).map((line) => { const [, title, ...rest] = line.split("::"); return `<div style="display:flex;gap:12px;"><span style="color:${p.iconColor};">◆</span><div><strong style="color:${p.titleColor};">${title}</strong><div style="color:${p.bodyColor};font-size:12px;">${rest.join("::")}</div></div></div>`; }).join("")}</div>`
      );
    case "gallery":
      return wrap(
        spec,
        `<div class="gallery" style="display:grid;grid-template-columns:repeat(${p.columns},1fr);gap:${p.gap}px;">${(p.images as string[]).map((src) => `<img src="${src}" style="width:100%;aspect-ratio:${(p.aspect ?? "1:1").replace(":", "/")};object-fit:cover;border-radius:${p.rounded}px;">`).join("")}</div>`
      );
    case "features":
      return wrap(
        spec,
        `<section class="features" style="padding:20px;background:${p.background};border-radius:${p.borderRadius}px;"><div style="text-align:${p.textAlign};"><h2 style="margin:0;color:${p.headingColor};">${p.heading}</h2><p style="color:${p.bodyColor};font-size:13px;">${p.subheading}</p></div><div style="display:grid;grid-template-columns:repeat(${p.columns},1fr);gap:12px;margin-top:12px;">${((p.features as string[]) ?? []).map((line) => { const [, title, ...rest] = line.split("::"); return `<div style="border:1px solid rgba(0,0,0,.05);border-radius:14px;padding:16px;text-align:${p.textAlign};"><div style="color:${p.iconColor};font-size:18px;">◆</div><strong style="color:${p.headingColor};">${title}</strong><div style="color:${p.bodyColor};font-size:12px;">${rest.join("::")}</div></div>`; }).join("")}</div></section>`
      );
    case "rawBlock": {
      const { safe } = sanitizeHtml(String(p.html ?? ""));
      return wrap(spec, safe);
    }
    default:
      return wrap(spec, "");
  }
}

export function generateStaticHtml(project: ProjectSpec): string {
  const specJson = JSON.stringify(project).replace(/</g, "\\u003c");
  const body = project.components.map(componentToHtml).join("\n");
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>${project.projectName}</title>
<style>
  :root { color-scheme: light; }
  body { margin: 0; font-family: system-ui, -apple-system, sans-serif; background: #f8fafc; }
  .grid { display: grid; grid-template-columns: repeat(${project.cols}, 1fr); grid-auto-rows: ${project.rowHeight}px; gap: 12px; padding: 24px; }
  .ui-block { min-width: 0; }
  table { width: 100%; border-collapse: collapse; }
  th, td { text-align: left; padding: 8px 12px; }
  .card:hover .card-reveal, .reveal:hover figcaption { opacity: 1 !important; }
</style>
</head>
<body>
<!-- This file was generated by UI Builder Studio. The script tag below embeds
     the full project spec so re-importing this exact file round-trips losslessly. -->
<script type="application/json" id="uibuilder-spec">${specJson}</script>
<div class="grid">
${body}
</div>
</body>
</html>
`;
}

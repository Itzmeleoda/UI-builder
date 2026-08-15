import type { ComponentSpec, ProjectSpec } from "../types";
import { sanitizeHtml } from "../utils/sanitize";

// Renders a single component spec to a plain HTML fragment (no framework),
// used for the standalone/static export and doubles as the file format the
// import engine round-trips against for "authored" files. Every top-level
// node carries data-ui-type / data-ui-id / data-ui-box so a re-import can
// recover structure even in heuristic (non-spec) mode.

function box(spec: ComponentSpec) {
  return `grid-column:${spec.box.x + 1}/span ${spec.box.w};grid-row:${spec.box.y + 1}/span ${spec.box.h};`;
}

function wrap(spec: ComponentSpec, inner: string, extraStyle = "") {
  const cls = spec.customClassName ? ` ${spec.customClassName}` : "";
  const custom =
    spec.customCode && spec.type !== "rawBlock"
      ? `<div class="ui-custom-code">${sanitizeHtml(spec.customCode).safe}</div>`
      : "";
  return `<div data-ui-type="${spec.type}" data-ui-id="${spec.id}" data-ui-box='${JSON.stringify(spec.box)}' class="ui-block${cls}" style="${box(spec)}${extraStyle}">${inner}${custom}</div>`;
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
    case "button":
      return wrap(spec, `<button style="background:${p.background};color:${p.textColor};border-radius:${p.borderRadius}px;padding:${p.paddingY}px ${p.paddingX}px;border:none;">${p.label}</button>`);
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

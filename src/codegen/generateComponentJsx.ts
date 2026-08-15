import type { ComponentSpec } from "../types";

// ─────────────────────────────────────────────────────────────────────────
// Deterministic spec -> JSX codegen. Same spec always produces the same
// string (no randomness, no LLM). One function per component type.
// Exact numeric/color/timing values are emitted as inline style (Tailwind's
// fixed scale can't express arbitrary ms/px/color tokens faithfully), while
// structural/utility classes come from Tailwind.
// ─────────────────────────────────────────────────────────────────────────

function cls(spec: ComponentSpec, base: string) {
  return [base, spec.customClassName ?? ""].filter(Boolean).join(" ");
}

function esc(v: unknown): string {
  return String(v ?? "").replace(/`/g, "\`").replace(/\$\{/g, "\${");
}

const shadowExpr = (v: unknown) =>
  v === "none" ? "none" : v === "sm" ? "0 1px 2px rgba(0,0,0,.06)" : v === "lg" ? "0 10px 25px rgba(0,0,0,.12)" : v === "xl" ? "0 20px 40px rgba(0,0,0,.16)" : "0 4px 10px rgba(0,0,0,.08)";

function iconJsx(name: string, size = 16) {
  // Emit a small inline SVG for the exported app so it needs no icon package.
  const paths: Record<string, string> = {
    star: "M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.3 6.6 19.5l1.2-6L3.3 9.3l6.1-.7z",
    heart: "M12 21s-7.5-4.6-10-9.2C.4 8.2 2.6 4.5 6.2 4.5c2.2 0 3.9 1.1 5.8 3 1.9-1.9 3.6-3 5.8-3 3.6 0 5.8 3.7 4.2 7.3C19.5 16.4 12 21 12 21z",
    check: "M20 6L9 17l-5-5",
    "check-circle": "M22 11.1V12a10 10 0 1 1-5.9-9.1M22 4L12 14l-3-3",
    plus: "M12 5v14M5 12h14",
    "arrow-right": "M5 12h14M13 6l6 6-6 6",
    cart: "M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6",
    user: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
    users: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8",
    settings: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
    bell: "M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0",
    mail: "M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM22 6l-10 7L2 6",
    phone: "M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.7 2z",
    "map-pin": "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0zM12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
    globe: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c2.5 2.5 3.8 5.6 3.8 9S14.5 18.5 12 21c-2.5-2.5-3.8-5.6-3.8-9S9.5 5.5 12 3z",
    rocket: "M4.5 16.5c-1.5 1.3-2 5-2 5s3.7-.5 5-2c.7-.8.7-2 0-2.8-.8-.7-2-.7-3 0zM12 15l-3-3a22 22 0 0 1 2-3.9A12.9 12.9 0 0 1 22 2c0 2.7-.8 7.5-6 11a22.4 22.4 0 0 1-4 2zM9 12H4s.5-4.1 4-4.7M12 15v5s4.1-.5 4.7-4",
    zap: "M13 2L4 14h6l-1 8 9-12h-6z",
    camera: "M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2zM12 17a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9z",
    music: "M9 18V5l12-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zm12-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0z",
    play: "M5 3l14 9-14 9V3z",
    search: "M21 21l-4.35-4.35M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z",
    calendar: "M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z",
    clock: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2",
    "thumbs-up": "M7 10v12M15 5.9L14 10h5.8a2 2 0 0 1 2 2.3l-1.4 7a2 2 0 0 1-2 1.7H7a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2zM7 10H3",
    lock: "M5 11h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2zM7 11V7a5 5 0 0 1 10 0v4",
    download: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3",
    upload: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12",
    share: "M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13",
    link: "M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7",
    flag: "M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7",
    award: "M12 15a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM8.2 13.9L7 23l5-3 5 3-1.2-9.1",
    bookmark: "M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z",
    filter: "M22 3H2l8 9.5V19l4 2v-8.5z",
    folder: "M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z",
    home: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM9 22V12h6v10",
    info: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 16v-4M12 8h.01",
    message: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
    moon: "M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z",
    sun: "M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4",
    trash: "M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2",
    pencil: "M17 3a2.8 2.8 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z",
    eye: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
    gift: "M20 12v10H4V12M2 7h20v5H2zM12 22V7M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z",
    key: "M21 2l-2 2m-7.6 7.6a5.5 5.5 0 1 1-7.8 7.8 5.5 5.5 0 0 1 7.8-7.8zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4",
    menu: "M3 12h18M3 6h18M3 18h18",
    package: "M16.5 9.4L7.5 4.2M21 16V8a2 2 0 0 0-1-1.7l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.7l7 4a2 2 0 0 0 2 0l7-4a2 2 0 0 0 1-1.7zM3.3 7L12 12l8.7-5M12 22V12",
    refresh: "M23 4v6h-6M1 20v-6h6M3.5 9a9 9 0 0 1 14.9-3.4L23 10M1 14l4.6 4.4A9 9 0 0 0 20.5 15",
    send: "M22 2L11 13M22 2l-7 20-4-9-9-4z",
    tag: "M20.6 13.4L11 3H4v7l9.6 10.4a2 2 0 0 0 2.8 0l4.2-4.2a2 2 0 0 0 0-2.8zM7 7h.01",
    target: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12zM12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
    "trending-up": "M23 6l-9.5 9.5-5-5L1 18M17 6h6v6",
    video: "M23 7l-7 5 7 5V7zM14 5H3a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2z",
    wifi: "M5 12.6a11 11 0 0 1 14 0M8.5 16.1a6 6 0 0 1 7 0M12 20h.01M2 8.8a16 16 0 0 1 20 0",
    shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
    sparkles: "M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9zM19 15l.9 2.4L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.6zM5 3l.7 1.8L7.5 5.5l-1.8.7L5 8l-.7-1.8L2.5 5.5l1.8-.7z",
    layers: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
    code: "M16 18l6-6-6-6M8 6l-6 6 6 6",
    database: "M12 8c4.4 0 8 1.3 8 3s-3.6 3-8 3-8-1.3-8-3 3.6-3 8-3zM4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5c0-1.7-3.6-3-8-3S4 3.3 4 5z",
    cloud: "M18 10h-1.3A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z",
    headset: "M3 18v-6a9 9 0 0 1 18 0v6M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z",
    lightbulb: "M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.4 1 2.3h6c0-.9.4-1.8 1-2.3A7 7 0 0 0 12 2z",
    leaf: "M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10zM2 21c0-3 1.9-5.5 5-7",
    flame: "M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.4-.5-2-1-3-1.1-2.2-.8-3.6.5-5 .6 1.4 1.5 2.3 2.5 3.5 1 1.1 1.5 2.4 1.5 4a4 4 0 0 1-4 4c-.7 0-1.3-.2-2-.5z",
    coffee: "M17 8h1a4 4 0 1 1 0 8h-1M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4zM6 2v3M10 2v3M14 2v3",
    trophy: "M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.7V17c0 1.5-2.5 2-2.5 3M14 14.7V17c0 1.5 2.5 2 2.5 3M6 4h12v5a6 6 0 0 1-12 0z",
    book: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z",
    "chart-line": "M3 3v18h18M18 17V9M13 17V5M8 17v-3",
    wallet: "M21 12V7H5a2 2 0 0 1 0-4h14v4M3 5v14a2 2 0 0 0 2 2h16v-5M18 12a2 2 0 0 0 0 4h4v-4z",
    briefcase: "M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16M2 9h20v11a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2zM22 9a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z",
    smile: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01",
  };
  const d = paths[name] ?? paths.star!;
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="${d}"/></svg>`;
}

const fontSizePxExpr = (v: unknown) => ({ sm: 12, md: 14, lg: 17 }[String(v)] ?? 14);
const textAlignExpr = (v: unknown) => (String(v ?? "left") === "center" ? '"center"' : String(v) === "right" ? '"right"' : '"left"');

export function generateComponentJsx(spec: ComponentSpec): string {
  const p = spec.params as any;
  const varName = `${spec.type}_${spec.id.slice(0, 6)}`;

  switch (spec.type) {
    case "container":
      return `<div className="${cls(spec, "flex w-full h-full")}" style={{
        flexDirection: "${p.direction}",
        gap: ${p.gap},
        padding: ${p.padding},
        alignItems: "${p.align}",
        justifyContent: "${p.justify === "between" ? "space-between" : p.justify === "around" ? "space-around" : p.justify}",
        background: "${p.background}",
        borderRadius: ${p.borderRadius},
        maxWidth: "${p.maxWidth}",
        border: "${p.borderStyle && p.borderStyle !== "none" ? `${p.borderWidth ?? 1}px ${p.borderStyle} ${p.borderColor}` : "none"}",
        boxShadow: "${shadowExpr(p.shadow)}",
      }}>{/* child components render here */}</div>`;

    case "navbar":
      return `function ${varName}() {
  const links = ${JSON.stringify(p.links)};
  const dark = ${JSON.stringify(p.variant)} === "dark";
  return (
    <header className="${cls(spec, "flex items-center justify-between px-6 h-full")}" style={{
      background: ${JSON.stringify(p.variant)} === "glass" ? "rgba(255,255,255,.65)" : "${p.background}",
      backdropFilter: ${JSON.stringify(p.variant)} === "glass" ? "blur(10px)" : "none",
      color: "${p.textColor}",
      boxShadow: "${shadowExpr(p.shadow)}",
      fontFamily: "${esc(p.textFont)}",
      position: ${p.sticky} ? "sticky" : "static", top: 0, zIndex: 30,
    }}>
      <span className="font-bold" style={{ color: dark ? "${p.textColor}" : "#111827" }}>${esc(p.logoText)}</span>
      <nav className="flex gap-6">
        {links.map((link, i) => <a key={i} href="#" style={{ color: "${p.textColor}" }}>{link}</a>)}
      </nav>
      ${p.ctaLabel ? `<a href="#" style={{ background: "${p.ctaBackground}", color: "${p.ctaTextColor}", padding: "8px 16px", borderRadius: 8 }}>${esc(p.ctaLabel)}</a>` : ""}
    </header>
  );
}`;

    case "footer":
      return `function ${varName}() {
  const columns = ${JSON.stringify((p.columns ?? []).map((l: string) => { const [t, ls] = l.split("::"); return { title: t?.trim() ?? "", links: (ls ?? "").split(",").map((x) => x.trim()).filter(Boolean) }; }))};
  return (
    <footer className="${cls(spec, "w-full h-full px-8 py-6")}" style={{ background: "${p.background}", fontFamily: "${esc(p.textFont)}", borderTop: "1px solid ${p.borderColor}" }}>
      <div className="flex gap-10 h-full">
        <div style={{ maxWidth: 200 }}>
          <div style={{ color: "${p.textColor}", fontWeight: 700 }}>${esc(p.brandName)}</div>
          <p style={{ color: "${p.mutedColor}", fontSize: 12 }}>${esc(p.tagline)}</p>
          ${p.showSocial ? `<div className="flex gap-2 mt-2">
            {[0, 1, 2].map((i) => (
              <span key={i} style={{ background: ${JSON.stringify(p.socialStyle)} === "minimal" ? "transparent" : "${p.accentColor}", borderRadius: ${JSON.stringify(p.socialStyle)} === "square" ? 4 : 999, width: 24, height: 24, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "${p.textColor}" }}>{"𝕏ing"[i]}</span>
            ))}
          </div>` : ""}
        </div>
        <div className="flex gap-10 flex-wrap flex-1">
          {columns.map((col, i) => (
            <div key={i}>
              <div style={{ color: "${p.accentColor}", fontSize: 11, fontWeight: 600, textTransform: "uppercase" }}>{col.title}</div>
              {col.links.map((link, j) => <div key={j} style={{ color: "${p.mutedColor}", fontSize: 12, marginTop: 6 }}>{link}</div>)}
            </div>
          ))}
        </div>
      </div>
      <div style={{ color: "${p.mutedColor}", fontSize: 11, marginTop: 16, paddingTop: 8, borderTop: "1px solid ${p.borderColor}" }}>© 2026 ${esc(p.brandName)}. All rights reserved.</div>
    </footer>
  );
}`;

    case "hero":
      return `function ${varName}() {
  return (
    <section className="${cls(spec, "w-full h-full relative overflow-hidden flex items-center")}" style={{
      background: ${JSON.stringify(p.layout)} === "image" && ${JSON.stringify(!!p.imageUrl)} ? undefined : "${p.background}",
      borderRadius: ${p.borderRadius},
      padding: 32,
      justifyContent: ${JSON.stringify(p.layout)} === "center" ? "center" : "space-between",
    }}>
      {${JSON.stringify(p.layout)} === "image" && ${JSON.stringify(!!p.imageUrl)} && <img src="${esc(p.imageUrl)}" alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />}
      {${JSON.stringify(p.layout)} === "image" && <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.45)" }} />}
      <div className="relative z-10" style={{ display: "flex", flexDirection: ${JSON.stringify(p.layout)} === "center" ? "column" : "row", alignItems: ${JSON.stringify(p.layout)} === "center" ? "center" : "flex-start", justifyContent: "space-between", width: "100%", gap: 24 }}>
        <div style={{ textAlign: ${textAlignExpr(p.align)}, maxWidth: 560 }}>
          <h1 style={{ color: "${p.textColor}", fontFamily: "${esc(p.textFont)}", fontSize: 34, fontWeight: 800, lineHeight: 1.15 }}>${esc(p.headline)}</h1>
          <p style={{ color: "${p.mutedColor}", fontFamily: "${esc(p.textFont)}", fontSize: 15, marginTop: 12 }}>${esc(p.subheadline)}</p>
          <div className="flex gap-3 mt-6 flex-wrap">
            <a href="#" style={{ background: "${p.accentColor}", color: "${p.accentTextColor}", padding: "12px 22px", borderRadius: 10, fontWeight: 600 }}>${esc(p.ctaPrimary)}</a>
            ${p.ctaSecondary ? `<a href="#" style={{ color: "${p.textColor}", padding: "12px 22px", borderRadius: 10, fontWeight: 600, border: "1.5px solid ${p.textColor}44" }}>${esc(p.ctaSecondary)}</a>` : ""}
          </div>
        </div>
        {${JSON.stringify(p.layout)} !== "center" && ${JSON.stringify(!!p.imageUrl)} && <img src="${esc(p.imageUrl)}" alt="" style={{ width: "40%", height: "85%", objectFit: "cover", borderRadius: 14, boxShadow: "0 20px 40px rgba(0,0,0,.16)" }} />}
      </div>
    </section>
  );
}`;

    case "divider":
      return `function ${varName}() {
  const line = { borderTop: "${p.thickness}px ${p.style === "gradient" ? "solid" : p.style} ${p.color}" };
  const label = ${p.label ? `<span style={{ color: "${p.textColor}", fontSize: 12, padding: "0 12px", whiteSpace: "nowrap", fontFamily: "${esc(p.textFont)}" }}>${esc(p.label)}</span>` : "null"};
  return (
    <div className="${cls(spec, "w-full h-full flex items-center")}">
      {label && ${JSON.stringify(p.labelPosition)} === "left" ? label : null}
      <div className="flex-1" style={line} />
      {label && ${JSON.stringify(p.labelPosition)} === "center" ? label : null}
      {label && ${JSON.stringify(p.labelPosition)} === "center" ? <div className="flex-1" style={line} /> : null}
      {label && ${JSON.stringify(p.labelPosition)} === "right" ? label : null}
    </div>
  );
}`;

    case "stickyHeader":
      return `function ${varName}() {
  const [scrolled, setScrolled] = React.useState(false);
  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <header className="${cls(spec, "sticky top-0 z-40 flex items-center justify-between px-6")}" style={{
      background: "${p.background}",
      height: scrolled && ${p.shrinkOnScroll} ? 56 : 72,
      backdropFilter: scrolled && ${p.blurOnScroll} ? "blur(8px)" : "none",
      boxShadow: scrolled && ${p.shadowOnScroll} ? "0 2px 10px rgba(0,0,0,.08)" : "none",
      transition: \`all ${p.durationMs}ms ${p.easing}\`,
      fontFamily: "${esc(p.textFont)}",
    }}>
      <span className="font-bold" style={{ color: "${p.textColor}" }}>${esc(p.logoText)}</span>
      <nav className="flex gap-6">
        {${JSON.stringify(p.links)}.map((link, i) => <a key={i} href="#" style={{ color: "${p.linkColor}" }}>{link}</a>)}
      </nav>
      ${p.ctaLabel ? `<a href="#" style={{ background: "${p.ctaBackground}", color: "${p.ctaTextColor}", padding: "8px 14px", borderRadius: 8, fontSize: 13 }}>${esc(p.ctaLabel)}</a>` : ""}
    </header>
  );
}`;

    case "pageTransition":
      return `function ${varName}({ children }) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  const hidden = "${p.transitionStyle}".includes("slide") ? \`translateY(${p.distancePx}px)\` : "translateY(0)";
  return (
    <div className="${cls(spec, "w-full h-full")}" style={{
      opacity: mounted ? 1 : 0,
      transform: mounted ? "translateY(0) scale(1)" : "${p.transitionStyle}".includes("scale") ? "scale(.96)" : hidden,
      transition: \`all ${p.durationMs}ms ${p.easing}\`,
    }}>
      {children}
    </div>
  );
}`;

    case "tabs":
      return `function ${varName}() {
  const [active, setActive] = React.useState(${p.activeIndex ?? 0});
  const tabs = ${JSON.stringify(p.tabs)};
  const variant = ${JSON.stringify(p.variant)};
  return (
    <div className="${cls(spec, "w-full")}">
      <div className={${JSON.stringify("flex " + (p.orientation === "vertical" ? "flex-col" : "flex-row") + " gap-1 border-b border-gray-200")}}>
        {tabs.map((label, i) => (
          <button key={i} onClick={() => setActive(i)}
            style={{
              color: i === active ? "${p.activeTextColor}" : "${p.inactiveTextColor}",
              background: (variant === "pills" || variant === "boxed") ? (i === active ? "${p.indicatorColor}" : variant === "boxed" ? "#f3f4f6" : "transparent") : "transparent",
              borderRadius: variant === "pills" ? 999 : variant === "boxed" ? "8px 8px 0 0" : 0,
              borderBottom: variant === "underline" ? (i === active ? "2px solid ${p.indicatorColor}" : "2px solid transparent") : "none",
              padding: "${p.paddingY}px 14px",
              fontSize: ${fontSizePxExpr(p.fontSize)},
              fontFamily: "${esc(p.textFont)}",
              transition: \`all ${p.durationMs}ms ${p.easing}\`,
            }}
            className="font-medium">
            {label}
          </button>
        ))}
      </div>
      <div className="p-4" style={{ transition: \`opacity ${p.durationMs}ms ${p.easing}\` }}>
        Content for {tabs[active]}
      </div>
    </div>
  );
}`;

    case "card":
      return `function ${varName}() {
  const [hovered, setHovered] = React.useState(false);
  return (
    <div className="${cls(spec, "relative overflow-hidden w-full h-full")}"
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{
        background: "${p.background}",
        borderRadius: ${p.borderRadius},
        boxShadow: "${shadowExpr(p.shadow)}",
        transform: hovered ? "${p.transform}" : "none",
        transition: \`transform ${p.durationMs}ms ${p.easing}\`,
      }}>
      ${p.imageUrl && Number(p.imageHeightPct) > 0 ? `<img src="${esc(p.imageUrl)}" alt="${esc(p.title)}" className="w-full object-cover" style={{ height: "${p.imageHeightPct}%" }} />` : ""}
      <div style={{ padding: ${p.padding}, textAlign: ${textAlignExpr(p.textAlign)}, fontFamily: "${esc(p.textFont)}" }}>
        <h3 className="font-semibold" style={{ fontSize: ${fontSizePxExpr(p.titleSize)} }}>${esc(p.title)}</h3>
        <p className="mt-1" style={{ fontSize: 13, color: "#6b7280" }}>${esc(p.body)}</p>
      </div>
      ${p.hoverReveal ? `<div className="absolute inset-0 flex items-center justify-center"
        style={{
          background: "${p.revealBackground}",
          color: "${p.revealTextColor}",
          opacity: hovered ? 1 : 0,
          transition: \`opacity ${p.durationMs}ms ${p.easing}\`,
          pointerEvents: hovered ? "auto" : "none",
        }}>${esc(p.revealContent)}</div>` : ""}
    </div>
  );
}`;

    case "imageHover":
      return `function ${varName}() {
  const [hovered, setHovered] = React.useState(false);
  const pos = ${JSON.stringify(p.captionPosition)};
  return (
    <div className="${cls(spec, "relative overflow-hidden w-full h-full")}"
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ borderRadius: ${p.borderRadius} }}>
      <img src="${esc(p.imageUrl)}" alt="${esc(p.caption)}" className="w-full h-full"
        style={{
          objectFit: "${p.objectFit}",
          transform: hovered ? "scale(${p.zoomScale})" : "scale(1)",
          transition: \`transform ${p.durationMs}ms ${p.easing}\`,
        }} />
      <div className="absolute inset-0 flex p-4" style={{
        background: "${p.overlayColor}",
        alignItems: pos === "top" ? "flex-start" : pos === "center" ? "center" : "flex-end",
        justifyContent: pos === "center" ? "center" : "flex-start",
        textAlign: ${textAlignExpr(p.textAlign)},
        opacity: hovered ? 1 : 0,
        transition: \`opacity ${p.durationMs}ms ${p.easing}\`,
        pointerEvents: "none",
        fontFamily: "${esc(p.textFont)}",
      }}>
        <span style={{ color: "${p.captionColor}" }}>${esc(p.caption)}</span>
      </div>
    </div>
  );
}`;

    case "carousel":
      return `function ${varName}() {
  const slides = ${JSON.stringify(p.slides)};
  const [index, setIndex] = React.useState(0);
  React.useEffect(() => {
    if (!${p.autoplay}) return;
    const id = setInterval(() => setIndex((i) => (${p.loop} ? (i + 1) % slides.length : Math.min(i + 1, slides.length - 1))), ${p.intervalMs});
    return () => clearInterval(id);
  }, []);
  return (
    <div className="${cls(spec, "relative w-full h-full overflow-hidden rounded-xl bg-gray-100")}">
      <div className="flex h-full" style={{ transform: \`translateX(-\${index * 100}%)\`, transition: \`transform ${p.durationMs}ms ${p.easing}\` }}>
        {slides.map((s, i) => (
          <div key={i} className="w-full h-full flex-shrink-0 flex items-center justify-center font-medium" style={{ fontSize: ${fontSizePxExpr(p.fontSize)}, textAlign: ${textAlignExpr(p.textAlign)}, padding: ${p.slidePadding}, fontFamily: "${esc(p.textFont)}" }}>{s}</div>
        ))}
      </div>
      ${p.showDots ? `<div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, i) => (
          <button key={i} onClick={() => setIndex(i)} style={{ background: i === index ? "${p.dotColor}" : "#d1d5db" }} className="w-2 h-2 rounded-full" />
        ))}
      </div>` : ""}
    </div>
  );
}`;

    case "searchBar":
      return `function ${varName}() {
  return (
    <div className="${cls(spec, "flex items-center w-full")}" style={{
      background: "${p.background}", borderRadius: ${p.rounded}, padding: "8px 16px",
      border: "1px solid ${p.borderColor}",
      transition: \`box-shadow ${p.durationMs}ms ${p.easing}\`,
      fontFamily: "${esc(p.textFont)}",
    }}>
      ${p.showIcon ? `<svg className="mr-2 opacity-60" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.35-4.35"/></svg>` : ""}
      <input placeholder="${esc(p.placeholder)}" style={{ color: "${p.textColor}", background: "transparent", outline: "none", width: "100%", fontSize: ${fontSizePxExpr(p.size)} }} />
    </div>
  );
}`;

    case "table":
      return `function ${varName}() {
  const columns = ${JSON.stringify(p.columns)};
  const rows = ${JSON.stringify(p.rows)};
  return (
    <div className="${cls(spec, "w-full h-full overflow-auto")}">
      <table className="w-full border-collapse" style={{ fontSize: ${fontSizePxExpr(p.fontSize)}, fontFamily: "${esc(p.textFont)}" }}>
        <thead>
          <tr style={{ background: "${p.headerBackground}", color: "${p.headerTextColor}" }}>
            {columns.map((c, i) => <th key={i} style={{ textAlign: ${textAlignExpr(p.headerAlign)}, padding: ${p.cellPadding} }}>{c}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} style={{ background: ${p.striped} && ri % 2 === 1 ? "#f9fafb" : "transparent" }}
              className="border-b" >
              {row.map((cell, ci) => <td key={ci} style={{ padding: ${p.cellPadding}, borderColor: "${p.borderColor}" }}>{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}`;

    case "button":
      return `function ${varName}() {
  const [hovered, setHovered] = React.useState(false);
  const sizePad = { sm: [10, 14], md: [${p.paddingY}, ${p.paddingX}], lg: [${p.paddingY + 4}, ${p.paddingX + 8}] }[${JSON.stringify(p.size)}];
  const sizeText = { sm: 11, md: 13, lg: 15 }[${JSON.stringify(p.size)}] ?? 13;
  return (
    <div className="${cls(spec, "w-full h-full flex items-center justify-center")}">
      <button
        onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
        style={{
          width: ${p.fullWidth} ? "100%" : "auto",
          background: ${JSON.stringify(p.variant)} === "gradient" ? \`linear-gradient(120deg, ${p.background}, ${p.hoverBackground})\` : hovered && ${JSON.stringify(p.variant)} === "solid" ? "${p.hoverBackground}" : ${JSON.stringify(p.variant)} === "solid" ? "${p.background}" : "transparent",
          color: ${JSON.stringify(p.variant)} === "solid" || ${JSON.stringify(p.variant)} === "gradient" ? "${p.textColor}" : "${p.background}",
          border: ${JSON.stringify(p.variant)} === "outline" ? "${p.borderWidth}px solid ${p.background}" : "none",
          borderRadius: ${p.borderRadius},
          padding: \`\${sizePad[0]}px \${sizePad[1]}px\`,
          fontSize: sizeText,
          fontWeight: ${p.fontWeight},
          fontFamily: "${esc(p.textFont)}",
          boxShadow: "${shadowExpr(p.shadow)}",
          transform: hovered ? "${p.transform}" : "none",
          transition: \`all ${p.durationMs}ms ${p.easing}\`,
        }}>
        <span className="inline-flex items-center gap-1.5">
          ${p.icon && p.iconPosition !== "right" ? iconJsx(String(p.icon), 14) : ""}
          ${esc(p.label)}
          ${p.icon && p.iconPosition === "right" ? iconJsx(String(p.icon), 14) : ""}
        </span>
      </button>
    </div>
  );
}`;

    case "modal":
      return `function ${varName}() {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} className="px-4 py-2 rounded-lg bg-indigo-600 text-white">Open modal</button>
      {open && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: "${p.overlayColor}", backdropFilter: "blur(${p.backdropBlur}px)" }}
          onClick={() => ${p.closeOnOverlayClick} && setOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} className="${cls(spec, "p-6 w-full max-w-md")}" style={{
            background: "${p.panelBackground}", borderRadius: ${p.borderRadius},
            transition: \`all ${p.durationMs}ms ${p.easing}\`,
            fontFamily: "${esc(p.textFont)}",
          }}>
            ${p.showCloseButton ? `<div className="flex justify-end"><button onClick={() => setOpen(false)}>✕</button></div>` : ""}
            <h3 className="text-lg font-semibold mb-2">${esc(p.title)}</h3>
            <p className="text-sm text-gray-500">${esc(p.body)}</p>
          </div>
        </div>
      )}
    </>
  );
}`;

    case "accordion":
      return `function ${varName}() {
  const items = ${JSON.stringify(p.items)};
  const [open, setOpen] = React.useState(${JSON.stringify(p.allowMultipleOpen ? [] : Number(p.initialOpenIndex ?? 0))});
  const toggle = (i) => {
    if (${p.allowMultipleOpen}) {
      setOpen((prev) => prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]);
    } else {
      setOpen((prev) => (prev === i ? -1 : i));
    }
  };
  const isOpen = (i) => ${p.allowMultipleOpen} ? open.includes(i) : open === i;
  return (
    <div className="${cls(spec, "w-full divide-y")}" style={{ borderColor: "${p.dividerColor}" }}>
      {items.map((item, i) => (
        <div key={i}>
          <button onClick={() => toggle(i)} className="w-full text-left py-3 font-medium flex justify-between" style={{ color: "${p.headerTextColor}", fontSize: ${fontSizePxExpr(p.fontSize)}, fontFamily: "${esc(p.textFont)}" }}>
            {item.title}
            <span style={{ transition: \`transform ${p.durationMs}ms ${p.easing}\`, transform: isOpen(i) ? "rotate(180deg)" : "rotate(0)" }}>⌄</span>
          </button>
          <div style={{ maxHeight: isOpen(i) ? 200 : 0, overflow: "hidden", transition: \`max-height ${p.durationMs}ms ${p.easing}\` }}>
            <p className="pb-3" style={{ color: "${p.bodyTextColor}", fontSize: 13, fontFamily: "${esc(p.textFont)}" }}>{item.body}</p>
          </div>
        </div>
      ))}
    </div>
  );
}`;

    case "dropdown":
      return `function ${varName}() {
  const items = ${JSON.stringify(p.items)};
  const [open, setOpen] = React.useState(false);
  return (
    <div className="${cls(spec, "relative w-full h-full flex flex-col items-center justify-center")}">
      <button
        onClick={() => setOpen((o) => !o)}
        onMouseEnter={() => ${JSON.stringify(p.openOn)} === "hover" && setOpen(true)}
        onMouseLeave={() => ${JSON.stringify(p.openOn)} === "hover" && setOpen(false)}
        className="flex items-center gap-1.5 font-medium"
        style={{
          padding: "8px 16px", borderRadius: ${p.rounded},
          background: ${JSON.stringify(p.variant)} === "solid" ? "${p.background}" : "transparent",
          color: ${JSON.stringify(p.variant)} === "solid" ? "${p.textColor}" : "${p.background}",
          border: ${JSON.stringify(p.variant)} === "outline" ? "1.5px solid ${p.background}" : "none",
          fontFamily: "${esc(p.textFont)}",
        }}>
        ${esc(p.buttonLabel)} <span style={{ transition: \`transform ${p.durationMs}ms ${p.easing}\`, transform: open ? "rotate(180deg)" : "none" }}>⌄</span>
      </button>
      {open && (
        <div className="absolute top-full mt-1 left-3 right-3 rounded-lg shadow-xl z-30 overflow-hidden" style={{ background: "${p.menuBackground}", border: "1px solid ${p.borderColor}" }}>
          {items.map((item, i) => (
            <div key={i} onClick={() => setOpen(false)} style={{ padding: "8px 12px", fontSize: 13, color: "${p.menuTextColor}", cursor: "pointer", fontFamily: "${esc(p.textFont)}" }}>{item}</div>
          ))}
        </div>
      )}
    </div>
  );
}`;

    case "toggle":
      return `function ${varName}() {
  const [checked, setChecked] = React.useState(${p.checked});
  const dims = { sm: [32, 18, 14], md: [42, 24, 20], lg: [54, 30, 26] }[${JSON.stringify(p.size)}];
  return (
    <div className="${cls(spec, "w-full h-full flex items-center justify-center gap-2.5")}">
      ${p.label && p.labelPosition === "left" ? `<span style={{ color: "${p.textColor}", fontFamily: "${esc(p.textFont)}", fontSize: 13 }}>${esc(p.label)}</span>` : ""}
      <button role="switch" aria-checked={checked} onClick={() => setChecked((v) => !v)}
        style={{ width: dims[0], height: dims[1], borderRadius: 999, background: checked ? "${p.onColor}" : "${p.offColor}", transition: \`background ${p.durationMs}ms ${p.easing}\`, position: "relative", border: "none", cursor: "pointer" }}>
        <span style={{ position: "absolute", width: dims[2], height: dims[2], borderRadius: 999, background: "${p.knobColor}", top: (dims[1] - dims[2]) / 2, left: checked ? dims[0] - dims[2] - 2 : 2, transition: \`left ${p.durationMs}ms ${p.easing}\` }} />
      </button>
      ${p.label && p.labelPosition !== "left" ? `<span style={{ color: "${p.textColor}", fontFamily: "${esc(p.textFont)}", fontSize: 13 }}>${esc(p.label)}</span>` : ""}
    </div>
  );
}`;

    case "slider":
      return `function ${varName}() {
  const [value, setValue] = React.useState(${p.value});
  const min = ${p.min}, max = ${p.max};
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="${cls(spec, "w-full h-full flex items-center gap-3 px-3")}">
      ${p.label ? `<span style={{ color: "${p.textColor}", fontFamily: "${esc(p.textFont)}", fontSize: 13 }}>${esc(p.label)}</span>` : ""}
      <input type="range" min={min} max={max} step={${p.step}} value={value} onChange={(e) => setValue(Number(e.target.value))} className="flex-1" style={{ accentColor: "${p.color}" }} />
      ${p.showValue ? `<span style={{ fontFamily: "monospace", fontSize: 12, color: "${p.textColor}" }}>{value}</span>` : ""}
    </div>
  );
}`;

    case "tooltip":
      return `function ${varName}() {
  const [visible, setVisible] = React.useState(false);
  const pos = ${JSON.stringify(p.position)};
  const posClass = { top: "bottom-full mb-1.5", bottom: "top-full mt-1.5", left: "right-full mr-1.5", right: "left-full ml-1.5" }[pos];
  return (
    <div className="${cls(spec, "w-full h-full flex items-center justify-center")}">
      <div className="relative inline-block">
        <span className="underline decoration-dotted underline-offset-4 cursor-help" style={{ fontFamily: "${esc(p.textFont)}", fontSize: 14 }}
          onMouseEnter={() => setVisible(true)} onMouseLeave={() => setVisible(false)}>
          ${esc(p.anchorText)}
        </span>
        {visible && (
          <div className={\`absolute z-30 whitespace-nowrap px-2.5 py-1.5 \${posClass}\`} style={{ background: "${p.background}", color: "${p.textColor}", borderRadius: ${p.rounded}, fontFamily: "${esc(p.textFont)}", fontSize: 12 }}>
            ${esc(p.text)}
          </div>
        )}
      </div>
    </div>
  );
}`;

    case "stepper":
      return `function ${varName}() {
  const steps = ${JSON.stringify(p.steps)};
  const current = ${p.current};
  return (
    <div className="${cls(spec, "w-full h-full flex items-center")}" style={{ fontFamily: "${esc(p.textFont)}" }}>
      {steps.map((step, i) => {
        const done = i < current;
        const active = i === current;
        const color = done ? "${p.doneColor}" : active ? "${p.activeColor}" : "${p.inactiveColor}";
        return (
          <div key={i} className="flex items-center flex-1">
            {i > 0 && <div className="flex-1 mx-1" style={{ height: 2, background: i <= current ? "${p.doneColor}" : "${p.connectorColor}" }} />}
            <div className="flex items-center gap-1.5">
              <span style={{ width: 24, height: 24, borderRadius: 999, background: color, color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600 }}>
                {done ? "✓" : ${p.showNumbers} ? i + 1 : "•"}
              </span>
              <span style={{ fontSize: 12, fontWeight: 500, color: active || done ? "${p.textColor}" : "#9ca3af" }}>{step}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}`;

    case "segmentedControl":
      return `function ${varName}() {
  const options = ${JSON.stringify(p.options)};
  const [selected, setSelected] = React.useState(${p.selected ?? 0});
  return (
    <div className="${cls(spec, "w-full h-full flex items-center px-2")}">
      <div className="flex w-full p-1" style={{ background: "${p.background}", borderRadius: ${p.rounded} }}>
        {options.map((option, i) => (
          <button key={i} onClick={() => setSelected(i)} className="flex-1 font-medium"
            style={{
              padding: "6px 10px", fontSize: 12, border: "none", cursor: "pointer",
              background: i === selected ? "${p.activeBackground}" : "transparent",
              color: i === selected ? "${p.activeTextColor}" : "${p.textColor}",
              borderRadius: Math.max(0, ${p.rounded} - 4),
              boxShadow: i === selected ? "0 1px 3px rgba(0,0,0,.12)" : "none",
              transition: \`all ${p.durationMs}ms ${p.easing}\`,
              fontFamily: "${esc(p.textFont)}",
            }}>
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}`;

    case "avatar":
      return `function ${varName}() {
  const radius = ${JSON.stringify(p.shape)} === "circle" ? "50%" : ${JSON.stringify(p.shape)} === "rounded" ? "30%" : "8%";
  return (
    <div className="${cls(spec, "w-full h-full flex items-center justify-center")}">
      <div style={{ position: "relative", width: ${p.size}, height: ${p.size} }}>
        ${p.imageUrl ? `<img src="${esc(p.imageUrl)}" alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: radius, boxShadow: "0 0 0 ${p.ringWidth}px ${p.ringColor}" }} />` : `<div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: radius, background: "${p.background}", color: "${p.textColor}", boxShadow: "0 0 0 ${p.ringWidth}px ${p.ringColor}", fontWeight: 600, fontFamily: "${esc(p.textFont)}" }}>${esc(String(p.name ?? "A").slice(0, 2).toUpperCase())}</div>`}
        ${p.showStatus ? `<span style={{ position: "absolute", right: 0, bottom: 0, width: ${Math.round(Number(p.size) * 0.28)}, height: ${Math.round(Number(p.size) * 0.28)}, borderRadius: 999, background: "${p.statusColor}", border: "2px solid #fff" }} />` : ""}
      </div>
    </div>
  );
}`;

    case "badge":
      return `function ${varName}() {
  return (
    <div className="${cls(spec, "w-full h-full flex items-center justify-center")}">
      <span className="inline-flex items-center gap-1.5 font-medium" style={{
        padding: "4px 12px", fontSize: 12, borderRadius: ${p.rounded},
        background: ${JSON.stringify(p.variant)} === "solid" ? "${p.color}" : ${JSON.stringify(p.variant)} === "soft" ? "${p.color}22" : "transparent",
        color: ${JSON.stringify(p.variant)} === "solid" ? "${p.textColor}" : "${p.color}",
        border: ${JSON.stringify(p.variant)} === "outline" ? "1.5px solid ${p.color}" : "none",
        fontFamily: "${esc(p.textFont)}",
      }}>
        ${iconJsx(String(p.icon), 12)}${esc(p.text)}
      </span>
    </div>
  );
}`;

    case "rating":
      return `function ${varName}() {
  const [value, setValue] = React.useState(${p.value});
  const max = ${p.max};
  const fill = (i) => Math.min(1, Math.max(0, value - i));
  return (
    <div className="${cls(spec, "w-full h-full flex items-center justify-center gap-2")}">
      <div className="flex gap-0.5">
        {Array.from({ length: max }).map((_, i) => (
          <button key={i} onClick={() => ${p.interactive} && setValue(i + 1)} style={{ background: "none", border: "none", cursor: ${p.interactive} ? "pointer" : "default", padding: 0, position: "relative" }}>
            <span style={{ color: "${p.emptyColor}", fontSize: ${p.size}, lineHeight: 1 }}>{${JSON.stringify(p.icon)} === "heart" ? "♥" : ${JSON.stringify(p.icon)} === "thumbs-up" ? "👍" : "★"}</span>
            <span style={{ position: "absolute", inset: 0, overflow: "hidden", width: \`\${fill(i) * 100}%\`, color: "${p.color}", fontSize: ${p.size}, lineHeight: 1 }}>{${JSON.stringify(p.icon)} === "heart" ? "♥" : ${JSON.stringify(p.icon)} === "thumbs-up" ? "👍" : "★"}</span>
          </button>
        ))}
      </div>
      ${p.showValue ? `<span style={{ fontSize: 13, fontWeight: 600, color: "${p.color}" }}>{value.toFixed(1)}</span>` : ""}
    </div>
  );
}`;

    case "progress":
      return `function ${varName}() {
  const value = Math.max(0, Math.min(100, ${p.value}));
  const [animated, setAnimated] = React.useState(false);
  React.useEffect(() => { const t = setTimeout(() => setAnimated(true), 60); return () => clearTimeout(t); }, []);
  return (
    <div className="${cls(spec, "w-full h-full flex flex-col justify-center gap-1.5 px-3")}">
      ${p.showLabel ? `<div className="flex justify-between" style={{ fontSize: 12, color: "${p.textColor}", fontFamily: "${esc(p.textFont)}" }}>
        <span>${esc(p.label)}</span><span style={{ color: "${p.color}", fontWeight: 600 }}>{value}%</span>
      </div>` : ""}
      <div style={{ height: ${p.height}, borderRadius: ${p.rounded}, background: "${p.trackColor}", overflow: "hidden" }}>
        <div style={{
          width: animated ? \`\${value}%\` : "0%", height: "100%", background: "${p.color}", borderRadius: ${p.rounded},
          transition: \`width ${p.durationMs}ms ${p.easing}\`,
          backgroundImage: ${p.striped} ? "linear-gradient(45deg, rgba(255,255,255,.25) 25%, transparent 25%, transparent 50%, rgba(255,255,255,.25) 50%, rgba(255,255,255,.25) 75%, transparent 75%, transparent)" : "none",
          backgroundSize: ${p.striped} ? "20px 20px" : "auto",
        }} />
      </div>
    </div>
  );
}`;

    case "stat":
      return `function ${varName}() {
  return (
    <div className="${cls(spec, "w-full h-full flex items-center gap-3 px-4")}" style={{ background: "${p.background}", boxShadow: "${shadowExpr(p.shadow)}", borderRadius: ${p.borderRadius} }}>
      <span style={{ width: 40, height: 40, borderRadius: 10, display: "inline-flex", alignItems: "center", justifyContent: "center", background: "${p.accentColor}1f", color: "${p.accentColor}" }}>
        ${iconJsx(String(p.icon), 18)}
      </span>
      <div>
        <div style={{ fontSize: 20, fontWeight: 700, color: "${p.textColor}", fontFamily: "${esc(p.textFont)}", lineHeight: 1 }}>${esc(p.value)}</div>
        <div style={{ fontSize: 12, color: "${p.mutedColor}", fontFamily: "${esc(p.textFont)}", marginTop: 4 }}>${esc(p.label)}</div>
      </div>
      ${p.delta && p.deltaDirection !== "none" ? `<span style={{ marginLeft: "auto", fontSize: 12, fontWeight: 600, color: ${JSON.stringify(p.deltaDirection)} === "down" ? "#dc2626" : "#16a34a" }}>${JSON.stringify(p.deltaDirection)} === "down" ? "↓" : "↑" ${esc(p.delta)}</span>` : ""}
    </div>
  );
}`;

    case "testimonial":
      return `function ${varName}() {
  return (
    <figure className="${cls(spec, "w-full h-full p-5 flex flex-col")}" style={{ background: "${p.background}", borderRadius: ${p.borderRadius}, boxShadow: "${shadowExpr(p.shadow)}", fontFamily: "${esc(p.textFont)}", margin: 0 }}>
      <div className="flex gap-0.5 mb-2">
        {Array.from({ length: 5 }).map((_, i) => <span key={i} style={{ color: i < Math.round(${p.rating}) ? "${p.accentColor}" : "${p.accentColor}55", fontSize: 14 }}>★</span>)}
      </div>
      <blockquote className="flex-1" style={{ fontStyle: "italic", color: "${p.textColor}", fontSize: 14, margin: 0 }}>“${esc(p.quote)}”</blockquote>
      <figcaption className="flex items-center gap-3 mt-4">
        ${p.avatarUrl ? `<img src="${esc(p.avatarUrl)}" alt="" style={{ width: 36, height: 36, borderRadius: 999, objectFit: "cover" }} />` : `<span style={{ width: 36, height: 36, borderRadius: 999, background: "${p.accentColor}33" }} />`}
        <span>
          <span style={{ display: "block", fontWeight: 600, fontSize: 13, color: "${p.textColor}" }}>${esc(p.author)}</span>
          <span style={{ fontSize: 11, color: "${p.mutedColor}" }}>${esc(p.role)}</span>
        </span>
      </figcaption>
    </figure>
  );
}`;

    case "pricing":
      return `function ${varName}() {
  const features = ${JSON.stringify(p.features)};
  return (
    <div className="${cls(spec, "w-full h-full p-5 flex flex-col")}" style={{
      background: "${p.background}", borderRadius: ${p.borderRadius}, boxShadow: "${shadowExpr(p.shadow)}",
      border: ${p.highlighted} ? "2px solid ${p.accentColor}" : "1px solid rgba(0,0,0,.06)",
      fontFamily: "${esc(p.textFont)}",
    }}>
      <div style={{ fontWeight: 600, fontSize: 14, color: "${p.textColor}" }}>${esc(p.planName)}</div>
      <div style={{ fontSize: 11, color: "${p.mutedColor}", marginTop: 2 }}>${esc(p.description)}</div>
      <div className="flex items-baseline gap-1 mt-3">
        <span style={{ color: "${p.accentColor}", fontSize: 18, fontWeight: 700 }}>${esc(p.currency)}</span>
        <span style={{ fontSize: 32, fontWeight: 800, color: "${p.textColor}", lineHeight: 1 }}>${esc(p.price)}</span>
        <span style={{ fontSize: 12, color: "${p.mutedColor}" }}>${esc(p.period)}</span>
      </div>
      <div className="flex-1 mt-4 space-y-2">
        {features.map((feature, i) => (
          <div key={i} style={{ fontSize: 12, color: "${p.textColor}", display: "flex", gap: 6, alignItems: "center" }}>
            <span style={{ color: "${p.accentColor}" }}>✓</span>{feature}
          </div>
        ))}
      </div>
      <a href="#" style={{ marginTop: 16, display: "block", textAlign: "center", padding: "10px 16px", borderRadius: 10, fontWeight: 600, fontSize: 13, background: ${p.highlighted} ? "${p.accentColor}" : "${p.accentColor}1a", color: ${p.highlighted} ? "#fff" : "${p.accentColor}" }}>
        ${esc(p.ctaLabel)}
      </a>
    </div>
  );
}`;

    case "timeline":
      return `function ${varName}() {
  const items = ${JSON.stringify((p.items ?? []).map((it: string) => { const [d, ...r] = it.split("::"); return { date: d?.trim() ?? "", body: r.join("::").trim() }; }))};
  const horizontal = ${JSON.stringify(p.orientation)} === "horizontal";
  return (
    <div className="${cls(spec, "w-full h-full overflow-auto")}" style={{ display: "flex", flexDirection: horizontal ? "row" : "column", fontFamily: "${esc(p.textFont)}" }}>
      {items.map((item, i) => (
        <div key={i} style={{ display: "flex", flexDirection: horizontal ? "column" : "row", flex: 1, alignItems: horizontal ? "center" : "flex-start" }}>
          <span style={{ width: 14, height: 14, borderRadius: 999, background: "${p.dotColor}", border: "3px solid #fff", boxShadow: "0 0 0 2px ${p.lineColor}", flexShrink: 0, marginTop: horizontal ? 0 : 2 }} />
          {!horizontal && i < items.length - 1 && <div style={{ width: 2, background: "${p.lineColor}", flex: 1, minHeight: 14, marginLeft: 6 }} />}
          <div style={{ padding: horizontal ? "6px 8px 0" : "0 0 12px 12px", textAlign: horizontal ? "center" : "left" }}>
            <div style={{ fontWeight: 700, fontSize: 12, color: "${p.titleColor}" }}>{item.date}</div>
            <div style={{ fontSize: 12, color: "${p.bodyColor}" }}>{item.body}</div>
          </div>
        </div>
      ))}
    </div>
  );
}`;

    case "alert":
      return `function ${varName}() {
  const [dismissed, setDismissed] = React.useState(false);
  const styles = {
    info: { bg: "#eff6ff", border: "#bfdbfe", text: "#1e40af" },
    success: { bg: "#f0fdf4", border: "#bbf7d0", text: "#166534" },
    warning: { bg: "#fffbeb", border: "#fde68a", text: "#92400e" },
    error: { bg: "#fef2f2", border: "#fecaca", text: "#991b1b" },
  }[${JSON.stringify(p.variant)}];
  if (dismissed) return null;
  return (
    <div className="${cls(spec, "w-full h-full flex items-start gap-2.5 p-3")}" style={{ background: styles.bg, border: \`1px solid \${styles.border}\`, borderRadius: ${p.borderRadius}, fontFamily: "${esc(p.textFont)}" }}>
      <div className="flex-1">
        <div style={{ fontWeight: 600, fontSize: 13, color: styles.text }}>${esc(p.title)}</div>
        <div style={{ fontSize: 12, color: styles.text, opacity: 0.85, marginTop: 2 }}>${esc(p.body)}</div>
      </div>
      ${p.dismissible ? `<button onClick={() => setDismissed(true)} style={{ background: "none", border: "none", color: styles.text, opacity: 0.6, cursor: "pointer" }}>✕</button>` : ""}
    </div>
  );
}`;

    case "videoPlayer":
      return `function ${varName}() {
  const aspect = ${JSON.stringify(p.aspect)} === "4:3" ? "4 / 3" : ${JSON.stringify(p.aspect)} === "1:1" ? "1 / 1" : "16 / 9";
  return (
    <div className="${cls(spec, "w-full h-full flex items-center justify-center")}">
      <video
        src="${esc(p.videoUrl)}" poster="${esc(p.posterUrl)}"
        autoPlay={${p.autoplay}} controls={${p.controls}} loop={${p.loop}} muted={${p.muted}}
        style={{ width: "100%", maxHeight: "100%", aspectRatio: aspect, objectFit: "cover", borderRadius: ${p.rounded}, boxShadow: "${shadowExpr(p.shadow)}", background: "#0f172a" }}
      />
    </div>
  );
}`;

    case "codeBlock":
      return `function ${varName}() {
  const code = ${JSON.stringify(String(p.code ?? ""))};
  return (
    <div className="${cls(spec, "w-full h-full flex flex-col overflow-hidden")}" style={{ background: "${p.background}", borderRadius: ${p.rounded}, fontFamily: "${esc(p.textFont)}" }}>
      <div className="flex items-center gap-1.5 px-3 py-2" style={{ background: "${p.headerBackground}" }}>
        <span style={{ width: 10, height: 10, borderRadius: 999, background: "#f87171" }} />
        <span style={{ width: 10, height: 10, borderRadius: 999, background: "#fbbf24" }} />
        <span style={{ width: 10, height: 10, borderRadius: 999, background: "#34d399" }} />
        <span style={{ marginLeft: 8, fontSize: 11, color: "${p.textColor}", opacity: 0.7 }}>${esc(p.headerLabel)}</span>
      </div>
      <pre className="flex-1 overflow-auto px-4 py-3 m-0" style={{ color: "${p.textColor}", fontSize: 12, lineHeight: 1.6 }}>
        {code.split("\\n").map((line, i) => (
          <div key={i}>{${p.showLineNumbers} && <span style={{ opacity: 0.4, paddingRight: 12 }}>{i + 1}</span>}<code>{line || " "}</code></div>
        ))}
      </pre>
      ${p.language ? `<div style={{ padding: "2px 16px 6px", fontSize: 10, textTransform: "uppercase", letterSpacing: 1, color: "${p.accentColor}" }}>${esc(p.language)}</div>` : ""}
    </div>
  );
}`;

    case "newsletter":
      return `function ${varName}() {
  const inline = ${JSON.stringify(p.layout)} === "inline";
  return (
    <div className="${cls(spec, "w-full h-full flex items-center justify-center p-6")}" style={{ background: "${p.background}", borderRadius: ${p.borderRadius}, fontFamily: "${esc(p.textFont)}" }}>
      <div style={{ width: "100%", display: inline ? "flex" : "block", gap: 12, alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
        <div style={{ textAlign: inline ? "left" : "center", flex: inline ? 1 : "none", minWidth: 160 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: "${p.textColor}" }}>${esc(p.headline)}</div>
          <div style={{ fontSize: 12, color: "${p.mutedColor}", marginTop: 2 }}>${esc(p.subheadline)}</div>
        </div>
        <form onSubmit={(e) => e.preventDefault()} style={{ display: "flex", gap: 8, flex: inline ? 1 : "none", minWidth: 220, marginTop: inline ? 0 : 12, flexDirection: inline ? "row" : "column" }}>
          <input type="email" placeholder="${esc(p.placeholder)}" style={{ flex: 1, padding: "10px 14px", borderRadius: 10, border: "1px solid #e5e7eb", background: "#fff", fontSize: 13 }} />
          <button style={{ padding: "10px 18px", borderRadius: 10, background: "${p.accentColor}", color: "${p.accentTextColor}", border: "none", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
            ${esc(p.buttonLabel)}
          </button>
        </form>
      </div>
    </div>
  );
}`;

    case "breadcrumb":
      return `function ${varName}() {
  const items = ${JSON.stringify(p.items)};
  return (
    <nav className="${cls(spec, "w-full h-full flex items-center gap-2 overflow-auto")}" aria-label="Breadcrumb" style={{ fontFamily: "${esc(p.textFont)}" }}>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-2 whitespace-nowrap">
          <a href="#" style={{ color: i === items.length - 1 ? "${p.currentColor}" : "${p.textColor}", fontWeight: i === items.length - 1 ? 600 : 400, fontSize: 13 }}>
            {item}
          </a>
          {i < items.length - 1 && <span style={{ color: "${p.textColor}", opacity: 0.5, fontSize: 12 }}>${esc(p.separator)}</span>}
        </span>
      ))}
    </nav>
  );
}`;

    case "marquee":
      return `function ${varName}() {
  const items = ${JSON.stringify(p.items)};
  const content = items.join(" ${esc(p.separator ?? "•")} ");
  return (
    <div className="${cls(spec, "w-full h-full flex items-center overflow-hidden")}" style={{ background: "${p.background}", fontFamily: "${esc(p.textFont)}" }}>
      <style>{\`@keyframes ${varName}-scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }\`}</style>
      <div className="flex whitespace-nowrap flex-shrink-0" style={{ animation: \`${varName}-scroll ${p.durationMs}ms linear infinite${p.reverse ? " reverse" : ""}\`, animationPlayState: "running" }}>
        <span className="px-6" style={{ color: "${p.textColor}", fontSize: ${fontSizePxExpr(p.fontSize)}, fontWeight: 500 }}>{content}</span>
        <span className="px-6" style={{ color: "${p.textColor}", fontSize: ${fontSizePxExpr(p.fontSize)}, fontWeight: 500 }}>{content}</span>
      </div>
    </div>
  );
}`;

    case "iconList":
      return `function ${varName}() {
  const items = ${JSON.stringify((p.items ?? []).map((line: string) => { const [icon, title, ...rest] = line.split("::"); return { icon: icon?.trim() ?? "check", title: title?.trim() ?? "", body: rest.join("::").trim() }; }))};
  return (
    <div className="${cls(spec, "w-full h-full overflow-auto")}" style={{ display: "grid", gridTemplateColumns: \`repeat(${p.columns ?? 1}, 1fr)\`, gap: 12 }}>
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-3 p-2">
          <span style={{ width: 32, height: 32, borderRadius: 10, display: "inline-flex", alignItems: "center", justifyContent: "center", background: "${p.iconColor}1a", color: "${p.iconColor}", flexShrink: 0 }}>
            ${iconJsx("star", 15)}
          </span>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13, color: "${p.titleColor}", fontFamily: "${esc(p.textFont)}" }}>{item.title}</div>
            <div style={{ fontSize: 12, color: "${p.bodyColor}", fontFamily: "${esc(p.textFont)}", marginTop: 2 }}>{item.body}</div>
          </div>
        </div>
      ))}
    </div>
  );
}`;

    case "gallery":
      return `function ${varName}() {
  const images = ${JSON.stringify(p.images)};
  return (
    <div className="${cls(spec, "w-full h-full overflow-auto")}" style={{ display: "grid", gridTemplateColumns: \`repeat(${p.columns}, 1fr)\`, gap: ${p.gap} }}>
      {images.map((src, i) => (
        <div key={i} className="overflow-hidden" style={{ borderRadius: ${p.rounded}, boxShadow: "${shadowExpr(p.shadow)}", transition: "transform 300ms ease" }}>
          <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", aspectRatio: ${JSON.stringify(p.aspect).replace(":", " / ")}, transition: "transform 300ms ease" }} />
        </div>
      ))}
    </div>
  );
}`;

    case "features":
      return `function ${varName}() {
  const features = ${JSON.stringify((p.features ?? []).map((line: string) => { const [icon, title, ...rest] = line.split("::"); return { icon: icon?.trim() ?? "sparkles", title: title?.trim() ?? "", body: rest.join("::").trim() }; }))};
  return (
    <section className="${cls(spec, "w-full h-full overflow-auto p-5")}" style={{ background: "${p.background}", borderRadius: ${p.borderRadius}, fontFamily: "${esc(p.textFont)}" }}>
      <div style={{ textAlign: ${textAlignExpr(p.textAlign)}, marginBottom: 16 }}>
        <h2 style={{ color: "${p.headingColor}", fontSize: 18, fontWeight: 700, margin: 0 }}>${esc(p.heading)}</h2>
        <p style={{ color: "${p.bodyColor}", fontSize: 13, margin: "4px 0 0" }}>${esc(p.subheading)}</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: \`repeat(${p.columns}, 1fr)\`, gap: 12 }}>
        {features.map((feature, i) => (
          <div key={i} style={{ border: "1px solid rgba(0,0,0,.05)", borderRadius: 14, padding: 16, background: "rgba(255,255,255,.6)", textAlign: ${textAlignExpr(p.textAlign)} }}>
            <span style={{ width: 36, height: 36, borderRadius: 10, display: "inline-flex", alignItems: "center", justifyContent: "center", background: "${p.iconColor}1a", color: "${p.iconColor}", marginBottom: 8 }}>
              ${iconJsx("sparkles", 16)}
            </span>
            <div style={{ fontWeight: 600, fontSize: 13, color: "${p.headingColor}" }}>{feature.title}</div>
            <div style={{ fontSize: 12, color: "${p.bodyColor}", marginTop: 4 }}>{feature.body}</div>
          </div>
        ))}
      </div>
    </section>
  );
}`;

    case "rawBlock":
      return `function ${varName}() {
  // Imported markup that could not be matched to a known component.
  // Preserved verbatim and editable via the escape hatch (customCode).
  return (
    <div className="${cls(spec, "w-full h-full")}" dangerouslySetInnerHTML={{ __html: ${JSON.stringify(p.html ?? "")} }} />
  );
}`;

    default:
      return `<div className="${cls(spec, "")}">Unknown component: ${spec.type}</div>`;
  }
}

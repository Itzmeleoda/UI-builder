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
  return String(v ?? "").replace(/`/g, "\\`").replace(/\$\{/g, "\\${");
}

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
      }}>{/* child components render here */}</div>`;

    case "tabs":
      return `function ${varName}() {
  const [active, setActive] = React.useState(${p.activeIndex ?? 0});
  const tabs = ${JSON.stringify(p.tabs)};
  return (
    <div className="${cls(spec, "w-full")}">
      <div className={${JSON.stringify("flex " + (p.orientation === "vertical" ? "flex-col" : "flex-row") + " gap-2 border-b border-gray-200")}}>
        {tabs.map((label, i) => (
          <button key={i} onClick={() => setActive(i)}
            style={{
              color: i === active ? "${p.activeTextColor}" : "${p.inactiveTextColor}",
              borderBottomColor: i === active ? "${p.indicatorColor}" : "transparent",
              transition: \`all ${p.durationMs}ms ${p.easing}\`,
            }}
            className="px-4 py-2 border-b-2 font-medium">
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
        boxShadow: "${p.shadow === "none" ? "none" : p.shadow === "sm" ? "0 1px 2px rgba(0,0,0,.06)" : p.shadow === "lg" ? "0 10px 25px rgba(0,0,0,.12)" : p.shadow === "xl" ? "0 20px 40px rgba(0,0,0,.16)" : "0 4px 10px rgba(0,0,0,.08)"}",
        transform: hovered ? "${p.transform}" : "none",
        transition: \`transform ${p.durationMs}ms ${p.easing}\`,
      }}>
      ${p.imageUrl ? `<img src="${esc(p.imageUrl)}" alt="${esc(p.title)}" className="w-full h-1/2 object-cover" />` : ""}
      <div className="p-4">
        <h3 className="text-lg font-semibold">${esc(p.title)}</h3>
        <p className="text-sm text-gray-500 mt-1">${esc(p.body)}</p>
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
      <div className="absolute inset-0 flex items-end p-4" style={{
        background: "${p.overlayColor}",
        opacity: hovered ? 1 : 0,
        transition: \`opacity ${p.durationMs}ms ${p.easing}\`,
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
          <div key={i} className="w-full h-full flex-shrink-0 flex items-center justify-center text-xl font-medium">{s}</div>
        ))}
      </div>
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, i) => (
          <button key={i} onClick={() => setIndex(i)} style={{ background: i === index ? "${p.dotColor}" : "#d1d5db" }} className="w-2 h-2 rounded-full" />
        ))}
      </div>
    </div>
  );
}`;

    case "searchBar":
      return `function ${varName}() {
  return (
    <div className="${cls(spec, "flex items-center w-full")}" style={{
      background: "${p.background}", borderRadius: ${p.rounded}, padding: "8px 16px",
      transition: \`box-shadow ${p.durationMs}ms ${p.easing}\`,
    }}>
      ${p.showIcon ? `<svg className="w-4 h-4 mr-2 opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.35-4.35"/></svg>` : ""}
      <input placeholder="${esc(p.placeholder)}" style={{ color: "${p.textColor}", background: "transparent", outline: "none", width: "100%" }} />
    </div>
  );
}`;

    case "table":
      return `function ${varName}() {
  const columns = ${JSON.stringify(p.columns)};
  const rows = ${JSON.stringify(p.rows)};
  return (
    <table className="${cls(spec, "w-full text-sm border-collapse")}">
      <thead>
        <tr style={{ background: "${p.headerBackground}", color: "${p.headerTextColor}" }}>
          {columns.map((c, i) => <th key={i} className="text-left px-4 py-2">{c}</th>)}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, ri) => (
          <tr key={ri} style={{ background: ${p.striped} && ri % 2 === 1 ? "#f9fafb" : "transparent" }}
            className="border-b" >
            {row.map((cell, ci) => <td key={ci} className="px-4 py-2" style={{ borderColor: "${p.borderColor}" }}>{cell}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  );
}`;

    case "button":
      return `function ${varName}() {
  const [hovered, setHovered] = React.useState(false);
  return (
    <button className="${cls(spec, "font-medium")}"
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{
        background: "${p.variant === "solid" ? (`" + (hovered ? p.hoverBackground : p.background) + "`) : "transparent"}",
        color: "${p.variant === "solid" ? p.textColor : p.background}",
        border: "${p.variant === "outline" ? `2px solid ${p.background}` : "none"}",
        borderRadius: ${p.borderRadius},
        padding: "${p.paddingY}px ${p.paddingX}px",
        transform: hovered ? "${p.transform}" : "none",
        transition: \`all ${p.durationMs}ms ${p.easing}\`,
      }}>${esc(p.label)}</button>
  );
}`;

    case "modal":
      return `function ${varName}() {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} className="px-4 py-2 rounded-lg bg-indigo-600 text-white">Open modal</button>
      {open && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: "${p.overlayColor}" }}
          onClick={() => ${p.closeOnOverlayClick} && setOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} className="${cls(spec, "p-6 w-full max-w-md")}" style={{
            background: "${p.panelBackground}", borderRadius: ${p.borderRadius},
            transition: \`all ${p.durationMs}ms ${p.easing}\`,
          }}>
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
  const [open, setOpen] = React.useState(${JSON.stringify(p.allowMultipleOpen ? [] : 0)});
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
          <button onClick={() => toggle(i)} className="w-full text-left py-3 font-medium flex justify-between" style={{ color: "${p.headerTextColor}" }}>
            {item.title}
            <span style={{ transition: \`transform ${p.durationMs}ms ${p.easing}\`, transform: isOpen(i) ? "rotate(180deg)" : "rotate(0)" }}>⌄</span>
          </button>
          <div style={{ maxHeight: isOpen(i) ? 200 : 0, overflow: "hidden", transition: \`max-height ${p.durationMs}ms ${p.easing}\` }}>
            <p className="pb-3 text-sm text-gray-500">{item.body}</p>
          </div>
        </div>
      ))}
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
    }}>
      <span className="font-bold">${esc(p.logoText)}</span>
      <nav className="flex gap-6">
        {${JSON.stringify(p.links)}.map((link, i) => <a key={i} href="#">{link}</a>)}
      </nav>
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

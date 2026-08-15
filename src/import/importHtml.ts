import { v4 as uuid } from "uuid";
import type { AssetRecord, ComponentSpec, ComponentType, ProjectSpec } from "../types";
import { SCHEMA_MIN_SUPPORTED_VERSION, SCHEMA_VERSION } from "../types";
import { COMPONENT_LIBRARY, PALETTE_TYPES } from "../data/componentLibrary";
import { sanitizeHtml } from "../utils/sanitize";

export interface ImportReport {
  mode: "authored-roundtrip" | "heuristic";
  matched: { type: ComponentType; confidence: number }[];
  rawBlocks: number;
  assetsFound: number;
  warnings: string[];
}

export interface ImportResult {
  project: ProjectSpec;
  report: ImportReport;
}

function migrateSpec(raw: any): ProjectSpec {
  // Handle at least N-1 schema version. v1 lacked `assets`; backfill.
  if (raw.schemaVersion === 1) {
    return { ...raw, schemaVersion: SCHEMA_VERSION, assets: raw.assets ?? [] };
  }
  return raw as ProjectSpec;
}

function extractParams(type: ComponentType, el: Element): Record<string, unknown> {
  const text = (sel: string) => el.querySelector(sel)?.textContent?.trim();
  switch (type) {
    case "card":
      return {
        title: text("h1,h2,h3,h4,h5") ?? "Imported card",
        body: text("p") ?? "",
        imageUrl: el.querySelector("img")?.getAttribute("src") ?? "",
      };
    case "button":
      return { label: el.textContent?.trim() || "Button" };
    case "table": {
      const cols = Array.from(el.querySelectorAll("thead th")).map((th) => th.textContent?.trim() ?? "");
      const rows = Array.from(el.querySelectorAll("tbody tr")).map((tr) =>
        Array.from(tr.querySelectorAll("td")).map((td) => td.textContent?.trim() ?? "")
      );
      return cols.length ? { columns: cols, rows } : {};
    }
    case "tabs": {
      const tabs = Array.from(el.querySelectorAll('[role="tab"], .tab, .tab-item')).map(
        (t) => t.textContent?.trim() ?? ""
      );
      return tabs.length ? { tabs } : {};
    }
    case "accordion": {
      const items = Array.from(el.querySelectorAll("details")).map((d) => ({
        title: d.querySelector("summary")?.textContent?.trim() ?? "Item",
        body: Array.from(d.children)
          .filter((c) => c.tagName.toLowerCase() !== "summary")
          .map((c) => c.textContent?.trim())
          .join(" "),
      }));
      return items.length ? { items } : {};
    }
    case "searchBar":
      return { placeholder: el.getAttribute("placeholder") ?? el.querySelector("input")?.getAttribute("placeholder") ?? "Search…" };
    case "stickyHeader":
      return {
        logoText: text("strong,b,.logo") ?? "Brand",
        links: Array.from(el.querySelectorAll("nav a")).map((a) => a.textContent?.trim() ?? ""),
      };
    case "modal":
      return { title: text("h1,h2,h3") ?? "Dialog", body: text("p") ?? "" };
    case "imageHover":
      return {
        imageUrl: el.querySelector("img")?.getAttribute("src") ?? "",
        caption: text("figcaption") ?? "",
      };
    case "carousel":
      return {
        slides: Array.from(el.querySelectorAll(".slide, [data-slide]")).map((s) => s.textContent?.trim() ?? ""),
      };
    default:
      return {};
  }
}

function bestMatch(el: Element): { type: ComponentType; confidence: number } | null {
  let best: { type: ComponentType; confidence: number } | null = null;
  for (const type of PALETTE_TYPES) {
    const confidence = COMPONENT_LIBRARY[type].signature.test(el);
    if (confidence > 0 && (!best || confidence > best.confidence)) {
      best = { type, confidence };
    }
  }
  return best && best.confidence >= 0.5 ? best : null;
}

function collectAssets(doc: Document): AssetRecord[] {
  const seen = new Set<string>();
  const assets: AssetRecord[] = [];
  doc.querySelectorAll("img[src]").forEach((img) => {
    const src = img.getAttribute("src") ?? "";
    if (!src || seen.has(src)) return;
    seen.add(src);
    assets.push({
      id: uuid(),
      name: src.split("/").pop() || src,
      kind: "image",
      url: src,
      origin: "imported",
      license: "Unknown — verify rights before shipping",
      source: "Imported from uploaded HTML file",
      addedAt: new Date().toISOString(),
    });
  });
  return assets;
}

export function importHtmlString(html: string, fileName: string): ImportResult {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const warnings: string[] = [];

  // ── Tier 1: own-format round trip ────────────────────────────────────
  const specTag = doc.getElementById("uibuilder-spec");
  if (specTag?.textContent) {
    try {
      const raw = JSON.parse(specTag.textContent);
      if (raw.schemaVersion < SCHEMA_MIN_SUPPORTED_VERSION) {
        throw new Error(`Spec schema v${raw.schemaVersion} is older than the minimum supported v${SCHEMA_MIN_SUPPORTED_VERSION}`);
      }
      const project = migrateSpec(raw);
      return {
        project,
        report: {
          mode: "authored-roundtrip",
          matched: project.components.map((c) => ({ type: c.type, confidence: 1 })),
          rawBlocks: project.components.filter((c) => c.type === "rawBlock").length,
          assetsFound: project.assets.length,
          warnings,
        },
      };
    } catch (e: any) {
      warnings.push(`Embedded spec was present but invalid (${e.message}) — falling back to heuristic import.`);
    }
  }

  // ── Tier 2: heuristic structural matching ────────────────────────────
  const body = doc.body;
  const candidates: Element[] = Array.from(body.children);
  const components: ComponentSpec[] = [];
  const matched: { type: ComponentType; confidence: number }[] = [];
  let cursorY = 0;
  let rawCount = 0;

  const visit = (el: Element) => {
    const match = bestMatch(el);
    if (match) {
      const def = COMPONENT_LIBRARY[match.type];
      const params = { ...def.defaultParams, ...extractParams(match.type, el) };
      components.push({
        id: uuid(),
        type: match.type,
        name: def.label,
        box: { x: 0, y: cursorY, w: def.defaultBox.w, h: def.defaultBox.h },
        params,
        origin: "imported-matched",
        matchConfidence: match.confidence,
      });
      matched.push(match);
      cursorY += def.defaultBox.h;
      return;
    }
    // No match at this level — recurse into children before giving up,
    // so we don't swallow a matchable component nested one level deep.
    if (el.children.length > 0 && el.children.length <= 6) {
      let anyMatched = false;
      Array.from(el.children).forEach((child) => {
        const before = components.length;
        visit(child);
        if (components.length > before) anyMatched = true;
      });
      if (anyMatched) return;
    }
    const { safe, warnings: w } = sanitizeHtml(el.outerHTML);
    warnings.push(...w);
    components.push({
      id: uuid(),
      type: "rawBlock",
      name: `Raw: <${el.tagName.toLowerCase()}>`,
      box: { x: 0, y: cursorY, w: 6, h: 4 },
      params: { html: safe },
      origin: "imported-raw",
    });
    rawCount += 1;
    cursorY += 4;
  };

  if (candidates.length === 0) {
    warnings.push("No elements found in <body> — nothing to import.");
  }
  candidates.forEach(visit);

  const assets = collectAssets(doc);

  const project: ProjectSpec = {
    schemaVersion: SCHEMA_VERSION,
    projectName: fileName.replace(/\.html?$/i, "") || "Imported project",
    cols: 12,
    rowHeight: 60,
    components,
    assets,
  };

  return {
    project,
    report: {
      mode: "heuristic",
      matched,
      rawBlocks: rawCount,
      assetsFound: assets.length,
      warnings,
    },
  };
}

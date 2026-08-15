import { useMemo, useState } from "react";
import { PALETTE_TYPES, COMPONENT_LIBRARY } from "../data/componentLibrary";
import { ICON_MAP } from "../data/iconMap";
import { TEMPLATES } from "../data/templates";
import { useStore } from "../state/store";
import { cn } from "../utils/cn";
import type { ComponentType } from "../types";
import { Boxes, Image as ImageIcon, Library, FolderUp, Search, Upload, LayoutTemplate, Shapes, MousePointerClick, Grid2x2 } from "lucide-react";
import { v4 as uuid } from "uuid";

const CATEGORY_LABEL: Record<string, string> = { layout: "Layout", interaction: "Interaction", content: "Content" };
const CATEGORY_ICON: Record<string, typeof Shapes> = { layout: Grid2x2, interaction: MousePointerClick, content: Shapes };

function Palette() {
  const addComponent = useStore((s) => s.addComponent);
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<"all" | "layout" | "interaction" | "content">("all");
  const categories = ["layout", "interaction", "content"] as const;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PALETTE_TYPES.filter((t) => {
      const def = COMPONENT_LIBRARY[t];
      if (cat !== "all" && def.category !== cat) return false;
      if (!q) return true;
      return def.label.toLowerCase().includes(q) || def.description.toLowerCase().includes(q);
    });
  }, [query, cat]);

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          className="w-full text-xs rounded-lg border border-slate-200 bg-white pl-8 pr-2 py-2 focus:border-indigo-300 outline-none"
          placeholder={`Search ${PALETTE_TYPES.length} components…`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <div className="flex gap-1">
        {(["all", ...categories] as const).map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={cn(
              "flex-1 text-[10px] font-medium px-1.5 py-1.5 rounded-lg border transition-colors",
              cat === c ? "bg-indigo-600 text-white border-indigo-600" : "border-slate-200 text-slate-500 hover:bg-white"
            )}
          >
            {c === "all" ? "All" : CATEGORY_LABEL[c]}
          </button>
        ))}
      </div>
      <div className="space-y-4 max-h-[calc(100vh-220px)] overflow-auto pr-0.5 pb-4">
        {categories.map((catName) => {
          const items = filtered.filter((t) => COMPONENT_LIBRARY[t].category === catName);
          if (items.length === 0) return null;
          const CatIcon = CATEGORY_ICON[catName];
          return (
            <div key={catName}>
              <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                <CatIcon className="w-3 h-3" /> {CATEGORY_LABEL[catName]}
                <span className="ml-auto text-[10px] normal-case font-normal text-slate-300">{items.length}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {items.map((type) => {
                  const def = COMPONENT_LIBRARY[type];
                  const Icon = ICON_MAP[def.icon] ?? Boxes;
                  return (
                    <button
                      key={type}
                      draggable
                      onDragStart={(e) => e.dataTransfer.setData("text/component-type", type)}
                      onClick={() => addComponent(type as ComponentType)}
                      title={`${def.description} — click to add, drag to place`}
                      className="flex flex-col items-start gap-1.5 rounded-lg border border-slate-200 bg-white p-2.5 text-left hover:border-indigo-300 hover:shadow-sm hover:-translate-y-px active:translate-y-0 transition-all cursor-grab active:cursor-grabbing"
                    >
                      <span className="w-7 h-7 rounded-md bg-indigo-50 flex items-center justify-center">
                        <Icon className="w-4 h-4 text-indigo-500" />
                      </span>
                      <span className="text-xs font-medium text-slate-700 leading-tight">{def.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && <div className="text-xs text-slate-400 text-center py-6">No components match “{query}”.</div>}
      </div>
    </div>
  );
}

function Templates() {
  const replaceProject = useStore((s) => s.replaceProject);
  const projectName = useStore((s) => s.project.projectName);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  return (
    <div className="space-y-2.5 max-h-[calc(100vh-160px)] overflow-auto pr-0.5 pb-4">
      <p className="text-[11px] text-slate-400 leading-relaxed">
        Load a pre-built page layout, then make it yours. Loading replaces the current canvas (undoable).
      </p>
      {TEMPLATES.map((t) => (
        <div key={t.id} className="rounded-xl border border-slate-200 bg-white p-2.5 hover:border-indigo-300 hover:shadow-sm transition-all">
          <button
            className="w-full text-left"
            onClick={() => (t.id === "blank" ? load() : setConfirmId(t.id))}
          >
            <div className={cn("h-16 rounded-lg bg-gradient-to-br p-2 flex items-center gap-2 overflow-hidden", t.accent)}>
              <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                {t.wire.slice(0, 3).map((row, ri) => (
                  <div key={ri} className="flex gap-1">
                    {row.map((blk, bi) => (
                      <div key={bi} className="h-2 rounded-sm bg-white/70" style={{ flex: blk.w }} />
                    ))}
                  </div>
                ))}
              </div>
              <span className="text-xl drop-shadow flex-shrink-0">{t.emoji}</span>
            </div>
            <div className="mt-2">
              <div className="text-xs font-semibold text-slate-700">{t.name}</div>
              <div className="text-[10px] text-slate-400 mt-0.5 leading-snug">{t.description}</div>
            </div>
          </button>
          {confirmId === t.id && (
            <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-[10px] text-amber-700">Replace the current canvas with this template?</p>
              <div className="flex gap-1.5 mt-1.5">
                <button
                  onClick={() => {
                    replaceProject(t.build(projectName || t.name), null, `Load template “${t.name}”`);
                    setConfirmId(null);
                  }}
                  className="text-[10px] px-2 py-1 rounded bg-indigo-600 text-white font-medium"
                >
                  Load
                </button>
                <button onClick={() => setConfirmId(null)} className="text-[10px] px-2 py-1 rounded border border-slate-200 text-slate-500">
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  function load() {
    const t = TEMPLATES.find((x) => x.id === "blank")!;
    replaceProject(t.build(projectName || "Untitled"), null, "Load blank canvas");
  }
}

function AssetPanel() {
  const assets = useStore((s) => s.project.assets);
  const addAsset = useStore((s) => s.addAsset);
  const [filter, setFilter] = useState<"all" | "image" | "icon" | "font" | "gradient" | "logo">("all");
  const [query, setQuery] = useState("");
  const kinds = ["all", "image", "icon", "font", "gradient", "logo"] as const;

  const filtered = assets.filter((a) => (filter === "all" || a.kind === filter) && (query.trim() === "" || a.name.toLowerCase().includes(query.trim().toLowerCase())));

  const handleUpload = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach((file) => {
      addAsset({
        id: uuid(),
        name: file.name,
        kind: "image",
        url: URL.createObjectURL(file),
        origin: "imported",
        license: "Unknown — verify rights before shipping",
        source: "Uploaded from local file",
        addedAt: new Date().toISOString(),
      });
    });
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input className="w-full text-xs rounded-lg border border-slate-200 bg-white pl-8 pr-2 py-2 focus:border-indigo-300 outline-none" placeholder="Search assets…" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>
      <div className="flex gap-1 flex-wrap">
        {kinds.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "text-[10px] px-2 py-1 rounded-full border capitalize",
              filter === f ? "bg-indigo-600 text-white border-indigo-600" : "border-slate-200 text-slate-500 hover:bg-white"
            )}
          >
            {f}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-1.5 max-h-[calc(100vh-260px)] overflow-auto pr-0.5 pb-4">
        {filtered.map((a) => (
          <div key={a.id} draggable onDragStart={(e) => a.kind !== "font" && e.dataTransfer.setData("text/asset-url", a.url)} title={`${a.name}\n${a.license} — drag onto the canvas`} className="group">
            {a.kind === "font" ? (
              <div className="h-14 rounded-lg border border-slate-200 bg-white flex flex-col items-center justify-center">
                <span className="text-lg font-semibold" style={{ fontFamily: a.url }}>Ag</span>
                <span className="text-[8px] text-slate-400 mt-0.5">font</span>
              </div>
            ) : (
              <img src={a.url} alt={a.name} className="h-14 w-full object-cover rounded-lg border border-slate-200 bg-slate-100 group-hover:border-indigo-300 transition-colors cursor-grab" />
            )}
            <div className="text-[9px] text-slate-500 truncate mt-0.5">{a.name}</div>
          </div>
        ))}
        {filtered.length === 0 && <div className="col-span-3 text-xs text-slate-400 text-center py-8">No assets match.</div>}
      </div>
      <label className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 border border-dashed border-slate-300 rounded-lg py-2.5 cursor-pointer hover:bg-white transition-colors">
        <Upload className="w-3.5 h-3.5" />
        Upload images
        <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleUpload(e.target.files)} />
      </label>
      <div className="text-[10px] text-slate-400 leading-relaxed">
        <Library className="w-3 h-3 inline text-indigo-400" /> bundled · <FolderUp className="w-3 h-3 inline text-amber-500" /> your uploads. Drag any image, gradient or logo onto the canvas.
      </div>
    </div>
  );
}

export function Sidebar() {
  const [tab, setTab] = useState<"components" | "templates" | "assets">("components");
  const tabs = [
    { id: "components", label: "Components", Icon: Shapes },
    { id: "templates", label: "Templates", Icon: LayoutTemplate },
    { id: "assets", label: "Assets", Icon: ImageIcon },
  ] as const;
  return (
    <aside className="w-64 flex-shrink-0 border-r border-slate-200 bg-slate-50/60 p-3 overflow-y-auto">
      <div className="flex gap-1 mb-4 bg-slate-100 rounded-lg p-1">
        {tabs.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cn("flex-1 flex items-center justify-center gap-1 text-xs font-medium py-1.5 rounded-md transition-colors", tab === id ? "bg-white shadow-sm text-slate-800" : "text-slate-500 hover:text-slate-700")}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>
      {tab === "components" ? <Palette /> : tab === "templates" ? <Templates /> : <AssetPanel />}
    </aside>
  );
}

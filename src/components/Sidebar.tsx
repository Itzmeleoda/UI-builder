import { useState } from "react";
import { PALETTE_TYPES, COMPONENT_LIBRARY } from "../data/componentLibrary";
import { ICON_MAP } from "../data/iconMap";
import { useStore } from "../state/store";
import { cn } from "../utils/cn";
import type { ComponentType } from "../types";
import { Boxes, Image as ImageIcon, Library, FolderUp } from "lucide-react";

const CATEGORY_LABEL: Record<string, string> = { layout: "Layout", interaction: "Interaction", content: "Content" };

function Palette() {
  const addComponent = useStore((s) => s.addComponent);
  const categories = ["layout", "interaction", "content"] as const;

  return (
    <div className="space-y-5">
      {categories.map((cat) => (
        <div key={cat}>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">{CATEGORY_LABEL[cat]}</div>
          <div className="grid grid-cols-2 gap-2">
            {PALETTE_TYPES.filter((t) => COMPONENT_LIBRARY[t].category === cat).map((type) => {
              const def = COMPONENT_LIBRARY[type];
              const Icon = ICON_MAP[def.icon] ?? Boxes;
              return (
                <button
                  key={type}
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData("text/component-type", type)}
                  onClick={() => addComponent(type as ComponentType)}
                  title={def.description}
                  className="flex flex-col items-start gap-1.5 rounded-lg border border-slate-200 bg-white p-2.5 text-left hover:border-indigo-300 hover:shadow-sm transition-all cursor-grab active:cursor-grabbing"
                >
                  <Icon className="w-4 h-4 text-indigo-500" />
                  <span className="text-xs font-medium text-slate-700 leading-tight">{def.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function AssetPanel() {
  const assets = useStore((s) => s.project.assets);
  const [filter, setFilter] = useState<"all" | "library" | "imported">("all");
  const filtered = assets.filter((a) => filter === "all" || a.origin === filter);

  return (
    <div className="space-y-3">
      <div className="flex gap-1 text-xs">
        {(["all", "library", "imported"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-2.5 py-1 rounded-full border",
              filter === f ? "bg-indigo-600 text-white border-indigo-600" : "border-slate-200 text-slate-500 hover:bg-slate-50"
            )}
          >
            {f}
          </button>
        ))}
      </div>
      <div className="space-y-2 max-h-[420px] overflow-auto pr-1">
        {filtered.map((a) => (
          <div key={a.id} className="rounded-lg border border-slate-200 p-2 flex gap-2 items-start bg-white">
            {a.kind === "image" ? (
              <img src={a.url} alt={a.name} className="w-10 h-10 rounded object-cover bg-slate-100 flex-shrink-0" />
            ) : (
              <div className="w-10 h-10 rounded bg-slate-100 flex items-center justify-center flex-shrink-0">
                <ImageIcon className="w-4 h-4 text-slate-400" />
              </div>
            )}
            <div className="min-w-0">
              <div className="text-xs font-medium text-slate-800 truncate">{a.name}</div>
              <div className="flex items-center gap-1 mt-0.5">
                {a.origin === "library" ? (
                  <Library className="w-3 h-3 text-indigo-400" />
                ) : (
                  <FolderUp className="w-3 h-3 text-amber-500" />
                )}
                <span className="text-[10px] text-slate-400">{a.origin}</span>
              </div>
              <div className="text-[10px] text-slate-400 truncate" title={a.license}>
                {a.license}
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <div className="text-xs text-slate-400 text-center py-6">No assets yet.</div>}
      </div>
    </div>
  );
}

export function Sidebar() {
  const [tab, setTab] = useState<"components" | "assets">("components");
  return (
    <aside className="w-64 flex-shrink-0 border-r border-slate-200 bg-slate-50/60 p-3 overflow-y-auto">
      <div className="flex gap-1 mb-4 bg-slate-100 rounded-lg p-1">
        <button
          onClick={() => setTab("components")}
          className={cn("flex-1 text-xs font-medium py-1.5 rounded-md", tab === "components" ? "bg-white shadow-sm text-slate-800" : "text-slate-500")}
        >
          Components
        </button>
        <button
          onClick={() => setTab("assets")}
          className={cn("flex-1 text-xs font-medium py-1.5 rounded-md", tab === "assets" ? "bg-white shadow-sm text-slate-800" : "text-slate-500")}
        >
          Assets
        </button>
      </div>
      {tab === "components" ? <Palette /> : <AssetPanel />}
    </aside>
  );
}

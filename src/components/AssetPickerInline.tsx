import { useMemo, useState } from "react";
import { useStore } from "../state/store";
import { v4 as uuid } from "uuid";
import { Upload, Check, Search, ImageOff } from "lucide-react";

export function AssetPickerInline({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const assets = useStore((s) => s.project.assets.filter((a) => a.kind !== "font"));
  const addAsset = useStore((s) => s.addAsset);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = useMemo(
    () => assets.filter((a) => query.trim() === "" || a.name.toLowerCase().includes(query.trim().toLowerCase())),
    [assets, query]
  );

  const handleUpload = (file: File) => {
    const url = URL.createObjectURL(file);
    addAsset({
      id: uuid(),
      name: file.name,
      kind: "image",
      url,
      origin: "imported",
      license: "Unknown — verify rights before shipping",
      source: "Uploaded from local file",
      addedAt: new Date().toISOString(),
    });
    onChange(url);
    setOpen(false);
  };

  return (
    <div>
      <div className="flex items-center gap-2">
        {value ? (
          <img src={value} className="w-9 h-9 rounded object-cover border border-slate-200 bg-slate-100" />
        ) : (
          <div className="w-9 h-9 rounded bg-slate-100 border border-slate-200 flex items-center justify-center">
            <ImageOff className="w-3.5 h-3.5 text-slate-300" />
          </div>
        )}
        <input className="flex-1 text-xs rounded-md border border-slate-200 px-2 py-1.5 font-mono focus:border-indigo-300 outline-none" value={value} onChange={(e) => onChange(e.target.value)} placeholder="/images/… or URL" />
        <button onClick={() => setOpen((o) => !o)} className="text-[10px] px-2 py-1.5 rounded-md border border-slate-200 hover:bg-slate-50">
          Swap
        </button>
      </div>
      {open && (
        <div className="mt-2 border border-slate-200 rounded-md p-2 bg-slate-50">
          <div className="relative mb-2">
            <Search className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
            <input className="w-full text-[11px] rounded border border-slate-200 bg-white pl-6 pr-2 py-1.5 outline-none focus:border-indigo-300" placeholder="Search assets…" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <div className="grid grid-cols-5 gap-1.5 max-h-36 overflow-auto mb-2">
            {filtered.map((a) => (
              <button key={a.id} className="relative" title={a.name} onClick={() => { onChange(a.url); setOpen(false); }}>
                {a.kind === "font" ? (
                  <div className="w-full h-10 rounded border border-slate-200 bg-white flex items-center justify-center text-[10px]" style={{ fontFamily: a.url }}>Ag</div>
                ) : (
                  <img src={a.url} className="w-full h-10 object-cover rounded border border-slate-200 bg-white" />
                )}
                {a.url === value && (
                  <span className="absolute inset-0 flex items-center justify-center bg-indigo-500/40 rounded">
                    <Check className="w-3 h-3 text-white" />
                  </span>
                )}
              </button>
            ))}
            {filtered.length === 0 && <div className="col-span-5 text-[10px] text-slate-400 text-center py-4">No assets match.</div>}
          </div>
          <label className="flex items-center justify-center gap-1.5 text-[10px] text-slate-500 border border-dashed border-slate-300 rounded-md py-2 cursor-pointer hover:bg-white">
            <Upload className="w-3 h-3" />
            Upload local image
            <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])} />
          </label>
        </div>
      )}
    </div>
  );
}

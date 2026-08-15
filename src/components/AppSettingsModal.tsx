import { useState } from "react";
import { X, Palette, Type, Globe, LayoutGrid, FileText, Check } from "lucide-react";
import { useStore } from "../state/store";
import { cn } from "../utils/cn";

const PRESET_COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#ef4444", "#f59e0b", "#10b981", "#0ea5e9", "#0f172a"];

const FONTS = [
  { label: "Inter — modern sans", value: "'Inter', system-ui, sans-serif" },
  { label: "System default", value: "system-ui, -apple-system, 'Segoe UI', sans-serif" },
  { label: "Poppins — geometric", value: "'Poppins', 'Inter', sans-serif" },
  { label: "Playfair — elegant serif", value: "'Playfair Display', Georgia, serif" },
  { label: "Space Grotesk — tech", value: "'Space Grotesk', 'Inter', sans-serif" },
  { label: "Roboto Mono — code", value: "'Roboto Mono', ui-monospace, monospace" },
];

const BG_PRESETS = ["#f1f5f9", "#fafaf9", "#fdf2f8", "#eff6ff", "#f0fdf4", "#0f172a", "#fff7ed"];

export function AppSettingsModal({ onClose }: { onClose: () => void }) {
  const settings = useStore((s) => s.project.settings);
  const setSettings = useStore((s) => s.setSettings);
  const [tab, setTab] = useState<"theme" | "meta">("theme");

  const Section = ({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) => (
    <div className="rounded-xl border border-slate-200 overflow-hidden">
      <div className="px-4 py-2.5 bg-slate-50 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
        {icon} {title}
      </div>
      <div className="p-4 space-y-4 bg-white">{children}</div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[95] p-6" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200">
          <div className="font-semibold text-slate-800 text-sm">App settings — customize the whole application</div>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-md">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex gap-2 px-5 pt-3">
          {(
            [
              { id: "theme", label: "Theme", Icon: Palette },
              { id: "meta", label: "Page & meta", Icon: Globe },
            ] as const
          ).map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={cn("flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md border", tab === id ? "bg-indigo-50 border-indigo-200 text-indigo-700 font-medium" : "border-slate-200 text-slate-500 hover:bg-slate-50")}
            >
              <Icon className="w-3.5 h-3.5" /> {label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-auto p-5 space-y-4">
          {tab === "theme" && (
            <>
              <Section title="Brand color" icon={<Palette className="w-3.5 h-3.5 text-indigo-500" />}>
                <div className="flex items-center gap-2">
                  <div className="relative w-10 h-10 rounded-lg border border-slate-200 overflow-hidden">
                    <input type="color" className="absolute -inset-2 w-16 h-16 cursor-pointer" value={settings.primaryColor} onChange={(e) => setSettings({ primaryColor: e.target.value })} />
                  </div>
                  <input className="text-xs rounded-md border border-slate-200 px-2 py-1.5 font-mono w-28" value={settings.primaryColor} onChange={(e) => setSettings({ primaryColor: e.target.value })} />
                  <div className="flex gap-1.5 flex-wrap flex-1 justify-end">
                    {PRESET_COLORS.map((c) => (
                      <button key={c} onClick={() => setSettings({ primaryColor: c })} className={cn("w-6 h-6 rounded-full border border-slate-200 hover:scale-110 transition-transform", settings.primaryColor === c && "ring-2 ring-indigo-500 ring-offset-1")} style={{ background: c }} />
                    ))}
                  </div>
                </div>
                <p className="text-[11px] text-slate-400">New components automatically inherit this color for buttons, accents and highlights.</p>
              </Section>

              <Section title="Typography" icon={<Type className="w-3.5 h-3.5 text-indigo-500" />}>
                <select className="w-full text-xs rounded-md border border-slate-200 px-2 py-2" value={settings.fontFamily} onChange={(e) => setSettings({ fontFamily: e.target.value })}>
                  {FONTS.map((f) => (
                    <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>
                      {f.label}
                    </option>
                  ))}
                </select>
                <div className="text-sm text-slate-600 p-3 rounded-lg border border-slate-100 bg-slate-50" style={{ fontFamily: settings.fontFamily }}>
                  The quick brown fox jumps over the lazy dog — 0123456789
                </div>
              </Section>

              <Section title="Corner radius" icon={<LayoutGrid className="w-3.5 h-3.5 text-indigo-500" />}>
                <div className="flex items-center gap-3">
                  <input type="range" min={0} max={32} className="flex-1 accent-indigo-600" value={settings.borderRadius} onChange={(e) => setSettings({ borderRadius: Number(e.target.value) })} />
                  <input type="number" min={0} max={32} className="w-16 text-xs rounded-md border border-slate-200 px-2 py-1 text-right" value={settings.borderRadius} onChange={(e) => setSettings({ borderRadius: Number(e.target.value) || 0 })} />
                </div>
                <div className="flex gap-3">
                  {[4, 8, 16, 32].map((r) => (
                    <button key={r} onClick={() => setSettings({ borderRadius: r })} className={cn("flex-1 py-2 text-[11px] rounded-md border", settings.borderRadius === r ? "border-indigo-400 bg-indigo-50 text-indigo-600" : "border-slate-200 text-slate-500")} style={{ borderRadius: r * 0.75 }}>
                      {r}px
                    </button>
                  ))}
                </div>
              </Section>

              <Section title="Canvas backdrop" icon={<FileText className="w-3.5 h-3.5 text-indigo-500" />}>
                <div className="flex items-center gap-2">
                  <div className="relative w-10 h-10 rounded-lg border border-slate-200 overflow-hidden">
                    <input type="color" className="absolute -inset-2 w-16 h-16 cursor-pointer" value={/^#([0-9a-f]{3}){1,2}$/i.test(settings.canvasBackground) ? settings.canvasBackground : "#f1f5f9"} onChange={(e) => setSettings({ canvasBackground: e.target.value })} />
                  </div>
                  <input className="text-xs rounded-md border border-slate-200 px-2 py-1.5 font-mono w-28" value={settings.canvasBackground} onChange={(e) => setSettings({ canvasBackground: e.target.value })} />
                  <div className="flex gap-1.5 flex-wrap flex-1 justify-end">
                    {BG_PRESETS.map((c) => (
                      <button key={c} onClick={() => setSettings({ canvasBackground: c })} className={cn("w-6 h-6 rounded-md border border-slate-200 hover:scale-110 transition-transform", settings.canvasBackground === c && "ring-2 ring-indigo-500 ring-offset-1")} style={{ background: c }} />
                    ))}
                  </div>
                </div>
                <p className="text-[11px] text-slate-400">Also used as the page background of the exported app.</p>
              </Section>
            </>
          )}

          {tab === "meta" && (
            <Section title="Page metadata (used in the exported app)" icon={<Globe className="w-3.5 h-3.5 text-indigo-500" />}>
              <div>
                <label className="text-[11px] text-slate-500 mb-1 block">Page title (browser tab)</label>
                <input className="w-full text-xs rounded-md border border-slate-200 px-2 py-1.5" value={settings.pageTitle} onChange={(e) => setSettings({ pageTitle: e.target.value })} />
              </div>
              <div>
                <label className="text-[11px] text-slate-500 mb-1 block">Meta description (SEO)</label>
                <textarea className="w-full text-xs rounded-md border border-slate-200 px-2 py-1.5" rows={2} value={settings.pageDescription} onChange={(e) => setSettings({ pageDescription: e.target.value })} />
              </div>
              <div className="flex items-start gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 text-[11px] text-emerald-700">
                <Check className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                <span>These values flow into the exported project's <code className="font-mono">index.html</code>, <code className="font-mono">src/index.css</code> and the app's grid font.</span>
              </div>
            </Section>
          )}
        </div>

        <div className="border-t border-slate-200 p-4 flex justify-end bg-slate-50">
          <button onClick={onClose} className="text-xs px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 font-medium">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

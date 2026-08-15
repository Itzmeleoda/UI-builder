import { useMemo, useState } from "react";
import { X, FileCode, Package, MonitorSmartphone } from "lucide-react";
import { useStore } from "../state/store";
import { generateAppTsx, buildAndDownloadZip } from "../codegen/generateProjectFiles";
import { generateStaticHtml } from "../codegen/generateStaticHtml";
import { saveAs } from "file-saver";

export function ExportModal({ onClose }: { onClose: () => void }) {
  const project = useStore((s) => s.project);
  const [tab, setTab] = useState<"code" | "html">("code");
  const appTsx = useMemo(() => generateAppTsx(project), [project]);
  const staticHtml = useMemo(() => generateStaticHtml(project), [project]);
  const [busy, setBusy] = useState(false);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-6" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200">
          <div className="font-semibold text-slate-800 text-sm">Export "{project.projectName}"</div>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-md">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex gap-2 px-5 pt-3">
          <button onClick={() => setTab("code")} className={`text-xs px-3 py-1.5 rounded-t-md ${tab === "code" ? "bg-slate-100 font-medium text-slate-800" : "text-slate-400"}`}>
            React + Tailwind (App.tsx)
          </button>
          <button onClick={() => setTab("html")} className={`text-xs px-3 py-1.5 rounded-t-md ${tab === "html" ? "bg-slate-100 font-medium text-slate-800" : "text-slate-400"}`}>
            Static HTML preview
          </button>
        </div>

        <div className="flex-1 overflow-auto bg-slate-900 p-4">
          <pre className="text-[11px] text-slate-100 font-mono whitespace-pre-wrap">{tab === "code" ? appTsx : staticHtml}</pre>
        </div>

        <div className="border-t border-slate-200 p-4 flex flex-wrap gap-2 items-center bg-slate-50">
          <button
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              await buildAndDownloadZip(project, { includeElectron: false });
              setBusy(false);
            }}
            className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            <Package className="w-3.5 h-3.5" /> Download web project (.zip)
          </button>
          <button
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              await buildAndDownloadZip(project, { includeElectron: true });
              setBusy(false);
            }}
            className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-md border border-slate-300 hover:bg-white disabled:opacity-50"
          >
            <MonitorSmartphone className="w-3.5 h-3.5" /> Download web + Electron desktop wrapper (.zip)
          </button>
          <button
            onClick={() => {
              const blob = new Blob([staticHtml], { type: "text/html" });
              saveAs(blob, `${project.projectName.toLowerCase().replace(/\s+/g, "-")}.html`);
            }}
            className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-md border border-slate-300 hover:bg-white"
          >
            <FileCode className="w-3.5 h-3.5" /> Download standalone .html
          </button>
          <p className="text-[10px] text-slate-400 ml-auto max-w-xs">
            Codegen is deterministic — the same spec always produces this exact output. The .zip's <code>spec.json</code> re-imports for a lossless round trip.
          </p>
        </div>
      </div>
    </div>
  );
}

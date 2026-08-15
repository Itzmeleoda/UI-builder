import { useRef, useState } from "react";
import { X, UploadCloud, CheckCircle2, AlertTriangle, FileWarning } from "lucide-react";
import { importHtmlString, type ImportResult } from "../import/importHtml";
import { useStore } from "../state/store";

export function ImportModal({ onClose }: { onClose: () => void }) {
  const replaceProject = useStore((s) => s.replaceProject);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    const text = await file.text();
    const res = importHtmlString(text, file.name);
    setResult(res);
  };

  const apply = () => {
    if (!result) return;
    replaceProject(result.project, result.report);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-6" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200">
          <div className="font-semibold text-slate-800 text-sm">Import HTML</div>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-md">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-4">
          {!result && (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                const f = e.dataTransfer.files?.[0];
                if (f) handleFile(f);
              }}
              onClick={() => inputRef.current?.click()}
              className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl py-14 cursor-pointer ${
                dragging ? "border-indigo-400 bg-indigo-50" : "border-slate-300 hover:bg-slate-50"
              }`}
            >
              <UploadCloud className="w-8 h-8 text-slate-400" />
              <p className="text-sm text-slate-600">Drop a single .html file here, or click to browse</p>
              <p className="text-xs text-slate-400">Own-format files (with embedded spec) round-trip exactly. External HTML gets best-effort matching.</p>
              <input ref={inputRef} type="file" accept=".html,.htm" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
            </div>
          )}

          {result && (
            <div className="space-y-3">
              <div className={`flex items-start gap-2 rounded-lg p-3 text-xs ${result.report.mode === "authored-roundtrip" ? "bg-emerald-50 text-emerald-700" : "bg-sky-50 text-sky-700"}`}>
                {result.report.mode === "authored-roundtrip" ? <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" /> : <FileWarning className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                <div>
                  {result.report.mode === "authored-roundtrip" ? (
                    <>This file carries an embedded UI Builder spec — importing it is a <strong>lossless round trip</strong>.</>
                  ) : (
                    <>
                      No embedded spec found — used <strong>heuristic structural matching</strong> against the 12 component signatures. Re-exporting will
                      normalize the markup; it won't be byte-identical to the original.
                    </>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg bg-slate-50 p-2">
                  <div className="text-lg font-semibold text-slate-800">{result.report.matched.length}</div>
                  <div className="text-[10px] text-slate-500">Matched components</div>
                </div>
                <div className="rounded-lg bg-amber-50 p-2">
                  <div className="text-lg font-semibold text-amber-700">{result.report.rawBlocks}</div>
                  <div className="text-[10px] text-amber-600">Raw blocks</div>
                </div>
                <div className="rounded-lg bg-slate-50 p-2">
                  <div className="text-lg font-semibold text-slate-800">{result.report.assetsFound}</div>
                  <div className="text-[10px] text-slate-500">Assets extracted</div>
                </div>
              </div>

              {result.report.matched.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {result.report.matched.map((m, i) => (
                    <span key={i} className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-1 rounded-full">
                      {m.type} · {(m.confidence * 100).toFixed(0)}%
                    </span>
                  ))}
                </div>
              )}

              {result.report.warnings.length > 0 && (
                <div className="bg-red-50 text-red-700 rounded-lg p-3 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-medium">
                    <AlertTriangle className="w-3.5 h-3.5" /> Warnings
                  </div>
                  {result.report.warnings.map((w, i) => (
                    <div key={i}>• {w}</div>
                  ))}
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <button onClick={apply} className="flex-1 text-sm bg-indigo-600 text-white rounded-md py-2 hover:bg-indigo-700">
                  Load into canvas
                </button>
                <button onClick={() => setResult(null)} className="text-sm px-4 rounded-md border border-slate-200 hover:bg-slate-50">
                  Try another file
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

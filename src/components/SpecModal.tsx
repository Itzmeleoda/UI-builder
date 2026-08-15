import { useRef, useState } from "react";
import { X, Copy, Download, Upload, Check } from "lucide-react";
import { useStore } from "../state/store";
import { saveAs } from "file-saver";
import type { ProjectSpec } from "../types";

export function SpecModal({ onClose }: { onClose: () => void }) {
  const project = useStore((s) => s.project);
  const replaceProject = useStore((s) => s.replaceProject);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const json = JSON.stringify(project, null, 2);

  const loadSpec = async (file: File) => {
    const text = await file.text();
    try {
      const parsed = JSON.parse(text) as ProjectSpec;
      replaceProject(parsed);
      onClose();
    } catch {
      alert("Invalid spec.json — could not parse JSON.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-6" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200">
          <div className="font-semibold text-slate-800 text-sm">Project spec (schema v{project.schemaVersion})</div>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-md">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-auto bg-slate-900 p-4">
          <pre className="text-[11px] text-emerald-300 font-mono whitespace-pre-wrap">{json}</pre>
        </div>
        <div className="border-t border-slate-200 p-4 flex gap-2 bg-slate-50">
          <button
            onClick={() => {
              navigator.clipboard.writeText(json);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }}
            className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-md border border-slate-300 hover:bg-white"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied" : "Copy JSON"}
          </button>
          <button
            onClick={() => saveAs(new Blob([json], { type: "application/json" }), "spec.json")}
            className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-md border border-slate-300 hover:bg-white"
          >
            <Download className="w-3.5 h-3.5" /> Download spec.json
          </button>
          <button onClick={() => inputRef.current?.click()} className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700">
            <Upload className="w-3.5 h-3.5" /> Load spec.json
          </button>
          <input ref={inputRef} type="file" accept="application/json" className="hidden" onChange={(e) => e.target.files?.[0] && loadSpec(e.target.files[0])} />
        </div>
      </div>
    </div>
  );
}

import { useEffect, useRef, useState } from "react";
import { useStore } from "../state/store";
import { Undo2, Redo2, Upload, Download, Braces, RotateCcw, LayoutTemplate, ChevronDown, History as HistoryIcon, Keyboard } from "lucide-react";
import { cn } from "../utils/cn";

export type ModalKind = "export" | "import" | "spec" | null;

export function Toolbar({ onOpenModal }: { onOpenModal: (m: ModalKind) => void }) {
  const project = useStore((s) => s.project);
  const setProjectName = useStore((s) => s.setProjectName);
  const undo = useStore((s) => s.undo);
  const redo = useStore((s) => s.redo);
  const restoreHistory = useStore((s) => s.restoreHistory);
  const resetToDefault = useStore((s) => s.resetToDefault);
  const history = useStore((s) => s.history);
  const future = useStore((s) => s.future);
  const [historyOpen, setHistoryOpen] = useState(false);
  const popRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (popRef.current && !popRef.current.contains(e.target as Node)) setHistoryOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const canUndo = history.length > 0;
  const canRedo = future.length > 0;

  return (
    <header className="h-14 flex-shrink-0 border-b border-slate-200 bg-white flex items-center px-4 gap-2">
      <div className="flex items-center gap-2 text-indigo-600 font-semibold mr-1">
        <LayoutTemplate className="w-5 h-5" />
        <span className="hidden md:inline">UI Builder Studio</span>
      </div>
      <div className="w-px h-6 bg-slate-200 mx-1" />
      <input
        className="text-sm font-medium text-slate-700 border-b border-transparent hover:border-slate-200 focus:border-indigo-400 outline-none px-1 w-48"
        value={project.projectName}
        onChange={(e) => setProjectName(e.target.value)}
      />
      <div className="w-px h-6 bg-slate-200 mx-1" />
      <div className="flex items-center gap-1.5">
        <div className="relative flex" ref={popRef}>
          <button
            disabled={!canUndo}
            onClick={undo}
            title="Undo (⌘Z / Ctrl+Z)"
            className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-l-md border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-35 disabled:hover:bg-transparent"
          >
            <Undo2 className="w-3.5 h-3.5" />
            Undo
          </button>
          <button
            disabled={!canUndo}
            onClick={() => setHistoryOpen((o) => !o)}
            title="History — click a step to jump back"
            className="px-1 py-1.5 rounded-r-md border border-l-0 border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-35"
          >
            <ChevronDown className={cn("w-3 h-3 transition-transform", historyOpen && "rotate-180")} />
          </button>
          {historyOpen && (
            <div className="absolute left-0 top-full mt-1.5 w-64 max-h-80 overflow-auto rounded-lg border border-slate-200 bg-white shadow-xl z-50">
              <div className="px-3 py-2 border-b border-slate-100 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400 sticky top-0 bg-white">
                <HistoryIcon className="w-3 h-3" /> History
                <span className="ml-auto normal-case font-normal text-slate-300">{history.length} steps</span>
              </div>
              {history.length === 0 && <div className="px-3 py-4 text-[11px] text-slate-400 text-center">No actions yet.</div>}
              {[...history].reverse().map((entry, ri) => {
                const index = history.length - 1 - ri;
                return (
                  <button
                    key={index}
                    onClick={() => {
                      restoreHistory(index);
                      setHistoryOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-[11px] text-slate-600 hover:bg-indigo-50 flex items-center gap-2 border-b border-slate-50"
                  >
                    <span className="text-slate-300 w-4 text-right flex-shrink-0">{ri + 1}</span>
                    <span className="truncate">{entry.label}</span>
                    {index === history.length - 1 && <span className="ml-auto text-[9px] bg-indigo-100 text-indigo-600 rounded-full px-1.5 py-px flex-shrink-0">current</span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>
        <button
          disabled={!canRedo}
          onClick={redo}
          title="Redo (⌘⇧Z / Ctrl+Y)"
          className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-35"
        >
          <Redo2 className="w-3.5 h-3.5" />
          Redo
        </button>
      </div>

      <div className="flex-1" />

      <span className="hidden xl:flex items-center gap-1 text-[10px] text-slate-400 mr-1" title="Keyboard shortcuts">
        <Keyboard className="w-3 h-3" /> ⌘Z undo · ⌘⇧Z redo · ⌘D duplicate · ⌫ delete · arrows nudge
      </span>
      <button onClick={resetToDefault} title="Reset to the default showcase project" className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md text-slate-500 hover:bg-slate-100">
        <RotateCcw className="w-3.5 h-3.5" /> Reset
      </button>
      <button onClick={() => onOpenModal("spec")} className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md text-slate-500 hover:bg-slate-100">
        <Braces className="w-3.5 h-3.5" /> Spec JSON
      </button>
      <button onClick={() => onOpenModal("import")} className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md border border-slate-200 hover:bg-slate-50">
        <Upload className="w-3.5 h-3.5" /> Import HTML
      </button>
      <button onClick={() => onOpenModal("export")} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md bg-indigo-600 text-white hover:bg-indigo-700">
        <Download className="w-3.5 h-3.5" /> Export
      </button>
    </header>
  );
}

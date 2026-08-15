import { useStore } from "../state/store";
import { Undo2, Redo2, Upload, Download, Braces, RotateCcw, LayoutTemplate } from "lucide-react";

export type ModalKind = "export" | "import" | "spec" | null;

export function Toolbar({ onOpenModal }: { onOpenModal: (m: ModalKind) => void }) {
  const project = useStore((s) => s.project);
  const setProjectName = useStore((s) => s.setProjectName);
  const undo = useStore((s) => s.undo);
  const redo = useStore((s) => s.redo);
  const resetToDefault = useStore((s) => s.resetToDefault);
  const history = useStore((s) => s.history);
  const future = useStore((s) => s.future);

  return (
    <header className="h-14 flex-shrink-0 border-b border-slate-200 bg-white flex items-center px-4 gap-3">
      <div className="flex items-center gap-2 text-indigo-600 font-semibold">
        <LayoutTemplate className="w-5 h-5" />
        <span className="hidden md:inline">UI Builder Studio</span>
      </div>
      <div className="w-px h-6 bg-slate-200 mx-1" />
      <input
        className="text-sm font-medium text-slate-700 border-b border-transparent hover:border-slate-200 focus:border-indigo-400 outline-none px-1 w-52"
        value={project.projectName}
        onChange={(e) => setProjectName(e.target.value)}
      />
      <div className="flex items-center gap-1 ml-2">
        <button disabled={history.length === 0} onClick={undo} className="p-1.5 rounded-md hover:bg-slate-100 disabled:opacity-30" title="Undo">
          <Undo2 className="w-4 h-4" />
        </button>
        <button disabled={future.length === 0} onClick={redo} className="p-1.5 rounded-md hover:bg-slate-100 disabled:opacity-30" title="Redo">
          <Redo2 className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1" />

      <button onClick={resetToDefault} className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md text-slate-500 hover:bg-slate-100">
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

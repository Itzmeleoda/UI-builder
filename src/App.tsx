import { useEffect, useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { Canvas } from "./components/Canvas";
import { ParamPanel } from "./components/ParamPanel";
import { Toolbar, type ModalKind } from "./components/Toolbar";
import { ExportModal } from "./components/ExportModal";
import { ImportModal } from "./components/ImportModal";
import { SpecModal } from "./components/SpecModal";
import { AppSettingsModal } from "./components/AppSettingsModal";
import { FinishModal } from "./components/FinishModal";
import { useStore } from "./state/store";
import { Sparkles, Undo2, Redo2, X } from "lucide-react";
import { cn } from "./utils/cn";

function isTypingTarget(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  if (!el) return false;
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || el.isContentEditable;
}

function Toasts() {
  const toasts = useStore((s) => s.toasts);
  const dismissToast = useStore((s) => s.dismissToast);
  const undo = useStore((s) => s.undo);
  const redo = useStore((s) => s.redo);

  useEffect(() => {
    if (toasts.length === 0) return;
    const timers = toasts.map((t) => setTimeout(() => dismissToast(t.id), 3600));
    return () => timers.forEach(clearTimeout);
  }, [toasts, dismissToast]);

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-1.5 pointer-events-none">
      {toasts.slice(-3).map((t) => (
        <div key={t.id} className="flex items-center gap-2 bg-slate-900 text-white text-xs px-3 py-2 rounded-lg shadow-xl pointer-events-auto animate-[toast-in_.18s_ease-out]">
          <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
          <span>{t.message}</span>
          {t.action === "undo" && (
            <button onClick={undo} className="flex items-center gap-1 text-[10px] font-semibold bg-white/10 hover:bg-white/20 rounded px-1.5 py-0.5">
              <Undo2 className="w-3 h-3" /> Undo
            </button>
          )}
          {t.action === "redo" && (
            <button onClick={redo} className="flex items-center gap-1 text-[10px] font-semibold bg-white/10 hover:bg-white/20 rounded px-1.5 py-0.5">
              <Redo2 className="w-3 h-3" /> Redo
            </button>
          )}
          <button onClick={() => dismissToast(t.id)} className="opacity-50 hover:opacity-100">
            <X className="w-3 h-3" />
          </button>
        </div>
      ))}
    </div>
  );
}

export default function App() {
  const [modal, setModal] = useState<ModalKind>(null);
  const [showNote, setShowNote] = useState(true);
  const undo = useStore((s) => s.undo);
  const redo = useStore((s) => s.redo);
  const duplicateComponent = useStore((s) => s.duplicateComponent);
  const removeComponent = useStore((s) => s.removeComponent);
  const nudge = useStore((s) => s.nudge);
  const selectedId = useStore((s) => s.selectedId);
  const select = useStore((s) => s.select);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (isTypingTarget(e.target)) return;
      if (mod && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      } else if (mod && e.key.toLowerCase() === "y") {
        e.preventDefault();
        redo();
      } else if (mod && e.key.toLowerCase() === "d") {
        e.preventDefault();
        if (selectedId) duplicateComponent(selectedId);
      } else if ((e.key === "Delete" || e.key === "Backspace") && selectedId) {
        e.preventDefault();
        removeComponent(selectedId);
      } else if (e.key === "Escape") {
        select(null);
      } else if (selectedId && ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
        const step = e.shiftKey ? 4 : 1;
        const dx = e.key === "ArrowLeft" ? -step : e.key === "ArrowRight" ? step : 0;
        const dy = e.key === "ArrowUp" ? -step : e.key === "ArrowDown" ? step : 0;
        nudge(selectedId, dx, dy);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo, redo, duplicateComponent, removeComponent, nudge, selectedId, select]);

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-50 text-slate-800">
      <Toolbar onOpenModal={setModal} />

      {showNote && (
        <div className="flex items-start gap-2 bg-indigo-50 border-b border-indigo-100 px-4 py-2 text-[11px] text-indigo-700">
          <Sparkles className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
          <p className="flex-1">
            <strong>What's new:</strong> buttons, CTAs, nav links and forms are now <em>live</em> — assign actions (link, scroll-to-section,
            alert, custom JS) and they work right on the canvas <em>and</em> in the exported app. Use <strong>Settings</strong> for
            app-wide theme/meta customization and <strong>Finish & export</strong> to review wiring, complete the process and download the
            finished application.
          </p>
          <button onClick={() => setShowNote(false)} className={cn("p-0.5 hover:bg-indigo-100 rounded")}>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <div className="flex flex-1 min-h-0">
        <Sidebar />
        <Canvas />
        <ParamPanel />
      </div>

      {modal === "export" && <ExportModal onClose={() => setModal(null)} />}
      {modal === "import" && <ImportModal onClose={() => setModal(null)} />}
      {modal === "spec" && <SpecModal onClose={() => setModal(null)} />}
      {modal === "settings" && <AppSettingsModal onClose={() => setModal(null)} />}
      {modal === "finish" && <FinishModal onClose={() => setModal(null)} onExport={() => setModal("export")} />}
      <Toasts />
    </div>
  );
}

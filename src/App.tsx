import { useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { Canvas } from "./components/Canvas";
import { ParamPanel } from "./components/ParamPanel";
import { Toolbar, type ModalKind } from "./components/Toolbar";
import { ExportModal } from "./components/ExportModal";
import { ImportModal } from "./components/ImportModal";
import { SpecModal } from "./components/SpecModal";
import { Info, X } from "lucide-react";

export default function App() {
  const [modal, setModal] = useState<ModalKind>(null);
  const [showNote, setShowNote] = useState(true);

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-50 text-slate-800">
      <Toolbar onOpenModal={setModal} />

      {showNote && (
        <div className="flex items-start gap-2 bg-indigo-50 border-b border-indigo-100 px-4 py-2 text-[11px] text-indigo-700">
          <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
          <p className="flex-1">
            <strong>Reference implementation notes:</strong> this build runs as a browser app (this sandbox only produces a Vite/React web
            app — no Electron main process, filesystem, or git access). It implements the Phase-1 architecture from the spec end-to-end
            in-browser: a deterministic JSON-spec → React+Tailwind codegen engine, a matching HTML → spec import engine with signature
            matching + Raw Block fallback, 12 fully-parameterized components, an asset manifest with origin/license tracking, and an
            escape hatch on every component. "Export" produces a real buildable Vite+Tailwind project plus an Electron desktop wrapper
            template, both generated from the same spec.
          </p>
          <button onClick={() => setShowNote(false)} className="p-0.5 hover:bg-indigo-100 rounded">
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
    </div>
  );
}

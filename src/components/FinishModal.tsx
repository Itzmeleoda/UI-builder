import { useMemo, useState } from "react";
import { X, Rocket, CheckCircle2, Circle, AlertTriangle, Link2, ListChecks, Package, MousePointerClick } from "lucide-react";
import { useStore } from "../state/store";
import { COMPONENT_LIBRARY } from "../data/componentLibrary";
import type { ComponentAction, ComponentSpec } from "../types";
import { cn } from "../utils/cn";

interface ActionRow {
  comp: ComponentSpec;
  key: string;
  label: string;
  action: ComponentAction;
}

interface LinkRow {
  comp: ComponentSpec;
  label: string;
  total: number;
  linked: number;
}

function asAction(v: unknown): ComponentAction {
  const a = (v ?? { type: "none" }) as ComponentAction;
  return { type: a.type ?? "none", url: a.url ?? "", target: a.target ?? "_self", componentId: a.componentId ?? "", message: a.message ?? "", code: a.code ?? "" };
}

export function FinishModal({ onClose, onExport }: { onClose: () => void; onExport: () => void }) {
  const project = useStore((s) => s.project);
  const updateComponentParams = useStore((s) => s.updateComponentParams);
  const select = useStore((s) => s.select);
  const [done, setDone] = useState(false);

  const { actionRows, linkRows } = useMemo(() => {
    const actions: ActionRow[] = [];
    const links: LinkRow[] = [];
    for (const comp of project.components) {
      const def = COMPONENT_LIBRARY[comp.type];
      if (!def) continue;
      for (const field of def.fields) {
        if (field.type === "action") {
          actions.push({ comp, key: field.key, label: field.label, action: asAction(comp.params[field.key]) });
        }
      }
      // link-list heuristics
      const linkKeys = comp.type === "footer" ? (comp.params.columns as string[]) ?? [] : comp.type === "navbar" || comp.type === "stickyHeader" || comp.type === "breadcrumb" ? (comp.params.links ?? comp.params.items ?? []) as string[] : [];
      if (linkKeys.length > 0) {
        const total = comp.type === "footer" ? linkKeys.reduce((acc, l) => acc + (l.split("::")[1] ?? "").split(",").filter(Boolean).length, 0) : linkKeys.length;
        const linked = comp.type === "footer"
          ? linkKeys.reduce((acc, l) => acc + (l.split("::")[1] ?? "").split(",").filter(Boolean).filter((x) => x.includes("|")).length, 0)
          : linkKeys.filter((x) => x.includes("::")).length;
        links.push({ comp, label: comp.type === "footer" ? "Footer links" : comp.type === "breadcrumb" ? "Breadcrumb trail" : "Nav links", total, linked });
      }
    }
    return { actionRows: actions, linkRows: links };
  }, [project.components]);

  const unlinkedActions = actionRows.filter((r) => r.action.type === "none");
  const unlinkedLinks = linkRows.filter((r) => r.linked < r.total);
  const everythingWired = unlinkedActions.length === 0 && unlinkedLinks.length === 0;

  const ACTION_OPTS = [
    { value: "none", label: "No action" },
    { value: "link", label: "Link (URL)" },
    { value: "scroll", label: "Scroll to section" },
    { value: "alert", label: "Alert" },
    { value: "custom", label: "Custom JS" },
  ] as const;

  const setAction = (row: ActionRow, patch: Partial<ComponentAction>) => {
    const next: ComponentAction = { ...row.action, ...patch, type: patch.type ?? row.action.type };
    updateComponentParams(row.comp.id, { [row.key]: next }, "Wire action");
  };

  const quickLink = (row: ActionRow, url: string) => setAction(row, { type: "link", url, target: /^https?:\/\//i.test(url) ? "_blank" : "_self" });

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[95] p-6" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[88vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200">
          <div className="flex items-center gap-2 font-semibold text-slate-800 text-sm">
            <Rocket className="w-4 h-4 text-indigo-600" />
            Finish & publish — wire up your app
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-md">
            <X className="w-4 h-4" />
          </button>
        </div>

        {done && (
          <div className="m-5 flex items-start gap-2.5 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-[12px] text-emerald-700">
            <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div>
              <strong>All wired up!</strong> Every button, CTA and link in your app now has a working action. Head to export to download the
              finished application — the generated code will include all these handlers.
            </div>
          </div>
        )}

        <div className="px-5 py-3 flex flex-wrap items-center gap-2 text-[11px] border-b border-slate-100">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-medium">
            <MousePointerClick className="w-3 h-3" /> {actionRows.length} interactive elements
          </span>
          <span className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-full font-medium", everythingWired ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700")}>
            {everythingWired ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
            {everythingWired ? "Everything linked" : `${unlinkedActions.length + unlinkedLinks.length} things need wiring`}
          </span>
        </div>

        <div className="flex-1 overflow-auto p-5 space-y-4">
          {actionRows.length === 0 && linkRows.length === 0 && (
            <div className="text-center py-10">
              <ListChecks className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              <p className="text-sm text-slate-400">No interactive components on the canvas yet.</p>
              <p className="text-[11px] text-slate-300 mt-1">Add buttons, CTAs, navbars or forms from the Components panel — they'll show up here for wiring.</p>
            </div>
          )}

          {actionRows.map((row) => {
            const wired = row.action.type !== "none";
            return (
              <div key={`${row.comp.id}-${row.key}`} className={cn("rounded-xl border p-3", wired ? "border-slate-200" : "border-amber-300 bg-amber-50/50")}>
                <div className="flex items-center gap-2 flex-wrap">
                  <button onClick={() => { select(row.comp.id); onClose(); }} className="text-[12px] font-semibold text-indigo-600 hover:underline">
                    {row.comp.name}
                  </button>
                  <span className="text-[10px] text-slate-400">·</span>
                  <span className="text-[11px] text-slate-500">{row.label}</span>
                  {wired ? (
                    <span className="ml-auto flex items-center gap-1 text-[10px] font-semibold text-emerald-600">
                      <CheckCircle2 className="w-3 h-3" /> Linked
                    </span>
                  ) : (
                    <span className="ml-auto flex items-center gap-1 text-[10px] font-semibold text-amber-600">
                      <AlertTriangle className="w-3 h-3" /> No action
                    </span>
                  )}
                </div>
                <div className="mt-2 flex items-center gap-2 flex-wrap">
                  <select className="text-[11px] rounded-md border border-slate-200 px-2 py-1.5 bg-white" value={row.action.type} onChange={(e) => setAction(row, { type: e.target.value as ComponentAction["type"] })}>
                    {ACTION_OPTS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                  {row.action.type === "link" && (
                    <>
                      <input className="flex-1 min-w-[160px] text-[11px] rounded-md border border-slate-200 px-2 py-1.5" placeholder="https://… or /page" value={row.action.url ?? ""} onChange={(e) => setAction(row, { url: e.target.value })} />
                      <button onClick={() => setAction(row, { target: row.action.target === "_blank" ? "_self" : "_blank" })} className="text-[10px] px-2 py-1.5 rounded-md border border-slate-200 text-slate-500 hover:bg-white">
                        {row.action.target === "_blank" ? "New tab" : "Same tab"}
                      </button>
                    </>
                  )}
                  {row.action.type === "scroll" && (
                    <select className="flex-1 min-w-[160px] text-[11px] rounded-md border border-slate-200 px-2 py-1.5 bg-white" value={row.action.componentId ?? ""} onChange={(e) => setAction(row, { componentId: e.target.value })}>
                      <option value="">— pick target widget —</option>
                      {project.components.filter((c) => c.id !== row.comp.id).map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  )}
                  {row.action.type === "alert" && (
                    <input className="flex-1 min-w-[160px] text-[11px] rounded-md border border-slate-200 px-2 py-1.5" placeholder="Alert message…" value={row.action.message ?? ""} onChange={(e) => setAction(row, { message: e.target.value })} />
                  )}
                  {row.action.type === "custom" && (
                    <input className="flex-1 min-w-[160px] text-[11px] rounded-md border border-slate-200 px-2 py-1.5 font-mono" placeholder="console.log('hi')" value={row.action.code ?? ""} onChange={(e) => setAction(row, { code: e.target.value })} />
                  )}
                  {!wired && (
                    <button onClick={() => quickLink(row, "https://example.com")} className="text-[10px] px-2 py-1.5 rounded-md border border-slate-300 text-slate-600 hover:bg-white flex items-center gap-1">
                      <Link2 className="w-3 h-3" /> Quick-link
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {linkRows.map((row) => {
            const complete = row.linked >= row.total;
            return (
              <div key={`${row.comp.id}-links`} className={cn("rounded-xl border p-3 flex items-center gap-3", complete ? "border-slate-200" : "border-amber-300 bg-amber-50/50")}>
                {complete ? <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" /> : <Circle className="w-4 h-4 text-amber-400 flex-shrink-0" />}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <button onClick={() => { select(row.comp.id); onClose(); }} className="text-[12px] font-semibold text-indigo-600 hover:underline truncate">
                      {row.comp.name}
                    </button>
                    <span className="text-[11px] text-slate-500">{row.label}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {row.linked} of {row.total} linked
                    {!complete && " — edit in the inspector's Content section (add ::URL after each label)"}
                  </div>
                </div>
                <span className={cn("text-[10px] font-semibold", complete ? "text-emerald-600" : "text-amber-600")}>{complete ? "Linked" : "Incomplete"}</span>
              </div>
            );
          })}
        </div>

        <div className="border-t border-slate-200 p-4 flex gap-2 bg-slate-50">
          <button onClick={onClose} className="text-xs px-3 py-2 rounded-md border border-slate-300 hover:bg-white">
            Keep editing
          </button>
          <button
            onClick={() => {
              if (everythingWired) setDone(true);
              else {
                const first = unlinkedActions[0];
                if (first) {
                  select(first.comp.id);
                  onClose();
                }
              }
            }}
            className="text-xs px-3 py-2 rounded-md border border-indigo-200 text-indigo-600 hover:bg-indigo-50 flex items-center gap-1.5"
          >
            {everythingWired ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
            {everythingWired ? "Mark as complete" : "Open first unwired element"}
          </button>
          <button onClick={onExport} className="ml-auto flex items-center gap-1.5 text-xs px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 font-medium">
            <Package className="w-3.5 h-3.5" /> Export the app
          </button>
        </div>
      </div>
    </div>
  );
}

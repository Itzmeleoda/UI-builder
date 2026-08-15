import { useMemo, useState } from "react";
import { useStore } from "../state/store";
import { COMPONENT_LIBRARY } from "../data/componentLibrary";
import type { ParamField } from "../types";
import { AssetPickerInline } from "./AssetPickerInline";
import { Info } from "lucide-react";

const GROUP_LABEL: Record<string, string> = {
  content: "Content",
  style: "Style",
  motion: "Motion",
  behavior: "Behavior",
  advanced: "Advanced",
};

function ListEditor({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [text, setText] = useState((value ?? []).join("\n"));
  return (
    <textarea
      className="w-full text-xs rounded-md border border-slate-200 px-2 py-1.5 font-mono"
      rows={Math.min(6, Math.max(3, (value ?? []).length))}
      value={text}
      onChange={(e) => {
        setText(e.target.value);
        onChange(e.target.value.split("\n").filter((l) => l.length > 0));
      }}
    />
  );
}

function AccordionItemsEditor({ value, onChange }: { value: { title: string; body: string }[]; onChange: (v: { title: string; body: string }[]) => void }) {
  const [text, setText] = useState((value ?? []).map((v) => `${v.title}::${v.body}`).join("\n"));
  return (
    <div>
      <textarea
        className="w-full text-xs rounded-md border border-slate-200 px-2 py-1.5 font-mono"
        rows={4}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          const items = e.target.value
            .split("\n")
            .filter(Boolean)
            .map((line) => {
              const [title, ...rest] = line.split("::");
              return { title: title?.trim() ?? "", body: rest.join("::").trim() };
            });
          onChange(items);
        }}
      />
      <p className="text-[10px] text-slate-400 mt-1">One item per line, format: Title::Body text</p>
    </div>
  );
}

function TableEditor({ columns, rows, onColumns, onRows }: { columns: string[]; rows: string[][]; onColumns: (c: string[]) => void; onRows: (r: string[][]) => void }) {
  const [colsText, setColsText] = useState((columns ?? []).join(", "));
  const [rowsText, setRowsText] = useState((rows ?? []).map((r) => r.join(", ")).join("\n"));
  return (
    <div className="space-y-2">
      <div>
        <label className="text-[11px] text-slate-500">Columns (comma separated)</label>
        <input
          className="w-full text-xs rounded-md border border-slate-200 px-2 py-1.5 mt-0.5"
          value={colsText}
          onChange={(e) => {
            setColsText(e.target.value);
            onColumns(e.target.value.split(",").map((c) => c.trim()).filter(Boolean));
          }}
        />
      </div>
      <div>
        <label className="text-[11px] text-slate-500">Rows (one per line, comma separated cells)</label>
        <textarea
          className="w-full text-xs rounded-md border border-slate-200 px-2 py-1.5 font-mono mt-0.5"
          rows={4}
          value={rowsText}
          onChange={(e) => {
            setRowsText(e.target.value);
            onRows(e.target.value.split("\n").filter(Boolean).map((line) => line.split(",").map((c) => c.trim())));
          }}
        />
      </div>
    </div>
  );
}

function FieldInput({ field, value, onChange }: { field: ParamField; value: unknown; onChange: (v: unknown) => void }) {
  switch (field.type) {
    case "text":
      return <input className="w-full text-xs rounded-md border border-slate-200 px-2 py-1.5" value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} />;
    case "textarea":
      return <textarea className="w-full text-xs rounded-md border border-slate-200 px-2 py-1.5" rows={3} value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} />;
    case "number":
      return (
        <input
          type="number"
          min={field.min}
          max={field.max}
          step={field.step ?? 1}
          className="w-full text-xs rounded-md border border-slate-200 px-2 py-1.5"
          value={Number(value ?? 0)}
          onChange={(e) => onChange(Number(e.target.value))}
        />
      );
    case "color":
      return (
        <div className="flex items-center gap-2">
          <input
            type="color"
            className="w-8 h-8 rounded border border-slate-200 p-0.5 flex-shrink-0"
            value={/^#([0-9a-f]{3}){1,2}$/i.test(String(value)) ? String(value) : "#888888"}
            onChange={(e) => onChange(e.target.value)}
          />
          <input className="w-full text-xs rounded-md border border-slate-200 px-2 py-1.5 font-mono" value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} />
        </div>
      );
    case "boolean":
      return (
        <button
          onClick={() => onChange(!value)}
          className={`w-10 h-5 rounded-full transition-colors relative ${value ? "bg-indigo-500" : "bg-slate-300"}`}
        >
          <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${value ? "left-5" : "left-0.5"}`} />
        </button>
      );
    case "select":
    case "easing":
    case "trigger":
      return (
        <select className="w-full text-xs rounded-md border border-slate-200 px-2 py-1.5" value={String(value ?? "")} onChange={(e) => onChange(e.target.value)}>
          {field.options?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      );
    case "asset":
      return <AssetPickerInline value={String(value ?? "")} onChange={(v) => onChange(v)} />;
    case "list":
      return <ListEditor value={(value as string[]) ?? []} onChange={onChange} />;
    default:
      return null;
  }
}

export function ParamPanel() {
  const project = useStore((s) => s.project);
  const selectedId = useStore((s) => s.selectedId);
  const updateComponentParams = useStore((s) => s.updateComponentParams);
  const updateComponentMeta = useStore((s) => s.updateComponentMeta);

  const selected = project.components.find((c) => c.id === selectedId);

  const grouped = useMemo(() => {
    if (!selected) return {};
    const def = COMPONENT_LIBRARY[selected.type];
    const groups: Record<string, ParamField[]> = {};
    def.fields.forEach((f) => {
      groups[f.group] = groups[f.group] ?? [];
      groups[f.group].push(f);
    });
    return groups;
  }, [selected]);

  if (!selected) {
    return (
      <aside className="w-80 flex-shrink-0 border-l border-slate-200 bg-white p-4">
        <div className="text-sm text-slate-400 text-center mt-16">Select a component to edit its parameters.</div>
      </aside>
    );
  }

  const def = COMPONENT_LIBRARY[selected.type];

  return (
    <aside className="w-80 flex-shrink-0 border-l border-slate-200 bg-white p-4 overflow-y-auto">
      <div className="mb-4">
        <div className="text-[11px] uppercase tracking-wide text-slate-400">{def.category}</div>
        <input
          className="text-sm font-semibold text-slate-800 w-full mt-0.5 border-b border-transparent hover:border-slate-200 focus:border-indigo-400 outline-none"
          value={selected.name}
          onChange={(e) => updateComponentMeta(selected.id, { name: e.target.value })}
        />
        <p className="text-[11px] text-slate-400 mt-1">{def.description}</p>
        {selected.origin && selected.origin !== "authored" && (
          <div className="mt-2 flex items-start gap-1.5 bg-amber-50 border border-amber-200 rounded-md px-2 py-1.5 text-[10px] text-amber-700">
            <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
            <span>
              {selected.origin === "imported-matched"
                ? `Matched from imported HTML (confidence ${(selected.matchConfidence! * 100).toFixed(0)}%). Values below were back-filled from the source markup.`
                : "Imported markup that couldn't be matched to a component — edit the raw HTML in the Advanced section below."}
            </span>
          </div>
        )}
      </div>

      {selected.type === "table" ? (
        <div className="mb-4">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">Content</div>
          <TableEditor
            columns={(selected.params.columns as string[]) ?? []}
            rows={(selected.params.rows as string[][]) ?? []}
            onColumns={(c) => updateComponentParams(selected.id, { columns: c })}
            onRows={(r) => updateComponentParams(selected.id, { rows: r })}
          />
        </div>
      ) : null}

      {selected.type === "accordion" ? (
        <div className="mb-4">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">Content</div>
          <AccordionItemsEditor
            value={(selected.params.items as { title: string; body: string }[]) ?? []}
            onChange={(items) => updateComponentParams(selected.id, { items })}
          />
        </div>
      ) : null}

      {Object.entries(grouped).map(([group, fields]) => (
        <div key={group} className="mb-4">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">{GROUP_LABEL[group] ?? group}</div>
          <div className="space-y-3">
            {fields.map((field) => (
              <div key={field.key}>
                <label className="text-[11px] text-slate-500 mb-1 block">{field.label}</label>
                <FieldInput field={field} value={selected.params[field.key]} onChange={(v: unknown) => updateComponentParams(selected.id, { [field.key]: v })} />
                {field.help && <p className="text-[10px] text-slate-400 mt-0.5">{field.help}</p>}
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="mb-2 pt-2 border-t border-slate-100">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">Escape hatch</div>
        <div className="space-y-3">
          <div>
            <label className="text-[11px] text-slate-500 mb-1 block">Custom class name</label>
            <input
              className="w-full text-xs rounded-md border border-slate-200 px-2 py-1.5 font-mono"
              placeholder="e.g. my-custom-class"
              value={selected.customClassName ?? ""}
              onChange={(e) => updateComponentMeta(selected.id, { customClassName: e.target.value })}
            />
          </div>
          <div>
            <label className="text-[11px] text-slate-500 mb-1 block">Custom code slot (sanitized before render/export)</label>
            <textarea
              className="w-full text-xs rounded-md border border-slate-200 px-2 py-1.5 font-mono"
              rows={4}
              placeholder="<!-- raw markup, injected & sanitized -->"
              value={selected.customCode ?? ""}
              onChange={(e) => updateComponentMeta(selected.id, { customCode: e.target.value })}
            />
          </div>
        </div>
      </div>
    </aside>
  );
}

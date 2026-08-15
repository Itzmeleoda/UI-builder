import { useMemo, useState } from "react";
import { useStore } from "../state/store";
import { COMPONENT_LIBRARY } from "../data/componentLibrary";
import type { ParamField } from "../types";
import { AssetPickerInline } from "./AssetPickerInline";
import { PICKER_ICONS } from "../data/iconMap";
import { cn } from "../utils/cn";
import { Info, Copy, Trash2, ChevronDown, AlignLeft, AlignCenter, AlignRight } from "lucide-react";

const GROUP_LABEL: Record<string, string> = {
  content: "Content",
  style: "Style",
  motion: "Motion",
  behavior: "Behavior",
  advanced: "Advanced",
};

const PRESET_COLORS = ["#111827", "#ffffff", "#6366f1", "#8b5cf6", "#ec4899", "#ef4444", "#f59e0b", "#10b981", "#0ea5e9", "#f3f4f6", "#e5e7eb", "rgba(0,0,0,0.55)"];

function ListEditor({ value, onChange, help }: { value: string[]; onChange: (v: string[]) => void; help?: string }) {
  const [text, setText] = useState((value ?? []).join("\n"));
  return (
    <div>
      <textarea
        className="w-full text-xs rounded-md border border-slate-200 px-2 py-1.5 font-mono focus:border-indigo-300 outline-none"
        rows={Math.min(8, Math.max(3, (value ?? []).length))}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          onChange(e.target.value.split("\n").filter((l) => l.length > 0));
        }}
      />
      {help && <p className="text-[10px] text-slate-400 mt-1">{help}</p>}
    </div>
  );
}

function AccordionItemsEditor({ value, onChange }: { value: { title: string; body: string }[]; onChange: (v: { title: string; body: string }[]) => void }) {
  const [text, setText] = useState((value ?? []).map((v) => `${v.title}::${v.body}`).join("\n"));
  return (
    <div>
      <textarea
        className="w-full text-xs rounded-md border border-slate-200 px-2 py-1.5 font-mono focus:border-indigo-300 outline-none"
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
          className="w-full text-xs rounded-md border border-slate-200 px-2 py-1.5 mt-0.5 focus:border-indigo-300 outline-none"
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
          className="w-full text-xs rounded-md border border-slate-200 px-2 py-1.5 font-mono mt-0.5 focus:border-indigo-300 outline-none"
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

const INPUT_CLS = "w-full text-xs rounded-md border border-slate-200 px-2 py-1.5 focus:border-indigo-300 outline-none";

function FieldInput({ field, value, onChange }: { field: ParamField; value: unknown; onChange: (v: unknown) => void }) {
  switch (field.type) {
    case "text":
      return <input className={INPUT_CLS} value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} />;
    case "textarea":
      return <textarea className={cn(INPUT_CLS, "font-mono")} rows={3} value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} />;
    case "number":
      return (
        <input
          type="number"
          min={field.min}
          max={field.max}
          step={field.step ?? 1}
          className={INPUT_CLS}
          value={Number(value ?? 0)}
          onChange={(e) => onChange(Number(e.target.value))}
        />
      );
    case "range": {
      const min = field.min ?? 0;
      const max = field.max ?? 100;
      const num = Number(value ?? 0);
      return (
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={min}
            max={max}
            step={field.step ?? 1}
            className="flex-1 accent-indigo-600"
            value={num}
            onChange={(e) => onChange(Number(e.target.value))}
          />
          <input
            type="number"
            min={min}
            max={max}
            step={field.step ?? 1}
            className="w-16 text-xs rounded-md border border-slate-200 px-1.5 py-1 text-right focus:border-indigo-300 outline-none"
            value={num}
            onChange={(e) => onChange(Number(e.target.value))}
          />
        </div>
      );
    }
    case "color": {
      const swatch = /^#([0-9a-f]{3}){1,2}$/i.test(String(value)) ? String(value) : "#888888";
      return (
        <div>
          <div className="flex items-center gap-2">
            <div className="relative w-8 h-8 rounded-md border border-slate-200 overflow-hidden flex-shrink-0">
              <input
                type="color"
                className="absolute -inset-2 w-14 h-14 cursor-pointer"
                value={swatch}
                onChange={(e) => onChange(e.target.value)}
              />
            </div>
            <input className={cn(INPUT_CLS, "font-mono")} value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} />
          </div>
          <div className="flex gap-1 mt-1.5 flex-wrap">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => onChange(c)}
                title={c}
                className={cn("w-4.5 h-4.5 rounded-full border border-slate-200 hover:scale-110 transition-transform", String(value) === c && "ring-2 ring-indigo-500 ring-offset-1")}
                style={{ width: 18, height: 18, background: c }}
              />
            ))}
          </div>
        </div>
      );
    }
    case "boolean":
      return (
        <button
          onClick={() => onChange(!value)}
          className={cn("w-10 h-5 rounded-full transition-colors relative", value ? "bg-indigo-500" : "bg-slate-300")}
        >
          <span className={cn("absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all", value ? "left-5" : "left-0.5")} />
        </button>
      );
    case "radio":
      return (
        <div className="flex bg-slate-100 rounded-lg p-0.5">
          {field.options?.map((o) => (
            <button
              key={o.value}
              onClick={() => onChange(o.value)}
              className={cn("flex-1 text-[11px] py-1 px-1.5 rounded-md font-medium transition-colors", String(value) === o.value ? "bg-white shadow-sm text-indigo-600" : "text-slate-500 hover:text-slate-700")}
            >
              {o.label}
            </button>
          ))}
        </div>
      );
    case "alignment":
      return (
        <div className="flex bg-slate-100 rounded-lg p-0.5">
          {field.options?.map((o) => {
            const Icon = o.value === "left" ? AlignLeft : o.value === "right" ? AlignRight : AlignCenter;
            return (
              <button
                key={o.value}
                onClick={() => onChange(o.value)}
                title={o.label}
                className={cn("flex-1 flex items-center justify-center py-1 rounded-md transition-colors", String(value ?? "left") === o.value ? "bg-white shadow-sm text-indigo-600" : "text-slate-400 hover:text-slate-600")}
              >
                <Icon className="w-3.5 h-3.5" />
              </button>
            );
          })}
        </div>
      );
    case "icon": {
      const options = field.options ?? [];
      return (
        <div className="flex items-center gap-2">
          <div className="grid grid-cols-8 gap-0.5 flex-1 max-h-20 overflow-auto border border-slate-200 rounded-md p-1">
            {options.map((o) => {
              const Icon = PICKER_ICONS[o.value];
              if (!Icon) return null;
              return (
                <button
                  key={o.value}
                  title={o.label}
                  onClick={() => onChange(o.value)}
                  className={cn("p-1 rounded hover:bg-slate-100 flex items-center justify-center", String(value) === o.value && "bg-indigo-50 ring-1 ring-indigo-400 text-indigo-600")}
                >
                  <Icon className="w-3.5 h-3.5" />
                </button>
              );
            })}
          </div>
        </div>
      );
    }
    case "font":
      return (
        <select className={INPUT_CLS} value={String(value ?? "")} onChange={(e) => onChange(e.target.value)}>
          {field.options?.map((o) => (
            <option key={o.value} value={o.value} style={{ fontFamily: o.value }}>
              {o.label}
            </option>
          ))}
        </select>
      );
    case "select":
    case "easing":
    case "trigger":
      return (
        <select className={INPUT_CLS} value={String(value ?? "")} onChange={(e) => onChange(e.target.value)}>
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
      return <ListEditor value={(value as string[]) ?? []} onChange={onChange} help={field.help} />;
    default:
      return null;
  }
}

function BoxEditor({ id }: { id: string }) {
  const box = useStore((s) => s.project.components.find((c) => c.id === id)?.box);
  const commitBoxes = useStore((s) => s.commitBoxes);
  const moveResize = useStore((s) => s.moveResize);
  const cols = useStore((s) => s.project.cols);
  if (!box) return null;
  const field = (label: string, key: "x" | "y" | "w" | "h", min: number, max: number) => (
    <div>
      <label className="text-[10px] text-slate-400 block mb-0.5">{label}</label>
      <input
        type="number"
        className="w-full text-xs rounded-md border border-slate-200 px-1.5 py-1 text-center focus:border-indigo-300 outline-none"
        value={box[key]}
        min={min}
        max={max}
        onChange={(e) => {
          const v = Math.max(min, Math.min(max, Number(e.target.value) || 0));
          moveResize(id, { ...box, [key]: v });
        }}
        onBlur={() => commitBoxes([{ id, box }], "Move / resize")}
        onKeyDown={(e) => {
          if (e.key === "Enter") commitBoxes([{ id, box }], "Move / resize");
        }}
      />
    </div>
  );
  return (
    <div className="grid grid-cols-4 gap-1.5">
      {field("X", "x", 0, cols - Math.max(1, box.w))}
      {field("Y", "y", 0, 999)}
      {field("W", "w", 1, cols)}
      {field("H", "h", 1, 200)}
    </div>
  );
}

export function ParamPanel() {
  const project = useStore((s) => s.project);
  const selectedId = useStore((s) => s.selectedId);
  const updateComponentParams = useStore((s) => s.updateComponentParams);
  const updateComponentMeta = useStore((s) => s.updateComponentMeta);
  const duplicateComponent = useStore((s) => s.duplicateComponent);
  const removeComponent = useStore((s) => s.removeComponent);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

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
      <aside className="w-80 flex-shrink-0 border-l border-slate-200 bg-white">
        <div className="p-4 text-center mt-16">
          <div className="text-2xl mb-2">🎛️</div>
          <div className="text-sm text-slate-400">Select a component to edit its parameters.</div>
          <div className="text-[11px] text-slate-300 mt-1 leading-relaxed">
            Every component is fully parameterized — content, style, motion and behavior.
          </div>
        </div>
      </aside>
    );
  }

  const def = COMPONENT_LIBRARY[selected.type];

  const toggleGroup = (g: string) => setCollapsed((c) => ({ ...c, [g]: !c[g] }));

  return (
    <aside className="w-80 flex-shrink-0 border-l border-slate-200 bg-white overflow-y-auto">
      <div className="p-4 pb-2 sticky top-0 bg-white z-10 border-b border-slate-100">
        <div className="text-[11px] uppercase tracking-wide text-slate-400">{def.category}</div>
        <input
          className="text-sm font-semibold text-slate-800 w-full mt-0.5 border-b border-transparent hover:border-slate-200 focus:border-indigo-400 outline-none"
          value={selected.name}
          onChange={(e) => updateComponentMeta(selected.id, { name: e.target.value }, "Rename component")}
        />
        <p className="text-[11px] text-slate-400 mt-1">{def.description}</p>
        <div className="flex gap-1.5 mt-2">
          <button onClick={() => duplicateComponent(selected.id)} className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50">
            <Copy className="w-3 h-3" /> Duplicate
          </button>
          <button onClick={() => removeComponent(selected.id)} className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-md border border-red-200 text-red-500 hover:bg-red-50">
            <Trash2 className="w-3 h-3" /> Delete
          </button>
        </div>
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

      <div className="p-4 space-y-3">
        <div className="rounded-lg border border-slate-200 overflow-hidden">
          <div className="px-3 py-2 bg-slate-50 flex items-center justify-between cursor-pointer select-none" onClick={() => toggleGroup("position")}>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Position & size</span>
            <ChevronDown className={cn("w-3.5 h-3.5 text-slate-400 transition-transform", !collapsed["position"] && "rotate-180")} />
          </div>
          {!collapsed["position"] && (
            <div className="p-3">
              <BoxEditor id={selected.id} />
              <p className="text-[10px] text-slate-400 mt-1.5">Grid units — 1 unit = {project.rowHeight}px tall, {project.cols} columns wide.</p>
            </div>
          )}
        </div>

        {selected.type === "table" && (
          <div className="rounded-lg border border-slate-200 overflow-hidden">
            <div className="px-3 py-2 bg-slate-50 cursor-pointer select-none" onClick={() => toggleGroup("table")}>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Table data</span>
            </div>
            {!collapsed["table"] && (
              <div className="p-3">
                <TableEditor
                  columns={(selected.params.columns as string[]) ?? []}
                  rows={(selected.params.rows as string[][]) ?? []}
                  onColumns={(c) => updateComponentParams(selected.id, { columns: c }, "Edit table")}
                  onRows={(r) => updateComponentParams(selected.id, { rows: r }, "Edit table")}
                />
              </div>
            )}
          </div>
        )}

        {selected.type === "accordion" && (
          <div className="rounded-lg border border-slate-200 overflow-hidden">
            <div className="px-3 py-2 bg-slate-50 cursor-pointer select-none" onClick={() => toggleGroup("accordion")}>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Accordion items</span>
            </div>
            {!collapsed["accordion"] && (
              <div className="p-3">
                <AccordionItemsEditor
                  value={(selected.params.items as { title: string; body: string }[]) ?? []}
                  onChange={(items) => updateComponentParams(selected.id, { items }, "Edit accordion")}
                />
              </div>
            )}
          </div>
        )}

        {Object.entries(grouped).map(([group, fields]) => (
          <div key={group} className="rounded-lg border border-slate-200 overflow-hidden">
            <div className="px-3 py-2 bg-slate-50 flex items-center justify-between cursor-pointer select-none" onClick={() => toggleGroup(group)}>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{GROUP_LABEL[group] ?? group}</span>
              <ChevronDown className={cn("w-3.5 h-3.5 text-slate-400 transition-transform", !collapsed[group] && "rotate-180")} />
            </div>
            {!collapsed[group] && (
              <div className="p-3 space-y-3">
                {fields.map((field) => (
                  <div key={field.key}>
                    <label className="text-[11px] text-slate-500 mb-1 block">{field.label}</label>
                    <FieldInput field={field} value={selected.params[field.key]} onChange={(v: unknown) => updateComponentParams(selected.id, { [field.key]: v }, `Edit ${field.label}`)} />
                    {field.help && <p className="text-[10px] text-slate-400 mt-0.5">{field.help}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        <div className="rounded-lg border border-slate-200 overflow-hidden">
          <div className="px-3 py-2 bg-slate-50 flex items-center justify-between cursor-pointer select-none" onClick={() => toggleGroup("escape")}>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Escape hatch</span>
            <ChevronDown className={cn("w-3.5 h-3.5 text-slate-400 transition-transform", !collapsed["escape"] && "rotate-180")} />
          </div>
          {!collapsed["escape"] && (
            <div className="p-3 space-y-3">
              <div>
                <label className="text-[11px] text-slate-500 mb-1 block">Custom class name</label>
                <input
                  className={cn(INPUT_CLS, "font-mono")}
                  placeholder="e.g. my-custom-class"
                  value={selected.customClassName ?? ""}
                  onChange={(e) => updateComponentMeta(selected.id, { customClassName: e.target.value }, "Edit class name")}
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-500 mb-1 block">Custom code slot (sanitized before render/export)</label>
                <textarea
                  className={cn(INPUT_CLS, "font-mono")}
                  rows={4}
                  placeholder="<!-- raw markup, injected & sanitized -->"
                  value={selected.customCode ?? ""}
                  onChange={(e) => updateComponentMeta(selected.id, { customCode: e.target.value }, "Edit custom code")}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

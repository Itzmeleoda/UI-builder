import { create } from "zustand";
import { v4 as uuid } from "uuid";
import type { AlignKind, AssetRecord, ComponentSpec, ComponentType, GridBox, ProjectSpec, ToastItem } from "../types";
import { COMPONENT_LIBRARY } from "../data/componentLibrary";
import { createDefaultProject } from "../data/defaultProject";
import type { ImportReport } from "../import/importHtml";

interface HistoryEntry {
  project: ProjectSpec;
  label: string;
  at: number;
}

const HISTORY_LIMIT = 150;
const COALESCE_MS = 900;

interface StoreState {
  project: ProjectSpec;
  selectedId: string | null;
  lastImportReport: ImportReport | null;
  history: HistoryEntry[];
  future: HistoryEntry[];
  toasts: ToastItem[];
  select: (id: string | null) => void;
  addComponent: (type: ComponentType, box?: Partial<GridBox>, params?: Record<string, unknown>) => void;
  updateComponentParams: (id: string, patch: Record<string, unknown>, label?: string) => void;
  updateComponentMeta: (id: string, patch: Partial<Pick<ComponentSpec, "name" | "customClassName" | "customCode">>, label?: string) => void;
  /** live position updates while dragging — no history */
  moveResize: (id: string, box: GridBox) => void;
  /** commits position updates to history (drag end, alignment tools…) */
  commitBoxes: (boxes: { id: string; box: GridBox }[], label?: string) => void;
  removeComponent: (id: string) => void;
  duplicateComponent: (id: string) => void;
  setProjectName: (name: string) => void;
  replaceProject: (project: ProjectSpec, report?: ImportReport | null, label?: string) => void;
  addAsset: (asset: AssetRecord) => void;
  swapAsset: (componentId: string, paramKey: string, url: string) => void;
  swapComponents: (idA: string, idB: string) => void;
  alignSelected: (kind: AlignKind) => void;
  distribute: (axis: "horizontal" | "vertical") => void;
  autoArrange: () => void;
  nudge: (id: string, dx: number, dy: number) => void;
  resetToDefault: () => void;
  undo: () => void;
  redo: () => void;
  restoreHistory: (index: number) => void;
  pushToast: (message: string, action?: ToastItem["action"]) => void;
  dismissToast: (id: string) => void;
}

function snapshot(project: ProjectSpec): ProjectSpec {
  return JSON.parse(JSON.stringify(project));
}

/** Push a snapshot onto the history stack; coalesces rapid same-label edits
 *  so slider drags etc. collapse into a single undo step. */
function pushHistory(history: HistoryEntry[], project: ProjectSpec, label: string): HistoryEntry[] {
  const last = history[history.length - 1];
  const now = Date.now();
  if (last && last.label === label && now - last.at < COALESCE_MS) {
    return history; // keep the original pre-edit snapshot as the undo target
  }
  return [...history, { project: snapshot(project), label, at: now }].slice(-HISTORY_LIMIT);
}

function cloneProject(project: ProjectSpec): ProjectSpec {
  return { ...project, components: [...project.components], assets: [...project.assets] };
}

function toast(message: string, action?: ToastItem["action"]): ToastItem {
  return { id: uuid(), message, action };
}

export const useStore = create<StoreState>((set, get) => ({
  project: createDefaultProject(),
  selectedId: null,
  lastImportReport: null,
  history: [],
  future: [],
  toasts: [],

  select: (id) => set({ selectedId: id }),

  addComponent: (type, box, params) => {
    const def = COMPONENT_LIBRARY[type];
    const newComp: ComponentSpec = {
      id: uuid(),
      type,
      name: def.label,
      box: { ...def.defaultBox, ...box },
      params: { ...def.defaultParams, ...params },
      origin: "authored",
    };
    set((s) => ({
      history: pushHistory(s.history, s.project, `Add ${def.label}`),
      future: [],
      project: { ...s.project, components: [...s.project.components, newComp] },
      selectedId: newComp.id,
      toasts: [...s.toasts, toast(`Added “${def.label}”`, "undo")],
    }));
  },

  updateComponentParams: (id, patch, label = "Edit parameters") =>
    set((s) => ({
      history: pushHistory(s.history, s.project, label),
      future: [],
      project: {
        ...s.project,
        components: s.project.components.map((c) => (c.id === id ? { ...c, params: { ...c.params, ...patch } } : c)),
      },
    })),

  updateComponentMeta: (id, patch, label = "Edit component") =>
    set((s) => ({
      history: pushHistory(s.history, s.project, label),
      future: [],
      project: {
        ...s.project,
        components: s.project.components.map((c) => (c.id === id ? { ...c, ...patch } : c)),
      },
    })),

  moveResize: (id, box) =>
    set((s) => ({
      project: { ...s.project, components: s.project.components.map((c) => (c.id === id ? { ...c, box } : c)) },
    })),

  commitBoxes: (boxes, label = "Move / resize") =>
    set((s) => {
      if (boxes.length === 0) return {};
      const map = new Map(boxes.map((b) => [b.id, b.box]));
      return {
        history: pushHistory(s.history, s.project, label),
        future: [],
        project: {
          ...s.project,
          components: s.project.components.map((c) => (map.has(c.id) ? { ...c, box: map.get(c.id)! } : c)),
        },
      };
    }),

  removeComponent: (id) =>
    set((s) => {
      const comp = s.project.components.find((c) => c.id === id);
      return {
        history: pushHistory(s.history, s.project, `Remove ${comp?.name ?? "component"}`),
        future: [],
        project: { ...s.project, components: s.project.components.filter((c) => c.id !== id) },
        selectedId: s.selectedId === id ? null : s.selectedId,
        toasts: [...s.toasts, toast(`Removed “${comp?.name ?? "component"}”`, "undo")],
      };
    }),

  duplicateComponent: (id) =>
    set((s) => {
      const src = s.project.components.find((c) => c.id === id);
      if (!src) return {};
      const copy: ComponentSpec = { ...src, id: uuid(), name: `${src.name} copy`, box: { ...src.box, x: Math.min(s.project.cols - src.box.w, src.box.x + 1), y: src.box.y + 1 } };
      return {
        history: pushHistory(s.history, s.project, `Duplicate ${src.name}`),
        future: [],
        project: { ...s.project, components: [...s.project.components, copy] },
        selectedId: copy.id,
        toasts: [...s.toasts, toast(`Duplicated “${src.name}”`, "undo")],
      };
    }),

  setProjectName: (name) => set((s) => ({ project: { ...s.project, projectName: name } })),

  replaceProject: (project, report = null, label = "Load project") =>
    set((s) => ({
      history: pushHistory(s.history, s.project, label),
      future: [],
      project,
      selectedId: null,
      lastImportReport: report,
    })),

  addAsset: (asset) =>
    set((s) => ({
      project: { ...s.project, assets: [...s.project.assets, asset] },
      toasts: [...s.toasts, toast(`Asset “${asset.name}” added`)],
    })),

  swapAsset: (componentId, paramKey, url) =>
    set((s) => ({
      history: pushHistory(s.history, s.project, "Swap asset"),
      future: [],
      project: {
        ...s.project,
        components: s.project.components.map((c) => (c.id === componentId ? { ...c, params: { ...c.params, [paramKey]: url } } : c)),
      },
    })),

  swapComponents: (idA, idB) =>
    set((s) => {
      const a = s.project.components.find((c) => c.id === idA);
      const b = s.project.components.find((c) => c.id === idB);
      if (!a || !b) return {};
      return {
        history: pushHistory(s.history, s.project, `Swap ${a.name} ↔ ${b.name}`),
        future: [],
        project: {
          ...s.project,
          components: s.project.components.map((c) =>
            c.id === idA ? { ...c, box: { x: b.box.x, y: b.box.y, w: a.box.w, h: a.box.h } }
              : c.id === idB ? { ...c, box: { x: a.box.x, y: a.box.y, w: b.box.w, h: b.box.h } }
              : c
          ),
        },
        toasts: [...s.toasts, toast(`Swapped “${a.name}” and “${b.name}”`, "undo")],
      };
    }),

  alignSelected: (kind) =>
    set((s) => {
      const sel = s.project.components.find((c) => c.id === s.selectedId);
      if (!sel) return {};
      const others = s.project.components.filter((c) => c.id !== sel.id);
      const cols = s.project.cols;
      let box: GridBox = { ...sel.box };
      if (others.length > 0) {
        const minX = Math.min(...others.map((c) => c.box.x));
        const maxX = Math.max(...others.map((c) => c.box.x + c.box.w));
        const minY = Math.min(...others.map((c) => c.box.y));
        const maxY = Math.max(...others.map((c) => c.box.y + c.box.h));
        const bboxCenterX = (minX + maxX) / 2;
        const bboxCenterY = (minY + maxY) / 2;
        switch (kind) {
          case "left": box = { ...box, x: minX }; break;
          case "right": box = { ...box, x: Math.max(0, maxX - box.w) }; break;
          case "hcenter": box = { ...box, x: Math.max(0, Math.min(cols - box.w, Math.round(bboxCenterX - box.w / 2))) }; break;
          case "top": box = { ...box, y: minY }; break;
          case "bottom": box = { ...box, y: Math.max(0, maxY - box.h) }; break;
          case "vcenter": box = { ...box, y: Math.max(0, Math.round(bboxCenterY - box.h / 2)) }; break;
        }
      } else {
        switch (kind) {
          case "left": box = { ...box, x: 0 }; break;
          case "right": box = { ...box, x: cols - box.w }; break;
          case "hcenter": box = { ...box, x: Math.round((cols - box.w) / 2) }; break;
          case "top": box = { ...box, y: 0 }; break;
          case "vcenter": box = { ...box, y: Math.max(0, Math.round((8 - box.h) / 2)) }; break;
          case "bottom": break;
        }
      }
      if (box.x === sel.box.x && box.y === sel.box.y) return {};
      return {
        history: pushHistory(s.history, s.project, "Align"),
        future: [],
        project: {
          ...s.project,
          components: s.project.components.map((c) => (c.id === sel.id ? { ...c, box } : c)),
        },
      };
    }),

  distribute: (axis) =>
    set((s) => {
      const comps = [...s.project.components].sort((a, b) => (axis === "horizontal" ? a.box.x - b.box.x : a.box.y - b.box.y));
      if (comps.length < 3) return {};
      const first = comps[0];
      const last = comps[comps.length - 1];
      const span = axis === "horizontal" ? last.box.x + last.box.w - first.box.x : last.box.y + last.box.h - first.box.y;
      const inner = comps.slice(1, -1);
      const totalSize = axis === "horizontal" ? inner.reduce((acc, c) => acc + c.box.w, 0) : inner.reduce((acc, c) => acc + c.box.h, 0);
      const gap = Math.max(0, Math.floor((span - totalSize) / (comps.length - 1)));
      const changes: { id: string; box: GridBox }[] = [];
      let cursor = axis === "horizontal" ? first.box.x + first.box.w : first.box.y + first.box.h;
      for (const c of inner) {
        const box = { ...c.box, x: axis === "horizontal" ? Math.max(0, cursor + gap) : c.box.x, y: axis === "vertical" ? Math.max(0, cursor + gap) : c.box.y };
        changes.push({ id: c.id, box });
        cursor = axis === "horizontal" ? box.x + c.box.w : box.y + c.box.h;
      }
      return {
        history: pushHistory(s.history, s.project, "Distribute"),
        future: [],
        project: {
          ...s.project,
          components: s.project.components.map((c) => changes.find((ch) => ch.id === c.id)?.box ? { ...c, box: changes.find((ch) => ch.id === c.id)!.box } : c),
        },
        toasts: [...s.toasts, toast(`Distributed ${comps.length} components ${axis === "horizontal" ? "horizontally" : "vertically"}`, "undo")],
      };
    }),

  autoArrange: () =>
    set((s) => {
      if (s.project.components.length < 2) return {};
      const cols = s.project.cols;
      const sorted = [...s.project.components].sort((a, b) => a.box.y - b.box.y || a.box.x - b.box.x);
      const changes: { id: string; box: GridBox }[] = [];
      let x = 0;
      let y = 0;
      let rowH = 0;
      for (const c of sorted) {
        if (x + c.box.w > cols && x > 0) {
          x = 0;
          y += rowH;
          rowH = 0;
        }
        changes.push({ id: c.id, box: { x, y, w: Math.min(c.box.w, cols), h: c.box.h } });
        x += Math.min(c.box.w, cols);
        rowH = Math.max(rowH, c.box.h);
      }
      return {
        history: pushHistory(s.history, s.project, "Auto arrange"),
        future: [],
        project: {
          ...s.project,
          components: s.project.components.map((c) => changes.find((ch) => ch.id === c.id) ? { ...c, box: changes.find((ch) => ch.id === c.id)!.box } : c),
        },
        toasts: [...s.toasts, toast("Layout auto-arranged", "undo")],
      };
    }),

  nudge: (id, dx, dy) =>
    set((s) => {
      const c = s.project.components.find((c2) => c2.id === id);
      if (!c) return {};
      const box: GridBox = {
        ...c.box,
        x: Math.max(0, Math.min(s.project.cols - c.box.w, c.box.x + dx)),
        y: Math.max(0, c.box.y + dy),
      };
      return {
        history: pushHistory(s.history, s.project, "Nudge"),
        future: [],
        project: { ...s.project, components: s.project.components.map((c2) => (c2.id === id ? { ...c2, box } : c2)) },
      };
    }),

  resetToDefault: () =>
    set((s) => ({
      history: pushHistory(s.history, s.project, "Reset project"),
      future: [],
      project: createDefaultProject(),
      selectedId: null,
      lastImportReport: null,
      toasts: [...s.toasts, toast("Project reset to default", "undo")],
    })),

  undo: () => {
    const { history, project } = get();
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    set((s) => ({
      history: s.history.slice(0, -1),
      future: [{ project: snapshot(project), label: prev.label, at: Date.now() }, ...s.future],
      project: prev.project,
      toasts: [...s.toasts, toast(`Undid “${prev.label}”`, "redo")],
    }));
  },

  redo: () => {
    const { future, project } = get();
    if (future.length === 0) return;
    const next = future[0];
    set((s) => ({
      future: s.future.slice(1),
      history: [...s.history, { project: snapshot(project), label: next.label, at: Date.now() }],
      project: next.project,
      toasts: [...s.toasts, toast(`Redid “${next.label}”`, "undo")],
    }));
  },

  restoreHistory: (index) => {
    const { history, project } = get();
    if (index < 0 || index >= history.length) return;
    const target = history[index];
    set((s) => ({
      history: s.history.slice(0, index),
      future: [{ project: snapshot(project), label: target.label, at: Date.now() }, ...s.history.slice(index + 1), ...s.future],
      project: target.project,
      selectedId: s.selectedId,
    }));
  },

  pushToast: (message, action) => set((s) => ({ toasts: [...s.toasts, toast(message, action)] })),

  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

/** Convenience helper used by UI code that needs a fresh copy of the project. */
export function currentProjectCopy(): ProjectSpec {
  return cloneProject(useStore.getState().project);
}

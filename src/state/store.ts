import { create } from "zustand";
import { v4 as uuid } from "uuid";
import type { AssetRecord, ComponentSpec, ComponentType, ProjectSpec } from "../types";
import { COMPONENT_LIBRARY } from "../data/componentLibrary";
import { createDefaultProject } from "../data/defaultProject";
import type { ImportReport } from "../import/importHtml";

interface HistoryEntry {
  project: ProjectSpec;
}

interface StoreState {
  project: ProjectSpec;
  selectedId: string | null;
  lastImportReport: ImportReport | null;
  history: HistoryEntry[];
  future: HistoryEntry[];
  select: (id: string | null) => void;
  addComponent: (type: ComponentType, box?: Partial<ComponentSpec["box"]>) => void;
  updateComponentParams: (id: string, patch: Record<string, unknown>) => void;
  updateComponentMeta: (id: string, patch: Partial<Pick<ComponentSpec, "name" | "customClassName" | "customCode">>) => void;
  moveResize: (id: string, box: ComponentSpec["box"]) => void;
  removeComponent: (id: string) => void;
  duplicateComponent: (id: string) => void;
  setProjectName: (name: string) => void;
  replaceProject: (project: ProjectSpec, report?: ImportReport | null) => void;
  addAsset: (asset: AssetRecord) => void;
  swapAsset: (componentId: string, paramKey: string, url: string) => void;
  resetToDefault: () => void;
  undo: () => void;
  redo: () => void;
}

function snapshot(project: ProjectSpec): ProjectSpec {
  return JSON.parse(JSON.stringify(project));
}

export const useStore = create<StoreState>((set, get) => ({
  project: createDefaultProject(),
  selectedId: null,
  lastImportReport: null,
  history: [],
  future: [],

  select: (id) => set({ selectedId: id }),

  addComponent: (type, box) => {
    const def = COMPONENT_LIBRARY[type];
    const newComp: ComponentSpec = {
      id: uuid(),
      type,
      name: def.label,
      box: { ...def.defaultBox, ...box },
      params: { ...def.defaultParams },
      origin: "authored",
    };
    set((s) => ({
      history: [...s.history, { project: snapshot(s.project) }],
      future: [],
      project: { ...s.project, components: [...s.project.components, newComp] },
      selectedId: newComp.id,
    }));
  },

  updateComponentParams: (id, patch) =>
    set((s) => ({
      history: [...s.history, { project: snapshot(s.project) }],
      future: [],
      project: {
        ...s.project,
        components: s.project.components.map((c) => (c.id === id ? { ...c, params: { ...c.params, ...patch } } : c)),
      },
    })),

  updateComponentMeta: (id, patch) =>
    set((s) => ({
      history: [...s.history, { project: snapshot(s.project) }],
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

  removeComponent: (id) =>
    set((s) => ({
      history: [...s.history, { project: snapshot(s.project) }],
      future: [],
      project: { ...s.project, components: s.project.components.filter((c) => c.id !== id) },
      selectedId: s.selectedId === id ? null : s.selectedId,
    })),

  duplicateComponent: (id) =>
    set((s) => {
      const src = s.project.components.find((c) => c.id === id);
      if (!src) return {};
      const copy: ComponentSpec = { ...src, id: uuid(), box: { ...src.box, y: src.box.y + src.box.h } };
      return {
        history: [...s.history, { project: snapshot(s.project) }],
        future: [],
        project: { ...s.project, components: [...s.project.components, copy] },
        selectedId: copy.id,
      };
    }),

  setProjectName: (name) => set((s) => ({ project: { ...s.project, projectName: name } })),

  replaceProject: (project, report = null) =>
    set((s) => ({
      history: [...s.history, { project: snapshot(s.project) }],
      future: [],
      project,
      selectedId: null,
      lastImportReport: report,
    })),

  addAsset: (asset) => set((s) => ({ project: { ...s.project, assets: [...s.project.assets, asset] } })),

  swapAsset: (componentId, paramKey, url) =>
    set((s) => ({
      history: [...s.history, { project: snapshot(s.project) }],
      future: [],
      project: {
        ...s.project,
        components: s.project.components.map((c) => (c.id === componentId ? { ...c, params: { ...c.params, [paramKey]: url } } : c)),
      },
    })),

  resetToDefault: () => set({ project: createDefaultProject(), selectedId: null, history: [], future: [], lastImportReport: null }),

  undo: () => {
    const { history, project } = get();
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    set((s) => ({
      history: s.history.slice(0, -1),
      future: [{ project: snapshot(project) }, ...s.future],
      project: prev.project,
    }));
  },

  redo: () => {
    const { future, project } = get();
    if (future.length === 0) return;
    const next = future[0];
    set((s) => ({
      future: s.future.slice(1),
      history: [...s.history, { project: snapshot(project) }],
      project: next.project,
    }));
  },
}));

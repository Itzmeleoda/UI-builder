// ─────────────────────────────────────────────────────────────────────────
// Core spec types — this is the "JSON spec" contract shared by the codegen
// engine (spec -> code) and the import engine (code -> spec). Keeping both
// directions consuming/producing this exact shape is what makes round-trips
// possible.
// ─────────────────────────────────────────────────────────────────────────

export const SCHEMA_VERSION = 2; // bumped once (v1 -> v2 kept for back-compat demo)
export const SCHEMA_MIN_SUPPORTED_VERSION = 1;

export type Easing =
  | "linear"
  | "ease"
  | "ease-in"
  | "ease-out"
  | "ease-in-out"
  | "cubic-bezier(.22,1,.36,1)";

export type Trigger = "hover" | "click" | "scroll" | "load";

export type AssetOrigin = "library" | "imported";

export interface AssetRecord {
  id: string;
  name: string;
  kind: "image" | "icon" | "font";
  url: string;
  origin: AssetOrigin;
  license: string;
  source: string;
  addedAt: string;
}

export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "color"
  | "select"
  | "boolean"
  | "easing"
  | "trigger"
  | "asset"
  | "list";

export interface ParamField {
  key: string;
  label: string;
  type: FieldType;
  group: "content" | "style" | "motion" | "behavior" | "advanced";
  options?: { label: string; value: string }[];
  min?: number;
  max?: number;
  step?: number;
  help?: string;
}

export type ComponentType =
  | "container"
  | "tabs"
  | "card"
  | "imageHover"
  | "carousel"
  | "searchBar"
  | "table"
  | "button"
  | "modal"
  | "accordion"
  | "stickyHeader"
  | "pageTransition"
  | "rawBlock";

export interface GridBox {
  x: number; // grid columns
  y: number; // grid rows
  w: number;
  h: number;
}

export interface ComponentSpec {
  id: string;
  type: ComponentType;
  name: string;
  box: GridBox;
  params: Record<string, unknown>;
  /** Escape hatch — present on every component */
  customClassName?: string;
  customCode?: string;
  /** provenance, populated by the import engine */
  origin?: "authored" | "imported-matched" | "imported-raw";
  matchConfidence?: number; // 0-1, only set for imported-matched
}

export interface ProjectSpec {
  schemaVersion: number;
  projectName: string;
  cols: number;
  rowHeight: number;
  components: ComponentSpec[];
  assets: AssetRecord[];
}

export interface ComponentDefinition {
  type: ComponentType;
  label: string;
  category: "layout" | "interaction" | "content";
  description: string;
  icon: string; // lucide icon name
  defaultBox: GridBox;
  defaultParams: Record<string, unknown>;
  fields: ParamField[];
  /** signature heuristics used by the import matcher */
  signature: {
    test: (el: Element) => number; // returns confidence 0..1
  };
}

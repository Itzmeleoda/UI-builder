// ─────────────────────────────────────────────────────────────────────────
// Core spec types — this is the "JSON spec" contract shared by the codegen
// engine (spec -> code) and the import engine (code -> spec). Keeping both
// directions consuming/producing this exact shape is what makes round-trips
// possible.
// ─────────────────────────────────────────────────────────────────────────

export const SCHEMA_VERSION = 4; // v4: global app settings + component actions (linking)
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

export type AssetKind = "image" | "icon" | "font" | "gradient" | "logo";

// ─────────────────────────────────────────────────────────────────────────
// Actions: the wiring contract for interactive elements. Every button/CTA
// can carry an action; the preview executes it live and the codegen engine
// compiles it into real hrefs / onClick handlers in the exported app.
// ─────────────────────────────────────────────────────────────────────────
export type ActionType = "none" | "link" | "scroll" | "alert" | "custom";

export interface ComponentAction {
  type: ActionType;
  /** for `link` */
  url?: string;
  target?: "_self" | "_blank";
  /** for `scroll` — component id or "#top" */
  componentId?: string;
  /** for `alert` */
  message?: string;
  /** for `custom` — JS executed on click */
  code?: string;
}

// ─────────────────────────────────────────────────────────────────────────
// Global app settings — project-level customization applied to the canvas,
// to new components' defaults, and to the exported application.
// ─────────────────────────────────────────────────────────────────────────
export interface AppSettings {
  primaryColor: string;
  fontFamily: string;
  borderRadius: number;
  canvasBackground: string;
  pageTitle: string;
  pageDescription: string;
}

export interface AssetRecord {
  id: string;
  name: string;
  kind: AssetKind;
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
  | "range"
  | "color"
  | "select"
  | "boolean"
  | "easing"
  | "trigger"
  | "asset"
  | "list"
  | "radio"
  | "icon"
  | "alignment"
  | "font"
  | "action";

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
  // layout
  | "container"
  | "navbar"
  | "footer"
  | "hero"
  | "divider"
  | "stickyHeader"
  | "pageTransition"
  // interaction
  | "tabs"
  | "carousel"
  | "searchBar"
  | "button"
  | "modal"
  | "accordion"
  | "dropdown"
  | "toggle"
  | "slider"
  | "tooltip"
  | "stepper"
  | "segmentedControl"
  // content
  | "card"
  | "imageHover"
  | "table"
  | "avatar"
  | "badge"
  | "rating"
  | "progress"
  | "stat"
  | "testimonial"
  | "pricing"
  | "timeline"
  | "alert"
  | "videoPlayer"
  | "codeBlock"
  | "newsletter"
  | "breadcrumb"
  | "marquee"
  | "iconList"
  | "gallery"
  | "features"
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
  settings: AppSettings;
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

export type AlignKind = "left" | "hcenter" | "right" | "top" | "vcenter" | "bottom";

export interface ToastItem {
  id: string;
  message: string;
  action?: "undo" | "redo";
}

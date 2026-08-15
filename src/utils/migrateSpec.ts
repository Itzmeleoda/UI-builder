import type { AppSettings, ComponentAction, ProjectSpec } from "../types";
import { SCHEMA_MIN_SUPPORTED_VERSION, SCHEMA_VERSION } from "../types";
import { COMPONENT_LIBRARY } from "../data/componentLibrary";

export const DEFAULT_SETTINGS: AppSettings = {
  primaryColor: "#6366f1",
  fontFamily: "'Inter', system-ui, sans-serif",
  borderRadius: 12,
  canvasBackground: "#f1f5f9",
  pageTitle: "My UI Builder App",
  pageDescription: "Built with UI Builder Studio",
};

const DEFAULT_ACTION: ComponentAction = { type: "none" };

function normalizeAction(value: unknown): ComponentAction {
  if (!value || typeof value !== "object") return { ...DEFAULT_ACTION };
  const a = value as Record<string, unknown>;
  const type = a.type === "link" || a.type === "scroll" || a.type === "alert" || a.type === "custom" ? a.type : "none";
  return {
    type,
    url: typeof a.url === "string" ? a.url : "",
    target: a.target === "_blank" ? "_blank" : "_self",
    componentId: typeof a.componentId === "string" ? a.componentId : "",
    message: typeof a.message === "string" ? a.message : "",
    code: typeof a.code === "string" ? a.code : "",
  };
}

/** Upgrades any supported older spec to the current schema:
 *  - backfills global settings
 *  - fills missing component params from the library defaults
 *  - normalizes action objects
 */
export function migrateSpec(raw: any): ProjectSpec {
  let project = { ...raw };
  if (!project.settings) {
    project.settings = { ...DEFAULT_SETTINGS };
  } else {
    project.settings = { ...DEFAULT_SETTINGS, ...project.settings };
  }
  project.schemaVersion = SCHEMA_VERSION;

  const components = Array.isArray(project.components)
    ? project.components.map((c: any) => {
        const def = c.type ? COMPONENT_LIBRARY[c.type as keyof typeof COMPONENT_LIBRARY] : undefined;
        const params = { ...(def?.defaultParams ?? {}), ...(c.params ?? {}) };
        // normalize action objects
        for (const [k, v] of Object.entries(params)) {
          if (v && typeof v === "object" && "type" in (v as object) && (k === "action" || k.endsWith("Action"))) {
            params[k] = normalizeAction(v);
          }
        }
        return { ...c, params };
      })
    : [];

  return {
    ...project,
    schemaVersion: SCHEMA_VERSION,
    settings: project.settings,
    components,
    assets: Array.isArray(project.assets) ? project.assets : [],
  };
}

export function validateSpec(raw: any): string | null {
  if (raw.schemaVersion != null && raw.schemaVersion < SCHEMA_MIN_SUPPORTED_VERSION) {
    return `Spec schema v${raw.schemaVersion} is older than the minimum supported v${SCHEMA_MIN_SUPPORTED_VERSION}`;
  }
  if (!Array.isArray(raw.components)) return "Spec has no components array";
  return null;
}

export function isActionParamKey(key: string): boolean {
  return key === "action" || key.endsWith("Action");
}

import { v4 as uuid } from "uuid";
import type { ProjectSpec } from "../types";
import { COMPONENT_LIBRARY } from "./componentLibrary";
import { SCHEMA_VERSION } from "../types";
import { LIBRARY_ASSETS } from "./seedAssets";

function inst(type: keyof typeof COMPONENT_LIBRARY, box: { x: number; y: number; w: number; h: number }, overrides: Record<string, unknown> = {}) {
  const def = COMPONENT_LIBRARY[type];
  return {
    id: uuid(),
    type: def.type,
    name: def.label,
    box,
    params: { ...def.defaultParams, ...overrides },
    origin: "authored" as const,
  };
}

export function createDefaultProject(): ProjectSpec {
  return {
    schemaVersion: SCHEMA_VERSION,
    projectName: "Storefront Landing",
    cols: 12,
    rowHeight: 48,
    assets: LIBRARY_ASSETS,
    components: [
      inst("stickyHeader", { x: 0, y: 0, w: 12, h: 2 }, { logoText: "Nimbus" }),
      inst("card", { x: 0, y: 2, w: 4, h: 6 }, { title: "Wireless Headphones", imageUrl: "/images/card.jpg" }),
      inst("card", { x: 4, y: 2, w: 4, h: 6 }, { title: "Studio Monitor", imageUrl: "/images/card.jpg" }),
      inst("imageHover", { x: 8, y: 2, w: 4, h: 6 }, { imageUrl: "/images/hero.jpg", caption: "New arrivals" }),
      inst("tabs", { x: 0, y: 8, w: 6, h: 6 }),
      inst("searchBar", { x: 6, y: 8, w: 6, h: 1 }),
      inst("table", { x: 6, y: 9, w: 6, h: 5 }),
      inst("accordion", { x: 0, y: 14, w: 6, h: 6 }),
      inst("carousel", { x: 6, y: 14, w: 6, h: 6 }),
      inst("button", { x: 0, y: 20, w: 2, h: 1 }),
      inst("modal", { x: 2, y: 20, w: 4, h: 4 }),
      inst("pageTransition", { x: 6, y: 20, w: 6, h: 4 }),
    ],
  };
}

import type { AssetRecord } from "../types";

// Library assets: sourced from permissively licensed open collections,
// pulled in at build time rather than scraped from live sites. Placeholder
// URLs point at locally generated/bundled images for this demo.
export const LIBRARY_ASSETS: AssetRecord[] = [
  {
    id: "lib-img-1",
    name: "gradient-hero.jpg",
    kind: "image",
    url: "/images/hero.jpg",
    origin: "library",
    license: "CC0 — generated asset, free for commercial use",
    source: "component-library (bundled)",
    addedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "lib-img-2",
    name: "product-card.jpg",
    kind: "image",
    url: "/images/card.jpg",
    origin: "library",
    license: "CC0 — generated asset, free for commercial use",
    source: "component-library (bundled)",
    addedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "lib-icon-1",
    name: "lucide-icon-set",
    kind: "icon",
    url: "lucide-react",
    origin: "library",
    license: "ISC License",
    source: "npm: lucide-react",
    addedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "lib-font-1",
    name: "Inter (system-ui fallback)",
    kind: "font",
    url: "system-ui",
    origin: "library",
    license: "SIL Open Font License 1.1",
    source: "Google Fonts (self-hostable)",
    addedAt: "2024-01-01T00:00:00.000Z",
  },
];

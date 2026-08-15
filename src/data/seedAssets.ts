import type { AssetRecord } from "../types";

// Library assets: a mix of locally generated images (CC0) and hand-authored
// SVG gradients / logos / icons that ship with the app. All URLs point at
// bundled files so the demo works offline.
const CC0 = "CC0 — generated asset, free for commercial use";
const BUNDLED = "component-library (bundled)";

const image = (id: string, name: string, url: string): AssetRecord => ({
  id,
  name,
  kind: "image",
  url,
  origin: "library",
  license: CC0,
  source: BUNDLED,
  addedAt: "2024-01-01T00:00:00.000Z",
});

const svg = (id: string, name: string, url: string, kind: AssetRecord["kind"]): AssetRecord => ({
  id,
  name,
  kind,
  url,
  origin: "library",
  license: CC0,
  source: BUNDLED,
  addedAt: "2024-01-01T00:00:00.000Z",
});

export const LIBRARY_ASSETS: AssetRecord[] = [
  // ── photos ──
  image("lib-img-1", "gradient-hero.jpg", "/images/hero.jpg"),
  image("lib-img-2", "product-card.jpg", "/images/card.jpg"),
  image("lib-img-3", "headphones.jpg", "/images/product-headphones.jpg"),
  image("lib-img-4", "smartwatch.jpg", "/images/product-watch.jpg"),
  image("lib-img-5", "sneaker.jpg", "/images/product-sneaker.jpg"),
  image("lib-img-6", "vintage-camera.jpg", "/images/product-camera.jpg"),
  image("lib-img-7", "designer-lamp.jpg", "/images/product-lamp.jpg"),
  image("lib-img-8", "portrait-alex.jpg", "/images/avatar-1.jpg"),
  image("lib-img-9", "portrait-sam.jpg", "/images/avatar-2.jpg"),
  image("lib-img-10", "portrait-maya.jpg", "/images/avatar-3.jpg"),
  image("lib-img-11", "workspace.jpg", "/images/lifestyle-workspace.jpg"),
  image("lib-img-12", "travel.jpg", "/images/lifestyle-travel.jpg"),
  // ── scenes / abstracts ──
  svg("lib-scene-1", "mountain-scene.svg", "/images/scene-mountains.svg", "image"),
  svg("lib-scene-2", "city-skyline.svg", "/images/scene-city.svg", "image"),
  svg("lib-scene-3", "abstract-waves.svg", "/images/abstract-waves.svg", "image"),
  svg("lib-scene-4", "abstract-geometry.svg", "/images/abstract-geometry.svg", "image"),
  // ── gradients ──
  svg("lib-grad-1", "aurora.svg", "/images/gradients/aurora.svg", "gradient"),
  svg("lib-grad-2", "sunset.svg", "/images/gradients/sunset.svg", "gradient"),
  svg("lib-grad-3", "ocean.svg", "/images/gradients/ocean.svg", "gradient"),
  svg("lib-grad-4", "mint.svg", "/images/gradients/mint.svg", "gradient"),
  svg("lib-grad-5", "rose.svg", "/images/gradients/rose.svg", "gradient"),
  svg("lib-grad-6", "midnight.svg", "/images/gradients/midnight.svg", "gradient"),
  svg("lib-grad-7", "candy.svg", "/images/gradients/candy.svg", "gradient"),
  svg("lib-grad-8", "ember.svg", "/images/gradients/ember.svg", "gradient"),
  // ── logo marks ──
  svg("lib-logo-1", "orb-logo.svg", "/images/logos/orb.svg", "logo"),
  svg("lib-logo-2", "hex-logo.svg", "/images/logos/hex.svg", "logo"),
  svg("lib-logo-3", "bolt-logo.svg", "/images/logos/bolt.svg", "logo"),
  svg("lib-logo-4", "peak-logo.svg", "/images/logos/peak.svg", "logo"),
  svg("lib-logo-5", "wave-logo.svg", "/images/logos/wave.svg", "logo"),
  svg("lib-logo-6", "spark-logo.svg", "/images/logos/spark.svg", "logo"),
  // ── icons ──
  svg("lib-icon-2", "icon-rocket.svg", "/images/icons/rocket.svg", "icon"),
  svg("lib-icon-3", "icon-star.svg", "/images/icons/star.svg", "icon"),
  svg("lib-icon-4", "icon-heart.svg", "/images/icons/heart.svg", "icon"),
  svg("lib-icon-5", "icon-bolt.svg", "/images/icons/bolt.svg", "icon"),
  svg("lib-icon-6", "icon-shield.svg", "/images/icons/shield.svg", "icon"),
  svg("lib-icon-7", "icon-globe.svg", "/images/icons/globe.svg", "icon"),
  svg("lib-icon-8", "icon-camera.svg", "/images/icons/camera.svg", "icon"),
  svg("lib-icon-9", "icon-music.svg", "/images/icons/music.svg", "icon"),
  svg("lib-icon-10", "icon-leaf.svg", "/images/icons/leaf.svg", "icon"),
  svg("lib-icon-11", "icon-flame.svg", "/images/icons/flame.svg", "icon"),
  // ── icon set + fonts ──
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
    name: "Inter",
    kind: "font",
    url: "'Inter', system-ui, sans-serif",
    origin: "library",
    license: "SIL Open Font License 1.1",
    source: "Google Fonts (self-hostable)",
    addedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "lib-font-2",
    name: "Poppins",
    kind: "font",
    url: "'Poppins', 'Inter', sans-serif",
    origin: "library",
    license: "SIL Open Font License 1.1",
    source: "Google Fonts (self-hostable)",
    addedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "lib-font-3",
    name: "Playfair Display",
    kind: "font",
    url: "'Playfair Display', Georgia, serif",
    origin: "library",
    license: "SIL Open Font License 1.1",
    source: "Google Fonts (self-hostable)",
    addedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "lib-font-4",
    name: "Roboto Mono",
    kind: "font",
    url: "'Roboto Mono', ui-monospace, monospace",
    origin: "library",
    license: "Apache License 2.0",
    source: "Google Fonts (self-hostable)",
    addedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "lib-font-5",
    name: "Space Grotesk",
    kind: "font",
    url: "'Space Grotesk', 'Inter', sans-serif",
    origin: "library",
    license: "SIL Open Font License 1.1",
    source: "Google Fonts (self-hostable)",
    addedAt: "2024-01-01T00:00:00.000Z",
  },
];

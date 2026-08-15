import type { ProjectSpec } from "../types";
import { SCHEMA_VERSION } from "../types";
import { LIBRARY_ASSETS } from "./seedAssets";
import { inst } from "./templates";

export function createDefaultProject(): ProjectSpec {
  return {
    schemaVersion: SCHEMA_VERSION,
    projectName: "Storefront Landing",
    cols: 12,
    rowHeight: 48,
    assets: LIBRARY_ASSETS,
    components: [
      inst("stickyHeader", { x: 0, y: 0, w: 12, h: 1 }, { logoText: "Nimbus", ctaLabel: "Shop now" }),
      inst("hero", { x: 0, y: 1, w: 12, h: 7 }, { headline: "Nimbus Studio — sound that moves you", layout: "split", imageUrl: "/images/product-headphones.jpg" }),
      inst("card", { x: 0, y: 8, w: 4, h: 6 }, { title: "Wireless Headphones", imageUrl: "/images/product-headphones.jpg", revealContent: "$129 — Shop now →" }),
      inst("card", { x: 4, y: 8, w: 4, h: 6 }, { title: "Smartwatch S2", imageUrl: "/images/product-watch.jpg", revealContent: "$249 — Shop now →" }),
      inst("card", { x: 8, y: 8, w: 4, h: 6 }, { title: "Aero Sneaker", imageUrl: "/images/product-sneaker.jpg", revealContent: "$89 — Shop now →" }),
      inst("tabs", { x: 0, y: 14, w: 6, h: 5 }, {}),
      inst("searchBar", { x: 6, y: 14, w: 6, h: 1 }),
      inst("table", { x: 6, y: 15, w: 6, h: 4 }),
      inst("accordion", { x: 0, y: 19, w: 6, h: 4 }, {}),
      inst("stat", { x: 0, y: 23, w: 3, h: 2 }, { value: "24.8K", label: "Monthly users", icon: "trending-up" }),
      inst("stat", { x: 3, y: 23, w: 3, h: 2 }, { value: "4.9/5", label: "Avg. rating", icon: "star" }),
      inst("stat", { x: 6, y: 23, w: 3, h: 2 }, { value: "120+", label: "Integrations", icon: "layers" }),
      inst("stat", { x: 9, y: 23, w: 3, h: 2 }, { value: "99.9%", label: "Uptime", icon: "shield" }),
      inst("testimonial", { x: 0, y: 25, w: 4, h: 4 }, {}),
      inst("rating", { x: 4, y: 25, w: 4, h: 1 }, {}),
      inst("toggle", { x: 4, y: 26, w: 4, h: 1 }, {}),
      inst("segmentedControl", { x: 4, y: 27, w: 4, h: 1 }, {}),
      inst("carousel", { x: 8, y: 25, w: 4, h: 4 }, { slides: ["New arrivals", "Free shipping", "30-day returns"] }),
      inst("newsletter", { x: 0, y: 29, w: 6, h: 3 }, { layout: "inline" }),
      inst("codeBlock", { x: 6, y: 29, w: 6, h: 3 }, { code: 'const theme = {\n  accent: "#6366f1",\n  radius: 16,\n};' }),
      inst("footer", { x: 0, y: 32, w: 12, h: 4 }, { brandName: "Nimbus" }),
    ],
  };
}

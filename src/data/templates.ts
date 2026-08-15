import { v4 as uuid } from "uuid";
import type { ComponentSpec, ComponentType, ProjectSpec } from "../types";
import { COMPONENT_LIBRARY } from "./componentLibrary";
import { SCHEMA_VERSION } from "../types";
import { LIBRARY_ASSETS } from "./seedAssets";

export function inst(type: ComponentType, box: { x: number; y: number; w: number; h: number }, overrides: Record<string, unknown> = {}): ComponentSpec {
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

export interface TemplateDef {
  id: string;
  name: string;
  description: string;
  emoji: string;
  accent: string; // tailwind gradient classes for the preview card
  /** rough wireframe of the template for the preview card (block rows) */
  wire: { w: number }[][];
  build: (projectName: string) => ProjectSpec;
}

export const TEMPLATES: TemplateDef[] = [
  {
    id: "saas-landing",
    name: "SaaS Landing",
    description: "Navbar, hero, features, stats, pricing and testimonials.",
    emoji: "🚀",
    accent: "from-indigo-500 to-violet-500",
    wire: [
      [{ w: 3 }, { w: 2 }, { w: 2 }, { w: 2 }, { w: 1 }, { w: 2 }],
      [{ w: 6 }, { w: 6 }],
      [{ w: 3 }, { w: 3 }, { w: 3 }, { w: 3 }],
      [{ w: 4 }, { w: 4 }, { w: 4 }],
      [{ w: 6 }, { w: 6 }],
    ],
    build: (projectName) => ({
      schemaVersion: SCHEMA_VERSION,
      projectName,
      cols: 12,
      rowHeight: 48,
      assets: LIBRARY_ASSETS,
      components: [
        inst("navbar", { x: 0, y: 0, w: 12, h: 1 }, { logoText: "Lumen" }),
        inst("hero", { x: 0, y: 1, w: 12, h: 7 }, { headline: "Ship beautiful interfaces faster", layout: "split", imageUrl: "/images/abstract-waves.svg" }),
        inst("marquee", { x: 0, y: 8, w: 12, h: 2 }, { items: ["Trusted by", "Acme", "Globex", "Initech", "Umbrella", "Hooli"] }),
        inst("features", { x: 0, y: 10, w: 12, h: 7 }, {}),
        inst("stat", { x: 0, y: 17, w: 3, h: 2 }, { value: "24.8K", label: "Monthly users", icon: "users" }),
        inst("stat", { x: 3, y: 17, w: 3, h: 2 }, { value: "99.9%", label: "Uptime", icon: "shield", delta: "+0.1%", deltaDirection: "up" }),
        inst("stat", { x: 6, y: 17, w: 3, h: 2 }, { value: "4.9/5", label: "Avg. rating", icon: "star" }),
        inst("stat", { x: 9, y: 17, w: 3, h: 2 }, { value: "120+", label: "Integrations", icon: "layers" }),
        inst("pricing", { x: 0, y: 19, w: 4, h: 6 }, { planName: "Starter", price: "0", highlighted: false, features: ["1 project", "Community support", "Basic components"] }),
        inst("pricing", { x: 4, y: 19, w: 4, h: 6 }, { planName: "Pro", price: "29" }),
        inst("pricing", { x: 8, y: 19, w: 4, h: 6 }, { planName: "Enterprise", price: "99", highlighted: false, features: ["Unlimited everything", "SSO & audit logs", "Dedicated manager"] }),
        inst("testimonial", { x: 0, y: 25, w: 4, h: 4 }, {}),
        inst("testimonial", { x: 4, y: 25, w: 4, h: 4 }, { author: "Maya Chen", avatarUrl: "/images/avatar-3.jpg", quote: "The smart alignment guides alone save us hours every week." }),
        inst("testimonial", { x: 8, y: 25, w: 4, h: 4 }, { author: "Sam Okafor", avatarUrl: "/images/avatar-2.jpg", quote: "Export to React and the code just works. Round-trip editing is magic." }),
        inst("newsletter", { x: 0, y: 29, w: 12, h: 3 }, { layout: "inline" }),
        inst("footer", { x: 0, y: 32, w: 12, h: 4 }, { brandName: "Lumen" }),
      ],
    }),
  },
  {
    id: "ecommerce",
    name: "E-commerce Store",
    description: "Storefront with hero, product grid and newsletter.",
    emoji: "🛍️",
    accent: "from-amber-500 to-rose-500",
    wire: [
      [{ w: 4 }, { w: 2 }, { w: 2 }, { w: 2 }, { w: 2 }],
      [{ w: 12 }],
      [{ w: 4 }, { w: 4 }, { w: 4 }],
      [{ w: 4 }, { w: 4 }, { w: 4 }],
      [{ w: 12 }],
    ],
    build: (projectName) => ({
      schemaVersion: SCHEMA_VERSION,
      projectName,
      cols: 12,
      rowHeight: 48,
      assets: LIBRARY_ASSETS,
      components: [
        inst("stickyHeader", { x: 0, y: 0, w: 12, h: 1 }, { logoText: "Nordic" }),
        inst("hero", { x: 0, y: 1, w: 12, h: 6 }, { headline: "New season, new gear", subheadline: "Up to 40% off select styles.", imageUrl: "/images/product-sneaker.jpg", layout: "split" }),
        inst("card", { x: 0, y: 7, w: 4, h: 6 }, { title: "Wireless Headphones", imageUrl: "/images/product-headphones.jpg", revealContent: "$129 — Shop now →" }),
        inst("card", { x: 4, y: 7, w: 4, h: 6 }, { title: "Smartwatch S2", imageUrl: "/images/product-watch.jpg", revealContent: "$249 — Shop now →" }),
        inst("card", { x: 8, y: 7, w: 4, h: 6 }, { title: "Retro Camera", imageUrl: "/images/product-camera.jpg", revealContent: "$399 — Shop now →" }),
        inst("card", { x: 0, y: 13, w: 4, h: 6 }, { title: "Aero Sneaker", imageUrl: "/images/product-sneaker.jpg", revealContent: "$89 — Shop now →" }),
        inst("card", { x: 4, y: 13, w: 4, h: 6 }, { title: "Glow Desk Lamp", imageUrl: "/images/product-lamp.jpg", revealContent: "$59 — Shop now →" }),
        inst("gallery", { x: 8, y: 13, w: 4, h: 6 }, { columns: 2, aspect: "1:1" }),
        inst("newsletter", { x: 0, y: 19, w: 12, h: 3 }, { headline: "Get 10% off your first order" }),
        inst("footer", { x: 0, y: 22, w: 12, h: 4 }, { brandName: "Nordic" }),
      ],
    }),
  },
  {
    id: "dashboard",
    name: "Analytics Dashboard",
    description: "Header, KPI stats, chart area, table and progress.",
    emoji: "📊",
    accent: "from-emerald-500 to-teal-500",
    wire: [
      [{ w: 5 }, { w: 2 }, { w: 2 }, { w: 2 }, { w: 1 }],
      [{ w: 3 }, { w: 3 }, { w: 3 }, { w: 3 }],
      [{ w: 7 }, { w: 5 }],
      [{ w: 12 }],
      [{ w: 5 }, { w: 7 }],
    ],
    build: (projectName) => ({
      schemaVersion: SCHEMA_VERSION,
      projectName,
      cols: 12,
      rowHeight: 48,
      assets: LIBRARY_ASSETS,
      components: [
        inst("stickyHeader", { x: 0, y: 0, w: 12, h: 1 }, { logoText: "Pulse" }),
        inst("stat", { x: 0, y: 1, w: 3, h: 2 }, { value: "$48.2K", label: "Revenue", icon: "chart-line", delta: "+8.1%", deltaDirection: "up" }),
        inst("stat", { x: 3, y: 1, w: 3, h: 2 }, { value: "8,412", label: "Sessions", icon: "users", delta: "+12.4%", deltaDirection: "up" }),
        inst("stat", { x: 6, y: 1, w: 3, h: 2 }, { value: "3.2%", label: "Churn", icon: "refresh", delta: "-0.4%", deltaDirection: "down" }),
        inst("stat", { x: 9, y: 1, w: 3, h: 2 }, { value: "1m 42s", label: "Avg. session", icon: "clock" }),
        inst("gallery", { x: 0, y: 3, w: 7, h: 6 }, { images: ["/images/abstract-waves.svg", "/images/gradients/aurora.svg", "/images/gradients/ocean.svg"], columns: 3, aspect: "16:9" }),
        inst("progress", { x: 7, y: 3, w: 5, h: 1 }, { value: 72, label: "Storage used" }),
        inst("progress", { x: 7, y: 4, w: 5, h: 1 }, { value: 45, label: "Bandwidth", color: "#10b981" }),
        inst("progress", { x: 7, y: 5, w: 5, h: 1 }, { value: 91, label: "Compute", color: "#f59e0b" }),
        inst("table", { x: 0, y: 9, w: 12, h: 5 }, {}),
        inst("segmentedControl", { x: 0, y: 14, w: 4, h: 1 }, { options: ["24h", "7d", "30d", "90d"] }),
        inst("alert", { x: 4, y: 14, w: 8, h: 2 }, { variant: "info", title: "Weekly report ready", body: "Your performance digest for last week is available." }),
      ],
    }),
  },
  {
    id: "portfolio",
    name: "Portfolio",
    description: "Personal site with hero, gallery, timeline and contact.",
    emoji: "🎨",
    accent: "from-fuchsia-500 to-pink-500",
    wire: [
      [{ w: 4 }, { w: 2 }, { w: 2 }, { w: 2 }, { w: 2 }],
      [{ w: 6 }, { w: 6 }],
      [{ w: 4 }, { w: 4 }, { w: 4 }],
      [{ w: 12 }],
      [{ w: 12 }],
    ],
    build: (projectName) => ({
      schemaVersion: SCHEMA_VERSION,
      projectName,
      cols: 12,
      rowHeight: 48,
      assets: LIBRARY_ASSETS,
      components: [
        inst("navbar", { x: 0, y: 0, w: 12, h: 1 }, { logoText: "alex.dev", ctaLabel: "Hire me" }),
        inst("hero", { x: 0, y: 1, w: 12, h: 6 }, { headline: "Design engineer crafting delightful products", subheadline: "8 years shipping interfaces for startups and Fortune 500s.", layout: "split", imageUrl: "/images/avatar-1.jpg", align: "left" }),
        inst("gallery", { x: 0, y: 7, w: 12, h: 6 }, { images: ["/images/abstract-geometry.svg", "/images/scene-city.svg", "/images/abstract-waves.svg", "/images/scene-mountains.svg", "/images/gradients/candy.svg", "/images/gradients/sunset.svg"], columns: 3, aspect: "16:9" }),
        inst("timeline", { x: 0, y: 13, w: 6, h: 7 }, { items: ["2019::First design role", "2021::Senior at Globex", "2023::Staff at Acme", "2026::Independent consultant"] }),
        inst("codeBlock", { x: 6, y: 13, w: 6, h: 7 }, { language: "ts", code: 'const skills = {\n  design: "Figma, Framer",\n  code: "React, TypeScript",\n  motion: "GSAP, CSS",\n};\n\n// always learning\nskills.ai ??= "exploring";' }),
        inst("testimonial", { x: 0, y: 20, w: 6, h: 4 }, {}),
        inst("newsletter", { x: 6, y: 20, w: 6, h: 4 }, { headline: "Let's work together", subheadline: "Drop your email and I'll get back within 24h." }),
        inst("footer", { x: 0, y: 24, w: 12, h: 4 }, { brandName: "alex.dev" }),
      ],
    }),
  },
  {
    id: "coming-soon",
    name: "Coming Soon",
    description: "Minimal launch page with countdown-style focus.",
    emoji: "⏳",
    accent: "from-slate-700 to-slate-900",
    wire: [
      [{ w: 4 }, { w: 2 }, { w: 2 }, { w: 2 }, { w: 2 }],
      [{ w: 12 }],
      [{ w: 8 }],
      [{ w: 12 }],
    ],
    build: (projectName) => ({
      schemaVersion: SCHEMA_VERSION,
      projectName,
      cols: 12,
      rowHeight: 48,
      assets: LIBRARY_ASSETS,
      components: [
        inst("navbar", { x: 0, y: 0, w: 12, h: 1 }, { logoText: "Nova", variant: "dark", background: "#0f172a", textColor: "#f8fafc" }),
        inst("hero", { x: 0, y: 1, w: 12, h: 7 }, { headline: "Something amazing is on the way", subheadline: "We're crafting the next generation of our platform.", layout: "center", background: "#0f172a", textColor: "#f8fafc", mutedColor: "#94a3b8", imageUrl: "/images/gradients/midnight.svg", ctaSecondary: "Get notified" }),
        inst("segmentedControl", { x: 3, y: 8, w: 6, h: 1 }, { options: ["Launch", "Beta", "Waitlist"], selected: 2 }),
        inst("newsletter", { x: 0, y: 9, w: 12, h: 3 }, { headline: "Be first in line", subheadline: "Join 12,000 people on the waitlist.", layout: "inline" }),
        inst("divider", { x: 0, y: 12, w: 12, h: 1 }, { label: "Our backers", style: "gradient" }),
        inst("marquee", { x: 0, y: 13, w: 12, h: 2 }, { items: ["Y Combinator", "Sequoia", "a16z", "Kleiner Perkins", "Founders Fund"], background: "#0f172a" }),
        inst("footer", { x: 0, y: 15, w: 12, h: 3 }, { brandName: "Nova" }),
      ],
    }),
  },
  {
    id: "docs",
    name: "Docs / Blog",
    description: "Article layout with breadcrumbs, code and alerts.",
    emoji: "📚",
    accent: "from-sky-500 to-blue-600",
    wire: [
      [{ w: 3 }, { w: 2 }, { w: 2 }, { w: 2 }, { w: 2 }, { w: 1 }],
      [{ w: 4 }],
      [{ w: 8 }, { w: 4 }],
      [{ w: 8 }, { w: 4 }],
      [{ w: 12 }],
    ],
    build: (projectName) => ({
      schemaVersion: SCHEMA_VERSION,
      projectName,
      cols: 12,
      rowHeight: 48,
      assets: LIBRARY_ASSETS,
      components: [
        inst("navbar", { x: 0, y: 0, w: 12, h: 1 }, { logoText: "Docs", ctaLabel: "GitHub" }),
        inst("breadcrumb", { x: 0, y: 1, w: 6, h: 1 }, { items: ["Home", "Guides", "Getting started"] }),
        inst("hero", { x: 0, y: 2, w: 12, h: 5 }, { headline: "Getting started guide", subheadline: "Learn how to go from zero to your first build in ten minutes.", layout: "center", ctaSecondary: "View on GitHub" }),
        inst("iconList", { x: 0, y: 7, w: 8, h: 6 }, { items: ["rocket::Install::One command to bootstrap your project", "code::Configure::Tweak the builder to your workflow", "send::Deploy::Ship to any static host in seconds"] }),
        inst("tabs", { x: 8, y: 7, w: 4, h: 6 }, { tabs: ["npm", "yarn", "pnpm"] }),
        inst("codeBlock", { x: 0, y: 13, w: 8, h: 5 }, { code: "npm install -g ui-builder\nui-builder init my-app\ncd my-app && ui-builder dev" }),
        inst("alert", { x: 8, y: 13, w: 4, h: 2 }, { variant: "warning", title: "Heads up", body: "Node 18+ is required for the CLI." }),
        inst("accordion", { x: 8, y: 15, w: 4, h: 4 }, { items: [{ title: "Troubleshooting", body: "Clear your cache and re-run the init command." }, { title: "FAQ", body: "Answers to common setup questions." }] }),
        inst("footer", { x: 0, y: 19, w: 12, h: 4 }, { brandName: "Docs" }),
      ],
    }),
  },
  {
    id: "blank",
    name: "Blank canvas",
    description: "Empty project — drag components to start.",
    emoji: "✨",
    accent: "from-slate-300 to-slate-400",
    wire: [],
    build: (projectName) => ({
      schemaVersion: SCHEMA_VERSION,
      projectName,
      cols: 12,
      rowHeight: 48,
      assets: LIBRARY_ASSETS,
      components: [],
    }),
  },
];

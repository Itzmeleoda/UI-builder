import type { ComponentDefinition, ComponentType, ParamField } from "../types";

const easingOptions = [
  { label: "Linear", value: "linear" },
  { label: "Ease", value: "ease" },
  { label: "Ease In", value: "ease-in" },
  { label: "Ease Out", value: "ease-out" },
  { label: "Ease In Out", value: "ease-in-out" },
  { label: "Overshoot (cubic-bezier)", value: "cubic-bezier(.22,1,.36,1)" },
];

const triggerOptions = [
  { label: "Hover", value: "hover" },
  { label: "Click", value: "click" },
  { label: "Scroll into view", value: "scroll" },
  { label: "Page load", value: "load" },
];

const sizeOptions = [
  { label: "Small", value: "sm" },
  { label: "Medium", value: "md" },
  { label: "Large", value: "lg" },
];

const fontOptions = [
  { label: "System default", value: "system-ui, -apple-system, 'Segoe UI', sans-serif" },
  { label: "Inter — modern sans", value: "'Inter', system-ui, sans-serif" },
  { label: "Poppins — geometric", value: "'Poppins', 'Inter', sans-serif" },
  { label: "Playfair — elegant serif", value: "'Playfair Display', Georgia, serif" },
  { label: "Space Grotesk — tech", value: "'Space Grotesk', 'Inter', sans-serif" },
  { label: "Roboto Mono — code", value: "'Roboto Mono', ui-monospace, monospace" },
];

const alignmentOptions = [
  { label: "Left", value: "left" },
  { label: "Center", value: "center" },
  { label: "Right", value: "right" },
];

const shadowOptions = ["none", "sm", "md", "lg", "xl"].map((v) => ({ label: v, value: v }));

const iconOptions = [
  "star", "heart", "check", "check-circle", "plus", "arrow-right", "cart", "user", "users", "settings",
  "bell", "mail", "phone", "map-pin", "globe", "rocket", "zap", "camera", "music", "play", "search",
  "calendar", "clock", "thumbs-up", "lock", "download", "upload", "share", "link", "flag", "award",
  "bookmark", "filter", "folder", "home", "info", "message", "moon", "sun", "trash", "pencil", "eye",
  "gift", "key", "menu", "package", "refresh", "send", "tag", "target", "trending-up", "video", "wifi",
  "shield", "sparkles", "layers", "code", "database", "cloud", "headset", "lightbulb", "leaf", "flame",
  "coffee", "trophy", "book", "chart-line", "wallet", "briefcase", "smile",
].map((v) => ({ label: v, value: v }));

// Fields common to every component (escape hatch is added separately by the panel)
const motionFields = (prefix = ""): ParamField[] => [
  { key: `${prefix}durationMs`, label: "Duration (ms)", type: "range", group: "motion", min: 0, max: 4000, step: 10 },
  { key: `${prefix}easing`, label: "Easing", type: "easing", group: "motion", options: easingOptions },
  { key: `${prefix}trigger`, label: "Trigger", type: "trigger", group: "behavior", options: triggerOptions },
];

const textStyleFields = (prefix = "text"): ParamField[] => [
  { key: `${prefix}Font`, label: "Font family", type: "font", group: "style", options: fontOptions },
];

export const COMPONENT_LIBRARY: Record<ComponentType, ComponentDefinition> = {
  // ─────────────────────────────────────────────── LAYOUT ────────────────
  container: {
    type: "container",
    label: "Container",
    category: "layout",
    description: "Flex/grid layout wrapper for grouping other components.",
    icon: "LayoutGrid",
    defaultBox: { x: 0, y: 0, w: 12, h: 6 },
    defaultParams: {
      direction: "row",
      gap: 16,
      padding: 24,
      align: "stretch",
      justify: "start",
      background: "#ffffff",
      borderRadius: 12,
      maxWidth: "1200px",
      borderStyle: "dashed",
      borderWidth: 1,
      borderColor: "#cbd5e1",
      shadow: "none",
    },
    fields: [
      { key: "direction", label: "Direction", type: "radio", group: "style", options: [{ label: "Row", value: "row" }, { label: "Column", value: "column" }] },
      { key: "gap", label: "Gap (px)", type: "range", group: "style", min: 0, max: 96 },
      { key: "padding", label: "Padding (px)", type: "range", group: "style", min: 0, max: 96 },
      { key: "align", label: "Align items", type: "radio", group: "style", options: ["start", "center", "end", "stretch"].map((v) => ({ label: v, value: v })) },
      { key: "justify", label: "Justify content", type: "select", group: "style", options: ["start", "center", "end", "between", "around"].map((v) => ({ label: v, value: v })) },
      { key: "background", label: "Background", type: "color", group: "style" },
      { key: "borderRadius", label: "Radius (px)", type: "range", group: "style", min: 0, max: 64 },
      { key: "borderStyle", label: "Border style", type: "select", group: "style", options: ["none", "solid", "dashed", "dotted"].map((v) => ({ label: v, value: v })) },
      { key: "borderWidth", label: "Border width (px)", type: "range", group: "style", min: 0, max: 8 },
      { key: "borderColor", label: "Border color", type: "color", group: "style" },
      { key: "shadow", label: "Shadow", type: "select", group: "style", options: shadowOptions },
      { key: "maxWidth", label: "Max width", type: "text", group: "style" },
    ],
    signature: {
      test: (el) => {
        const tag = el.tagName.toLowerCase();
        if (tag === "div" && el.children.length >= 1 && !el.closest("table,nav,header")) return 0.3;
        if (tag === "section" || tag === "main") return 0.5;
        return 0;
      },
    },
  },

  navbar: {
    type: "navbar",
    label: "Navbar",
    category: "layout",
    description: "Full navigation bar with logo, links and a call-to-action.",
    icon: "Navigation",
    defaultBox: { x: 0, y: 0, w: 12, h: 1 },
    defaultParams: {
      logoText: "Brand",
      links: ["Home", "Features", "Pricing", "About"],
      variant: "light",
      background: "#ffffff",
      textColor: "#111827",
      accentColor: "#6366f1",
      ctaLabel: "Get started",
      ctaBackground: "#6366f1",
      ctaTextColor: "#ffffff",
      sticky: true,
      textFont: "system-ui, -apple-system, 'Segoe UI', sans-serif",
      shadow: "sm",
    },
    fields: [
      { key: "logoText", label: "Logo text", type: "text", group: "content" },
      { key: "links", label: "Nav links", type: "list", group: "content" },
      { key: "variant", label: "Style", type: "radio", group: "style", options: [{ label: "Light", value: "light" }, { label: "Dark", value: "dark" }, { label: "Glass", value: "glass" }] },
      { key: "background", label: "Background", type: "color", group: "style" },
      { key: "textColor", label: "Link color", type: "color", group: "style" },
      { key: "accentColor", label: "Link hover color", type: "color", group: "style" },
      { key: "ctaLabel", label: "CTA label", type: "text", group: "content" },
      { key: "ctaBackground", label: "CTA background", type: "color", group: "style" },
      { key: "ctaTextColor", label: "CTA text color", type: "color", group: "style" },
      { key: "sticky", label: "Sticky", type: "boolean", group: "behavior" },
      { key: "shadow", label: "Shadow", type: "select", group: "style", options: shadowOptions },
      ...textStyleFields(),
    ],
    signature: {
      test: (el) => {
        if (el.tagName.toLowerCase() === "nav") return 0.9;
        if (el.querySelector("nav")) return 0.7;
        return 0;
      },
    },
  },

  footer: {
    type: "footer",
    label: "Footer",
    category: "layout",
    description: "Multi-column footer with links, tagline and social icons.",
    icon: "LayoutPanelTop",
    defaultBox: { x: 0, y: 0, w: 12, h: 4 },
    defaultParams: {
      brandName: "Brand",
      tagline: "Build beautiful interfaces faster.",
      columns: ["Product::Features, Pricing, Changelog", "Company::About, Careers, Blog", "Legal::Privacy, Terms, Cookies"],
      background: "#111827",
      textColor: "#f9fafb",
      mutedColor: "#9ca3af",
      accentColor: "#818cf8",
      showSocial: true,
      socialStyle: "circle",
      borderColor: "#1f2937",
      textFont: "system-ui, -apple-system, 'Segoe UI', sans-serif",
    },
    fields: [
      { key: "brandName", label: "Brand name", type: "text", group: "content" },
      { key: "tagline", label: "Tagline", type: "text", group: "content" },
      { key: "columns", label: "Columns (Title::links)", type: "list", group: "content", help: "One per line: Title::link1, link2" },
      { key: "background", label: "Background", type: "color", group: "style" },
      { key: "textColor", label: "Text color", type: "color", group: "style" },
      { key: "mutedColor", label: "Muted text color", type: "color", group: "style" },
      { key: "accentColor", label: "Accent color", type: "color", group: "style" },
      { key: "showSocial", label: "Show social icons", type: "boolean", group: "content" },
      { key: "socialStyle", label: "Social icon style", type: "radio", group: "style", options: [{ label: "Circle", value: "circle" }, { label: "Square", value: "square" }, { label: "Minimal", value: "minimal" }] },
      { key: "borderColor", label: "Top border color", type: "color", group: "style" },
      ...textStyleFields(),
    ],
    signature: {
      test: (el) => (el.tagName.toLowerCase() === "footer" ? 0.95 : 0),
    },
  },

  hero: {
    type: "hero",
    label: "Hero section",
    category: "layout",
    description: "Landing hero with headline, subtext, CTAs and optional image.",
    icon: "Sparkles",
    defaultBox: { x: 0, y: 0, w: 12, h: 7 },
    defaultParams: {
      headline: "Build interfaces at the speed of thought",
      subheadline: "Drag, style and ship production-ready components — no CSS wrestling required.",
      ctaPrimary: "Get started free",
      ctaSecondary: "Watch demo",
      imageUrl: "/images/abstract-gradient.svg",
      layout: "split",
      align: "left",
      background: "#eef2ff",
      textColor: "#111827",
      mutedColor: "#4b5563",
      accentColor: "#6366f1",
      accentTextColor: "#ffffff",
      textFont: "'Inter', system-ui, sans-serif",
      borderRadius: 16,
      durationMs: 400,
      easing: "ease-out",
      trigger: "load",
    },
    fields: [
      { key: "headline", label: "Headline", type: "textarea", group: "content" },
      { key: "subheadline", label: "Subheadline", type: "textarea", group: "content" },
      { key: "ctaPrimary", label: "Primary CTA", type: "text", group: "content" },
      { key: "ctaSecondary", label: "Secondary CTA", type: "text", group: "content" },
      { key: "imageUrl", label: "Image", type: "asset", group: "content" },
      { key: "layout", label: "Layout", type: "radio", group: "style", options: [{ label: "Split", value: "split" }, { label: "Centered", value: "center" }, { label: "Image bg", value: "image" }] },
      { key: "align", label: "Text align", type: "alignment", group: "style", options: alignmentOptions },
      { key: "background", label: "Background", type: "color", group: "style" },
      { key: "textColor", label: "Text color", type: "color", group: "style" },
      { key: "mutedColor", label: "Muted text color", type: "color", group: "style" },
      { key: "accentColor", label: "Primary CTA color", type: "color", group: "style" },
      { key: "accentTextColor", label: "Primary CTA text", type: "color", group: "style" },
      { key: "borderRadius", label: "Radius (px)", type: "range", group: "style", min: 0, max: 48 },
      ...textStyleFields(),
      ...motionFields(),
    ],
    signature: {
      test: (el) => {
        const cls = el.className?.toString().toLowerCase() ?? "";
        if (cls.includes("hero")) return 0.85;
        if (el.tagName.toLowerCase() === "section" && el.querySelector("h1")) return 0.6;
        return 0;
      },
    },
  },

  divider: {
    type: "divider",
    label: "Divider",
    category: "layout",
    description: "Horizontal rule with optional label and style.",
    icon: "Minus",
    defaultBox: { x: 0, y: 0, w: 12, h: 1 },
    defaultParams: {
      label: "",
      style: "solid",
      thickness: 1,
      color: "#e5e7eb",
      labelPosition: "center",
      textColor: "#6b7280",
      durationMs: 300,
      easing: "ease-out",
      trigger: "load",
    },
    fields: [
      { key: "label", label: "Label (optional)", type: "text", group: "content" },
      { key: "style", label: "Line style", type: "radio", group: "style", options: [{ label: "Solid", value: "solid" }, { label: "Dashed", value: "dashed" }, { label: "Dotted", value: "dotted" }, { label: "Gradient", value: "gradient" }] },
      { key: "thickness", label: "Thickness (px)", type: "range", group: "style", min: 1, max: 8 },
      { key: "color", label: "Color", type: "color", group: "style" },
      { key: "labelPosition", label: "Label position", type: "radio", group: "style", options: [{ label: "Left", value: "left" }, { label: "Center", value: "center" }, { label: "Right", value: "right" }] },
      { key: "textColor", label: "Label color", type: "color", group: "style" },
      ...motionFields(),
    ],
    signature: { test: (el) => (el.tagName.toLowerCase() === "hr" ? 0.95 : 0) },
  },

  stickyHeader: {
    type: "stickyHeader",
    label: "Sticky header",
    category: "layout",
    description: "Header bar that pins on scroll with shrink/blur behavior.",
    icon: "PanelTop",
    defaultBox: { x: 0, y: 0, w: 12, h: 1 },
    defaultParams: {
      logoText: "Brand",
      links: ["Home", "Product", "Pricing", "Contact"],
      background: "#ffffff",
      textColor: "#111827",
      linkColor: "#4b5563",
      linkHoverColor: "#6366f1",
      ctaLabel: "Sign up",
      ctaBackground: "#6366f1",
      ctaTextColor: "#ffffff",
      shrinkOnScroll: true,
      blurOnScroll: true,
      shadowOnScroll: true,
      textFont: "system-ui, -apple-system, 'Segoe UI', sans-serif",
      durationMs: 200,
      easing: "ease-out",
      trigger: "scroll",
    },
    fields: [
      { key: "logoText", label: "Logo text", type: "text", group: "content" },
      { key: "links", label: "Nav links", type: "list", group: "content" },
      { key: "background", label: "Background", type: "color", group: "style" },
      { key: "textColor", label: "Logo color", type: "color", group: "style" },
      { key: "linkColor", label: "Link color", type: "color", group: "style" },
      { key: "linkHoverColor", label: "Link hover color", type: "color", group: "style" },
      { key: "ctaLabel", label: "CTA label", type: "text", group: "content" },
      { key: "ctaBackground", label: "CTA background", type: "color", group: "style" },
      { key: "ctaTextColor", label: "CTA text color", type: "color", group: "style" },
      { key: "shrinkOnScroll", label: "Shrink on scroll", type: "boolean", group: "behavior" },
      { key: "blurOnScroll", label: "Blur on scroll", type: "boolean", group: "behavior" },
      { key: "shadowOnScroll", label: "Shadow on scroll", type: "boolean", group: "behavior" },
      ...textStyleFields(),
      ...motionFields(),
    ],
    signature: {
      test: (el) => {
        if (el.tagName.toLowerCase() === "header") return 0.7;
        const style = (el as HTMLElement).style;
        if (style && (style.position === "sticky" || style.position === "fixed")) return 0.6;
        return 0;
      },
    },
  },

  pageTransition: {
    type: "pageTransition",
    label: "Page transition wrapper",
    category: "layout",
    description: "Wraps page content with an enter/exit transition.",
    icon: "SquareStack",
    defaultBox: { x: 0, y: 0, w: 12, h: 8 },
    defaultParams: {
      transitionStyle: "fade-slide",
      distancePx: 24,
      durationMs: 380,
      easing: "cubic-bezier(.22,1,.36,1)",
      trigger: "load",
      staggerChildrenMs: 40,
    },
    fields: [
      { key: "transitionStyle", label: "Style", type: "radio", group: "motion", options: [{ label: "Fade", value: "fade" }, { label: "Fade + slide", value: "fade-slide" }, { label: "Scale", value: "scale" }] },
      { key: "distancePx", label: "Slide distance (px)", type: "range", group: "motion", min: 0, max: 120 },
      { key: "staggerChildrenMs", label: "Stagger children (ms)", type: "range", group: "motion", min: 0, max: 300 },
      ...motionFields(),
    ],
    signature: {
      test: (el) => {
        const cls = el.className?.toString().toLowerCase() ?? "";
        if (cls.includes("page-transition") || cls.includes("transition-wrapper")) return 0.8;
        return 0;
      },
    },
  },

  // ──────────────────────────────────────────── INTERACTION ──────────────
  tabs: {
    type: "tabs",
    label: "Tabs",
    category: "interaction",
    description: "Tabbed content switcher with configurable transition.",
    icon: "PanelsTopLeft",
    defaultBox: { x: 0, y: 0, w: 8, h: 6 },
    defaultParams: {
      tabs: ["Overview", "Specs", "Reviews"],
      activeIndex: 0,
      orientation: "horizontal",
      variant: "underline",
      indicatorColor: "#6366f1",
      activeTextColor: "#111827",
      inactiveTextColor: "#6b7280",
      fontSize: "sm",
      paddingY: 10,
      textFont: "system-ui, -apple-system, 'Segoe UI', sans-serif",
      durationMs: 220,
      easing: "ease-out",
      trigger: "click",
    },
    fields: [
      { key: "tabs", label: "Tab labels", type: "list", group: "content" },
      { key: "orientation", label: "Orientation", type: "radio", group: "style", options: [{ label: "Horizontal", value: "horizontal" }, { label: "Vertical", value: "vertical" }] },
      { key: "variant", label: "Variant", type: "radio", group: "style", options: [{ label: "Underline", value: "underline" }, { label: "Pills", value: "pills" }, { label: "Boxed", value: "boxed" }] },
      { key: "indicatorColor", label: "Indicator color", type: "color", group: "style" },
      { key: "activeTextColor", label: "Active text color", type: "color", group: "style" },
      { key: "inactiveTextColor", label: "Inactive text color", type: "color", group: "style" },
      { key: "fontSize", label: "Text size", type: "select", group: "style", options: sizeOptions },
      { key: "paddingY", label: "Vertical padding (px)", type: "range", group: "style", min: 2, max: 24 },
      ...textStyleFields(),
      ...motionFields(),
    ],
    signature: {
      test: (el) => {
        if (el.getAttribute("role") === "tablist") return 0.95;
        if (el.querySelector('[role="tablist"]')) return 0.9;
        const cls = el.className?.toString().toLowerCase() ?? "";
        if (cls.includes("tab") && el.querySelectorAll('[role="tab"], .tab, .tab-item').length >= 2) return 0.75;
        return 0;
      },
    },
  },

  carousel: {
    type: "carousel",
    label: "Carousel",
    category: "interaction",
    description: "Swipeable/looping slide carousel.",
    icon: "GalleryHorizontal",
    defaultBox: { x: 0, y: 0, w: 8, h: 6 },
    defaultParams: {
      slides: ["Slide one", "Slide two", "Slide three"],
      autoplay: true,
      intervalMs: 3500,
      loop: true,
      swipe: true,
      showDots: true,
      showArrows: true,
      textAlign: "center",
      textFont: "'Inter', system-ui, sans-serif",
      fontSize: "md",
      slidePadding: 24,
      dotColor: "#6366f1",
      arrowStyle: "circle",
      durationMs: 450,
      easing: "cubic-bezier(.22,1,.36,1)",
      trigger: "load",
    },
    fields: [
      { key: "slides", label: "Slides", type: "list", group: "content" },
      { key: "autoplay", label: "Autoplay", type: "boolean", group: "behavior" },
      { key: "intervalMs", label: "Autoplay interval (ms)", type: "range", group: "behavior", min: 500, max: 10000, step: 100 },
      { key: "loop", label: "Loop", type: "boolean", group: "behavior" },
      { key: "swipe", label: "Swipe enabled", type: "boolean", group: "behavior" },
      { key: "showDots", label: "Show dots", type: "boolean", group: "style" },
      { key: "showArrows", label: "Show arrows", type: "boolean", group: "style" },
      { key: "textAlign", label: "Slide text align", type: "alignment", group: "style", options: alignmentOptions },
      { key: "fontSize", label: "Slide text size", type: "select", group: "style", options: sizeOptions },
      { key: "slidePadding", label: "Slide padding (px)", type: "range", group: "style", min: 0, max: 64 },
      { key: "dotColor", label: "Dot color", type: "color", group: "style" },
      { key: "arrowStyle", label: "Arrow style", type: "radio", group: "style", options: [{ label: "Circle", value: "circle" }, { label: "Square", value: "square" }, { label: "Minimal", value: "minimal" }] },
      ...textStyleFields(),
      ...motionFields(),
    ],
    signature: {
      test: (el) => {
        const cls = el.className?.toString().toLowerCase() ?? "";
        if (cls.includes("carousel") || cls.includes("slider") || cls.includes("swiper")) return 0.85;
        if (el.getAttribute("data-carousel") !== null) return 0.9;
        return 0;
      },
    },
  },

  searchBar: {
    type: "searchBar",
    label: "Search bar",
    category: "interaction",
    description: "Search input with icon, suggestions and submit behavior.",
    icon: "Search",
    defaultBox: { x: 0, y: 0, w: 4, h: 1 },
    defaultParams: {
      placeholder: "Search…",
      showIcon: true,
      rounded: 999,
      size: "md",
      background: "#f3f4f6",
      textColor: "#111827",
      accentColor: "#6366f1",
      borderColor: "#e5e7eb",
      showSuggestions: true,
      textFont: "system-ui, -apple-system, 'Segoe UI', sans-serif",
      durationMs: 150,
      easing: "ease-out",
      trigger: "click",
    },
    fields: [
      { key: "placeholder", label: "Placeholder", type: "text", group: "content" },
      { key: "showIcon", label: "Show icon", type: "boolean", group: "style" },
      { key: "rounded", label: "Corner radius (px)", type: "range", group: "style", min: 0, max: 999 },
      { key: "size", label: "Size", type: "radio", group: "style", options: sizeOptions },
      { key: "background", label: "Background", type: "color", group: "style" },
      { key: "textColor", label: "Text color", type: "color", group: "style" },
      { key: "accentColor", label: "Focus accent", type: "color", group: "style" },
      { key: "borderColor", label: "Border color", type: "color", group: "style" },
      { key: "showSuggestions", label: "Show suggestion dropdown", type: "boolean", group: "behavior" },
      ...textStyleFields(),
      ...motionFields(),
    ],
    signature: {
      test: (el) => {
        if (el.tagName.toLowerCase() === "input" && (el.getAttribute("type") === "search" || (el.getAttribute("placeholder") ?? "").toLowerCase().includes("search"))) return 0.9;
        if (el.querySelector('input[type="search"]')) return 0.8;
        const cls = el.className?.toString().toLowerCase() ?? "";
        if (cls.includes("search")) return 0.6;
        return 0;
      },
    },
  },

  button: {
    type: "button",
    label: "Button",
    category: "interaction",
    description: "Call-to-action button with full state styling.",
    icon: "MousePointerClick",
    defaultBox: { x: 0, y: 0, w: 2, h: 1 },
    defaultParams: {
      label: "Get started",
      variant: "solid",
      size: "md",
      icon: "arrow-right",
      iconPosition: "right",
      fullWidth: false,
      background: "#6366f1",
      hoverBackground: "#4f46e5",
      textColor: "#ffffff",
      borderRadius: 10,
      borderWidth: 2,
      paddingX: 20,
      paddingY: 12,
      shadow: "sm",
      fontWeight: 600,
      textFont: "system-ui, -apple-system, 'Segoe UI', sans-serif",
      durationMs: 150,
      easing: "ease-out",
      trigger: "hover",
      transform: "scale(1.03)",
    },
    fields: [
      { key: "label", label: "Label", type: "text", group: "content" },
      { key: "variant", label: "Variant", type: "radio", group: "style", options: [{ label: "Solid", value: "solid" }, { label: "Outline", value: "outline" }, { label: "Ghost", value: "ghost" }, { label: "Gradient", value: "gradient" }] },
      { key: "size", label: "Size", type: "radio", group: "style", options: sizeOptions },
      { key: "icon", label: "Icon", type: "icon", group: "content", options: iconOptions },
      { key: "iconPosition", label: "Icon position", type: "radio", group: "style", options: [{ label: "Left", value: "left" }, { label: "Right", value: "right" }] },
      { key: "fullWidth", label: "Full width", type: "boolean", group: "style" },
      { key: "background", label: "Background", type: "color", group: "style" },
      { key: "hoverBackground", label: "Hover background", type: "color", group: "style" },
      { key: "textColor", label: "Text color", type: "color", group: "style" },
      { key: "borderRadius", label: "Radius (px)", type: "range", group: "style", min: 0, max: 48 },
      { key: "borderWidth", label: "Border width (px)", type: "range", group: "style", min: 0, max: 6 },
      { key: "paddingX", label: "Padding X (px)", type: "range", group: "style", min: 0, max: 64 },
      { key: "paddingY", label: "Padding Y (px)", type: "range", group: "style", min: 0, max: 48 },
      { key: "shadow", label: "Shadow", type: "select", group: "style", options: shadowOptions },
      { key: "fontWeight", label: "Font weight", type: "select", group: "style", options: [400, 500, 600, 700, 800].map((v) => ({ label: String(v), value: String(v) })) },
      { key: "transform", label: "Hover transform", type: "text", group: "motion" },
      ...textStyleFields(),
      ...motionFields(),
    ],
    signature: {
      test: (el) => {
        const tag = el.tagName.toLowerCase();
        if (tag === "button") return 0.9;
        if (tag === "a" && (el.className?.toString().toLowerCase().includes("btn") || el.className?.toString().toLowerCase().includes("button"))) return 0.7;
        return 0;
      },
    },
  },

  modal: {
    type: "modal",
    label: "Modal",
    category: "interaction",
    description: "Dialog overlay with configurable entrance animation.",
    icon: "PictureInPicture",
    defaultBox: { x: 0, y: 0, w: 6, h: 5 },
    defaultParams: {
      title: "Modal title",
      body: "Modal body content.",
      size: "md",
      overlayColor: "rgba(0,0,0,0.5)",
      backdropBlur: 0,
      panelBackground: "#ffffff",
      borderRadius: 16,
      entrance: "scale",
      showCloseButton: true,
      closeOnOverlayClick: true,
      textFont: "system-ui, -apple-system, 'Segoe UI', sans-serif",
      durationMs: 220,
      easing: "ease-out",
      trigger: "click",
    },
    fields: [
      { key: "title", label: "Title", type: "text", group: "content" },
      { key: "body", label: "Body", type: "textarea", group: "content" },
      { key: "size", label: "Size", type: "radio", group: "style", options: sizeOptions },
      { key: "overlayColor", label: "Overlay color", type: "color", group: "style" },
      { key: "backdropBlur", label: "Backdrop blur (px)", type: "range", group: "style", min: 0, max: 20 },
      { key: "panelBackground", label: "Panel background", type: "color", group: "style" },
      { key: "borderRadius", label: "Radius (px)", type: "range", group: "style", min: 0, max: 48 },
      { key: "entrance", label: "Entrance animation", type: "radio", group: "motion", options: [{ label: "Scale", value: "scale" }, { label: "Slide up", value: "slide-up" }, { label: "Fade", value: "fade" }] },
      { key: "showCloseButton", label: "Show close button", type: "boolean", group: "behavior" },
      { key: "closeOnOverlayClick", label: "Close on overlay click", type: "boolean", group: "behavior" },
      ...textStyleFields(),
      ...motionFields(),
    ],
    signature: {
      test: (el) => {
        if (el.getAttribute("role") === "dialog") return 0.95;
        const cls = el.className?.toString().toLowerCase() ?? "";
        if (cls.includes("modal") || cls.includes("dialog")) return 0.75;
        return 0;
      },
    },
  },

  accordion: {
    type: "accordion",
    label: "Accordion",
    category: "interaction",
    description: "Expand/collapse list of items.",
    icon: "ChevronsUpDown",
    defaultBox: { x: 0, y: 0, w: 6, h: 5 },
    defaultParams: {
      items: [
        { title: "What is this?", body: "An accordion item." },
        { title: "How does it animate?", body: "Height transitions with easing." },
      ],
      allowMultipleOpen: false,
      initialOpenIndex: 0,
      iconStyle: "chevron",
      dividerColor: "#e5e7eb",
      headerTextColor: "#111827",
      bodyTextColor: "#6b7280",
      fontSize: "sm",
      textFont: "system-ui, -apple-system, 'Segoe UI', sans-serif",
      durationMs: 220,
      easing: "ease-in-out",
      trigger: "click",
    },
    fields: [
      { key: "items", label: "Items (title::body per line)", type: "list", group: "content" },
      { key: "allowMultipleOpen", label: "Allow multiple open", type: "boolean", group: "behavior" },
      { key: "initialOpenIndex", label: "Initially open index", type: "number", group: "behavior", min: -1, max: 20 },
      { key: "iconStyle", label: "Icon style", type: "radio", group: "style", options: [{ label: "Chevron", value: "chevron" }, { label: "Plus", value: "plus" }, { label: "Arrow", value: "arrow" }] },
      { key: "dividerColor", label: "Divider color", type: "color", group: "style" },
      { key: "headerTextColor", label: "Header text color", type: "color", group: "style" },
      { key: "bodyTextColor", label: "Body text color", type: "color", group: "style" },
      { key: "fontSize", label: "Text size", type: "select", group: "style", options: sizeOptions },
      ...textStyleFields(),
      ...motionFields(),
    ],
    signature: {
      test: (el) => {
        const cls = el.className?.toString().toLowerCase() ?? "";
        if (cls.includes("accordion")) return 0.85;
        if (el.querySelectorAll("details").length >= 2) return 0.7;
        return 0;
      },
    },
  },

  dropdown: {
    type: "dropdown",
    label: "Dropdown menu",
    category: "interaction",
    description: "Button-triggered dropdown menu.",
    icon: "ListTodo",
    defaultBox: { x: 0, y: 0, w: 3, h: 2 },
    defaultParams: {
      buttonLabel: "Menu",
      items: ["Profile", "Settings", "Billing", "Log out"],
      variant: "solid",
      openOn: "click",
      background: "#6366f1",
      textColor: "#ffffff",
      menuBackground: "#ffffff",
      menuTextColor: "#111827",
      menuHoverColor: "#f3f4f6",
      borderColor: "#e5e7eb",
      rounded: 10,
      shadow: "md",
      textFont: "system-ui, -apple-system, 'Segoe UI', sans-serif",
      durationMs: 160,
      easing: "ease-out",
      trigger: "click",
    },
    fields: [
      { key: "buttonLabel", label: "Button label", type: "text", group: "content" },
      { key: "items", label: "Menu items", type: "list", group: "content" },
      { key: "variant", label: "Button variant", type: "radio", group: "style", options: [{ label: "Solid", value: "solid" }, { label: "Outline", value: "outline" }, { label: "Ghost", value: "ghost" }] },
      { key: "openOn", label: "Open on", type: "radio", group: "behavior", options: [{ label: "Click", value: "click" }, { label: "Hover", value: "hover" }] },
      { key: "background", label: "Button background", type: "color", group: "style" },
      { key: "textColor", label: "Button text color", type: "color", group: "style" },
      { key: "menuBackground", label: "Menu background", type: "color", group: "style" },
      { key: "menuTextColor", label: "Menu text color", type: "color", group: "style" },
      { key: "menuHoverColor", label: "Menu hover color", type: "color", group: "style" },
      { key: "borderColor", label: "Menu border color", type: "color", group: "style" },
      { key: "rounded", label: "Radius (px)", type: "range", group: "style", min: 0, max: 24 },
      { key: "shadow", label: "Shadow", type: "select", group: "style", options: shadowOptions },
      ...textStyleFields(),
      ...motionFields(),
    ],
    signature: {
      test: (el) => {
        const cls = el.className?.toString().toLowerCase() ?? "";
        if (cls.includes("dropdown") || cls.includes("menu")) return 0.75;
        return 0;
      },
    },
  },

  toggle: {
    type: "toggle",
    label: "Toggle switch",
    category: "interaction",
    description: "On/off switch with label.",
    icon: "ToggleLeft",
    defaultBox: { x: 0, y: 0, w: 3, h: 1 },
    defaultParams: {
      label: "Enable notifications",
      checked: true,
      onColor: "#6366f1",
      offColor: "#d1d5db",
      knobColor: "#ffffff",
      size: "md",
      labelPosition: "right",
      textColor: "#111827",
      textFont: "system-ui, -apple-system, 'Segoe UI', sans-serif",
      durationMs: 160,
      easing: "ease-out",
      trigger: "click",
    },
    fields: [
      { key: "label", label: "Label", type: "text", group: "content" },
      { key: "checked", label: "Default on", type: "boolean", group: "behavior" },
      { key: "onColor", label: "On color", type: "color", group: "style" },
      { key: "offColor", label: "Off color", type: "color", group: "style" },
      { key: "knobColor", label: "Knob color", type: "color", group: "style" },
      { key: "size", label: "Size", type: "radio", group: "style", options: sizeOptions },
      { key: "labelPosition", label: "Label position", type: "radio", group: "style", options: [{ label: "Left", value: "left" }, { label: "Right", value: "right" }] },
      { key: "textColor", label: "Label color", type: "color", group: "style" },
      ...textStyleFields(),
      ...motionFields(),
    ],
    signature: {
      test: (el) => {
        if (el.getAttribute("role") === "switch") return 0.9;
        const cls = el.className?.toString().toLowerCase() ?? "";
        if (cls.includes("toggle") || cls.includes("switch")) return 0.6;
        return 0;
      },
    },
  },

  slider: {
    type: "slider",
    label: "Range slider",
    category: "interaction",
    description: "Value slider with label and live readout.",
    icon: "SlidersHorizontal",
    defaultBox: { x: 0, y: 0, w: 4, h: 1 },
    defaultParams: {
      label: "Volume",
      min: 0,
      max: 100,
      step: 1,
      value: 42,
      color: "#6366f1",
      trackColor: "#e5e7eb",
      showValue: true,
      textColor: "#111827",
      textFont: "system-ui, -apple-system, 'Segoe UI', sans-serif",
      durationMs: 120,
      easing: "ease-out",
      trigger: "hover",
    },
    fields: [
      { key: "label", label: "Label", type: "text", group: "content" },
      { key: "min", label: "Minimum", type: "number", group: "behavior" },
      { key: "max", label: "Maximum", type: "number", group: "behavior" },
      { key: "step", label: "Step", type: "number", group: "behavior", min: 0.1, max: 100, step: 0.1 },
      { key: "value", label: "Default value", type: "range", group: "behavior", min: 0, max: 100 },
      { key: "color", label: "Fill color", type: "color", group: "style" },
      { key: "trackColor", label: "Track color", type: "color", group: "style" },
      { key: "showValue", label: "Show value", type: "boolean", group: "style" },
      { key: "textColor", label: "Text color", type: "color", group: "style" },
      ...textStyleFields(),
      ...motionFields(),
    ],
    signature: {
      test: (el) => (el.tagName.toLowerCase() === "input" && el.getAttribute("type") === "range" ? 0.9 : 0),
    },
  },

  tooltip: {
    type: "tooltip",
    label: "Tooltip",
    category: "interaction",
    description: "Floating hint anchored to a trigger element.",
    icon: "MessageSquareText",
    defaultBox: { x: 0, y: 0, w: 3, h: 2 },
    defaultParams: {
      anchorText: "Hover me",
      text: "This is a helpful tooltip.",
      position: "top",
      showArrow: true,
      background: "#111827",
      textColor: "#ffffff",
      rounded: 8,
      textFont: "system-ui, -apple-system, 'Segoe UI', sans-serif",
      durationMs: 180,
      easing: "ease-out",
      trigger: "hover",
    },
    fields: [
      { key: "anchorText", label: "Anchor text", type: "text", group: "content" },
      { key: "text", label: "Tooltip text", type: "text", group: "content" },
      { key: "position", label: "Position", type: "radio", group: "style", options: [{ label: "Top", value: "top" }, { label: "Bottom", value: "bottom" }, { label: "Left", value: "left" }, { label: "Right", value: "right" }] },
      { key: "showArrow", label: "Show arrow", type: "boolean", group: "style" },
      { key: "background", label: "Background", type: "color", group: "style" },
      { key: "textColor", label: "Text color", type: "color", group: "style" },
      { key: "rounded", label: "Radius (px)", type: "range", group: "style", min: 0, max: 24 },
      ...textStyleFields(),
      ...motionFields(),
    ],
    signature: {
      test: (el) => {
        const cls = el.className?.toString().toLowerCase() ?? "";
        if (cls.includes("tooltip")) return 0.85;
        if (el.getAttribute("data-tooltip")) return 0.8;
        return 0;
      },
    },
  },

  stepper: {
    type: "stepper",
    label: "Stepper / wizard",
    category: "interaction",
    description: "Step indicator for multi-step flows.",
    icon: "ListChecks",
    defaultBox: { x: 0, y: 0, w: 8, h: 2 },
    defaultParams: {
      steps: ["Cart", "Shipping", "Payment", "Done"],
      current: 1,
      orientation: "horizontal",
      activeColor: "#6366f1",
      inactiveColor: "#d1d5db",
      doneColor: "#4f46e5",
      textColor: "#111827",
      connectorColor: "#e5e7eb",
      showNumbers: true,
      textFont: "system-ui, -apple-system, 'Segoe UI', sans-serif",
      durationMs: 240,
      easing: "ease-out",
      trigger: "load",
    },
    fields: [
      { key: "steps", label: "Steps", type: "list", group: "content" },
      { key: "current", label: "Current step (0-based)", type: "number", group: "behavior", min: 0, max: 20 },
      { key: "orientation", label: "Orientation", type: "radio", group: "style", options: [{ label: "Horizontal", value: "horizontal" }, { label: "Vertical", value: "vertical" }] },
      { key: "activeColor", label: "Active color", type: "color", group: "style" },
      { key: "inactiveColor", label: "Inactive color", type: "color", group: "style" },
      { key: "doneColor", label: "Done color", type: "color", group: "style" },
      { key: "textColor", label: "Text color", type: "color", group: "style" },
      { key: "connectorColor", label: "Connector color", type: "color", group: "style" },
      { key: "showNumbers", label: "Show numbers", type: "boolean", group: "style" },
      ...textStyleFields(),
      ...motionFields(),
    ],
    signature: {
      test: (el) => {
        const cls = el.className?.toString().toLowerCase() ?? "";
        if (cls.includes("stepper") || cls.includes("steps") || cls.includes("wizard")) return 0.8;
        return 0;
      },
    },
  },

  segmentedControl: {
    type: "segmentedControl",
    label: "Segmented control",
    category: "interaction",
    description: "iOS-style segmented option picker.",
    icon: "Columns3",
    defaultBox: { x: 0, y: 0, w: 4, h: 1 },
    defaultParams: {
      options: ["Day", "Week", "Month"],
      selected: 0,
      background: "#e5e7eb",
      activeBackground: "#ffffff",
      textColor: "#4b5563",
      activeTextColor: "#111827",
      rounded: 10,
      textFont: "system-ui, -apple-system, 'Segoe UI', sans-serif",
      durationMs: 200,
      easing: "ease-out",
      trigger: "click",
    },
    fields: [
      { key: "options", label: "Options", type: "list", group: "content" },
      { key: "selected", label: "Default selected", type: "number", group: "behavior", min: 0, max: 20 },
      { key: "background", label: "Track background", type: "color", group: "style" },
      { key: "activeBackground", label: "Active background", type: "color", group: "style" },
      { key: "textColor", label: "Text color", type: "color", group: "style" },
      { key: "activeTextColor", label: "Active text color", type: "color", group: "style" },
      { key: "rounded", label: "Radius (px)", type: "range", group: "style", min: 0, max: 999 },
      ...textStyleFields(),
      ...motionFields(),
    ],
    signature: {
      test: (el) => {
        const cls = el.className?.toString().toLowerCase() ?? "";
        if (cls.includes("segmented")) return 0.8;
        return 0;
      },
    },
  },

  // ─────────────────────────────────────────────── CONTENT ───────────────
  card: {
    type: "card",
    label: "Card",
    category: "content",
    description: "Content card with optional image, title, body and a hover-reveal overlay.",
    icon: "IdCard",
    defaultBox: { x: 0, y: 0, w: 4, h: 5 },
    defaultParams: {
      title: "Card title",
      body: "A short description of this card content goes here.",
      imageUrl: "",
      imageHeightPct: 50,
      background: "#ffffff",
      borderRadius: 16,
      shadow: "md",
      padding: 16,
      titleSize: "md",
      textAlign: "left",
      textFont: "system-ui, -apple-system, 'Segoe UI', sans-serif",
      hoverReveal: true,
      revealContent: "Learn more →",
      revealBackground: "rgba(17,24,39,0.85)",
      revealTextColor: "#ffffff",
      transform: "translateY(0) scale(1.02)",
      durationMs: 260,
      easing: "ease-out",
      trigger: "hover",
    },
    fields: [
      { key: "title", label: "Title", type: "text", group: "content" },
      { key: "body", label: "Body text", type: "textarea", group: "content" },
      { key: "imageUrl", label: "Image", type: "asset", group: "content" },
      { key: "imageHeightPct", label: "Image height (%)", type: "range", group: "style", min: 0, max: 100 },
      { key: "background", label: "Background", type: "color", group: "style" },
      { key: "borderRadius", label: "Radius (px)", type: "range", group: "style", min: 0, max: 48 },
      { key: "shadow", label: "Shadow", type: "select", group: "style", options: shadowOptions },
      { key: "padding", label: "Padding (px)", type: "range", group: "style", min: 4, max: 48 },
      { key: "titleSize", label: "Title size", type: "select", group: "style", options: sizeOptions },
      { key: "textAlign", label: "Text align", type: "alignment", group: "style", options: alignmentOptions },
      { key: "hoverReveal", label: "Enable hover reveal", type: "boolean", group: "behavior" },
      { key: "revealContent", label: "Reveal text", type: "text", group: "content" },
      { key: "revealBackground", label: "Reveal background", type: "color", group: "style" },
      { key: "revealTextColor", label: "Reveal text color", type: "color", group: "style" },
      { key: "transform", label: "Hover transform", type: "text", group: "motion", help: "CSS transform applied on trigger" },
      ...textStyleFields(),
      ...motionFields(),
    ],
    signature: {
      test: (el) => {
        const cls = el.className?.toString().toLowerCase() ?? "";
        const tag = el.tagName.toLowerCase();
        if (cls.includes("card")) return 0.85;
        if (tag === "article") return 0.6;
        if (tag === "div" && el.querySelector("img") && (el.querySelector("h1,h2,h3,h4") || el.querySelector("p"))) return 0.55;
        return 0;
      },
    },
  },

  imageHover: {
    type: "imageHover",
    label: "Image (hover-reveal)",
    category: "content",
    description: "Image that reveals a caption/panel on trigger.",
    icon: "ImagePlus",
    defaultBox: { x: 0, y: 0, w: 4, h: 5 },
    defaultParams: {
      imageUrl: "",
      caption: "Caption text",
      overlayColor: "rgba(0,0,0,0.55)",
      captionColor: "#ffffff",
      captionPosition: "bottom",
      textAlign: "left",
      zoomScale: 1.08,
      textFont: "system-ui, -apple-system, 'Segoe UI', sans-serif",
      durationMs: 320,
      easing: "ease-in-out",
      trigger: "hover",
      objectFit: "cover",
      borderRadius: 12,
    },
    fields: [
      { key: "imageUrl", label: "Image", type: "asset", group: "content" },
      { key: "caption", label: "Caption", type: "text", group: "content" },
      { key: "overlayColor", label: "Overlay color", type: "color", group: "style" },
      { key: "captionColor", label: "Caption color", type: "color", group: "style" },
      { key: "captionPosition", label: "Caption position", type: "radio", group: "style", options: [{ label: "Top", value: "top" }, { label: "Center", value: "center" }, { label: "Bottom", value: "bottom" }] },
      { key: "textAlign", label: "Caption align", type: "alignment", group: "style", options: alignmentOptions },
      { key: "zoomScale", label: "Zoom scale", type: "range", group: "motion", min: 1, max: 1.5, step: 0.01 },
      { key: "objectFit", label: "Object fit", type: "radio", group: "style", options: [{ label: "Cover", value: "cover" }, { label: "Contain", value: "contain" }, { label: "Fill", value: "fill" }] },
      { key: "borderRadius", label: "Radius (px)", type: "range", group: "style", min: 0, max: 48 },
      ...textStyleFields(),
      ...motionFields(),
    ],
    signature: {
      test: (el) => {
        if (el.tagName.toLowerCase() === "figure" && el.querySelector("img")) return 0.7;
        const cls = el.className?.toString().toLowerCase() ?? "";
        if (cls.includes("reveal") || cls.includes("hover-img")) return 0.8;
        return 0;
      },
    },
  },

  table: {
    type: "table",
    label: "Table",
    category: "content",
    description: "Data table with sortable columns and striped rows.",
    icon: "Table",
    defaultBox: { x: 0, y: 0, w: 8, h: 6 },
    defaultParams: {
      columns: ["Name", "Role", "Status"],
      rows: [
        ["Ada Lovelace", "Engineer", "Active"],
        ["Grace Hopper", "Admiral", "Active"],
        ["Alan Turing", "Researcher", "Invited"],
      ],
      striped: true,
      sortable: true,
      stickyHeader: true,
      headerBackground: "#111827",
      headerTextColor: "#ffffff",
      headerAlign: "left",
      rowHoverColor: "#f3f4f6",
      borderColor: "#e5e7eb",
      fontSize: "sm",
      cellPadding: 8,
      textFont: "system-ui, -apple-system, 'Segoe UI', sans-serif",
    },
    fields: [
      { key: "columns", label: "Columns", type: "list", group: "content" },
      { key: "striped", label: "Striped rows", type: "boolean", group: "style" },
      { key: "sortable", label: "Sortable columns", type: "boolean", group: "behavior" },
      { key: "stickyHeader", label: "Sticky header", type: "boolean", group: "behavior" },
      { key: "headerBackground", label: "Header background", type: "color", group: "style" },
      { key: "headerTextColor", label: "Header text color", type: "color", group: "style" },
      { key: "headerAlign", label: "Header align", type: "alignment", group: "style", options: alignmentOptions },
      { key: "rowHoverColor", label: "Row hover color", type: "color", group: "style" },
      { key: "borderColor", label: "Border color", type: "color", group: "style" },
      { key: "fontSize", label: "Text size", type: "select", group: "style", options: sizeOptions },
      { key: "cellPadding", label: "Cell padding (px)", type: "range", group: "style", min: 2, max: 24 },
      ...textStyleFields(),
    ],
    signature: {
      test: (el) => (el.tagName.toLowerCase() === "table" ? 0.98 : 0),
    },
  },

  avatar: {
    type: "avatar",
    label: "Avatar",
    category: "content",
    description: "Profile avatar with ring and online status.",
    icon: "User",
    defaultBox: { x: 0, y: 0, w: 1, h: 1 },
    defaultParams: {
      imageUrl: "/images/avatar-1.jpg",
      name: "A",
      size: 64,
      shape: "circle",
      ringColor: "#6366f1",
      ringWidth: 2,
      showStatus: true,
      statusColor: "#22c55e",
      background: "#e0e7ff",
      textColor: "#4338ca",
      textFont: "system-ui, -apple-system, 'Segoe UI', sans-serif",
    },
    fields: [
      { key: "imageUrl", label: "Image", type: "asset", group: "content" },
      { key: "name", label: "Fallback initials", type: "text", group: "content" },
      { key: "size", label: "Size (px)", type: "range", group: "style", min: 24, max: 128 },
      { key: "shape", label: "Shape", type: "radio", group: "style", options: [{ label: "Circle", value: "circle" }, { label: "Rounded", value: "rounded" }, { label: "Square", value: "square" }] },
      { key: "ringColor", label: "Ring color", type: "color", group: "style" },
      { key: "ringWidth", label: "Ring width (px)", type: "range", group: "style", min: 0, max: 6 },
      { key: "showStatus", label: "Show status dot", type: "boolean", group: "style" },
      { key: "statusColor", label: "Status color", type: "color", group: "style" },
      { key: "background", label: "Fallback background", type: "color", group: "style" },
      { key: "textColor", label: "Fallback text color", type: "color", group: "style" },
      ...textStyleFields(),
    ],
    signature: {
      test: (el) => {
        const cls = el.className?.toString().toLowerCase() ?? "";
        if (cls.includes("avatar")) return 0.9;
        if (el.tagName.toLowerCase() === "img" && cls.includes("rounded")) return 0.5;
        return 0;
      },
    },
  },

  badge: {
    type: "badge",
    label: "Badge",
    category: "content",
    description: "Pill label with icon.",
    icon: "BadgeCheck",
    defaultBox: { x: 0, y: 0, w: 2, h: 1 },
    defaultParams: {
      text: "New",
      variant: "solid",
      color: "#6366f1",
      textColor: "#ffffff",
      icon: "sparkles",
      size: "md",
      rounded: 999,
      textFont: "system-ui, -apple-system, 'Segoe UI', sans-serif",
    },
    fields: [
      { key: "text", label: "Text", type: "text", group: "content" },
      { key: "variant", label: "Variant", type: "radio", group: "style", options: [{ label: "Solid", value: "solid" }, { label: "Soft", value: "soft" }, { label: "Outline", value: "outline" }] },
      { key: "color", label: "Color", type: "color", group: "style" },
      { key: "textColor", label: "Text color", type: "color", group: "style" },
      { key: "icon", label: "Icon", type: "icon", group: "content", options: iconOptions },
      { key: "size", label: "Size", type: "radio", group: "style", options: sizeOptions },
      { key: "rounded", label: "Radius (px)", type: "range", group: "style", min: 0, max: 999 },
      ...textStyleFields(),
    ],
    signature: {
      test: (el) => {
        const cls = el.className?.toString().toLowerCase() ?? "";
        if (cls.includes("badge") || cls.includes("pill") || cls.includes("tag")) return 0.7;
        return 0;
      },
    },
  },

  rating: {
    type: "rating",
    label: "Rating",
    category: "content",
    description: "Star/heart rating display, optionally interactive.",
    icon: "Star",
    defaultBox: { x: 0, y: 0, w: 3, h: 1 },
    defaultParams: {
      value: 4.5,
      max: 5,
      icon: "star",
      color: "#f59e0b",
      emptyColor: "#e5e7eb",
      size: 20,
      interactive: true,
      showValue: true,
      durationMs: 150,
      easing: "ease-out",
      trigger: "hover",
    },
    fields: [
      { key: "value", label: "Value", type: "range", group: "content", min: 0, max: 5, step: 0.5 },
      { key: "max", label: "Max", type: "number", group: "behavior", min: 1, max: 10 },
      { key: "icon", label: "Icon", type: "radio", group: "style", options: [{ label: "Star", value: "star" }, { label: "Heart", value: "heart" }, { label: "Thumbs up", value: "thumbs-up" }] },
      { key: "color", label: "Active color", type: "color", group: "style" },
      { key: "emptyColor", label: "Empty color", type: "color", group: "style" },
      { key: "size", label: "Icon size (px)", type: "range", group: "style", min: 12, max: 48 },
      { key: "interactive", label: "Interactive", type: "boolean", group: "behavior" },
      { key: "showValue", label: "Show numeric value", type: "boolean", group: "style" },
      ...motionFields(),
    ],
    signature: {
      test: (el) => {
        const cls = el.className?.toString().toLowerCase() ?? "";
        if (cls.includes("rating") || cls.includes("stars")) return 0.8;
        if (el.getAttribute("role") === "meter") return 0.6;
        return 0;
      },
    },
  },

  progress: {
    type: "progress",
    label: "Progress bar",
    category: "content",
    description: "Progress indicator with label and animation options.",
    icon: "Gauge",
    defaultBox: { x: 0, y: 0, w: 4, h: 1 },
    defaultParams: {
      value: 68,
      label: "Loading assets",
      showLabel: true,
      color: "#6366f1",
      trackColor: "#e5e7eb",
      height: 10,
      rounded: 999,
      animated: true,
      striped: false,
      textColor: "#111827",
      textFont: "system-ui, -apple-system, 'Segoe UI', sans-serif",
      durationMs: 300,
      easing: "ease-out",
      trigger: "load",
    },
    fields: [
      { key: "value", label: "Value (%)", type: "range", group: "content", min: 0, max: 100 },
      { key: "label", label: "Label", type: "text", group: "content" },
      { key: "showLabel", label: "Show label", type: "boolean", group: "style" },
      { key: "color", label: "Fill color", type: "color", group: "style" },
      { key: "trackColor", label: "Track color", type: "color", group: "style" },
      { key: "height", label: "Height (px)", type: "range", group: "style", min: 4, max: 40 },
      { key: "rounded", label: "Radius (px)", type: "range", group: "style", min: 0, max: 999 },
      { key: "animated", label: "Animated fill", type: "boolean", group: "motion" },
      { key: "striped", label: "Striped", type: "boolean", group: "style" },
      { key: "textColor", label: "Text color", type: "color", group: "style" },
      ...textStyleFields(),
      ...motionFields(),
    ],
    signature: {
      test: (el) => {
        if (el.tagName.toLowerCase() === "progress") return 0.9;
        const cls = el.className?.toString().toLowerCase() ?? "";
        if (cls.includes("progress")) return 0.7;
        return 0;
      },
    },
  },

  stat: {
    type: "stat",
    label: "Stat / metric",
    category: "content",
    description: "Key metric with icon and trend indicator.",
    icon: "BarChart3",
    defaultBox: { x: 0, y: 0, w: 3, h: 2 },
    defaultParams: {
      value: "24.8K",
      label: "Monthly visitors",
      icon: "trending-up",
      delta: "+12.4%",
      deltaDirection: "up",
      accentColor: "#6366f1",
      background: "#ffffff",
      borderRadius: 14,
      textColor: "#111827",
      mutedColor: "#6b7280",
      shadow: "sm",
      textFont: "system-ui, -apple-system, 'Segoe UI', sans-serif",
    },
    fields: [
      { key: "value", label: "Value", type: "text", group: "content" },
      { key: "label", label: "Label", type: "text", group: "content" },
      { key: "icon", label: "Icon", type: "icon", group: "content", options: iconOptions },
      { key: "delta", label: "Trend text", type: "text", group: "content" },
      { key: "deltaDirection", label: "Trend direction", type: "radio", group: "content", options: [{ label: "Up", value: "up" }, { label: "Down", value: "down" }, { label: "None", value: "none" }] },
      { key: "accentColor", label: "Accent color", type: "color", group: "style" },
      { key: "background", label: "Background", type: "color", group: "style" },
      { key: "borderRadius", label: "Radius (px)", type: "range", group: "style", min: 0, max: 48 },
      { key: "textColor", label: "Text color", type: "color", group: "style" },
      { key: "mutedColor", label: "Muted color", type: "color", group: "style" },
      { key: "shadow", label: "Shadow", type: "select", group: "style", options: shadowOptions },
      ...textStyleFields(),
    ],
    signature: {
      test: (el) => {
        const cls = el.className?.toString().toLowerCase() ?? "";
        if (cls.includes("stat") || cls.includes("metric") || cls.includes("counter")) return 0.75;
        return 0;
      },
    },
  },

  testimonial: {
    type: "testimonial",
    label: "Testimonial",
    category: "content",
    description: "Quote card with author and rating.",
    icon: "Quote",
    defaultBox: { x: 0, y: 0, w: 4, h: 4 },
    defaultParams: {
      quote: "This tool changed how our team ships. We prototype in hours, not weeks.",
      author: "Alex Rivera",
      role: "Product Lead, Acme",
      avatarUrl: "/images/avatar-2.jpg",
      rating: 5,
      background: "#ffffff",
      textColor: "#111827",
      mutedColor: "#6b7280",
      accentColor: "#f59e0b",
      borderRadius: 16,
      shadow: "md",
      textFont: "'Inter', system-ui, sans-serif",
    },
    fields: [
      { key: "quote", label: "Quote", type: "textarea", group: "content" },
      { key: "author", label: "Author", type: "text", group: "content" },
      { key: "role", label: "Role", type: "text", group: "content" },
      { key: "avatarUrl", label: "Avatar", type: "asset", group: "content" },
      { key: "rating", label: "Rating", type: "range", group: "content", min: 0, max: 5, step: 0.5 },
      { key: "background", label: "Background", type: "color", group: "style" },
      { key: "textColor", label: "Text color", type: "color", group: "style" },
      { key: "mutedColor", label: "Muted color", type: "color", group: "style" },
      { key: "accentColor", label: "Star color", type: "color", group: "style" },
      { key: "borderRadius", label: "Radius (px)", type: "range", group: "style", min: 0, max: 48 },
      { key: "shadow", label: "Shadow", type: "select", group: "style", options: shadowOptions },
      ...textStyleFields(),
    ],
    signature: {
      test: (el) => (el.tagName.toLowerCase() === "blockquote" ? 0.9 : 0),
    },
  },

  pricing: {
    type: "pricing",
    label: "Pricing card",
    category: "content",
    description: "Subscription plan card with feature list.",
    icon: "CircleDollarSign",
    defaultBox: { x: 0, y: 0, w: 4, h: 6 },
    defaultParams: {
      planName: "Pro",
      price: "29",
      currency: "$",
      period: "/month",
      description: "For growing teams",
      features: ["Unlimited projects", "50 GB storage", "Priority support", "Custom domains"],
      ctaLabel: "Start free trial",
      highlighted: true,
      accentColor: "#6366f1",
      background: "#ffffff",
      textColor: "#111827",
      mutedColor: "#6b7280",
      borderRadius: 16,
      shadow: "lg",
      textFont: "system-ui, -apple-system, 'Segoe UI', sans-serif",
    },
    fields: [
      { key: "planName", label: "Plan name", type: "text", group: "content" },
      { key: "price", label: "Price", type: "text", group: "content" },
      { key: "currency", label: "Currency", type: "text", group: "content" },
      { key: "period", label: "Period", type: "text", group: "content" },
      { key: "description", label: "Description", type: "text", group: "content" },
      { key: "features", label: "Features", type: "list", group: "content" },
      { key: "ctaLabel", label: "CTA label", type: "text", group: "content" },
      { key: "highlighted", label: "Highlighted", type: "boolean", group: "style" },
      { key: "accentColor", label: "Accent color", type: "color", group: "style" },
      { key: "background", label: "Background", type: "color", group: "style" },
      { key: "textColor", label: "Text color", type: "color", group: "style" },
      { key: "mutedColor", label: "Muted color", type: "color", group: "style" },
      { key: "borderRadius", label: "Radius (px)", type: "range", group: "style", min: 0, max: 48 },
      { key: "shadow", label: "Shadow", type: "select", group: "style", options: shadowOptions },
      ...textStyleFields(),
    ],
    signature: {
      test: (el) => {
        const cls = el.className?.toString().toLowerCase() ?? "";
        if (cls.includes("pricing") || cls.includes("plan")) return 0.8;
        return 0;
      },
    },
  },

  timeline: {
    type: "timeline",
    label: "Timeline",
    category: "content",
    description: "Vertical or horizontal event timeline.",
    icon: "Milestone",
    defaultBox: { x: 0, y: 0, w: 6, h: 6 },
    defaultParams: {
      items: ["2024::Company founded", "2025::Series A raised", "2026::1M users reached"],
      orientation: "vertical",
      alternate: false,
      dotColor: "#6366f1",
      lineColor: "#e5e7eb",
      titleColor: "#111827",
      bodyColor: "#6b7280",
      textFont: "system-ui, -apple-system, 'Segoe UI', sans-serif",
      durationMs: 300,
      easing: "ease-out",
      trigger: "scroll",
    },
    fields: [
      { key: "items", label: "Items (date::text)", type: "list", group: "content" },
      { key: "orientation", label: "Orientation", type: "radio", group: "style", options: [{ label: "Vertical", value: "vertical" }, { label: "Horizontal", value: "horizontal" }] },
      { key: "alternate", label: "Alternate sides", type: "boolean", group: "style" },
      { key: "dotColor", label: "Dot color", type: "color", group: "style" },
      { key: "lineColor", label: "Line color", type: "color", group: "style" },
      { key: "titleColor", label: "Date color", type: "color", group: "style" },
      { key: "bodyColor", label: "Text color", type: "color", group: "style" },
      ...textStyleFields(),
      ...motionFields(),
    ],
    signature: {
      test: (el) => {
        const cls = el.className?.toString().toLowerCase() ?? "";
        if (cls.includes("timeline")) return 0.85;
        return 0;
      },
    },
  },

  alert: {
    type: "alert",
    label: "Alert",
    category: "content",
    description: "Info/success/warning/error banner.",
    icon: "CircleAlert",
    defaultBox: { x: 0, y: 0, w: 6, h: 2 },
    defaultParams: {
      variant: "info",
      title: "Heads up",
      body: "This is an informational alert with a helpful message.",
      showIcon: true,
      dismissible: true,
      borderRadius: 12,
      textFont: "system-ui, -apple-system, 'Segoe UI', sans-serif",
    },
    fields: [
      { key: "variant", label: "Variant", type: "radio", group: "style", options: [{ label: "Info", value: "info" }, { label: "Success", value: "success" }, { label: "Warning", value: "warning" }, { label: "Error", value: "error" }] },
      { key: "title", label: "Title", type: "text", group: "content" },
      { key: "body", label: "Body", type: "textarea", group: "content" },
      { key: "showIcon", label: "Show icon", type: "boolean", group: "style" },
      { key: "dismissible", label: "Dismissible", type: "boolean", group: "behavior" },
      { key: "borderRadius", label: "Radius (px)", type: "range", group: "style", min: 0, max: 32 },
      ...textStyleFields(),
    ],
    signature: {
      test: (el) => {
        if (el.getAttribute("role") === "alert") return 0.9;
        const cls = el.className?.toString().toLowerCase() ?? "";
        if (cls.includes("alert") || cls.includes("notice")) return 0.7;
        return 0;
      },
    },
  },

  videoPlayer: {
    type: "videoPlayer",
    label: "Video player",
    category: "content",
    description: "Embedded video with poster and controls.",
    icon: "Play",
    defaultBox: { x: 0, y: 0, w: 6, h: 5 },
    defaultParams: {
      videoUrl: "",
      posterUrl: "/images/lifestyle-travel.jpg",
      aspect: "16:9",
      autoplay: false,
      controls: true,
      loop: false,
      muted: true,
      rounded: 12,
      shadow: "md",
    },
    fields: [
      { key: "videoUrl", label: "Video URL (mp4/webm)", type: "text", group: "content" },
      { key: "posterUrl", label: "Poster image", type: "asset", group: "content" },
      { key: "aspect", label: "Aspect ratio", type: "radio", group: "style", options: [{ label: "16:9", value: "16:9" }, { label: "4:3", value: "4:3" }, { label: "1:1", value: "1:1" }] },
      { key: "autoplay", label: "Autoplay", type: "boolean", group: "behavior" },
      { key: "controls", label: "Show controls", type: "boolean", group: "behavior" },
      { key: "loop", label: "Loop", type: "boolean", group: "behavior" },
      { key: "muted", label: "Muted", type: "boolean", group: "behavior" },
      { key: "rounded", label: "Radius (px)", type: "range", group: "style", min: 0, max: 32 },
      { key: "shadow", label: "Shadow", type: "select", group: "style", options: shadowOptions },
    ],
    signature: {
      test: (el) => (el.tagName.toLowerCase() === "video" ? 0.95 : 0),
    },
  },

  codeBlock: {
    type: "codeBlock",
    label: "Code block",
    category: "content",
    description: "Syntax-display code snippet.",
    icon: "Code2",
    defaultBox: { x: 0, y: 0, w: 6, h: 4 },
    defaultParams: {
      language: "typescript",
      headerLabel: "example.ts",
      code: 'const greet = (name: string) => {\n  return `Hello, ${name}!`;\n};\n\ngreet("world");',
      theme: "dark",
      background: "#0f172a",
      headerBackground: "#1e293b",
      textColor: "#e2e8f0",
      accentColor: "#818cf8",
      showLineNumbers: true,
      copyButton: true,
      rounded: 12,
      textFont: "'Roboto Mono', ui-monospace, monospace",
    },
    fields: [
      { key: "language", label: "Language", type: "text", group: "content" },
      { key: "headerLabel", label: "Header label", type: "text", group: "content" },
      { key: "code", label: "Code", type: "textarea", group: "content" },
      { key: "theme", label: "Theme", type: "radio", group: "style", options: [{ label: "Dark", value: "dark" }, { label: "Light", value: "light" }] },
      { key: "background", label: "Background", type: "color", group: "style" },
      { key: "headerBackground", label: "Header background", type: "color", group: "style" },
      { key: "textColor", label: "Text color", type: "color", group: "style" },
      { key: "accentColor", label: "Accent color", type: "color", group: "style" },
      { key: "showLineNumbers", label: "Line numbers", type: "boolean", group: "style" },
      { key: "copyButton", label: "Copy button", type: "boolean", group: "behavior" },
      { key: "rounded", label: "Radius (px)", type: "range", group: "style", min: 0, max: 32 },
      ...textStyleFields(),
    ],
    signature: {
      test: (el) => {
        if (el.tagName.toLowerCase() === "pre") return 0.9;
        if (el.querySelector("pre")) return 0.7;
        return 0;
      },
    },
  },

  newsletter: {
    type: "newsletter",
    label: "Newsletter form",
    category: "content",
    description: "Email capture form.",
    icon: "Mail",
    defaultBox: { x: 0, y: 0, w: 6, h: 3 },
    defaultParams: {
      headline: "Stay in the loop",
      subheadline: "Get product updates and design tips in your inbox.",
      placeholder: "you@example.com",
      buttonLabel: "Subscribe",
      layout: "stacked",
      background: "#eef2ff",
      accentColor: "#6366f1",
      accentTextColor: "#ffffff",
      textColor: "#111827",
      mutedColor: "#6b7280",
      borderRadius: 16,
      textFont: "system-ui, -apple-system, 'Segoe UI', sans-serif",
      durationMs: 180,
      easing: "ease-out",
      trigger: "load",
    },
    fields: [
      { key: "headline", label: "Headline", type: "text", group: "content" },
      { key: "subheadline", label: "Subheadline", type: "textarea", group: "content" },
      { key: "placeholder", label: "Input placeholder", type: "text", group: "content" },
      { key: "buttonLabel", label: "Button label", type: "text", group: "content" },
      { key: "layout", label: "Layout", type: "radio", group: "style", options: [{ label: "Stacked", value: "stacked" }, { label: "Inline", value: "inline" }] },
      { key: "background", label: "Background", type: "color", group: "style" },
      { key: "accentColor", label: "Button color", type: "color", group: "style" },
      { key: "accentTextColor", label: "Button text", type: "color", group: "style" },
      { key: "textColor", label: "Text color", type: "color", group: "style" },
      { key: "mutedColor", label: "Muted color", type: "color", group: "style" },
      { key: "borderRadius", label: "Radius (px)", type: "range", group: "style", min: 0, max: 48 },
      ...textStyleFields(),
      ...motionFields(),
    ],
    signature: {
      test: (el) => {
        if (el.querySelector('input[type="email"]')) return 0.85;
        const cls = el.className?.toString().toLowerCase() ?? "";
        if (cls.includes("newsletter")) return 0.7;
        return 0;
      },
    },
  },

  breadcrumb: {
    type: "breadcrumb",
    label: "Breadcrumb",
    category: "content",
    description: "Path navigation trail.",
    icon: "ChevronRight",
    defaultBox: { x: 0, y: 0, w: 4, h: 1 },
    defaultParams: {
      items: ["Home", "Docs", "Components"],
      separator: "/",
      textColor: "#6b7280",
      currentColor: "#111827",
      hoverColor: "#6366f1",
      textFont: "system-ui, -apple-system, 'Segoe UI', sans-serif",
    },
    fields: [
      { key: "items", label: "Items", type: "list", group: "content" },
      { key: "separator", label: "Separator", type: "radio", group: "style", options: [{ label: "/", value: "/" }, { label: "›", value: "›" }, { label: "•", value: "•" }, { label: "→", value: "→" }] },
      { key: "textColor", label: "Text color", type: "color", group: "style" },
      { key: "currentColor", label: "Current page color", type: "color", group: "style" },
      { key: "hoverColor", label: "Hover color", type: "color", group: "style" },
      ...textStyleFields(),
    ],
    signature: {
      test: (el) => {
        const cls = el.className?.toString().toLowerCase() ?? "";
        if (cls.includes("breadcrumb")) return 0.85;
        if (el.tagName.toLowerCase() === "nav" && el.getAttribute("aria-label")?.toLowerCase().includes("breadcrumb")) return 0.8;
        return 0;
      },
    },
  },

  marquee: {
    type: "marquee",
    label: "Marquee / ticker",
    category: "content",
    description: "Continuously scrolling text or logo strip.",
    icon: "IterationCw",
    defaultBox: { x: 0, y: 0, w: 12, h: 2 },
    defaultParams: {
      items: ["Fast", "Flexible", "Open source", "Modern", "Reliable"],
      durationMs: 12000,
      pauseOnHover: true,
      reverse: false,
      background: "#111827",
      textColor: "#f9fafb",
      separator: "•",
      fontSize: "lg",
      textFont: "'Inter', system-ui, sans-serif",
    },
    fields: [
      { key: "items", label: "Items", type: "list", group: "content" },
      { key: "durationMs", label: "Loop duration (ms)", type: "range", group: "motion", min: 2000, max: 40000, step: 500 },
      { key: "pauseOnHover", label: "Pause on hover", type: "boolean", group: "behavior" },
      { key: "reverse", label: "Reverse direction", type: "boolean", group: "behavior" },
      { key: "background", label: "Background", type: "color", group: "style" },
      { key: "textColor", label: "Text color", type: "color", group: "style" },
      { key: "separator", label: "Separator", type: "text", group: "style" },
      { key: "fontSize", label: "Text size", type: "select", group: "style", options: sizeOptions },
      ...textStyleFields(),
    ],
    signature: {
      test: (el) => {
        const cls = el.className?.toString().toLowerCase() ?? "";
        if (cls.includes("marquee") || cls.includes("ticker")) return 0.8;
        return 0;
      },
    },
  },

  iconList: {
    type: "iconList",
    label: "Icon list",
    category: "content",
    description: "Feature list with icon per item.",
    icon: "ListChecks",
    defaultBox: { x: 0, y: 0, w: 4, h: 4 },
    defaultParams: {
      items: ["zap::Instant setup::Get started in seconds", "shield::Private by design::Your data stays yours", "globe::Works anywhere::Runs in every browser"],
      columns: 1,
      iconColor: "#6366f1",
      titleColor: "#111827",
      bodyColor: "#6b7280",
      textFont: "system-ui, -apple-system, 'Segoe UI', sans-serif",
    },
    fields: [
      { key: "items", label: "Items (icon::title::body)", type: "list", group: "content", help: "One per line: icon-name::Title::Body" },
      { key: "columns", label: "Columns", type: "radio", group: "style", options: [{ label: "1", value: "1" }, { label: "2", value: "2" }] },
      { key: "iconColor", label: "Icon color", type: "color", group: "style" },
      { key: "titleColor", label: "Title color", type: "color", group: "style" },
      { key: "bodyColor", label: "Body color", type: "color", group: "style" },
      ...textStyleFields(),
    ],
    signature: {
      test: (el) => {
        const cls = el.className?.toString().toLowerCase() ?? "";
        if (cls.includes("icon-list") || cls.includes("feature-list")) return 0.75;
        return 0;
      },
    },
  },

  gallery: {
    type: "gallery",
    label: "Image gallery",
    category: "content",
    description: "Responsive image grid.",
    icon: "Images",
    defaultBox: { x: 0, y: 0, w: 8, h: 6 },
    defaultParams: {
      images: ["/images/product-headphones.jpg", "/images/product-watch.jpg", "/images/product-sneaker.jpg", "/images/product-camera.jpg"],
      columns: 3,
      gap: 8,
      rounded: 12,
      aspect: "1:1",
      hoverZoom: true,
      shadow: "none",
    },
    fields: [
      { key: "images", label: "Image URLs (one per line)", type: "list", group: "content" },
      { key: "columns", label: "Columns", type: "range", group: "style", min: 1, max: 6 },
      { key: "gap", label: "Gap (px)", type: "range", group: "style", min: 0, max: 32 },
      { key: "rounded", label: "Radius (px)", type: "range", group: "style", min: 0, max: 32 },
      { key: "aspect", label: "Aspect ratio", type: "radio", group: "style", options: [{ label: "1:1", value: "1:1" }, { label: "4:3", value: "4:3" }, { label: "16:9", value: "16:9" }, { label: "3:4", value: "3:4" }] },
      { key: "hoverZoom", label: "Hover zoom", type: "boolean", group: "motion" },
      { key: "shadow", label: "Shadow", type: "select", group: "style", options: shadowOptions },
    ],
    signature: {
      test: (el) => {
        const cls = el.className?.toString().toLowerCase() ?? "";
        if (cls.includes("gallery") || cls.includes("grid")) {
          const imgs = el.querySelectorAll("img").length;
          if (imgs >= 3) return 0.7;
        }
        return 0;
      },
    },
  },

  features: {
    type: "features",
    label: "Feature grid",
    category: "content",
    description: "Section with headline and feature cards.",
    icon: "Grid2x2",
    defaultBox: { x: 0, y: 0, w: 12, h: 6 },
    defaultParams: {
      heading: "Everything you need",
      subheading: "A few reasons teams love the builder.",
      features: ["zap::Lightning fast::Instant previews on every edit", "shield::Rock solid::Baked-in security defaults", "globe::Ship anywhere::Export to React, static HTML", "sparkles::Delightful motion::Easing, triggers, transitions"],
      columns: 3,
      iconColor: "#6366f1",
      headingColor: "#111827",
      bodyColor: "#6b7280",
      background: "#ffffff",
      borderRadius: 16,
      textAlign: "center",
      textFont: "system-ui, -apple-system, 'Segoe UI', sans-serif",
    },
    fields: [
      { key: "heading", label: "Heading", type: "text", group: "content" },
      { key: "subheading", label: "Subheading", type: "textarea", group: "content" },
      { key: "features", label: "Features (icon::title::body)", type: "list", group: "content" },
      { key: "columns", label: "Columns", type: "range", group: "style", min: 1, max: 4 },
      { key: "iconColor", label: "Icon color", type: "color", group: "style" },
      { key: "headingColor", label: "Heading color", type: "color", group: "style" },
      { key: "bodyColor", label: "Body color", type: "color", group: "style" },
      { key: "background", label: "Background", type: "color", group: "style" },
      { key: "borderRadius", label: "Radius (px)", type: "range", group: "style", min: 0, max: 48 },
      { key: "textAlign", label: "Text align", type: "alignment", group: "style", options: alignmentOptions },
      ...textStyleFields(),
    ],
    signature: {
      test: (el) => {
        const cls = el.className?.toString().toLowerCase() ?? "";
        if (cls.includes("features") || cls.includes("feature-grid")) return 0.8;
        return 0;
      },
    },
  },

  rawBlock: {
    type: "rawBlock",
    label: "Raw block",
    category: "content",
    description: "Unmatched imported markup, preserved exactly and editable via the escape hatch.",
    icon: "FileCode2",
    defaultBox: { x: 0, y: 0, w: 6, h: 4 },
    defaultParams: {
      html: "<div>Custom markup</div>",
    },
    fields: [{ key: "html", label: "Raw HTML", type: "textarea", group: "advanced" }],
    signature: { test: () => 0 },
  },
};

export const ALL_COMPONENT_TYPES = Object.keys(COMPONENT_LIBRARY) as ComponentType[];
export const PALETTE_TYPES = ALL_COMPONENT_TYPES.filter((t) => t !== "rawBlock");

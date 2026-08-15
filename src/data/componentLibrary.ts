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

// Fields common to every component (escape hatch is added separately by the panel)
const motionFields = (prefix = ""): ParamField[] => [
  {
    key: `${prefix}durationMs`,
    label: "Duration (ms)",
    type: "number",
    group: "motion",
    min: 0,
    max: 4000,
    step: 10,
  },
  {
    key: `${prefix}easing`,
    label: "Easing",
    type: "easing",
    group: "motion",
    options: easingOptions,
  },
  {
    key: `${prefix}trigger`,
    label: "Trigger",
    type: "trigger",
    group: "behavior",
    options: triggerOptions,
  },
];

export const COMPONENT_LIBRARY: Record<ComponentType, ComponentDefinition> = {
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
    },
    fields: [
      { key: "direction", label: "Direction", type: "select", group: "style", options: [{ label: "Row", value: "row" }, { label: "Column", value: "column" }] },
      { key: "gap", label: "Gap (px)", type: "number", group: "style", min: 0, max: 96 },
      { key: "padding", label: "Padding (px)", type: "number", group: "style", min: 0, max: 96 },
      { key: "align", label: "Align items", type: "select", group: "style", options: ["start", "center", "end", "stretch"].map((v) => ({ label: v, value: v })) },
      { key: "justify", label: "Justify content", type: "select", group: "style", options: ["start", "center", "end", "between", "around"].map((v) => ({ label: v, value: v })) },
      { key: "background", label: "Background", type: "color", group: "style" },
      { key: "borderRadius", label: "Radius (px)", type: "number", group: "style", min: 0, max: 64 },
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
      indicatorColor: "#6366f1",
      activeTextColor: "#111827",
      inactiveTextColor: "#6b7280",
      durationMs: 220,
      easing: "ease-out",
      trigger: "click",
    },
    fields: [
      { key: "tabs", label: "Tab labels", type: "list", group: "content" },
      { key: "orientation", label: "Orientation", type: "select", group: "style", options: [{ label: "Horizontal", value: "horizontal" }, { label: "Vertical", value: "vertical" }] },
      { key: "indicatorColor", label: "Indicator color", type: "color", group: "style" },
      { key: "activeTextColor", label: "Active text color", type: "color", group: "style" },
      { key: "inactiveTextColor", label: "Inactive text color", type: "color", group: "style" },
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
      background: "#ffffff",
      borderRadius: 16,
      shadow: "md",
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
      { key: "background", label: "Background", type: "color", group: "style" },
      { key: "borderRadius", label: "Radius (px)", type: "number", group: "style", min: 0, max: 48 },
      { key: "shadow", label: "Shadow", type: "select", group: "style", options: ["none", "sm", "md", "lg", "xl"].map((v) => ({ label: v, value: v })) },
      { key: "hoverReveal", label: "Enable hover reveal", type: "boolean", group: "behavior" },
      { key: "revealContent", label: "Reveal text", type: "text", group: "content" },
      { key: "revealBackground", label: "Reveal background", type: "color", group: "style" },
      { key: "revealTextColor", label: "Reveal text color", type: "color", group: "style" },
      { key: "transform", label: "Hover transform", type: "text", group: "motion", help: "CSS transform applied on trigger" },
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
      zoomScale: 1.08,
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
      { key: "zoomScale", label: "Zoom scale", type: "number", group: "motion", min: 1, max: 1.5, step: 0.01 },
      { key: "objectFit", label: "Object fit", type: "select", group: "style", options: ["cover", "contain", "fill"].map((v) => ({ label: v, value: v })) },
      { key: "borderRadius", label: "Radius (px)", type: "number", group: "style", min: 0, max: 48 },
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
      durationMs: 450,
      easing: "cubic-bezier(.22,1,.36,1)",
      trigger: "load",
      dotColor: "#6366f1",
      arrowStyle: "circle",
    },
    fields: [
      { key: "slides", label: "Slides", type: "list", group: "content" },
      { key: "autoplay", label: "Autoplay", type: "boolean", group: "behavior" },
      { key: "intervalMs", label: "Autoplay interval (ms)", type: "number", group: "behavior", min: 500, max: 10000, step: 100 },
      { key: "loop", label: "Loop", type: "boolean", group: "behavior" },
      { key: "swipe", label: "Swipe enabled", type: "boolean", group: "behavior" },
      { key: "dotColor", label: "Dot color", type: "color", group: "style" },
      { key: "arrowStyle", label: "Arrow style", type: "select", group: "style", options: ["circle", "square", "minimal"].map((v) => ({ label: v, value: v })) },
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
      background: "#f3f4f6",
      textColor: "#111827",
      accentColor: "#6366f1",
      showSuggestions: true,
      durationMs: 150,
      easing: "ease-out",
      trigger: "click",
    },
    fields: [
      { key: "placeholder", label: "Placeholder", type: "text", group: "content" },
      { key: "showIcon", label: "Show icon", type: "boolean", group: "style" },
      { key: "rounded", label: "Corner radius (px)", type: "number", group: "style", min: 0, max: 999 },
      { key: "background", label: "Background", type: "color", group: "style" },
      { key: "textColor", label: "Text color", type: "color", group: "style" },
      { key: "accentColor", label: "Focus accent", type: "color", group: "style" },
      { key: "showSuggestions", label: "Show suggestion dropdown", type: "boolean", group: "behavior" },
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
      headerBackground: "#111827",
      headerTextColor: "#ffffff",
      rowHoverColor: "#f3f4f6",
      borderColor: "#e5e7eb",
    },
    fields: [
      { key: "columns", label: "Columns", type: "list", group: "content" },
      { key: "striped", label: "Striped rows", type: "boolean", group: "style" },
      { key: "sortable", label: "Sortable columns", type: "boolean", group: "behavior" },
      { key: "headerBackground", label: "Header background", type: "color", group: "style" },
      { key: "headerTextColor", label: "Header text color", type: "color", group: "style" },
      { key: "rowHoverColor", label: "Row hover color", type: "color", group: "style" },
      { key: "borderColor", label: "Border color", type: "color", group: "style" },
    ],
    signature: {
      test: (el) => (el.tagName.toLowerCase() === "table" ? 0.98 : 0),
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
      background: "#6366f1",
      hoverBackground: "#4f46e5",
      textColor: "#ffffff",
      borderRadius: 10,
      paddingX: 20,
      paddingY: 12,
      durationMs: 150,
      easing: "ease-out",
      trigger: "hover",
      transform: "scale(1.03)",
    },
    fields: [
      { key: "label", label: "Label", type: "text", group: "content" },
      { key: "variant", label: "Variant", type: "select", group: "style", options: ["solid", "outline", "ghost"].map((v) => ({ label: v, value: v })) },
      { key: "background", label: "Background", type: "color", group: "style" },
      { key: "hoverBackground", label: "Hover background", type: "color", group: "style" },
      { key: "textColor", label: "Text color", type: "color", group: "style" },
      { key: "borderRadius", label: "Radius (px)", type: "number", group: "style", min: 0, max: 48 },
      { key: "paddingX", label: "Padding X (px)", type: "number", group: "style", min: 0, max: 64 },
      { key: "paddingY", label: "Padding Y (px)", type: "number", group: "style", min: 0, max: 48 },
      { key: "transform", label: "Hover transform", type: "text", group: "motion" },
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
      overlayColor: "rgba(0,0,0,0.5)",
      panelBackground: "#ffffff",
      borderRadius: 16,
      entrance: "scale",
      durationMs: 220,
      easing: "ease-out",
      trigger: "click",
      closeOnOverlayClick: true,
    },
    fields: [
      { key: "title", label: "Title", type: "text", group: "content" },
      { key: "body", label: "Body", type: "textarea", group: "content" },
      { key: "overlayColor", label: "Overlay color", type: "color", group: "style" },
      { key: "panelBackground", label: "Panel background", type: "color", group: "style" },
      { key: "borderRadius", label: "Radius (px)", type: "number", group: "style", min: 0, max: 48 },
      { key: "entrance", label: "Entrance animation", type: "select", group: "motion", options: ["scale", "slide-up", "fade"].map((v) => ({ label: v, value: v })) },
      { key: "closeOnOverlayClick", label: "Close on overlay click", type: "boolean", group: "behavior" },
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
    category: "content",
    description: "Expand/collapse list of items.",
    icon: "ChevronsUpDown",
    defaultBox: { x: 0, y: 0, w: 6, h: 5 },
    defaultParams: {
      items: [
        { title: "What is this?", body: "An accordion item." },
        { title: "How does it animate?", body: "Height transitions with easing." },
      ],
      allowMultipleOpen: false,
      iconStyle: "chevron",
      dividerColor: "#e5e7eb",
      headerTextColor: "#111827",
      durationMs: 220,
      easing: "ease-in-out",
      trigger: "click",
    },
    fields: [
      { key: "items", label: "Items (title::body per line)", type: "list", group: "content" },
      { key: "allowMultipleOpen", label: "Allow multiple open", type: "boolean", group: "behavior" },
      { key: "iconStyle", label: "Icon style", type: "select", group: "style", options: ["chevron", "plus", "arrow"].map((v) => ({ label: v, value: v })) },
      { key: "dividerColor", label: "Divider color", type: "color", group: "style" },
      { key: "headerTextColor", label: "Header text color", type: "color", group: "style" },
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
      shrinkOnScroll: true,
      blurOnScroll: true,
      shadowOnScroll: true,
      durationMs: 200,
      easing: "ease-out",
      trigger: "scroll",
    },
    fields: [
      { key: "logoText", label: "Logo text", type: "text", group: "content" },
      { key: "links", label: "Nav links", type: "list", group: "content" },
      { key: "background", label: "Background", type: "color", group: "style" },
      { key: "shrinkOnScroll", label: "Shrink on scroll", type: "boolean", group: "behavior" },
      { key: "blurOnScroll", label: "Blur on scroll", type: "boolean", group: "behavior" },
      { key: "shadowOnScroll", label: "Shadow on scroll", type: "boolean", group: "behavior" },
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
      { key: "transitionStyle", label: "Style", type: "select", group: "motion", options: ["fade", "fade-slide", "scale"].map((v) => ({ label: v, value: v })) },
      { key: "distancePx", label: "Slide distance (px)", type: "number", group: "motion", min: 0, max: 120 },
      { key: "staggerChildrenMs", label: "Stagger children (ms)", type: "number", group: "motion", min: 0, max: 300 },
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

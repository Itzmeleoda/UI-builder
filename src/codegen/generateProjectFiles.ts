import JSZip from "jszip";
import { saveAs } from "file-saver";
import type { ProjectSpec } from "../types";
import { generateComponentJsx } from "./generateComponentJsx";
import { generateStaticHtml } from "./generateStaticHtml";
import { SCHEMA_VERSION } from "../types";

// Deterministic assembly of a full, buildable React + Tailwind (Vite) project
// from a ProjectSpec. Identical input -> identical output (no LLM, no
// randomness). This is the "codegen engine" half of the pipeline.

function slug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "ui-builder-project";
}

export function generateAppTsx(project: ProjectSpec): string {
  const functionBlocks = project.components
    .filter((c) => !["container", "searchBar", "button", "table"].includes(c.type))
    .map((c) => generateComponentJsx(c))
    .join("\n\n");

  const inlineTypes = ["container", "searchBar", "button", "table"];

  const customCodeBlock = (c: (typeof project.components)[number]) =>
    c.customCode && c.type !== "rawBlock"
      ? `\n          {/* escape hatch: custom code slot — review before production use */}\n          <div dangerouslySetInnerHTML={{ __html: ${JSON.stringify(c.customCode)} }} />`
      : "";

  const gridItems = project.components
    .map((c) => {
      const style = `{ gridColumn: "${c.box.x + 1} / span ${c.box.w}", gridRow: "${c.box.y + 1} / span ${c.box.h}" }`;
      if (inlineTypes.includes(c.type)) {
        return `        <div key="${c.id}" style={${style}}>\n          ${generateComponentJsx(c)}${customCodeBlock(c)}\n        </div>`;
      }
      const varName = `${c.type}_${c.id.slice(0, 6)}`;
      return `        <div key="${c.id}" style={${style}}>\n          <${varName} />${customCodeBlock(c)}\n        </div>`;
    })
    .join("\n");

  return `// ─────────────────────────────────────────────────────────────────────────
// GENERATED FILE — produced deterministically by UI Builder Studio's codegen
// engine from the project spec (schema v${project.schemaVersion}). Do not hand-edit if you plan to
// re-import this project's spec.json for further visual editing.
// ─────────────────────────────────────────────────────────────────────────
import React from "react";

${functionBlocks}

export default function App() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(${project.cols}, 1fr)", gridAutoRows: "${project.rowHeight}px", gap: 12, padding: 24 }}>
${gridItems}
    </div>
  );
}
`;
}

export function generatePackageJson(project: ProjectSpec) {
  return JSON.stringify(
    {
      name: slug(project.projectName),
      private: true,
      version: "1.0.0",
      type: "module",
      scripts: { dev: "vite", build: "vite build", preview: "vite preview" },
      dependencies: { react: "^19.0.0", "react-dom": "^19.0.0" },
      devDependencies: {
        "@tailwindcss/vite": "^4.1.0",
        "@vitejs/plugin-react": "^5.0.0",
        tailwindcss: "^4.1.0",
        typescript: "^5.9.0",
        vite: "^7.0.0",
      },
    },
    null,
    2
  );
}

export function generateViteConfig() {
  return `import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
`;
}

export function generateIndexHtml(project: ProjectSpec) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>${project.projectName}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`;
}

export function generateMainTsx() {
  return `import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`;
}

export function generateElectronMain(project: ProjectSpec) {
  return `// GENERATED — minimal Electron wrapper around the same build output.
const { app, BrowserWindow } = require("electron");
const path = require("path");

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    title: "${project.projectName}",
    webPreferences: { contextIsolation: true, nodeIntegration: false },
  });
  win.loadFile(path.join(__dirname, "dist", "index.html"));
}

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
`;
}

export function generateElectronPackageJson(project: ProjectSpec) {
  return JSON.stringify(
    {
      name: `${slug(project.projectName)}-desktop`,
      version: "1.0.0",
      main: "main.js",
      scripts: { start: "electron ." },
      devDependencies: { electron: "^32.0.0" },
    },
    null,
    2
  );
}

export interface ExportOptions {
  includeElectron: boolean;
}

export async function buildAndDownloadZip(project: ProjectSpec, opts: ExportOptions) {
  const zip = new JSZip();
  const root = zip.folder(slug(project.projectName))!;

  root.file("package.json", generatePackageJson(project));
  root.file("vite.config.ts", generateViteConfig());
  root.file("index.html", generateIndexHtml(project));
  root.file("src/main.tsx", generateMainTsx());
  root.file("src/index.css", '@import "tailwindcss";\n');
  root.file("src/App.tsx", generateAppTsx(project));
  root.file("spec.json", JSON.stringify(project, null, 2));
  root.file("static-preview.html", generateStaticHtml(project));
  root.file(
    "README.md",
    `# ${project.projectName}\n\nGenerated by UI Builder Studio (schema v${project.schemaVersion}, codegen v${SCHEMA_VERSION}).\n\n- \`npm install && npm run dev\` to run the React+Tailwind project.\n- \`spec.json\` is the source of truth — re-import it into UI Builder Studio for pixel-exact round-trip editing.\n- \`static-preview.html\` is a standalone file (no build step) with the same embedded spec, useful for the Import feature.\n`
  );

  if (opts.includeElectron) {
    const electron = root.folder("desktop")!;
    electron.file("package.json", generateElectronPackageJson(project));
    electron.file("main.js", generateElectronMain(project));
    electron.file(
      "README.md",
      "Copy the built `dist/` output from the web project into this folder, then `npm install && npm start`.\n"
    );
  }

  const blob = await zip.generateAsync({ type: "blob" });
  saveAs(blob, `${slug(project.projectName)}.zip`);
}

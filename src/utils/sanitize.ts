// Minimal, dependency-free sanitizer used for:
//  1) the escape-hatch "custom code" slot on every component
//  2) any markup pulled in by the import engine before it is stored in a Raw Block
//
// This is intentionally conservative: it strips <script>, inline event handler
// attributes (onClick, onerror, ...), javascript: URLs, and <iframe>/<object>/<embed>
// tags. It does NOT execute or render the markup — Raw Blocks are shown as
// read-only, escaped previews in the canvas and as editable text in the panel.

const DANGEROUS_TAGS = ["script", "iframe", "object", "embed", "link", "style", "meta", "base"];

export function sanitizeHtml(input: string): { safe: string; warnings: string[] } {
  const warnings: string[] = [];
  if (!input) return { safe: "", warnings };

  let safe = input;

  DANGEROUS_TAGS.forEach((tag) => {
    const re = new RegExp(`<${tag}[^>]*>[\\s\\S]*?<\\/${tag}>|<${tag}[^>]*\\/?\\>`, "gi");
    if (re.test(safe)) {
      warnings.push(`Removed <${tag}> tag(s)`);
      safe = safe.replace(re, "");
    }
  });

  const onAttrRe = /\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi;
  if (onAttrRe.test(safe)) {
    warnings.push("Removed inline event handler attribute(s)");
    safe = safe.replace(onAttrRe, "");
  }

  const jsUrlRe = /(href|src)\s*=\s*("javascript:[^"]*"|'javascript:[^']*')/gi;
  if (jsUrlRe.test(safe)) {
    warnings.push("Removed javascript: URL(s)");
    safe = safe.replace(jsUrlRe, '$1="#"');
  }

  return { safe, warnings };
}

export function escapeForDisplay(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

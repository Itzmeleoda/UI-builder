import { useCallback } from "react";
import type { ComponentAction } from "../types";
import { useStore } from "../state/store";

/** Executes a ComponentAction in the live preview:
 *  - link    → opens external URLs in a new tab, shows a toast for internal ones
 *  - scroll  → smooth-scrolls to the target widget on the canvas
 *  - alert   → shows an in-app toast
 *  - custom  → evaluates the user's JS snippet (try/catch, result toasted)
 *  - none    → gentle hint that the element still needs wiring
 */
export function useAction(action: unknown) {
  const pushToast = useStore((s) => s.pushToast);

  return useCallback(
    (e?: { preventDefault?: () => void; stopPropagation?: () => void }) => {
      e?.preventDefault?.();
      const a = (action ?? { type: "none" }) as ComponentAction;
      switch (a.type) {
        case "link": {
          const url = (a.url ?? "").trim();
          if (!url) {
            pushToast("⚠ This link has no URL — add one in the Actions panel", "undo");
            return;
          }
          if (a.target === "_blank" || /^https?:\/\//i.test(url)) {
            window.open(url, a.target === "_blank" ? "_blank" : "_self");
          } else {
            pushToast(`Preview: navigates to “${url}” (live in the exported app)`, "undo");
          }
          return;
        }
        case "scroll": {
          const el = a.componentId ? document.getElementById(`comp-${a.componentId}`) : null;
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
            pushToast("Scrolled to linked section ✓", "undo");
          } else {
            pushToast("⚠ Scroll target not on the canvas — pick a widget in the Actions panel", "undo");
          }
          return;
        }
        case "alert":
          pushToast(a.message?.trim() || "Alert", "undo");
          return;
        case "custom": {
          try {
            const fn = new Function(a.code ?? "");
            const result = fn();
            pushToast(result !== undefined ? `Custom action → ${String(result)}` : "Custom action ran ✓", "undo");
          } catch (err: unknown) {
            pushToast(`⚠ Custom action error: ${err instanceof Error ? err.message : String(err)}`, "undo");
          }
          return;
        }
        default:
          pushToast("ℹ No action assigned yet — wire it up in the Actions section", "undo");
      }
    },
    [action, pushToast]
  );
}

/** Parses "Label::url" list items into { label, url } pairs. */
export function parseLinkItems(items: unknown): { label: string; url: string }[] {
  const list = Array.isArray(items) ? (items as string[]) : [];
  return list
    .map((item) => {
      const [label, ...rest] = String(item).split("::");
      return { label: (label ?? "").trim(), url: rest.join("::").trim() };
    })
    .filter((x) => x.label.length > 0);
}

/** Parses "Label|url" footer links. */
export function parsePipeLink(item: string): { label: string; url: string } {
  const [label, ...rest] = item.split("|");
  return { label: (label ?? "").trim(), url: rest.join("|").trim() };
}

/** Shared click handler for link lists in the preview. */
export function navigatePreview(url: string, pushToast: (m: string, a?: "undo" | "redo") => void) {
  if (!url) return;
  if (/^https?:\/\//i.test(url)) window.open(url, "_blank");
  else pushToast(`Preview: navigates to “${url}” (live in the exported app)`, "undo");
}

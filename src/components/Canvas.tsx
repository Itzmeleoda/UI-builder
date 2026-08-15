import { useCallback, useMemo, useRef, useState } from "react";
import { ReactGridLayout as GridLayout, WidthProvider, type Layout, type LayoutItem } from "react-grid-layout/legacy";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { useStore } from "../state/store";
import { ComponentRenderer } from "../render/ComponentRenderer";
import { COMPONENT_LIBRARY } from "../data/componentLibrary";
import { cn } from "../utils/cn";
import {
  Copy,
  Trash2,
  Wand2,
  AlignStartVertical,
  AlignCenterHorizontal,
  AlignEndVertical,
  AlignStartHorizontal,
  AlignCenterVertical,
  AlignEndHorizontal,
  StretchHorizontal,
  StretchVertical,
  Ruler,
  ArrowLeftRight,
  MousePointer2,
} from "lucide-react";
import type { AlignKind, ComponentType, GridBox } from "../types";

const ReactGridLayout = WidthProvider(GridLayout);

const MARGIN = 12; // px between grid cells
const PAD = 16; // px container padding
const SNAP_THRESHOLD = 6; // px

interface Guide {
  axis: "v" | "h";
  pos: number;
}

interface SnapResult {
  x: number;
  y: number;
  guides: Guide[];
}

function geometry(cols: number, rowHeight: number, containerWidth: number) {
  const colW = (containerWidth - PAD * 2 - MARGIN * (cols - 1)) / cols;
  const pitchX = colW + MARGIN;
  const pitchY = rowHeight + MARGIN;
  const px = (x: number) => PAD + x * pitchX;
  const py = (y: number) => PAD + y * pitchY;
  const itemW = (w: number) => w * colW + (w - 1) * MARGIN;
  const itemH = (h: number) => h * rowHeight + (h - 1) * MARGIN;
  return { colW, pitchX, pitchY, px, py, itemW, itemH };
}

/** Snaps a dragged item's x/y to the edges/centers of other items and the canvas. */
function computeDragSnap(layout: readonly LayoutItem[], dragged: LayoutItem, cols: number, rowHeight: number, containerWidth: number): SnapResult | null {
  const g = geometry(cols, rowHeight, containerWidth);
  const dLeft = g.px(dragged.x);
  const dRight = dLeft + g.itemW(dragged.w);
  const dCenter = (dLeft + dRight) / 2;
  const dTop = g.py(dragged.y);
  const dBottom = dTop + g.itemH(dragged.h);
  const dMiddle = (dTop + dBottom) / 2;

  let bestX: { delta: number; x: number; pos: number } | null = null;
  let bestY: { delta: number; y: number; pos: number } | null = null;

  const tryX = (deltaPx: number, gridDelta: number, pos: number) => {
    if (Math.abs(deltaPx) > SNAP_THRESHOLD) return;
    const x = Math.max(0, Math.min(cols - dragged.w, dragged.x + gridDelta));
    if (!bestX || Math.abs(deltaPx) < Math.abs(bestX.delta)) bestX = { delta: deltaPx, x, pos };
  };
  const tryY = (deltaPx: number, gridDelta: number, pos: number) => {
    if (Math.abs(deltaPx) > SNAP_THRESHOLD) return;
    const y = Math.max(0, dragged.y + gridDelta);
    if (!bestY || Math.abs(deltaPx) < Math.abs(bestY.delta)) bestY = { delta: deltaPx, y, pos };
  };

  const others = layout.filter((i) => i.i !== dragged.i);
  for (const o of others) {
    const oLeft = g.px(o.x);
    const oRight = oLeft + g.itemW(o.w);
    const oCenter = (oLeft + oRight) / 2;
    const oTop = g.py(o.y);
    const oBottom = oTop + g.itemH(o.h);
    const oMiddle = (oTop + oBottom) / 2;
    // vertical guides (x snap)
    tryX(oLeft - dLeft, o.x - dragged.x, oLeft);
    tryX(oRight - dRight, o.x + o.w - (dragged.x + dragged.w), oRight);
    // center snap: align the grid center columns of both widgets
    const oGridCenter = o.x + o.w / 2;
    const dGridCenter = dragged.x + dragged.w / 2;
    tryX(oCenter - dCenter, Math.round(oGridCenter - dGridCenter), oCenter);
    // horizontal guides (y snap)
    tryY(oTop - dTop, o.y - dragged.y, oTop);
    tryY(oBottom - dBottom, o.y + o.h - (dragged.y + dragged.h), oBottom);
    const oGridMiddle = o.y + o.h / 2;
    const dGridMiddle = dragged.y + dragged.h / 2;
    tryY(oMiddle - dMiddle, Math.round(oGridMiddle - dGridMiddle), oMiddle);
  }
  // canvas anchors: left / center / right, top
  tryX(PAD - dLeft, -dragged.x, PAD);
  tryX(g.px(cols) - dRight, cols - (dragged.x + dragged.w), g.px(cols));
  tryX(containerWidth / 2 - dCenter, Math.round(cols / 2 - (dragged.x + dragged.w / 2)), containerWidth / 2);
  tryY(PAD - dTop, -dragged.y, PAD);

  const bx = bestX as { delta: number; x: number; pos: number } | null;
  const by = bestY as { delta: number; y: number; pos: number } | null;
  if (!bx && !by) return null;
  const guides: Guide[] = [];
  if (bx) guides.push({ axis: "v", pos: bx.pos });
  if (by) guides.push({ axis: "h", pos: by.pos });
  return { x: bx ? bx.x : dragged.x, y: by ? by.y : dragged.y, guides };
}

/** Snaps a resized item's w/h to the edges of other items and the canvas. */
function computeResizeSnap(layout: readonly LayoutItem[], dragged: LayoutItem, cols: number, rowHeight: number, containerWidth: number): { w: number; h: number; guides: Guide[] } | null {
  const g = geometry(cols, rowHeight, containerWidth);
  const dLeft = g.px(dragged.x);
  const dRight = dLeft + g.itemW(dragged.w);
  const dTop = g.py(dragged.y);
  const dBottom = dTop + g.itemH(dragged.h);

  let bestW: { delta: number; w: number; pos: number } | null = null;
  let bestH: { delta: number; h: number; pos: number } | null = null;
  const tryW = (deltaPx: number, gridDelta: number, pos: number) => {
    if (Math.abs(deltaPx) > SNAP_THRESHOLD) return;
    const w = Math.max(1, Math.min(cols - dragged.x, dragged.w + gridDelta));
    if (!bestW || Math.abs(deltaPx) < Math.abs(bestW.delta)) bestW = { delta: deltaPx, w, pos };
  };
  const tryH = (deltaPx: number, gridDelta: number, pos: number) => {
    if (Math.abs(deltaPx) > SNAP_THRESHOLD) return;
    const h = Math.max(1, dragged.h + gridDelta);
    if (!bestH || Math.abs(deltaPx) < Math.abs(bestH.delta)) bestH = { delta: deltaPx, h, pos };
  };

  const others = layout.filter((i) => i.i !== dragged.i);
  for (const o of others) {
    const oLeft = g.px(o.x);
    const oRight = oLeft + g.itemW(o.w);
    const oTop = g.py(o.y);
    const oBottom = oTop + g.itemH(o.h);
    tryW(oLeft - dRight, o.x - (dragged.x + dragged.w), oLeft);
    tryW(oRight - dRight, o.x + o.w - (dragged.x + dragged.w), oRight);
    tryH(oTop - dBottom, o.y - (dragged.y + dragged.h), oTop);
    tryH(oBottom - dBottom, o.y + o.h - (dragged.y + dragged.h), oBottom);
  }
  tryW(g.px(cols) - dRight, cols - (dragged.x + dragged.w), g.px(cols));
  tryW(containerWidth / 2 - dRight, Math.round(cols / 2 - (dragged.x + dragged.w)), containerWidth / 2);

  const bw = bestW as { delta: number; w: number; pos: number } | null;
  const bh = bestH as { delta: number; h: number; pos: number } | null;
  if (!bw && !bh) return null;
  const guides: Guide[] = [];
  if (bw) guides.push({ axis: "v", pos: bw.pos });
  if (bh) guides.push({ axis: "h", pos: bh.pos });
  return { w: bw ? bw.w : dragged.w, h: bh ? bh.h : dragged.h, guides };
}

function overlapRatio(a: LayoutItem, b: LayoutItem): number {
  const ix = Math.max(a.x, b.x);
  const iy = Math.max(a.y, b.y);
  const ax = Math.min(a.x + a.w, b.x + b.w);
  const ay = Math.min(a.y + a.h, b.y + b.h);
  if (ix >= ax || iy >= ay) return 0;
  const inter = (ax - ix) * (ay - iy);
  const minArea = Math.min(a.w * a.h, b.w * b.h);
  return minArea === 0 ? 0 : inter / minArea;
}

const TRANSLATE_RE = /translate\(([-\d.]+)px,\s*([-\d.]+)px\)/;

export function Canvas() {
  const project = useStore((s) => s.project);
  const selectedId = useStore((s) => s.selectedId);
  const select = useStore((s) => s.select);
  const moveResize = useStore((s) => s.moveResize);
  const commitBoxes = useStore((s) => s.commitBoxes);
  const addComponent = useStore((s) => s.addComponent);
  const removeComponent = useStore((s) => s.removeComponent);
  const duplicateComponent = useStore((s) => s.duplicateComponent);
  const swapComponents = useStore((s) => s.swapComponents);
  const alignSelected = useStore((s) => s.alignSelected);
  const distribute = useStore((s) => s.distribute);
  const autoArrange = useStore((s) => s.autoArrange);

  const [guides, setGuides] = useState<Guide[]>([]);
  const [guidesOn, setGuidesOn] = useState(true);
  const [swapOnDrop, setSwapOnDrop] = useState(true);
  const [hoverTarget, setHoverTarget] = useState<string | null>(null);
  const lastSnap = useRef<{ id: string; x?: number; y?: number; w?: number; h?: number } | null>(null);
  // RGL fires onLayoutChange (with its own unsnapped layout) right after
  // onDragStop/onResizeStop, which would revert our snap/swap commits —
  // these overrides win in that one pass.
  const pendingOverrides = useRef<{ id: string; box: GridBox }[] | null>(null);
  const overrideTimer = useRef<number | null>(null);

  const layout: LayoutItem[] = useMemo(
    () =>
      project.components.map((c) => ({
        i: c.id,
        x: c.box.x,
        y: c.box.y,
        w: c.box.w,
        h: c.box.h,
        minW: 1,
        minH: 1,
      })),
    [project.components]
  );

  const onLayoutChange = useCallback(
    (newLayout: Layout) => {
      const overrides = pendingOverrides.current;
      newLayout.forEach((item) => {
        const ov = overrides?.find((o) => o.id === item.i);
        const comp = project.components.find((c) => c.id === item.i);
        if (!comp) return;
        const target = ov ? ov.box : { x: item.x, y: item.y, w: item.w, h: item.h };
        if (comp.box.x !== target.x || comp.box.y !== target.y || comp.box.w !== target.w || comp.box.h !== target.h) {
          moveResize(comp.id, target);
        }
      });
      if (overrides) {
        pendingOverrides.current = null;
        if (overrideTimer.current) window.clearTimeout(overrideTimer.current);
      }
    },
    [project.components, moveResize]
  );

  const scheduleOverrideClear = useCallback(() => {
    if (overrideTimer.current) window.clearTimeout(overrideTimer.current);
    overrideTimer.current = window.setTimeout(() => {
      pendingOverrides.current = null;
    }, 400);
  }, []);

  const handleDrag = useCallback(
    (l: Layout, _old: LayoutItem | null, newItem: LayoutItem | null, _placeholder: LayoutItem | null, _e: Event, element: HTMLElement | null) => {
      if (!newItem || !element) return;
      const container = element.parentElement;
      if (!container) return;
      if (!guidesOn) {
        setGuides([]);
        return;
      }
      const snap = computeDragSnap(l, newItem, project.cols, project.rowHeight, container.offsetWidth);
      const g = geometry(project.cols, project.rowHeight, container.offsetWidth);
      if (snap) {
        lastSnap.current = { id: newItem.i, x: snap.x, y: snap.y };
        setGuides(snap.guides);
        const dxPx = (snap.x - newItem.x) * g.pitchX;
        const dyPx = (snap.y - newItem.y) * g.pitchY;
        if ((dxPx || dyPx) && element.style.transform) {
          const m = element.style.transform.match(TRANSLATE_RE);
          if (m) {
            element.style.transform = `translate(${parseFloat(m[1]) + dxPx}px, ${parseFloat(m[2]) + dyPx}px)`;
          }
        }
      } else {
        setGuides([]);
        lastSnap.current = null;
      }
      if (swapOnDrop) {
        const target = l.find((i) => i.i !== newItem.i && overlapRatio(i, newItem) >= 0.3);
        setHoverTarget(target ? target.i : null);
      }
    },
    [guidesOn, swapOnDrop, project.cols, project.rowHeight]
  );

  const handleResize = useCallback(
    (l: Layout, _old: LayoutItem | null, newItem: LayoutItem | null, _placeholder: LayoutItem | null, _e: Event, element: HTMLElement | null) => {
      if (!newItem || !element) return;
      const container = element.parentElement;
      if (!container) return;
      if (!guidesOn) {
        setGuides([]);
        return;
      }
      const snap = computeResizeSnap(l, newItem, project.cols, project.rowHeight, container.offsetWidth);
      const g = geometry(project.cols, project.rowHeight, container.offsetWidth);
      if (snap) {
        lastSnap.current = { id: newItem.i, w: snap.w, h: snap.h };
        setGuides(snap.guides);
        const dwPx = (snap.w - newItem.w) * g.pitchX;
        const dhPx = (snap.h - newItem.h) * g.pitchY;
        if ((dwPx || dhPx) && element.style.width) {
          element.style.width = `${parseFloat(element.style.width) + dwPx}px`;
          element.style.height = `${parseFloat(element.style.height) + dhPx}px`;
        }
      } else {
        setGuides([]);
        lastSnap.current = null;
      }
    },
    [guidesOn, project.cols, project.rowHeight]
  );

  const handleDragStop = useCallback(
    (l: Layout, oldItem: LayoutItem | null, newItem: LayoutItem | null) => {
      if (!newItem) return;
      setGuides([]);
      setHoverTarget(null);
      const snap = lastSnap.current && lastSnap.current.id === newItem.i ? lastSnap.current : null;
      lastSnap.current = null;
      const snappedBox = { x: snap?.x ?? newItem.x, y: snap?.y ?? newItem.y, w: newItem.w, h: newItem.h };
      if (swapOnDrop) {
        const target = l.find((i) => i.i !== newItem.i && overlapRatio(i, { ...newItem, ...snappedBox }) >= 0.3);
        if (target && oldItem) {
          swapComponents(newItem.i, target.i);
          pendingOverrides.current = [
            { id: newItem.i, box: { x: target.x, y: target.y, w: newItem.w, h: newItem.h } },
            { id: target.i, box: { x: oldItem.x, y: oldItem.y, w: target.w, h: target.h } },
          ];
          scheduleOverrideClear();
          return;
        }
      }
      if (!oldItem || oldItem.x !== snappedBox.x || oldItem.y !== snappedBox.y || oldItem.w !== snappedBox.w || oldItem.h !== snappedBox.h) {
        commitBoxes([{ id: newItem.i, box: snappedBox }], "Move / resize");
        pendingOverrides.current = [{ id: newItem.i, box: snappedBox }];
        scheduleOverrideClear();
      }
    },
    [swapOnDrop, swapComponents, commitBoxes, scheduleOverrideClear]
  );

  const handleResizeStop = useCallback(
    (_l: Layout, oldItem: LayoutItem | null, newItem: LayoutItem | null) => {
      if (!newItem) return;
      setGuides([]);
      const snap = lastSnap.current && lastSnap.current.id === newItem.i ? lastSnap.current : null;
      lastSnap.current = null;
      const snappedBox = { x: newItem.x, y: newItem.y, w: snap?.w ?? newItem.w, h: snap?.h ?? newItem.h };
      if (!oldItem || oldItem.w !== snappedBox.w || oldItem.h !== snappedBox.h) {
        commitBoxes([{ id: newItem.i, box: snappedBox }], "Resize");
        pendingOverrides.current = [{ id: newItem.i, box: snappedBox }];
        scheduleOverrideClear();
      }
    },
    [commitBoxes, scheduleOverrideClear]
  );

  const handleDrop = useCallback(
    (_layout: Layout, item: LayoutItem | undefined, e: Event) => {
      const dragEvent = e as unknown as DragEvent;
      const type = dragEvent.dataTransfer?.getData("text/component-type") as ComponentType | undefined;
      const assetUrl = dragEvent.dataTransfer?.getData("text/asset-url");
      if (!item) return;
      if (type && COMPONENT_LIBRARY[type]) {
        addComponent(type, { x: item.x, y: item.y });
      } else if (assetUrl) {
        addComponent("imageHover", { x: item.x, y: item.y }, { imageUrl: assetUrl });
      }
    },
    [addComponent]
  );

  const selected = project.components.find((c) => c.id === selectedId) ?? null;
  const canAlign = !!selected;
  const canDistribute = project.components.length >= 3;

  const alignBtn = (kind: AlignKind, Icon: typeof AlignStartVertical, title: string) => (
    <button
      key={kind}
      disabled={!canAlign}
      onClick={() => alignSelected(kind)}
      title={title}
      className="p-1.5 rounded-md hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent text-slate-600"
    >
      <Icon className="w-3.5 h-3.5" />
    </button>
  );

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-slate-100">
      {/* ── canvas toolbar ── */}
      <div className="flex-shrink-0 border-b border-slate-200 bg-white px-3 py-1.5 flex items-center gap-1 flex-wrap">
        <button
          onClick={() => autoArrange()}
          disabled={project.components.length < 2}
          title="Auto-arrange: tidy every widget into an aligned grid flow"
          className="flex items-center gap-1 text-[11px] px-2 py-1.5 rounded-md bg-indigo-50 text-indigo-700 hover:bg-indigo-100 disabled:opacity-40 font-medium"
        >
          <Wand2 className="w-3.5 h-3.5" /> Auto arrange
        </button>
        <div className="w-px h-5 bg-slate-200 mx-1" />
        {alignBtn("left", AlignStartVertical, "Align left edge to others (or canvas)")}
        {alignBtn("hcenter", AlignCenterHorizontal, "Center horizontally (or on canvas)")}
        {alignBtn("right", AlignEndVertical, "Align right edge to others (or canvas)")}
        {alignBtn("top", AlignStartHorizontal, "Align top edge to others (or canvas)")}
        {alignBtn("vcenter", AlignCenterVertical, "Center vertically")}
        {alignBtn("bottom", AlignEndHorizontal, "Align bottom edge to others")}
        <div className="w-px h-5 bg-slate-200 mx-1" />
        <button disabled={!canDistribute} onClick={() => distribute("horizontal")} title="Distribute all widgets evenly (horizontal)" className="p-1.5 rounded-md hover:bg-slate-100 disabled:opacity-30 text-slate-600">
          <StretchHorizontal className="w-3.5 h-3.5" />
        </button>
        <button disabled={!canDistribute} onClick={() => distribute("vertical")} title="Distribute all widgets evenly (vertical)" className="p-1.5 rounded-md hover:bg-slate-100 disabled:opacity-30 text-slate-600">
          <StretchVertical className="w-3.5 h-3.5" />
        </button>
        <div className="flex-1" />
        <button
          onClick={() => setGuidesOn((v) => !v)}
          title="Smart alignment guides (snap to edges & centers while dragging)"
          className={cn("flex items-center gap-1 text-[11px] px-2 py-1.5 rounded-md border font-medium", guidesOn ? "bg-indigo-50 border-indigo-200 text-indigo-700" : "border-slate-200 text-slate-400")}
        >
          <Ruler className="w-3.5 h-3.5" /> Guides
        </button>
        <button
          onClick={() => setSwapOnDrop((v) => !v)}
          title="When enabled, dropping a widget on another swaps their positions"
          className={cn("flex items-center gap-1 text-[11px] px-2 py-1.5 rounded-md border font-medium", swapOnDrop ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "border-slate-200 text-slate-400")}
        >
          <ArrowLeftRight className="w-3.5 h-3.5" /> Swap on drop
        </button>
        <span className="hidden lg:flex items-center gap-1 text-[10px] text-slate-400 ml-2">
          <MousePointer2 className="w-3 h-3" /> drag to move · ⌘Z undo · ⌘D duplicate · arrows nudge
        </span>
      </div>

      {/* ── artboard ── */}
      <div
        className="flex-1 overflow-auto p-6 ui-dotted-bg"
        onDragOver={(e) => e.preventDefault()}
        onClick={(e) => {
          if (e.target === e.currentTarget) select(null);
        }}
      >
        <div className="mx-auto max-w-[1200px] bg-white rounded-xl shadow-sm border border-slate-200 p-4 min-h-[600px] relative">
          <div className="relative">
            <ReactGridLayout
              className="layout"
              cols={project.cols}
              rowHeight={project.rowHeight}
              layout={layout}
              margin={[MARGIN, MARGIN]}
              containerPadding={[PAD, PAD]}
              onLayoutChange={onLayoutChange}
              onDrag={handleDrag}
              onDragStop={handleDragStop}
              onResize={handleResize}
              onResizeStop={handleResizeStop}
              isDroppable
              onDrop={handleDrop}
              compactType={null}
              preventCollision={false}
              draggableCancel=".no-drag"
            >
              {project.components.map((c) => (
                <div
                  key={c.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    select(c.id);
                  }}
                  className={cn(
                    "group relative rounded-lg ring-1 ring-transparent hover:ring-indigo-200 transition-shadow",
                    selectedId === c.id && "ring-2 ring-indigo-500",
                    hoverTarget === c.id && "ring-2 ring-emerald-400 ring-offset-1"
                  )}
                >
                  <div className="absolute -top-2.5 left-2 z-10 hidden group-hover:flex items-center gap-1 no-drag">
                    <span className="text-[10px] bg-slate-800 text-white px-1.5 py-0.5 rounded">{c.name}</span>
                    <button
                      className="bg-white border border-slate-200 rounded p-0.5 hover:bg-slate-50"
                      title="Duplicate (⌘D)"
                      onClick={(e) => {
                        e.stopPropagation();
                        duplicateComponent(c.id);
                      }}
                    >
                      <Copy className="w-3 h-3 text-slate-500" />
                    </button>
                    <button
                      className="bg-white border border-slate-200 rounded p-0.5 hover:bg-red-50"
                      title="Delete (⌫)"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeComponent(c.id);
                      }}
                    >
                      <Trash2 className="w-3 h-3 text-red-500" />
                    </button>
                  </div>
                  <div className="w-full h-full overflow-hidden rounded-lg">
                    <ComponentRenderer spec={c} />
                  </div>
                </div>
              ))}
            </ReactGridLayout>

            {/* smart alignment guides */}
            {guides.map((g, i) =>
              g.axis === "v" ? (
                <div key={`v${i}`} className="absolute top-0 bottom-0 w-px bg-fuchsia-500 z-30 pointer-events-none" style={{ left: g.pos }}>
                  <div className="absolute -top-1 -translate-x-1/2 w-2 h-2 rounded-full bg-fuchsia-500" />
                </div>
              ) : (
                <div key={`h${i}`} className="absolute left-0 right-0 h-px bg-fuchsia-500 z-30 pointer-events-none" style={{ top: g.pos }}>
                  <div className="absolute -left-1 -translate-y-1/2 w-2 h-2 rounded-full bg-fuchsia-500" />
                </div>
              )
            )}
          </div>

          {project.components.length === 0 && (
            <div className="text-center py-24">
              <div className="text-3xl mb-2">🪄</div>
              <div className="text-sm font-medium text-slate-500">Your canvas is empty</div>
              <div className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                Drag components or assets from the left panel — or load a template to get started instantly.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

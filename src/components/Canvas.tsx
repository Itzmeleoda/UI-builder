import { useMemo, useCallback } from "react";
import { ReactGridLayout as GridLayout, WidthProvider, type Layout, type LayoutItem } from "react-grid-layout/legacy";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { useStore } from "../state/store";
import { ComponentRenderer } from "../render/ComponentRenderer";
import { COMPONENT_LIBRARY } from "../data/componentLibrary";
import { cn } from "../utils/cn";
import { Copy, Trash2 } from "lucide-react";
import type { ComponentType } from "../types";

const ReactGridLayout = WidthProvider(GridLayout);

export function Canvas() {
  const project = useStore((s) => s.project);
  const selectedId = useStore((s) => s.selectedId);
  const select = useStore((s) => s.select);
  const moveResize = useStore((s) => s.moveResize);
  const addComponent = useStore((s) => s.addComponent);
  const removeComponent = useStore((s) => s.removeComponent);
  const duplicateComponent = useStore((s) => s.duplicateComponent);

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
      newLayout.forEach((item) => {
        const comp = project.components.find((c) => c.id === item.i);
        if (comp && (comp.box.x !== item.x || comp.box.y !== item.y || comp.box.w !== item.w || comp.box.h !== item.h)) {
          moveResize(comp.id, { x: item.x, y: item.y, w: item.w, h: item.h });
        }
      });
    },
    [project.components, moveResize]
  );

  const handleDrop = useCallback(
    (_layout: Layout, item: LayoutItem | undefined, e: Event) => {
      const dragEvent = e as unknown as DragEvent;
      const type = dragEvent.dataTransfer?.getData("text/component-type") as ComponentType | undefined;
      if (!type || !COMPONENT_LIBRARY[type] || !item) return;
      addComponent(type, { x: item.x, y: item.y });
    },
    [addComponent]
  );

  return (
    <div
      className="flex-1 overflow-auto bg-slate-100 p-6"
      onDragOver={(e) => e.preventDefault()}
      onClick={(e) => {
        if (e.target === e.currentTarget) select(null);
      }}
    >
      <div className="mx-auto max-w-[1200px] bg-white rounded-xl shadow-sm border border-slate-200 p-4 min-h-[600px]">
        <ReactGridLayout
          className="layout"
          cols={project.cols}
          rowHeight={project.rowHeight}
          layout={layout}
          onLayoutChange={onLayoutChange}
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
                "group relative rounded-lg ring-1 ring-transparent hover:ring-indigo-200",
                selectedId === c.id && "ring-2 ring-indigo-500"
              )}
            >
              <div className="absolute -top-2.5 left-2 z-10 hidden group-hover:flex items-center gap-1 no-drag">
                <span className="text-[10px] bg-slate-800 text-white px-1.5 py-0.5 rounded">{c.name}</span>
                <button
                  className="bg-white border border-slate-200 rounded p-0.5 hover:bg-slate-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    duplicateComponent(c.id);
                  }}
                >
                  <Copy className="w-3 h-3 text-slate-500" />
                </button>
                <button
                  className="bg-white border border-slate-200 rounded p-0.5 hover:bg-red-50"
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
        {project.components.length === 0 && (
          <div className="text-center text-slate-400 text-sm py-24">Drag a component from the left panel to get started.</div>
        )}
      </div>
    </div>
  );
}

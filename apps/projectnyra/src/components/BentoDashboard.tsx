"use client";

import { useEffect, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const STORAGE_KEY = "nyra-bento-layout";

type TileSize = "1x1" | "1x2" | "2x1" | "2x2";

interface Tile {
  id: string;
  label: string;
  size: TileSize;
  content: string;
}

const DEFAULT_TILES: Tile[] = [
  {
    id: "pipeline-value",
    label: "Pipeline Value",
    size: "2x2",
    content: "$4.2M",
  },
  {
    id: "leads-this-week",
    label: "Leads This Week",
    size: "1x1",
    content: "12",
  },
  { id: "avg-rate", label: "Avg Rate", size: "1x1", content: "6.74%" },
  { id: "closes-mtd", label: "Closes MTD", size: "1x2", content: "3" },
  { id: "applications", label: "Applications", size: "1x1", content: "8" },
  { id: "conversion", label: "Conversion", size: "1x1", content: "41%" },
];

const SIZE_CLASSES: Record<TileSize, string> = {
  "1x1": "col-span-1 row-span-1",
  "1x2": "col-span-1 row-span-2",
  "2x1": "col-span-2 row-span-1",
  "2x2": "col-span-2 row-span-2",
};

function BentoTile({ tile }: { tile: Tile }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tile.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${SIZE_CLASSES[tile.size]} rounded-2xl border border-white/10 bg-white/5 p-4 cursor-grab active:cursor-grabbing flex flex-col justify-between min-h-[100px]`}
      {...attributes}
      {...listeners}
    >
      <span className="text-xs font-semibold uppercase tracking-wider text-white/40">
        {tile.label}
      </span>
      <span className="text-3xl font-bold text-white">{tile.content}</span>
    </div>
  );
}

export function BentoDashboard() {
  const [tiles, setTiles] = useState<Tile[]>(DEFAULT_TILES);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const ids: string[] = JSON.parse(saved);
        const reordered = ids
          .map((id) => DEFAULT_TILES.find((t) => t.id === id))
          .filter((t): t is Tile => Boolean(t));
        if (reordered.length === DEFAULT_TILES.length) setTiles(reordered);
      }
    } catch {
      // ignore corrupt storage
    }
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setTiles((prev) => {
      const oldIdx = prev.findIndex((t) => t.id === active.id);
      const newIdx = prev.findIndex((t) => t.id === over.id);
      const next = arrayMove(prev, oldIdx, newIdx);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next.map((t) => t.id)));
      return next;
    });
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={tiles.map((t) => t.id)}
        strategy={rectSortingStrategy}
      >
        <div className="grid grid-cols-4 gap-4 auto-rows-[100px]">
          {tiles.map((tile) => (
            <BentoTile key={tile.id} tile={tile} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

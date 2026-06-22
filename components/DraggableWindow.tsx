"use client";

import { motion, useMotionValue } from "framer-motion";
import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type PositionValue = number | string;

type DraggableWindowProps = {
  id: string;
  title: string;
  defaultPosition: { x: PositionValue; y: PositionValue };
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  drawMode?: boolean;
  onClick?: () => void;
};

function resolvePosition(value: PositionValue, viewport: number): number {
  if (typeof value === "number") {
    return value;
  }

  const trimmed = value.trim();
  if (trimmed.endsWith("%")) {
    return (parseFloat(trimmed) / 100) * viewport;
  }

  if (trimmed.startsWith("calc(")) {
    const match = trimmed.match(/100v[wh]\s*-\s*(\d+(?:\.\d+)?)px/);
    if (match) {
      return viewport - Number(match[1]);
    }
  }

  return Number.parseFloat(trimmed) || 0;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export default function DraggableWindow({
  id,
  title,
  defaultPosition,
  children,
  className = "",
  bodyClassName = "",
  drawMode = false,
  onClick,
}: DraggableWindowProps) {
  const ref = useRef<HTMLDivElement>(null);
  const draggedRef = useRef(false);
  const [viewport, setViewport] = useState({ width: 0, height: 0 });
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [ready, setReady] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const syncPosition = useCallback(
    (
      nextViewport: { width: number; height: number },
      nextSize: { width: number; height: number },
    ) => {
      if (
        !nextViewport.width ||
        !nextViewport.height ||
        !nextSize.width ||
        !nextSize.height
      ) {
        return;
      }

      if (draggedRef.current) {
        x.set(clamp(x.get(), 0, Math.max(0, nextViewport.width - nextSize.width)));
        y.set(clamp(y.get(), 0, Math.max(0, nextViewport.height - nextSize.height)));
      } else {
        x.set(
          clamp(
            resolvePosition(defaultPosition.x, nextViewport.width),
            0,
            Math.max(0, nextViewport.width - nextSize.width),
          ),
        );
        y.set(
          clamp(
            resolvePosition(defaultPosition.y, nextViewport.height),
            0,
            Math.max(0, nextViewport.height - nextSize.height),
          ),
        );
      }
      setReady(true);
    },
    [defaultPosition.x, defaultPosition.y, x, y],
  );

  useEffect(() => {
    const measure = () => {
      const nextViewport = {
        width: window.innerWidth,
        height: window.innerHeight,
      };
      const rect = ref.current?.getBoundingClientRect();
      const nextSize = {
        width: rect?.width ?? 0,
        height: rect?.height ?? 0,
      };

      setViewport(nextViewport);
      setSize(nextSize);
      syncPosition(nextViewport, nextSize);
    };

    const node = ref.current;
    if (!node) {
      return;
    }

    const observer = new ResizeObserver(([entry]) => {
      const nextViewport = {
        width: window.innerWidth,
        height: window.innerHeight,
      };
      const nextSize = {
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      };

      setViewport(nextViewport);
      setSize(nextSize);
      syncPosition(nextViewport, nextSize);
    });

    observer.observe(node);
    const frame = window.requestAnimationFrame(measure);
    window.addEventListener("resize", measure);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", measure);
      observer.disconnect();
    };
  }, [syncPosition]);

  const dragConstraints = useMemo(
    () => ({
      left: 0,
      right: Math.max(0, viewport.width - size.width),
      top: 0,
      bottom: Math.max(0, viewport.height - size.height),
    }),
    [size.height, size.width, viewport.height, viewport.width],
  );

  return (
    <motion.div
      ref={ref}
      id={id}
      drag={!drawMode}
      dragConstraints={dragConstraints}
      dragMomentum={false}
      onDragEnd={() => {
        draggedRef.current = true;
        x.set(clamp(x.get(), 0, Math.max(0, viewport.width - size.width)));
        y.set(clamp(y.get(), 0, Math.max(0, viewport.height - size.height)));
      }}
      onClick={onClick}
      className={`absolute z-20 overflow-hidden rounded-[6px] border border-white/[0.18] bg-[#0a0a0a]/[0.92] shadow-[0_18px_60px_rgba(0,0,0,0.35)] ${drawMode ? "pointer-events-none" : ""} ${onClick ? "cursor-pointer" : "cursor-grab active:cursor-grabbing"} ${className}`}
      style={{
        x,
        y,
        opacity: ready ? 1 : 0,
      }}
    >
      <div className="flex items-center gap-2 border-b border-white/[0.1] px-[10px] py-[6px]">
        <div className="flex gap-[5px]">
          <span className="h-2 w-2 rounded-full bg-[#ff5f57]" />
          <span className="h-2 w-2 rounded-full bg-[#febc2e]" />
          <span className="h-2 w-2 rounded-full bg-[#28c840]" />
        </div>
        <span className="text-[10px] tracking-[0.08em] text-white/40">
          {title}
        </span>
      </div>
      <div className={`p-3 ${bodyClassName}`}>{children}</div>
    </motion.div>
  );
}

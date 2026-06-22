"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Point = {
  x: number;
  y: number;
};

type Stroke = Point[];

type DrawCanvasProps = {
  active: boolean;
};

const STORAGE_KEY = "weiying-draw-strokes";

export default function DrawCanvas({ active }: DrawCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const strokesRef = useRef<Stroke[]>([]);
  const currentStroke = useRef<Stroke | null>(null);
  const [sizeToken, setSizeToken] = useState(0);

  const drawStroke = useCallback((ctx: CanvasRenderingContext2D, stroke: Stroke) => {
    if (stroke.length < 2) {
      return;
    }

    ctx.beginPath();
    ctx.moveTo(stroke[0].x, stroke[0].y);
    stroke.slice(1).forEach((point) => ctx.lineTo(point.x, point.y));
    ctx.stroke();
  }, []);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) {
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "rgba(255,255,255,0.75)";
    ctx.lineWidth = 1.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    strokesRef.current.forEach((stroke) => drawStroke(ctx, stroke));
  }, [drawStroke]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const resize = () => {
      const ratio = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * ratio;
      canvas.height = window.innerHeight * ratio;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      }
      setSizeToken((token) => token + 1);
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        strokesRef.current = JSON.parse(saved) as Stroke[];
      } catch {
        strokesRef.current = [];
      }
    }

    redraw();
  }, [redraw, sizeToken]);

  useEffect(() => {
    const clear = () => {
      strokesRef.current = [];
      window.localStorage.removeItem(STORAGE_KEY);
      redraw();
    };

    window.addEventListener("weiying-clear-drawing", clear);
    return () => window.removeEventListener("weiying-clear-drawing", clear);
  }, [redraw]);

  const pointFromEvent = (event: React.PointerEvent<HTMLCanvasElement>): Point => ({
    x: event.clientX,
    y: event.clientY,
  });

  return (
    <canvas
      ref={canvasRef}
      className={`absolute left-0 top-0 z-10 h-full w-full touch-none ${
        active ? "pointer-events-auto" : "pointer-events-none"
      }`}
      onPointerDown={(event) => {
        if (!active) {
          return;
        }

        event.currentTarget.setPointerCapture(event.pointerId);
        currentStroke.current = [pointFromEvent(event)];
      }}
      onPointerMove={(event) => {
        if (!active || !currentStroke.current) {
          return;
        }

        const point = pointFromEvent(event);
        const stroke = currentStroke.current;
        stroke.push(point);

        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (ctx && stroke.length > 1) {
          ctx.strokeStyle = "rgba(255,255,255,0.75)";
          ctx.lineWidth = 1.5;
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          drawStroke(ctx, stroke.slice(-2));
        }
      }}
      onPointerUp={() => {
        if (!currentStroke.current) {
          return;
        }

        strokesRef.current.push(currentStroke.current);
        currentStroke.current = null;
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(strokesRef.current));
      }}
      onPointerCancel={() => {
        currentStroke.current = null;
      }}
    />
  );
}

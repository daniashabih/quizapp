"use client";

import { useEffect, useRef, useCallback, ReactNode } from "react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Point {
  x: number;
  y: number;
}

interface Ripple {
  x: number;
  y: number;
  radius: number;
  opacity: number;
  born: number;
}

export interface KineticGridProps {
  children?: ReactNode;
  className?: string;
  globalColor?: "default" | "monochrome";
  /** Enable subtle ambient movement when idle (especially beneficial for touch screens) */
  ambientMovement?: boolean;
}

// ─── Constants & Configurations ───────────────────────────────────────────────

const LERP_SPEED = 0.08;
const LINE_BASE = { r: 255, g: 255, b: 255, a: 0.13 };
const NODE_BASE_RADIUS = 1.8;
const NODE_ACTIVE_RADIUS = 3.2;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function lerpN(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function lerpColor(
  base: { r: number; g: number; b: number; a: number },
  active: { r: number; g: number; b: number; a: number },
  t: number,
): string {
  const r = Math.round(lerpN(base.r, active.r, t));
  const g = Math.round(lerpN(base.g, active.g, t));
  const b = Math.round(lerpN(base.b, active.b, t));
  const a = lerpN(base.a, active.a, t);
  return `rgba(${r},${g},${b},${a.toFixed(3)})`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function KineticGrid({
  children,
  className,
  globalColor = "default",
  ambientMovement = true,
}: KineticGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const mouseRef = useRef<Point>({ x: -9999, y: -9999 });
  const targetMouseRef = useRef<Point>({ x: -9999, y: -9999 });
  const isInteractingRef = useRef<boolean>(false);
  const ripplesRef = useRef<Ripple[]>([]);
  const rafRef = useRef<number>(0);
  const sizeRef = useRef<{ w: number; h: number; dpr: number; isMobile: boolean }>({
    w: 0,
    h: 0,
    dpr: 1,
    isMobile: false,
  });

  // ── Dynamic Responsive Metrics ───────────────────────────────────────────────

  const getMetrics = useCallback((w: number) => {
    const isMobile = w < 640;
    const isTablet = w >= 640 && w < 1024;

    return {
      cellSize: isMobile ? 42 : isTablet ? 48 : 55,
      influenceRadius: isMobile ? 160 : isTablet ? 210 : 260,
      maxWarp: isMobile ? 15 : isTablet ? 20 : 24,
      dotSpacing: isMobile ? 22 : 28,
      isMobile,
    };
  }, []);

  // ── Warp ────────────────────────────────────────────────────────────────────

  const getWarpedPoint = useCallback(
    (
      gx: number,
      gy: number,
      col: number,
      row: number,
      mouse: Point,
      ripples: Ripple[],
      cols: number,
      rows: number,
      influenceRadius: number,
      maxWarp: number,
    ): { pt: Point; proximity: number } => {
      // Edge pin — smoothly locks boundary rows/cols in place
      const edgeMargin = 1.5;
      const colPin = Math.min(
        col / edgeMargin,
        (cols - 1 - col) / edgeMargin,
        1,
      );
      const rowPin = Math.min(
        row / edgeMargin,
        (rows - 1 - row) / edgeMargin,
        1,
      );
      const pinFactor = colPin * colPin * rowPin * rowPin;

      const dx = gx - mouse.x;
      const dy = gy - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      const proximity = Math.max(0, 1 - dist / influenceRadius) * pinFactor;

      // Ripple displacement
      let rx = 0;
      let ry = 0;
      for (const r of ripples) {
        const rdx = gx - r.x;
        const rdy = gy - r.y;
        const rdist = Math.sqrt(rdx * rdx + rdy * rdy);
        const waveWidth = sizeRef.current.isMobile ? 40 : 55;
        const diff = rdist - r.radius;
        if (Math.abs(diff) < waveWidth) {
          const force = sizeRef.current.isMobile ? 12 : 18;
          const strength =
            (1 - Math.abs(diff) / waveWidth) * r.opacity * force * pinFactor;
          const angle = Math.atan2(rdy, rdx);
          const sign = diff < 0 ? -1 : 1;
          rx += Math.cos(angle) * strength * sign * -1;
          ry += Math.sin(angle) * strength * sign * -1;
        }
      }

      // Pointer warp with bell falloff
      if (dist < influenceRadius && dist > 0 && pinFactor > 0) {
        const t = dist / influenceRadius;
        const eased =
          t < 0.01
            ? 0
            : (1 - t) * (1 - t) * Math.min(1, dist / (sizeRef.current.isMobile ? 45 : 60));
        const warpAmt = eased * maxWarp * pinFactor;
        const angle = Math.atan2(dy, dx);
        return {
          pt: {
            x: gx - Math.cos(angle) * warpAmt + rx,
            y: gy - Math.sin(angle) * warpAmt + ry,
          },
          proximity,
        };
      }

      return { pt: { x: gx + rx, y: gy + ry }, proximity };
    },
    [],
  );

  // ── Draw ────────────────────────────────────────────────────────────────────

  const draw = useCallback(
    (now: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const { w: W, h: H, dpr } = sizeRef.current;
      if (W === 0 || H === 0) return;

      const metrics = getMetrics(W);
      const mouse = mouseRef.current;
      const ripples = ripplesRef.current;

      const theme = {
        default: {
          bg: "#161618",
          lineActive: { r: 74, g: 158, b: 255, a: 0.9 },
          nodeActive: { r: 74, g: 158, b: 255, a: 1.0 },
          glow: "74,158,255",
          ripple: "100,180,255",
        },
        monochrome: {
          bg: "#000000",
          lineActive: { r: 255, g: 255, b: 255, a: 0.9 },
          nodeActive: { r: 255, g: 255, b: 255, a: 1.0 },
          glow: "255,255,255",
          ripple: "255,255,255",
        },
      }[globalColor ?? "default"];

      ctx.save();
      ctx.scale(dpr, dpr);

      ctx.clearRect(0, 0, W, H);

      // Background
      ctx.fillStyle = theme.bg;
      ctx.fillRect(0, 0, W, H);

      // Static background dot texture
      ctx.fillStyle = "rgba(255,255,255,0.05)";
      const dotSpacing = metrics.dotSpacing;
      for (let x = dotSpacing / 2; x < W; x += dotSpacing) {
        for (let y = dotSpacing / 2; y < H; y += dotSpacing) {
          ctx.beginPath();
          ctx.arc(x, y, 0.7, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Update ripples
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        const age = (now - r.born) / 1000;
        const rippleSpeed = metrics.isMobile ? 320 : 400;
        r.radius = Math.max(0, age * rippleSpeed);
        r.opacity = Math.max(0, 1 - age * 1.25);
        if (r.opacity <= 0) ripples.splice(i, 1);
      }

      // ── Build warped grid ─────────────────────────────────────────────────
      const cols = Math.max(2, Math.ceil(W / metrics.cellSize)) + 1;
      const rows = Math.max(2, Math.ceil(H / metrics.cellSize)) + 1;
      const cellW = W / (cols - 1);
      const cellH = H / (rows - 1);

      const pts: Point[][] = [];
      const prox: number[][] = [];

      for (let row = 0; row < rows; row++) {
        pts[row] = [];
        prox[row] = [];
        for (let col = 0; col < cols; col++) {
          const { pt, proximity } = getWarpedPoint(
            col * cellW,
            row * cellH,
            col,
            row,
            mouse,
            ripples,
            cols,
            rows,
            metrics.influenceRadius,
            metrics.maxWarp,
          );
          pts[row][col] = pt;
          prox[row][col] = proximity;
        }
      }

      // ── Grid lines ────────────────────────────────────────────────────────
      const drawSeg = (p1: Point, p2: Point, pr1: number, pr2: number) => {
        const avg = (pr1 + pr2) / 2;
        const t = avg * avg * (3 - 2 * avg); // smoothstep
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = lerpColor(LINE_BASE, theme.lineActive, t);
        ctx.lineWidth = lerpN(0.8, 1.5, t);
        ctx.stroke();
      };

      ctx.lineCap = "butt";

      for (let row = 0; row < rows; row++)
        for (let col = 0; col < cols - 1; col++)
          drawSeg(
            pts[row][col],
            pts[row][col + 1],
            prox[row][col],
            prox[row][col + 1],
          );

      for (let col = 0; col < cols; col++)
        for (let row = 0; row < rows - 1; row++)
          drawSeg(
            pts[row][col],
            pts[row + 1][col],
            prox[row][col],
            prox[row + 1][col],
          );

      // ── Intersection nodes ────────────────────────────────────────────────
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const p = pts[row][col];
          const pr = prox[row][col];
          const t = pr * pr * (3 - 2 * pr); // smoothstep
          const r = lerpN(NODE_BASE_RADIUS, NODE_ACTIVE_RADIUS, t);

          // Outer glow ring for active nodes
          if (t > 0.3) {
            const glowR = r + lerpN(0, 6, (t - 0.3) / 0.7);
            const grd = ctx.createRadialGradient(
              p.x,
              p.y,
              r * 0.5,
              p.x,
              p.y,
              glowR,
            );
            grd.addColorStop(0, `rgba(${theme.glow},${(t * 0.3).toFixed(3)})`);
            grd.addColorStop(1, `rgba(${theme.glow},0)`);
            ctx.beginPath();
            ctx.arc(p.x, p.y, glowR, 0, Math.PI * 2);
            ctx.fillStyle = grd;
            ctx.fill();
          }

          // Node fill
          ctx.beginPath();
          ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
          ctx.fillStyle = lerpColor(
            { r: 255, g: 255, b: 255, a: 0.2 },
            theme.nodeActive,
            t,
          );
          ctx.fill();
        }
      }

      // ── Ripple rings ──────────────────────────────────────────────────────
      for (const r of ripples) {
        const safeRadius = Math.max(0, r.radius);
        ctx.beginPath();
        ctx.arc(r.x, r.y, safeRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${theme.ripple},${(r.opacity * 0.28).toFixed(3)})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      ctx.restore();
    },
    [getMetrics, getWarpedPoint, globalColor],
  );

  // ── Animation loop ──────────────────────────────────────────────────────────

  const animate = useCallback(
    (now: number) => {
      const m = mouseRef.current;
      const t = targetMouseRef.current;
      const { w, h, isMobile } = sizeRef.current;

      // When idle on mobile / touchscreen, apply gentle ambient floating motion
      if (ambientMovement && !isInteractingRef.current && w > 0 && h > 0) {
        const time = now * 0.001;
        const radiusX = Math.min(w * 0.3, 140);
        const radiusY = Math.min(h * 0.2, 90);
        const ambientX = w * 0.5 + Math.sin(time * 0.8) * radiusX;
        const ambientY = h * 0.45 + Math.cos(time * 0.6) * radiusY;

        // If target mouse has never been placed or is offscreen, guide it with ambient motion
        if (t.x === -9999 || isMobile) {
          t.x = ambientX;
          t.y = ambientY;
        }
      }

      m.x = lerpN(m.x, t.x, LERP_SPEED);
      m.y = lerpN(m.y, t.y, LERP_SPEED);

      draw(now);
      rafRef.current = requestAnimationFrame(animate);
    },
    [ambientMovement, draw],
  );

  // ── Setup & Listeners ───────────────────────────────────────────────────────

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const setSize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2); // Cap at 2 for mobile GPU efficiency
      const isMobile = w < 640;

      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;

      sizeRef.current = { w, h, dpr, isMobile };

      if (mouseRef.current.x === -9999) {
        mouseRef.current = { x: w / 2, y: h / 2 };
        targetMouseRef.current = { x: w / 2, y: h / 2 };
      }
    };

    setSize();
    window.addEventListener("resize", setSize, { passive: true });
    window.addEventListener("orientationchange", setSize, { passive: true });

    // ── Mouse Listeners (Desktop) ──
    const onMouseMove = (e: MouseEvent) => {
      isInteractingRef.current = true;
      targetMouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseLeave = () => {
      isInteractingRef.current = false;
    };

    const onClick = (e: MouseEvent) => {
      ripplesRef.current.push({
        x: e.clientX,
        y: e.clientY,
        radius: 0,
        opacity: 1,
        born: performance.now(),
      });
    };

    // ── Touch Listeners (Mobile & Tablets) ──
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        isInteractingRef.current = true;
        const touch = e.touches[0];
        targetMouseRef.current = { x: touch.clientX, y: touch.clientY };
        ripplesRef.current.push({
          x: touch.clientX,
          y: touch.clientY,
          radius: 0,
          opacity: 1,
          born: performance.now(),
        });
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        isInteractingRef.current = true;
        const touch = e.touches[0];
        targetMouseRef.current = { x: touch.clientX, y: touch.clientY };
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (e.touches.length === 0) {
        // Smoothly release interactive state after a small delay
        setTimeout(() => {
          isInteractingRef.current = false;
        }, 1200);
      }
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("mouseleave", onMouseLeave, { passive: true });
    window.addEventListener("click", onClick, { passive: true });

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("touchcancel", onTouchEnd, { passive: true });

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", setSize);
      window.removeEventListener("orientationchange", setSize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("click", onClick);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", onTouchEnd);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [animate]);

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div
      className={cn(
        "relative w-full min-h-[100dvh] overflow-hidden select-none touch-manipulation",
        globalColor === "monochrome" ? "bg-[#000000]" : "bg-[#161618]",
        className,
      )}
    >
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full z-0 pointer-events-none"
      />

      <div className="relative z-10 w-full min-h-[100dvh] flex flex-col">{children}</div>
    </div>
  );
}

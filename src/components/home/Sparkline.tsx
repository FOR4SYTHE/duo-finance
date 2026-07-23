"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

export function Sparkline({
  data,
  color,
  width = 64,
  height = 24,
}: {
  data: number[];
  color: string;
  width?: number;
  height?: number;
}) {
  const { path, area } = useMemo(() => {
    if (data.length < 2) return { path: "", area: "" };

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const paddingY = 2; // Prevent clipping at top/bottom
    const usableHeight = height - paddingY * 2;
    const step = width / (data.length - 1);

    // To make it look incredibly smooth and premium, we use a Bezier curve approximation
    const points = data.map((val, i) => {
      const x = i * step;
      // Invert Y because SVG 0,0 is top-left
      const y = paddingY + usableHeight - ((val - min) / range) * usableHeight;
      return { x, y };
    });

    // Create a smooth cubic bezier curve path
    const bezierCommand = (point: {x: number, y: number}, i: number, a: {x: number, y: number}[]) => {
      // Setup control points
      const p0 = a[i === 0 ? 0 : i - 1];
      const p1 = point;
      
      // Simple horizontal smoothing
      const controlPointX1 = p0.x + (p1.x - p0.x) / 2;
      const controlPointY1 = p0.y;
      const controlPointX2 = p0.x + (p1.x - p0.x) / 2;
      const controlPointY2 = p1.y;

      return `C ${controlPointX1},${controlPointY1} ${controlPointX2},${controlPointY2} ${p1.x},${p1.y}`;
    };

    const d = points.reduce((acc, point, i, a) => {
      if (i === 0) return `M ${point.x},${point.y}`;
      return `${acc} ${bezierCommand(point, i, a)}`;
    }, "");

    const areaD = `${d} L ${width},${height} L 0,${height} Z`;

    return { path: d, area: areaD };
  }, [data, width, height]);

  if (!path) return null;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="overflow-visible"
    >
      <defs>
        <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.4} />
          <stop offset="100%" stopColor={color} stopOpacity={0.0} />
        </linearGradient>
      </defs>
      
      {/* Area under the line */}
      <motion.path
        d={area}
        fill={`url(#gradient-${color})`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.2 }}
      />
      
      {/* The main sparkline stroke */}
      <motion.path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        style={{ filter: `drop-shadow(0 2px 4px ${color}60)` }}
      />
    </svg>
  );
}

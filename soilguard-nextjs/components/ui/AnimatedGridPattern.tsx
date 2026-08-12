'use client';

import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface AnimatedGridPatternProps {
  numSquares?: number;
  maxOpacity?: number;
  duration?: number;
  repeatDelay?: number;
  className?: string;
}

export function AnimatedGridPattern({
  numSquares = 30,
  maxOpacity = 0.1,
  duration = 3,
  repeatDelay = 1,
  className,
}: AnimatedGridPatternProps) {
  const id = useId();
  const containerRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [squares, setSquares] = useState<Array<{ id: number; pos: [number, number] }>>([]);

  const width = 40;
  const height = 40;

  const getPos = (): [number, number] => {
    return [
      Math.floor((Math.random() * (dimensions.width || 1200)) / width),
      Math.floor((Math.random() * (dimensions.height || 800)) / height),
    ];
  };

  const generateSquares = (count: number) => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      pos: getPos(),
    }));
  };

  useEffect(() => {
    if (containerRef.current) {
      const { width: w, height: h } = containerRef.current.getBoundingClientRect();
      setDimensions({ width: w, height: h });
      setSquares(generateSquares(numSquares));
    }
  }, [numSquares]);

  return (
    <svg
      ref={containerRef}
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 h-full w-full fill-white/5 stroke-white/10 opacity-60",
        className
      )}
    >
      <defs>
        <pattern
          id={id}
          width={width}
          height={height}
          patternUnits="userSpaceOnUse"
          x={-1}
          y={-1}
        >
          <path
            d={`M.5 ${height}V.5H${width}`}
            fill="none"
            strokeDasharray="0"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
      <svg x={-1} y={-1} className="overflow-visible">
        {squares.map(({ id: sqId, pos: [x, y] }) => (
          <rect
            key={sqId}
            width={width - 1}
            height={height - 1}
            x={x * width + 1}
            y={y * height + 1}
            className="fill-cyan-400/10 stroke-cyan-400/20 transition-all duration-1000"
            style={{
              animation: `pulseSquare ${duration}s ease-in-out infinite alternate`,
              animationDelay: `${(sqId % 5) * repeatDelay}s`,
            }}
          />
        ))}
      </svg>
    </svg>
  );
}

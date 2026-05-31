"use client";

/**
 * SACRED GEOMETRY BACKGROUND
 * Renders Metatron's Cube / Flower of Life SVG at low opacity,
 * slowly rotating. Used across all ProjectNyra sections.
 */

interface SacredGeometryBgProps {
  opacity?: number;
  color?: string;
  size?: number;
  /** Animation duration in seconds */
  duration?: number;
  className?: string;
}

export function SacredGeometryBg({
  opacity = 0.05,
  color = "oklch(0.68 0.28 270)",
  size = 900,
  duration = 120,
  className = "",
}: SacredGeometryBgProps) {
  // Flower of Life + Metatron's Cube as inline SVG
  const r = size / 2;
  const unit = size / 10; // circle radius unit

  // Generate Flower of Life circles (center + 6 petals + outer ring)
  const petalAngles = Array.from({ length: 6 }, (_, i) => (i * Math.PI) / 3);
  const outerAngles = Array.from({ length: 12 }, (_, i) => (i * Math.PI) / 6);

  const circles = [
    { cx: r, cy: r }, // Center
    ...petalAngles.map((a) => ({
      cx: r + unit * Math.cos(a),
      cy: r + unit * Math.sin(a),
    })),
    ...petalAngles.map((a) => ({
      cx: r + unit * 2 * Math.cos(a),
      cy: r + unit * 2 * Math.sin(a),
    })),
    ...outerAngles.map((a) => ({
      cx: r + unit * Math.sqrt(3) * Math.cos(a + Math.PI / 6),
      cy: r + unit * Math.sqrt(3) * Math.sin(a + Math.PI / 6),
    })),
  ];

  // Metatron's Cube lines (13 nodes connected)
  const nodes13 = [
    { cx: r, cy: r },
    ...petalAngles.map((a) => ({ cx: r + unit * 2 * Math.cos(a), cy: r + unit * 2 * Math.sin(a) })),
    ...petalAngles.map((a) => ({ cx: r + unit * 4 * Math.cos(a), cy: r + unit * 4 * Math.sin(a) })),
    { cx: r, cy: r - unit * 4 },
    { cx: r, cy: r + unit * 4 },
  ];

  const lines: [number, number, number, number][] = [];
  for (let i = 0; i < nodes13.length; i++) {
    for (let j = i + 1; j < nodes13.length; j++) {
      lines.push([nodes13[i].cx, nodes13[i].cy, nodes13[j].cx, nodes13[j].cy]);
    }
  }

  return (
    <div
      className={`pointer-events-none ${className}`}
      style={{ opacity }}
      aria-hidden="true"
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          animation: `sacred-rotate ${duration}s linear infinite`,
          transformOrigin: "center center",
        }}
      >
        <defs>
          <style>{`
            @keyframes sacred-rotate {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}</style>
        </defs>

        {/* Flower of Life circles */}
        {circles.map((c, i) => (
          <circle
            key={`fol-${i}`}
            cx={c.cx}
            cy={c.cy}
            r={unit}
            stroke={color}
            strokeWidth={0.8}
            strokeOpacity={0.7}
          />
        ))}

        {/* Metatron's Cube lines */}
        {lines.map(([x1, y1, x2, y2], i) => (
          <line
            key={`ml-${i}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={color}
            strokeWidth={0.5}
            strokeOpacity={0.4}
          />
        ))}

        {/* Outer containing circle */}
        <circle
          cx={r}
          cy={r}
          r={r - 4}
          stroke={color}
          strokeWidth={1}
          strokeOpacity={0.35}
        />
        <circle
          cx={r}
          cy={r}
          r={r * 0.75}
          stroke={color}
          strokeWidth={0.5}
          strokeOpacity={0.2}
        />
      </svg>
    </div>
  );
}

/**
 * Full-bleed background variant — fills entire parent with repeating geometry tiles
 */
export function SacredGeometryPattern({
  opacity = 0.04,
  color = "oklch(0.68 0.28 270)",
}: Pick<SacredGeometryBgProps, "opacity" | "color">) {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
      style={{ opacity }}
    >
      {/* Tiled SVG pattern via background-image */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Ccircle cx='100' cy='100' r='40' stroke='%23a78bfa' stroke-width='0.8' fill='none'/%3E%3Ccircle cx='100' cy='60' r='40' stroke='%23a78bfa' stroke-width='0.8' fill='none'/%3E%3Ccircle cx='100' cy='140' r='40' stroke='%23a78bfa' stroke-width='0.8' fill='none'/%3E%3Ccircle cx='134.6' cy='80' r='40' stroke='%23a78bfa' stroke-width='0.8' fill='none'/%3E%3Ccircle cx='65.4' cy='80' r='40' stroke='%23a78bfa' stroke-width='0.8' fill='none'/%3E%3Ccircle cx='134.6' cy='120' r='40' stroke='%23a78bfa' stroke-width='0.8' fill='none'/%3E%3Ccircle cx='65.4' cy='120' r='40' stroke='%23a78bfa' stroke-width='0.8' fill='none'/%3E%3C/svg%3E")`,
          backgroundSize: "200px 200px",
          backgroundRepeat: "repeat",
        }}
      />
    </div>
  );
}

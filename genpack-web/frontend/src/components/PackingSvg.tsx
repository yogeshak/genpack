import type { PlacedRect } from '../types/api';

interface PackingSvgProps {
  stockWidth: number;
  packingHeight: number;
  placements: PlacedRect[];
  /** Max size of the SVG container (scale to fit inside) */
  maxWidth?: number;
  maxHeight?: number;
  /** Animate rects appearing in placement order (ms delay between each) */
  animatePlacement?: boolean;
}

function hueForId(id: number): number {
  return (id * 137.5) % 360;
}

export function PackingSvg({
  stockWidth,
  packingHeight,
  placements,
  maxWidth = 400,
  maxHeight = 360,
  animatePlacement = true,
}: PackingSvgProps) {
  if (stockWidth <= 0 || packingHeight <= 0) return null;

  const scale = Math.min(
    maxWidth / stockWidth,
    maxHeight / packingHeight,
    20
  );
  const w = stockWidth * scale;
  const h = packingHeight * scale;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="block w-full"
      style={{ maxWidth: w, maxHeight: h }}
      aria-label="Packing layout"
    >
      <defs>
        <style>{`
          @keyframes pack-reveal {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          .pack-rect-animate {
            animation: pack-reveal 0.25s ease-out forwards;
          }
        `}</style>
      </defs>
      {/* Group with Y flip: logical y=0 (bottom) at visual bottom */}
      <g transform={`translate(0, ${h}) scale(1, -1)`}>
        <rect
          x={0}
          y={0}
          width={w}
          height={h}
          fill="#f1f5f9"
          stroke="#64748b"
          strokeWidth={2}
        />
        {placements.map((r, index) => {
          const x = r.x * scale;
          const y = r.y * scale;
          const rw = r.width * scale;
          const rh = r.height * scale;
          const hue = hueForId(r.id);
          const delayMs = animatePlacement ? index * 80 : 0;
          const sequence = r.sequence ?? index + 1;
          const tooltipLines = [
            `Length: ${r.width}`,
            `Width: ${r.height}`,
            `Rotated: ${r.rotated === true ? 'Yes' : 'No'}`,
            `Sequence: ${sequence}`,
          ];
          return (
            <g
              key={r.id}
              className={animatePlacement ? 'pack-rect-animate' : ''}
              style={
                animatePlacement
                  ? { animationDelay: `${delayMs}ms`, opacity: 0 }
                  : undefined
              }
            >
              <title>{tooltipLines.join('\n')}</title>
              <rect
                x={x}
                y={y}
                width={rw}
                height={rh}
                fill={`hsl(${hue}, 60%, 75%)`}
                stroke={`hsl(${hue}, 50%, 40%)`}
                strokeWidth={1}
              />
              {rw >= 16 && rh >= 12 && r.label && (
                <g transform={`translate(${x + rw / 2}, ${y + rh / 2}) scale(1, -1) translate(${-(x + rw / 2)}, ${-(y + rh / 2)})`}>
                  <text
                    x={x + rw / 2}
                    y={y + rh / 2}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="fill-slate-800 text-[10px] font-medium"
                  >
                    {r.label}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </g>
    </svg>
  );
}

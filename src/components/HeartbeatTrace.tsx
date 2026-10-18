// A thin heartbeat trace that draws once on load (see .heartbeat-trace in styles.css).
// The gaps between beats are deliberately uneven: time stretches and shrinks
// from one heartbeat to the next.

const BASELINE = 44;
const BEATS = [92, 268, 391, 594, 706, 884];

function beat(x: number) {
  const y = BASELINE;
  return [
    `L ${x - 40} ${y}`,
    `Q ${x - 31} ${y - 6} ${x - 22} ${y}`, // P wave
    `L ${x - 6} ${y}`,
    `L ${x - 3} ${y + 5}`, // Q
    `L ${x + 1} ${y - 38}`, // R
    `L ${x + 6} ${y + 10}`, // S
    `L ${x + 10} ${y}`,
    `L ${x + 24} ${y}`,
    `Q ${x + 38} ${y - 11} ${x + 52} ${y}`, // T wave
  ].join(" ");
}

const d = `M 0 ${BASELINE} ${BEATS.map(beat).join(" ")} L 1000 ${BASELINE}`;

export function HeartbeatTrace({ className }: { className?: string }) {
  return (
    <svg
      className={`heartbeat-trace ${className ?? ""}`}
      viewBox="0 0 1000 60"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d={d}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
